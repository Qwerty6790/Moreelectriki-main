
'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { ProductI } from '../../types/interfaces';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Heart, Share2, X } from 'lucide-react';
import Head from 'next/head';
import LoadingSpinner from '@/components/LoadingSpinner';

const Liked: React.FC = () => {
  const [likedProducts, setLikedProducts] = useState<ProductI[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isClient, setIsClient] = useState<boolean>(false);
  const router = useRouter();

  // --- СИСТЕМА УВЕДОМЛЕНИЙ ---
  const [notifications, setNotifications] = useState<Array<{id: number, message: string, type: 'success' | 'error' | 'info'}>>([]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 2500); 
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const fetchLikedProducts = async () => {
      setIsLoading(true);
      try {
        const liked = JSON.parse(localStorage.getItem('liked') || '{"products": []}');

        if (liked.products && liked.products.length > 0) {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/products/list`,
            { products: liked.products },
            { headers: { 'Content-Type': 'application/json' } }
          );
          setLikedProducts(response.data.products);
        } else {
          setError('В избранном пока ничего нет.');
        }
      } catch (err) {
        console.error('Ошибка при загрузке избранных товаров:', err);
        setError('Не удалось загрузить избранные товары. Пожалуйста, попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikedProducts();
  }, [isClient]);

  const handleRemoveProduct = (id: string) => {
    setLikedProducts((prevProducts) =>
      prevProducts.filter((product) => product._id !== id)
    );
    const likedData = JSON.parse(localStorage.getItem('liked') || '{"products": []}');
    const updatedProducts = likedData.products.filter(
      (productId: string) => productId !== id
    );
    localStorage.setItem('liked', JSON.stringify({ products: updatedProducts }));
    
    showNotification('Товар удален из избранного', 'success');

    if (updatedProducts.length === 0) {
      setError('В избранном пока ничего нет.');
    }
  };

  const handleClearLiked = () => {
    setLikedProducts([]);
    localStorage.setItem('liked', JSON.stringify({ products: [] }));
    setError('В избранном пока ничего нет.');
    showNotification('Избранное очищено', 'success');
  };

  const handleShareLiked = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          showNotification('Ссылка на избранное скопирована!', 'success');
        })
        .catch(err => {
          console.error('Ошибка копирования ссылки:', err);
          showNotification('Не удалось скопировать ссылку', 'error');
        });
    }
  };

  // Отображение загрузчика на стороне клиента до гидратации
  if (!isClient || isLoading) {
    return (
      <section className="min-h-screen bg-[#fcfcfc]">
        <div className="flex justify-center items-center h-screen">
           <LoadingSpinner />
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#fcfcfc] text-black py-12 sm:py-16 md:py-24 font-sans">
      <Head>
        <title>Избранное - Ваши любимые товары | Moreelektriki</title>
        <meta name="description" content="Просматривайте и управляйте списком избранных товаров. Сохраняйте светильники, люстры и другую электрику, чтобы не потерять." />
        <meta name="robots" content="noindex, follow" />
      </Head>

      {/* Уведомления */}
      <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none w-full max-w-sm px-4">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4"
            >
              <div className="bg-black text-white px-5 py-4 flex items-center space-x-3 text-sm font-bold tracking-wide uppercase">
                 <div className="w-5 h-5 border border-white flex items-center justify-center text-xs">
                   {n.type === 'success' ? '✓' : n.type === 'error' ? '✕' : 'ℹ'}
                 </div>
                 <span>{n.message}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        
        {/* Главный заголовок */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-bold uppercase tracking-tight leading-none break-words">
            ИЗБРАННОЕ
          </h1>
        </div>

        {/* Информационная панель */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 pb-4 border-b border-gray-200 gap-4">
          <div className="text-sm font-bold uppercase tracking-wider text-black">
            {likedProducts.length} {likedProducts.length === 1 ? 'ТОВАР' : likedProducts.length >= 2 && likedProducts.length <= 4 ? 'ТОВАРА' : 'ТОВАРОВ'}
          </div>
          {likedProducts.length > 0 && (
            <div className="flex gap-6 text-sm font-bold uppercase tracking-wider">
              <button onClick={handleShareLiked} className="hover:text-gray-500 transition-colors flex items-center gap-2">
                <Share2 size={16} /> <span>ПОДЕЛИТЬСЯ</span>
              </button>
              <button onClick={handleClearLiked} className="hover:text-red-600 transition-colors flex items-center gap-2">
                <Trash2 size={16} /> <span>ОЧИСТИТЬ</span>
              </button>
            </div>
          )}
        </div>

        {/* Содержимое */}
        <AnimatePresence mode="wait">
          {error || likedProducts.length === 0 ? (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-20 text-center">
              <Heart className="w-16 h-16 text-gray-200 mx-auto mb-8 stroke-1" />
              <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wide mb-4 text-black">СПИСОК ПУСТ</h2>
              <p className="text-lg text-gray-500 max-w-md mx-auto">{error || 'Сохраняйте понравившиеся товары, нажимая на ♡'}</p>
              <Link href="/catalog" className="inline-block mt-8 bg-black text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">
                ПЕРЕЙТИ В КАТАЛОГ
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
              <AnimatePresence>
                {likedProducts.map((product) => {
                  const images = (() => {
                    if (typeof product.imageAddresses === 'string') return [product.imageAddresses];
                    if (Array.isArray(product.imageAddresses)) return product.imageAddresses;
                    if (typeof product.imageAddress === 'string') return [product.imageAddress];
                    if (Array.isArray(product.imageAddress)) return product.imageAddress;
                    return [];
                  })();
                  const imageUrl = images.length > 0 ? images[0] : '/placeholder.jpg';

                  return (
                    <motion.div
                      layout
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                      className="group relative flex flex-col"
                    >
                      {/* Блок изображения */}
                      <div className="relative aspect-square w-full bg-gray-100 mb-6 overflow-hidden">
                        <Link href={`/products/${product.source}/${product.article}`} className="block h-full">
                          <img
                            src={`${imageUrl}?q=75&w=400`}
                            alt={product.name}
                            className="w-full h-full object-contain p-6 mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
                            loading="lazy"
                          />
                        </Link>
                        {/* Кнопка удаления */}
                        <button
                          onClick={() => handleRemoveProduct(product._id)}
                          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors z-10 p-2 -mr-2 -mt-2"
                          aria-label="Удалить из избранного"
                        >
                          <X size={24} strokeWidth={1.5} />
                        </button>
                      </div>

                      {/* Текстовая информация */}
                      <div className="flex flex-col flex-grow">
                        <div className="flex-grow">
                          <Link href={`/products/${product.source}/${product.article}`} className="block">
                            <h3 className="text-lg font-medium leading-tight text-black hover:text-gray-500 transition-colors mb-2 line-clamp-2">
                              {product.name || 'БЕЗ НАЗВАНИЯ'}
                            </h3>
                          </Link>
                          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                            АРТ: {product.article}
                          </p>
                        </div>
                        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-200">
                          <div className="text-xl font-bold text-black tracking-tight">
                            {product.price ? `${product.price.toLocaleString('ru-RU')} ₽` : 'ПО ЗАПРОСУ'}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Liked;