import React, { useState, useMemo, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductI } from '../types/interfaces';
// import { toast } from 'sonner';

interface CatalogOfProductProps {
  products: ProductI[];
  viewMode: 'grid' | 'list' | 'table';
  isLoading?: boolean;
  showActions?: boolean; // optional flag to hide action buttons (add to cart, qty)
}

// Кэш для нормализованных URL
const urlCache = new Map<string, string>();

// Предзагруженные изображения для LCP
const preloadedImages = new Set<string>();

// Функция нормализации URL с кэшированием
const normalizeUrl = (originalUrl: string, isLCPCandidate: boolean = false): string | null => {
  if (!originalUrl) return null;

  // Проверяем кэш
  if (urlCache.has(originalUrl)) {
    return urlCache.get(originalUrl)!;
  }

  let url = originalUrl;
  if (url.startsWith('http://')) {
    url = url.replace('http://', 'https://');
  }
  
  // Кэшируем результат
  urlCache.set(originalUrl, url);
  
  // Принудительная предзагрузка для LCP
  if (isLCPCandidate && !preloadedImages.has(url)) {
    // Создаем link preload
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    link.fetchPriority = 'high';
    document.head.appendChild(link);
    
    // Принудительная загрузка изображения
    const img = new Image();
    img.src = url;
    img.onload = () => {
      console.log('LCP image preloaded:', url);
    };
    
    preloadedImages.add(url);
  }

  return url;
};

// Ультра-оптимизированный компонент изображения
const OptimizedImage = React.memo(({ 
  src, 
  alt, 
  className, 
  priority = false,
  width = 300,
  height = 300
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Принудительная загрузка для LCP
  useEffect(() => {
    if (priority && src) {
      const img = new Image();
      img.onload = () => {
        setLoaded(true);
        console.log('Priority image loaded:', src);
      };
      img.onerror = () => setError(true);
      img.src = src;
      
      // Принудительная загрузка
      if (img.complete) {
        setLoaded(true);
      }
    }
  }, [src, priority]);

  // Ленивая загрузка для остальных
  useEffect(() => {
    if (!priority && src && !loaded && !error) {
      const img = new Image();
      img.onload = () => setLoaded(true);
      img.onerror = () => setError(true);
      img.src = src;
    }
  }, [src, priority, loaded, error]);

  if (error || !src) {
    return (
      <div className={`w-full h-full bg-gradient-to-br flex items-center justify-center product-image ${className}`}>
        <div className="text-center">
          <div className="text-[#ede7e7] font-bold text-lg sm:text-xl tracking-wider">
            MORELEKTRIKI
          </div>
          <div className="text-[#ede7e7] text-xs sm:text-sm mt-1">
            Нет фото
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full product-image ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-br animate-pulse flex items-center justify-center">
          <div className="text-center">
            <div className="text-[#ede7e7] font-bold text-lg sm:text-xl tracking-wider animate-pulse">
              MORELEKTRIKI
            </div>
            <div className="text-[#ede7e7] text-xs sm:text-sm mt-1 animate-pulse">
              Загрузка...
            </div>
          </div>
        </div>
      )}
      <img
        ref={imgRef}
      src={src}
      alt={alt}
      width={width}
      height={height}
        className={`w-full h-full object-contain transition-opacity duration-200 lcp-image ${loaded ? 'opacity-100' : 'opacity-0'}`}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
});

const CatalogOfProductSearch: React.FC<CatalogOfProductProps> = ({
  products,
  viewMode,
  isLoading = false,
  showActions = true,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [notifications, setNotifications] = useState<Array<{id: number, message: string, type: 'success' | 'error' | 'info'}>>([]);
  const [visibleProducts, setVisibleProducts] = useState<ProductI[]>([]);
  const [sortOption, setSortOption] = useState<'desc' | 'asc' | 'popularity' | 'newest'>('newest');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement | null>(null);

  // Быстрая инициализация клиента
  useLayoutEffect(() => { 
    setIsClient(true); 
  }, []);

  // Оптимизированная фильтрация с мемоизацией
  const filteredProducts = useMemo(() => {
    if (!products?.length) return [];
    return products.filter(product => product && product.name);
  }, [products]);

  // Устанавливаем видимые продукты и применяем сортировку
  useEffect(() => {
    const sorted = [...filteredProducts];

    const getQuantity = (p: ProductI) => (typeof p.quantity === 'number' ? p.quantity : 0);
    const getDate = (p: ProductI) => (p.createdAt ? new Date(p.createdAt).getTime() : 0);
    const getPrice = (p: ProductI) => (typeof p.price === 'string' ? parseFloat(p.price) : (p.price || 0));

    if (sortOption === 'newest') {
      sorted.sort((a, b) => getDate(b) - getDate(a));
    } else if (sortOption === 'popularity') {
      sorted.sort((a, b) => getQuantity(b) - getQuantity(a));
    } else if (sortOption === 'desc') {
      sorted.sort((a, b) => getPrice(b) - getPrice(a));
    } else if (sortOption === 'asc') {
      sorted.sort((a, b) => getPrice(a) - getPrice(b));
    }

    setVisibleProducts(sorted);
  }, [filteredProducts, sortOption]);

  // Стильные всплывающие уведомления в стиле сайта
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Автоматически убираем уведомление через 2.5 секунды
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 2500);
  }, []);

  // Добавление в корзину
  const addToCart = useCallback((product: ProductI, quantity: number = 1, isExpected: boolean = false) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
      
      const idx = cart.products.findIndex((item: any) => 
        item.productId === product._id || 
        (item.article === product.article && item.source === product.source)
      );
      
      if (idx > -1) {
        cart.products[idx].quantity += quantity;
        cart.products[idx].isExpected = isExpected;
      } else {
        cart.products.push({ 
          productId: product._id, 
          article: product.article, 
          source: product.source, 
          quantity,
          isExpected
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      
      const totalCount = cart.products.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
      localStorage.setItem('cartCount', totalCount.toString());
      
      // Inform header and other listeners about cart change
      window.dispatchEvent(new CustomEvent('cart:updated', { 
        detail: { count: totalCount, animate: true } 
      }));

      // Показываем мини-превью под шапкой
      let previewImage: string | null = null;
      if (typeof product.imageAddresses === 'string') previewImage = normalizeUrl(product.imageAddresses);
      else if (Array.isArray(product.imageAddresses) && product.imageAddresses.length > 0) previewImage = normalizeUrl(product.imageAddresses[0]);
      else if (typeof product.imageAddress === 'string') previewImage = normalizeUrl(product.imageAddress);
      else if (Array.isArray(product.imageAddress) && product.imageAddress.length > 0) previewImage = normalizeUrl(product.imageAddress[0]);
      // Dispatch event with item details so header can show a mini-popup
      window.dispatchEvent(new CustomEvent('cart:itemAdded', {
        detail: {
          productId: product._id,
          article: product.article,
          source: product.source,
          name: product.name,
          price: product.price,
          imageUrl: previewImage || undefined
        }
      }));
      // Removed manual toast/notification: header hover will show preview instead
    } catch (err) {
      console.error('Ошибка добавления в корзину:', err);
      showNotification('Ошибка добавления', 'error');
    }
  }, [showNotification]);

  // Ультра-оптимизированный компонент карточки товара
  const ProductCard = useCallback(({ product, index }: { product: ProductI, index: number }) => {
    const [quantity, setQuantity] = useState(1);
    const [showQtyControls, setShowQtyControls] = useState(false);
    const isLCP = index < 6; // Увеличиваем количество приоритетных изображений
    
    const imageSrc = useMemo(() => {
      let url = null;
      if (typeof product.imageAddresses === 'string') url = product.imageAddresses;
      else if (Array.isArray(product.imageAddresses) && product.imageAddresses.length > 0) url = product.imageAddresses[0];
      else if (typeof product.imageAddress === 'string') url = product.imageAddress;
      else if (Array.isArray(product.imageAddress) && product.imageAddress.length > 0) url = product.imageAddress[0];
      
      return url ? normalizeUrl(url, isLCP) : null;
    }, [product, isLCP]);

    const isPurchasable = Number(product.stock) > 0;

    const handleAddToCart = () => {
      // When user clicks "Купить" — add one and reveal quantity controls
      addToCart(product, 1, !isPurchasable);
      setQuantity((q) => q + 1);
      setShowQtyControls(true);
    };

    const addOne = () => {
      addToCart(product, 1, !isPurchasable);
      setQuantity((q) => q + 1);
    };

    const removeOne = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
        const idx = cart.products.findIndex((item: any) => 
          item.productId === product._id || 
          (item.article === product.article && item.source === product.source)
        );

        if (idx === -1) return;

        if (cart.products[idx].quantity > 1) {
          cart.products[idx].quantity -= 1;
          localStorage.setItem('cart', JSON.stringify(cart));
          const totalCount = cart.products.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
          localStorage.setItem('cartCount', totalCount.toString());
          window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: totalCount, animate: true } }));
          setQuantity((q) => Math.max(1, q - 1));
        } else {
          // remove item completely
          cart.products.splice(idx, 1);
          localStorage.setItem('cart', JSON.stringify(cart));
          const totalCount = cart.products.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
          localStorage.setItem('cartCount', totalCount.toString());
          window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: totalCount, animate: true } }));
          setQuantity(1);
          setShowQtyControls(false);
        }
      } catch (err) {
        console.error('Ошибка изменения количества:', err);
      }
    };

    const isSpecialBrand = ['donel', 'чтк'].includes((product.source || '').toLowerCase());

    return (
      <div className={`${isSpecialBrand ? 'bg-[#101010] text-white' : 'bg-white'} flex flex-col h-full overflow-hidden product-card rounded-lg border border-transparent`}>
        {/* Контент, кликабельная часть */}
        <Link href={`/products/${product.source}/${product.article}`} className="flex flex-col">
          <div className="relative aspect-square bg-gradient-to-br flex items-center justify-center overflow-hidden product-image">
            {product.isNew && (
              <div className="absolute top-3 left-3 z-10">
                <div className="bg-gradient-to-r from-gray-300 to-gray-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  Новинка
                </div>
              </div>
            )}

            {/* Индикатор наличия: зелёный круг = в наличии, оранжевый = ожидается */}
            <div className="absolute top-0 right-3 z-10">
              <span
                title={isPurchasable ? 'В наличии' : 'Ожидается'}
                aria-label={isPurchasable ? 'В наличии' : 'Ожидается'}
                className={`${isPurchasable ? 'bg-green-500' : 'bg-orange-500'} w-3 h-3 rounded-full inline-block border border-white/20`}
              />
            </div>

            {imageSrc ? (
              <OptimizedImage
                src={imageSrc}
                alt={product.name}
                priority={isLCP}
                width={300}
                height={300}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br flex items-center justify-center product-image">
                <div className="text-center">
                  <div className="text-[#ede7e7] font-bold text-lg sm:text-xl tracking-wider">
                  MORELEKTRIKI
                  </div>
                  <div className="text-[#ede7e7] text-xs sm:text-sm mt-1">
                    Нет фото
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 flex flex-col">
            <div className={`text-xs ${isSpecialBrand ? 'text-gray-300' : 'text-gray-400'} mb-2`}>Арт. {product.article}</div>
            <h3 className={`text-base font-light ${isSpecialBrand ? 'text-white' : 'text-black'} mb-2 line-clamp-2`}>{product.name}</h3>

            <div className="flex items-baseline gap-2 mb-3">
              <div className={`text-1xl font-extrabold ${isSpecialBrand ? 'text-white' : 'text-black'}`}>{product.price} руб</div>
            </div>
          </div>
        </Link>

        {/* Нижняя панель с кнопками (вне Link чтобы клики не навигировали) */}
        {showActions !== false && (
          <div className="px-4 pb-4 pt-0 mt-auto">
            <div className="flex items-center gap-3">
              {/* Показываем либо кнопку Купить, либо контролы количества после клика */}
              {!showQtyControls ? (
                <button
                  onClick={(e) => { e.preventDefault(); handleAddToCart(); }}
                  className={`flex-1 h-11 rounded-md text-sm font-medium uppercase tracking-wider transition-colors duration-200 ${
                    isPurchasable
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-gray-200/20 text-gray-400 border border-gray-300/30'
                  }`}
                >
                  {isPurchasable ? 'Купить' : 'Ожидается'}
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-white/5 rounded-full px-1 py-0.5 border border-white/10">
                  <button
                    onClick={(e) => { e.preventDefault(); removeOne(); }}
                    aria-label="decrease"
                    className="w-7 h-7 flex items-center justify-center text-xs font-semibold rounded-full bg-black text-white hover:opacity-90 transition-opacity"
                    style={{ boxShadow: 'inset 0 -2px 0 rgba(255,255,255,0.03)' }}
                  >
                    −
                  </button>

                  <div className={`min-w-[34px] flex items-center justify-center px-1 py-0.5 rounded text-xs font-medium ${isSpecialBrand ? 'text-black' : 'text-black'} bg-white/90`}>
                    {quantity}
                  </div>

                  <button
                    onClick={(e) => { e.preventDefault(); addOne(); }}
                    aria-label="increase"
                    className="w-7 h-7 flex items-center justify-center text-xs font-semibold rounded-full bg-white text-black hover:opacity-90 transition-opacity"
                    style={{ boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.06)' }}
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }, [addToCart]);

  // Оптимизированная таблица
  const TableView = useCallback(() => { 
    if (!visibleProducts.length) return null;

    return (
      <div className="w-full overflow-x-auto bg-[#101010] text-white">
        <table className="min-w-full text-white">
          <thead>
            <tr>
              <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Фото</th>
              <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Название</th>
              <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-white uppercase tracking-wider hidden sm:table-cell">Артикул</th>
              <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Цена</th>
              <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {visibleProducts.map((product, index) => {
                if (!product) return null;

                const imageSrc = useMemo(() => {
                  let url = null;
                  if (typeof product.imageAddresses === 'string') url = product.imageAddresses;
                  else if (Array.isArray(product.imageAddresses) && product.imageAddresses.length > 0) url = product.imageAddresses[0];
                  else if (typeof product.imageAddress === 'string') url = product.imageAddress;
                  else if (Array.isArray(product.imageAddress) && product.imageAddress.length > 0) url = product.imageAddress[0];
                  
                  return url ? normalizeUrl(url) : null;
                }, [product]);

                const isPurchasable = Number(product.stock) > 0;

                return (
                  <motion.tr 
                    key={product._id || product.article} 
                    className="border-b border-[#1a1a1a]"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                        delay: index * 0.05, // Меньшая задержка для таблицы
                        duration: 0.5
                      }
                    }}
                    exit={{ 
                      opacity: 0, 
                      y: -20,
                      transition: { duration: 0.2 }
                    }}
                    whileHover={{ 
                      backgroundColor: "rgba(255,255,255,0.02)",
                      transition: { duration: 0.2 }
                    }}
                  >
                    <td className="px-2 py-3">
                      <div className="w-16 h-16 relative overflow-hidden rounded  product-image">
                        {imageSrc ? (
                          <OptimizedImage
                            src={imageSrc}
                            alt={product.name}
                            width={64}
                            height={64}
                            className="w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-white text-black text-xs">
                            Нет фото
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/products/${product.source}/${product.article}`} className="text-white hover:text-gray-300">
                          {product.name}
                        </Link>
                        {product.isNew && (
                          <div className="bg-gradient-to-r from-gray-300 to-gray-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                            Новинка
                          </div>
                        )}
                        {/* Индикатор наличия в таблице */}
                        <span
                          title={isPurchasable ? 'В наличии' : 'Ожидается'}
                          aria-label={isPurchasable ? 'В наличии' : 'Ожидается'}
                          className={`${isPurchasable ? 'bg-green-500' : 'bg-orange-500'} w-3 h-3 rounded-full inline-block ml-1 border border-white/20`}
                        />
                      </div>
                    </td>
                    <td className="px-2 py-3 hidden sm:table-cell text-gray-400">{product.article}</td>
                    <td className="px-2 py-3 font-bold">{product.price} ₽</td>
                    <td className="px-2 py-3">
                      <button
                        onClick={() => addToCart(product, 1, !isPurchasable)}
                        className={`px-3 py-1 text-xs rounded transition-colors ${
                          isPurchasable 
                            ? 'bg-[#101010] text-white hover:bg-gray-700' 
                            : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/40 border border-orange-500/30'
                        }`}
                      >
                        {isPurchasable ? 'Купить' : 'Ожидается'}
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    );
  }, [visibleProducts, addToCart]);

  // Принудительная предзагрузка первых изображений для LCP
    useEffect(() => {
    if (isClient && visibleProducts.length > 0) {
      const firstProducts = visibleProducts.slice(0, 6);
      firstProducts.forEach((product, index) => {
        let url = null;
        if (typeof product.imageAddresses === 'string') url = product.imageAddresses;
        else if (Array.isArray(product.imageAddresses) && product.imageAddresses.length > 0) url = product.imageAddresses[0];
        else if (typeof product.imageAddress === 'string') url = product.imageAddress;
        else if (Array.isArray(product.imageAddress) && product.imageAddress.length > 0) url = product.imageAddress[0];
        
        if (url) {
          normalizeUrl(url, true);
        }
      });
    }
  }, [isClient, visibleProducts]);

  // Закрытие дропдауна при клике вне и на Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSortOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  if (isLoading || !isClient) {
    // show skeleton placeholders while loading or during hydration
    return (
      <div className="grid auto-rows-auto w-full grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
        {Array.from({ length:4 }).map((_, i) => (
          <div key={i} className="bg-white/60 border border-gray-200/30 flex flex-col h-full overflow-hidden product-card rounded-lg">
            <div className="relative aspect-square bg-gradient-to-br from-white/80 to-gray-100/80 flex items-center justify-center overflow-hidden product-image">
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
              <div className="relative z-10 text-center px-2">
                <div className="text-gray-500 font-bold text-base sm:text-lg tracking-wider animate-pulse">MORELEKTRIKI</div>
                <div className="text-gray-400 text-xs sm:text-sm mt-1 animate-pulse">Загрузка...</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Стильные уведомления в стиле сайта */}
      <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 100, scale: 0.3 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: [0.3, 1.1, 1],
              }}
              exit={{ 
                opacity: 0, 
                y: -100, 
                scale: 0.3,
                transition: { duration: 0.3 }
              }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 25,
                duration: 0.6 
              }}
              className="mb-4 last:mb-0"
            >
              <div className="bg-gradient-to-r from-[#a7a3a3]/95 via-[#7c7c7c]/95 to-[#a7a3a3]/95 backdrop-blur-lg border border-red-800/30 shadow-2xl rounded-xl px-6 py-4">
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      notification.type === 'success' 
                    ? 'bg-[#1f3d1f]/60 text-[#9FE29F]' 
                        : notification.type === 'error' 
                        ? 'bg-red-600/20 text-red-400' 
                        : 'bg-blue-600/20 text-blue-400'
                    }`}>
                      <span className="text-lg">
                        {notification.type === 'success' ? '✓' : notification.type === 'error' ? '✕' : 'ℹ'}
                      </span>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-medium text-sm">
                        {notification.message}
                      </div>
                      {notification.type === 'success' && (
                        <div className="text-gray-400 text-xs mt-1">
                          Операция выполнена успешно
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Основной контент */}
      <div className="mb-4 w-full bg-white/70 rounded-3xl flex items-center justify-end">
        <label className="text-sm text-black mr-3">Сортировка:</label>
        {/* Compact animated dropdown */}
        <div ref={sortRef} className="relative">
          <button
            onClick={() => setSortOpen((s) => !s)}
            className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1 border border-white/10 text-sm text-black"
            aria-expanded={sortOpen}
            aria-haspopup="listbox"
          >
            <span>
              {sortOption === 'newest' ? 'По новизне' : sortOption === 'popularity' ? 'По популярности' : sortOption === 'desc' ? 'Цена: убывание' : 'Цена: возрастание'}
            </span>
            <svg className={`w-4 h-4 transform transition-transform ${sortOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 8L10 13L15 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <AnimatePresence>
            {sortOpen && (
              <motion.ul
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                role="listbox"
                aria-label="Сортировка"
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-white/10 overflow-hidden z-40"
              >
                {[
                  { key: 'newest', label: 'По новизне' },
                  { key: 'popularity', label: 'По популярности' },
                  { key: 'desc', label: 'Цена: по убыванию' },
                  { key: 'asc', label: 'Цена: по возрастанию' }
                ].map((opt) => (
                  <li key={opt.key}
                    onClick={() => { setSortOption(opt.key as any); setSortOpen(false); }}
                    role="option"
                    aria-selected={sortOption === opt.key}
                    className={`px-4 py-3 cursor-pointer text-sm text-black/90 hover:bg-black/5 transition-colors ${sortOption === opt.key ? ' text-black' : ''}`}
                  >
                    {opt.label}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>
      {viewMode === 'table' ? (
        <TableView />
      ) : (
        <div className="grid w-full grid-cols-2 gap-4 xs:grid-cols-2 sm:gap-4 md:grid-cols-4 md:gap-6 lg:grid-cols-4 lg:gap-6 xl:grid-cols-4 xl:gap-9">
          <AnimatePresence>
            {visibleProducts.map((product, index) => (
              <motion.div
                key={`grid-${product._id || ''}-${product.article}`}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    delay: index * 0.1, // Задержка для каждого следующего товара
                    duration: 0.6
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  y: -30, 
                  scale: 0.9,
                  transition: { duration: 0.3 }
                }}
                whileHover={{ 
                  y: -5, 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className="transform-gpu"
              >
                <ProductCard
                  product={product}
                  index={index}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          
         
        </div>
      )}
    </>
  );
};

export default CatalogOfProductSearch;