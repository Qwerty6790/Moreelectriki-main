'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { ProductI } from '@/types/interfaces';
import CatalogOfProductSearch from '@/components/Catalogofsearch';
import LoadingSpinner from '@/components/LoadingSpinner';
import { NEXT_PUBLIC_API_URL } from '@/utils/constants';

export default function RetroMetallicPage() {
  const [products, setProducts] = useState<ProductI[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');

  // Точные названия и артикулы товаров для поиска
  const targetProducts = [
    { name: 'Рамка из стекла на 3 поста белый', article: 'W0035101' },
    { name: 'Рамка на 1 пост светлый бук', article: 'W0015224' },
    { name: 'Рамка на 2 поста светлый бук', article: 'W0025224' },
    { name: 'Рамка из стекла на 2 поста черный', article: 'W0025108' },
    { name: 'Рамка на 3 поста венге', article: 'W0035226' },
    { name: 'Рамка на 3 поста светлый бук', article: 'W0035224' },
  ];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const apiUrl = NEXT_PUBLIC_API_URL;
      const allProducts: ProductI[] = [];

      // Ищем каждый товар отдельно по артикулу для точности
      for (const target of targetProducts) {
        try {
          const params = {
            source: 'Werkel',
            article: target.article,
            page: 1,
            limit: 10
          };

          const { data } = await axios.get(`${apiUrl}/api/products/Werkel`, { params });
          
          if (data && data.products && data.products.length > 0) {
            // Проверяем, что найденный товар соответствует нашему поиску
            const foundProduct = data.products.find((product: any) => {
              const productName = (product.name || '').toLowerCase();
              const productArticle = product.article || '';
              
              return productArticle === target.article && 
                     productName.includes(target.name.toLowerCase());
            });
            
            if (foundProduct) {
              allProducts.push(foundProduct);
            }
          }
        } catch (error) {
          console.error(`Ошибка поиска товара ${target.article}:`, error);
        }
      }

      // Сортируем по артикулу для стабильного порядка
      allProducts.sort((a, b) => (a.article || '').localeCompare(b.article || ''));
      
      setProducts(allProducts);
      setTotalProducts(allProducts.length);
      setTotalPages(1); // Все товары на одной странице
      setCurrentPage(1);
      
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', color: 'var(--foreground)' }}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8 mb-52" style={{ maxWidth: '88rem' }}>
        
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '88rem' }}>
        <div className="mb-8">
          <h2 className="text-5xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5">Retro - Рамка Rundo</h2>
          <nav className="flex flex-wrap items-center gap-1 sm:gap-2 text-sm sm:text-base text-white">
          <Link href="/" className="hover:text-white transition-colors">Главная</Link>
          <span>/</span>
          <Link href="/ElektroustnovohneIzdely" className="hover:text-white transition-colors">Электроустановочные изделия</Link>
          <span>/</span>
          <Link href="/ElektroustnovohneIzdely/Werkel" className="hover:text-white transition-colors">Werkel</Link>
          <span>/</span>
          <span className="text-white">Retro - Рамка Runda</span>
        </nav>
        </div>

        <div>
          { loading ? (
  <LoadingSpinner isLoading={loading} />
) : products.length > 0 ? (
            <CatalogOfProductSearch products={products} viewMode={viewMode} isLoading={loading} />
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 text-lg mb-4">Товары не найдены</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 

