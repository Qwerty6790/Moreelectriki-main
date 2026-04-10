
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
const CustomSearchIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20.9999 21L16.6499 16.65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CustomUserIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CustomCartIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 9H19L20 21H4L5 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CustomHeartIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CustomMapMarkerIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 22C16 17 20 13.4183 20 8.5C20 4.08172 16.4183 0.5 12 0.5C7.58172 0.5 4 4.08172 4 8.5C4 13.4183 8 17 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="8.5" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// --- ДАННЫЕ И ТИПЫ ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface SubCategory { title: string; link: string; }
interface Category { 
  title: string; 
  image?: string; 
  subcategories: SubCategory[]; 
}
interface NavLink { title: string; href: string; }
interface Product {
  _id: string; id?: string; name: string; price: number; article?: string;
  imageAddresses?: string[]; imageAddress?: string | string[]; images?: string[];
  slug?: string; source?: string;
}

// ДЕТАЛЬНЫЙ КАТАЛОГ СИНХРОНИЗИРОВАННЫЙ С CATALOG INDEX
const fullCatalogData: Category[] = [
  {
    title: 'Люстры',
    image: '/images/category/lustrycategory.webp', 
    subcategories: [
      { title: 'Все люстры', link: '/catalog/chandeliers' },
      { title: 'Подвесные люстры', link: '/catalog/chandeliers/pendant-chandeliers' },
      { title: 'Потолочные люстры', link: '/catalog/chandeliers/ceiling-chandeliers' },
      { title: 'Люстры на штанге', link: '/catalog/chandeliers/rod-chandeliers' },
      { title: 'Каскадные люстры', link: '/catalog/chandeliers/cascade-chandeliers' },
      { title: 'Хрустальные люстры', link: '/catalog/chandeliers/crystal-chandeliers' },
      { title: 'Люстры с латунью', link: `/catalog?category=${encodeURIComponent('латунь Люстра')}` }
    ]
  },
  {
    title: 'Светильники',
    image: '/images/category/trekovycategory.webp',
    subcategories: [
      { title: 'Все светильники', link: '/catalog/lights' },
      { title: 'Потолочные светильники', link: '/catalog/lights/ceiling-lights' },
      { title: 'Подвесные светильники', link: '/catalog/lights/pendant-lights' },
      { title: 'Настенные светильники', link: '/catalog/lights/wall-lights' },
      { title: 'Встраиваемые светильники', link: '/catalog/lights/recessed-lights' },
      { title: 'Накладные светильники', link: '/catalog/lights/surface-mounted-lights' },
      { title: 'Трековые светильники', link: '/catalog/lights/track-lights' },
      { title: 'Точечные светильники и споты', link: '/catalog/lights/spot-lights' }
    ]
  },
  {
    title: 'Бра',
    image: '/images/category/bracategory.jpg',
    subcategories: [
      { title: 'Все бра', link: '/catalog/wall-sconces' }
    ]
  },
  {
    title: 'Торшеры',
    image: 'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?q=80&w=600&auto=format&fit=crop',
    subcategories: [
        { title: 'Все торшеры', link: '/catalog/floor-lamps' }
    ]
  },
  {
    title: 'Настольные лампы',
    image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=600&auto=format&fit=crop',
    subcategories: [
        { title: 'Все настольные лампы', link: '/catalog/table-lamps' }
    ]
  },
  {
    title: 'Светодиодное освещение',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=600&auto=format&fit=crop',
    subcategories: [
      { title: 'Светодиодные ленты', link: '/catalog/led-strips' },
      { title: 'Профили для ленты', link: '/catalog/led-strip-profiles' },
      { title: 'Светодиодные лампы', link: `/catalog?category=${encodeURIComponent('Светодиодная лампа')}` }
    ]
  },
  {
    title: 'Уличные светильники',
    image: 'https://images.unsplash.com/photo-1620808083984-b0431be5d535?q=80&w=600&auto=format&fit=crop',
    subcategories: [
      { title: 'Все уличные светильники', link: '/catalog/outdoor-lights' },
      { title: 'Настенные уличные', link: '/catalog/outdoor-lights/outdoor-wall-lights' },
      { title: 'Грунтовые светильники', link: '/catalog/outdoor-lights/ground-lights' },
      { title: 'Ландшафтные светильники', link: '/catalog/outdoor-lights/landscape-lights' },
      { title: 'Парковые светильники', link: '/catalog/outdoor-lights/park-lights' }
    ]
  },
  {
    title: 'Комплектующие',
    image: '/images/category/podvesnycategory.jpeg',
    subcategories: [
      { title: 'Все комплектующие', link: '/catalog/accessories' },
      { title: 'Коннекторы', link: '/catalog/accessories/connectors' },
      { title: 'Шнуры', link: '/catalog/accessories/cords' },
      { title: 'Блоки питания', link: '/catalog/accessories/power-supplies' },
      { title: 'Патроны', link: '/catalog/accessories/lamp-holders' },
      { title: 'Крепления', link: '/catalog/accessories/mounting' },
      { title: 'Плафоны', link: '/catalog/accessories/lampshades' },
      { title: 'Контроллеры', link: '/catalog/accessories/controllers' }
    ]
  },
  {
    title: 'Электроустановочные изделия',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=600&auto=format&fit=crop',
    subcategories: [
      { title: 'Встраиваемые серии', link: '/ElektroustnovohneIzdely' },
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
  { title: 'Новинки', href: '/about' }, // Если есть отдельная страница, замените href
  { title: 'Партнерам', href: '/about' },
  { title: 'Где купить', href: '/map' },
  { title: 'Конфиденциальность', href: '/about' },
];

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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [activeCategoryIdx, setActiveCategoryIdx] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  const [cartCount, setCartCount] = useState(0);
  const [likedCount, setLikedCount] = useState(0);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;

        if (isSearchOpen && searchContainerRef.current && !searchContainerRef.current.contains(target as Node)) {
            setIsSearchOpen(false);
        }
        if (isCatalogOpen) {
            if (!target.closest('[data-catalog-toggle]') && !target.closest('[data-catalog-content]')) {
                 setIsCatalogOpen(false);
            }
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen, isCatalogOpen]);

  useEffect(() => {
    setIsCatalogOpen(false);
    setIsSearchOpen(false);
    setActiveCategoryIdx(null);
  }, [pathname]);

  useEffect(() => {
    if (!isCatalogOpen) {
       const timer = setTimeout(() => setActiveCategoryIdx(null), 200);
       return () => clearTimeout(timer);
    } else {
        if (window.innerWidth >= 1280 && activeCategoryIdx === null) {
            setActiveCategoryIdx(0);
        }
    }
  }, [isCatalogOpen]);

  // Блокировка скролла
  useEffect(() => {
    if ((isCatalogOpen || isSearchOpen) && window.innerWidth < 1280) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      if (!isSearchOpen) {
        setTimeout(() => setSearchQuery(''), 200); 
      }
    }
  }, [isCatalogOpen, isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

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

  const badgeStyle = "absolute -top-[6px] -right-[8px] w-[16px] h-[16px] bg-black text-white text-[10px] font-medium flex items-center justify-center rounded-full z-10";

  return (
    <>
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

            <div className="w-1/3 flex justify-center">
              <Link href="/" className="text-4xl lg:text-5xl font-serif text-[#37373F] tracking-widest uppercase hover:opacity-80 transition-opacity whitespace-nowrap">
                MOREELEKTRIKI
              </Link>
            </div>

            <div className="w-1/3 flex flex-col items-end text-right">
              <a href="tel:+79265522173" className="text-lg text-[#37373F] hover:text-black transition-colors font-medium">
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
            isScrolled ? "py-3" : "py-4 border-t border-gray-100 min-h-[60px]"
          )}>
            
            {/* Мобильный Лого + Гамбургер (Слева) */}
            <div className={clsx(
              "flex items-center gap-2 sm:gap-4 xl:hidden transition-all duration-300", 
              isSearchOpen ? "opacity-0 w-0 pointer-events-none overflow-hidden" : "opacity-100 flex-shrink-0"
            )}>
                <button 
                   data-catalog-toggle
                   onClick={() => setIsCatalogOpen(true)} 
                   className="p-1 -ml-1 text-[#37373F] hover:text-black"
                >
                    <MenuIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                </button>
                <Link href="/" className="text-[15px] xs:text-base sm:text-lg md:text-xl font-serif tracking-widest sm:tracking-[0.15em] text-[#37373F] whitespace-nowrap">
                    MOREELEKTRIKI
                </Link>
            </div>
            
            {/* Лого при скролле (Десктоп) */}
            <Link href="/" className={clsx(
              "hidden xl:block font-serif text-2xl tracking-widest text-[#37373F] transition-opacity duration-300 whitespace-nowrap mr-8", 
              isScrolled ? "opacity-100" : "opacity-0 w-0 overflow-hidden mr-0"
            )}>
               MOREELEKTRIKI
            </Link>

            {/* ЦЕНТРАЛЬНАЯ ЧАСТЬ (Навигация + Поиск) */}
            <div className="flex-1 flex justify-center items-center xl:relative mx-0 xl:mx-4">
              
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
                      className="text-[13px] font-normal text-gray-600 uppercase tracking-[0.1em] hover:text-black transition-colors whitespace-nowrap"
                    >
                      {link.title}
                    </Link>
                  ))}
              </nav>

              {/* УЛУЧШЕННЫЙ АДАПТИВНЫЙ ПОИСК */}
              <div 
                ref={searchContainerRef}
                className={clsx(
                  "z-[60] transition-all duration-300",
                  isSearchOpen 
                    ? "opacity-100 visible absolute top-0 left-0 w-full h-full bg-white flex items-center px-4 sm:px-6 xl:static xl:w-full xl:max-w-4xl xl:mx-auto xl:bg-transparent xl:px-0" 
                    : "opacity-0 invisible pointer-events-none absolute xl:static"
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
                      className="w-full bg-transparent border-b border-gray-300 py-2 sm:py-3 pl-8 pr-12 outline-none text-[#37373F] placeholder-gray-400 text-sm sm:text-base xl:text-lg uppercase font-light focus:border-black transition-colors rounded-none"
                    />
                    <button 
                       type="button" 
                       onClick={() => setIsSearchOpen(false)}
                       className="absolute right-0 text-gray-400 hover:text-black transition-colors p-2 sm:p-3"
                    >
                       <X size={20} />
                    </button>
                 </form>

                 {/* Dropdown Поиска */}
                 {(searchQuery || searchResults.length > 0) && (
                    <div className="absolute top-[calc(100%+1px)] left-0 w-full bg-white shadow-2xl xl:shadow-xl border-t xl:border border-gray-100 xl:rounded-b-lg overflow-y-auto max-h-[calc(100vh-70px)] xl:max-h-[70vh] custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
                       <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
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
                                           <div className="w-12 h-12 sm:w-10 sm:h-10 bg-white border border-gray-100 rounded flex-shrink-0 flex items-center justify-center p-0.5">
                                              {imgUrl ? <img src={imgUrl} alt={product.name} className="max-w-full max-h-full object-contain" /> : <CustomCartIcon className="w-5 h-5 sm:w-4 sm:h-4 text-gray-300"/>}
                                           </div>
                                           <div className="min-w-0">
                                              <p className="text-sm font-medium text-[#37373F] line-clamp-2 sm:line-clamp-1 group-hover:text-black transition-colors leading-tight mb-1">{product.name}</p>
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
                                            className="block text-sm text-[#37373F] hover:text-black py-2 sm:py-1 transition-colors"
                                         >
                                            {cat.title}
                                         </Link>
                                      </li>
                                   ))}
                                </ul>
                             ) : (
                                <div className="text-xs text-gray-500">Нет совпадений</div>
                             )}
                          </div>
                       </div>
                    </div>
                 )}
              </div>

            </div>

            {/* Иконки справа */}
            <div className={clsx(
              "flex items-center gap-3 sm:gap-5 flex-shrink-0 transition-all duration-300", 
              isSearchOpen ? "opacity-0 w-0 pointer-events-none xl:w-auto xl:opacity-100 xl:pointer-events-auto" : "opacity-100 visible"
            )}>
                <button 
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center gap-2 text-[#37373F] hover:text-black transition-colors group p-1 sm:p-0"
                >
                   <CustomSearchIcon className="w-5 h-5 sm:w-6 sm:h-6 xl:w-5 xl:h-5 text-[#37373F] group-hover:text-black transition-colors" />
                   <span className="hidden xl:inline text-[13px] font-normal uppercase tracking-widest text-[#37373F] group-hover:text-black">Поиск</span>
                </button>

                <div className="w-px h-4 bg-gray-200 hidden sm:block"></div>

                <div className="flex items-center gap-3 sm:gap-4">
                    <Link href="/liked" className="relative text-[#37373F] hover:text-black transition-colors p-1 sm:p-0">
                        <CustomHeartIcon className="w-6 h-6 sm:w-[26px] sm:h-[26px] xl:w-6 xl:h-6" />
                        {likedCount > 0 && <span className={badgeStyle}>{likedCount}</span>}
                    </Link>
                    <Link href="/cart" className="relative text-[#37373F] hover:text-black transition-colors p-1 sm:p-0">
                        <CustomCartIcon className="w-6 h-6 sm:w-[26px] sm:h-[26px] xl:w-6 xl:h-6" />
                        {cartCount > 0 && <span className={badgeStyle}>{cartCount}</span>}
                    </Link>
                </div>
            </div>
          </div>
          
          {/* --- DESKTOP ВЫПАДАЮЩИЙ КАТАЛОГ --- */}
          <div 
             ref={catalogContainerRef}
             data-catalog-content
             className={clsx(
                "hidden xl:block absolute left-0 right-0 top-full bg-white shadow-xl border-t border-gray-100 z-40 overflow-hidden transition-all duration-300 ease-in-out origin-top",
                isCatalogOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2 pointer-events-none"
             )}
          >
             <div className="flex min-h-[450px]">
                {/* Список категорий (Левая колонка) */}
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

                {/* Подкатегории в один столбец + Картинка справа */}
                <div className="w-3/4 p-8">
                   {activeCategoryIdx !== null && fullCatalogData[activeCategoryIdx] && (
                      <div className="animate-in fade-in duration-300 flex justify-between gap-12 h-full">
                         
                         {/* Левая часть: Подкатегории */}
                         <div className="flex-1">
                             <h3 className="text-2xl font-serif text-[#37373F] mb-8">
                                 {fullCatalogData[activeCategoryIdx].title}
                             </h3>
                             
                             <div className="grid grid-cols-2 gap-y-5 gap-x-8">
                                 {fullCatalogData[activeCategoryIdx].subcategories.map((sub, sIdx) => (
                                    <Link
                                       key={sIdx}
                                       href={sub.link}
                                       onClick={() => setIsCatalogOpen(false)}
                                       className="group flex items-center gap-3 text-[#37373F] hover:text-black transition-colors w-max"
                                    >
                                       <span className={clsx(
                                           "text-[15px] tracking-wide border-b border-transparent group-hover:border-black transition-colors pb-0.5",
                                           sIdx === 0 ? "font-bold uppercase text-black" : "font-medium"
                                       )}>
                                           {sub.title}
                                       </span>
                                    </Link>
                                 ))}
                             </div>
                         </div>

                         {/* Правая часть: Изображение категории */}
                         {fullCatalogData[activeCategoryIdx].image && (
                            <div className="w-[350px] xl:w-[450px] flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 relative group shadow-sm">
                                <img 
                                    src={fullCatalogData[activeCategoryIdx].image} 
                                    alt={fullCatalogData[activeCategoryIdx].title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                />
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </div>
                         )}
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
            data-catalog-content
            className={clsx(
              "fixed top-0 left-0 h-full z-[95] w-full sm:w-[420px] bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col",
              isCatalogOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            {/* ШАПКА МОБИЛЬНОГО МЕНЮ */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0 z-30 bg-white relative">
               <span className="text-xl font-serif text-[#37373F] uppercase tracking-widest">Меню</span>
               <button onClick={() => setIsCatalogOpen(false)} className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors">
                 <X size={24} strokeWidth={1.5} className="text-black" />
               </button>
            </div>

            {/* КОНТЕНТ МЕНЮ */}
            <div className="relative flex-1 overflow-hidden bg-white">
                
                {/* 1. ГЛАВНАЯ ПАНЕЛЬ */}
                <div 
                  className={clsx(
                    "absolute inset-0 overflow-y-auto custom-scrollbar p-4 pb-12 transition-transform duration-300 ease-in-out bg-white",
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
                                <span className="text-sm sm:text-base font-bold uppercase tracking-wide pr-4">{cat.title}</span>
                                {hasSubs && (
                                    <ChevronRight size={20} className="text-gray-400 group-hover:text-black transition-colors flex-shrink-0" />
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
                            href="/auth/register"
                            onClick={() => setIsCatalogOpen(false)}
                            className="flex items-center gap-3 text-[#37373F] font-bold uppercase tracking-wide mb-6 p-2 -ml-2 hover:bg-gray-50 rounded-lg hover:text-black transition-colors"
                        >
                            <CustomUserIcon className="w-5 h-5" />
                            <span className="text-sm sm:text-base">Личный кабинет</span>
                        </Link>

                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Информация</h3>
                        <ul className="space-y-3">
                            {navLinks.map((link, idx) => (
                            <li key={idx}>
                                <Link 
                                href={link.href}
                                onClick={() => setIsCatalogOpen(false)}
                                className="text-sm sm:text-base font-medium uppercase tracking-wide flex items-center justify-between py-1 text-[#37373F] hover:text-black transition-colors"
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
                     "absolute inset-0 overflow-y-auto custom-scrollbar bg-white transition-transform duration-300 ease-in-out z-20 flex flex-col pb-12",
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
                                    <span className="text-xs sm:text-sm font-medium uppercase tracking-wide">Назад</span>
                                </button>
                                <div className="h-5 w-px bg-gray-300 mx-1 sm:mx-2"></div>
                                <h3 className="text-sm sm:text-lg font-bold text-[#37373F] uppercase tracking-wide truncate">
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
                                                className={clsx(
                                                    "text-[#37373F] hover:text-black text-sm sm:text-base flex items-center justify-between py-3 group transition-colors pr-2",
                                                    sIdx === 0 ? "font-bold" : "font-medium"
                                                )}
                                            >
                                                <span className="pr-4 leading-tight">{sub.title}</span>
                                                <ArrowRight size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-black flex-shrink-0" />
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
            <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 pb-safe">
               <a href="tel:+79265522173" className="block text-base sm:text-lg font-bold text-[#37373F] mb-1 hover:text-black transition-colors">+7 926 552-21-73</a>
               <p className="text-[10px] sm:text-xs text-gray-400 uppercase">Ежедневно 9:00 - 21:00</p>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Header;
