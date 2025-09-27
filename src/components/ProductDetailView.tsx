import React, { useEffect, useState } from 'react';
import { Heart, Copy } from 'lucide-react';
import Header from '@/components/Header';

interface ProductI {
  _id: string;
  article: string;
  name: string;
  price: number;
  imageAddress: string | string[];
  imageAddresses?: string[] | string;
  stock: number;
  source: string;
  visible?: boolean;
  quantity?: number;
  height?: number;
  length?: number;
  width?: number;
  diameter?: number;
  depth?: number; // sometimes used in product data
  lightStyle?: string;
  lampType?: string;
  color?: string;
  socketType?: string;
  lampsCount?: number;
  lampCount?: number; // alternate field seen in templates
  lampPower?: number;
  totalPower?: number;
  voltage?: number;
  shadeColor?: string;
  frameColor?: string;
  material?: string;
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
      // intentionally no toast for article copy
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

        <div className="flex flex-col lg:flex-row">
          <div className="w-full lg:w-7/12 lg:order-2 bg-[#f8f8f8] mb-6 lg:mb-0">
            <div className="aspect-square relative">
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

          <div className="w-full lg:w-5/12 lg:order-1 lg:pr-12">
            <div className="mb-4 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <p className="text-xs sm:text-sm text-gray-600">{product.article}</p>
              </div>
            </div>

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

                {(product.lampCount ?? product.lampsCount) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Количество ламп</span>
                    <span className="text-sm font-medium text-gray-900">{product.lampCount ?? product.lampsCount} шт</span>
                  </div>
                )}

                {product.socketType && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Цоколь</span>
                    <span className="text-sm font-medium text-gray-900">{product.socketType}</span>
                  </div>
                )}

                {product.shadeColor && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Цвет плафона</span>
                    <span className="text-sm font-medium text-gray-900">{product.shadeColor}</span>
                  </div>
                )}

                {product.frameColor && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Цвет арматуры</span>
                    <span className="text-sm font-medium text-gray-900">{product.frameColor}</span>
                  </div>
                )}

                {/* Размеры: показываем только присутствующие */}
                {(product.diameter || product.height || product.width || product.length || product.depth) && (
                  <div className="py-2 border-b border-gray-100">
                    <div className="text-sm text-gray-600 mb-2">Размеры (мм)</div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-900">
                      {product.diameter ? <div>Диаметр: <span className="font-medium">{product.diameter}</span></div> : null}
                      {product.height ? <div>Высота: <span className="font-medium">{product.height}</span></div> : null}
                      {product.width ? <div>Ширина: <span className="font-medium">{product.width}</span></div> : null}
                      {product.length ? <div>Длина: <span className="font-medium">{product.length}</span></div> : null}
                      {product.depth ? <div>Глубина: <span className="font-medium">{product.depth}</span></div> : null}
                    </div>
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

            <div className="mt-6 sm:mt-12">
              <div className="flex items-baseline justify-between mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold">{new Intl.NumberFormat('ru-RU').format(product.price)} ₽</span>
                <span className="text-xs sm:text-sm text-gray-600">В наличии: {product.stock}</span>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => addToCart(product)} className="px-5 py-3 bg-black text-white rounded-lg hover:bg-gray-900">В корзину</button>
                <a href="/cart" className="text-sm text-gray-700 underline">Перейти в корзину</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailView;