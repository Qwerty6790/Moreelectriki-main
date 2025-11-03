
"use client";
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, User, Menu as MenuIcon, X, ShoppingBasket, ChevronDown } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';
import clsx from 'clsx';
import CatalogOfProductSearch from './Catalogofsearch';
import { FaSearch } from 'react-icons/fa';

// Интерфейс для товара (используется в поиске)
interface Product {
  _id: string;
  name: string;
  price: number;
  imageAddresses: string | string[];
  imageAddress?: string | string[];
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

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileCatalogOpen, setIsMobileCatalogOpen] = useState(false);

  const [isCatalogMenuOpen, setIsCatalogMenuOpen] = useState(false);
  const [isCatalogDrawerMounted, setIsCatalogDrawerMounted] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  // Определение баннера и стилей текста в зависимости от пути
  const bannerPath = (() => {
    if (!pathname) return null;
    if (pathname === '/') return '/images/banners/bannersabout.webp';
    if (pathname.startsWith('/osveheny')) return '/images/banners/bannercatalog.webp';
    if (pathname.startsWith('/catalog')) return '/images/banners/bannercatalog.webp';
    if (pathname.startsWith('/ElektroustnovohneIzdely/Werkel')) return '/images/series/werkel.webp';
    if (pathname.startsWith('/ElektroustnovohneIzdely/Voltum')) return '/images/banners/bannersVoltum.jpg';
    if (pathname.startsWith('/ElektroustnovohneIzdely')) return '/images/banners/bannerselektroustnovohneIzdely.png';
    return null;
  })();

  const isWerkelColorPage = pathname?.startsWith('/ElektroustnovohneIzdely/') && pathname !== '/ElektroustnovohneIzdely/';
  const isExactElektroustnovohneIzdely = pathname === '/ElektroustnovohneIzdely';
  const headerText = (isWerkelColorPage || isExactElektroustnovohneIzdely) ? 'text-black' : (bannerPath ? 'text-white' : 'text-black');

  const catalogButtonRef = useRef<HTMLButtonElement | null>(null);
  const stickyCatalogButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileNavRef = useRef<HTMLDivElement | null>(null);
  const [catalogTopOffset, setCatalogTopOffset] = useState<number>(64);
  const [isStickyHeaderVisible, setIsStickyHeaderVisible] = useState<boolean>(false);
  const [cartCount, setCartCount] = useState<number>(0);
  const [likedCount, setLikedCount] = useState<number>(0);

  // State для мини-уведомлений
  const [isMiniCartOpen, setIsMiniCartOpen] = useState<boolean>(false);
  const [miniCartItem, setMiniCartItem] = useState<{ name?: string; price?: number; imageUrl?: string } | null>(null);
  const miniCartTimerRef = useRef<any>(null);
  const [isMiniLikedOpen, setIsMiniLikedOpen] = useState<boolean>(false);
  const [miniLikedItem, setMiniLikedItem] = useState<{ name?: string; imageUrl?: string } | null>(null);

  // Хук для поиска товаров
  const { products, loading } = useSearchProducts(searchQuery);

  // Инициализация и подписки на обновления корзины и избранного
  useEffect(() => {
    const recalcCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
        return Array.isArray(cart.products) ? cart.products.length : 0;
      } catch { return 0; }
    };
    const recalcLikedCount = () => {
      try {
        const liked = JSON.parse(localStorage.getItem('liked') || '{"products": []}');
        return Array.isArray(liked.products) ? liked.products.length : 0;
      } catch { return 0; }
    };

    setCartCount(recalcCartCount());
    setLikedCount(recalcLikedCount());

    const onCartUpdated = () => setCartCount(recalcCartCount());
    const onLikedUpdated = () => setLikedCount(recalcLikedCount());
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'cart' || e.key === 'cartCount') onCartUpdated();
      if (e.key === 'liked') onLikedUpdated();
    };

    const onItemAdded = (e: CustomEvent) => {
      setMiniCartItem({ name: e.detail?.name, price: e.detail?.price, imageUrl: e.detail?.imageUrl });
      setIsMiniCartOpen(true);
      if (miniCartTimerRef.current) clearTimeout(miniCartTimerRef.current);
      miniCartTimerRef.current = setTimeout(() => setIsMiniCartOpen(false), 3000);
    };
    const onLikedAdded = (e: CustomEvent) => {
      setMiniLikedItem({ name: e.detail?.name, imageUrl: e.detail?.imageUrl });
      setIsMiniLikedOpen(true);
      if (miniCartTimerRef.current) clearTimeout(miniCartTimerRef.current);
      miniCartTimerRef.current = setTimeout(() => setIsMiniLikedOpen(false), 3000);
    };

    window.addEventListener('cart:updated', onCartUpdated);
    window.addEventListener('liked:updated', onLikedUpdated);
    window.addEventListener('storage', onStorage);
    window.addEventListener('cart:itemAdded', onItemAdded as EventListener);
    window.addEventListener('liked:itemAdded', onLikedAdded as EventListener);

    return () => {
      window.removeEventListener('cart:updated', onCartUpdated);
      window.removeEventListener('liked:updated', onLikedUpdated);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('cart:itemAdded', onItemAdded as EventListener);
      window.removeEventListener('liked:itemAdded', onLikedAdded as EventListener);
      if (miniCartTimerRef.current) clearTimeout(miniCartTimerRef.current);
    };
  }, []);

  // Обработчик клика по товару из выпадающего списка
  const handleProductClick = (query: string) => {
    if (query.trim()) {
      const encodedSearchQuery = encodeURIComponent(query);
      router.push(`/search/${encodedSearchQuery}?query=${encodedSearchQuery}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  // Данные для каталога
  const catalogData = {
    lighting: [
        {
          title: 'Люстры',
          image: '/images/category/stikerlustry.png',
          link: '/osveheny/chandeliers/pendant-chandeliers',
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
          link: '/osveheny?category=Светильник',
          image: '/images/category/stikersvetlinki.png',
          subcategories: [
            { title: 'Встраиваемые светильники', link: '/osveheny?category=Светильник&page=1' },
            { title: 'Накладные светильники', link: '/osveheny?category=Светильник&page=1' },
            { title: 'Трековые светильники', link: '/osveheny?category=Светильник&page=1' },
            { title: 'Точечные светильники', link: '/osveheny?category=Светильник&page=1' }
          ]
        },
        {
          title: 'Торшеры',
          link: '/osveheny?category=Торшер',
          image: '/images/category/stikertorher.png',
          subcategories: [
            { title: 'Классические торшеры', link: '/osveheny?category=Торшер&page=1' },
            { title: 'Современные торшеры', link: '/osveheny?category=Торшер&page=1' },
            { title: 'Торшеры с регулировкой', link: '/osveheny?category=Торшер&page=1' }
          ]
        },
        {
          title: 'Бра',
          link: '/osveheny?category=Бра',
          image: '/images/category/stikerbra.png',
          subcategories: [
            { title: 'Настенные бра', link: '/osveheny?category=Бра&page=1' },
            { title: 'Светодиодные бра', link: '/osveheny?category=Бра&page=1' },
            { title: 'Классические бра', link: '/osveheny?category=Бра&page=1' },
            { title: 'Современные бра', link: '/osveheny?category=Бра&page=1' }
          ]
        },
        {
          title: 'Уличные светильники',
          link: '/catalog/outdoor-lights',
          image: '/images/category/stikerylihnoeosveheny.png',
          subcategories: [
            { title: 'Настенные уличные светильники', link: '/osveheny?category=Уличный светильник&page=1' },
            { title: 'Столбы освещения', link: '/osveheny?category=Уличный светильник&page=1' },
            { title: 'Грунтовые светильники', link: '/osveheny?category=Уличный светильник&page=1' },
            { title: 'Прожекторы', link: '/osveheny?category=Уличный светильник&page=1' }
          ]
        },
        {
          title: 'Светодиодные ленты',
          link: '/osveheny?category=Светодиодная лента',
          image: '/images/category/stikersvetodionylenta.png',
          subcategories: [
            { title: 'Гибкий неон', link: '/osveheny?category=Светодиодная лампа&page=1' },
            { title: 'Светодоидные ленты', link: '/osveheny?category=Светодиодная лампа&page=1' },
          ]
        },
        {
          title: 'Светодиодные лампы',
          link: '/osveheny?category=Светодиодная лампа',
          image: '/images/category/stikerlampaled.png',
          subcategories: [
            { title: 'Свтоидодные лампы', link: '/osveheny?category=Светодиодная лампа&page=1' },

          ]
        },
        {
          title: 'Розетки и выключатели',
          link: '/osveheny?category=Светодиодная лампа',
          image: '/images/category/stikerelektroustnovohneIzdely.png',
          subcategories: [
            { title: 'Встраиваемые серии', link: '/osveheny?category=Светодиодная лампа&page=1' },
            { title: 'Накладные серии', link: '/osveheny?category=Светодиодная лампа&page=1' },
            { title: 'Выдвижные серии', link: '/osveheny?category=Светодиодная лампа&page=1' },
            { title: 'Серия Vintage', link: '/osveheny?category=Светодиодная лампа&page=1' },
            { title: 'Серия Retro', link: '/osveheny?category=Светодиодная лампа&page=1' }
          ]
        }
      ],
  };

  // Закрытие мобильного меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu && !mobileMenu.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Блокировка скролла при открытом мобильном меню
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  // Обработчик поиска и нажатия Enter
  const handleSearch = () => {
    if (searchQuery.trim()) {
      handleProductClick(searchQuery);
    }
  };
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Закрытие поиска по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (searchQuery) setSearchQuery('');
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen || searchQuery) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSearchOpen, searchQuery]);


  // Логика для меню каталога
  const updateCatalogMenuTop = (buttonEl: HTMLElement | null) => {
    if (buttonEl) {
      const rect = buttonEl.getBoundingClientRect();
      setCatalogTopOffset(Math.max(rect.bottom + 8, 56));
    } else {
      setCatalogTopOffset(64);
    }
  };

  const openCatalogDrawer = () => {
    setIsCatalogDrawerMounted(true);
    setTimeout(() => {
      setIsCatalogMenuOpen(true);
      document.documentElement.classList.add('hide-vertical-scrollbar');
      document.body.classList.add('hide-vertical-scrollbar');
    }, 20);
  };

  // Переключатель для меню каталога
  const handleCatalogToggle = () => {
    const buttonRef = isStickyHeaderVisible ? stickyCatalogButtonRef.current : catalogButtonRef.current;
    if (isCatalogMenuOpen) {
      setIsCatalogMenuOpen(false);
    } else {
      updateCatalogMenuTop(buttonRef);
      openCatalogDrawer();
    }
  };
  
  // Определение, что компонент смонтирован на клиенте
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Закрытие каталога при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const catalogMenu = document.getElementById('catalog-dropdown');
      const catalogButton = isStickyHeaderVisible ? stickyCatalogButtonRef.current : catalogButtonRef.current;

      if (catalogMenu && catalogButton &&
        !catalogMenu.contains(event.target as Node) &&
        !catalogButton.contains(event.target as Node)) {
        setIsCatalogMenuOpen(false);
      }
    };
    if (isCatalogMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCatalogMenuOpen, isStickyHeaderVisible]);

  // Монтирование/размонтирование drawer-а для анимации
  useEffect(() => {
    let t: any;
    if (isCatalogMenuOpen) {
      setIsCatalogDrawerMounted(true);
      document.documentElement.classList.add('hide-vertical-scrollbar');
      document.body.classList.add('hide-vertical-scrollbar');
    } else {
      t = setTimeout(() => {
        setIsCatalogDrawerMounted(false);
        document.documentElement.classList.remove('hide-vertical-scrollbar');
        document.body.classList.remove('hide-vertical-scrollbar');
      }, 340);
    }
    return () => clearTimeout(t);
  }, [isCatalogMenuOpen]);

  // Показ/скрытие "липкого" хедера при скролле
  useEffect(() => {
    const onScroll = () => {
      setIsStickyHeaderVisible(window.scrollY > 140);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Обновление позиции каталога при скролле/ресайзе
  useEffect(() => {
    const recalc = () => {
      if (!isCatalogMenuOpen) return;
      updateCatalogMenuTop(isStickyHeaderVisible ? stickyCatalogButtonRef.current : catalogButtonRef.current);
    };
    window.addEventListener('resize', recalc);
    window.addEventListener('scroll', recalc, { passive: true });
    return () => {
      window.removeEventListener('resize', recalc);
      window.removeEventListener('scroll', recalc);
    };
  }, [isCatalogMenuOpen, isStickyHeaderVisible]);


  return (
    <div suppressHydrationWarning>
      {/* Мини-уведомления */}
      {isMiniCartOpen && (
        <div className="fixed top-16 right-3 z-[10060] bg-white shadow-2xl rounded-xl border border-black/10 p-3 sm:p-4 flex items-center gap-3 animate-[searchModalFadeIn_0.3s_ease-out]">
          {miniCartItem?.imageUrl ? (
            <img src={miniCartItem.imageUrl} alt="" className="w-10 h-10 rounded object-contain bg-gray-50" />
          ) : (
            <div className="w-10 h-10 rounded bg-gray-100" />
          )}
          <div>
            <div className="text-sm font-medium text-black truncate">{miniCartItem?.name || 'Товар добавлен в корзину'}</div>
            {typeof miniCartItem?.price === 'number' && (
              <div className="text-xs text-black/70 mt-0.5">{new Intl.NumberFormat('ru-RU').format(miniCartItem.price)} ₽</div>
            )}
            <a href="/cart" className="mt-2 inline-flex text-xs text-black underline">Перейти в корзину</a>
          </div>
          <button className="ml-1 text-black/60 hover:text-black" onClick={() => setIsMiniCartOpen(false)} aria-label="Закрыть">×</button>
        </div>
      )}
      {isMiniLikedOpen && (
        <div className="fixed top-28 right-3 z-[10060] bg-white shadow-2xl rounded-xl border border-black/10 p-3 sm:p-4 flex items-center gap-3 animate-[searchModalFadeIn_0.3s_ease-out]">
          {miniLikedItem?.imageUrl ? (
            <img src={miniLikedItem.imageUrl} alt="" className="w-10 h-10 rounded object-contain bg-gray-50" />
          ) : (
            <div className="w-10 h-10 rounded bg-gray-100" />
          )}
          <div>
            <div className="text-sm font-medium text-black truncate">{miniLikedItem?.name || 'Добавлено в избранное'}</div>
            <a href="/liked" className="mt-2 inline-flex text-xs text-black underline">Перейти в избранное</a>
          </div>
          <button className="ml-1 text-black/60 hover:text-black" onClick={() => setIsMiniLikedOpen(false)} aria-label="Закрыть">×</button>
        </div>
      )}
      <style jsx global>{`
        /* Стили анимаций и скрытия скроллбаров */
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        .menu-content-enter { animation: slideInLeft 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
        .hide-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        .hide-scrollbar::-webkit-scrollbar { display: none !important; }
        .hide-vertical-scrollbar { overflow-y: hidden !important; }
        @keyframes searchModalFadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        .catalog-panel { transition: transform 240ms cubic-bezier(0.2,0.8,0.2,1), opacity 220ms ease; will-change: transform, opacity; }
        .catalog-panel-closed { transform: translateY(-8px) scaleY(0.98); opacity: 0; }
        .catalog-panel-open { transform: translateY(0) scaleY(1); opacity: 1; }
      `}</style>

      <div className="w-full relative">
        {bannerPath && (
          <div className="absolute inset-0 -z-10">
            <img src={bannerPath} alt="banner" className="w-full h-56 object-cover" />
            <div className="absolute inset-0 bg-white"></div>
          </div>
        )}
        <header
          className={clsx(
            'fixed top-0 left-0 right-0 z-[9998] w-full transform transition-transform duration-300',
            bannerPath ? 'bg-transparent' : 'bg-white',
            isStickyHeaderVisible ? '-translate-y-full' : 'translate-y-0'
          )}
        >
          {/* Оверлей для затемнения, когда каталог открыт */}
          {isCatalogMenuOpen && <div className="fixed inset-0 bg-black/40 z-[9999]" />}

          {/* Верхняя панель */}
          <div className={clsx('hidden md:block', headerText + '/80', bannerPath ? 'bg-transparent' : 'bg-white')}>
            <div className="max-w-[1550px] mx-auto px-3 md:px-4">
              <div className="flex h-8 items-center text-[13px] gap-4">
                <a href="tel:+79265522173" className="hover:text-neutral-200 text-[20px] font-bold"> 8(926) 552-21-73</a>
                <a href="#call" className="hover:text-neutral-200 font-bold text-[20px]">Заказать звонок</a>
                <div className="ml-auto flex items-center gap-6">
                  <span className="hidden lg:inline font-bold text-[20px]">г. Москва, 25 километр, ТК Конструктор</span>
                  <a href="#" className="pointer-events-none cursor-not-allowed opacity-40 text-[20px] font-bold">Для дизайнеров</a>
                </div>
              </div>
            </div>
          </div>

          {/* Основной ряд хедера */}
          <div className={clsx(headerText, bannerPath ? 'bg-transparent' : 'bg-white ')}>
            <div className="max-w-[1550px] mx-auto px-3 md:px-4">
              <div className="flex items-center h-14 md:h-14 gap-3">
                <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden mr-3" aria-label="Открыть меню">
                  <MenuIcon className="w-6 h-6" />
                </button>
                <a href="/" style={{ letterSpacing: '0.2em' }} className={clsx(headerText, 'sm:text-4xl text-2xl font-bold tracking-widest flex-none')}>
                  MOREELEKTRIKI
                </a>
                <div className="flex-1 hidden md:flex items-center">
                  <div className="relative w-full">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleSearchKeyPress}
                      placeholder="Поиск"
                      className={clsx(
                        'w-full pl-10 pr-4 py-2 rounded-md outline-none text-sm placeholder:text-white/70',
                        bannerPath ? 'bg-black/40 ' : 'bg-black/60 '
                      )}
                    />
                    {searchQuery && (
                      <div className="absolute left-0 mt-2 rounded-xl shadow-lg overflow-y-auto z-[1005] w-full max-h-90">
                        <CatalogOfProductSearch products={(products || []).slice(0, 4) as any} viewMode="list" isLoading={loading} showActions={false} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-auto">
                  <a href="/liked" className={clsx('relative', headerText + '/90', bannerPath ? 'hover:text-white' : 'hover:text-black')}>
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 21s-6.2-4.3-9.3-8.1C-0.1 8.5 2.3 3 7 3c2.1 0 3.6 1.2 5 2.7C13.4 4.2 14.9 3 17 3c4.7 0 7.1 5.5 4.3 9.9C18.2 16.7 12 21 12 21z" />
                    </svg>
                    {likedCount > 0 && <span className="absolute -top-[26%] -right-2 w-5 h-5 backdrop-blur-sm bg-white/10 rounded-full flex items-center justify-center text-[10px]">{likedCount}</span>}
                  </a>
                  <a href="/cart" className={clsx('relative', headerText + '/90', bannerPath ? 'hover:text-white' : 'hover:text-black')}>
                    <ShoppingBasket className="w-5 h-5" />
                    {cartCount > 0 && <span className="absolute -top-2 -right-2 w-5 h-5 backdrop-blur-sm bg-white/10 rounded-full flex items-center justify-center text-[10px]">{cartCount}</span>}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Навигация */}
          <div className={clsx('hidden md:block', headerText, bannerPath ? 'bg-transparent' : 'bg-white')}>
            <div className="max-w-[1550px] mx-auto px-7 md:px-1">
              <nav className="flex h-10 items-center justify-between text-[15px] tracking-widest  flex-wrap gap-2">
                <button
                  ref={catalogButtonRef}
                  onClick={handleCatalogToggle}
                  className='font-bold cursor-pointer z-[10000] flex py-2 px-2 text-sm relative'
                >
                  <span className={clsx(isCatalogMenuOpen ? 'z-[10002]' : '')}>Меню</span>
                </button>
                {/* Остальные кнопки заменены на обычные ссылки */}
                <a href="/about" className='font-bold py-1 px-2 text-sm'>Шоурум</a>
                <a href="/about" className='font-bold py-1 px-2 text-sm'>О нас</a>
                <a href="/about" className='font-bold py-1 px-2 text-sm'>Как купить</a>
                <a href="/about" className='font-bold py-1 px-2 text-sm'>Контакты</a>
              </nav>

              {/* Мобильная навигация */}
              <div className={clsx('md:hidden', bannerPath ? 'text-white bg-black/40' : 'text-black bg-white/40')}>
                <div className="relative">
                  <div ref={mobileNavRef} className="px-3 py-2 overflow-x-auto hide-scrollbar">
                    <div className={clsx('flex items-center gap-5 text-[13px] tracking-widest  whitespace-nowrap', headerText)}>
                      <button onClick={handleCatalogToggle} className="hover:text-white/90">Меню</button>
                      <a href="/about" className="hover:text-white/90">Акции</a>
                      <a href="/about" className="hover:text-white/90">Шоурум</a>
                      <a href="/about" className="hover:text-white/90">Проекты</a>
                      <a href="/about" className="hover:text-white/90">Блог</a>
                      <a href="/about" className="hover:text-white/90">Как купить</a>
                      <a href="/about" className="hover:text-white/90">Контакты</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Мобильное меню (портал) */}
          {isClient && createPortal(
            <>
              <div
                className={clsx("fixed inset-0 z-[9998] bg-black/60 transition-opacity duration-300", isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none")}
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <div
                id="mobile-menu"
                className={clsx("fixed top-0 left-0 bottom-0 z-[9999] w-4/5 max-w-sm transform transition-transform duration-300 ease-in-out", isMobileMenuOpen ? "translate-x-0" : "-translate-x-full")}
              >
                <div className="relative w-full h-full bg-white shadow-lg">
                  <div className={clsx("relative z-10 p-4 h-full flex flex-col text-black", isMobileMenuOpen && "menu-content-enter")}>
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                      <a href="/" style={{ letterSpacing: '0.2em' }} className="text-black text-xl font-semibold tracking-widest ">
                        MOREELEKTRIKI
                      </a>
                      <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
                        <X className="w-6 h-6 text-black" />
                      </button>
                    </div>
                    <div className="mt-4 flex-grow overflow-y-auto hide-scrollbar">
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => setIsMobileCatalogOpen((v) => !v)}
                          className="flex items-center justify-between py-3 px-4 text-base font-medium text-black rounded-lg hover:bg-gray-100"
                        >
                          <span>Каталог</span>
                          <span className={clsx("transition-transform duration-300", isMobileCatalogOpen && "rotate-180")}>
                            <ChevronDown size={20} />
                          </span>
                        </button>
                        <div className={clsx("pl-2 pr-1 space-y-1 overflow-hidden transition-all duration-500 ease-in-out", isMobileCatalogOpen ? 'max-h-[1500px] opacity-100 mt-2' : 'max-h-0 opacity-0')}>
                          {catalogData.lighting.map((item, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-lg p-2">
                              <div className="w-full flex items-center py-2 px-2 text-black">
                                <span className="text-md font-bold">{item.title}</span>
                              </div>
                              <div className="px-2 pb-2 space-y-2">
                                {item.subcategories?.slice(0, 8).map((sub, sidx) => (
                                  <a key={sidx} href={sub.link} className="block text-sm text-gray-800 py-2 px-3 rounded-lg hover:bg-gray-200" onClick={() => setIsMobileMenuOpen(false)}>
                                    {sub.title}
                                  </a>
                                ))}
                                <a href={item.link} className="block text-sm font-semibold text-black py-2 px-3 rounded-lg bg-gray-200 hover:bg-gray-300" onClick={() => setIsMobileMenuOpen(false)}>
                                  Смотреть все
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-gray-200 pt-3 space-y-1">
                           <a href="/about" className="block text-base text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-100">Шоурум</a>
                           <a href="/about" className="block text-base text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-100">Акции</a>
                           <a href="/about" className="block text-base text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-100">Проекты</a>
                           <a href="/about" className="block text-base text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-100">Контакты</a>
                           <a href="#" className="block text-base opacity-40 py-3 px-4 rounded-lg cursor-not-allowed">Для дизайнеров</a>
                        </div>
                      </div>
                    </div>
                    <div className="mt-auto border-t border-gray-200 pt-4">
                      <div className="flex flex-col space-y-3">
                        <a href="tel:89265522173" className="text-black text-base">8(926) 552-21-73</a>
                        <a href="mailto:info@donel.su" className="text-black text-base">moreelektriki@gmail.com</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>,
            document.body
          )}
        </header>
      </div>

      {/* "Липкий" хедер при скролле */}
      <div className={clsx('fixed top-0 left-0 right-0 z-[10050] transform transition-transform duration-300', isStickyHeaderVisible ? 'translate-y-0' : '-translate-y-full')}>
        <div className="bg-black text-white/95">
          <div className="max-w-[1550px] mx-auto px-3 md:px-4">
            <div className="flex justify-between items-center h-12 md:h-14">
              <div className="flex items-center gap-3 pr-2 sm:gap-6 sm:pr-4">
                <button ref={stickyCatalogButtonRef} onClick={handleCatalogToggle} className="inline-flex items-center text-white/90 hover:text-white text-[13px] tracking-widest uppercase">
                  <MenuIcon className="w-6 h-6" />
                </button>
                <a href="/" style={{ letterSpacing: '0.1em' }} className="text-white text-2xl font-semibold tracking-widest uppercase">MOREELEKTRIKI</a>
                <nav className="hidden sm:flex items-center gap-2 md:gap-3 text-[13px] tracking-widest uppercase">
                  <a href="/about" className="hover:text-white py-1 px-2 text-sm">Шоурум</a>
                  <a href="/about" className="hover:text-white py-1 px-2 text-sm">Акции</a>
                  <a href="/about" className="hover:text-white py-1 px-2 text-sm">Проекты</a>
                  <a href="/about" className="hover:text-white py-1 px-2 text-sm">Контакты</a>
                </nav>
              </div>
              <button onClick={() => setIsSearchOpen(true)} className={clsx('md:hidden ml-3', headerText + '/90', bannerPath ? 'hover:text-white' : 'hover:text-black')} aria-label="Открыть поиск">
                <Search className="w-5 h-5" />
              </button>
              <div className="flex items-center pl-2 sm:pl-4 gap-3 sm:gap-6">
                <div className="hidden md:flex flex-col leading-tight mr-2">
                  <a href="tel:+79265522173" className="text-white text-[18px] font-bold tracking-wide hover:underline">8 (926) 552-21-73</a>
                  <a href="#call" className="text-[11px] text-white/80 uppercase tracking-widest">заказать звонок</a>
                </div>
                <a href="#" className="hidden sm:inline opacity-40 text-[13px] tracking-widest uppercase cursor-not-allowed">Для дизайнеров</a>
                <a href="/auth/register" className="sm:hidden tracking-widest uppercase cursor-not-allowed opacity-40" aria-label="Для дизайнеров">
                  <User className="w-5 h-5" />
                </a>
                <a href="/liked" className="hidden sm:inline-flex relative text-white/80 hover:text-white">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 21s-6.2-4.3-9.3-8.1C-0.1 8.5 2.3 3 7 3c2.1 0 3.6 1.2 5 2.7C13.4 4.2 14.9 3 17 3c4.7 0 7.1 5.5 4.3 9.9C18.2 16.7 12 21 12 21z" /></svg>
                  {likedCount > 0 && <span className="absolute -top-[26%] -right-2 w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-[10px]">{likedCount}</span>}
                </a>
                <a href="/cart" className="relative text-white/80 hover:text-white">
                  <ShoppingBasket className="w-5 h-5" />
                  {cartCount > 0 && <span className="absolute -top-2 -right-2 w-5 h-5 bg-white/10 text-white rounded-full flex items-center justify-center text-[10px]">{cartCount}</span>}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Полноэкранный поиск */}
      {isClient && (isSearchOpen || searchQuery) && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center transition-opacity duration-400 ease-out">
          <div className="absolute inset-0 bg-white" onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }} />
          <div className="relative w-full max-w-5xl mx-4">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-black/60" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  placeholder="Поиск"
                  className="w-full pl-1 pr-3 py-3 text-black bg-white/30 rounded-xl outline-none text-lg"
                  autoFocus
                />
                <button onClick={() => handleSearch()} className="ml-3 px-4 py-2 rounded-lg bg-black text-white">Найти</button>
              </div>
              <div className="mt-4">
                <CatalogOfProductSearch products={(products || []).slice(0, 4) as any} viewMode="list" isLoading={loading} showActions={false} />
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Портал для выпадающего меню каталога */}
      {isClient && isCatalogDrawerMounted && createPortal(
        <div className={"fixed inset-0 z-[99999]"}>
          {(() => {
            const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
            if (!isDesktop) {
              return (
                <>
                  <div
                    className={"absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 " + (isCatalogMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')}
                    onClick={() => setIsCatalogMenuOpen(false)}
                  />
                  <aside className={"absolute left-0 top-0 bottom-0 bg-white shadow-2xl transform transition-transform duration-300 " + (isCatalogMenuOpen ? 'translate-x-0' : '-translate-x-full')}>
                    {/* Мобильная версия каталога */}
                    <div className="flex h-full">
                       <nav className="w-96 bg-white overflow-y-auto hide-scrollbar" style={{ maxHeight: '100vh' }}>
                        <div className="flex items-center justify-between px-4 py-3">
                          <h3 className="text-4xl font-semibold text-black">Каталог</h3>
                          <button onClick={() => setIsCatalogMenuOpen(false)} className="p-2 text-black text-1xl leading-none">×</button>
                        </div>
                        <div className="flex flex-col">
                          {catalogData.lighting.map((item, idx) => (
                            <div key={idx} className=" last:border-b-0">
                              <div className={"w-full flex items-center justify-between px-4 py-4"}>
                                <span className="flex items-center gap-3">
                                  <span className="text-[19px] font-bold text-black">{item.title}</span>
                                </span>
                              </div>

                              <div className={'px-4 pb-3 pt-0 bg-white/100'}>
                                <div className="flex flex-col font-bold text-sm text-black/80">
                                  {item.subcategories?.map((sub, sidx) => (
                                    <a
                                      key={sidx}
                                      href={sub.link.replace('/osveheny', '/catalog')}
                                      className="py-2 hover:underline"
                                      onClick={() => setIsCatalogMenuOpen(false)}
                                    >
                                      {sub.title}
                                    </a>
                                  ))}
                                </div>
                                <a
                                  href={item.link.replace('/osveheny', '/catalog')}
                                  className="mt-2 inline-block text-sm font-semibold text-black py-2"
                                  onClick={() => setIsCatalogMenuOpen(false)}
                                >
                                  Смотреть все
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </nav>

                      <div className="flex-1 relative h-screen">
                        <video
                          src="/images/banners/trekovysvet.mp4"
                          className="absolute inset-0 w-full h-full object-cover"
                          autoPlay
                          muted
                          playsInline
                        />
                      </div>
                    </div>
                  </aside>
                </>
              );
            }

            // Десктопная версия каталога
            return (
              <aside
                id="catalog-dropdown"
                style={{ top: catalogTopOffset, left: 0, right: 0 }}
                className={"absolute z-[10002] transition-all duration-200 " + (isCatalogMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}
              >
                <div className={clsx('bg-white shadow-2xl overflow-hidden w-full catalog-panel', isCatalogMenuOpen ? 'catalog-panel-open' : 'catalog-panel-closed')} style={{ display: 'flex', height: 'calc(100vh - ' + catalogTopOffset + 'px)' }}>
                  <nav className="w-96 overflow-y-auto hide-scrollbar" style={{ maxHeight: '90vh' }}>
                    <div className="flex items-center justify-between px-4 py-3">
                      <h3 className="text-5xl font-semibold text-black">Каталог</h3>
                      <button onClick={() => setIsCatalogMenuOpen(false)} className="p-2 text-black text-3xl leading-none">×</button>
                    </div>
                    <div className="flex flex-col">
                      {catalogData.lighting.map((item, idx) => (
                        <div key={idx}>
                          <div className={"w-full flex items-center justify-between px-4 py-4"}>
                            <span className="text-[19px] font-bold text-black">{item.title}</span>
                          </div>
                          <div className={'px-4 pb-3 pt-0'}>
                            <div className="flex flex-col font-bold text-sm text-black/80">
                              {item.subcategories?.map((sub, sidx) => (
                                <a key={sidx} href={sub.link.replace('/osveheny', '/catalog')} className="py-2 hover:underline" onClick={() => setIsCatalogMenuOpen(false)}>
                                  {sub.title}
                                </a>
                              ))}
                            </div>
                            <a href={item.link.replace('/osveheny', '/catalog')} className="mt-2 inline-block text-sm font-semibold text-black py-2" onClick={() => setIsCatalogMenuOpen(false)}>
                              Смотреть все
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </nav>
                  <div className="flex-1 relative block h-full">
                    <video
                      src="/images/banners/trekovysvet.mp4"
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      playsInline
                    />
                  </div>
                </div>
              </aside>
            );
          })()}
        </div>,
        document.body
      )}
    </div>
  );
};

export default Header;