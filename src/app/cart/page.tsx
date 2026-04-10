
'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { ClipLoader } from 'react-spinners';
import LoadingSpinner from '../../components/LoadingSpinner';
import Link from 'next/link';
import { ChevronRight, Trash2, Plus, Minus, X, Download } from 'lucide-react';
import { ProductI } from '../../types/interfaces';
import * as XLSX from 'xlsx';
import Head from 'next/head';

// --- ИНТЕРФЕЙСЫ (без изменений) ---
interface CartProductI extends ProductI {
  imageUrl?: string;
}

interface OrderData {
  firstName: string;
  lastName:string;
  phone: string;
  email: string;
  comment: string;
  paymentMethod: 'cash' | 'card';
  deliveryMethod: 'pickup' | 'delivery';
}

// --- КОМПОНЕНТ ---
const Cart: React.FC = () => {
  const router = useRouter();
  const [cartProducts, setCartProducts] = useState<CartProductI[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);
  
  // НОВОЕ СОСТОЯНИЕ: для управления видимостью формы заказа
  const [isCheckoutFormVisible, setCheckoutFormVisible] = useState<boolean>(false);

  const [notifications, setNotifications] = useState<Array<{id: number, message: string, type: 'success' | 'error' | 'info'}>>([]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    // ИСПРАВЛЕНИЕ: Добавлен Math.random(), чтобы ключи точно были уникальными, 
    // даже если несколько уведомлений вызваны в одну миллисекунду.
    const id = Date.now() + Math.random(); 
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 2500);
  };

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Слушаем события от других компонентов
  useEffect(() => {
    const handleExternalNotification = (event: any) => {
      const { message, type } = event.detail;
      showNotification(message, type);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('showNotification', handleExternalNotification);
      
      return () => {
        window.removeEventListener('showNotification', handleExternalNotification);
      };
    }
  }, []);
  
  // Состояния для формы заказа
  const [orderData, setOrderData] = useState<OrderData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    comment: '',
    paymentMethod: 'cash',
    deliveryMethod: 'pickup'
  });

  // Загружаем товары из корзины (без проверки авторизации)
  useEffect(() => {
    if (!isClient) return;

    const fetchCartProducts = async () => {
      setIsLoading(false);
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
        const storedCartCount = localStorage.getItem('cartCount');

        if (storedCartCount) {
          setCartCount(Number(storedCartCount));
        }

        if (Array.isArray(cart)) {
          if (cart.length > 0) {
            setCartProducts(cart.map((product: any) => ({
              ...product,
              _id: product.id || product._id || product.productId,
              quantity: product.quantity || 1
            })));
          } else {
            setError('В корзине пока нет товаров. Добавьте товары из каталога.');
          }
        }
        else if (cart.products && cart.products.length > 0) {
          const productsWithFullInfo = cart.products.some((p: any) => p.name);
          
          if (productsWithFullInfo) {
            setCartProducts(cart.products.map((product: any) => ({
              ...product,
              _id: product.id || product._id || product.productId,
              quantity: product.quantity || 1
            })));
          } else {
            try {
              const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/products/list`,
                { products: cart.products },
                { headers: { 'Content-Type': 'application/json' } }
              );
              
              const productsWithImages = response.data.products.map((product: CartProductI) => {
                const imageUrl = (() => {
                  if (typeof product.imageAddresses === 'string') return product.imageAddresses;
                  if (Array.isArray(product.imageAddresses) && product.imageAddresses.length > 0) return product.imageAddresses[0];
                  if (typeof product.imageAddress === 'string') return product.imageAddress;
                  if (Array.isArray(product.imageAddress) && product.imageAddress.length > 0) return product.imageAddress[0];
                  return '/placeholder.jpg';
                })();

                return {
                  ...product,
                  imageUrl,
                  quantity: cart.products.find((p: any) => p.productId === product._id)?.quantity || 1
                };
              });
              
              setCartProducts(productsWithImages);
            } catch (apiError) {
              setCartProducts(cart.products.map((product: any) => ({
                ...product,
                _id: product.productId || product._id,
                name: product.name || `Товар ${product.article || product.productId}`,
                imageUrl: '/placeholder.jpg',
                quantity: product.quantity || 1
              })));
            }
          }
        } else {
          setError('В корзине пока нет товаров. Добавьте товары из каталога.');
        }
      } catch (err) {
        setError('Произошла ошибка при загрузке товаров. Пожалуйста, попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => { setIsLoading(false); }, 3000);
    fetchCartProducts();
    return () => clearTimeout(timeoutId);
  }, [isClient]);

  const handleRemoveProduct = (productId: string) => {
    const updatedCart = cartProducts.filter(product => product._id !== productId);
    setCartProducts(updatedCart);
    
    if (!isClient) return;
    
    let cartData;
    const currentCart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
    
    if (Array.isArray(currentCart)) {
      cartData = updatedCart;
    } else {
      cartData = {
        products: updatedCart.map(product => ({
          productId: product._id,
          article: product.article,
          source: product.source,
          quantity: product.quantity || 1
        }))
      };
    }
    
    localStorage.setItem('cart', JSON.stringify(cartData));
    const newCount = updatedCart.reduce((acc, product) => acc + (product.quantity || 1), 0);
    setCartCount(newCount);
    localStorage.setItem('cartCount', newCount.toString());
    showNotification('Товар удален из корзины', 'success');
    
    if (updatedCart.length === 0) setError('В корзине пока нет товаров. Добавьте товары из каталога.');
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updatedProducts = cartProducts.map(product => product._id === productId ? { ...product, quantity: newQuantity } : product);
    setCartProducts(updatedProducts);
    
    if (!isClient) return;
    
    let cartData;
    const currentCart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
    if (Array.isArray(currentCart)) {
      cartData = updatedProducts;
    } else {
      cartData = {
        products: updatedProducts.map(product => ({
          productId: product._id,
          article: product.article,
          source: product.source,
          quantity: product.quantity || 1
        }))
      };
    }
    
    localStorage.setItem('cart', JSON.stringify(cartData));
    const newCount = updatedProducts.reduce((acc, product) => acc + (product.quantity || 1), 0);
    setCartCount(newCount);
    localStorage.setItem('cartCount', newCount.toString());
  };

  const handleIncreaseQuantity = (productId: string) => {
    const product = cartProducts.find(p => p._id === productId);
    if (product) handleUpdateQuantity(productId, (product.quantity || 1) + 1);
  };

  const handleDecreaseQuantity = (productId: string) => {
    const product = cartProducts.find(p => p._id === productId);
    if (product && (product.quantity || 1) > 1) handleUpdateQuantity(productId, (product.quantity || 1) - 1);
  };

  const handleClearCart = () => {
    setCartProducts([]);
    setCartCount(0);
    if (!isClient) return;
    
    let emptyCart;
    const currentCart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
    if (Array.isArray(currentCart)) {
      emptyCart = [];
    } else {
      emptyCart = { products: [] };
    }
    
    localStorage.setItem('cart', JSON.stringify(emptyCart));
    localStorage.setItem('cartCount', '0');
    setError('В корзине пока нет товаров. Добавьте товары из каталога.');
    showNotification('Корзина очищена', 'success');
  };

  const handleExportToExcel = () => {
    if (cartProducts.length === 0) {
      showNotification('Корзина пуста. Нечего экспортировать.', 'error');
      return;
    }
    try {
      const excelData = cartProducts.map((product, index) => ({
        '№': index + 1,
        'Название': product.name || 'Без названия',
        'Артикул': product.article || 'Не указан',
        'Источник': product.source || 'Не указан',
        'Количество': product.quantity || 1,
        'Цена за единицу (₽)': product.price ? `${product.price} ₽` : 'По запросу',
        'Общая стоимость (₽)': product.price ? `${product.price * (product.quantity || 1)} ₽` : 'По запросу',
        'Описание': product.description || 'Не указано'
      } as any));

      excelData.push({
        '№': '', 'Название': '', 'Артикул': '', 'Источник': '', 'Количество': '',
        'Цена за единицу (₽)': 'ИТОГО:',
        'Общая стоимость (₽)': `${subtotal.toLocaleString('ru-RU')} ₽`,
        'Скидка (₽)': hasDiscount ? `${discountAmount.toLocaleString('ru-RU')} ₽ (${discountPercent}%)` : '0 ₽',
        'Итого к оплате (₽)': `${totalAmount.toLocaleString('ru-RU')} ₽`,
        'Статус': isDesigner ? 'Дизайнер' : 'Обычный пользователь',
        'Описание': ''
      } as any);

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const colWidths = [{ wch: 5 }, { wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 18 }, { wch: 20 }, { wch: 30 }];
      worksheet['!cols'] = colWidths;
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Корзина');
      const currentDate = new Date().toLocaleDateString('ru-RU').replace(/\./g, '-');
      XLSX.writeFile(workbook, `Корзина_${currentDate}.xlsx`);
      showNotification('Корзина успешно экспортирована в Excel!', 'success');
    } catch (error) {
      showNotification('Произошла ошибка при экспорте. Попробуйте снова.', 'error');
    }
  };

  const handleOrderDataChange = (field: keyof OrderData, value: string) => {
    setOrderData(prev => ({ ...prev, [field]: value }));
  };

  const validateOrderForm = (): boolean => {
    if (!orderData.firstName.trim()) { showNotification('Пожалуйста, введите ваше имя', 'error'); return false; }
    if (!orderData.lastName.trim()) { showNotification('Пожалуйста, введите вашу фамилию', 'error'); return false; }
    if (!orderData.phone.trim()) { showNotification('Пожалуйста, введите номер телефона', 'error'); return false; }
    if (!orderData.email.trim()) { showNotification('Пожалуйста, введите email', 'error'); return false; }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(orderData.email)) { showNotification('Пожалуйста, введите корректный email адрес', 'error'); return false; }
    return true;
  };

  const getApiUrl = () => {
    let apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) return apiUrl;
    if (typeof window !== 'undefined') {
      const currentOrigin = window.location.origin;
      const possibleApiUrls = [currentOrigin + '/api', currentOrigin, 'https://api.moreelektriki.ru', 'https://moreelektriki.ru/api'];
      return possibleApiUrls[0];
    }
    throw new Error('Невозможно определить API URL');
  };

  const confirmOrder = async (paymentType: 'online' | 'offline') => {
    const currentIsDesigner = getCurrentDesignerStatus();
    
    const orderSubtotal = cartProducts.reduce((sum, product) => sum + (product.price || 0) * (product.quantity || 1), 0);
    const orderDiscountPercent = currentIsDesigner ? 25 : (orderSubtotal >= 1 ? 15 : 0);
    const orderDiscountAmount = orderDiscountPercent > 0 ? (orderSubtotal * orderDiscountPercent) / 100 : 0;
    const orderTotalAmount = orderSubtotal - orderDiscountAmount;
    
    if (isSubmitting) return;
    if (!validateOrderForm()) return;
    if (cartProducts.length === 0) {
      showNotification('Корзина пуста! Добавьте товары для оформления заказа.', 'error');
      return;
    }

    setIsSubmitting(true);

    const products = cartProducts.map((product) => ({
      name: product.name,
      article: product.article,
      source: product.source,
      quantity: product.quantity || 1,
      price: product.price || 0,
    }));

    const authToken = isClient ? localStorage.getItem('token') : null;
    const isAuthenticated = !!authToken;
    
    let orderPayload;
    if (isAuthenticated) {
      orderPayload = {
        products: products, customerData: orderData, paymentType: paymentType,
        subtotal: orderSubtotal, discountAmount: orderDiscountAmount,
        totalAmount: orderTotalAmount, discountPercent: orderDiscountPercent, isDesigner: currentIsDesigner
      };
    } else {
      orderPayload = {
        products: products,
        guestInfo: { name: orderData.firstName, surname: orderData.lastName, phone: orderData.phone, email: orderData.email, comment: orderData.comment, address: '' },
        paymentMethod: orderData.paymentMethod, deliveryMethod: orderData.deliveryMethod, paymentType: paymentType,
        subtotal: orderSubtotal, discountAmount: orderDiscountAmount, totalAmount: orderTotalAmount, discountPercent: orderDiscountPercent, isDesigner: currentIsDesigner
      };
    }

    try {
      const baseUrl = getApiUrl();
      const apiPath = (baseUrl && baseUrl.endsWith('/api')) ? '' : '/api';
      const url = isAuthenticated
        ? (paymentType === 'online' ? `${baseUrl}${apiPath}/orders/add-order-with-payment` : `${baseUrl}${apiPath}/orders/add-order-without-payment`)
        : (paymentType === 'online' ? `${baseUrl}${apiPath}/guest-orders/add-order-with-payment` : `${baseUrl}${apiPath}/guest-orders/add-order-without-payment`);

      const headers: any = { 'Content-Type': 'application/json' };
      if (isAuthenticated) headers.Authorization = `Bearer ${authToken}`;

      showNotification('Обработка заказа...', 'info');
      const response = await axios.post(url, orderPayload, { headers: headers, timeout: 30000 });

      if (paymentType === 'online') {
        const paymentUrl = response.data.paymentUrl;
        const orderId = response.data.orderId;
        if (paymentUrl) {
          if (orderId && isClient) localStorage.setItem('pendingOrderId', orderId);
          showNotification('Перенаправляем на оплату...', 'success');
          if (typeof window !== 'undefined') window.location.href = paymentUrl;
        } else {
          showNotification('Не удалось получить URL для оплаты. Попробуйте позже.', 'error');
        }
      } else {
        showNotification('Заказ успешно создан!', 'success');
        handleClearCart();
        setTimeout(() => { router.push('/orders'); }, 1000);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
          showNotification('Ошибка сети или таймаут. Проверьте подключение.', 'error');
          return;
        }
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          if (error.response.status === 403 && isClient) localStorage.removeItem('token');
          try {
            const altBaseUrl = process.env.NEXT_PUBLIC_API_URL;
            const altApiPath = (altBaseUrl && altBaseUrl.endsWith('/api')) ? '' : '/api';
            const altUrl = paymentType === 'online'
              ? (altBaseUrl + altApiPath + '/guest-orders/add-order-with-payment')
              : (altBaseUrl + altApiPath + '/guest-orders/add-order-without-payment');
            
            const altHeaders = { 'Content-Type': 'application/json' };
            const altResponse = await axios.post(altUrl, orderPayload, { headers: altHeaders });
            
            if (paymentType === 'online') {
              if (altResponse.data.paymentUrl) {
                if (altResponse.data.orderId && isClient) localStorage.setItem('pendingOrderId', altResponse.data.orderId);
                showNotification('Перенаправляем на оплату...', 'success');
                if (typeof window !== 'undefined') window.location.href = altResponse.data.paymentUrl;
                return;
              }
            } else {
              showNotification('Заказ успешно создан!', 'success');
              handleClearCart();
              setTimeout(() => { router.push('/orders'); }, 1000);
              return;
            }
          } catch (altError) {
             showNotification('Временно недоступно оформление заказов без регистрации.', 'error');
          }
        } else {
          showNotification('Ошибка ' + (error.response?.status) + ': ' + (error.response?.data?.message || 'Неизвестная ошибка'), 'error');
        }
      } else {
        showNotification('Произошла неизвестная ошибка.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtotal = cartProducts.reduce((sum, product) => sum + (product.price || 0) * (product.quantity || 1), 0);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  useEffect(() => {
    if (!isClient) return;
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try { setUserProfile(JSON.parse(savedProfile)); } catch (e) {}
    }
  }, [isClient]);

  const getCurrentDesignerStatus = () => {
    if (!isClient) return false;
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try { return JSON.parse(savedProfile)?.role === 'Дизайнер'; } catch (e) {}
    }
    return userProfile?.role === 'Дизайнер';
  };

  const isDesigner = getCurrentDesignerStatus();
  const discountThreshold = 50000;
  const regularDiscountPercent = 15;
  const designerDiscountPercent = 25;
  const discountPercent = isDesigner ? designerDiscountPercent : regularDiscountPercent;
  const hasDiscount = isDesigner ? true : subtotal >= discountThreshold;
  const discountAmount = hasDiscount ? (subtotal * discountPercent) / 100 : 0;
  const totalAmount = subtotal - discountAmount;

  if (!isClient || isLoading) {
    return (
      <section className="min-h-screen bg-[#fcfcfc]">
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner isLoading={true} />
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#fcfcfc] text-black py-12 sm:py-16 md:py-24 font-sans">
      <Head>
        <title>Корзина - Ваши товары | Moreelektriki</title>
        <meta name="description" content="Оформите заказ из корзины: светильники, люстры, розетки, выключатели. Быстрое оформление, доставка по России, скидки дизайнерам 25%." />
        <meta name="robots" content="noindex, follow" />
      </Head>

      {/* Уведомления */}
      <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none w-full max-w-sm px-4">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4"
            >
              <div className="bg-black text-white px-5 py-4 flex items-center space-x-3 text-sm font-bold tracking-wide uppercase">
                 <div className="w-5 h-5 border border-white flex items-center justify-center text-xs">
                   {n.type === 'success' ? '✓' : n.type === 'error' ? '✕' : 'ℹ'}
                 </div>
                 <span>{n.message}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        
        {/* Шапка страницы */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-bold uppercase tracking-tight leading-none break-words">
            КОРЗИНА
          </h1>
          {isDesigner && (
            <div className="mt-4 md:mt-0 border border-black px-4 py-2 inline-flex items-center gap-2">
              <span className="text-black text-xs font-bold uppercase tracking-widest">Дизайнер / Скидка 25%</span>
            </div>
          )}
        </div>

        {/* Информационная панель */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-gray-200 gap-4">
          <div className="text-sm font-bold uppercase tracking-wider text-black">
            {cartProducts.length} {cartProducts.length === 1 ? 'ТОВАР' : cartProducts.length >= 2 && cartProducts.length <= 4 ? 'ТОВАРА' : 'ТОВАРОВ'}
          </div>
          {cartProducts.length > 0 && (
            <div className="flex gap-6 text-sm font-bold uppercase tracking-wider">
              <button onClick={handleExportToExcel} className="hover:text-gray-500 transition-colors flex items-center gap-2">
                <Download size={16} /> <span>EXCEL</span>
              </button>
              <button onClick={handleClearCart} className="hover:text-red-600 transition-colors flex items-center gap-2">
                <Trash2 size={16} /> <span>ОЧИСТИТЬ</span>
              </button>
            </div>
          )}
        </div>

        {/* Содержимое */}
        <AnimatePresence mode="wait">
          {error || cartProducts.length === 0 ? (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-20 text-center">
              <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wide mb-4 text-black">Ваша корзина пуста</h2>
              <p className="text-lg text-gray-500 max-w-md mx-auto">{error || 'Перейдите в каталог, чтобы добавить товары.'}</p>
              <Link href="/catalog" className="inline-block mt-8 bg-black text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">
                ПЕРЕЙТИ В КАТАЛОГ
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-16 lg:gap-x-16">
              
              {/* Левая колонка - Товары */}
              <div className="lg:col-span-8">
                <div className="space-y-0">
                  <AnimatePresence>
                    {cartProducts.map((product) => (
                      <motion.div
                        layout
                        key={product._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="py-6 border-b border-gray-200 group relative flex flex-col sm:flex-row gap-6"
                      >
                        {/* Изображение */}
                        <div className="sm:w-32 md:w-40 flex-shrink-0 bg-gray-100 relative">
                          <Link href={`/products/${product.source}/${product.article}`} className="block relative pt-[100%]">
                            <img src={`${product.imageUrl || '/placeholder.jpg'}?q=75&w=400`} alt={product.name as string} className="absolute inset-0 w-full h-full object-contain p-4 mix-blend-multiply" loading="lazy" />
                          </Link>
                        </div>
                        
                        {/* Инфо */}
                        <div className="flex-1 flex flex-col justify-between relative">
                          <button onClick={() => handleRemoveProduct(product._id)} className="absolute top-0 right-0 text-gray-400 hover:text-black transition-colors p-2 -mt-2 -mr-2">
                            <X size={20} />
                          </button>
                          
                          <div>
                            <Link href={`/products/${product.source}/${product.article}`} className="block pr-8 mb-2">
                              <h3 className="text-lg md:text-xl font-medium leading-tight text-black hover:text-gray-500 transition-colors">
                                {product.name as string || 'Без названия'}
                              </h3>
                            </Link>
                            <div className="text-xs font-bold uppercase tracking-widest text-gray-500 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-2">
                              <span>АРТ: {product.article}</span>
                              <span className="flex items-center gap-2">
                                {typeof product.stock !== 'undefined' ? (
                                  Number(product.stock) > 0 ? ( <><span className="w-1.5 h-1.5 bg-black rounded-full"></span> В НАЛИЧИИ</> ) : ( <><span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span> НЕТ В НАЛИЧИИ</> )
                                ) : ( 'ОСТАТОК: —' )}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-row items-end justify-between mt-6">
                            {/* Выбор количества */}
                            <div className="flex items-center border border-gray-300">
                              <button onClick={() => handleDecreaseQuantity(product._id)} className="w-10 h-10 flex items-center justify-center text-black hover:bg-gray-100 transition-colors disabled:opacity-30" disabled={(product.quantity || 1) <= 1}>
                                <Minus size={14} />
                              </button>
                              <input type="number" min="1" max="999" value={product.quantity || 1} onChange={(e) => handleUpdateQuantity(product._id, parseInt(e.target.value) || 1)} className="w-12 h-10 text-center font-bold text-black bg-transparent outline-none appearance-none" />
                              <button onClick={() => handleIncreaseQuantity(product._id)} className="w-10 h-10 flex items-center justify-center text-black hover:bg-gray-100 transition-colors">
                                <Plus size={14} />
                              </button>
                            </div>
                            
                            {/* Цена */}
                            <div className="text-xl md:text-2xl font-bold text-black tracking-tight">
                              {product.price ? `${((product.price || 0) * (product.quantity || 1)).toLocaleString('ru-RU')} ₽` : 'ПО ЗАПРОСУ'}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Правая колонка - Итого и форма заказа */}
              <div className="lg:col-span-4 relative">
                <div className="sticky top-24  pt-8">
                  <h3 className="text-2xl font-bold uppercase tracking-tight text-black mb-8">СВОДКА ЗАКАЗА</h3>
                  
                  <div className="space-y-4 text-base font-medium">
                    <div className="flex justify-between items-center text-black">
                      <span>СУММА</span>
                      <span>{subtotal.toLocaleString('ru-RU')} ₽</span>
                    </div>
                    {hasDiscount && (
                      <div className="flex justify-between items-center text-gray-500">
                        <span>СКИДКА ({discountPercent}%)</span>
                        <span>– {discountAmount.toLocaleString('ru-RU')} ₽</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-black">
                      <span>ДОСТАВКА</span>
                      <span>БЕСПЛАТНО</span>
                    </div>
                  </div>
                  
                  <div className="pt-6 mt-6 border-t border-gray-200">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold uppercase tracking-widest text-black">ИТОГО</span>
                      <span className="text-3xl font-bold tracking-tight text-black">{totalAmount.toLocaleString('ru-RU')} ₽</span>
                    </div>
                  </div>

                  {/* Кнопка "Оформить заказ" */}
                  {!isCheckoutFormVisible && (
                    <div className="mt-8">
                       <button 
                         onClick={() => setCheckoutFormVisible(true)}
                         className="w-full py-5 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                       >
                         ОФОРМИТЬ ЗАКАЗ
                       </button>
                    </div>
                  )}

                  {/* Скрытая форма */}
                  <AnimatePresence>
                    {isCheckoutFormVisible && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-8 border-t border-gray-200 pt-8"
                      >
                        <div className="space-y-8">
                          
                          {/* Оплата */}
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">СПОСОБ ОПЛАТЫ</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <label className={`cursor-pointer border py-4 text-center transition-colors ${orderData.paymentMethod === 'cash' ? 'border-black bg-black text-white' : 'border-gray-300 bg-transparent text-black hover:border-gray-400'}`}>
                                <input type="radio" value="cash" checked={orderData.paymentMethod === 'cash'} onChange={(e) => handleOrderDataChange('paymentMethod', e.target.value as 'cash')} className="sr-only" />
                                <span className="text-sm font-bold uppercase tracking-wider">НАЛИЧНЫМИ</span>
                              </label>
                              <label className={`cursor-pointer border py-4 text-center transition-colors ${orderData.paymentMethod === 'card' ? 'border-black bg-black text-white' : 'border-gray-300 bg-transparent text-black hover:border-gray-400'}`}>
                                <input type="radio" value="card" checked={orderData.paymentMethod === 'card'} onChange={(e) => handleOrderDataChange('paymentMethod', e.target.value as 'card')} className="sr-only" />
                                <span className="text-sm font-bold uppercase tracking-wider">КАРТОЙ</span>
                              </label>
                            </div>
                          </div>

                          {/* Доставка */}
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">СПОСОБ ПОЛУЧЕНИЯ</h4>
                            <div className="grid grid-cols-1 gap-4">
                              <label className={`cursor-pointer border p-4 flex flex-col transition-colors ${orderData.deliveryMethod === 'pickup' ? 'border-black' : 'border-gray-300 hover:border-gray-400'}`}>
                                  <input type="radio" value="pickup" checked={orderData.deliveryMethod === 'pickup'} onChange={(e) => handleOrderDataChange('deliveryMethod', e.target.value as 'pickup')} className="sr-only" />
                                  <span className="text-sm font-bold uppercase tracking-wider text-black">САМОВЫВОЗ</span>
                                  <span className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Из магазина</span>
                              </label>
                              <label className={`cursor-pointer border p-4 flex flex-col transition-colors ${orderData.deliveryMethod === 'delivery' ? 'border-black' : 'border-gray-300 hover:border-gray-400'}`}>
                                  <input type="radio" value="delivery" checked={orderData.deliveryMethod === 'delivery'} onChange={(e) => handleOrderDataChange('deliveryMethod', e.target.value as 'delivery')} className="sr-only" />
                                  <span className="text-sm font-bold uppercase tracking-wider text-black">ДОСТАВКА</span>
                                  <span className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Курьером Яндекс GO</span>
                              </label>
                            </div>
                          </div>

                          {/* Контакты */}
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">КОНТАКТНЫЕ ДАННЫЕ</h4>
                            <div className="space-y-4">
                              <input type="text" placeholder="ИМЯ" value={orderData.firstName} onChange={(e) => handleOrderDataChange('firstName', e.target.value)} className="w-full px-5 py-4 bg-transparent border border-gray-300 text-black text-sm uppercase tracking-wider focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder-gray-400" />
                              <input type="text" placeholder="ФАМИЛИЯ" value={orderData.lastName} onChange={(e) => handleOrderDataChange('lastName', e.target.value)} className="w-full px-5 py-4 bg-transparent border border-gray-300 text-black text-sm uppercase tracking-wider focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder-gray-400" />
                              <input type="tel" placeholder="ТЕЛЕФОН" value={orderData.phone} onChange={(e) => handleOrderDataChange('phone', e.target.value)} className="w-full px-5 py-4 bg-transparent border border-gray-300 text-black text-sm uppercase tracking-wider focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder-gray-400" />
                              <input type="email" placeholder="EMAIL" value={orderData.email} onChange={(e) => handleOrderDataChange('email', e.target.value)} className="w-full px-5 py-4 bg-transparent border border-gray-300 text-black text-sm uppercase tracking-wider focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder-gray-400" />
                              <textarea placeholder="КОММЕНТАРИЙ" rows={3} value={orderData.comment} onChange={(e) => handleOrderDataChange('comment', e.target.value)} className="w-full px-5 py-4 bg-transparent border border-gray-300 text-black text-sm uppercase tracking-wider focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder-gray-400 resize-none" />
                            </div>
                          </div>
                          
                          {/* Кнопка отправки */}
                          <div className="pt-4">
                            <button 
                              onClick={() => confirmOrder(orderData.paymentMethod === 'card' ? 'online' : 'offline')} 
                              disabled={isSubmitting} 
                              className="w-full py-5 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-gray-800 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                              {isSubmitting ? <><ClipLoader color="#ffffff" size={16} /> ОБРАБОТКА...</> : (orderData.paymentMethod === 'card' ? 'ОПЛАТИТЬ ОНЛАЙН' : 'ПОДТВЕРДИТЬ ЗАКАЗ')}
                            </button>
                            <p className="text-xs text-gray-400 mt-4 text-center uppercase tracking-wider leading-relaxed">
                              Нажимая кнопку, вы соглашаетесь с условиями обработки данных.
                            </p>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Cart;