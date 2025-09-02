'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import axios from 'axios';
import { ProductI } from '../../types/interfaces';
import { ClipLoader } from 'react-spinners';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaShareAlt } from 'react-icons/fa';

const Liked: React.FC = () => {
  const [likedProducts, setLikedProducts] = useState<ProductI[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchLikedProducts = async () => {
      setLoading(true);
      const liked = JSON.parse(localStorage.getItem('liked') || '{"products": []}');

      if (liked.products.length > 0) {
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/products/list`,
            { products: liked.products },
            { headers: { 'Content-Type': 'application/json' } }
          );

          // Преобразуем данные, чтобы убедиться, что цена является числом
          setLikedProducts(
            response.data.products.map((product: any) => ({
              ...product,
              price: parseFloat(product.price) || 0,
            }))
          );
        } catch (error) {
          setError('Произошла ошибка при загрузке продуктов из Избранного.');
          console.error(error);
        }
      } else {
        setError('Ваш список Избранного');
      }
      setLoading(false);
    };

    fetchLikedProducts();
  }, []);

  const handleRemoveProduct = (id: string) => {
    setLikedProducts((prevProducts) =>
      prevProducts.filter((product) => product._id !== id)
    );
    const updatedLiked = JSON.parse(localStorage.getItem('liked') || '{"products": []}');
    updatedLiked.products = updatedLiked.products.filter(
      (productId: string) => productId !== id
    );
    localStorage.setItem('liked', JSON.stringify(updatedLiked));
    toast.success('Товар удален из Избранного');
  };

  const handleClearLiked = () => {
    setLikedProducts([]);
    localStorage.setItem('liked', JSON.stringify({ products: [] }));
    setError('Ваш список Избранного пуст.');
    toast.success('Избранное очищено');
  };

  const handleProductClick = (article: string, source: string) => {
    const encodedArticle = article.replace(/\//g, '%2F');
    router.push(`/products/${source}/${encodedArticle}`);
  };

  const handleShareLiked = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Избранное товары',
          text: 'Посмотрите, какие товары у меня в избранном!',
          url: window.location.href,
        })
        .then(() => console.log('Share successful'))
        .catch((error) => console.error('Ошибка при шаринге', error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Ссылка скопирована');
    }
  };

  return (
    <motion.section
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Toaster position="top-center" richColors />

      {/* Hero секция */}
      <div className="relative mt-32 h-[300px] bg-black overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="space-y-4">
            <h1 className="text-7xl font-bold text-white tracking-tight">Избранное</h1>
            <div className="flex items-center text-black/60 text-sm">
              <Link href="/" className="hover:text-black transition-colors">
                Главная
              </Link>
              <span className="mx-2">/</span>
              <span className="text-black">Избранное</span>
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-10 pb-20">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 flex justify-center">
            <ClipLoader color="#000000" size={40} />
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="w-12 h-12 text-black/40"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <p className="text-2xl font-medium text-black mb-6">{error}</p>
              <Link
                href="/osveheny"
                className="inline-flex items-center px-6 py-3 border-2 border-black text-black rounded-xl hover:bg-black hover:text-white transition-colors text-lg font-medium"
              >
                Перейти в каталог
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            {/* Хедер с информацией и кнопкой поделиться */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
              <h1 className="text-2xl font-medium text-black">
                В Избранном {likedProducts.length} {likedProducts.length === 1 ? 'товар' : 'товара'}
              </h1>
              <button
                onClick={handleShareLiked}
                className="flex items-center gap-2 text-black hover:underline transition-colors"
              >
                <FaShareAlt />
                Поделиться избранным
              </button>
            </div>

            {/* Сетка товаров */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {likedProducts.map((product) => {
                // Логика выбора URL изображения (аналогична корзине)
                const images = (() => {
                  if (typeof product.imageAddresses === 'string') {
                    return [product.imageAddresses];
                  } else if (Array.isArray(product.imageAddresses)) {
                    return product.imageAddresses;
                  } else if (typeof product.imageAddress === 'string') {
                    return [product.imageAddress];
                  } else if (Array.isArray(product.imageAddress)) {
                    return product.imageAddress;
                  }
                  return [];
                })();
                const imageUrl = images.length > 0 ? images[0] : '/placeholder.jpg';

                return (
                  <motion.div
                    key={product._id}
                    className="group relative bg-white rounded-xl border border-gray-100 hover:border-black transition-all duration-300"
                    whileHover={{ y: -5 }}
                  >
                    <div
                      onClick={() => handleProductClick(product.article, product.source)}
                      className="cursor-pointer p-4"
                    >
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-50 mb-4">
                        <img
                          src={`${imageUrl}?q=75&w=400`}
                          alt={product.name}
                          className="w-full h-full object-contain p-4 transform group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-lg font-medium text-black line-clamp-2">
                          {product.name}
                        </h2>
                        <p className="text-sm text-black/60">Артикул: {product.article}</p>
                        <p className="text-xl font-bold text-black">
                          {typeof product.price === 'number' && !isNaN(product.price)
                            ? `${product.price.toLocaleString()} ₽`
                            : 'Цена не указана'}
                        </p>
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveProduct(product._id);
                        }}
                        className="w-full py-3 border-2 border-black bg-black text-white rounded-xl hover:bg-black hover:text-white transition-colors"
                      >
                        Удалить из избранного
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {likedProducts.length > 0 && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={handleClearLiked}
                  className="px-8 py-4 border-2 border-black text-black rounded-xl text-lg font-medium hover:bg-black hover:text-white transition-colors"
                >
                  Очистить избранное
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default Liked;
