'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { ProductI } from '@/types/interfaces';
import CatalogOfProductSearch from '@/components/Catalogofsearch';
import LoadingSpinner from '@/components/LoadingSpinner';
import PaginationComponents from '@/components/PaginationComponents';
import { NEXT_PUBLIC_API_URL } from '@/utils/constants';

export default function VoltumWhiteMattePage() {
  const [products, setProducts] = useState<ProductI[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [allFilteredProducts, setAllFilteredProducts] = useState<ProductI[]>([]);
  const itemsPerPage = 40;

  const fetchProducts = async (page: number = 1) => {
    try {
      setLoading(true);
      if (allFilteredProducts.length > 0) {
        const startIndex = (page - 1) * itemsPerPage;
        setProducts(allFilteredProducts.slice(startIndex, startIndex + itemsPerPage));
        setCurrentPage(page);
        setLoading(false);
        return;
      }

      const apiUrl = NEXT_PUBLIC_API_URL;
      let allProducts: any[] = [];
      for (let pageNum = 1; pageNum <= 5; pageNum++) {
        try {
          const params = { source: 'Voltum', page: pageNum, limit: 200, inStock: 'true' };
          const response = await axios.get(`${apiUrl}/api/products/Voltum`, { params });
          if (response.data && response.data.products && Array.isArray(response.data.products)) {
            allProducts = [...allProducts, ...response.data.products];
            if (response.data.products.length < params.limit) break;
          } else break;
          await new Promise(r => setTimeout(r, 50));
        } catch (err) { console.error(err); break; }
      }

      const uniqueProducts = allProducts.filter((product, index, self) => index === self.findIndex(p => p.article === product.article));
      if (uniqueProducts.length > 0) {
        const filteredProducts = uniqueProducts.filter((product: any) => {
          const category = (product.category || '').toLowerCase();
          const name = (product.name || '').toLowerCase();
          return (category.includes('белый матовый') || name.includes('белый матовый')) && !category.includes('хром');
        });

        setAllFilteredProducts(filteredProducts);
        setTotalProducts(filteredProducts.length);
        setTotalPages(Math.ceil(filteredProducts.length / itemsPerPage));
        const startIndex = (page - 1) * itemsPerPage;
        setProducts(filteredProducts.slice(startIndex, startIndex + itemsPerPage));
      }
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      setProducts([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(1); }, []);

  const handlePageChange = (page: number) => { fetchProducts(page); };

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', color: 'var(--foreground)' }}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ maxWidth: '89rem' }}>
        <div style={{ maxWidth: '89rem' }} className="mx-auto px-4 sm:px-6 lg:px-8 mb-6 mt-32">
          <nav className="flex items-center space-x-3 text-sm text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">Главная</Link>
            <span>/</span>
            <Link href="/ElektroustnovohneIzdely" className="hover:text-white transition-colors">Электроустановочные изделия</Link>
            <span>/</span>
            <Link href="/ElektroustnovohneIzdely/Voltum" className="hover:text-white transition-colors">Voltum</Link>
            <span>/</span>
            <span className="text-black">Белый матовый</span>
          </nav>
        </div>
        <div>
          <h2 className="text-5xl px-6 font-bold text-black mb-3">Белый матовый</h2>
          {totalProducts > 0 ? (
            <p className="text-white">Найдено {totalProducts} {totalProducts === 1 ? 'товар' : totalProducts < 5 ? 'товара' : 'товаров'}</p>
          ) : !loading && (
            <p className="text-gray-400">Электроустановочные изделия Voltum цвета Белый матовый</p>
          )}
        </div>

        <div className="mb-6">
          {loading ? (
            <div className="py-8 w-full"><div className="grid w-full grid-cols-2 gap-2 sm:gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-3 lg:gap-3 xl:grid-cols-4 xl:gap-3">{Array.from({ length: 8 }).map((_, i) => (<div key={i} className="bg-black rounded-md border border-[#633a3a] flex flex-col h-full"><div className="relative aspect-square bg-[#633a3a]/20 animate-pulse rounded-t-md min-h-[110px] sm:min-h-[130px]"></div><div className="p-3 flex flex-col flex-grow"><div className="h-3.5 bg-[#633a3a]/30 rounded w-3/4 mb-2 animate-pulse"></div><div className="h-2.5 bg-[#633a3a]/20 rounded w-1/2 mb-2 animate-pulse"></div></div></div>))}</div></div>
          ) : products.length > 0 ? (
            <CatalogOfProductSearch products={products} viewMode={viewMode} isLoading={loading} />
          ) : (
            <div className="text-center py-16"><div className="text-gray-400 text-lg mb-4">Товары не найдены</div></div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            {currentPage > 1 && (<button onClick={() => handlePageChange(currentPage - 1)} className="px-3 py-1.5 bg-[#1a1a1a] text-white rounded hover:bg-[#812626] border border-[#633a3a] transition-colors">← Назад</button>)}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => { const page = i + 1; return (<button key={page} onClick={() => handlePageChange(page)} className={`px-2 py-1.5 rounded text-sm transition-colors ${page === currentPage ? 'bg-[#812626] text-white' : 'bg-[#1a1a1a] text-white hover:bg-[#812626] border border-[#633a3a]'}`}>{page}</button>); })}
            {currentPage < totalPages && (<button onClick={() => handlePageChange(currentPage + 1)} className="px-3 py-1.5 bg-[#1a1a1a] text-white rounded hover:bg-[#812626] border border-[#633a3a] transition-colors">Вперед →</button>)}
          </div>
        )}
      </div>
    </div>
  );
}