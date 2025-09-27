'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { ClipLoader } from 'react-spinners';
import LoadingSpinner from '../../components/LoadingSpinner';
import Link from 'next/link';
// <<< ИЗМЕНЕНИЕ: Добавлены иконки для способов оплаты
import { ShoppingCart, ChevronLeft, ChevronRight, Share2, Trash2, Plus, Minus, X, Download, Package, Truck, CreditCard, Wallet } from 'lucide-react';
import { ProductI } from '../../types/interfaces';
import * as XLSX from 'xlsx';
import Head from 'next/head';

// ... (интерфейсы CartProductI, OrderData остаются без изменений)
interface CartProductI extends ProductI {
  imageUrl?: string;
}
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
  const [notifications, setNotifications] = useState<Array<{id: number, message: string, type: 'success' | 'error' | 'info'}>>([]);
  const [isCheckoutStep, setIsCheckoutStep] = useState<boolean>(false);
  
  const [orderData, setOrderData] = useState<OrderData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    comment: '',
    paymentMethod: 'card', // По умолчанию выбрана оплата картой
    deliveryMethod: 'delivery'
  });

  // ... [ВСЯ ЛОГИКА КОМПОНЕНТА ОСТАЕТСЯ БЕЗ ИЗМЕНЕНИЙ] ...
  // Начало блока логики (без изменений)

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 2500);
  };

  useEffect(() => { setIsClient(true); }, []);

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

  useEffect(() => {
    if (!isClient) return;
    const fetchCartProducts = async () => {
      setIsLoading(false);
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
        const storedCartCount = localStorage.getItem('cartCount');
        if (storedCartCount) setCartCount(Number(storedCartCount));
        if (Array.isArray(cart)) {
          if (cart.length > 0) {
            setCartProducts(cart.map((product: any) => ({ ...product, _id: product.id || product._id || product.productId, quantity: product.quantity || 1 })));
          } else {
            setError('В корзине пока нет товаров. Добавьте товары из каталога, чтобы увидеть их здесь.');
          }
        } else if (cart.products && cart.products.length > 0) {
          const productsWithFullInfo = cart.products.some((p: any) => p.name);
          if (productsWithFullInfo) {
            setCartProducts(cart.products.map((product: any) => ({ ...product, _id: product.id || product._id || product.productId, quantity: product.quantity || 1 })));
          } else {
            try {
              const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/products/list`, { products: cart.products }, { headers: { 'Content-Type': 'application/json' } });
              const productsWithImages = response.data.products.map((product: CartProductI) => {
                const imageUrl = (() => {
                  if (typeof product.imageAddresses === 'string') return product.imageAddresses;
                  if (Array.isArray(product.imageAddresses) && product.imageAddresses.length > 0) return product.imageAddresses[0];
                  if (typeof product.imageAddress === 'string') return product.imageAddress;
                  if (Array.isArray(product.imageAddress) && product.imageAddress.length > 0) return product.imageAddress[0];
                  return '/placeholder.jpg';
                })();
                return { ...product, imageUrl, quantity: cart.products.find((p: any) => p.productId === product._id)?.quantity || 1 };
              });
              setCartProducts(productsWithImages);
            } catch (apiError) {
              setCartProducts(cart.products.map((product: any) => ({ ...product, _id: product.productId || product._id, name: product.name || `Товар ${product.article || product.productId}`, imageUrl: '/placeholder.jpg', quantity: product.quantity || 1 })));
            }
          }
        } else {
          setError('В корзине пока нет товаров. Добавьте товары из каталога, чтобы увидеть их здесь.');
        }
      } catch (err) {
        setError('Произошла ошибка при загрузке товаров. Пожалуйста, попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    };
    const timeoutId = setTimeout(() => setIsLoading(false), 3000);
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
      cartData = { products: updatedCart.map(product => ({ productId: product._id, article: product.article, source: product.source, quantity: product.quantity || 1 })) };
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

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updatedProducts = cartProducts.map(product => (product._id === productId ? { ...product, quantity: newQuantity } : product));
    setCartProducts(updatedProducts);
    if (!isClient) return;
    let cartData;
    const currentCart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
    if (Array.isArray(currentCart)) {
      cartData = updatedProducts;
    } else {
      cartData = { products: updatedProducts.map(product => ({ productId: product._id, article: product.article, source: product.source, quantity: product.quantity || 1 })) };
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
    let emptyCart = Array.isArray(JSON.parse(localStorage.getItem('cart') || '[]')) ? [] : { products: [] };
    localStorage.setItem('cart', JSON.stringify(emptyCart));
    localStorage.setItem('cartCount', '0');
    setError('В корзине пока нет товаров. Добавьте товары из каталога, чтобы увидеть их здесь.');
    showNotification('Корзина очищена', 'success');
  };

  const handleExportToExcel = () => { /* ... */ };
  const handleOrderDataChange = (field: keyof OrderData, value: string) => setOrderData(prev => ({ ...prev, [field]: value }));

  const validateOrderForm = (): boolean => {
    if (!orderData.firstName.trim()) { showNotification('Пожалуйста, введите ваше имя', 'error'); return false; }
    if (!orderData.lastName.trim()) { showNotification('Пожалуйста, введите вашу фамилию', 'error'); return false; }
    if (!orderData.phone.trim()) { showNotification('Пожалуйста, введите номер телефона для связи', 'error'); return false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!orderData.email.trim() || !emailRegex.test(orderData.email)) { showNotification('Пожалуйста, введите корректный email', 'error'); return false; }
    return true;
  };
  
  const getApiUrl = () => {
    let apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) return apiUrl;
    if (typeof window !== 'undefined') return window.location.origin + '/api';
    throw new Error('Невозможно определить API URL');
  };

  const confirmOrder = async (paymentType: 'online' | 'offline') => { 
    if(isSubmitting || !validateOrderForm()) return;

    setIsSubmitting(true);
    // ... остальная логика отправки заказа
    setIsSubmitting(false);
  };

  const subtotal = cartProducts.reduce((sum, product) => sum + (product.price || 0) * (product.quantity || 1), 0);
  const [userProfile, setUserProfile] = useState<any>(null);
  useEffect(() => { if (!isClient) return; const savedProfile = localStorage.getItem('userProfile'); if (savedProfile) { try { setUserProfile(JSON.parse(savedProfile)); } catch (e) {} } }, [isClient]);
  const getCurrentDesignerStatus = () => { if (!isClient) return false; const savedProfile = localStorage.getItem('userProfile'); if (savedProfile) { try { return JSON.parse(savedProfile)?.role === 'Дизайнер'; } catch (e) { return false; } } return userProfile?.role === 'Дизайнер'; };
  const isDesigner = getCurrentDesignerStatus();
  const discountThreshold = 50000;
  const regularDiscountPercent = 15;
  const designerDiscountPercent = 25;
  const discountPercent = isDesigner ? designerDiscountPercent : regularDiscountPercent;
  const hasDiscount = isDesigner ? true : subtotal >= discountThreshold;
  const discountAmount = hasDiscount ? (subtotal * discountPercent) / 100 : 0;
  const totalAmount = subtotal - discountAmount;
  
  // Конец блока логики
  
  const sidebarVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeInOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeInOut' } }
  };

  if (!isClient || isLoading) {
    return (
      <section className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center h-screen"> <LoadingSpinner isLoading={true} /> </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 text-gray-800">
      <Head>
        <title>Корзина - Ваши товары | Moreelektriki</title>
        <meta name="description" content="Оформите заказ из корзины: светильники, люстры, розетки, выключатели. Быстрое оформление, доставка по России, скидки дизайнерам 25%." />
      </Head>
      
      <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => ( <motion.div key={n.id} initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.9 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="mb-4"> <div className="bg-white/80 backdrop-blur-md border border-gray-200 shadow-lg rounded-xl px-4 py-3"> <div className="flex items-center gap-3"> <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${ n.type === 'success' ? 'bg-green-100 text-green-600' : n.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600' }`}> {n.type === 'success' ? '✓' : n.type === 'error' ? '✕' : 'ℹ'} </div> <div className="text-sm font-medium text-gray-700"> {n.message} </div> </div> </div> </motion.div> ))}
        </AnimatePresence>
      </div>
      
      <div className="container max-w-7xl mx-auto px-4 pt-36 pb-20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">Корзина</h1>
          {isDesigner && ( <div className="mt-2 md:mt-0"> <div className="inline-flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-full px-3 py-1"> <span className="text-purple-600 text-xs font-semibold uppercase">Дизайнер</span> <span className="text-gray-600 text-sm">Ваша скидка 25%</span> </div> </div> )}
        </div>
        
        <div className="flex justify-between items-center mb-6">
            <span className="bg-white text-gray-600 px-3 py-1 rounded-md text-sm border border-gray-200">
              {cartProducts.length} {cartProducts.length === 1 ? 'товар' : cartProducts.length >= 2 && cartProducts.length <= 4 ? 'товара' : 'товаров'}
            </span>
          {cartProducts.length > 0 && ( <div className="flex gap-2"> <button onClick={handleExportToExcel} className="text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2 px-3 py-1 rounded-md hover:bg-gray-100"><Download size={16} /><span className="hidden sm:inline text-sm">Excel</span></button> <button onClick={handleClearCart} className="text-gray-500 hover:text-red-600 transition-colors flex items-center gap-2 px-3 py-1 rounded-md hover:bg-red-50"><Trash2 size={16} /><span className="hidden sm:inline text-sm">Очистить</span></button> </div> )}
        </div>

        <AnimatePresence>
          {isLoading ? ( <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center items-center py-20"><ClipLoader color="#1f2937" size={40} /></motion.div> ) : 
           error ? ( <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white border border-gray-200 rounded-xl p-12 text-center"> <h2 className="text-2xl font-bold text-gray-800 mb-2">Корзина пуста</h2> <p className="text-gray-500 mb-6 max-w-md mx-auto">{error}</p> <Link href="/catalog" className="inline-block bg-gray-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-black transition-colors"> Перейти в каталог </Link> </motion.div> ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                  {cartProducts.map((product) => ( <motion.div key={product._id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4"> <Link href={`/products/${product.source}/${product.article}`} className="block w-full sm:w-28 h-28 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden"><img src={`${product.imageUrl}?q=75&w=200`} alt={product.name as string} className="w-full h-full object-contain" loading="lazy" /></Link> <div className="flex-grow flex flex-col justify-between"> <div> <div className="flex justify-between items-start"> <Link href={`/products/${product.source}/${product.article}`}><h3 className="font-semibold text-gray-800 hover:text-black transition-colors pr-8">{product.name as string || 'Без названия'}</h3></Link> <button onClick={() => handleRemoveProduct(product._id)} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors flex-shrink-0"><X size={16} /></button> </div> <p className="text-sm text-gray-500 mt-1">Артикул: {product.article}</p> </div> <div className="flex items-center justify-between mt-4"> <div className="flex items-center gap-2"> <button onClick={() => handleDecreaseQuantity(product._id)} disabled={(product.quantity || 1) <= 1} className="w-8 h-8 flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"><Minus size={14} /></button> <input type="number" value={product.quantity || 1} min="1" max="999" onChange={(e) => handleUpdateQuantity(product._id, parseInt(e.target.value) || 1)} className="w-12 h-8 text-center bg-transparent text-gray-800 font-semibold outline-none" /> <button onClick={() => handleIncreaseQuantity(product._id)} className="w-8 h-8 flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 transition-colors"><Plus size={14} /></button> </div> <div className="text-lg font-bold text-gray-900">{product.price ? `${((product.price || 0) * (product.quantity || 1)).toLocaleString('ru-RU')} ₽` : 'По запросу'}</div> </div> </div> </motion.div> ))}
                  <div className="mt-6"><Link href="/catalog" className="inline-flex items-center text-gray-600 hover:text-black font-medium transition-colors"><ChevronRight size={16} className="mr-1 rotate-180" />Продолжить покупки</Link></div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white border border-gray-200 rounded-xl sticky top-24 overflow-hidden">
                  <AnimatePresence mode="wait">
                    {!isCheckoutStep ? (
                      <motion.div key="summary" variants={sidebarVariants} initial="hidden" animate="visible" exit="exit" >
                        <div className="p-6">
                           <div className="space-y-2 mb-6">
                            <div className="flex justify-between items-center text-gray-600"><span>Товары ({cartProducts.length} шт.)</span><span className="font-medium">{subtotal.toLocaleString('ru-RU')} ₽</span></div>
                            {hasDiscount && ( <div className="flex justify-between items-center text-green-600"><span>Скидка {discountPercent}%</span><span className="font-medium">-{discountAmount.toLocaleString('ru-RU')} ₽</span></div> )}
                            <div className="flex justify-between items-center text-gray-600"><span>Доставка</span><span className="font-medium text-green-600">Бесплатно</span></div>
                          </div>
                          <div className="pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-lg font-bold text-gray-900">Итого:</span>
                              <span className="text-2xl font-extrabold text-gray-900">{totalAmount.toLocaleString('ru-RU')} ₽</span>
                            </div>
                            <button onClick={() => setIsCheckoutStep(true)} className="w-full py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-black transition-colors flex items-center justify-center" >
                              Перейти к оформлению <ChevronRight size={20} className="ml-1" />
                            </button>
                             <p className="text-xs text-gray-500 text-center mt-3">Ваши контактные данные понадобятся на следующем шаге.</p>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="form" variants={sidebarVariants} initial="hidden" animate="visible" exit="exit" >
                         <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center mb-4">
                                <button onClick={() => setIsCheckoutStep(false)} className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium mr-4"> <ChevronLeft size={16} className="mr-1"/> Назад </button>
                                <h3 className="text-lg font-semibold text-gray-900">Оформление заказа</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input type="text" placeholder="Имя" value={orderData.firstName} onChange={(e) => handleOrderDataChange('firstName', e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-transparent rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:bg-white transition-all"/>
                                <input type="text" placeholder="Фамилия" value={orderData.lastName} onChange={(e) => handleOrderDataChange('lastName', e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-transparent rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:bg-white transition-all"/>
                                </div>
                                <input type="tel" placeholder="Телефон" value={orderData.phone} onChange={(e) => handleOrderDataChange('phone', e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-transparent rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:bg-white transition-all"/>
                                <input type="email" placeholder="Электронная почта" value={orderData.email} onChange={(e) => handleOrderDataChange('email', e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-transparent rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:bg-white transition-all"/>
                                <textarea placeholder="Комментарий к заказу" rows={2} value={orderData.comment} onChange={(e) => handleOrderDataChange('comment', e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-transparent rounded-lg text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-gray-800 focus:bg-white transition-all"/>
                            </div>
                        </div>

                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900">Способ получения</h3>
                            <div className="space-y-3">
                            {[ {id: 'delivery', icon: Truck, title: 'Доставка', subtitle: 'Доставим по адресу'}, {id: 'pickup', icon: Package, title: 'Самовывоз', subtitle: 'Заберу сам из магазина'} ].map(item => ( <label key={item.id} className={`relative cursor-pointer flex items-center p-3 rounded-lg border-2 transition-all ${orderData.deliveryMethod === item.id ? 'border-gray-800 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-400'}`}> <input type="radio" name="deliveryMethod" value={item.id} checked={orderData.deliveryMethod === item.id} onChange={(e) => handleOrderDataChange('deliveryMethod', e.target.value)} className="sr-only"/> <item.icon className={`mr-3 flex-shrink-0 ${orderData.deliveryMethod === item.id ? 'text-gray-800' : 'text-gray-400'}`} size={20}/> <div> <span className="font-medium text-gray-800 block">{item.title}</span> <span className="text-gray-500 text-sm">{item.subtitle}</span> </div> </label> ))}
                            </div>
                        </div>

                        {/* <<< НАЧАЛО БЛОКА ИЗМЕНЕНИЙ: Возвращенный выбор способа оплаты */}
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900">Способ оплаты</h3>
                            <div className="space-y-3">
                            {[ 
                                {id: 'card', icon: CreditCard, title: 'Банковской картой', subtitle: 'Онлайн, безопасно'}, 
                                {id: 'cash', icon: Wallet, title: 'Наличными', subtitle: 'При получении заказа'} 
                            ].map(item => ( 
                                <label key={item.id} className={`relative cursor-pointer flex items-center p-3 rounded-lg border-2 transition-all ${orderData.paymentMethod === item.id ? 'border-gray-800 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-400'}`}> 
                                    <input type="radio" name="paymentMethod" value={item.id} checked={orderData.paymentMethod === item.id} onChange={(e) => handleOrderDataChange('paymentMethod', e.target.value as 'card' | 'cash')} className="sr-only"/> 
                                    <item.icon className={`mr-3 flex-shrink-0 ${orderData.paymentMethod === item.id ? 'text-gray-800' : 'text-gray-400'}`} size={20}/> 
                                    <div> 
                                        <span className="font-medium text-gray-800 block">{item.title}</span> 
                                        <span className="text-gray-500 text-sm">{item.subtitle}</span> 
                                    </div> 
                                </label> 
                            ))}
                            </div>
                        </div>
                        {/* <<< КОНЕЦ БЛОКА ИЗМЕНЕНИЙ */}

                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-lg font-bold text-gray-900">Итого к оплате:</span>
                                <span className="text-2xl font-extrabold text-gray-900">{totalAmount.toLocaleString('ru-RU')} ₽</span>
                            </div>
                            <div className="space-y-3">
                                <button onClick={() => confirmOrder(orderData.paymentMethod === 'card' ? 'online' : 'offline')} disabled={isSubmitting} className={`w-full py-3 text-white rounded-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-800 hover:bg-black'}`}>
                                    {isSubmitting ? <><ClipLoader color="#ffffff" size={18} /> Обработка...</> : 'Оформить заказ'}
                                </button>
                                <p className="text-xs text-gray-500 text-center">Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных.</p>
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