'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Toaster, toast } from 'sonner';
import 'tailwindcss/tailwind.css';
import { Heart, ArrowLeft, Copy } from 'lucide-react';
import Header from '@/components/Header';

interface ProductI {
  _id: string;
  article: string;
  name: string;
  price: number;
  imageAddress: string | string[]; // Ссылка на изображение (строка или массив строк)
  stock: number; // Количество на складе
  source: string; // Источник данных
  visible?: boolean; // Видимость товара (для админки)
  quantity?: number; // Для корзины

  // Размеры
  height?: number; // Высота (мм)
  length?: number; // Длина (мм)
  width?: number;  // Ширина (мм)
  diameter?: number; // Диаметр (мм)
  
  // Характеристики светильника
  lightStyle?: string; // Стиль светильника (современный, классический, минимализм и т.д.)
  lampType?: string; // Вид лампы (LED, галогенная, накаливания и т.д.)
  color?: string; // Цвет
  socketType?: string; // Цоколь (E27, E14, GU10 и т.д.)
  lampsCount?: number; // Количество ламп
  lampPower?: number; // Мощность лампы (Вт)
  totalPower?: number; // Общая мощность (Вт)
  voltage?: number; // Напряжение (В)
  material?: string; // Материал (металл, пластик, стекло и т.д.)

  // Для обратной совместимости
  imageAddresses?: string[] | string;
}

const ProductDetail: React.FC = () => {
  const router = useRouter();
  const { supplier, article } = router.query;
  const [product, setProduct] = useState<ProductI | null>(null);
  const [loading, setLoading] = useState(true);
  // Основное изображение, отображаемое в большом блоке
  const [mainImage, setMainImage] = useState<string>('');
  // Флаг ошибки загрузки для основного изображения
  const [mainImageError, setMainImageError] = useState(false);
  // 5 случайных миниатюр (не включая первое изображение)
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  // Индексы миниатюр, у которых произошла ошибка загрузки
  const [failedThumbnailIndices, setFailedThumbnailIndices] = useState<number[]>([]);
  // Состояние для избранного
  const [isFavorite, setIsFavorite] = useState(false);

  // Загрузка данных о товаре
  useEffect(() => {
    const fetchProduct = async () => {
      if (!supplier || !article) return;
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/product/${supplier}?productArticle=${article}`
        );
        setProduct(response.data);
      } catch (error) {
        console.error(error);
        toast.error('Ошибка при загрузке товара');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [supplier, article]);

  // Обработка изображений: выбираем основное (первое) и 5 случайных из оставшихся
  useEffect(() => {
    if (product) {
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
        // Основное изображение — всегда первое
        setMainImage(allImages[0]);
        setMainImageError(false);
        if (allImages.length > 1) {
          // Из оставшихся выбираем 5 случайных
          const remaining = allImages.slice(1);
          // Перемешиваем массив (алгоритм Фишера-Йетса)
          for (let i = remaining.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
          }
          setThumbnails(remaining.slice(0, 5));
          setFailedThumbnailIndices([]);
        }
      }
    }
  }, [product]);

  // При загрузке товара проверяем, есть ли он в избранном
  useEffect(() => {
    if (product) {
      const likedData = JSON.parse(localStorage.getItem('liked') || '{"products": []}');
      const exists = likedData.products.some((p: ProductI) => p._id === product._id);
      setIsFavorite(exists);
    }
  }, [product]);

  // Функция для добавления/удаления товара в/из избранного
  const toggleFavorite = () => {
    if (!product) return;
    const likedData = JSON.parse(localStorage.getItem('liked') || '{"products": []}');
    if (isFavorite) {
      // Удаляем товар
      likedData.products = likedData.products.filter((p: ProductI) => p._id !== product._id);
      localStorage.setItem('liked', JSON.stringify(likedData));
      setIsFavorite(false);
      const count = likedData.products.length;
      window.dispatchEvent(new CustomEvent('liked:updated', { detail: { count } }));
      toast.success('Товар удалён из избранного');
    } else {
      // Добавляем товар
      likedData.products.push(product);
      localStorage.setItem('liked', JSON.stringify(likedData));
      setIsFavorite(true);
      const count = likedData.products.length;
      window.dispatchEvent(new CustomEvent('liked:updated', { detail: { count } }));
      window.dispatchEvent(new CustomEvent('liked:itemAdded', { detail: { name: product.name, imageUrl: mainImage } }));
      toast.success('Товар добавлен в избранное');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <p>Товар не найден</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-[1420px] mt-10 mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24">
        {/* Top Navigation */}
        <div className="flex items-center justify-between py-4 md:py-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-900 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-xs sm:text-sm">Напольные светильники (Торшер)</span>
          </button>
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full">
              <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={toggleFavorite}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full"
            >
              <Heart 
                className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} 
              />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row">
          {/* Right Side - Image (показываем первым на мобильных) */}
          <div className="w-full lg:w-7/12 lg:order-2 bg-[#f8f8f8] mb-6 lg:mb-0">
            <div className="aspect-square relative">
              {/* Основное изображение показывается только если загрузилось */}
              {!mainImageError && mainImage && (
                <img
                  src={`${mainImage}?q=75&w=400`}
                  alt="Product"
                  className="w-full h-full object-contain p-6 sm:p-8 lg:p-12 mix-blend-multiply"
                  onError={() => setMainImageError(true)}
                />
              )}
              
              {/* Thumbnails */}
              {thumbnails.length > 0 && (
                <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
                  <div className="flex gap-1 sm:gap-2 overflow-x-auto py-2">
                    {thumbnails.map((img, idx) => {
                      if (failedThumbnailIndices.includes(idx)) return null;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setMainImage(img);
                            setMainImageError(false);
                          }}
                          className={`relative flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden ${
                            mainImage === img ? 'ring-2 ring-black' : 'opacity-50'
                          }`}
                        >
                          <img 
                            src={`${img}?q=75&w=100`}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={() =>
                              setFailedThumbnailIndices((prev) => [...prev, idx])
                            }
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Left Side - Product Info */}
          <div className="w-full lg:w-5/12 lg:order-1 lg:pr-12">
            <div className="mb-4 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <p className="text-xs sm:text-sm text-gray-600">{product.article}</p>
              </div>
            </div>

            {/* Dimensions */}
            <div className="mb-6 sm:mb-12">
              <h3 className="text-sm font-semibold mb-3 text-gray-900">Размеры</h3>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {product.height && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Высота:</span>
                    <span className="font-medium">{product.height} мм</span>
                  </div>
                )}
                {product.length && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Длина:</span>
                    <span className="font-medium">{product.length} мм</span>
                  </div>
                )}
                {product.width && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Ширина:</span>
                    <span className="font-medium">{product.width} мм</span>
                  </div>
                )}
                {product.diameter && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Диаметр:</span>
                    <span className="font-medium">{product.diameter} мм</span>
                  </div>
                )}
              </div>
            </div>

            {/* Specifications */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Характеристики</h3>
              
              <div className="grid grid-cols-1 gap-3">
                {product.lightStyle && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Стиль</span>
                    <span className="text-sm font-medium text-gray-900">{product.lightStyle}</span>
                  </div>
                )}

                {product.lampType && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Тип лампы</span>
                    <span className="text-sm font-medium text-gray-900">{product.lampType}</span>
                  </div>
                )}

                {product.color && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Цвет</span>
                    <span className="text-sm font-medium text-gray-900">{product.color}</span>
                  </div>
                )}

                {product.socketType && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Цоколь</span>
                    <span className="text-sm font-medium text-gray-900">{product.socketType}</span>
                  </div>
                )}

                {product.lampsCount && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Количество ламп</span>
                    <span className="text-sm font-medium text-gray-900">{product.lampsCount} шт</span>
                  </div>
                )}

                {product.lampPower && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Мощность лампы</span>
                    <span className="text-sm font-medium text-gray-900">{product.lampPower} Вт</span>
                  </div>
                )}

                {product.totalPower && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Общая мощность</span>
                    <span className="text-sm font-medium text-gray-900">{product.totalPower} Вт</span>
                  </div>
                )}

                {product.voltage && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Напряжение</span>
                    <span className="text-sm font-medium text-gray-900">{product.voltage} В</span>
                  </div>
                )}

                {product.material && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Материал</span>
                    <span className="text-sm font-medium text-gray-900">{product.material}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Степень защиты</span>
                  <span className="text-sm font-medium text-gray-900">IP 20</span>
                </div>

                {product.source && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Производитель</span>
                    <span className="text-sm font-medium text-gray-900">{product.source}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price and Action */}
            <div className="mt-6 sm:mt-12">
              <div className="flex items-baseline justify-between mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold">
                  {new Intl.NumberFormat('ru-RU').format(product.price)} ₽
                </span>
                <span className="text-xs sm:text-sm text-gray-600">В наличии: {product.stock}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    try {
                      const cart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
                      const idx = cart.products.findIndex((item: any) => item.article === product.article);
                      if (idx > -1) cart.products[idx].quantity += 1;
                      else cart.products.push({ article: product.article, source: product.source, name: product.name, quantity: 1, price: product.price, imageUrl: mainImage || (Array.isArray(product.imageAddress) ? product.imageAddress[0] : (typeof product.imageAddress === 'string' ? product.imageAddress : undefined)) });
                      localStorage.setItem('cart', JSON.stringify(cart));
                      const count = cart.products.length;
                      localStorage.setItem('cartCount', String(count));
                      window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count } }));
                      window.dispatchEvent(new CustomEvent('cart:itemAdded', { detail: { name: product.name, price: product.price, imageUrl: mainImage } }));
                      toast.success('Товар добавлен в корзину');
                    } catch (err) {
                      console.error('Ошибка добавления в корзину со страницы товара', err);
                      toast.error('Ошибка');
                    }
                  }}
                  className="px-5 py-3 bg-black  text-white rounded-lg hover:bg-gray-900"
                >
                  В корзину
                </button>
                <a href="/cart" className="text-sm text-gray-700 underline">Перейти в корзину</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
};

export default ProductDetail;
