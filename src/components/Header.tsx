import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, User, Menu as MenuIcon, X, ShoppingCart, ChevronDown } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

import axios from 'axios';
import clsx from 'clsx';
import Image from 'next/image';

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
  const [expandedAccordionItems, setExpandedAccordionItems] = useState<number[]>([]);
  const [isCatalogMenuOpen, setIsCatalogMenuOpen] = useState(false);
  const [isCatalogDrawerMounted, setIsCatalogDrawerMounted] = useState(false);
  const [isBrandsMenuOpen, setIsBrandsMenuOpen] = useState(false);
  const brandsButtonRef = useRef<HTMLButtonElement | null>(null);
  const [brandsTopOffset, setBrandsTopOffset] = useState<number>(64);
  const [brandAlphabet, setBrandAlphabet] = useState<string>('Все');
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
    else if (pathname.startsWith('/osveheny')) return '/images/banners/bannersylihnoeosveheny.jpg';
    else if (pathname.startsWith('/catalog')) return '/images/banners/bannersylihnoeosveheniy.jpg';
    else if (pathname.startsWith('/ElektroustnovohneIzdely/Werkel')) return '/images/series/werkel.webp';
    else if (pathname.startsWith('/ElektroustnovohneIzdely/Voltum')) return '/images/banners/bannersVoltum.jpg';
    else if (pathname.startsWith('/ElektroustnovohneIzdely')) return '/images/banners/bannerselektroustnovohneIzdely.png';
    return null;
  })();

  const isVoltum = pathname?.startsWith('/ElektroustnovohneIzdely/Voltum');
  const isWerkel = pathname?.startsWith('/ElektroustnovohneIzdely/Werkel');
  const headerText = (isVoltum || isWerkel) ? 'text-black' : 'text-white';
  const catalogButtonRef = useRef<HTMLButtonElement | null>(null);
  const stickyCatalogButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileCatalogButtonRef = useRef<HTMLButtonElement | null>(null);
  const [catalogTopOffset, setCatalogTopOffset] = useState<number>(64);
  const [isStickyHeaderVisible, setIsStickyHeaderVisible] = useState<boolean>(false);
  const [cartCount, setCartCount] = useState<number>(0);
  const [likedCount, setLikedCount] = useState<number>(0);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState<boolean>(false);
  const [miniCartItem, setMiniCartItem] = useState<{ name?: string; price?: number; imageUrl?: string } | null>(null);
  const miniCartTimerRef = useRef<any>(null);
  const [isMiniLikedOpen, setIsMiniLikedOpen] = useState<boolean>(false);
  const [miniLikedItem, setMiniLikedItem] = useState<{ name?: string; imageUrl?: string } | null>(null);
  
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
        link: '/osveheny?category=Уличный светильник',
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
          { title: 'Одноцветные ленты', link: '/osveheny?category=Светодиодная лента&page=1' },
          { title: 'RGB ленты', link: '/osveheny?category=Светодиодная лента&page=1' },
          { title: 'Профили для лент', link: '/osveheny?category=Светодиодная лента&page=1' }
        ]
      },
      { 
        title: 'Светодиодные лампы', 
        link: '/osveheny?category=Светодиодная лампа',
        image: '/images/category/stikerlampaled.png',
        subcategories: [
          { title: 'Лампы E27', link: '/osveheny?category=Светодиодная лампа&page=1' },
          { title: 'Лампы E14', link: '/osveheny?category=Светодиодная лампа&page=1' },
          { title: 'Лампы GU10', link: '/osveheny?category=Светодиодная лампа&page=1' },
          { title: 'Трубчатые лампы', link: '/osveheny?category=Светодиодная лампа&page=1' }
        ]
      },
      { 
        title: 'Розетки и выключатели', 
        link: '/osveheny?category=Светодиодная лампа',
        image: '/images/category/stikerelektroustnovohneIzdely.png',
        subcategories: [
          { title: 'Лампы E27', link: '/osveheny?category=Светодиодная лампа&page=1' },
          { title: 'Лампы E14', link: '/osveheny?category=Светодиодная лампа&page=1' },
          { title: 'Лампы GU10', link: '/osveheny?category=Светодиодная лампа&page=1' },
          { title: 'Трубчатые лампы', link: '/osveheny?category=Светодиодная лампа&page=1' }
        ]
      }
    ],
    
  };


  // (Скрытие верхней панели по скроллу — удалено)

  // Мемоизированный рендер выпадающего списка с товарами (новый дизайн)
  const searchResultsContent = useMemo(() => {
    if (loading) {
      return (
        <div className="p-4 flex justify-center items-center">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-gray-500"></div>
        </div>
      );
    }
    if (products.length > 0) {
      return (
        <>
          {products.map((product, index) => {
            const images = (() => {
              if (typeof product.imageAddresses === 'string') {
                return [product.imageAddresses];
              } else if (Array.isArray(product.imageAddresses)) {
                return product.imageAddresses;
              } else if (typeof product.imageAddress === 'string') {
                return [product.imageAddress];
              } else if (Array.isArray(product.imageAddress)) {
                return product.imageAddress;
              }
              return [];
            })();
            const fallbackCatalogImage = catalogData.lighting[0]?.image || '';
            const imageUrl = images.length > 0 ? images[0] : fallbackCatalogImage;

            return (
              <div 
                key={product._id} 
                className={`flex items-center p-3 cursor-pointer hover:backdrop-blur-sm ${index !== products.length - 1 ? 'border-b border-gray-200' : ''}`}
                onClick={() => handleProductClick(product.name)}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-12 h-12 object-cover mr-4 rounded"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-12 h-12 mr-4 rounded bg-black/10" />
                )}
                <div>
                  <p className="text-sm font-medium text-white">{product.name}</p>
                  <p className="text-xs text-white">{product.price} ₽</p>
                </div>
              </div>
            );
          })}
        </>
      );
    }
    return (
      <div className="p-4 text-center text-gray-500">
        Ничего не найдено
      </div>
    );
  }, [products, loading, searchQuery]);

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
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isSearchOpen]);

  const toggleAccordionItem = (index: number) => {
    setExpandedAccordionItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index) 
        : [...prev, index]
    );
  };

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

  const updateBrandsMenuTop = (buttonEl: HTMLElement | null) => {
    if (buttonEl) {
      const rect = buttonEl.getBoundingClientRect();
      setBrandsTopOffset(Math.max(rect.bottom + 8, 56));
    } else {
      setBrandsTopOffset(64);
    }
  };

  const openBrandsMenuFromButton = (buttonEl: HTMLElement | null) => {
    updateBrandsMenuTop(buttonEl);
    setIsBrandsMenuOpen(true);
  };

  const handleCatalogClick = () => {
    if (isCatalogMenuOpen) setIsCatalogMenuOpen(false);
    else openCatalogMenuFromButton(catalogButtonRef.current);
  };

  const handleStickyCatalogClick = () => {
    if (isCatalogMenuOpen) setIsCatalogMenuOpen(false);
    else openCatalogMenuFromButton(stickyCatalogButtonRef.current);
  };

  const handleBrandsClick = () => {
    if (isBrandsMenuOpen) setIsBrandsMenuOpen(false);
    else openBrandsMenuFromButton(brandsButtonRef.current);
  };

  const handleMobileCatalogClick = () => {
    if (isCatalogMenuOpen) setIsCatalogMenuOpen(false);
    else openCatalogMenuFromButton(mobileCatalogButtonRef.current);
  };

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

  // Закрытие брендов по клику вне его области
  useEffect(() => {
    const handleClickOutsideBrands = (event: MouseEvent) => {
      const brandsMenu = document.getElementById('brands-menu');
      const brandsButton = brandsButtonRef.current;
      if (brandsMenu && brandsButton && !brandsMenu.contains(event.target as Node) && !brandsButton.contains(event.target as Node)) {
        setIsBrandsMenuOpen(false);
      }
    };

    if (isBrandsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutsideBrands);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideBrands);
    };
  }, [isBrandsMenuOpen]);

  // Alphabet (Latin A-Z then Cyrillic А-Я)
  const ALPHABET: string[] = [
    'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
    'А','Б','В','Г','Д','Е','Ё','Ж','З','И','Й','К','Л','М','Н','О','П','Р','С','Т','У','Ф','Х','Ц','Ч','Ш','Щ','Ъ','Ы','Ь','Э','Ю','Я'
  ];

  // Brands list (derived from files in public/images/brands)
  const BRANDS_LIST: string[] = [
    'artelamplogo','denkirslogo1','elektrostandartlogo','favouritelogo','kinklightlogo','lightstarlogo','lumionlogo','maytonilogo','novotechlogo','odeonlightlogo','sonexlogo1','stlucelogo','voltumlogo','werkellogo'
  ];

  const prettifyBrandName = (fileName: string) => {
    const raw = fileName.replace(/\d+/g, '').replace(/logo/ig, '').replace(/[_-]/g, ' ').trim();
    if (!raw) return fileName;
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  };

  // При смене видимости шторки/скролле/ресайзе — адаптируем позицию меню каталога
  useEffect(() => {
    if (!isCatalogMenuOpen) return;
    updateCatalogMenuTop(isStickyHeaderVisible ? stickyCatalogButtonRef.current : catalogButtonRef.current);
  }, [isStickyHeaderVisible, isCatalogMenuOpen]);

  

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
    <>
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
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .search-modal-enter {
          animation: searchModalFadeIn 0.3s ease-out;
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
      `}</style>
      
      <div className="w-full relative">
        {/* Полноширинный фон под хедером: выбираем по маршруту, не показываем для страниц с собственным героем */}
        {bannerPath && (
          <div className="absolute inset-0 -z-10">
            <img src={bannerPath} alt="banner" className="w-full h-56 object-cover" />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        )}
        <header
          className={clsx(
            'fixed top-0 left-0 right-0 z-[9998] w-full pointer-events-auto transform transition-transform duration-300',
            bannerPath ? 'bg-transparent' : 'bg-black',
            isStickyHeaderVisible ? '-translate-y-full' : 'translate-y-0'
          )}
        >
          {/* Верхняя тонкая панель */}
          <div className={clsx('hidden md:block', headerText + '/80', bannerPath ? 'bg-transparent' : 'bg-black/90')}>
            <div className="max-w-[1550px] mx-auto px-3 md:px-4">
              <div className="flex h-8 items-center text-[13px] gap-4">
                <a href="tel:+79265522173" className="hover:text-white">8 (926) 552-21-73</a>
                <a href="#call" className="hover:text-white">заказать звонок</a>
                <div className="ml-auto flex items-center gap-6">
                  <span className="hidden lg:inline">г. Москва, 25 километр, ТК Конструктор</span>
                  <a href="/auth/login" className="hover:text-white">Для дизайнеров</a>
                </div>
              </div>
            </div>
          </div>

          {/* Ряд с логотипом, поиском и иконками */}
          <div className={clsx(headerText, bannerPath ? 'bg-transparent' : 'bg-black/90 ')}>
            <div className="max-w-[1550px] mx-auto px-3 md:px-4">
              <div className="flex items-center h-14 md:h-14 gap-3">
                {/* Бургер для мобилы */}
                <button className="hidden">
                  <MenuIcon className="w-5 h-5" />
                </button>

                {/* Логотип */}
                <a href="/" className={clsx(headerText, 'text-2xl font-semibold tracking-widest uppercase flex-none')}>
                  MORELEKTRIKI
                </a>
                {/* Мобильный поиск между логотипом и иконками */}
                <button onClick={() => setIsSearchOpen(true)} className={clsx('md:hidden ml-3', headerText + '/90', bannerPath ? 'hover:text-white' : 'hover:text-black')} aria-label="Открыть поиск">
                  <Search className="w-5 h-5" />
                </button>

                {/* Поиск */}
                <div className="flex-1 hidden md:flex items-center">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
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
                  </div>
                </div>

                {/* Иконки */}
                <div className="flex items-center gap-4 ml-auto">
                  <a href="#stats" className={clsx('relative', headerText + '/90', bannerPath ? 'hover:text-white' : 'hover:text-black')}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><rect x="7" y="13" width="3" height="5"/><rect x="12" y="9" width="3" height="9"/><rect x="17" y="5" width="3" height="13"/></svg>
                  </a>
                  <a href="/liked" className={clsx('relative', headerText + '/90', bannerPath ? 'hover:text-white' : 'hover:text-black')}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
                    {likedCount > 0 && (
                      <span className="absolute -top-2 -right-2 text-[10px] bg-white text-black rounded-full px-1">{likedCount}</span>
                    )}
                  </a>
                  <a href="/cart" className={clsx('relative', headerText + '/90', bannerPath ? 'hover:text-white' : 'hover:text-black')}>
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 text-[10px] bg-white text-black rounded-full px-1">{cartCount}</span>
                    )}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Навигация */}
          <div className={clsx('hidden md:block', headerText, bannerPath ? 'bg-transparent' : 'bg-black/90')}>
            <div className="max-w-[1550px] mx-auto px-3 md:px-4">
              <nav className="flex h-10 items-center justify-between text-[13px] md:text-[15px] tracking-widest uppercase flex-wrap gap-2">
                <button onClick={openCatalogDrawer} className="hover:text-white/90 py-1 px-2 text-sm">МЕНЮ</button>
                {/* КАТАЛОГ перемещён в боковое меню (открывается кнопкой "Меню") */}
                <a href="/sales" className="hover:text-white/90 py-1 px-2 text-sm">Акции</a>
                <button
                  ref={brandsButtonRef}
                  onClick={handleBrandsClick}
                  onMouseEnter={() => openBrandsMenuFromButton(brandsButtonRef.current)}
                  onFocus={() => openBrandsMenuFromButton(brandsButtonRef.current)}
                  className="hover:text-white/90 inline-flex items-center py-1 px-2 text-sm"
                >
                  БРЕНДЫ
                </button>
                <a href="/projects" className="hover:text-white/90 py-1 px-2 text-sm">Проекты</a>
                <a href="/blog" className="hover:text-white/90 py-1 px-2 text-sm">Блог</a>
                <a href="/how-to-buy" className="hover:text-white/90 py-1 px-2 text-sm">Как купить</a>
                <a href="/contacts" className="hover:text-white/90 py-1 px-2 text-sm">Контакты</a>
              </nav>

              {/* Мобильная адаптивная полоса меню (горизонтальный скролл) */}
              <div className="md:hidden text-white bg-black/40">
                <div className="px-3 py-2 overflow-x-auto hide-scrollbar">
                  <div className={clsx('flex items-center gap-5 text-[13px] tracking-widest uppercase whitespace-nowrap', headerText)}>
                    <button onClick={openCatalogDrawer} className="hover:text-white/90">Меню</button>
                    <a href="/sales" className="hover:text-white/90">Акции</a>
                    <a href="/brands" className="hover:text-white/90">Бренды</a>
                    <a href="/projects" className="hover:text-white/90">Проекты</a>
                    <a href="/blog" className="hover:text-white/90">Блог</a>
                    <a href="/how-to-buy" className="hover:text-white/90">Как купить</a>
                    <a href="/contacts" className="hover:text-white/90">Контакты</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Мобильное меню */}
          {isMobileMenuOpen && (
            <div id="mobile-menu" className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md overflow-y-auto">
            <div className="max-w-8xl mx-auto px-4 py-4">
                {/* Верхняя панель с логотипом и кнопкой закрытия */}
              <div className="flex items-center justify-between py-3 border-b border-gray-700">
                <a href="/" className="flex-shrink-0 text-white text-2xl font-semibold tracking-widest uppercase">MORELEKTRIKI</a>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-800"
                  >
                    <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </button>
                </div>

              {/* Навигация */}
              <div className="mt-2">
                <div className="flex  flex-col space-y-0">
                    <button
                      onClick={() => setIsMobileCatalogOpen((v) => !v)}
                      className="flex items-center justify-between py-3 px-2 text-base md:text-lg font-medium text-white hover:bg-gray-800 rounded-lg"
                    >
                    <span>КАТАЛОГ</span>
                      <span className="text-white/60 text-sm">{isMobileCatalogOpen ? '−' : '+'}</span>
                    </button>
                    {isMobileCatalogOpen && (
                      <div className="pl-2 pr-1 py-2 space-y-1">
                        {catalogData.lighting.map((item, idx) => (
                          <div key={idx} className="bg-white/10 rounded-lg">
                            <div className="w-full flex items-center py-3 px-3 text-white rounded-lg">
                              <span className="flex items-center">
                                <img src={item.image} alt={item.title} className="w-8 h-8 object-contain mr-3 rounded" />
                                <span>{item.title}</span>
                              </span>
                            </div>
                            <div className="px-3 pb-3 space-y-2">
                              {item.subcategories?.slice(0, 8).map((sub, sidx) => (
                                <a
                                  key={sidx}
                                  href={sub.link}
                                  className="block text-sm text-white/90 py-2 px-2 rounded hover:bg-gray-800"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  {sub.title}
                                </a>
                              ))}
                              <a
                                href={item.link}
                                className="block text-sm font-semibold text-white py-2 px-2 rounded bg-white/15 hover:bg-white/25"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                Смотреть все
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  <a href="/about" className="flex items-center justify-between py-3 px-2 text-base md:text-lg font-medium text-white rounded-lg">О нас</a>
                    <a 
                      href="/brands"
                      className="flex items-center justify-between py-3 px-2 text-base md:text-lg font-medium text-white rounded-lg"
                    >
                      <span>Бренды</span>
                    </a>
                    <a 
                      href="/documentation"
                      className="flex items-center justify-between py-3 px-2 text-base md:text-lg font-medium text-white hover:bg-gray-800 rounded-lg"
                    >
                      <span>Документация</span>
                    </a>
                  </div>
                </div>

                {/* Контактная информация */}
                <div className="mt-6 md:mt-8 border-t border-gray-700 pt-4 md:pt-6">
                  <div className="flex flex-col space-y-3 md:space-y-4">
                    <a href="tel:88005509084" className="flex items-center text-white text-base md:text-lg">                   
                      8-800-550-90-84
                    </a>
                    <a href="mailto:info@donel.su" className="flex items-center text-white text-base md:text-lg">
                      MORELECKTRIKI@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
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
          <div className="max-w-[1280px] mx-auto px-3 md:px-4">
            <div className="flex items-center h-12 md:h-14 gap-0">
              {/* Левая группа: логотип + меню */}
                <div className="flex items-center gap-3 pr-2 sm:gap-6 sm:pr-4">
                <a href="/" className="text-white text-lg font-semibold tracking-widest uppercase">MORELEKTRIKI</a>
                <button
                  ref={stickyCatalogButtonRef}
                  onMouseEnter={() => openCatalogMenuFromButton(stickyCatalogButtonRef.current)}
                  onFocus={() => openCatalogMenuFromButton(stickyCatalogButtonRef.current)}
                  onClick={handleStickyCatalogClick}
                  className="inline-flex items-center text-white/90 hover:text-white text-[12px] sm:text-[13px] tracking-widest uppercase"
                >КАТАЛОГ</button>
                <nav className="hidden sm:flex items-center gap-2 md:gap-3 text-[12px] sm:text-[13px] tracking-widest uppercase flex-wrap">
                  <a href="/brands" className="hover:text-white py-1 px-2 text-sm">Бренды</a>
                  <a href="/sales" className="hover:text-white py-1 px-2 text-sm">Акции</a>
                  <a href="/projects" className="hover:text-white py-1 px-2 text-sm">Проекты</a>
                  <a href="/contacts" className="hover:text-white py-1 px-2 text-sm">Контакты</a>
                </nav>
              </div>
              {/* Центр: поиск */}
              <div className="flex-1 flex items-center  px-2 sm:px-4">
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="group flex items-center justify-between w-full text-white/80 hover:text-white"
                >
                  <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white/80 group-hover:text-white"/>
                </button>
              </div>
              {/* Правая группа: телефон + дизайнеры + иконки */}
              <div className="flex items-center pl-2 sm:pl-4 gap-3 sm:gap-6">
                <div className="hidden md:flex flex-col leading-tight mr-2">
                  <a href="tel:+79265522173" className="text-white text-[18px] font-bold tracking-wide hover:underline">8 (926) 552-21-73</a>
                  <a href="#call" className="text-[11px] text-white/80 uppercase tracking-widest">заказать звонок</a>
                </div>
                <a href="/account" className="hidden sm:inline text-white/90 hover:text-white text-[13px] tracking-widest uppercase">Для дизайнеров</a>
                {/* Мобильная иконка для дизайнеров */}
                <a href="/account" className="sm:hidden inline-flex text-white/90 hover:text-white" aria-label="Для дизайнеров">
                  <User className="w-5 h-5" />
                </a>
                <a href="#stats" className="hidden sm:inline-flex relative text-white/80 hover:text-white">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><rect x="7" y="13" width="3" height="5"/><rect x="12" y="9" width="3" height="9"/><rect x="17" y="5" width="3" height="13"/></svg>
                 
                </a>
                <a href="/liked" className="hidden sm:inline-flex relative text-white/80 hover:text-white">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
                  {likedCount > 0 && (
                    <span className="absolute -top-2 -right-2 text-[10px] bg-white text-black rounded-full px-1">{likedCount}</span>
                  )}
                </a>
                <a href="/cart" className="relative text-white/80 hover:text-white">
                  <ShoppingCart className="w-5 h-5"/>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 text-[10px] bg-white text-black rounded-full px-1">{cartCount}</span>
                  )}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно поиска */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[99999] flex items-start md:items-center justify-center p-4">
          {/* Блюр фон */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsSearchOpen(false)}
          />
          
          {/* Модальное окно */}
          <div className="relative backdrop-blur-2xl bg-black/20 rounded-2xl shadow-2xl w-full max-w-2xl mt-16 md:mt-0 search-modal-enter">
            {/* Заголовок */}
            <div className="flex items-center justify-between p-3">
              <h3 className="text-3xl md:text-4xl font-semibold text-white">Поиск товаров</h3>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            {/* Поле поиска */}
            <div className="p-4 md:p-6">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-white" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    placeholder="Введите название товара..."
                    className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-4 text-base md:text-lg bg-black/10 backdrop-blur-2xl rounded-xl focus:ring-white focus:border-transparent outline-none transition-all"
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-6 md:px-8 py-3 md:py-4 bg-transparent text-white rounded-xl transition-colors font-medium"
                >
                  Найти
                </button>
              </div>
            </div>
            
            {/* Результаты поиска */}
            {searchQuery && (
              <div className="max-h-[60vh] md:max-h-96 overflow-y-auto">
                {searchResultsContent}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Порталы для выпадающих меню */}
      {/* Каталог меню: полноширинная панель */}
      {/* Боковая панель каталога (drawer) */}
      {/* Боковая панель каталога (drawer) с анимацией */}
      {typeof window !== 'undefined' && isCatalogDrawerMounted && createPortal(
        <div className={"fixed inset-0 z-[99999]"} onTransitionEnd={() => {
          // Ensure overlay pointer-events are disabled when closed
          const overlay = document.getElementById('catalog-overlay');
          if (overlay && !isCatalogMenuOpen) overlay.classList.add('pointer-events-none');
          if (overlay && isCatalogMenuOpen) overlay.classList.remove('pointer-events-none');
        }}>
          <div
            id="catalog-overlay"
            className={"absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 " + (isCatalogMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}
            onClick={() => setIsCatalogMenuOpen(false)}
          />
          <aside aria-hidden={!isCatalogMenuOpen} className={"absolute left-0 top-0 bottom-0 w-[360px] bg-white/95 backdrop-blur-lg p-4 overflow-hidden shadow-2xl transform transition-transform duration-300 " + (isCatalogMenuOpen ? 'translate-x-0' : '-translate-x-[100%]') }>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-black">Меню</h3>
              <button onClick={() => setIsCatalogMenuOpen(false)} className="p-2 text-black text-2xl leading-none">×</button>
            </div>
            {/* Вертикальный список меню */}
            <div className="overflow-y-auto hide-scrollbar" style={{ maxHeight: 'calc(110vh - 140px)' }}>
              <div className="space-y-2">
                {catalogData.lighting.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <img src={item.image} alt={item.title} className="w-20 h-20 object-contain rounded" />
                    <div>
                      <a href={item.link.replace('/osveheny', '/catalog')} className="text-base font-semibold text-black">{item.title}</a>
                      <div className="mt-2 flex flex-col text-sm text-black/70">
                        {item.subcategories?.slice(0, 6).map((sub, sidx) => (
                          <a key={sidx} href={sub.link.replace('/osveheny', '/catalog')} className="py-1">{sub.title}</a>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>,
        document.body
      )}

      {/* Brands menu portal - alphabet + vertical brand list */}
      {typeof window !== 'undefined' && isBrandsMenuOpen && createPortal(
        <div id="brands-menu" className="fixed left-0 right-0 z-[99999] catalog-3d" style={{ top: brandsTopOffset }}>
          <div className="border-t border-black/5 bg-white/20 backdrop-blur-xl shadow-2xl catalog-book-enter menu-transition" role="menu" aria-label="Бренды" tabIndex={0}>
            <div className="max-w-[1280px] mx-auto px-4 py-4">
              <div className="flex gap-6">
                <div className="w-3/12">
             
                  {/* Alphabet */}
                  <div className="flex flex-wrap   bg-white/10 rounded-lg p-3">
                    <button
                      key="all"
                      onClick={() => setBrandAlphabet('Все')}
                      className={clsx('py-0 px-2 text-3xl  text-black/80 text-left w-full', brandAlphabet === 'Все' && 'bg-black/5 font-semibold')}
                    >
                      Все
                    </button>
                    
                    {ALPHABET.map((letter) => (
                      <button
                        key={letter}
                        onClick={() => setBrandAlphabet(letter)}
                        className={clsx('py-1 px-2 text-sm text-black/80 text-left w-full', brandAlphabet === letter && 'bg-black/5 font-semibold')}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex-1  mt-5">
                <div className="text-3xl p-2 font-bold text-black">Бренды</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {/* For now pull brands list from public/images/brands folder names (static mapping) */}
                    {BRANDS_LIST.filter(b => {
                      const pretty = prettifyBrandName(b);
                      if (brandAlphabet === 'Все') return true;
                      return pretty.charAt(0).toUpperCase() === brandAlphabet;
                    }).map((brand) => (
                      <a key={brand} href={`/brands?brand=${encodeURIComponent(brand)}`} className="flex items-center gap-3 p-2 bg-white/30 rounded hover:bg-white/40">
                        <img src={`/images/brands/${brand}.png`} alt={brand} className="w-12 h-12 object-contain" />
                        <span className="text-sm text-black/90">{prettifyBrandName(brand)}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

     

    

     
    </>
  );
};

export default Header;