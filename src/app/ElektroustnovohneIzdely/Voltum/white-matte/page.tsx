'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { ProductI } from '@/types/interfaces';
import CatalogOfProductSearch from '@/components/Catalogofsearch';
import LoadingSpinner from '@/components/LoadingSpinner';
import Pagination from '@/components/PaginationComponents';
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
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-44" >
        <div>
          <h2 className="text-5xl px-6 font-bold text-black mb-3">Белый матовый</h2>
          <div  className="mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-3 text-2xl text-black">
            <Link href="/" className="hover:text-white transition-colors">Главная</Link>
            <span className='mb-3'>.</span>
            <Link href="/ElektroustnovohneIzdely" className="hover:text-white transition-colors">Электроустановочные изделия</Link>
            <span className='mb-3'>.</span>
            <Link href="/ElektroustnovohneIzdely/Voltum" className="hover:text-white transition-colors">Voltum</Link>
            <span className='mb-3'>.</span>
            <span className="text-black">Белый матовый</span>
          </nav>
        </div>
          {totalProducts > 0 ? (
            <p className="text-white">Найдено {totalProducts} {totalProducts === 1 ? 'товар' : totalProducts < 5 ? 'товара' : 'товаров'}</p>
          ) : !loading && (
            <p className="text-gray-400">Электроустановочные изделия Voltum цвета Белый матовый</p>
          )}
        </div>

        <div className="mb-6">
          {loading ? (
            <div className="py-8 w-full flex justify-center">
              <LoadingSpinner size="lg" text="Загружаем товары..." />
            </div>
          ) : products.length > 0 ? (
            <CatalogOfProductSearch products={products} viewMode={viewMode} isLoading={loading} />
          ) : (
            <div className="text-center py-16"><div className="text-gray-400 text-lg mb-4">Товары не найдены</div></div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </div>
    </div>
  );
}