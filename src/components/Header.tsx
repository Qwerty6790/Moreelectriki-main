
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Menu as MenuIcon, 
  X, 
  ChevronRight,
  ChevronLeft,
  ArrowRight
} from 'lucide-react';
import clsx from 'clsx';

// --- ИКОНКИ ---

// 1. Поиск
const CustomSearchIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20.9999 21L16.6499 16.65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// 2. Профиль
const CustomUserIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// 3. Корзина
const CustomCartIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 9H19L20 21H4L5 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// 4. Избранное
const CustomHeartIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// 5. Метка на карте
const CustomMapMarkerIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 22C16 17 20 13.4183 20 8.5C20 4.08172 16.4183 0.5 12 0.5C7.58172 0.5 4 4.08172 4 8.5C4 13.4183 8 17 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="8.5" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// --- ДАННЫЕ И ТИПЫ ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface SubCategory { title: string; link: string; }
interface Category { title: string; subcategories: SubCategory[]; }
interface NavLink { title: string; href: string; }
interface Product {
  _id: string; id?: string; name: string; price: number; article?: string;
  imageAddresses?: string[]; imageAddress?: string | string[]; images?: string[];
  slug?: string; source?: string;
}

const fullCatalogData: Category[] = [
  {
    title: 'Люстры',
    subcategories: [
      { title: 'Люстры потолочные', link: '/catalog/chandeliers/ceiling-chandeliers' },
      { title: 'Люстры подвесные', link: '/catalog/chandeliers/pendant-chandeliers' },
      { title: 'Люстры на штанге', link: '/catalog/chandeliers/rod-chandeliers' },
      { title: 'Люстры каскадные', link: '/catalog/chandeliers/cascade-chandeliers' }
    ]
  },
  {
    title: 'Трековые светильники',
    subcategories: [
      { title: 'Магнитные трековые', link: '/catalog/lights/magnit-track-lights' },
      { title: 'Умные трековые', link: '/catalog/lights/track-lights/smart' },
      { title: 'Уличные трековые', link: '/catalog/lights/track-lights/outdoor' }
    ]
  },
  {
    title: 'Подвесные светильники',
    subcategories: [
      { title: 'Встраиваемые светильники', link: '/catalog/lights/recessed-lights' },
      { title: 'Накладные светильники', link: '/catalog/lights/surface-mounted-light' }
    ]
  },
  {
    title: 'Бра',
    subcategories: [
      { title: 'Настенные светильники', link: '/catalog/lights/wall-lights' }
    ]
  },
  {
    title: 'Торшеры',
    subcategories: [
        { title: 'Все торшеры', link: '/catalog/floor-lamps' }
    ]
  },
  {
    title: 'Настольные лампы',
    subcategories: [
        { title: 'Все настольные лампы', link: '/catalog/table-lamps' }
    ]
  },
  {
    title: 'Светодиодные ленты',
    subcategories: [
      { title: 'Лампа и LED', link: '/catalog/led-lamp' },
      { title: 'Аксессуары', link: '/catalog/accessories' },
      { title: 'Профили для ленты', link: '/catalog/led-strip-profiles' }
    ]
  },
  {
    title: 'Уличные светильники',
    subcategories: [
      { title: 'Ландшафтные', link: '/catalog/outdoor-lights/landscape-lights' },
      { title: 'Парковые', link: '/catalog/outdoor-lights/park-lights' },
      { title: 'Грунтовые светильники', link: '/catalog/outdoor-lights/ground-lights' },
      { title: 'Настенно-уличные', link: '/catalog/outdoor-lights/outdoor-wall-lights' }
    ]
  },
  {
    title: 'Электроустановочные изделия',
    subcategories: [
      { title: 'Встраиваемые серии', link: '/ElektroustnovohneIzdely/Vstraivaemy-series' },
      { title: 'Серия Gallant', link: '/ElektroustnovohneIzdely/Werkel/Gallant' },
      { title: 'Серия Retro', link: '/ElektroustnovohneIzdely/Werkel/Retro' },
      { title: 'Серия Vintage', link: '/ElektroustnovohneIzdely/Werkel/Vintage' },
      { title: 'Влагозащитная серия', link: '/ElektroustnovohneIzdely/Donel/W55' },
      { title: 'Выдвижные лючки', link: '/ElektroustnovohneIzdely/VidviznoyBlock' }
    ]
  }
];

const navLinks: NavLink[] = [
  { title: 'О компании', href: '/about' },
  { title: 'Новинки', href: '/new' },
  { title: 'Партнерам', href: '/partners' },
  { title: 'Где купить', href: '/map' },
  { title: 'Конфиденциальность', href: '/privacy' },
];

// Утилиты
const urlCache = new Map<string, string>();
const normalizeUrl = (url: string): string => {
  if (urlCache.has(url)) return urlCache.get(url)!;
  const clean = url.replace(/^http:\/\//i, 'https://');
  urlCache.set(url, clean);
  return clean;
};

const getImgUrl = (p: Product): string | null => {
  let src: string | undefined;
  if (p.imageAddresses && p.imageAddresses.length > 0) src = p.imageAddresses[0];
  else if (p.imageAddress) src = Array.isArray(p.imageAddress) ? p.imageAddress[0] : p.imageAddress;
  else if (p.images && p.images.length > 0) src = p.images[0]; 
  return src ? normalizeUrl(src) : null;
};

const Header = () => {
  // --- UI STATE ---
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  
  const [activeCategoryIdx, setActiveCategoryIdx] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  // --- COUNTERS ---
  const [cartCount, setCartCount] = useState(0);
  const [likedCount, setLikedCount] = useState(0);

  // --- SEARCH LOGIC STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [foundCategories, setFoundCategories] = useState<{title: string, link: string}[]>([]);
  const [defaultProducts, setDefaultProducts] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const catalogContainerRef = useRef<HTMLDivElement>(null); 
  const searchAbortRef = useRef<AbortController | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // --- ЭФФЕКТЫ ---
  useEffect(() => {
    setIsClient(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    
    const updateCounters = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
        const liked = JSON.parse(localStorage.getItem('liked') || '{"products": []}');
        setCartCount(cart.products?.length || 0);
        setLikedCount(liked.products?.length || 0);
      } catch (e) { console.error(e); }
    };
    updateCounters();
    window.addEventListener('storage', updateCounters);
    window.addEventListener('cartUpdated', updateCounters);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', updateCounters);
      window.removeEventListener('cartUpdated', updateCounters);
    };
  }, []);

  // Закрытие при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (isSearchOpen && searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
            setIsSearchOpen(false);
        }
        if (isCatalogOpen && catalogContainerRef.current && !catalogContainerRef.current.contains(event.target as Node)) {
             const target = event.target as HTMLElement;
             if (!target.closest('[data-catalog-toggle]')) {
                 setIsCatalogOpen(false);
             }
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen, isCatalogOpen]);

  // Сброс при смене страницы
  useEffect(() => {
    setIsCatalogOpen(false);
    setIsSearchOpen(false);
    setActiveCategoryIdx(null);
  }, [pathname]);

  // Логика подкатегорий
  useEffect(() => {
    if (!isCatalogOpen) {
       const timer = setTimeout(() => setActiveCategoryIdx(null), 200);
       return () => clearTimeout(timer);
    } else {
        // Desktop: сразу открываем первую категорию
        if (window.innerWidth >= 1280 && activeCategoryIdx === null) {
            setActiveCategoryIdx(0);
        }
    }
  }, [isCatalogOpen]);

  // Блокировка скролла (Mobile)
  useEffect(() => {
    if (isCatalogOpen && window.innerWidth < 1280) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      if (!isSearchOpen) setSearchQuery('');
    }
  }, [isCatalogOpen, isSearchOpen]);

  // Фокус
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  // Дефолтные товары
  useEffect(() => {
    const fetchDefaultProducts = async () => {
        try {
            const keywords = ['Люстра', 'Бра', 'Светильник'];
            const randomIndexes: number[] = [];
            while(randomIndexes.length < 1) {
                const r = Math.floor(Math.random() * keywords.length);
                if(randomIndexes.indexOf(r) === -1) randomIndexes.push(r);
            }
            const promises = randomIndexes.map(idx => 
                fetch(`${API_URL}/api/products/search?name=${encodeURIComponent(keywords[idx])}&limit=5`).then(res => res.json())
            );
            const results = await Promise.all(promises);
            let combinedProducts: any[] = [];
            results.forEach(data => {
                if(data.products && Array.isArray(data.products)) combinedProducts = [...combinedProducts, ...data.products];
            });
            const uniqueProducts = Array.from(new Map(combinedProducts.map(item => [item._id || item.id, item])).values());
            setDefaultProducts(uniqueProducts.sort(() => 0.5 - Math.random()).slice(0, 4));
        } catch (error) { console.error("Error fetching defaults", error); }
    };
    if (isClient) fetchDefaultProducts();
  }, [isClient]);

  // Поиск
  useEffect(() => {
    const trimmedQuery = searchQuery.trim();
    const lowerQuery = trimmedQuery.toLowerCase();

    if (!trimmedQuery) {
        setFoundCategories([]);
    } else {
        const flatCategories: {title: string, link: string}[] = [];
        fullCatalogData.forEach(cat => {
            if (cat.title.toLowerCase().includes(lowerQuery)) flatCategories.push({ title: cat.title, link: cat.subcategories[0]?.link || '#' });
            cat.subcategories.forEach(sub => {
                if (sub.title.toLowerCase().includes(lowerQuery)) flatCategories.push(sub);
            });
        });
        setFoundCategories(flatCategories.slice(0, 5));
    }

    if (!trimmedQuery) { 
        setSearchResults(defaultProducts); 
        setIsSearching(false); 
        return; 
    }

    const id = setTimeout(async () => {
      if (searchAbortRef.current) searchAbortRef.current.abort();
      const ac = new AbortController();
      searchAbortRef.current = ac;
      setIsSearching(true);
      
      try {
        const resp = await fetch(`${API_URL}/api/products/search?name=${encodeURIComponent(trimmedQuery)}`, { signal: ac.signal });
        if (resp.ok) {
           const data = await resp.json();
           const rawProducts = data.products || [];
           const queryWords = lowerQuery.split(/\s+/).filter(word => word.length > 0);
           const strictFilteredProducts = rawProducts.filter((p: any) => {
               const name = p.name ? p.name.toString().toLowerCase() : '';
               const article = p.article ? p.article.toString().toLowerCase() : '';
               return queryWords.every(word => name.includes(word)) || article.startsWith(lowerQuery);
           });
           setSearchResults(strictFilteredProducts.slice(0, 6)); 
        }
      } catch (e: any) { if (e.name !== 'AbortError') console.error(e); } 
      finally { if (!searchAbortRef.current?.signal.aborted) setIsSearching(false); }
    }, 300);

    return () => clearTimeout(id);
  }, [searchQuery, defaultProducts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search/${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const handleCatalogToggle = () => {
      setIsCatalogOpen(!isCatalogOpen);
  };

  // ЧЕРНЫЙ БЕЙДЖ
  const badgeStyle = "absolute -top-[6px] -right-[8px] w-[16px] h-[16px] bg-black text-white text-[10px] font-medium flex items-center justify-center rounded-full z-10";

  return (
    <>
      {/* Плейсхолдер */}
      <div className={clsx("transition-all duration-300", isScrolled ? "h-[60px]" : "h-[140px] hidden xl:block")} />
      <div className="h-[60px] xl:hidden" /> 

      <header
        className={clsx(
          "fixed top-0 left-0 w-full z-50 bg-white transition-all duration-500 border-b border-gray-100",
          isScrolled ? "shadow-md" : ""
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 max-w-[1600px] relative">
          
          {/* ВЕРХНИЙ УРОВЕНЬ (Десктоп) */}
          <div 
            className={clsx(
              "hidden xl:flex items-center justify-between overflow-hidden transition-all duration-500 ease-in-out",
              isScrolled ? "max-h-0 opacity-0" : "max-h-[100px] opacity-100 py-6"
            )}
          >
            {/* Слоган */}
            <div className="w-1/3 flex flex-col items-start text-right">
              <a href="mailto:moreelektriki@gmail.com" className="text-lg text-[#37373F] hover:text-black transition-colors font-medium">
                moreelektriki@gmail.com
              </a>
              <div className="flex items-center gap-6 mt-1">
                <Link href="/map" className="flex items-center gap-2 text-[#37373F] hover:text-black group">
                  <CustomMapMarkerIcon className="w-4 h-4 mb-0.5" />
                  <span className="text-xs uppercase font-bold tracking-widest pt-0.5">Мы на карте</span>
                </Link>
              </div>
            </div>

            {/* Логотип */}
            <div className="w-1/3 flex justify-center">
              <Link href="/" className="text-5xl font-serif text-[#37373F] tracking-widest uppercase hover:opacity-80 transition-opacity">
                MOREELEKTRIKI
              </Link>
            </div>

            {/* Контакты */}
            <div className="w-1/3 flex flex-col items-end text-right">
              <a href="tel:+74952281733" className="text-lg text-[#37373F] hover:text-black transition-colors font-medium">
                +7 926 552-21-73
              </a>
              <div className="flex items-center gap-6 mt-1">
                <Link href="/auth/register" className="flex items-center gap-2 text-[#37373F] hover:text-black group">
                  <CustomUserIcon className="w-4 h-4" />
                  <span className="text-xs uppercase font-bold tracking-widest pt-0.5">Вход для дизайнеров</span>
                </Link>
              </div>
            </div>
          </div>

          {/* НИЖНИЙ УРОВЕНЬ */}
          <div className={clsx(
            "flex items-center justify-between transition-all duration-300 relative",
            isScrolled ? "py-3" : "py-4 border-t border-gray-100"
          )}>
            
            {/* Мобильный Лого + Гамбургер (Слева) */}
            <div className={clsx("flex items-center gap-4 xl:hidden", isSearchOpen ? "hidden" : "flex")}>
                <button onClick={() => setIsCatalogOpen(true)} className="p-1 -ml-1 text-[#37373F] hover:text-black">
                    <MenuIcon className="w-6 h-6" />
                </button>
                <Link href="/" className="text-xl font-serif tracking-widest text-[#37373F]">
                    MOREELEKTRIKI
                </Link>
            </div>
            
            {/* Лого при скролле (Десктоп) */}
            <Link href="/" className={clsx("hidden xl:block font-serif text-2xl tracking-widest text-[#37373F] transition-opacity duration-300 whitespace-nowrap mr-8", isScrolled ? "opacity-100" : "opacity-0 w-0 overflow-hidden mr-0")}>
               MOREELEKTRIKI
            </Link>

            {/* ЦЕНТРАЛЬНАЯ ЧАСТЬ */}
            <div className="flex-1 flex justify-center items-center relative mx-4">
              
              {/* Навигация (Десктоп) */}
              <nav className={clsx(
                 "hidden xl:flex items-center gap-8 transition-opacity duration-300 absolute w-full justify-center",
                 isSearchOpen ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
              )}>
                  <button 
                    data-catalog-toggle
                    onClick={handleCatalogToggle}
                    className={clsx(
                      "text-[13px] font-bold uppercase tracking-[0.1em] transition-colors flex items-center gap-2",
                      isCatalogOpen ? "text-black" : "text-[#37373F] hover:text-black"
                    )}
                  >
                    {/* Смена иконки: Меню (полоски) <-> X (закрыть) */}
                    {isCatalogOpen ? (
                        <X size={16} className="animate-in fade-in zoom-in duration-200" />
                    ) : (
                        <MenuIcon size={16} className="animate-in fade-in zoom-in duration-200" />
                    )}
                    Каталог
                  </button>
                  
                  {navLinks.map((link, idx) => (
                    <Link
                      key={idx}
                      href={link.href}
                      className="text-[13px] font-normal text-gray-600 uppercase tracking-[0.1em] hover:text-black transition-colors"
                    >
                      {link.title}
                    </Link>
                  ))}
              </nav>

              {/* Поиск */}
              <div 
                ref={searchContainerRef}
                className={clsx(
                  "w-full max-w-4xl relative z-50 transition-all duration-300",
                  isSearchOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none absolute"
                )}
              >
                 <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
                    <CustomSearchIcon className="w-5 h-5 text-gray-400 absolute left-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Поиск по каталогу..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent border-b border-gray-300 py-2 pl-8 pr-8 outline-none text-[#37373F] placeholder-gray-400 text-lg uppercase font-light focus:border-black transition-colors"
                    />
                    <button 
                       type="button" 
                       onClick={() => setIsSearchOpen(false)}
                       className="absolute right-0 text-gray-400 hover:text-black transition-colors"
                    >
                       <X size={20} />
                    </button>
                 </form>

                 {/* Dropdown Поиска */}
                 {(searchQuery || searchResults.length > 0) && (
                    <div className="absolute top-full left-0 w-full bg-white shadow-xl border border-gray-100 rounded-b-lg mt-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                       <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-gray-100">
                          {/* Товары */}
                          <div className="md:col-span-2 p-4">
                             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                                {isSearching ? "Ищем..." : searchQuery ? "Товары" : "Рекомендуем"}
                             </h3>
                             {searchResults.length > 0 ? (
                                <div className="space-y-2">
                                   {searchResults.map((product) => {
                                      const imgUrl = getImgUrl(product);
                                      const productLink = product.slug 
                                          ? `/products/${product.slug}` 
                                          : `/products/${product.source || 'local'}/${product.article || product.id}`;
                                      return (
                                        <Link 
                                          key={product._id || product.id} 
                                          href={productLink}
                                          onClick={() => setIsSearchOpen(false)}
                                          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg group transition-colors"
                                        >
                                           <div className="w-10 h-10 bg-white border border-gray-100 rounded flex-shrink-0 flex items-center justify-center p-0.5">
                                              {imgUrl ? <img src={imgUrl} alt={product.name} className="max-w-full max-h-full object-contain" /> : <CustomCartIcon className="w-4 h-4 text-gray-300"/>}
                                           </div>
                                           <div className="min-w-0">
                                              <p className="text-sm font-medium text-[#37373F] line-clamp-1 group-hover:text-black transition-colors">{product.name}</p>
                                              <p className="text-xs text-gray-500">{Number(product.price).toLocaleString('ru-RU')} ₽</p>
                                           </div>
                                        </Link>
                                      )
                                   })}
                                </div>
                             ) : (
                                <div className="text-sm text-gray-400 py-2">Ничего не найдено</div>
                             )}
                          </div>
                          
                          {/* Категории */}
                          <div className="p-4 bg-gray-50/50">
                             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Категории</h3>
                             {foundCategories.length > 0 ? (
                                <ul className="space-y-1">
                                   {foundCategories.map((cat, idx) => (
                                      <li key={idx}>
                                         <Link 
                                            href={cat.link}
                                            onClick={() => setIsSearchOpen(false)}
                                            className="block text-sm text-[#37373F] hover:text-black py-1 transition-colors"
                                         >
                                            {cat.title}
                                         </Link>
                                      </li>
                                   ))}
                                </ul>
                             ) : (
                                <div className="text-xs text-gray-400">Нет совпадений</div>
                             )}
                          </div>
                       </div>
                    </div>
                 )}
              </div>

            </div>

            {/* Иконки справа */}
            <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
                <button 
                  onClick={() => setIsSearchOpen(true)}
                  className={clsx(
                    "flex items-center gap-2 text-gray-400 hover:text-black transition-colors group",
                    isSearchOpen ? "invisible pointer-events-none" : "visible"
                  )}
                >
                   <CustomSearchIcon className="w-5 h-5 text-[#37373F] group-hover:text-black transition-colors" />
                   <span className="hidden xl:inline text-[13px] font-normal uppercase tracking-widest text-[#37373F] group-hover:text-black">Поиск</span>
                </button>

                <div className="w-px h-4 bg-gray-200 hidden sm:block"></div>

                <div className="flex items-center gap-4">
                    <Link href="/liked" className="relative text-[#37373F] hover:text-black transition-colors">
                        <CustomHeartIcon className="w-6 h-6" />
                        {likedCount > 0 && <span className={badgeStyle}>{likedCount}</span>}
                    </Link>
                    <Link href="/cart" className="relative text-[#37373F] hover:text-black transition-colors">
                        <CustomCartIcon className="w-6 h-6" />
                        {cartCount > 0 && <span className={badgeStyle}>{cartCount}</span>}
                    </Link>
                </div>
            </div>
          </div>
          
          {/* --- DESKTOP ВЫПАДАЮЩИЙ КАТАЛОГ --- */}
          <div 
             ref={catalogContainerRef}
             className={clsx(
                "hidden xl:block absolute left-0 right-0 top-full bg-white shadow-xl border-t border-gray-100 z-40 overflow-hidden transition-all duration-300 ease-in-out origin-top",
                isCatalogOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2 pointer-events-none"
             )}
          >
             <div className="flex min-h-[400px]">
                {/* Список категорий */}
                <div className="w-1/4 border-r border-gray-100 bg-gray-50/30">
                   <ul className="py-4">
                      {fullCatalogData.map((cat, idx) => (
                         <li key={idx}>
                            <button
                               onMouseEnter={() => setActiveCategoryIdx(idx)}
                               className={clsx(
                                  "w-full text-left px-8 py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-between transition-colors",
                                  activeCategoryIdx === idx 
                                    ? "bg-white text-black border-l-4 border-black" 
                                    : "text-[#37373F] hover:text-black hover:bg-white border-l-4 border-transparent"
                               )}
                            >
                               {cat.title}
                               <ChevronRight size={16} className={clsx("transition-opacity", activeCategoryIdx === idx ? "opacity-100" : "opacity-0")} />
                            </button>
                         </li>
                      ))}
                   </ul>
                </div>

                {/* Подкатегории */}
                <div className="w-3/4 p-8">
                   {activeCategoryIdx !== null && fullCatalogData[activeCategoryIdx] && (
                      <div className="animate-in fade-in duration-300">
                         <h3 className="text-2xl font-serif text-[#37373F] mb-6">
                             {fullCatalogData[activeCategoryIdx].title}
                         </h3>
                         
                         <div className="grid grid-cols-3 gap-x-8 gap-y-4">
                             {fullCatalogData[activeCategoryIdx].subcategories.map((sub, sIdx) => (
                                <Link
                                   key={sIdx}
                                   href={sub.link}
                                   onClick={() => setIsCatalogOpen(false)}
                                   className="group flex items-start gap-2 text-[#37373F] hover:text-black transition-colors"
                                >
                                   <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 group-hover:bg-black transition-colors"></div>
                                   <span className="text-base font-medium">{sub.title}</span>
                                </Link>
                             ))}
                         </div>
                      </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* --- MOBILE SIDE DRAWER (xl:hidden) --- */}
      {isClient && createPortal(
        <div className="xl:hidden">
          <div 
            className={clsx(
              "fixed inset-0 z-[90] bg-black/60 transition-opacity duration-300 backdrop-blur-sm",
              isCatalogOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
            )}
            onClick={() => setIsCatalogOpen(false)}
          />

          <div 
            className={clsx(
              "fixed top-0 left-0 h-full z-[95] w-full sm:w-[420px] bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col",
              isCatalogOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            {/* ШАПКА МОБИЛЬНОГО МЕНЮ */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0 z-30 bg-white relative">
               <span className="text-xl font-serif text-[#37373F] uppercase tracking-widest">Меню</span>
               <button onClick={() => setIsCatalogOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                 <X size={24} strokeWidth={1.5} className="text-black" />
               </button>
            </div>

            {/* КОНТЕНТ МЕНЮ */}
            <div className="relative flex-1 overflow-hidden bg-white">
                
                {/* 1. ГЛАВНАЯ ПАНЕЛЬ */}
                <div 
                  className={clsx(
                    "absolute inset-0  custom-scrollbar p-4 transition-transform duration-300 ease-in-out bg-white",
                    activeCategoryIdx !== null ? "-translate-x-[20%] opacity-0 pointer-events-none" : "translate-x-0 opacity-100"
                  )}
                >
                    {/* КАТАЛОГ */}
                    <div className="mb-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Каталог</h3>
                        <ul className="space-y-1">
                        {fullCatalogData.map((cat, idx) => {
                            const hasSubs = cat.subcategories.length > 0;
                            return (
                            <li key={idx} className="border-b border-gray-50 last:border-0">
                                <div 
                                className="flex items-center justify-between py-3 cursor-pointer group select-none hover:text-black text-[#37373F] transition-colors"
                                onClick={() => hasSubs ? setActiveCategoryIdx(idx) : null}
                                >
                                <span className="text-base font-bold uppercase tracking-wide">{cat.title}</span>
                                {hasSubs && (
                                    <ChevronRight size={20} className="text-gray-400 group-hover:text-black transition-colors" />
                                )}
                                </div>
                            </li>
                            );
                        })}
                        </ul>
                    </div>

                    {/* ДОП. ССЫЛКИ */}
                    <div className="mb-8 border-t border-gray-100 pt-6">
                        <Link 
                            href="/profile"
                            onClick={() => setIsCatalogOpen(false)}
                            className="flex items-center gap-3 text-[#37373F] font-bold uppercase tracking-wide mb-6 p-2 -ml-2 hover:bg-gray-50 rounded-lg hover:text-black transition-colors"
                        >
                            <CustomUserIcon className="w-5 h-5" />
                            <span>Личный кабинет</span>
                        </Link>

                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Информация</h3>
                        <ul className="space-y-3">
                            {navLinks.map((link, idx) => (
                            <li key={idx}>
                                <Link 
                                href={link.href}
                                onClick={() => setIsCatalogOpen(false)}
                                className="text-base font-medium uppercase tracking-wide flex items-center justify-between py-1 text-[#37373F] hover:text-black transition-colors"
                                >
                                {link.title}
                                <ChevronRight size={16} className="text-gray-300" />
                                </Link>
                            </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* 2. ПАНЕЛЬ ПОДКАТЕГОРИЙ */}
                <div 
                   className={clsx(
                     "absolute inset-0 overflow-y-auto custom-scrollbar bg-white transition-transform duration-300 ease-in-out z-20 flex flex-col",
                     activeCategoryIdx !== null ? "translate-x-0" : "translate-x-full"
                   )}
                >
                    {activeCategoryIdx !== null && fullCatalogData[activeCategoryIdx] && (
                        <>
                            <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-100 flex items-center gap-2">
                                <button 
                                    onClick={() => setActiveCategoryIdx(null)}
                                    className="flex items-center gap-1 text-gray-500 hover:text-black transition-colors -ml-2 p-2"
                                >
                                    <ChevronLeft size={20} />
                                    <span className="text-sm font-medium uppercase tracking-wide">Назад</span>
                                </button>
                                <div className="h-5 w-px bg-gray-300 mx-2"></div>
                                <h3 className="text-lg font-bold text-[#37373F] uppercase tracking-wide truncate">
                                    {fullCatalogData[activeCategoryIdx].title}
                                </h3>
                            </div>

                            <div className="p-4">
                                <ul className="space-y-2">
                                    {fullCatalogData[activeCategoryIdx].subcategories.map((sub, sIdx) => (
                                        <li key={sIdx} className="border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                                            <Link 
                                                href={sub.link}
                                                onClick={() => setIsCatalogOpen(false)}
                                                className="text-[#37373F] hover:text-black text-base font-medium flex items-center justify-between py-3 group transition-colors"
                                            >
                                                <span>{sub.title}</span>
                                                <ArrowRight size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-black" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    )}
                </div>

            </div>
            
            {/* ФУТЕР МОБИЛЬНОГО МЕНЮ */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
               <a href="tel:+74952281733" className="block text-lg font-bold text-[#37373F] mb-1 hover:text-black transition-colors">+7 495 228-17-33</a>
               <p className="text-xs text-gray-400 uppercase">Ежедневно 9:00 - 21:00</p>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Header;