import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'tailwindcss/tailwind.css';
import CatalogOfProductSearch from '@/components/Catalogofsearch';
import Header from '@/components/Header';
import Pagination from '@/components/PaginationComponents';
import { ClipLoader } from 'react-spinners';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

const SearchResults: React.FC = () => {
  const router = useRouter();
  const { qwery } = router.query;
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');

  useEffect(() => {
    if (!qwery) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/search`, {
          params: {
            name: qwery,
            page: currentPage,
            pageSize: 40,
            sortBy: 'popularity',
            sortOrder: 'desc',
          },
        });

        setProducts(response.data.products || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalProducts(response.data.totalProducts || 0);
      } catch (error) {
        console.error('Ошибка при поиске:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [qwery, currentPage]);

  // Функция для склонения слова "товар"
  const getTotalProductsText = (count: number): string => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return 'товаров';
    }
    
    if (lastDigit === 1) {
      return 'товар';
    }
    
    if (lastDigit >= 2 && lastDigit <= 4) {
      return 'товара';
    }
    
    return 'товаров';
  };

  // Используем вынесенный компонент пагинации
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    // Прокрутка к началу списка результатов
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow max-w-[1550px]   container mx-auto px-2 sm:px-4 lg:px-8 pt-4 sm:pt-6 pb-12 mt-20  overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Хлебные крошки */}
          <div className="hidden sm:flex items-center text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-gray-900 transition-colors">Главная</Link>
            <span className="text-gray-300 mx-2">•</span>
            <span className="text-gray-900 font-medium">Поиск: {qwery}</span>
          </div>
          
          {/* Заголовок */}
          <div className="flex flex-col  sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Результаты поиска: {qwery}
            </h1>
          </div>

          {/* Информация о количестве товаров и переключатель вида */}
          

          {/* Содержимое товаров */}
          <div className="bg-white  rounded-lg p-4 sm:p-5 shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" text="Ищем товары..." />
              </div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="mt-4 text-gray-500 text-lg">По запросу "{qwery}" ничего не найдено</p>
                <p className="text-gray-400 mt-2">Попробуйте изменить поисковый запрос</p>
                <Link 
                  href="/" 
                  className="mt-4 inline-block px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  Вернуться на главную
                </Link>
              </div>
            ) : (
              <>
                <CatalogOfProductSearch 
                  products={products} 
                  viewMode={viewMode}
                  isLoading={false}
                />
                
                {/* Пагинация */}
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SearchResults;
