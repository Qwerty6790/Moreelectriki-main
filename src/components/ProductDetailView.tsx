import React, { useEffect, useState, useMemo } from 'react';
import { Heart, Copy } from 'lucide-react';
import Header from '@/components/Header';

// Интерфейс расширен, чтобы включать все поля из дизайна
interface ProductI {
  _id: string;
  article: string;
  name:string;
  price: number;
  imageAddress: string | string[];
  imageAddresses?: string[] | string;
  stock: number;
  source: string; // Производитель
  visible?: boolean;
  quantity?: number;

  // Размеры
  height?: number;
  width?: number; // Добавлено
  length?: number; // Добавлено
  diameter?: number;
  area?: number; // Площадь освещения

  // Электрика
  lampType?: string; // Вид ламп
  socketType?: string; // Цоколь
  lampPower?: number; // Мощность лампы, W
  totalPower?: number; // Общая мощность, W
  voltage?: number;

  // Внешний вид
  lightStyle?: string; // Стиль
  shadeMaterial?: string; // Материал плафона/абажура
  shadeColor?: string; // Цвет плафона/абажура
  frameMaterial?: string; // Материал арматуры
  frameColor?: string; // Цвет арматуры
  shadeDirection?: string; // Направление абажуров/плафонов
  shadesCount?: number; // Количество плафонов/абажуров
  shadeShape?: string; // Форма плафона

  // Доп. параметры
  collection?: string; // Коллекция
  room?: string; // Место в интерьере
  ipProtection?: number; // Степень защиты (IP)
  lampsIncluded?: boolean; // Лампы в комплекте
  position?: string; // Расположение
  country?: string; // Страна
  colorTemperature?: string; // Цветовая температура
}


const ProductDetailView: React.FC<{ product: ProductI }> = ({ product }) => {
  const [mainImage, setMainImage] = useState<string>('');
  const [mainImageError, setMainImageError] = useState(false);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [failedThumbnailIndices, setFailedThumbnailIndices] = useState<number[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!product) return;
    const allImages =
      typeof product.imageAddresses === 'string'
        ? [product.imageAddresses]
        : Array.isArray(product.imageAddresses)
        ? product.imageAddresses
        : typeof product.imageAddress === 'string'
        ? [product.imageAddress]
        : Array.isArray(product.imageAddress)
        ? product.imageAddress
        : [];
    if (allImages.length > 0) {
      setMainImage(allImages[0]);
      setMainImageError(false);
      if (allImages.length > 1) {
        const remaining = allImages.slice(1);
        for (let i = remaining.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
        }
        setThumbnails(remaining.slice(0, 5));
        setFailedThumbnailIndices([]);
      }
    }
  }, [product]);

  useEffect(() => {
    if (product) {
      const likedData = JSON.parse(localStorage.getItem('liked') || '{"products": []}');
      const exists = likedData.products.some((p: any) => p._id === product._id);
      setIsFavorite(exists);
    }
  }, [product]);

  const toggleFavorite = () => {
    if (!product) return;
    const likedData = JSON.parse(localStorage.getItem('liked') || '{"products": []}');
    if (isFavorite) {
      likedData.products = likedData.products.filter((p: any) => p._id !== product._id);
      localStorage.setItem('liked', JSON.stringify(likedData));
      setIsFavorite(false);
      const count = likedData.products.length;
      window.dispatchEvent(new CustomEvent('liked:updated', { detail: { count } }));
    } else {
      likedData.products.push(product);
      localStorage.setItem('liked', JSON.stringify(likedData));
      setIsFavorite(true);
      const count = likedData.products.length;
      window.dispatchEvent(new CustomEvent('liked:updated', { detail: { count } }));
      window.dispatchEvent(new CustomEvent('liked:itemAdded', { detail: { name: product.name, imageUrl: mainImage } }));
    }
  };

  const copyArticle = async () => {
    if (!product || !product.article) return;
    try {
      await navigator.clipboard.writeText(String(product.article));
    } catch (err) {
      console.error('Ошибка копирования артикула:', err);
    }
  };

  const addToCart = (p: ProductI) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
      const idx = cart.products.findIndex((item: any) => item.article === p.article);
      if (idx > -1) cart.products[idx].quantity += 1;
      else cart.products.push({ article: p.article, source: p.source, name: p.name, quantity: 1, price: p.price, imageUrl: mainImage });
      localStorage.setItem('cart', JSON.stringify(cart));
      const count = cart.products.length;
      localStorage.setItem('cartCount', String(count));
      window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count } }));
      window.dispatchEvent(new CustomEvent('cart:itemAdded', { detail: { name: p.name, price: p.price, imageUrl: mainImage } }));
    } catch (err) {
      console.error('Ошибка добавления в корзину со компонента', err);
    }
  };

  const parsedFromName = useMemo(() => {
    if (!product?.name) return {};
    
    const parse = (regex: RegExp) => {
      const match = product.name.match(regex);
      if (!match || !match[1]) return null;
      const cleanedString = match[1].replace(/[,.;]/g, '');
      return parseInt(cleanedString, 10);
    };

    return {
      height: parse(/[Hh](\d+)/),
      width: parse(/[Ww](\d+)/),
      diameter: parse(/[Dd](\d+)/),
      length: parse(/[Ll](\d+)/),
      ipProtection: parse(/[Ii][Pp]\s*(\d{2})/),
      lampPower: parse(/\b([\d,.]+)\s*W\b/i),
      voltage: parse(/\b([\d,.]+)\s*V\b/i),
    };
  }, [product?.name]);

  // --- ИЗМЕНЕНИЕ: Добавлена очистка символов ';' и ',' из полей ---
  const characteristicGroups = useMemo(() => {
    const p = product; 
    const pf = parsedFromName;

    const final = {
      height: p.height || pf.height,
      diameter: p.diameter || pf.diameter,
      width: p.width || pf.width,
      length: p.length || pf.length,
      area: p.area,
      lampPower: p.lampPower || pf.lampPower,
      totalPower: p.totalPower,
      voltage: p.voltage || pf.voltage,
      ipProtection: p.ipProtection || pf.ipProtection,
    };
    
    // Функция для очистки строковых значений
    const clean = (value: any) => {
      if (typeof value === 'string') {
        return value.replace(/[,;]/g, '');
      }
      return value;
    };

    return [
      {
        title: 'Электрика',
        items: [
          { label: 'Вид ламп', value: clean(p.lampType) },
          { label: 'Цоколь', value: clean(p.socketType) },
          { label: 'Мощность лампы, W', value: final.lampPower ? `${final.lampPower} W` : null },
          { label: 'Общая мощность, W', value: final.totalPower ? `${final.totalPower} W` : null },
          { label: 'Напряжение, V', value: final.voltage ? `${final.voltage} V` : null },
        ]
      },
      {
        title: 'Внешний вид',
        items: [
          { label: 'Материал плафона/абажура', value: clean(p.shadeMaterial) },
          { label: 'Цвет плафона/абажура', value: clean(p.shadeColor) },
          { label: 'Материал арматуры', value: clean(p.frameMaterial) },
          { label: 'Цвет арматуры', value: clean(p.frameColor) },
          { label: 'Стиль', value: clean(p.lightStyle) },
          { label: 'Направление абажуров/плафонов', value: clean(p.shadeDirection) },
          { label: 'Количество плафонов/абажуров', value: p.shadesCount },
          { label: 'Форма плафона', value: clean(p.shadeShape) },
        ]
      },
      {
        title: 'Размеры',
        items: [
          { label: 'Высота, мм', value: final.height ? `${final.height} мм` : null },
          { label: 'Диаметр, мм', value: final.diameter ? `${final.diameter} мм` : null },
          { label: 'Ширина, мм', value: final.width ? `${final.width} мм` : null },
          { label: 'Длина, мм', value: final.length ? `${final.length} мм` : null },
          { label: 'Площадь освещения, м²', value: final.area ? `${final.area} м²` : null },
        ]
      },
      {
        title: 'Дополнительные параметры',
        items: [
          { label: 'Производитель', value: clean(p.source) },
          { label: 'Коллекция', value: clean(p.collection) },
          { label: 'Место в интерьере', value: clean(p.room) },
          { label: 'Степень защиты (IP)', value: final.ipProtection ? `IP${final.ipProtection}` : null },
          { label: 'Лампы в комплекте', value: p.lampsIncluded ? 'Да' : 'Нет' },
          { label: 'Расположение', value: clean(p.position) },
          { label: 'Страна', value: clean(p.country) },
          { label: 'Цветовая температура', value: clean(p.colorTemperature) },
        ]
      }
    ];
  }, [product, parsedFromName]);


  const CharacteristicRow = ({ label, value }: { label: string, value: any }) => (
    <div className="flex justify-between items-baseline text-sm">
      <span className="text-gray-600 whitespace-nowrap">{label}</span>
      <span className="flex-grow mx-2 border-b border-dotted border-gray-300"></span>
      <span className="font-medium text-gray-900 text-right">{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-[1420px] mt-10 mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24">
        <div className="flex items-center justify-between py-4 md:py-6">
          <div />
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={copyArticle} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full">
              <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button onClick={toggleFavorite} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full">
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-x-12">
          {/* Левая колонка с информацией */}
          <div className="w-full lg:w-1/2">
            <div className="mb-4 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <p className="text-xs sm:text-sm text-gray-600">{product.article}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
              <div className="flex flex-col gap-y-10">
                {characteristicGroups.filter(g => ['Электрика', 'Размеры'].includes(g.title)).map(group => (
                    <div key={group.title}>
                        <h3 className="text-xl font-bold mb-4">{group.title}</h3>
                        <div className="space-y-3">
                            {group.items.filter(item => item.value != null && item.value !== '').map(item => (
                                <CharacteristicRow key={item.label} label={item.label} value={item.value} />
                            ))}
                        </div>
                    </div>
                ))}
              </div>
              <div className="flex flex-col gap-y-10 mt-10 md:mt-0">
                {characteristicGroups.filter(g => ['Внешний вид', 'Дополнительные параметры'].includes(g.title)).map(group => (
                    <div key={group.title}>
                        <h3 className="text-xl font-bold mb-4">{group.title}</h3>
                        <div className="space-y-3">
                            {group.items.filter(item => item.value != null && item.value !== '').map(item => (
                                <CharacteristicRow key={item.label} label={item.label} value={item.value} />
                            ))}
                        </div>
                    </div>
                ))}
                
              </div>
              <div className="mt-6 sm:mt-12">
              <div className="flex items-baseline justify-between mb-4 sm:mb-6">
                        <span className="text-2xl sm:text-3xl md:text-4xl font-bold">{new Intl.NumberFormat('ru-RU').format(product.price)} ₽</span>
                        {product.stock > 0 && <span className="text-xs sm:text-sm text-gray-600">В наличии: {product.stock}</span>}
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                          onClick={() => addToCart(product)} 
                          className="px-5 py-3 bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-40"
                          disabled={product.stock === 0}
                        >
                          В корзину
                        </button>
                    </div>
            </div>
          </div>
          </div>
          
          {/* Правая колонка с изображением и ценой */}
          <div className="w-full lg:w-1/2 mt-8 lg:mt-0">
            <div className='sticky top-24'>
                <div className="bg-[#f8f8f8] mb-6">
                    <div className=" relative">
                    {!mainImageError && mainImage && (
                        <img src={`${mainImage}?q=75&w=400`} alt="Product" className="w-full h-full object-contain p-6 sm:p-8 lg:p-12 mix-blend-multiply" onError={() => setMainImageError(true)} />
                    )}
                    {thumbnails.length > 0 && (
                        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
                        <div className="flex gap-1 sm:gap-2 overflow-x-auto py-2">
                            {thumbnails.map((img, idx) => {
                            if (failedThumbnailIndices.includes(idx)) return null;
                            return (
                                <button key={idx} onClick={() => { setMainImage(img); setMainImageError(false); }} className={`relative flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden ${mainImage === img ? 'ring-2 ring-black' : 'opacity-50'}`}>
                                <img src={`${img}?q=75&w=100`} alt="" className="w-full h-full object-cover" onError={() => setFailedThumbnailIndices((prev) => [...prev, idx])} />
                                </button>
                            );
                            })}
                        </div>
                        
                        </div>
                        
                    )}
                    </div>
              
     
                </div>

              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailView;