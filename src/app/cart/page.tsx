'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { ClipLoader } from 'react-spinners';
import LoadingSpinner from '../../components/LoadingSpinner';
import Link from 'next/link';
import { ShoppingCart, ChevronRight, Share2, Trash2, Plus, Minus, X, Download, ChevronLeft } from 'lucide-react';
import { ProductI } from '../../types/interfaces';
import * as XLSX from 'xlsx';
import Head from 'next/head';

// Расширяем интерфейс ProductI для корзины
interface CartProductI extends ProductI {
  imageUrl?: string;
}

// Интерфейс для данных заказа
interface OrderData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  comment: string;
  paymentMethod: 'cash' | 'card';
  deliveryMethod: 'pickup' | 'delivery';
}

const Cart: React.FC = () => {
  const router = useRouter();
  const [cartProducts, setCartProducts] = useState<CartProductI[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);

  // Состояние для отображения формы оформления заказа
  const [isCheckoutFormVisible, setIsCheckoutFormVisible] = useState(false);
  
  // Состояние для уведомлений
  const [notifications, setNotifications] = useState<Array<{id: number, message: string, type: 'success' | 'error' | 'info'}>>([]);

  // Стильные всплывающие уведомления
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 2500);
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

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
            setError('В корзине пока нет товаров. Добавьте товары из каталога, чтобы увидеть их здесь.');
          }
        } else if (cart.products && cart.products.length > 0) {
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
              console.error('❌ Ошибка загрузки товаров с сервера:', apiError);
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
          setError('В корзине пока нет товаров. Добавьте товары из каталога, чтобы увидеть их здесь.');
        }
      } catch (err) {
        const axiosError = err as AxiosError;
        console.error('Ошибка при загрузке корзины:', axiosError.message);
        setError('Произошла ошибка при загрузке товаров. Пожалуйста, попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => setIsLoading(false), 3000);
    fetchCartProducts();
    return () => clearTimeout(timeoutId);
  }, [isClient]);

  // Функция удаления товара из корзины
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
    
    if (updatedCart.length === 0) {
      setError('В корзине пока нет товаров. Добавьте товары из каталога, чтобы увидеть их здесь.');
    }
  };

  // Функция изменения количества товара
  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedProducts = cartProducts.map(product => 
      product._id === productId ? { ...product, quantity: newQuantity } : product
    );
    
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
    if (product) {
      handleUpdateQuantity(productId, (product.quantity || 1) + 1);
    }
  };

  const handleDecreaseQuantity = (productId: string) => {
    const product = cartProducts.find(p => p._id === productId);
    if (product && (product.quantity || 1) > 1) {
      handleUpdateQuantity(productId, (product.quantity || 1) - 1);
    }
  };

  // Функция очистки корзины
  const handleClearCart = () => {
    setCartProducts([]);
    setCartCount(0);
    
    if (!isClient) return;
    
    let emptyCart = Array.isArray(JSON.parse(localStorage.getItem('cart') || '[]')) ? [] : { products: [] };
    
    localStorage.setItem('cart', JSON.stringify(emptyCart));
    localStorage.setItem('cartCount', '0');
    setError('В корзине пока нет товаров. Добавьте товары из каталога, чтобы увидеть их здесь.');
    showNotification('Корзина очищена', 'success');
  };

  // Функция экспорта корзины в Excel
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
      }));

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

      worksheet['!cols'] = [ { wch: 5 }, { wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 18 }, { wch: 20 }, { wch: 30 }];
      
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Корзина');
      const fileName = `Корзина_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      showNotification('Корзина успешно экспортирована в Excel!', 'success');
    } catch (error) {
      console.error('Ошибка при экспорте:', error);
      showNotification('Произошла ошибка при экспорте. Попробуйте снова.', 'error');
    }
  };

  const handleOrderDataChange = (field: keyof OrderData, value: string) => {
    setOrderData(prev => ({ ...prev, [field]: value }));
  };

  const validateOrderForm = (): boolean => {
    if (!orderData.firstName.trim()) {
      showNotification('Пожалуйста, введите ваше имя', 'error');
      return false;
    }
    if (!orderData.lastName.trim()) {
      showNotification('Пожалуйста, введите вашу фамилию', 'error');
      return false;
    }
    if (!orderData.phone.trim()) {
      showNotification('Пожалуйста, введите номер телефона для связи', 'error');
      return false;
    }
    if (!orderData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderData.email)) {
      showNotification('Пожалуйста, введите корректный email адрес', 'error');
      return false;
    }
    return true;
  };
    
  // --- EXISTING API AND ORDER LOGIC ---
  // This block is kept as-is, as requested.
  const getApiUrl = () => {
    let apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) return apiUrl;
    if (typeof window !== 'undefined') {
      return window.location.origin + '/api';
    }
    throw new Error('Невозможно определить API URL');
  };

  const confirmOrder = async (paymentType: 'online' | 'offline') => {
    if (isSubmitting) return;
    if (!validateOrderForm()) return;
    if (cartProducts.length === 0) {
      showNotification('Корзина пуста!', 'error');
      return;
    }

    setIsSubmitting(true);
    const currentIsDesigner = getCurrentDesignerStatus();
    const orderSubtotal = cartProducts.reduce((sum, p) => sum + (p.price || 0) * (p.quantity || 1), 0);
    const orderDiscountPercent = currentIsDesigner ? 25 : (orderSubtotal >= 50000 ? 15 : 0);
    const orderDiscountAmount = (orderSubtotal * orderDiscountPercent) / 100;
    const orderTotalAmount = orderSubtotal - orderDiscountAmount;
    
    const products = cartProducts.map(p => ({
      name: p.name, article: p.article, source: p.source,
      quantity: p.quantity || 1, price: p.price || 0,
    }));

    const authToken = isClient ? localStorage.getItem('token') : null;
    const isAuthenticated = !!authToken;

    let orderPayload;
    if (isAuthenticated) {
      orderPayload = {
        products, customerData: orderData, paymentType, subtotal: orderSubtotal,
        discountAmount: orderDiscountAmount, totalAmount: orderTotalAmount,
        discountPercent: orderDiscountPercent, isDesigner: currentIsDesigner
      };
    } else {
      orderPayload = {
        products,
        guestInfo: {
          name: orderData.firstName, surname: orderData.lastName,
          phone: orderData.phone, email: orderData.email,
          comment: orderData.comment, address: ''
        },
        paymentMethod: orderData.paymentMethod, deliveryMethod: orderData.deliveryMethod,
        paymentType, subtotal: orderSubtotal, discountAmount: orderDiscountAmount,
        totalAmount: orderTotalAmount, discountPercent: orderDiscountPercent,
        isDesigner: currentIsDesigner
      };
    }

    try {
      const baseUrl = getApiUrl();
      const apiPath = baseUrl.endsWith('/api') ? '' : '/api';
      const url = isAuthenticated
        ? `${baseUrl}${apiPath}/orders/add-order-with-${paymentType === 'online' ? 'payment' : 'without-payment'}`
        : `${baseUrl}${apiPath}/guest-orders/add-order-with-${paymentType === 'online' ? 'payment' : 'without-payment'}`;
      
      const headers: any = { 'Content-Type': 'application/json' };
      if (isAuthenticated) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await axios.post(url, orderPayload, { headers, timeout: 30000 });

      if (paymentType === 'online' && response.data.paymentUrl) {
        if (response.data.orderId && isClient) {
          localStorage.setItem('pendingOrderId', response.data.orderId);
        }
        showNotification('Перенаправляем на оплату...', 'success');
        if (typeof window !== 'undefined') {
          window.location.href = response.data.paymentUrl;
        }
      } else {
        showNotification('Заказ успешно создан!', 'success');
        handleClearCart();
        setTimeout(() => router.push('/orders'), 1000);
      }
    } catch (error) {
      console.error('❌ Ошибка при создании заказа:', error);
      const axiosError = error as AxiosError;
      const message = (axiosError.response?.data as any)?.message || 'Произошла ошибка при оформлении заказа.';
      showNotification(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  // --- END OF EXISTING API AND ORDER LOGIC ---

  const subtotal = cartProducts.reduce((sum, product) => sum + (product.price || 0) * (product.quantity || 1), 0);

  const [userProfile, setUserProfile] = useState<any>(null);
  
  useEffect(() => {
    if (!isClient) return;
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try { setUserProfile(JSON.parse(savedProfile)); } 
      catch (error) { console.error('Ошибка парсинга профиля:', error); }
    }
  }, [isClient]);

  const getCurrentDesignerStatus = () => {
    if (!isClient) return false;
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        return profile?.role === 'Дизайнер';
      } catch (e) { return false; }
    }
    return userProfile?.role === 'Дизайнер';
  };

  const isDesigner = getCurrentDesignerStatus();
  const discountThreshold = 50000;
  const regularDiscountPercent = 15;
  const designerDiscountPercent = 25;
  const discountPercent = isDesigner ? designerDiscountPercent : (subtotal >= discountThreshold ? regularDiscountPercent : 0);
  const hasDiscount = discountPercent > 0;
  const discountAmount = hasDiscount ? (subtotal * discountPercent) / 100 : 0;
  const totalAmount = subtotal - discountAmount;

  if (!isClient || isLoading) {
    return (
      <section className="min-h-screen bg-white text-gray-800">
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner isLoading={true} />
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-white text-gray-800">
      <Head>
        <title>Корзина - Ваши товары | Moreelektriki</title>
        <meta name="description" content="Оформите заказ из корзины: светильники, люстры, розетки, выключатели. Быстрое оформление, доставка по России, скидки дизайнерам 25%." />
        <meta name="robots" content="noindex, follow" />
      </Head>
      
      {/* Notifications */}
      <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="mb-4"
            >
              <div className="bg-white/80 backdrop-blur-md border border-gray-200 shadow-lg rounded-xl px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                    n.type === 'success' ? 'bg-green-100 text-green-600' :
                    n.type === 'error' ? 'bg-red-100 text-red-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {n.type === 'success' ? '✓' : n.type === 'error' ? '✕' : 'ℹ'}
                  </div>
                  <div className="text-gray-800 font-medium text-sm">
                    {n.message}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Page Header */}
      <div className="pt-40 pb-10 bg-gray-50">
        <div className="container max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold text-gray-900">Корзина</h1>
          {isDesigner && (
            <div className="mt-4 inline-flex items-center gap-2 bg-purple-100 border border-purple-200 rounded-full px-3 py-1">
              <span className="text-purple-700 text-sm font-medium">Дизайнер</span>
              <span className="text-gray-700 text-sm">Ваша скидка 25%</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="container max-w-7xl mx-auto px-4 pb-20 mt-8">
        <div className="flex justify-between items-center mb-6">
          <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md text-sm border border-gray-200">
            {cartProducts.length} {cartProducts.length === 1 ? 'товар' : cartProducts.length >= 2 && cartProducts.length <= 4 ? 'товара' : 'товаров'}
          </div>

          {cartProducts.length > 0 && (
            <div className="flex gap-2 sm:gap-4">
              <button onClick={handleExportToExcel} className="px-3 py-2 text-gray-600 hover:text-green-600 transition-colors flex items-center gap-2 rounded-md hover:bg-gray-100">
                <Download size={16} />
                <span className="hidden sm:inline text-sm">Excel</span>
              </button>
              <button onClick={handleClearCart} className="px-3 py-2 text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2 rounded-md hover:bg-gray-100">
                <Trash2 size={16} />
                <span className="hidden sm:inline text-sm">Очистить</span>
              </button>
            </div>
          )}
        </div>

        <AnimatePresence>
          {isLoading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center py-20">
              <ClipLoader color="#111827" size={40} />
            </motion.div>
          ) : error ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Корзина пуста</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">{error}</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-1/4 relative flex-shrink-0 bg-gray-50">
                        <Link href={`/products/${product.source}/${product.article}`} className="block relative w-full h-48 sm:h-full">
                          <img src={`${product.imageUrl}?q=75&w=400`} alt={product.name as string} className="absolute inset-0 w-full h-full object-contain p-2" loading="lazy" />
                        </Link>
                      </div>

                      <div className="flex-1 p-4 relative min-w-0">
                        <button onClick={() => handleRemoveProduct(product._id)} className="absolute top-3 right-3 w-8 h-8 bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 rounded-full flex items-center justify-center transition-colors">
                          <X size={16} />
                        </button>
                        <Link href={`/products/${product.source}/${product.article}`} className="block pr-8">
                          <h3 className="font-semibold text-gray-800 hover:text-black transition-colors truncate">
                            {product.name as string || 'Без названия'}
                          </h3>
                        </Link>
                        <div className="text-sm text-gray-500 mt-1 mb-4 flex items-center justify-between">
                          <span>Артикул: {product.article}</span>
                          {typeof product.stock !== 'undefined' ? (
                            <span className={`text-sm ${Number(product.stock) > 0 ? 'text-green-600' : 'text-orange-500'}`}>
                              {Number(product.stock) > 0 ? 'В наличии' : 'Под заказ'}
                            </span>
                          ) : <span className="text-sm text-gray-400">—</span>}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="text-xl font-bold text-gray-900">
                            {product.price ? `${((product.price || 0) * (product.quantity || 1)).toLocaleString('ru-RU')} ₽` : 'По запросу'}
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleDecreaseQuantity(product._id)} disabled={(product.quantity || 1) <= 1} className="w-10 h-10 flex items-center justify-center text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50">
                              <Minus size={16} />
                            </button>
                            <input type="number" min="1" value={product.quantity || 1} onChange={(e) => handleUpdateQuantity(product._id, parseInt(e.target.value) || 1)} className="w-14 h-10 text-center font-semibold text-gray-800 bg-transparent border-none outline-none" />
                            <button onClick={() => handleIncreaseQuantity(product._id)} className="w-10 h-10 flex items-center justify-center text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div className="mt-6">
                  <Link href="/catalog" className="inline-flex items-center text-black font-medium hover:underline">
                    <ChevronLeft size={16} className="mr-1" />
                    Продолжить покупки
                  </Link>
                </div>
              </div>

              {/* Order Summary & Checkout Form */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 border border-gray-200 rounded-xl sticky top-24">
                    {/* Summary Block */}
                    <div className="p-6 space-y-3">
                      {!hasDiscount && subtotal > 0 && !isDesigner && (
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-center text-sm text-orange-800">
                          До скидки 15% осталось: <span className="font-bold">{(discountThreshold - subtotal).toLocaleString('ru-RU')} ₽</span>
                        </div>
                      )}
                      {hasDiscount && (
                        <div className={`p-3 border rounded-lg text-center text-sm ${isDesigner ? 'bg-purple-50 border-purple-200 text-purple-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
                          {isDesigner ? 'Скидка дизайнера 25% применена!' : 'Ваша скидка 15% применена!'}
                        </div>
                      )}
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Товаров на</span>
                        <span className="font-medium text-gray-800">{subtotal.toLocaleString('ru-RU')} ₽</span>
                      </div>
                      {hasDiscount && (
                        <div className="flex justify-between items-center text-gray-600">
                          <span>Скидка {discountPercent}%</span>
                          <span className={`font-medium ${isDesigner ? 'text-purple-600' : 'text-green-600'}`}>–{discountAmount.toLocaleString('ru-RU')} ₽</span>
                        </div>
                      )}
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-900">Итого:</span>
                          <span className="text-xl font-bold text-gray-900">{totalAmount.toLocaleString('ru-RU')} ₽</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Checkout Form Container (Animated) */}
                    <AnimatePresence>
                      {isCheckoutFormVisible && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1, transition: { opacity: { delay: 0.1 } } }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          {/* Payment Method */}
                          <div className="p-6 border-t border-gray-200">
                            <h3 className="font-semibold mb-3 text-gray-900">Способ оплаты</h3>
                            <div className="grid grid-cols-1 gap-2">
                              <label className={`relative cursor-pointer block p-3 rounded-lg border transition-all ${orderData.paymentMethod === 'cash' ? 'border-gray-800 bg-white' : 'border-gray-200 bg-white hover:border-gray-400'}`}>
                                <input type="radio" name="paymentMethod" value="cash" checked={orderData.paymentMethod === 'cash'} onChange={(e) => handleOrderDataChange('paymentMethod', e.target.value)} className="sr-only" />
                                <span className="font-medium text-gray-800">Наличными или при получении</span>
                              </label>
                              <label className={`relative cursor-pointer block p-3 rounded-lg border transition-all ${orderData.paymentMethod === 'card' ? 'border-gray-800 bg-white' : 'border-gray-200 bg-white hover:border-gray-400'}`}>
                                <input type="radio" name="paymentMethod" value="card" checked={orderData.paymentMethod === 'card'} onChange={(e) => handleOrderDataChange('paymentMethod', e.target.value)} className="sr-only" />
                                <span className="font-medium text-gray-800">Банковской картой онлайн</span>
                              </label>
                            </div>
                          </div>

                          {/* Delivery Method */}
                          <div className="p-6 border-t border-gray-200">
                            <h3 className="font-semibold mb-3 text-gray-900">Способ получения</h3>
                            <div className="grid grid-cols-1 gap-2">
                              <label className={`relative cursor-pointer block p-3 rounded-lg border transition-all ${orderData.deliveryMethod === 'pickup' ? 'border-gray-800 bg-white' : 'border-gray-200 bg-white hover:border-gray-400'}`}>
                                <input type="radio" name="deliveryMethod" value="pickup" checked={orderData.deliveryMethod === 'pickup'} onChange={(e) => handleOrderDataChange('deliveryMethod', e.target.value)} className="sr-only" />
                                <span className="font-medium text-gray-800 block">Самовывоз</span>
                                <span className="text-gray-500 text-sm">Бесплатно из магазина</span>
                              </label>
                              <label className={`relative cursor-pointer block p-3 rounded-lg border transition-all ${orderData.deliveryMethod === 'delivery' ? 'border-gray-800 bg-white' : 'border-gray-200 bg-white hover:border-gray-400'}`}>
                                <input type="radio" name="deliveryMethod" value="delivery" checked={orderData.deliveryMethod === 'delivery'} onChange={(e) => handleOrderDataChange('deliveryMethod', e.target.value)} className="sr-only" />
                                <span className="font-medium text-gray-800 block">Доставка</span>
                                <span className="text-gray-500 text-sm">Рассчитаем по вашему адресу</span>
                              </label>
                            </div>
                          </div>

                          {/* Contact Details */}
                          <div className="p-6 border-t border-gray-200">
                            <h3 className="font-semibold mb-1 text-gray-900">Контактные данные</h3>
                            <p className="text-sm text-gray-500 mb-4">Для связи и оформления заказа.</p>
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input type="text" placeholder="Имя" value={orderData.firstName} onChange={(e) => handleOrderDataChange('firstName', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black" />
                                <input type="text" placeholder="Фамилия" value={orderData.lastName} onChange={(e) => handleOrderDataChange('lastName', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black" />
                              </div>
                              <input type="tel" placeholder="Телефон" value={orderData.phone} onChange={(e) => handleOrderDataChange('phone', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black" />
                              <input type="email" placeholder="Электронная почта" value={orderData.email} onChange={(e) => handleOrderDataChange('email', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black" />
                              <textarea placeholder="Комментарий к заказу" rows={2} value={orderData.comment} onChange={(e) => handleOrderDataChange('comment', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400 resize-none focus:outline-none focus:border-black focus:ring-1 focus:ring-black" />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Action Buttons */}
                    <div className="p-6 border-t border-gray-200">
                        {!isCheckoutFormVisible ? (
                           <button 
                                onClick={() => setIsCheckoutFormVisible(true)}
                                className="w-full py-3 px-5 bg-black text-white rounded-md font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                Перейти к оформлению
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <button 
                                    onClick={() => confirmOrder(orderData.paymentMethod === 'card' ? 'online' : 'offline')}
                                    disabled={isSubmitting}
                                    className="w-full py-3 px-5 bg-black text-white rounded-md font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 disabled:bg-gray-400"
                                >
                                    {isSubmitting ? <><ClipLoader color="#ffffff" size={18} /> Обработка...</> : 'Подтвердить заказ'}
                                </button>
                                <p className="text-xs text-gray-500 text-center">
                                    Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных.
                                </p>
                            </div>
                        )}
                    </div>
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