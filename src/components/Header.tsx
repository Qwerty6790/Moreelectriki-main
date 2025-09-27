"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, User, Menu as MenuIcon, X, ShoppingCart, ChevronDown, ShoppingBagIcon, LucideShoppingBag, ShoppingCartIcon, ShoppingBasket, SearchCheckIcon, SearchSlash, SearchCodeIcon, SearchXIcon, SearchX } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import clsx from 'clsx';
import Image from 'next/image';
import SearchResults from '@/pages/search/[qwery]';
import CatalogOfProductSearch from './Catalogofsearch';
import { SearchParamsContext } from 'next/dist/shared/lib/hooks-client-context.shared-runtime';
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

// (Интерфейсы каталога убраны для простоты структуры данных)

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileCatalogOpen, setIsMobileCatalogOpen] = useState(false);
  
  const [isCatalogMenuOpen, setIsCatalogMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const brandsButtonRef = useRef<HTMLButtonElement | null>(null);
  const aboutButtonRef = useRef<HTMLButtonElement | null>(null);
  const deliveryButtonRef = useRef<HTMLButtonElement | null>(null);
  const howToBuyButtonRef = useRef<HTMLButtonElement | null>(null);
  const contactsButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isCatalogDrawerMounted, setIsCatalogDrawerMounted] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const [isHeaderDimmed, setIsHeaderDimmed] = useState(false);
  // Brands menu removed
  const router = useRouter();
  const pathname = usePathname();
  const isHome =
    pathname === '/' ||
    pathname?.startsWith('/ElektroustnovohneIzdely') ||
    pathname?.startsWith('/catalog') ||
    pathname?.startsWith('/osveheny');
  const bannerPath = (() => {
    if (!pathname) return null;
    if (pathname === '/') return '/images/banners/bannersabout.webp';
    else if (pathname.startsWith('/osveheny')) return '/images/banners/bannercatalog.webp';
    else if (pathname.startsWith('/catalog')) return '/images/banners/bannercatalog.webp';
    else if (pathname.startsWith('/ElektroustnovohneIzdely/Werkel')) return '/images/series/werkel.webp';
    else if (pathname.startsWith('/ElektroustnovohneIzdely/Voltum')) return '/images/banners/bannersVoltum.jpg';
    else if (pathname.startsWith('/ElektroustnovohneIzdely')) return '/images/banners/bannerselektroustnovohneIzdely.png';
    return null;
  })();

  const isVoltum = pathname?.startsWith('/ElektroustnovohneIzdely/Voltum');
  const isWerkel = pathname?.startsWith('/ElektroustnovohneIzdely/Werkel');
  // Определяем страницы цветов Werkel (имеют путь /ElektroustnovohneIzdely/Werkel/<color>)
  const isWerkelColorPage = pathname?.startsWith('/ElektroustnovohneIzdely/') && pathname !== '/ElektroustnovohneIzdely/';
  // Для страниц цветов Werkel и для точного пути /ElektroustnovohneIzdely текст заголовка должен быть чёрным.
  // Во всех остальных случаях — белый при наличии баннера, иначе чёрный
  const isExactElektroustnovohneIzdely = pathname === '/ElektroustnovohneIzdely';
  const headerText = (isWerkelColorPage || isExactElektroustnovohneIzdely) ? 'text-black' : (bannerPath ? 'text-white' : 'text-black');
  const catalogButtonRef = useRef<HTMLButtonElement | null>(null);
  const stickyCatalogButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileCatalogButtonRef = useRef<HTMLButtonElement | null>(null);
  const catalogHoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuHoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentMenuButtonRef = useRef<HTMLElement | null>(null);
  const mobileNavRef = useRef<HTMLDivElement | null>(null);
  const [catalogTopOffset, setCatalogTopOffset] = useState<number>(64);
  const [isStickyHeaderVisible, setIsStickyHeaderVisible] = useState<boolean>(false);
  const [cartCount, setCartCount] = useState<number>(0);
  const [likedCount, setLikedCount] = useState<number>(0);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState<boolean>(false);
  const [miniCartItem, setMiniCartItem] = useState<{ name?: string; price?: number; imageUrl?: string } | null>(null);
  const miniCartTimerRef = useRef<any>(null);
  const [isMiniLikedOpen, setIsMiniLikedOpen] = useState<boolean>(false);
  const [miniLikedItem, setMiniLikedItem] = useState<{ name?: string; imageUrl?: string } | null>(null);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  
  // Хук для поиска товаров
  const { products, loading } = useSearchProducts(searchQuery);
  // Инициализация и подписки на обновления корзины
  useEffect(() => {
    const recalcCartCount = () => {
      try {
        const stored = localStorage.getItem('cartCount');
        if (stored) return Number(stored);
        const cart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
        return Array.isArray(cart.products) ? cart.products.length : 0;
      } catch {
        return 0;
      }
    };
    const recalcLikedCount = () => {
      try {
        const liked = JSON.parse(localStorage.getItem('liked') || '{"products": []}');
        return Array.isArray(liked.products) ? liked.products.length : 0;
      } catch {
        return 0;
      }
    };

    setCartCount(recalcCartCount());
    setLikedCount(recalcLikedCount());

    const onCartUpdated = (e: any) => {
      const count = typeof e?.detail?.count === 'number' ? e.detail.count : recalcCartCount();
      setCartCount(count);
    };
    const onLikedUpdated = (e: any) => {
      const count = typeof e?.detail?.count === 'number' ? e.detail.count : recalcLikedCount();
      setLikedCount(count);
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'cart' || e.key === 'cartCount') setCartCount(recalcCartCount());
      if (e.key === 'liked') setLikedCount(recalcLikedCount());
    };

    const onItemAdded = (e: any) => {
      setMiniCartItem({
        name: e?.detail?.name,
        price: e?.detail?.price,
        imageUrl: e?.detail?.imageUrl,
      });
      setIsMiniCartOpen(true);
      if (miniCartTimerRef.current) clearTimeout(miniCartTimerRef.current);
      miniCartTimerRef.current = setTimeout(() => setIsMiniCartOpen(false), 3000);
    };
    const onLikedAdded = (e: any) => {
      setMiniLikedItem({ name: e?.detail?.name, imageUrl: e?.detail?.imageUrl });
      setIsMiniLikedOpen(true);
      if (miniCartTimerRef.current) clearTimeout(miniCartTimerRef.current);
      miniCartTimerRef.current = setTimeout(() => setIsMiniLikedOpen(false), 3000);
    };

    window.addEventListener('cart:updated', onCartUpdated as any);
    window.addEventListener('liked:updated', onLikedUpdated as any);
    window.addEventListener('storage', onStorage);
    window.addEventListener('cart:itemAdded', onItemAdded as any);
    window.addEventListener('liked:itemAdded', onLikedAdded as any);
    return () => {
      window.removeEventListener('cart:updated', onCartUpdated as any);
      window.removeEventListener('liked:updated', onLikedUpdated as any);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('cart:itemAdded', onItemAdded as any);
      window.removeEventListener('liked:itemAdded', onLikedAdded as any);
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

  // Обновленные данные для каталога с подкатегориями
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


  // (Скрытие верхней панели по скроллу — удалено)

  // Предпросмотр результатов поиска будет рендериться через `CatalogOfProductSearch`

  // (Hover/keyboard логика старого меню — удалена, теперь меню только по клику)

  // Закрытие мобильного меню при клике вне его области
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // (Старое закрытие каталога по клику вне — удалено; новый хэндлер ниже)

  // Блокировка скролла при открытом мобильном меню
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Обработчик поиска
  const handleSearch = () => {
    if (searchQuery.trim()) {
      handleProductClick(searchQuery);
    }
  };

  // Обработчик нажатия Enter в поле поиска
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Закрытие поиска по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // clear search query to close fullscreen overlay if open
        if (searchQuery) setSearchQuery('');
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen || searchQuery) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isSearchOpen]);

  // Escape/scroll lock for fullscreen search when typing
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setSearchQuery(''); };
    if (searchQuery) {
      document.addEventListener('keydown', onEsc);
    }
    return () => {
      document.removeEventListener('keydown', onEsc);
    };
  }, [searchQuery]);

  // Подкатегории всегда открыты — аккордеон удалён

  // Функции для обработки выпадающих меню
  const updateCatalogMenuTop = (buttonEl: HTMLElement | null) => {
    if (buttonEl) {
      const rect = buttonEl.getBoundingClientRect();
      setCatalogTopOffset(Math.max(rect.bottom + 8, 56));
    } else {
      setCatalogTopOffset(64);
    }
  };

  const openCatalogMenuFromButton = (buttonEl: HTMLElement | null) => {
    // Mount drawer first, then open to allow CSS transition
    setIsCatalogDrawerMounted(true);
    setTimeout(() => {
      updateCatalogMenuTop(buttonEl);
      setIsCatalogMenuOpen(true);
    }, 20);
  };

  const openCatalogDrawer = () => {
    setIsCatalogDrawerMounted(true);
    setTimeout(() => {
      setIsCatalogMenuOpen(true);
      // hide vertical scrollbar on page while drawer is open (remain scrollable)
      try { document.documentElement.classList.add('hide-vertical-scrollbar'); } catch {}
      try { document.body.classList.add('hide-vertical-scrollbar'); } catch {}
    }, 20);
  };

  const startCatalogHoverTimer = () => {
    // Small hover delay on desktop to avoid instant open (500ms)
    if (isCatalogMenuOpen) return;
    if (catalogHoverTimerRef.current) {
      clearTimeout(catalogHoverTimerRef.current);
      catalogHoverTimerRef.current = null;
    }
    const isDesktop = isClient && windowWidth >= 768;
    if (isDesktop) {
      catalogHoverTimerRef.current = setTimeout(() => {
        openCatalogMenuFromButton(catalogButtonRef.current);
        catalogHoverTimerRef.current = null;
      }, 500);
    } else {
      openCatalogDrawer();
    }
  };

  const clearCatalogHoverTimer = () => {
    if (catalogHoverTimerRef.current) {
      clearTimeout(catalogHoverTimerRef.current);
      catalogHoverTimerRef.current = null;
    }
  };

  const startMenuHover = (btn: HTMLElement | null, name: string) => {
    if (menuHoverTimerRef.current) {
      clearTimeout(menuHoverTimerRef.current);
      menuHoverTimerRef.current = null;
    }
    // small delay to match MENU behavior
    menuHoverTimerRef.current = setTimeout(() => {
      currentMenuButtonRef.current = btn;
      setActiveMenu(name);
      updateCatalogMenuTop(btn);
      updateSpotlightRect();
      setIsHeaderDimmed(true);
      menuHoverTimerRef.current = null;
    }, 200);
  };

  const clearMenuHover = () => {
    if (menuHoverTimerRef.current) {
      clearTimeout(menuHoverTimerRef.current);
      menuHoverTimerRef.current = null;
    }
    // small delay before closing to match MENU
    menuHoverTimerRef.current = setTimeout(() => {
      setActiveMenu(null);
      setSpotlightRect(null);
      currentMenuButtonRef.current = null;
      setIsHeaderDimmed(false);
      menuHoverTimerRef.current = null;
    }, 280);
  };

  useEffect(() => {
    return () => {
      clearCatalogHoverTimer();
    };
  }, []);

  // spotlight update: compute menu button rect to render an undimmed area
  const updateSpotlightRect = () => {
    try {
      const btn = currentMenuButtonRef.current || catalogButtonRef.current;
      if (!btn) {
        setSpotlightRect(null);
        return;
      }
      const rect = btn.getBoundingClientRect();
      setSpotlightRect(rect);
    } catch {
      setSpotlightRect(null);
    }
  };

  useEffect(() => {
    if (!isCatalogMenuOpen) {
      setSpotlightRect(null);
      return;
    }
    // update immediately and on resize/scroll
    updateSpotlightRect();
    const onResize = () => updateSpotlightRect();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, { passive: true } as any);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize as any);
    };
  }, [isCatalogMenuOpen]);

  // compute overlay mask style to create a transparent hole around spotlightRect
  const overlayStyle: React.CSSProperties = {};
  if ((isCatalogMenuOpen || !!activeMenu || isHeaderDimmed) && spotlightRect && isClient && windowWidth >= 768) {
    // slightly larger spotlight so hole covers label + semicircle
    const radius = Math.max(Math.max(spotlightRect.width, spotlightRect.height) * 0.5 + 8, 40);
    const cx = spotlightRect.left + spotlightRect.width / 2;
    const cy = spotlightRect.top + spotlightRect.height / 1.2;
    const mask = `radial-gradient(circle ${radius}px at ${cx}px ${cy}px, transparent 0, transparent ${radius}px, black ${radius + 2}px)`;
    // use mask to cut hole in overlay
    (overlayStyle as any).WebkitMaskImage = mask;
    (overlayStyle as any).maskImage = mask;
    overlayStyle.background = 'rgba(0,0,0,0.45)';
    overlayStyle.transition = 'opacity 0.22s ease';
    overlayStyle.pointerEvents = 'none';
    // place overlay above header content but below semicircle (which will have higher z)
    overlayStyle.zIndex = 10000;
    overlayStyle.position = 'absolute';
    overlayStyle.inset = '0px';
    overlayStyle.opacity = (isCatalogMenuOpen || !!activeMenu || isHeaderDimmed) ? 1 : 0;
  } else {
    overlayStyle.background = 'rgba(0,0,0,0.45)';
    overlayStyle.transition = 'opacity 0.22s ease';
    overlayStyle.pointerEvents = 'none';
    overlayStyle.zIndex = 10000;
    overlayStyle.position = 'absolute';
    overlayStyle.inset = '0px';
    overlayStyle.opacity = (isCatalogMenuOpen || !!activeMenu || isHeaderDimmed) ? 1 : 0;
  }

  // semicircle (drop) style computed from spotlightRect (like MENU)
  let semiStyle: React.CSSProperties | null = null;
  if (spotlightRect && isClient && windowWidth >= 768) {
    const semiWidth = Math.max(38, spotlightRect.width * 1.0);
    const semiHeight = Math.max(14, semiWidth * 0.46);
    const left = spotlightRect.left + spotlightRect.width / 2 - semiWidth / 2;
    // place slightly above the dropdown top so it visually sits under header
    const top = Math.max(6, catalogTopOffset - Math.round(semiHeight / 2) - 4);
    semiStyle = {
      position: 'absolute',
      left: left,
      top: top,
      width: semiWidth,
      height: semiHeight,
      pointerEvents: 'none',
      // bright top center with soft falloff, subtle shadow to match MENU
      background: '',
      boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
      borderBottomLeftRadius: semiWidth / 2,
      borderBottomRightRadius: semiWidth / 2,
      zIndex: 10005,
      transition: 'opacity 0.16s ease, transform 0.16s ease',
      transform: (activeMenu || isHeaderDimmed || isCatalogMenuOpen) ? 'translateY(0)' : 'translateY(-6px)',
      opacity: (activeMenu || isHeaderDimmed || isCatalogMenuOpen) ? 1 : 0,
      mixBlendMode: 'screen'
    };
  }

  // Brands menu handlers removed

  const handleCatalogClick = () => {
    if (isCatalogMenuOpen) setIsCatalogMenuOpen(false);
    else openCatalogMenuFromButton(catalogButtonRef.current);
  };

  const openMenu = (name: string, buttonEl: HTMLElement | null) => {
    // close catalog if open
    if (isCatalogMenuOpen) setIsCatalogMenuOpen(false);
    setActiveMenu(name);
    // compute top offset similar to catalog
    updateCatalogMenuTop(buttonEl);
    // set current button for spotlight
    currentMenuButtonRef.current = buttonEl;
    // start small hover effect like menu
    if (menuHoverTimerRef.current) clearTimeout(menuHoverTimerRef.current);
    menuHoverTimerRef.current = setTimeout(() => {
      updateSpotlightRect();
      menuHoverTimerRef.current = null;
    }, 80);
  };

  const closeMenus = () => {
    setActiveMenu(null);
    setIsCatalogMenuOpen(false);
  };

  const handleStickyCatalogClick = () => {
    if (isCatalogMenuOpen) setIsCatalogMenuOpen(false);
    else openCatalogMenuFromButton(stickyCatalogButtonRef.current);
  };

  // handleBrandsClick removed

  const handleMobileCatalogClick = () => {
    if (isCatalogMenuOpen) setIsCatalogMenuOpen(false);
    else openCatalogMenuFromButton(mobileCatalogButtonRef.current);
  };

  // mark client after hydration to avoid SSR/CSR markup mismatch
  useEffect(() => {
    setIsClient(true);
    const onResize = () => setWindowWidth(window.innerWidth);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Закрытие каталога при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const catalogMenu = document.getElementById('catalog-menu');
      const catalogButton = catalogButtonRef.current;
      
      if (catalogMenu && catalogButton && 
          !catalogMenu.contains(event.target as Node) &&
          !catalogButton.contains(event.target as Node)) {
        setIsCatalogMenuOpen(false);
      }
    };

    if (isCatalogMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCatalogMenuOpen]);

  // Close other dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutsideAll = (event: MouseEvent) => {
      const targets: (HTMLElement | null)[] = [
        catalogButtonRef.current,
        brandsButtonRef.current,
        aboutButtonRef.current,
        howToBuyButtonRef.current,
        contactsButtonRef.current,
      ];

      // if click is inside any of the nav buttons, do nothing
      for (const t of targets) {
        if (t && t.contains(event.target as Node)) return;
      }

      // check for any open dropdown panels by id
      const openPanels = ['catalog-dropdown'];
      if (activeMenu) openPanels.push(activeMenu + '-panel');

      // if click inside any panel, do nothing
      for (const id of openPanels) {
        const el = document.getElementById(id);
        if (el && el.contains(event.target as Node)) return;
      }

      // otherwise close
      closeMenus();
    };

    document.addEventListener('mousedown', handleClickOutsideAll);
    return () => document.removeEventListener('mousedown', handleClickOutsideAll);
  }, [activeMenu]);

  // Mount/unmount drawer to allow smooth open/close animation
  useEffect(() => {
    let t: any;
    if (isCatalogMenuOpen) {
      setIsCatalogDrawerMounted(true);
      try { document.documentElement.classList.add('hide-vertical-scrollbar'); } catch {}
      try { document.body.classList.add('hide-vertical-scrollbar'); } catch {}
    } else {
      // wait for transition to finish before unmounting
      t = setTimeout(() => {
        setIsCatalogDrawerMounted(false);
        try { document.documentElement.classList.remove('hide-vertical-scrollbar'); } catch {}
        try { document.body.classList.remove('hide-vertical-scrollbar'); } catch {}
      }, 340);
    }
    return () => clearTimeout(t);
  }, [isCatalogMenuOpen]);

  // Показ вторичного хедера при скролле
  useEffect(() => {
    const onScroll = () => {
      setIsStickyHeaderVisible(window.scrollY > 140);
    };
    window.addEventListener('scroll', onScroll, { passive: true } as any);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Brands click-outside handler removed

  // Alphabet (Latin A-Z then Cyrillic А-Я)
  const ALPHABET: string[] = [
    'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
    'А','Б','В','Г','Д','Е','Ё','Ж','З','И','Й','К','Л','М','Н','О','П','Р','С','Т','У','Ф','Х','Ц','Ч','Ш','Щ','Ъ','Ы','Ь','Э','Ю','Я'
  ];

  // Brands list and helpers removed

  // При смене видимости шторки/скролле/ресайзе — адаптируем позицию меню каталога
  useEffect(() => {
    if (!isCatalogMenuOpen) return;
    updateCatalogMenuTop(isStickyHeaderVisible ? stickyCatalogButtonRef.current : catalogButtonRef.current);
  }, [isStickyHeaderVisible, isCatalogMenuOpen]);

  // (Search preview removed)

  // Inline preview removed — больше не блокируем скролл при вводе в поиск

  

  useEffect(() => {
    const recalc = () => {
      if (!isCatalogMenuOpen) return;
      updateCatalogMenuTop(isStickyHeaderVisible ? stickyCatalogButtonRef.current : catalogButtonRef.current);
    };
    window.addEventListener('resize', recalc);
    window.addEventListener('scroll', recalc, { passive: true } as any);
    return () => {
      window.removeEventListener('resize', recalc);
      window.removeEventListener('scroll', recalc as any);
    };
  }, [isCatalogMenuOpen, isStickyHeaderVisible]);

  return (
    <div suppressHydrationWarning>
      {/* Мини-корзина: всплывающее подтверждение добавления товара */}
      {isMiniCartOpen && (
        <div className="fixed top-16 right-3 z-[10060] bg-white shadow-2xl rounded-xl border border-black/10 p-3 sm:p-4 flex items-center gap-3 animate-[searchModalFadeIn_0.3s_ease-out]">
          {miniCartItem?.imageUrl ? (
            <img src={miniCartItem.imageUrl} alt="" className="w-10 h-10 rounded object-contain bg-gray-50" />
          ) : (
            <div className="w-10 h-10 rounded bg-gray-100" />
          )}
          <div className="max-w-[220px]">
            <div className="text-sm font-medium text-black truncate">{miniCartItem?.name || 'Товар добавлен в корзину'}</div>
            {typeof miniCartItem?.price === 'number' && (
              <div className="text-xs text-black/70 mt-0.5">{new Intl.NumberFormat('ru-RU').format(miniCartItem.price)} ₽</div>
            )}
            <a href="/cart" className="mt-2 inline-flex text-xs text-black underline">Перейти в корзину</a>
          </div>
          <button className="ml-1 text-black/60 hover:text-black" onClick={() => setIsMiniCartOpen(false)} aria-label="Закрыть">×</button>
        </div>
      )}

      {/* Мини-избранное: всплывающее подтверждение добавления в избранное */}
      {isMiniLikedOpen && (
        <div className="fixed top-28 right-3 z-[10060] bg-white shadow-2xl rounded-xl border border-black/10 p-3 sm:p-4 flex items-center gap-3 animate-[searchModalFadeIn_0.3s_ease-out]">
          {miniLikedItem?.imageUrl ? (
            <img src={miniLikedItem.imageUrl} alt="" className="w-10 h-10 rounded object-contain bg-gray-50" />
          ) : (
            <div className="w-10 h-10 rounded bg-gray-100" />
          )}
          <div className="max-w-[220px]">
            <div className="text-sm font-medium text-black truncate">{miniLikedItem?.name || 'Добавлено в избранное'}</div>
            <a href="/liked" className="mt-2 inline-flex text-xs text-black underline">Перейти в избранное</a>
          </div>
          <button className="ml-1 text-black/60 hover:text-black" onClick={() => setIsMiniLikedOpen(false)} aria-label="Закрыть">×</button>
        </div>
      )}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* NEW: Animation for mobile menu content */
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .menu-content-enter {
          animation: fadeInDown 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        
        @keyframes slideFromLeft {
          from {
            opacity: 0;
            transform: translateX(-30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        
        .catalog-menu-enter {
          animation: slideFromLeft 0.4s cubic-bezier(0.25, 0.26, 1.45, 0.94);
        }
        
        .brands-menu-enter,
        .about-menu-enter {
          opacity: 0;
          transform: translateY(10px);
          animation: menuFadeIn 0.3s ease-out forwards;
        }

        @keyframes menuFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .menu-transition {
          transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out, visibility 0.3s ease-in-out;
        }

        /* Accordion animation for catalog items */
        .accordion-content {
          transition: max-height 360ms cubic-bezier(0.2,0.8,0.2,1), opacity 260ms ease;
          overflow: hidden;
        }

        /* Скрыть полосу прокрутки, но сохранить прокрутку (кросс-браузерно) */
        .hide-scrollbar {
          -ms-overflow-style: none !important; /* IE and Edge */
          scrollbar-width: none !important; /* Firefox */
          -webkit-overflow-scrolling: touch;
        }
        .hide-scrollbar::-webkit-scrollbar {
          height: 0 !important;
          width: 0 !important;
          display: none !important; /* Chrome, Safari and Opera */
        }

        /* Visual hide for horizontal scrollbar: adds padding and negative margin to conceal the bar on Windows/Edge
           while preserving horizontal scrollability */
        .hide-scrollbar-x {
          overflow-x: auto !important;
          overflow-y: hidden !important;
          padding-bottom: 12px !important;
          margin-bottom: -12px !important;
        }
        .hide-scrollbar-x::-webkit-scrollbar { height: 0 !important; }

        /* Полностью скрыть вертикальный скролл полосы страницы при открытом drawer */
        .hide-vertical-scrollbar {
          overflow-y: hidden !important;
        }
        
        @keyframes searchModalFadeIn {
          from { opacity: 0; transform: scale(0.98); }
          60% { opacity: 1; transform: scale(1.002); }
          to { opacity: 1; transform: scale(1); }
        }
        .search-modal-enter { animation: searchModalFadeIn 420ms cubic-bezier(0.16,0.84,0.24,1) both; }

        @keyframes curtainEnter {
          0% { opacity: 0; transform: translateY(-14px) scale(0.992); }
          70% { opacity: 1; transform: translateY(4px) scale(1.004); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .search-curtain-enter { animation: curtainEnter 560ms cubic-bezier(0.16,0.84,0.24,1) both; will-change: transform, opacity; }

        @keyframes inlinePreviewIn {
          0% { opacity: 0; transform: translateY(-10px) scale(0.992); }
          80% { opacity: 1; transform: translateY(2px) scale(1.002); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .inline-preview-enter { animation: inlinePreviewIn 480ms cubic-bezier(0.16,0.84,0.24,1) both; will-change: transform, opacity; }

        .search-backdrop {
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          transition: opacity 360ms cubic-bezier(0.16,0.84,0.24,1);
        }

        /* Анимация «книжки» при открытии каталога */
        .catalog-3d {
          perspective: 1200px;
          perspective-origin: 50% -120px;
        }
        @keyframes catalogBookOpen {
          0% { opacity: 0; transform: rotateX(-12deg) translateY(-12px); transform-origin: top center; }
          60% { opacity: 1; transform: rotateX(2deg) translateY(0); }
          100% { opacity: 1; transform: rotateX(0deg) translateY(0); }
        }
        .catalog-book-enter { animation: catalogBookOpen 360ms cubic-bezier(0.22, 0.61, 0.36, 1); transform-origin: top center; }

        /* Drawer transitions already use utility classes; ensure smoothness */
        .drawer-enter { transform: translateX(-100%); }
        .drawer-enter-active { transform: translateX(0); transition: transform 300ms ease-in-out; }
        .drawer-exit { transform: translateX(0); }
        .drawer-exit-active { transform: translateX(-100%); transition: transform 300ms ease-in-out; }
        /* Smooth dropdown panel animation */
        .catalog-panel {
          transform-origin: top center;
          transition: transform 240ms cubic-bezier(0.2,0.8,0.2,1), opacity 220ms ease;
          will-change: transform, opacity;
        }
        .catalog-panel-closed { transform: translateY(-8px) scaleY(0.98); opacity: 0; }
        .catalog-panel-open { transform: translateY(0) scaleY(1); opacity: 1; }
      `}</style>
      
      <div className="w-full relative">
        {/* Полноширинный фон под хедером: выбираем по маршруту, не показываем для страниц с собственным героем */}
        {bannerPath && (
          <div className="absolute inset-0 -z-10">
            <img src={bannerPath} alt="banner" className="w-full h-56 object-cover" />
            <div className="absolute inset-0 bg-white"></div>
          </div>
        )}
        <header
          ref={(el) => { headerRef.current = el; }}
          className={clsx(
            'fixed top-0 left-0 right-0 z-[9998] w-full pointer-events-auto transform transition-transform duration-300',
            bannerPath ? 'bg-transparent' : 'bg-white',
            isStickyHeaderVisible ? '-translate-y-full' : 'translate-y-0'
          )}
        >
          {/* Header dim overlay when catalog dropdown is open on desktop */}
          {/* overlay with optional spotlight mask */}
          <div style={overlayStyle as any} />
          {/* semicircle drop (bright) - rendered above overlay so it's not dimmed */}
          {semiStyle && (
            <div style={semiStyle as any} />
          )}
          {/* Верхняя тонкая панель */}
          <div className={clsx('hidden md:block', headerText + '/80', bannerPath ? 'bg-transparent' : 'bg-white')}>
            <div className="max-w-[1550px] mx-auto px-3 md:px-4">
              <div className="flex h-8 items-center text-[13px] gap-4">
                <a href="tel:+79265522173" className="hover:text-neutral-200 text-[20px] font-bold"> 8(926) 552-21-73</a>
                <a href="#call" className="hover:text-neutral-200 font-bold text-[20px]">Заказать звонок</a>
                <div className="ml-auto flex items-center gap-6">
                  <span className="hidden lg:inline font-bold text-[20px]">г. Москва, 25 километр, ТК Конструктор</span>
                  <a
  href="#"
  className="pointer-events-none cursor-not-allowed opacity-40 text-[20px] font-bold hover:text-gray-500"
  title="Недоступно"
>
  Для дизайнеров
</a>

                </div>
              </div>
            </div>
          </div>

          {/* Ряд с логотипом, поиском и иконками */}
          <div className={clsx(headerText, bannerPath ? 'bg-transparent' : 'bg-white ')}>
            <div className="max-w-[1550px] mx-auto px-3 md:px-4">
              <div className="flex items-center h-14 md:h-14 gap-3">
                {/* Бургер для мобилы - левый угол */}
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="md:hidden mr-3"
                  aria-label="Открыть меню"
                >
                  <MenuIcon className="w-6 h-6" />
                </button>

                {/* Логотип */}
                <a href="/" style={{ letterSpacing: '0.2em' }} className={clsx(headerText, 'sm:text-4xl text-2xl font-bold tracking-widest uppercase flex-none')}>
                  MOREELEKTRIKI
                </a>
                {/* Мобильный поиск между логотипом и иконками */}
                

                {/* Поиск */}
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
                        <CatalogOfProductSearch products={(products || []).slice(0,4) as any} viewMode="list" isLoading={loading} showActions={false} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Иконки */}
                <div className="flex items-center gap-4 ml-auto">
                  
                  <a href="/liked" className={clsx('relative', headerText + '/90', bannerPath ? 'hover:text-white' : 'hover:text-black')}>
                  <svg 
  className="w-6 h-6 " 
  viewBox="0 0 24 24" 
  fill="currentColor" 
  xmlns="http://www.w3.org/2000/svg"
>
  <path d="M12 21s-6.2-4.3-9.3-8.1C-0.1 8.5 2.3 3 7 3c2.1 0 3.6 1.2 5 2.7C13.4 4.2 14.9 3 17 3c4.7 0 7.1 5.5 4.3 9.9C18.2 16.7 12 21 12 21z"/>
</svg>

                    {likedCount > 0 && (
                      <span className="absolute -top-[26%] -right-2 w-5 h-5 backdrop-blur-sm bg-white/10 rounded-full flex items-center justify-center text-[10px] leading-none">{likedCount}</span>
                    )}
                  </a>
                  <a href="/cart" className={clsx('relative', headerText + '/90', bannerPath ? 'hover:text-white' : 'hover:text-black')}>
                  <ShoppingBasket className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 backdrop-blur-sm bg-white/10 rounded-full flex items-center justify-center text-[10px] leading-none">{cartCount}</span>
                    )}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Навигация */}
          <div className={clsx('hidden md:block', headerText, bannerPath ? 'bg-transparent' : 'bg-white')}>
            <div className="max-w-[1550px] mx-auto px-3 md:px-4">
              <nav className="flex h-10 items-center justify-between  text-[13px] md:text-[15px] tracking-widest uppercase flex-wrap gap-2">
             
                <button
                  ref={catalogButtonRef}
                  onClick={openCatalogDrawer}
                  onPointerEnter={startCatalogHoverTimer}
                  onPointerLeave={() => { clearCatalogHoverTimer(); setIsCatalogMenuOpen(false); setSpotlightRect(null); }}
                  onMouseEnter={startCatalogHoverTimer}
                  onMouseLeave={() => { clearCatalogHoverTimer(); setIsCatalogMenuOpen(false); setSpotlightRect(null); }}
                  onFocus={startCatalogHoverTimer}
                  onBlur={() => { clearCatalogHoverTimer(); setIsCatalogMenuOpen(false); setSpotlightRect(null); }}
                  className={clsx('font-bold cursor-pointer z-10 flex py-2 px-2 text-sm relative', isCatalogMenuOpen ? 'text-white' : 'hover:text-white/90')}
                >
                  <span className={clsx(isCatalogMenuOpen ? 'z-[10002]' : '')}>Меню</span>
                </button>
                {/* КАТАЛОГ перемещён в боковое меню (открывается кнопкой "Меню") */}
                <button
                  ref={brandsButtonRef}
                  onClick={() => openMenu('shorooms', brandsButtonRef.current)}
                  onMouseEnter={() => startMenuHover(brandsButtonRef.current, 'shorooms')}
                  onMouseLeave={() => clearMenuHover()}
                  className={clsx('hover:text-white/90  font-bold  py-1 px-2 text-sm', activeMenu === 'shorooms' ? 'text-white' : '')}
                >
                  Шоурум
                </button>
                <a href='/about'> 
                <button className='font-bold' 
                >
                 О нас
                </button>
                </a>
                <button
                  ref={howToBuyButtonRef}
                  onClick={() => openMenu('howtobuy', howToBuyButtonRef.current)}
                  onMouseEnter={() => startMenuHover(howToBuyButtonRef.current, 'howtobuy')}
                  onMouseLeave={() => clearMenuHover()}
                  className={clsx('hover:text-white/90  font-bold py-1 px-2 text-sm', activeMenu === 'howtobuy' ? 'text-white' : '')}
                >
                  Как купить
                </button>
                <button
                  ref={contactsButtonRef}
                  onClick={() => openMenu('contacts', contactsButtonRef.current)}
                  onMouseEnter={() => startMenuHover(contactsButtonRef.current, 'contacts')}
                  onMouseLeave={() => clearMenuHover()}
                  className={clsx('hover:text-white/90  font-bold py-1 px-2 text-sm', activeMenu === 'contacts' ? 'text-white' : '')}
                >
                  Контакты
                </button>
              </nav>

              {/* Мобильная адаптивная полоса меню (горизонтальный скролл) */}
              <div className={clsx('md:hidden', bannerPath ? 'text-white bg-black/40' : 'text-black bg-white/40')}>
                <div className="relative">
                  <div ref={mobileNavRef} className="px-3 py-2 overflow-x-auto hide-scrollbar">
                    <div className={clsx('flex items-center gap-5 text-[13px]  tracking-widest uppercase whitespace-nowrap', headerText)}>
                      <button onClick={openCatalogDrawer} className="hover:text-white/90 ">Меню</button>
                      <a href="/" className="hover:text-white/90">Акции</a>
                      <a href="/" className="hover:text-white/90">Шоурум</a>
                      <a href="/" className="hover:text-white/90">Проекты</a>
                      <a href="/" className="hover:text-white/90">Блог</a>
                      <a href="/" className="hover:text-white/90">Как купить</a>
                      <a href="/" className="hover:text-white/90">Контакты</a>
                    </div>
                  </div>

                  {/* СТРЕЛКИ УДАЛЕНЫ */}
                </div>
              </div>
            </div>
          </div>

          {/* Мобильное меню (портал) - НОВЫЙ ДИЗАЙН */}
          {isClient && createPortal(
            <>
              {/* Overlay */}
              <div
                className={clsx(
                  "fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm transition-opacity duration-300",
                  isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              />
              {/* Dropdown Content */}
              <div
                id="mobile-menu"
                className={clsx(
                  "fixed top-0 left-0 right-0 z-[9999] transform transition-transform duration-500 ease-in-out",
                  isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
                )}
              >
                {/* CHANGE: Increased height to 90vh */}
                <div className="relative w-full h-[100vh] bg-gray-900 shadow-lg">
                  <img
                    src="/images/banners/bannersmenu.jpg"
                    alt="Меню"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                  
                  {/* CHANGE: Added menu-content-enter for animation */}
                  <div className={clsx("relative z-10 p-4 h-full flex flex-col text-white", isMobileMenuOpen && "menu-content-enter")}>
                    <div className="flex items-center justify-between pb-3 border-b border-white/20 ">
                      <a href="/" style={{ letterSpacing: '0.4em' }} className="text-white text-2xl font-semibold tracking-widest uppercase">
                        MOREELEKTRIKI
                      </a>
                      <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 rounded-full hover:bg-white/10"
                      >
                        <X className="w-6 h-6 text-white" />
                      </button>
                    </div>

                    <div className="mt-4 flex-grow overflow-y-auto hide-scrollbar">
                       <div className="flex flex-col space-y-2">
                        {/* CHANGE: Added border and hover styles to button */}
                        <button
                          onClick={() => setIsMobileCatalogOpen((v) => !v)}
                          className="flex items-center justify-between py-3 px-4 text-base md:text-lg font-medium text-white rounded-lg border border-white/20 hover:bg-white/10 hover:border-white/40 transform  transition-all duration-200 ease-out"
                        >
                          <span>КАТАЛОГ</span>
                          <span className={clsx("text-white/60 text-sm transition-transform duration-300", isMobileCatalogOpen && "rotate-180")}>
                            <ChevronDown size={20} />
                          </span>
                        </button>

                        {/* CHANGE: Animated accordion content */}
                        <div className={clsx(
                          "pl-2 pr-1 space-y-1 overflow-hidden transition-all duration-500 ease-in-out",
                          isMobileCatalogOpen ? 'max-h-[1500px] opacity-100 mt-2' : 'max-h-0 opacity-0'
                        )}>
                            {catalogData.lighting.map((item, idx) => (
                              <div key={idx} className="bg-black/20 backdrop-blur-sm rounded-lg p-2">
                                <div className="w-full flex items-center py-2 px-2 text-white">
                                  <span className="text-[19px] font-bold">{item.title}</span>
                                </div>
                                <div className="px-2 pb-2 space-y-2">
                                  {item.subcategories?.slice(0, 8).map((sub, sidx) => (
                                    // CHANGE: Added border and hover styles
                                    <a
                                      key={sidx}
                                      href={sub.link}
                                      className="block text-sm text-white/90 py-2 px-3 rounded-lg border border-white/20 hover:bg-white/10 hover:border-white/40 transform  transition-all duration-200 ease-out"
                                      onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                      {sub.title}
                                    </a>
                                  ))}
                                  <a
                                    href={item.link}
                                    className="block text-sm font-semibold text-white py-2 px-3 rounded-lg bg-white/10 border border-white/30 hover:bg-white/20 hover:border-white/50 transform hover:scale-[1.02] transition-all duration-200 ease-out"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                  >
                                    Смотреть все
                                  </a>
                                </div>
                              </div>
                            ))}
                        </div>
                        
                        <div className="border-t border-white/10 pt-3 space-y-2">
                            {/* CHANGE: Added border and hover styles */}
                            <a href="/" className="block text-base text-white/90 py-3 px-4 rounded-lg border border-white/20 hover:bg-white/10 hover:border-white/40 transform  transition-all duration-200 ease-out">Шоурум</a>
                            <a href="/" className="block text-base text-white/90 py-3 px-4 rounded-lg border border-white/20 hover:bg-white/10 hover:border-white/40 transform  transition-all duration-200 ease-out">Акции</a>
                            <a href="/" className="block text-base text-white/90 py-3 px-4 rounded-lg border border-white/20 hover:bg-white/10 hover:border-white/40 transform  transition-all duration-200 ease-out">Проекты</a>
                            <a href="/" className="block text-base text-white/90 py-3 px-4 rounded-lg border border-white/20 hover:bg-white/10 hover:border-white/40 transform  transition-all duration-200 ease-out">Контакты</a>
                            <a
                              href="#"
                              className="block text-base opacity-40 py-3 px-4 rounded-lg border border-white/20 cursor-not-allowed pointer-events-none"
                              title="Недоступно"
                            >
                              Для дизайнеров
                            </a>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto border-t border-white/20 pt-4">
                      <div className="flex flex-col space-y-3">
                        <a href="tel:89265522173" className="flex items-center text-white text-base">                   
                        8(926) 552-21-73

                        </a>
                        <a href="mailto:info@donel.su" className="flex items-center text-white text-base">
                          MOREELEKTRIKI@gmail.com
                        </a>
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

      {/* Второй хедер-шторка при скролле */}
      <div
        className={clsx(
          'fixed top-0 left-0 right-0 z-[10050] transform transition-transform duration-300',
          isStickyHeaderVisible ? 'translate-y-0' : '-translate-y-full'
        )}
      >
        <div className="bg-black text-white/95 ">
          <div className="max-w-[1550px] mx-auto px-3 md:px-4">
            <div className="flex justify-between items-center h-12 md:h-14 gap-0">
              {/* Левая группа: логотип + меню */}
                <div className="flex items-center gap-3 pr-2 sm:gap-6 sm:pr-4">
                <button
                  ref={stickyCatalogButtonRef}
                  onClick={handleStickyCatalogClick}
                  className="inline-flex items-center text-white/90 hover:text-white text-[12px] sm:text-[13px] tracking-widest uppercase"
                >
                  <MenuIcon className="w-6 h-6" />
                </button>
                 <a href="/" style={{ letterSpacing: '0.1em' }} className="text-white text-2xl font-semibold tracking-widest uppercase">MOREELEKTRIKI</a>
                <nav className="hidden sm:flex items-center gap-2 md:gap-3 text-[12px] sm:text-[13px] tracking-widest uppercase flex-wrap">
                  <a href="/" className="hover:text-white py-1 px-2 text-sm">Шоурум</a>
                  <a href="/" className="hover:text-white py-1 px-2 text-sm">Акции</a>
                  <a href="/" className="hover:text-white py-1 px-2 text-sm">Проекты</a>
                  <a href="/" className="hover:text-white py-1 px-2 text-sm">Контакты</a>
                </nav>
                
              </div>
              <button onClick={() => {
                  // Открываем fullscreen поиск на мобильных устройствах
                  setIsSearchOpen(true);
                  // фокус поставим в эффекте рендера portal'а (autoFocus на инпуте)
                }} className={clsx('md:hidden ml-3', headerText + '/90', bannerPath ? 'hover:text-white' : 'hover:text-black')} aria-label="Открыть поиск">
                  <Search className="w-5 h-5" />
                </button>
              {/* Правая группа: телефон + дизайнеры + иконки */}
              <div className="flex items-center pl-2 sm:pl-4 gap-3 sm:gap-6">
                
                <div className="hidden md:flex flex-col leading-tight mr-2">
                  <a href="tel:+79265522173" className="text-white text-[18px] font-bold tracking-wide hover:underline">8 (926) 552-21-73</a>
                  <a href="#call" className="text-[11px] text-white/80 uppercase tracking-widest">заказать звонок</a>
                </div>
                <a
  href="#"
  className="hidden sm:inline opacity-40 text-[13px] tracking-widest uppercase cursor-not-allowed pointer-events-none"
  title="Недоступно"
>
  Для дизайнеров
</a>

                {/* Мобильная иконка для дизайнеров */}
                <a href="/auth/register" className="sm:hidden tracking-widest uppercase cursor-not-allowed pointer-events-none inline-flex opacity-40" aria-label="Для дизайнеров">
                  <User className="w-5 h-5" />
                </a>
             
                <a href="/liked" className="hidden sm:inline-flex relative text-white/80 hover:text-white">
                <svg 
  className="w-6 h-6 " 
  viewBox="0 0 24 24" 
  fill="currentColor" 
  xmlns="http://www.w3.org/2000/svg"
>
  <path d="M12 21s-6.2-4.3-9.3-8.1C-0.1 8.5 2.3 3 7 3c2.1 0 3.6 1.2 5 2.7C13.4 4.2 14.9 3 17 3c4.7 0 7.1 5.5 4.3 9.9C18.2 16.7 12 21 12 21z"/>
</svg>

                  {likedCount > 0 && (
                    <span className="absolute -top-[26%] -right-2 w-5 h-5 backdrop-blur-sm bg-white/10 rounded-full flex items-center justify-center text-[10px] leading-none">{likedCount}</span>
                  )}
                </a>
                <a href="/cart" className="relative text-white/80 hover:text-white">
                <ShoppingBasket className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 backdrop-blur-sm bg-white/10 text-white rounded-full flex items-center justify-center text-[10px] leading-none">{cartCount}</span>
                  )}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen animated white overlay with centered blurred input when typing */}
      {isClient && (isSearchOpen || searchQuery) && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center transition-opacity duration-400 ease-out search-curtain-enter">
          {/* white backdrop */}
          <div className="absolute inset-0 bg-white/100" onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }} />

          {/* Centered panel */}
          <div className="relative w-full max-w-5xl mx-4 px-6 py-6">
            <div className="mx-auto max-w-5xl">
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
                  <CatalogOfProductSearch products={(products || []).slice(0,4) as any} viewMode="list" isLoading={loading} showActions={false} />
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Порталы для выпадающих меню */}
      {/* Боковая панель каталога (drawer) с анимацией */}
      {isClient && isCatalogDrawerMounted && createPortal(
        <div className={"fixed inset-0 z-[99999]"} onTransitionEnd={() => {
          // Ensure overlay pointer-events are disabled when closed
          const overlay = document.getElementById('catalog-overlay');
          if (overlay && !isCatalogMenuOpen) overlay.classList.add('pointer-events-none');
          if (overlay && isCatalogMenuOpen) overlay.classList.remove('pointer-events-none');
        }}>
          {/* Render full-screen drawer for mobile, dropdown for desktop */}
          {(() => {
            const isDesktop = isClient && window.innerWidth >= 768;

            if (!isDesktop) {
              return (
                <>
                  <div
                    id="catalog-overlay"
                    className={"absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 " + (isCatalogMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}
                    onClick={() => setIsCatalogMenuOpen(false)}
                  />
                  <aside
                    aria-hidden={!isCatalogMenuOpen}
                    onMouseEnter={() => clearCatalogHoverTimer()}
                    onMouseLeave={() => {
                      if (catalogHoverTimerRef.current) clearTimeout(catalogHoverTimerRef.current);
                      catalogHoverTimerRef.current = setTimeout(() => setIsCatalogMenuOpen(false), 280);
                    }}
                    className={"absolute left-0 top-0 right-0 bottom-0 bg-transparent p-0 overflow-hidden shadow-2xl transform transition-transform duration-300 " + (isCatalogMenuOpen ? 'translate-x-0' : '-translate-x-[100%]') }
                  >
                    <div className="flex h-full">
                      {/* Левый узкий столбец */}
                      <nav className="w-96 bg-white/100 overflow-y-auto hide-scrollbar" style={{ maxHeight: '100vh' }}>
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

                      {/* Правая большая область с изображением - занимает всё оставшееся пространство экрана */}
                      <div className="flex-1 relative h-screen">
                        <img
                          src="/images/banners/bannersmenu.jpg"
                          alt="banner"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0"></div>
                      </div>
                    </div>
                  </aside>
                </>
              );
            }

            // Desktop dropdown: span full viewport width under header
            return (
              <aside
                id="catalog-dropdown"
                aria-hidden={!isCatalogMenuOpen}
                onMouseEnter={() => clearCatalogHoverTimer()}
                onMouseLeave={() => {
                  if (catalogHoverTimerRef.current) clearTimeout(catalogHoverTimerRef.current);
                  catalogHoverTimerRef.current = setTimeout(() => setIsCatalogMenuOpen(false), 280);
                }}
                style={{ top: catalogTopOffset, left: 0, right: 0 }}
                className={"absolute left-0 right-0 z-[10002] bg-transparent p-0 overflow-visible transition-all duration-200 " + (isCatalogMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}
              >
                <div className={clsx('bg-white shadow-2xl  overflow-hidden w-full catalog-panel', isCatalogMenuOpen ? 'catalog-panel-open' : 'catalog-panel-closed')} style={{ display: 'flex', height: 'calc(100vh - ' + catalogTopOffset + 'px)' }}>
                  <nav className="w-96 bg-white/100 overflow-y-auto hide-scrollbar" style={{ maxHeight: '85vh' }}>
                    <div className="flex items-center justify-between px-4 py-3">
                      <h3 className="text-5xl font-semibold text-black">Каталог</h3>
                      <button onClick={() => setIsCatalogMenuOpen(false)} className="p-2 text-black text-3xl leading-none">×</button>
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

                  <div className="flex-1 relative block h-full">
                    <img
                      src="/images/banners/bannersmenu.jpg"
                      alt="banner"
                      className="w-full h-full object-cover"
                    />
                   
                  </div>
                </div>
              </aside>
            );
          })()}
        </div>,
        document.body
      )}

    {/* Dropdowns for other nav items (desktop) */}
<div>
  {['shorooms', 'about', 'howtobuy', 'contacts'].map((menu) => (
    <aside
      key={menu}
      aria-hidden={activeMenu !== menu}
      style={{ top: catalogTopOffset, left: 0, right: 0 }}
      className={
        "fixed left-0 right-0 z-[9998] bg-transparent p-0 overflow-visible transition-all duration-200 " +
        (activeMenu === menu ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')
      }
      onMouseEnter={() => setActiveMenu(menu)}   // Меню остаётся открытым при наведении
      onMouseLeave={() => {
        if (activeMenu === menu) setActiveMenu(null); // Закрываем только если курсор ушёл
      }}
    >
      <div
        className={clsx(
          'bg-white  overflow-hidden w-full catalog-panel',
          activeMenu === menu ? 'catalog-panel-open' : 'catalog-panel-closed'
        )}
        style={{ display: 'flex', height: `calc(100vh - ${catalogTopOffset}px)` }}
      >
        <nav className="w-96 overflow-y-auto hide-scrollbar" style={{ maxHeight: '85vh' }}>
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="text-5xl font-semibold text-black">
              {menu === 'shorooms' ? 'Шоурум' :
               menu === 'howtobuy' ? 'Как купить' :
               'Контакты'}
            </h3>
            <button onClick={() => closeMenus()} className="p-2 text-black text-3xl leading-none">×</button>
          </div>
          <div className="px-4 pb-6 text-sm text-black/80">
            {menu === 'shorooms' && 'Здесь краткая информация о брендах, логотипы и ссылки.'}
            {menu === 'about' && 'Кратко о компании, миссия и преимущества.'}
            {menu === 'howtobuy' && 'Инструкция по заказу, варианты оплаты и доставки.'}
            {menu === 'contacts' && 'Адреса, телефоны, режим работы и карта.'}
          </div>
        </nav>
        <div className="flex-1 relative block h-full">
          <img
            src={
              menu === 'shorooms' ? '/images/banners/bannersmenubrands.jpeg' :
              menu === 'about' ? '/images/banners/bannersopenspace.jpg' :
              menu === 'howtobuy' ? '/images/banners/bannersdressingroom.jpg' :
              '/images/banners/bannersmenucontacts.png'
            }
            alt={menu}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 "></div>
        </div>
      </div>
    </aside>
  ))}
</div>



     

    

     
    </div>
  );
};

export default Header;