'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { ProductI } from '@/types/interfaces';
import CatalogOfProductSearch from '@/components/Catalogofsearch';
import LoadingSpinner from '@/components/LoadingSpinner';
import PaginationComponents from '@/components/PaginationComponents';
import { NEXT_PUBLIC_API_URL } from '@/utils/constants';

export default function VoltumCashmerePage() {
  const [products, setProducts] = useState<ProductI[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [allFilteredProducts, setAllFilteredProducts] = useState<ProductI[]>([]);
  const itemsPerPage = 12;

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
          return category.includes('кашемир') || name.includes('кашемир');
        });
        setAllFilteredProducts(filteredProducts);
        setTotalProducts(filteredProducts.length);
        setTotalPages(Math.ceil(filteredProducts.length / itemsPerPage));
        const startIndex = (page - 1) * itemsPerPage;
        setProducts(filteredProducts.slice(startIndex, startIndex + itemsPerPage));
      }
    } catch (error) { console.error(error); setProducts([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(1); }, []);
  const handlePageChange = (page: number) => { fetchProducts(page); };

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', color: 'var(--foreground)' }}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 mt-44">
        <nav className="flex items-center space-x-2 text-sm text-gray-400">
          <Link href="/">Главная</Link>
          <span>/</span>
          <Link href="/ElektroustnovohneIzdely">Электроустановочные изделия</Link>
          <span>/</span>
          <Link href="/ElektroustnovohneIzdely/Voltum">Voltum</Link>
          <span>/</span>
          <span className="text-black">Кашемир</span>
        </nav>
      </div>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-5xl font-bold text-black mb-5">Кашемир</h2>
        {loading ? <LoadingSpinner isLoading={loading} /> : products.length > 0 ? <CatalogOfProductSearch products={products} viewMode={viewMode} isLoading={loading} /> : <div className="text-center py-16"><div className="text-gray-400 text-lg mb-4">Товары не найдены</div></div>}
        {totalPages > 1 && <PaginationComponents totalPages={totalPages} currentPage={currentPage} onPageChange={handlePageChange} isLoading={loading} totalItems={totalProducts} itemsPerPage={itemsPerPage} />}
      </div>
    </div>
  );
}