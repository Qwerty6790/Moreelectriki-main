'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { ProductI } from '@/types/interfaces';
import CatalogOfProductSearch from '@/components/Catalogofsearch';
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
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 mt-28">
        <nav className="flex items-center space-x-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">Главная</Link>
          <span>/</span>
          <Link href="/ElektroustnovohneIzdely" className="hover:text-white transition-colors">Электроустановочные изделия</Link>
          <span>/</span>
          <Link href="/ElektroustnovohneIzdely/Voltum" className="hover:text-white transition-colors">Voltum</Link>
          <span>/</span>
          <span className="text-white">Черный матовый</span>
        </nav>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-5xl font-bold text-white mb-5">Черный матовый</h2>
          {totalProducts > 0 ? (
            <p className="text-white">Найдено {totalProducts} {totalProducts === 1 ? 'товар' : totalProducts < 5 ? 'товара' : 'товаров'}</p>
          ) : !loading && (
            <p className="text-gray-400">Электроустановочные изделия Voltum цвета Черный матовый</p>
          )}
        </div>

        <div className="flex justify-end mb-6">
          <div className="flex gap-1 items-center rounded-lg  p-1">
            {['grid', 'list', 'table'].map(mode => (
              <button key={mode} onClick={() => setViewMode(mode as any)} className={`p-2 rounded transition-colors ${viewMode === mode ? 'bg-white text-black' : 'text-white hover:bg-white/10'}`}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d={mode === 'grid' ? "M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" : mode === 'list' ? "M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" : "M3 3h18a1 1 0 011 1v16a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1zm1 2v3h16V5H4zm0 5v3h7v-3H4zm9 0v3h7v-3h-7zm-9 5v3h7v-3H4zm9 0v3h7v-3h-7z"}/>
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          {loading ? (
            <div className="py-10 w-full">
              <div className="grid w-full grid-cols-2 gap-2 sm:gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4 lg:gap-3 xl:grid-cols-4 xl:gap-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="bg-black rounded-lg border border-[#633a3a] flex flex-col h-full">
                    <div className="relative aspect-square bg-[#633a3a]/20 animate-pulse rounded-t-lg min-h-[150px] sm:min-h-[180px]"></div>
                    <div className="p-4 flex flex-col flex-grow">
                      <div className="h-4 bg-[#633a3a]/30 rounded w-3/4 mb-2 animate-pulse"></div>
                      <div className="h-3 bg-[#633a3a]/20 rounded w-1/2 mb-3 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
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
          <div className="flex justify-center items-center gap-2 mt-8">
            {currentPage > 1 && (
              <button onClick={() => handlePageChange(currentPage - 1)} className="px-4 py-2 bg-[#1a1a1a] text-white rounded hover:bg-[#812626] border border-[#633a3a] transition-colors">← Назад</button>
            )}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button key={page} onClick={() => handlePageChange(page)} className={`px-3 py-2 rounded transition-colors ${page === currentPage ? 'bg-[#812626] text-white' : 'bg-[#1a1a1a] text-white hover:bg-[#812626] border border-[#633a3a]'}`}>
                  {page}
                </button>
              );
            })}
            {currentPage < totalPages && (
              <button onClick={() => handlePageChange(currentPage + 1)} className="px-4 py-2 bg-[#1a1a1a] text-white rounded hover:bg-[#812626] border border-[#633a3a] transition-colors">Вперед →</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 