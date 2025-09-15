'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { createPortal } from 'react-dom';
import 'tailwindcss/tailwind.css';
import { Heart, ArrowLeft, Copy } from 'lucide-react';
import ProductDetailView from '@/components/ProductDetailView';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ProductI } from '@/types/interfaces';

const ProductDetailPage: React.FC = () => {
  const router = useRouter();
  const { supplier, article: articleParam } = router.query;
  const [product, setProduct] = useState<ProductI | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<{ id: number; text: string; type: 'success' | 'error' }[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((t) => [...t, { id, text, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!supplier || !articleParam) return;
      // support article as array of segments
      const article = Array.isArray(articleParam) ? articleParam.join('/') : String(articleParam);
      setLoading(true);
      try {
        const supplierVariants = [
          String(supplier),
          String(supplier).toLowerCase(),
          String(supplier).toUpperCase(),
          String(supplier).charAt(0).toUpperCase() + String(supplier).slice(1),
        ];

        // build article variants to try (raw, decoded, space->%20, space->+, slash->-, last segment)
        const articleVariants = new Set<string>();
        articleVariants.add(article);
        try { articleVariants.add(decodeURIComponent(article)); } catch {}
        articleVariants.add(article.replace(/\s+/g, '%20'));
        articleVariants.add(article.replace(/\s+/g, '+'));
        articleVariants.add(article.replace(/\s+/g, ''));
        articleVariants.add(article.replace(/\//g, '-'));
        articleVariants.add(article.replace(/\//g, '_'));
        articleVariants.add(article.split('/').filter(Boolean).slice(-1)[0] || article);

        let response = null;
        let lastError: any = null;

        // Try without supplier first (some APIs accept article only)
        for (const av of Array.from(articleVariants)) {
          try {
            // try as-is in URL
            response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/product?productArticle=${av}`);
            if (response && response.status >= 200 && response.status < 300 && response.data) break;
          } catch (err) {
            lastError = err;
          }
          try {
            // try letting axios encode via params
            response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/product`, { params: { productArticle: av } });
            if (response && response.status >= 200 && response.status < 300 && response.data) break;
          } catch (err) {
            lastError = err;
          }
        }

        // then try supplier + article combos
        if (!response) {
          for (const s of supplierVariants) {
            for (const av of Array.from(articleVariants)) {
              try {
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/product/${encodeURIComponent(s)}?productArticle=${av}`);
                if (response && response.status >= 200 && response.status < 300 && response.data) break;
              } catch (err) {
                lastError = err;
              }
              try {
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/product/${encodeURIComponent(s)}`, { params: { productArticle: av } });
                if (response && response.status >= 200 && response.status < 300 && response.data) break;
              } catch (err) {
                lastError = err;
              }
            }
            if (response && response.data) break;
          }
        }

        if (!response || !response.data) {
          console.error('All supplier/article variants failed', supplier, article, lastError);
          throw lastError;
        }

        setProduct(response.data);
      } catch (error) {
        console.error('Ошибка при клиентской загрузке товара:', error);
        showToast('Ошибка при загрузке товара', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [supplier, articleParam]);
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  let content = null;
  if (loading) {
    content = (
      <div className="flex justify-center items-center h-screen bg-white">
        <LoadingSpinner size="xl" />
      </div>
    );
  } else if (!product) {
    content = (
      <div className="flex justify-center items-center h-screen bg-white">
        <p>Товар не найден</p>
      </div>
    );
  } else {
    content = <ProductDetailView product={product as any} />;
  }

  return (
    <>
      {isMounted && typeof document !== 'undefined' && createPortal(
        <div className="fixed top-6 right-6 flex flex-col gap-2 z-[20000]">
          {toasts.map((t) => (
            <div key={t.id} className={"px-4 py-2 rounded-xl shadow-lg text-sm " + (t.type === 'success' ? 'bg-black text-white' : 'bg-red-600 text-white') }>
              {t.text}
            </div>
          ))}
        </div>,
        document.body
      )}
      {content}
    </>
  );
};

export default ProductDetailPage;

