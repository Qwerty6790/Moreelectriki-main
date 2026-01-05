
'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CatalogOfProductSearch from '@/components/Catalogofsearch';
import Pagination from '@/components/PaginationComponents';
import LoadingSpinner from '@/components/LoadingSpinner';
import 'tailwindcss/tailwind.css';
import { ProductI } from '@/types/interfaces';
import SEO from '@/components/SEO';

// --- ТИПЫ И ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

const isWordMatch = (fullText: string, keyword: string): boolean => {
  if (!fullText) return false;
  const t = fullText.toLowerCase();
  const k = keyword.toLowerCase();
  if (k === 'бра') {
    const regex = new RegExp(`(?:^|[^а-яёa-z0-9])${k}(?:[^а-яёa-z0-9]|$)`, 'iu');
    return regex.test(t);
  }
  return t.includes(k);
};

// Функция нормализации значений фильтров
const normalizeFilterValue = (value: string): string => {
    if (typeof value !== 'string' || !value) return '';
    let cleanValue = value.toLowerCase().trim().replace(/[;,.]/g, '');
    
    const termFixes: Record<string, string> = {
        'мат': 'матовый', 'глянец': 'глянцевый', 'глян': 'глянцевый',
        'прозр': 'прозрачный', 'дымч': 'дымчатый', 'бронз': 'бронза',
    };

    const words = cleanValue.split(' ').filter(Boolean);
    const fixedWords = words.map(word => termFixes[word] || word);
    cleanValue = fixedWords.join(' ');

    if (cleanValue.includes('золот') || cleanValue.includes('gold')) return 'Золото';
    if (cleanValue.includes('серебр') || cleanValue.includes('silver') || cleanValue.includes('хром')) return 'Хром / Серебро';
    if (cleanValue.includes('бел')) return 'Белый';
    if (cleanValue.includes('черн')) return 'Черный';
    if (cleanValue.includes('бронза')) return 'Бронза';

    return cleanValue.charAt(0).toUpperCase() + cleanValue.slice(1);
};

// --- КОМПОНЕНТЫ UI ---

const CloseIcon = () => (
  <svg width="10" height="10" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const Accordion = ({ title, isOpen, setIsOpen, children, hasActiveFilter = false }: { title: string, isOpen: boolean, setIsOpen: (isOpen: boolean) => void, children: React.ReactNode, hasActiveFilter?: boolean }) => (
    <div className="border-b border-gray-200 py-6">
        <h3 className="-my-3 flow-root">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500"
            >
                <span className={`font-semibold text-gray-900 flex items-center`}>
                    {title}
                    {hasActiveFilter && <span className="ml-2 w-2 h-2 rounded-full bg-black"></span>}
                </span>
                <span className="ml-6 flex items-center">
                    <svg className={`h-5 w-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </span>
            </button>
        </h3>
        {isOpen && (
            <div className="pt-6">
                <div className="space-y-4">
                    {children}
                </div>
            </div>
        )}
    </div>
);

// --- MAIN COMPONENT ---

const SearchResults: React.FC = () => {
  const router = useRouter();
  const { qwery } = router.query;

  // --- STATE ---
  const [allProducts, setAllProducts] = useState<ProductI[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductI[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<ProductI[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 24;

  // --- FILTER STATES ---
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [availability, setAvailability] = useState<'all' | 'inStock' | 'outOfStock'>('all');
  const [sort, setSort] = useState<'popularity' | 'price_asc' | 'price_desc' | 'newest'>('popularity');
  
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [brandSearch, setBrandSearch] = useState('');
  
  // Технические фильтры
  const [selectedSocketType, setSelectedSocketType] = useState<string | null>(null);
  const [selectedLampCount, setSelectedLampCount] = useState<number | null>(null);
  const [selectedShadeColor, setSelectedShadeColor] = useState<string | null>(null);
  const [selectedFrameColor, setSelectedFrameColor] = useState<string | null>(null);

  // Извлеченные опции фильтров
  const [extractedFilters, setExtractedFilters] = useState<{
      socketTypes: string[];
      lampCounts: number[];
      shadeColors: string[];
      frameColors: string[];
      brands: {name: string, count: number}[];
  }>({
      socketTypes: [],
      lampCounts: [],
      shadeColors: [],
      frameColors: [],
      brands: []
  });

  // UI States
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isBrandOpen, setIsBrandOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isSpecsOpen, setIsSpecsOpen] = useState(true);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(true);

  // --- FETCHING LOGIC ---
  useEffect(() => {
    if (!router.isReady || !qwery) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/search`, {
          params: {
            name: qwery,
            page: 1,
            pageSize: 5000,
            sortBy: 'date',
            sortOrder: 'desc'
          }
        });

        let products: ProductI[] = data.products || [];
        const searchString = String(qwery).toLowerCase();

        if (searchString === 'бра') {
            products = products.filter(p => {
                const info = (p.name + ' ' + (p.category || '')).toLowerCase();
                return isWordMatch(info, 'бра');
            });
        }

        setAllProducts(products);
        extractOptions(products);
      } catch (error) {
        console.error(error);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [qwery, router.isReady]);

  // --- ИЗВЛЕЧЕНИЕ ОПЦИЙ ФИЛЬТРОВ ---
  const extractOptions = (products: ProductI[]) => {
      const socketTypes = new Set<string>();
      const lampCounts = new Set<number>();
      const shadeColors = new Map<string, string>();
      const frameColors = new Map<string, string>();
      const brandCounts = new Map<string, number>();

      products.forEach(p => {
          // Бренды
          let brandName = p.source || (p as any).brand || (p as any).vendor || 'Другое';
          brandName = String(brandName).trim();
          if (brandName && brandName !== 'undefined' && brandName !== 'null') {
              brandCounts.set(brandName, (brandCounts.get(brandName) || 0) + 1);
          }

          // Технические параметры
          if (p.socketType) {
              const norm = normalizeFilterValue(String(p.socketType));
              if (norm) socketTypes.add(norm);
          }
          if (p.lampCount && typeof p.lampCount === 'number') {
              lampCounts.add(p.lampCount);
          }
          if (p.shadeColor) {
              const norm = normalizeFilterValue(String(p.shadeColor));
              if (norm) shadeColors.set(norm, norm);
          }
          if (p.frameColor) {
              const norm = normalizeFilterValue(String(p.frameColor));
              if (norm) frameColors.set(norm, norm);
          }
      });

      setExtractedFilters({
          socketTypes: Array.from(socketTypes).sort(),
          lampCounts: Array.from(lampCounts).sort((a,b) => a-b),
          shadeColors: Array.from(shadeColors.values()).sort(),
          frameColors: Array.from(frameColors.values()).sort(),
          brands: Array.from(brandCounts.entries())
            .map(([name, count]) => ({name, count}))
            .sort((a,b) => b.count - a.count)
      });
  };

  // --- FILTERING & SORTING LOGIC ---
  useEffect(() => {
    let result = [...allProducts];

    // 1. Бренды
    if (selectedBrands.length > 0) {
        result = result.filter(p => {
            let brand = p.source || (p as any).brand || 'Другое';
            return selectedBrands.includes(String(brand).trim());
        });
    }

    // 2. Цена
    if (minPrice > 0) result = result.filter(p => (p.price || 0) >= minPrice);
    if (maxPrice < 1000000) result = result.filter(p => (p.price || 0) <= maxPrice);

    // 3. Наличие
    if (availability === 'inStock') result = result.filter(p => (Number(p.stock) || 0) > 0);
    else if (availability === 'outOfStock') result = result.filter(p => (Number(p.stock) || 0) <= 0);

    // 4. Технические фильтры
    if (selectedSocketType) {
        result = result.filter(p => p.socketType && normalizeFilterValue(String(p.socketType)) === selectedSocketType);
    }
    if (selectedLampCount) {
        result = result.filter(p => p.lampCount === selectedLampCount);
    }
    if (selectedShadeColor) {
        result = result.filter(p => p.shadeColor && normalizeFilterValue(String(p.shadeColor)) === selectedShadeColor);
    }
    if (selectedFrameColor) {
        result = result.filter(p => p.frameColor && normalizeFilterValue(String(p.frameColor)) === selectedFrameColor);
    }

    // 5. Сортировка
    if (sort === 'price_asc') result.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sort === 'price_desc') result.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (sort === 'newest') result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    setFilteredProducts(result);
    setTotalPages(Math.ceil(result.length / ITEMS_PER_PAGE));
    
    // Pagination slicing
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    setDisplayedProducts(result.slice(start, start + ITEMS_PER_PAGE));

  }, [allProducts, selectedBrands, minPrice, maxPrice, availability, selectedSocketType, selectedLampCount, selectedShadeColor, selectedFrameColor, sort, currentPage]);

  // --- HANDLERS ---
  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
    setCurrentPage(1);
  };

  const resetFilters = () => {
      setMinPrice(0);
      setMaxPrice(1000000);
      setAvailability('all');
      setSelectedBrands([]);
      setSelectedSocketType(null);
      setSelectedLampCount(null);
      setSelectedShadeColor(null);
      setSelectedFrameColor(null);
      setCurrentPage(1);
  };

  // Helper for colors
  const colorMap: Record<string, string> = {
      'белый': '#FFFFFF', 'черный': '#000000', 'золото': 'gold', 'хром': '#C0C0C0', 
      'серебро': '#C0C0C0', 'бронза': '#CD7F32', 'серый': 'grey', 'бежевый': 'beige',
  };
  const getColorHex = (name: string) => {
      const lower = name.toLowerCase();
      for (const key in colorMap) if (lower.includes(key)) return colorMap[key];
      return '#E5E7EB';
  };

  // --- COMPONENT: ACTIVE FILTERS ---
  const ActiveFilters = () => {
    const hasActive = selectedBrands.length > 0 || minPrice > 0 || maxPrice < 1000000 || 
                      selectedSocketType || selectedLampCount || selectedShadeColor || selectedFrameColor || availability !== 'all';
    
    if (!hasActive) return null;

    const FilterTag = ({ label, onRemove }: { label: string, onRemove: () => void }) => (
        <div className="flex items-center bg-gray-100 text-gray-800 text-sm font-medium pl-3 pr-2 py-1 rounded-full border border-gray-200">
            <span>{label}</span>
            <button onClick={onRemove} className="ml-2 p-0.5 rounded-full hover:bg-gray-300 text-gray-500 hover:text-gray-700">
                <CloseIcon />
            </button>
        </div>
    );

    return (
        <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="font-medium text-gray-700 text-sm">Активные фильтры:</span>
            {selectedBrands.map(b => <FilterTag key={b} label={b} onRemove={() => toggleBrand(b)} />)}
            {(minPrice > 0 || maxPrice < 1000000) && <FilterTag label={`Цена: ${minPrice} - ${maxPrice}`} onRemove={() => {setMinPrice(0); setMaxPrice(1000000)}} />}
            {selectedSocketType && <FilterTag label={`Цоколь: ${selectedSocketType}`} onRemove={() => setSelectedSocketType(null)} />}
            {selectedLampCount && <FilterTag label={`Ламп: ${selectedLampCount}`} onRemove={() => setSelectedLampCount(null)} />}
            {selectedFrameColor && <FilterTag label={`Арматура: ${selectedFrameColor}`} onRemove={() => setSelectedFrameColor(null)} />}
            {availability !== 'all' && <FilterTag label={availability === 'inStock' ? 'В наличии' : 'Под заказ'} onRemove={() => setAvailability('all')} />}
            
            <button onClick={resetFilters} className="ml-auto text-sm text-gray-500 hover:text-black underline">Сбросить все</button>
        </div>
    );
  };

  // --- COMPONENT: SIDEBAR CONTENT ---
  const SidebarContent = () => (
      <div className="p-4 lg:p-0">
          {/* Цена */}
          <Accordion title="Цена" isOpen={isPriceOpen} setIsOpen={setIsPriceOpen} hasActiveFilter={minPrice > 0 || maxPrice < 1000000}>
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">от</span>
                        <input type="number" value={minPrice === 0 ? '' : minPrice} onChange={(e) => setMinPrice(Number(e.target.value))} className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded px-3 py-2 pl-8 text-sm outline-none" placeholder="0" />
                    </div>
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">до</span>
                        <input type="number" value={maxPrice === 1000000 ? '' : maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded px-3 py-2 pl-8 text-sm outline-none" placeholder="Max" />
                    </div>
                </div>
          </Accordion>

          {/* Бренд */}
          {extractedFilters.brands.length > 0 && (
            <Accordion title="Производитель" isOpen={isBrandOpen} setIsOpen={setIsBrandOpen} hasActiveFilter={selectedBrands.length > 0}>
                <div className="relative mb-3">
                     <input 
                        type="text" 
                        placeholder="Поиск бренда..." 
                        value={brandSearch} 
                        onChange={(e) => setBrandSearch(e.target.value)}
                        className="w-full text-sm pl-3 pr-3 py-2 bg-gray-100 rounded-md border-transparent focus:ring-1 focus:ring-black"
                     />
                </div>
                <div className="max-h-60 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                    {extractedFilters.brands
                        .filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase()))
                        .map(b => (
                        <label key={b.name} className="flex items-center gap-3 cursor-pointer group select-none">
                            <div className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors ${selectedBrands.includes(b.name) ? 'bg-black border-black' : 'border-gray-300 group-hover:border-gray-400'}`}>
                                {selectedBrands.includes(b.name) && <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5"/></svg>}
                            </div>
                            <input type="checkbox" className="hidden" checked={selectedBrands.includes(b.name)} onChange={() => toggleBrand(b.name)} />
                            <span className="text-sm text-gray-600 group-hover:text-black flex-1 truncate">{b.name}</span>
                            <span className="text-xs text-gray-300">{b.count}</span>
                        </label>
                    ))}
                </div>
            </Accordion>
          )}

          {/* Технические фильтры */}
          {(extractedFilters.socketTypes.length > 0 || extractedFilters.lampCounts.length > 0 || extractedFilters.frameColors.length > 0) && (
             <Accordion title="Характеристики" isOpen={isSpecsOpen} setIsOpen={setIsSpecsOpen} hasActiveFilter={!!(selectedSocketType || selectedLampCount || selectedFrameColor)}>
                
                {/* Цвет арматуры */}
                {extractedFilters.frameColors.length > 0 && (
                    <div className="mb-4">
                        <h4 className="font-medium text-xs uppercase tracking-wider text-gray-500 mb-2">Цвет арматуры</h4>
                        <div className="flex flex-wrap gap-2">
                            {extractedFilters.frameColors.map(color => (
                                <button
                                    key={color} title={color}
                                    onClick={() => setSelectedFrameColor(selectedFrameColor === color ? null : color)}
                                    className={`w-6 h-6 rounded-full border border-gray-200 transition-all ${selectedFrameColor === color ? 'ring-2 ring-offset-2 ring-black' : 'hover:scale-110'}`}
                                    style={{ backgroundColor: getColorHex(color) }}
                                />
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Цоколь */}
                {extractedFilters.socketTypes.length > 0 && (
                    <div className="mb-4">
                        <h4 className="font-medium text-xs uppercase tracking-wider text-gray-500 mb-2">Цоколь</h4>
                        <div className="flex flex-wrap gap-1.5">
                            {extractedFilters.socketTypes.map(item => (
                                <button 
                                    key={item} 
                                    onClick={() => setSelectedSocketType(selectedSocketType === item ? null : item)} 
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition ${selectedSocketType === item ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
                                >
                                    {item.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Кол-во ламп */}
                {extractedFilters.lampCounts.length > 0 && (
                    <div>
                        <h4 className="font-medium text-xs uppercase tracking-wider text-gray-500 mb-2">Кол-во ламп</h4>
                        <div className="flex flex-wrap gap-1.5">
                            {extractedFilters.lampCounts.map(item => (
                                <button 
                                    key={item} 
                                    onClick={() => setSelectedLampCount(selectedLampCount === item ? null : item)} 
                                    className={`w-8 h-8 rounded-md text-xs font-medium border flex items-center justify-center transition ${selectedLampCount === item ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
             </Accordion>
          )}

          {/* Наличие */}
          <Accordion title="Наличие" isOpen={isAvailabilityOpen} setIsOpen={setIsAvailabilityOpen} hasActiveFilter={availability !== 'all'}>
             <div className="space-y-2">
                <button onClick={() => setAvailability('all')} className={`w-full flex items-center justify-between p-2 rounded border transition ${availability === 'all' ? 'bg-gray-100 border-gray-300' : 'border-gray-100'}`}>
                    <span className="text-sm">Все товары</span>
                    {availability === 'all' && <CheckIcon />}
                </button>
                <button onClick={() => setAvailability('inStock')} className={`w-full flex items-center justify-between p-2 rounded border transition ${availability === 'inStock' ? 'bg-gray-100 border-gray-300' : 'border-gray-100'}`}>
                    <span className="text-sm">В наличии</span>
                    {availability === 'inStock' && <CheckIcon />}
                </button>
             </div>
          </Accordion>
      </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans selection:bg-black selection:text-white">
  <SEO 
          title={`Поиск: ${qwery} - MoreElektriki`}
          description={`Результаты поиска по запросу ${qwery} в каталоге MoreElektriki.`}
          url={router.asPath}
          image="/images/logo.webp"
      />
      <Header />
      
      <div className="pt-24 lg:pt-32"></div>

      <main className="container mx-auto px-4 lg:px-6 max-w-[1600px] pb-24">
        
        {/* ХЛЕБНЫЕ КРОШКИ И ЗАГОЛОВОК */}
        <div className="flex justify-between items-end flex-wrap gap-4 mt-4 mb-8">
             <div>
                <div className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-2 uppercase tracking-wider">
                    <Link href="/" className="hover:text-black transition-colors">Главная</Link>
                    <span>/</span>
                    <span className="text-black">Поиск</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-black">
                    Результаты поиска: «{qwery}»
                </h1>
             </div>
             {filteredProducts.length > 0 && (
                <span className="text-base text-gray-600 font-medium whitespace-nowrap">
                    Найдено {filteredProducts.length} товаров
                </span>
             )}
        </div>

        {/* АКТИВНЫЕ ФИЛЬТРЫ */}
        <ActiveFilters />

        {/* МОБИЛЬНАЯ КНОПКА ФИЛЬТРОВ */}
        <div className="lg:hidden mb-6">
            <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="w-full py-3 px-4 bg-white border border-gray-300 rounded-xl flex items-center justify-center gap-2 font-medium"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></svg>
                Фильтры
            </button>
        </div>

        {/* --- ОСНОВНОЙ КОНТЕЙНЕР (items-start важен для sticky сайдбара) --- */}
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 relative items-start">
            
            {/* --- САЙДБАР --- */}
            <aside className={`
                ${isMobileFilterOpen ? 'fixed inset-0 z-40 flex' : 'hidden'} 
                lg:block lg:relative lg:z-auto lg:w-[280px] lg:flex-shrink-0
            `}>
                {/* Backdrop mobile */}
                {isMobileFilterOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setIsMobileFilterOpen(false)} />}
                
                {/* Sidebar Container: STICKY и SCROLL внутри сайдбара */}
                <div className={`
                    fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white overflow-y-auto shadow-xl z-40 transition-transform duration-300 
                    ${isMobileFilterOpen ? 'translate-x-0' : 'translate-x-full'} 
                    lg:transform-none  lg:w-full lg:max-w-none lg:shadow-none lg:bg-transparent
                    lg:sticky lg:top-32 lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto lg:custom-scrollbar
                `}>
                    {/* Mobile Header */}
                    <div className="lg:hidden flex justify-between items-center px-4 py-3 border-b border-gray-200 sticky top-0 bg-white z-10">
                        <h2 className="text-lg font-bold">Фильтры</h2>
                        <button onClick={() => setIsMobileFilterOpen(false)}><CloseIcon /></button>
                    </div>

                    <SidebarContent />

                    {/* Mobile Footer Actions */}
                    <div className="lg:hidden sticky bottom-0 bg-white border-t border-gray-200 p-4">
                        <div className="flex gap-3">
                            <button onClick={resetFilters} className="flex-1 py-3 border border-gray-300 rounded-lg text-sm font-semibold">Сбросить</button>
                            <button onClick={() => setIsMobileFilterOpen(false)} className="flex-1 py-3 bg-black text-white rounded-lg text-sm font-semibold">Показать</button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* --- КОНТЕНТ --- */}
            <div className="flex-1 min-w-0">
               
               {/* Сортировка */}
               <div className="flex justify-end mb-6 border-b border-gray-100 pb-2">
                   <div className="flex items-center gap-2">
                       <span className="text-sm text-gray-500">Сортировка:</span>
                       <select 
                           value={sort}
                           onChange={(e) => { setSort(e.target.value as any); setCurrentPage(1); }}
                           className="text-sm font-medium bg-transparent border-none focus:ring-0 cursor-pointer text-right"
                       >
                           <option value="popularity">По популярности</option>
                           <option value="newest">Новинки</option>
                           <option value="price_asc">Сначала дешевые</option>
                           <option value="price_desc">Сначала дорогие</option>
                       </select>
                   </div>
               </div>

               {loading ? (
                    <div className="min-h-[400px] flex items-center justify-center">
                        <LoadingSpinner isLoading={loading} />
                    </div>
                ) : displayedProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">Ничего не найдено</h3>
                        <p className="text-gray-500 mb-6 text-center max-w-xs">Попробуйте изменить параметры фильтрации или поисковый запрос.</p>
                        <button onClick={resetFilters} className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-all">Сбросить фильтры</button>
                    </div>
                ) : (
                    <>
                        <CatalogOfProductSearch products={displayedProducts} viewMode={'grid'} isLoading={false} />
                        
                        <div className="mt-16 border-t border-gray-100 pt-8 flex justify-center">
                            <Pagination 
                                totalPages={totalPages} 
                                currentPage={currentPage} 
                                onPageChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                                isLoading={loading} 
                                totalItems={filteredProducts.length} 
                                itemsPerPage={ITEMS_PER_PAGE} 
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
      </main>
      <Footer />
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>
    </div>
  );
};

export default SearchResults;