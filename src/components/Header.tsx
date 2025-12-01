
"use client";
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, User, Menu as MenuIcon, X, ShoppingBasket, Heart, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import clsx from 'clsx';
import CatalogOfProductSearch from './Catalogofsearch';

// Интерфейс для товара (используется в поиске)
interface Product {
  _id: string;
  name: string;
  price: number;
  imageAddresses: string | string[];
}

// Кастомный хук для поиска товаров по API
const useSearchProducts = (query: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!query || query.length < 2) {
        setProducts([]);
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products/search`,
          { params: { name: query, limit: 6 } }
        );
        setProducts(response.data.products || []);
      } catch (error) {
        console.error('Ошибка при поиске товаров:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return { products, loading };
};

const fullCatalogData = [
    {
      title: 'Люстры',
      subcategories: [
        { title: 'Подвесные люстры', link: '/osveheny/chandeliers/pendant-chandeliers' },
        { title: 'Потолочные люстры', link: '/osveheny/chandeliers/ceiling-chandeliers' },
        { title: 'Каскадные люстры', link: '/osveheny/chandeliers/cascade-chandeliers' },
        { title: 'Хрустальные люстры', link: '/osveheny/chandeliers/crystal-chandeliers' },
        { title: 'Современные люстры', link: '/osveheny?category=Люстра&page=1' }
      ]
    },
    {
      title: 'Светильники',
      subcategories: [
        { title: 'Встраиваемые светильники', link: '/osveheny?category=Светильник&page=1' },
        { title: 'Накладные светильники', link: '/osveheny?category=Светильник&page=1' },
        { title: 'Трековые светильники', link: '/osveheny?category=Светильник&page=1' },
        { title: 'Точечные светильники', link: '/osveheny?category=Светильник&page=1' }
      ]
    },
    {
      title: 'Торшеры',
      subcategories: [
        { title: 'Классические торшеры', link: '/osveheny?category=Торшер&page=1' },
        { title: 'Современные торшеры', link: '/osveheny?category=Торшер&page=1' },
        { title: 'Торшеры с регулировкой', link: '/osveheny?category=Торшер&page=1' }
      ]
    },
    {
      title: 'Бра',
      subcategories: [
        { title: 'Настенные бра', link: '/osveheny?category=Бра&page=1' },
        { title: 'Светодиодные бра', link: '/osveheny?category=Бра&page=1' },
        { title: 'Классические бра', link: '/osveheny?category=Бра&page=1' },
        { title: 'Современные бра', link: '/osveheny?category=Бра&page=1' }
      ]
    },
    {
      title: 'Уличное освещение',
      subcategories: [
        { title: 'Настенные уличные светильники', link: '/osveheny?category=Уличный светильник&page=1' },
        { title: 'Столбы освещения', link: '/osveheny?category=Уличный светильник&page=1' },
        { title: 'Грунтовые светильники', link: '/osveheny?category=Уличный светильник&page=1' },
        { title: 'Прожекторы', link: '/osveheny?category=Уличный светильник&page=1' }
      ]
    },
    {
      title: 'Розетки и выключатели',
      subcategories: [
        { title: 'Встраиваемые серии', link: '/osveheny?category=Светодиодная лампа&page=1' },
        { title: 'Накладные серии', link: '/osveheny?category=Светодиодная лампа&page=1' },
        { title: 'Выдвижные серии', link: '/osveheny?category=Светодиодная лампа&page=1' },
        { title: 'Серия Vintage', link: '/osveheny?category=Светодиодная лампа&page=1' },
        { title: 'Серия Retro', link: '/osveheny?category=Светодиодная лампа&page=1' }
      ]
    },
    { title: 'Модульное оборудование', subcategories: [] },
    { title: 'Умный дом', subcategories: [] },
    { title: 'Электротовары', subcategories: [] },
    { title: 'Товары для дома', subcategories: [] },
    { title: 'Праздничное освещение', subcategories: [] },
];

const catalogCategories = [
 
  ...fullCatalogData
];

const staticLinks = [
  { title: 'Акции', link: '/about' },
  { title: 'О компании', link: '/about' },
  { title: 'Блог', link: '/about' },
  { title: 'Контакты', link: '/about' },
];

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCatalogMenuOpen, setIsCatalogMenuOpen] = useState(false);
  const [isCatalogDrawerMounted, setIsCatalogDrawerMounted] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [activeAccordionItem, setActiveAccordionItem] = useState<number | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);
  const [likedCount, setLikedCount] = useState<number>(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const router = useRouter();
  const { products, loading } = useSearchProducts(searchQuery);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const recalcCounters = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
        setCartCount(Array.isArray(cart.products) ? cart.products.length : 0);
        
        const liked = JSON.parse(localStorage.getItem('liked') || '{"products": []}');
        setLikedCount(Array.isArray(liked.products) ? liked.products.length : 0);
      } catch {
        setCartCount(0);
        setLikedCount(0);
      }
    };

    recalcCounters();
    window.addEventListener('storage', recalcCounters);
    window.addEventListener('cart:updated', recalcCounters);
    window.addEventListener('liked:updated', recalcCounters);

    return () => {
      window.removeEventListener('storage', recalcCounters);
      window.removeEventListener('cart:updated', recalcCounters);
      window.removeEventListener('liked:updated', recalcCounters);
    };
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const encodedSearchQuery = encodeURIComponent(searchQuery);
      router.push(`/search/${encodedSearchQuery}?query=${encodedSearchQuery}`);
      setIsSearchOpen(false);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleCatalogToggle = () => {
    if (isCatalogMenuOpen) {
      setIsCatalogMenuOpen(false);
    } else {
      setActiveAccordionItem(null);
      setIsCatalogDrawerMounted(true);
      setTimeout(() => setIsCatalogMenuOpen(true), 20);
    }
  };
  
  const handleAccordionToggle = (index: number) => {
    setActiveAccordionItem(prevIndex => (prevIndex === index ? null : index));
  };
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let timer: any;
    if (isCatalogMenuOpen) {
      document.body.style.overflow = 'hidden';
      setIsCatalogDrawerMounted(true);
    } else {
      document.body.style.overflow = '';
      timer = setTimeout(() => setIsCatalogDrawerMounted(false), 300);
    }
    return () => clearTimeout(timer);
  }, [isCatalogMenuOpen]);

  return (
    <div suppressHydrationWarning>
      <style jsx global>{`
        .hide-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        .hide-scrollbar::-webkit-scrollbar { display: none !important; }
      `}</style>
      
      <div className="h-20" /> 

      <header className={clsx(
        "fixed top-0 left-0 right-0 z-50 text-white border-b border-white/20 font-light transition-colors duration-300",
        isScrolled ? "bg-black/60 backdrop-blur-md" : "bg-black/40 backdrop-blur-sm"
      )}>
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-20">
            
            <div className="flex items-center gap-6">
              <button 
                onClick={handleCatalogToggle} 
                className="flex items-center gap-3 border border-white/40 px-3 py-1.5 hover:bg-white/10 transition-colors"
                aria-label="Открыть каталог"
              >
                <MenuIcon size={22} strokeWidth={1.5} />
              </button>
              <nav className="hidden lg:flex items-center gap-8 uppercase tracking-widest text-1xl font-medium">
                <a href="/about" className="hover:text-white/70 transition-colors">Доставка</a>
                <a href="/about" className="hover:text-white/70 transition-colors">О бренде</a>
                <a href="/about" className="hover:text-white/70 transition-colors">О продукте</a>
              </nav>
            </div>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <a href="/" className="text-[20px] -ml-20 md:text-4xl font-bold uppercase tracking-widest md:tracking-[0.3em]">
                MORELEKTRIKI
              </a>
            </div>

            <div className="flex items-center gap-4 sm:gap-5">
              <button onClick={() => setIsSearchOpen(true)} className="flex items-center gap-2 hover:text-white/70 transition-colors">
                <Search size={24} strokeWidth={1.5} />
                <span className="hidden lg:inline uppercase tracking-widest text-1xl">Поиск</span>
              </button>
              <a href="/liked" className="relative hover:text-white/70 transition-colors">
                <Heart size={24} strokeWidth={1.5} />
                {likedCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white text-black rounded-full flex items-center justify-center text-[10px] font-bold">{likedCount}</span>}
              </a>
              <a href="" className="hidden sm:inline-block  hover:text-white/70 transition-colors">
                <User className='text-neutral-500' size={24} strokeWidth={1.5} />
              </a>
              <a href="/cart" className="relative flex items-center gap-2 border border-white/40 px-3 py-1.5 hover:bg-white/10 transition-colors">
                 <ShoppingBasket size={24} strokeWidth={1.5} />
                {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white text-black rounded-full flex items-center justify-center text-[10px] font-bold">{cartCount}</span>}
              </a>
            </div>

          </div>
        </div>
      </header>

      {isClient && isSearchOpen && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-start justify-center pt-24 sm:pt-32 transition-opacity duration-300 ease-out bg-black/50 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)}>
          <div className="relative w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="backdrop-blur-sm rounded-lg shadow-2xl p-4 text-white">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  placeholder="Поиск по каталогу..."
                  className="w-full py-2 bg-transparent outline-none text-lg"
                  autoFocus
                />
                <button onClick={() => setIsSearchOpen(false)} className="text-white tracking-wide border p-3 hover:text-neutral-300">
                   Назад
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {isClient && isCatalogDrawerMounted && createPortal(
        <div className={"fixed inset-0 z-[99999] overflow-hidden"}>
          <div
            className={"absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 " + (isCatalogMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')}
            onClick={() => setIsCatalogMenuOpen(false)}
          />

          <div className={"relative w-full h-full transform transition-transform duration-300 " + (isCatalogMenuOpen ? 'translate-x-0' : '-translate-x-full')}>
            <div className="flex h-full">
                <aside className="w-full max-w-md bg-white text-black shadow-2xl flex-shrink-0">
                  <div className="flex flex-col h-full">
                    
                    <div className="flex gap-6 items-center justify-end p-4">
                      <button onClick={() => setIsSearchOpen(true)} className="flex font-bold items-center gap-2 hover:text-black/20 transition-colors">
                <Search size={24} strokeWidth={1.5} />
                <span className="hidden lg:inline uppercase tracking-widest text-1xl">Поиск</span>
              </button>
                      <button onClick={() => setIsCatalogMenuOpen(false)} className="flex items-center gap-2 text-3xl font-medium text-black border border-black px-6 p-4 hover:text-black">
                        X
                      </button>
                    </div>
                    <nav className="flex-grow overflow-y-auto hide-scrollbar px-2">
                      <div className="flex flex-col gap-1 py-4">
                        {catalogCategories.map((item, idx) => (
                          <div key={idx}>
                            {/* --- ИЗМЕНЕНИЕ: Убрана стрелка, текст отцентрирован и увеличен --- */}
                            <div
                              onClick={() => item.subcategories?.length && handleAccordionToggle(idx)}
                              className={clsx(
                                'flex items-center justify-center w-full text-left p-4 rounded-md', // justify-between заменен на justify-center
                                item.subcategories?.length ? 'cursor-pointer hover:bg-gray-50' : 'opacity-50'
                              )}
                            >
                              <span className="font-medium text-lg">{item.title}</span> {/* Добавлен класс text-lg */}
                            </div>

                            {item.subcategories && item.subcategories.length > 0 && (
                              <div className={clsx('overflow-hidden transition-all duration-300 ease-in-out', activeAccordionItem === idx ? 'max-h-[500px]' : 'max-h-0')}>
                                {/* --- ИЗМЕНЕНИЕ: подкатегории также отцентрированы --- */}
                                <div className="pt-1 pb-2">
                                  <div className="flex flex-col items-center gap-1">
                                    {item.subcategories.map((sub, sidx) => (
                                      <a
                                        key={sidx}
                                        href={sub.link.replace('/osveheny', '/catalog')}
                                        className="block py-1.5 text-gray-700 hover:text-black"
                                        onClick={() => setIsCatalogMenuOpen(false)}
                                      >
                                        {sub.title}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <hr className="my-4 mx-4" />
                      <div className="flex flex-col gap-1 px-2 pb-4">
                        {staticLinks.map((link, idx) => (
                          // --- ИЗМЕНЕНИЕ: статичные ссылки отцентрированы и увеличены ---
                          <a
                              key={idx}
                              href={link.link}
                              className="block p-4 font-medium text-black rounded-md hover:bg-gray-50 text-center text-lg" // Добавлены text-center и text-lg
                              onClick={() => setIsCatalogMenuOpen(false)}
                            >
                              {link.title}
                            </a>
                        ))}
                      </div>
                    </nav>
                  </div>
                </aside>
                 <div className="flex-grow relative hidden lg:block" onClick={() => setIsCatalogMenuOpen(false)}>
                </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Header;