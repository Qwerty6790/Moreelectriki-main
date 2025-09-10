'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { ProductI } from '@/types/interfaces';
import CatalogOfProductSearch from '@/components/Catalogofsearch';
import LoadingSpinner from '@/components/LoadingSpinner';
import Pagination from '@/components/PaginationComponents';
import { NEXT_PUBLIC_API_URL } from '@/utils/constants';

export default function VoltumBlackMattePage() {
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
      
             if (allFilteredProducts.length > 0) {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setProducts(allFilteredProducts.slice(startIndex, endIndex));
        setCurrentPage(page);
        setLoading(false);
        return;
      }
      
      const apiUrl = NEXT_PUBLIC_API_URL;
      let allProducts: any[] = [];
      
      for (let pageNum = 1; pageNum <= 5; pageNum++) {
        try {
          const params = {
            source: 'Voltum',
            page: pageNum,
            limit: 200,
            inStock: 'true'
          };
          
          console.log(`[Voltum Черный матовый] Загружаем страницу ${pageNum}...`);
          const response = await axios.get(`${apiUrl}/api/products/Voltum`, { params });
          
          if (response.data && response.data.products && Array.isArray(response.data.products)) {
            const pageProducts = response.data.products;
            allProducts = [...allProducts, ...pageProducts];
            console.log(`[Voltum Черный матовый] Страница ${pageNum}: +${pageProducts.length} товаров (всего: ${allProducts.length})`);
            
            if (pageProducts.length < params.limit) {
              console.log(`[Voltum Черный матовый] Последняя страница: ${pageNum}`);
              break;
            }
          } else {
            console.log(`[Voltum Черный матовый] Страница ${pageNum}: нет данных`);
            break;
          }
          
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`[Voltum Черный матовый] Ошибка страницы ${pageNum}:`, error);
          break;
        }
      }
      
      const uniqueProducts = allProducts.filter((product, index, self) => 
        index === self.findIndex(p => p.article === product.article)
      );

      if (uniqueProducts.length > 0) {
        const filteredProducts = uniqueProducts.filter((product: any) => {
          const category = product.category || '';
          const name = product.name || '';
          
          const isBlackMatte = (category.toLowerCase().includes('черный матовый') || 
                               name.toLowerCase().includes('черный матовый')) &&
                              !category.toLowerCase().includes('хром'); // Исключаем vintage серию
          
          console.log(`[Voltum Черный матовый] "${name}" | Категория: "${category}" | Черный матовый: ${isBlackMatte}`);
          
          return isBlackMatte;
        });
        
                 setAllFilteredProducts(filteredProducts);
         setTotalProducts(filteredProducts.length);
         setTotalPages(Math.ceil(filteredProducts.length / itemsPerPage));
         
         // Показываем товары для текущей страницы
         const startIndex = (currentPage - 1) * itemsPerPage;
         const endIndex = startIndex + itemsPerPage;
         setProducts(filteredProducts.slice(startIndex, endIndex));
        
        console.log('Товары Voltum Черный матовый:', filteredProducts.length);
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
        <h2 className="text-5xl font-bold text-black mb-5">Черный матовый</h2>
        <div className="mb-8">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <nav className="flex items-center space-x-2 text-2xl text-black">
          <Link href="/" className="hover:text-white transition-colors">Главная</Link>
          <span className='mb-3'>.</span>
          <Link href="/ElektroustnovohneIzdely" className="hover:text-white transition-colors">Электроустановочные изделия</Link>
          <span className='mb-3'>.</span>
          <Link href="/ElektroustnovohneIzdely/Voltum" className="hover:text-white transition-colors">Voltum</Link>
          <span className='mb-3'>.</span>
          <span className="text-white">Черный матовый</span>
        </nav>
      </div>
          {totalProducts > 0 ? (
            <p className="text-white">Найдено {totalProducts} {totalProducts === 1 ? 'товар' : totalProducts < 5 ? 'товара' : 'товаров'}</p>
          ) : !loading && (
            <p className="text-gray-400">Электроустановочные изделия Voltum цвета Черный матовый</p>
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