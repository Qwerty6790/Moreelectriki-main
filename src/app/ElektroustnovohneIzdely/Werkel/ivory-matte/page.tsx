'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { ProductI } from '@/types/interfaces';
import CatalogOfProductSearch from '@/components/catalogofsearch';
import { NEXT_PUBLIC_API_URL } from '@/utils/constants';

export default function IvoryMattePage() {
  const [products, setProducts] = useState<ProductI[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [allFilteredProducts, setAllFilteredProducts] = useState<ProductI[]>([]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const params = {
        source: 'Werkel',
        page: 1,
        limit: 1000
      };

      const apiUrl = NEXT_PUBLIC_API_URL;
      const { data } = await axios.get(`${apiUrl}/api/products/Werkel`, { params });

      if (data && data.products) {
        const targetProductNames = [
          'Выключатель',
          'Розетка',
          'Встраиваемая',
          'Терморегулятор',
          'ТВ-розетка',
          'Термостат',
          'Диммер',
          'Переключатель',
          'Акустическая розетка',
          'Кнопка',
          'Датчик движения',
          'Телефонная розетка',
          'Заглушка',
          'Кабельный выход',
        ];

        const filteredProducts = data.products.filter((product: any) => {
          const article = product.article || '';
          const name = (product.name || '').toLowerCase();
          
          // Проверяем артикул заканчивается на '62'
          if (!article.endsWith('62')) return false;
          
          // Исключаем нежелательные категории
          const excludeTerms = ['vintage', 'ретро', 'retro', 'автоматический выключатель', 'gallant'];
          if (excludeTerms.some(term => name.includes(term))) return false;
          
          // Включаем только нужные типы товаров
          return targetProductNames.some(targetName => 
            name.includes(targetName.toLowerCase())
          );
        });
        
        filteredProducts.sort((a: any, b: any) => (a.article || '').localeCompare(b.article || ''));
        
        setAllFilteredProducts(filteredProducts);
        setTotalProducts(filteredProducts.length);
        
        const itemsPerPage = 40;
        const totalPagesCalc = Math.ceil(filteredProducts.length / itemsPerPage);
        setTotalPages(totalPagesCalc);
        
        updatePage(1, filteredProducts, itemsPerPage);
      }
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const updatePage = (page: number, allProducts: ProductI[], itemsPerPage: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = allProducts.slice(startIndex, endIndex);
    
    setProducts(paginatedProducts);
    setCurrentPage(page);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handlePageChange = (page: number) => {
    if (allFilteredProducts.length > 0) {
      updatePage(page, allFilteredProducts, 40);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', color: 'var(--foreground)' }}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 p-48">
        <nav className="flex items-center space-x-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">Главная</Link>
          <span>/</span>
          <Link href="/ElektroustnovohneIzdely" className="hover:text-white transition-colors">Электроустановочные изделия</Link>
          <span>/</span>
          <Link href="/ElektroustnovohneIzdely/Werkel" className="hover:text-white transition-colors">Werkel</Link>
          <span>/</span>
          <span className="text-white">Айвори матовый</span>
        </nav>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="mb-8">
          <h2 className="text-5xl font-bold text-white mb-5">Айвори матовый</h2>
          {totalProducts > 0 ? (
            <p className="text-white">Найдено {totalProducts} {totalProducts === 1 ? 'товар' : totalProducts < 5 ? 'товара' : 'товаров'}</p>
          ) : !loading && (
            <p className="text-white"></p>
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

        <div>
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