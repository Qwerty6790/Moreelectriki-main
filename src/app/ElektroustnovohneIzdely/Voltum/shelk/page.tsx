'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { ProductI } from '@/types/interfaces';
import CatalogOfProductSearch from '@/components/Catalogofsearch';
import { NEXT_PUBLIC_API_URL } from '@/utils/constants';
import LoadingSpinner from '@/components/LoadingSpinner';
import Pagination from '@/components/PaginationComponents';

export default function VoltumShelkPage() {
  const [products, setProducts] = useState<ProductI[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [allFilteredProducts, setAllFilteredProducts] = useState<ProductI[]>([]);
  const itemsPerPage = 12; // Количество товаров на странице

  const fetchProducts = async (page: number = 1) => {
    try {
      setLoading(true);
      
      // Если товары уже загружены, показываем нужную страницу
      if (allFilteredProducts.length > 0) {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setProducts(allFilteredProducts.slice(startIndex, endIndex));
        setCurrentPage(page);
        setLoading(false);
        return;
      }
      
      // Стабильная многостраничная загрузка как в W55
      const apiUrl = NEXT_PUBLIC_API_URL;
      let allProducts: any[] = [];
      
      // Загружаем 5 страниц по 200 товаров для стабильности
      for (let pageNum = 1; pageNum <= 5; pageNum++) {
        try {
          const params = {
            source: 'Voltum',
            page: pageNum,
            limit: 200,
            inStock: 'true'
          };
          
          console.log(`[Voltum Шелк] Загружаем страницу ${pageNum}...`);
          const response = await axios.get(`${apiUrl}/api/products/Voltum`, { params });
          
          if (response.data && response.data.products && Array.isArray(response.data.products)) {
            const pageProducts = response.data.products;
            allProducts = [...allProducts, ...pageProducts];
            console.log(`[Voltum Шелк] Страница ${pageNum}: +${pageProducts.length} товаров (всего: ${allProducts.length})`);
            
            // Автоматическое определение последней страницы
            if (pageProducts.length < params.limit) {
              console.log(`[Voltum Шелк] Последняя страница: ${pageNum}`);
              break;
            }
          } else {
            console.log(`[Voltum Шелк] Страница ${pageNum}: нет данных`);
            break;
          }
          
          // Задержка между запросами для стабильности
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`[Voltum Шелк] Ошибка страницы ${pageNum}:`, error);
          break;
        }
      }
      
      // Удаляем дубликаты по артикулу
      const uniqueProducts = allProducts.filter((product, index, self) => 
        index === self.findIndex(p => p.article === product.article)
      );
      
      console.log('Всего загружено товаров:', allProducts.length);
      console.log('Уникальных товаров:', uniqueProducts.length);

      if (uniqueProducts.length > 0) {
        // Фильтрация товаров цвета "Шелк" как в каталоге
        const filteredProducts = uniqueProducts.filter((product: any) => {
          const category = product.category || '';
          const name = product.name || '';
          
          // Ищем товары с цветом "шелк" как в каталоге: category=(шелк)
          const isShelk = category.toLowerCase().includes('шелк') || 
                         name.toLowerCase().includes('шелк');
          
          console.log(`[Voltum Шелк] "${name}" | Категория: "${category}" | Шелк: ${isShelk}`);
          
          return isShelk;
        });
        
        // Показываем отфильтрованные товары с пагинацией
        setAllFilteredProducts(filteredProducts);
        setTotalProducts(filteredProducts.length);
        setTotalPages(Math.ceil(filteredProducts.length / itemsPerPage));
        
        // Показываем товары для текущей страницы
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setProducts(filteredProducts.slice(startIndex, endIndex));
        
        console.log('Товары Voltum Шелк:', filteredProducts.length);
        console.log('ВСЕ найденные товары:', filteredProducts.map((p: any) => ({
          name: p.name,
          article: p.article,
          category: p.category
        })));
      }
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (allFilteredProducts.length === 0) {
      fetchProducts(1);
    }
  }, []);

  const handlePageChange = (page: number) => {
    fetchProducts(page);
  };

  // Обновляем товары при изменении currentPage
  useEffect(() => {
    if (allFilteredProducts.length > 0) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setProducts(allFilteredProducts.slice(startIndex, endIndex));
    }
  }, [currentPage, allFilteredProducts, itemsPerPage]);

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', color: 'var(--foreground)' }}>
     

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-44">
        <div className="mb-8">
          <h2 className="text-5xl font-bold text-black mb-5">Шелк</h2>
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <nav className="flex items-center space-x-2 text-2xl text-black">
          <Link href="/" className="hover:text-white transition-colors">Главная</Link>
          <span className='mb-3'>.</span>
          <Link href="/ElektroustnovohneIzdely" className="hover:text-white transition-colors">Электроустановочные изделия</Link>
          <span className='mb-3'>.</span>
          <Link href="/ElektroustnovohneIzdely/Voltum" className="hover:text-white transition-colors">Voltum</Link>
          <span className='mb-3'>.</span>
          <span className="text-white">Шелк</span>
        </nav>
      </div>
          {totalProducts > 0 ? (
            <p className="text-white">Найдено {totalProducts} {totalProducts === 1 ? 'товар' : totalProducts < 5 ? 'товара' : 'товаров'}</p>
          ) : !loading && (
            <p className="text-gray-400">Электроустановочные изделия Voltum цвета Шелк</p>
          )}
        </div>

       

        <div className="mb-8">
          {loading ? (
            <div className="py-10 w-full flex justify-center">
              <LoadingSpinner size="lg" text="Загружаем товары..." />
            </div>
          ) : products.length > 0 ? (
            <CatalogOfProductSearch products={products} viewMode={viewMode} isLoading={loading} />
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 text-lg mb-4">Товары не найдены</div>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </div>
    </div>
  );
} 