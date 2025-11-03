'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { ProductI } from '../../types/interfaces';
import { ClipLoader } from 'react-spinners';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Heart, Share2 } from 'lucide-react';
import Head from 'next/head';
import LoadingSpinner from '@/components/LoadingSpinner';

const Liked: React.FC = () => {
  const [likedProducts, setLikedProducts] = useState<ProductI[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isClient, setIsClient] = useState<boolean>(false);
  const router = useRouter();

  // --- СИСТЕМА УВЕДОМЛЕНИЙ (Точно как в Cart) ---
  const [notifications, setNotifications] = useState<Array<{id: number, message: string, type: 'success' | 'error' | 'info'}>>([]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 2500); // Уведомление исчезает через 2.5 секунды
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
  if (!isClient) {
    return (
      <section className="min-h-screen bg-white">
        <div className="flex justify-center items-center h-screen">
           <LoadingSpinner />
        </div>
      </section>
    );
  }

  return (
    <motion.section
      className="min-h-screen bg-white text-gray-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Head>
        <title>Избранное - Ваши любимые товары | Moreelektriki</title>
        <meta name="description" content="Просматривайте и управляйте списком избранных товаров. Сохраняйте светильники, люстры и другую электрику, чтобы не потерять." />
        <meta name="robots" content="noindex, follow" />
      </Head>

      {/* --- КОНТЕЙНЕР ДЛЯ УВЕДОМЛЕНИЙ (Точно как в Cart) --- */}
      <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none w-full max-w-sm px-4">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.5 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="mb-4"
            >
              <div className="bg-white/80 backdrop-blur-lg border border-gray-200 shadow-xl rounded-lg p-4 flex items-center space-x-3">
                 <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${
                      n.type === 'success' ? 'bg-green-500' : n.type === 'error' ? 'bg-gray-800' : 'bg-blue-500'
                    }`}>
                   {n.type === 'success' ? '✓' : n.type === 'error' ? '✕' : 'ℹ'}
                 </div>
                 <span className="font-medium text-gray-800">{n.message}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Шапка страницы */}
      <div className="relative bg-white pt-48 px-4">
        <div className="container max-w-[88rem] mx-auto relative z-10">
          <div className="flex items-center justify-start mb-4">
            <h1 className="text-6xl font-bold text-gray-900">Избранное</h1>
          </div>
        </div>
      </div>

      <div className="container max-w-[88rem] mx-auto px-4 pb-20">
        {/* Информационная панель */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md text-sm border border-gray-200">
              {likedProducts.length} {likedProducts.length === 1 ? 'товар' : likedProducts.length >= 2 && likedProducts.length <= 4 ? 'товара' : 'товаров'}
            </span>
          </div>
          {likedProducts.length > 0 && (
            <div className="flex gap-4">
              <button onClick={handleShareLiked} className="px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2">
                <Share2 size={16} /> <span className="hidden sm:inline">Поделиться</span>
              </button>
              <button onClick={handleClearLiked} className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2">
                <Trash2 size={16} /> <span className="hidden sm:inline">Очистить</span>
              </button>
            </div>
          )}
        </div>

        {/* Содержимое */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center items-center py-20">
                      <LoadingSpinner />
            </motion.div>
          ) : error || likedProducts.length === 0 ? (
            <motion.div key="error" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-gray-50 rounded-xl p-12 text-center border border-gray-200">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Список избранного пуст</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">{error || 'Добавляйте товары, нажимая на ♡'}</p>
              <Link href="/osveheny" className="inline-flex items-center px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-black transition-colors">
                Перейти в каталог
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
                      className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
                    >
                      <Link href={`/products/${product.source}/${product.article}`} className="block">
                        <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
                          <img
                            src={`${imageUrl}?q=75&w=400`}
                            alt={product.name}
                            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                      </Link>
                      <div className="p-4 flex flex-col flex-grow">
                        <div className="flex-grow">
                          <Link href={`/products/${product.source}/${product.article}`} className="block">
                            <h3 className="text-gray-800 font-semibold mb-2 hover:text-gray-900 transition-colors line-clamp-2">
                              {product.name || 'Без названия'}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-500 mb-4">Артикул: {product.article}</p>
                        </div>
                        <div className="flex justify-between items-center mt-auto">
                          <div className="text-xl font-bold text-gray-900">
                            {product.price ? `${product.price.toLocaleString('ru-RU')} ₽` : 'По запросу'}
                          </div>
                          <button
                            onClick={() => handleRemoveProduct(product._id)}
                            className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-800 hover:text-white transition-colors"
                            aria-label="Удалить из избранного"
                          >
                            <Trash2 size={18} />
                          </button>
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
    </motion.section>
  );
};

export default Liked;