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
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 2500);
  };

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // ... (остальные useEffect и функции без изменений)
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
      // Сразу завершаем загрузку, так как данные уже есть в localStorage
      setIsLoading(false);
      try {
        // Получаем корзину из localStorage
        const cart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
        console.log('🛒 Текущее содержимое корзины:', cart);
        console.log('🛒 Тип корзины:', Array.isArray(cart) ? 'массив' : 'объект');
        console.log('🛒 Количество товаров:', Array.isArray(cart) ? cart.length : (cart.products ? cart.products.length : 0));
        
        const storedCartCount = localStorage.getItem('cartCount');

        if (storedCartCount) {
          setCartCount(Number(storedCartCount));
        }

        // Если корзина содержит массив продуктов
        if (Array.isArray(cart)) {
          // Проверяем, есть ли в массиве продукты
          if (cart.length > 0) {
            setCartProducts(cart.map((product: any) => ({
              ...product,
              _id: product.id || product._id || product.productId,
              quantity: product.quantity || 1
            })));
          } else {
            setError('В корзине пока нет товаров. Добавьте товары из каталога, чтобы увидеть их здесь.');
          }
        }
        // Если корзина содержит объект с products
        else if (cart.products && cart.products.length > 0) {
          
          // Проверяем, есть ли в каждом продукте информация о товаре или только ID
          const productsWithFullInfo = cart.products.some((p: any) => p.name);
          
          if (productsWithFullInfo) {
            // Продукты уже содержат полную информацию (старый формат)
            console.log('✅ Товары уже содержат полную информацию');
            setCartProducts(cart.products.map((product: any) => ({
              ...product,
              _id: product.id || product._id || product.productId,
              quantity: product.quantity || 1
            })));
          } else {
            // Продукты содержат только ID, нужно загрузить данные с сервера
            console.log('🛒 Загружаем товары с сервера:', cart.products);
            console.log('🌐 API URL:', process.env.NEXT_PUBLIC_API_URL);
            
            try {
            const response = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/api/products/list`,
              { products: cart.products },
              { headers: { 'Content-Type': 'application/json' } }
            );
              
              console.log('✅ Товары загружены с сервера:', response.data);
            
            // Обрабатываем изображения
            const productsWithImages = response.data.products.map((product: CartProductI) => {
              const imageUrl = (() => {
                if (typeof product.imageAddresses === 'string') {
                  return product.imageAddresses;
                } else if (Array.isArray(product.imageAddresses) && product.imageAddresses.length > 0) {
                  return product.imageAddresses[0];
                } else if (typeof product.imageAddress === 'string') {
                  return product.imageAddress;
                } else if (Array.isArray(product.imageAddress) && product.imageAddress.length > 0) {
                  return product.imageAddress[0];
                }
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
              console.log('🔄 Пытаемся показать товары без полных данных');
              
              // Показываем товары с базовой информацией из localStorage
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

    // Добавляем таймаут для завершения загрузки
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Максимум 3 секунды на загрузку

    fetchCartProducts();

    return () => clearTimeout(timeoutId);
  }, [isClient]);

  // Функция удаления товара из корзины
  const handleRemoveProduct = (productId: string) => {
    const updatedCart = cartProducts.filter(product => product._id !== productId);
    setCartProducts(updatedCart);
    
    if (!isClient) return;
    
    // Обновляем localStorage
    let cartData;
    const currentCart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
    
    if (Array.isArray(currentCart)) {
      // Если корзина хранится как массив (старый формат)
      cartData = updatedCart;
    } else {
      // Если корзина хранится как объект с products (новый формат)
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
    
    // Обновляем общее количество товаров
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
    
    const updatedProducts = cartProducts.map(product => {
      if (product._id === productId) {
        return { ...product, quantity: newQuantity };
      }
      return product;
    });
    
    setCartProducts(updatedProducts);
    
    if (!isClient) return;
    
    // Обновляем localStorage
    let cartData;
    const currentCart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
    
    if (Array.isArray(currentCart)) {
      // Если корзина хранится как массив (старый формат)
      cartData = updatedProducts;
    } else {
      // Если корзина хранится как объект с products (новый формат)
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
    
    // Обновляем общее количество товаров
    const newCount = updatedProducts.reduce((acc, product) => acc + (product.quantity || 1), 0);
    setCartCount(newCount);
    localStorage.setItem('cartCount', newCount.toString());
  };

  // Функция увеличения количества
  const handleIncreaseQuantity = (productId: string) => {
    const product = cartProducts.find(p => p._id === productId);
    if (product) {
      handleUpdateQuantity(productId, (product.quantity || 1) + 1);
    }
  };

  // Функция уменьшения количества
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
    
    // Проверяем, в каком формате хранится корзина
    let emptyCart;
    const currentCart = JSON.parse(localStorage.getItem('cart') || '{"products": []}');
    
    if (Array.isArray(currentCart)) {
      // Если корзина хранится как массив (старый формат)
      emptyCart = [];
    } else {
      // Если корзина хранится как объект с products (новый формат)
      emptyCart = { products: [] };
    }
    
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
      // Подготавливаем данные для Excel
      const excelData = cartProducts.map((product, index) => ({
        '№': index + 1,
        'Название': product.name || 'Без названия',
        'Артикул': product.article || 'Не указан',
        'Источник': product.source || 'Не указан',
        'Количество': product.quantity || 1,
        'Цена за единицу (₽)': product.price ? `${product.price} ₽` : 'По запросу',
        'Общая стоимость (₽)': product.price 
          ? `${product.price * (product.quantity || 1)} ₽`
          : 'По запросу',
        'Описание': product.description || 'Не указано'
      } as any));

      // Добавляем итоговую строку
      excelData.push({
        '№': '',
        'Название': '',
        'Артикул': '',
        'Источник': '',
        'Количество': '',
        'Цена за единицу (₽)': 'ИТОГО:',
        'Общая стоимость (₽)': `${subtotal.toLocaleString('ru-RU')} ₽`,
        'Скидка (₽)': hasDiscount ? `${discountAmount.toLocaleString('ru-RU')} ₽ (${discountPercent}%)` : '0 ₽',
        'Итого к оплате (₽)': `${totalAmount.toLocaleString('ru-RU')} ₽`,
        'Статус': isDesigner ? 'Дизайнер' : 'Обычный пользователь',
        'Описание': ''
      } as any);

      // Создаем рабочую книгу
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Настраиваем ширину колонок
      const colWidths = [
        { wch: 5 },   // №
        { wch: 40 },  // Название
        { wch: 15 },  // Артикул
        { wch: 15 },  // Источник
        { wch: 12 },  // Количество
        { wch: 18 },  // Цена за единицу
        { wch: 20 },  // Общая стоимость
        { wch: 30 }   // Описание
      ];
      worksheet['!cols'] = colWidths;

      // Добавляем лист в книгу
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Корзина');

      // Генерируем имя файла с текущей датой
      const currentDate = new Date().toLocaleDateString('ru-RU').replace(/\./g, '-');
      const fileName = `Корзина_${currentDate}.xlsx`;

      // Сохраняем файл
      XLSX.writeFile(workbook, fileName);

      showNotification('Корзина успешно экспортирована в Excel!', 'success');
    } catch (error) {
      console.error('Ошибка при экспорте:', error);
      showNotification('Произошла ошибка при экспорте. Попробуйте снова.', 'error');
    }
  };

  // Функция обновления данных заказа
  const handleOrderDataChange = (field: keyof OrderData, value: string) => {
    setOrderData(prev => ({ ...prev, [field]: value }));
  };

  // Валидация формы
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
    if (!orderData.email.trim()) {
      showNotification('Пожалуйста, введите email для получения уведомлений', 'error');
      return false;
    }
    
    // Простая проверка email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(orderData.email)) {
      showNotification('Пожалуйста, введите корректный email адрес', 'error');
      return false;
    }
    
    return true;
  };

  // Функция для получения API URL с fallback
  const getApiUrl = () => {
    console.log(' Определение API URL...');
    
    // Основной способ - переменная окружения
    let apiUrl = process.env.NEXT_PUBLIC_API_URL;
    console.log(' NEXT_PUBLIC_API_URL: ' + apiUrl);
    
    if (apiUrl) {
      console.log(' Используем URL из переменной окружения');
      return apiUrl;
    }
    
    // Fallback для продакшена
    if (typeof window !== 'undefined') {
      const currentOrigin = window.location.origin;
      console.log(' Current origin: ' + currentOrigin);
      
      // Список возможных API endpoints для продакшена
      const possibleApiUrls = [
        currentOrigin + '/api',
        currentOrigin,
        'https://api.elektromos.ru', // если есть отдельный API домен
        'https://elektromos.ru/api'  // если API на том же домене
      ];
      
      console.log(' Возможные API URLs: ' + JSON.stringify(possibleApiUrls));
      
      // Пробуем первый (самый вероятный)
      apiUrl = possibleApiUrls[0];
      console.log('🔄 Используем fallback URL: ' + apiUrl);
      return apiUrl;
    }
    
    throw new Error('Невозможно определить API URL');
  };

  // Функция подтверждения заказа (обновленная)
  const confirmOrder = async (paymentType: 'online' | 'offline') => {
    // Получаем актуальный статус дизайнера
    const currentIsDesigner = getCurrentDesignerStatus();
    
    console.log('🔍 ===== РАСЧЕТ СКИДКИ =====');
    console.log('🔍 Статус дизайнера:', currentIsDesigner);
    
    // Получаем профиль для логирования
    const savedProfile = isClient ? localStorage.getItem('userProfile') : null;
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        console.log('🔍 Профиль пользователя:', profile);
        console.log('🔍 Роль пользователя:', profile?.role);
      } catch (error) {
        console.error('Ошибка парсинга профиля пользователя:', error);
      }
    }
    
    // Пересчитываем суммы для заказа
    const orderSubtotal = cartProducts.reduce(
      (sum, product) => sum + (product.price || 0) * (product.quantity || 1),
      0
    );
    
    const orderDiscountPercent = currentIsDesigner ? 25 : (orderSubtotal >= 1 ? 15 : 0);
    const orderDiscountAmount = orderDiscountPercent > 0 ? (orderSubtotal * orderDiscountPercent) / 100 : 0;
    const orderTotalAmount = orderSubtotal - orderDiscountAmount;
    
    console.log('🔍 Промежуточная сумма:', orderSubtotal);
    console.log('🔍 Процент скидки:', orderDiscountPercent);
    console.log('🔍 Сумма скидки:', orderDiscountAmount);
    console.log('🔍 Итоговая сумма:', orderTotalAmount);
    console.log('🔍 Порог скидки:', 1);
    console.log('🔍 Превышен порог:', orderSubtotal >= 1);
    console.log('🔍 ===== КОНЕЦ РАСЧЕТА СКИДКИ =====');
    console.log('🛒 ===== НАЧАЛО ОФОРМЛЕНИЯ ЗАКАЗА =====');
    console.log('🛒 Тип оплаты: ' + paymentType);
    console.log('🛒 Данные заказа: ' + JSON.stringify(orderData));
    console.log('🛒 Товары в корзине: ' + cartProducts.length);
    console.log('🛒 Окружение: ' + process.env.NODE_ENV);
    console.log('🛒 User Agent: ' + (typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'));
    
    // Проверка на совместимость браузера
    try {
      if (typeof Object.assign === 'undefined') {
        console.error('❌ Браузер не поддерживает Object.assign');
        showNotification('Ваш браузер устарел. Пожалуйста, обновите браузер для корректной работы.', 'error');
        return;
      }
    } catch (e) {
      console.error('❌ Ошибка проверки совместимости браузера:', e);
    }
    
    if (isSubmitting) {
      console.log('⏳ Заказ уже обрабатывается, прерываем');
      return;
    }
    
    if (!validateOrderForm()) {
      console.log('❌ Валидация формы не прошла');
      return;
    }

    if (cartProducts.length === 0) {
      showNotification('Корзина пуста! Добавьте товары для оформления заказа.', 'error');
      console.log('❌ Корзина пуста');
      return;
    }

    setIsSubmitting(true);

    const products = cartProducts.map((product) => {
      return {
        name: product.name,
        article: product.article,
        source: product.source,
        quantity: product.quantity || 1,
        price: product.price || 0,
      };
    });

    // Проверяем, авторизован ли пользователь для формирования правильной структуры данных
    const authToken = isClient ? localStorage.getItem('token') : null;
    const isAuthenticated = !!authToken;
    
    console.log('🔐 Проверка токена авторизации:');
    console.log('🔐 Токен есть:', !!authToken);
    if (authToken) {
      console.log('🔐 Длина токена:', authToken.length);
      console.log('🔐 Первые 50 символов:', authToken.substring(0, 50) + '...');
      
      // Попробуем декодировать JWT без проверки подписи (только для диагностики)
      try {
        const tokenParts = authToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('🔐 Payload токена:', payload);
          console.log('🔐 Время истечения (exp):', new Date(payload.exp * 1000));
          console.log('🔐 Текущее время:', new Date());
          console.log('🔐 Токен истек:', new Date() > new Date(payload.exp * 1000));
        }
      } catch (e) {
        console.log('🔐 Ошибка декодирования токена:', e);
      }
    }
    
    let orderPayload;
    
    if (isAuthenticated) {
      // Для авторизованных пользователей
      orderPayload = {
        products: products,
        customerData: orderData,
        paymentType: paymentType,
        subtotal: orderSubtotal,
        discountAmount: orderDiscountAmount,
        totalAmount: orderTotalAmount,
        discountPercent: orderDiscountPercent,
        isDesigner: currentIsDesigner
      };
    } else {
      // Для гостевых заказов - данные в объекте guestInfo как ожидает бэкенд
      orderPayload = {
        products: products,
        guestInfo: {
          name: orderData.firstName,
          surname: orderData.lastName,
          phone: orderData.phone,
          email: orderData.email,
          comment: orderData.comment,
          address: '' // пока пустой, можно добавить поле адреса в форму позже
        },
        paymentMethod: orderData.paymentMethod,
        deliveryMethod: orderData.deliveryMethod,
        paymentType: paymentType,
        subtotal: orderSubtotal,
        discountAmount: orderDiscountAmount,
        totalAmount: orderTotalAmount,
        discountPercent: orderDiscountPercent,
        isDesigner: currentIsDesigner
      };
    }

    console.log('📦 Данные для отправки: ' + JSON.stringify(orderPayload));
    console.log('💰 Расчет сумм заказа:');
    console.log('💰 Промежуточная сумма:', orderSubtotal);
    console.log('💰 Процент скидки:', orderDiscountPercent);
    console.log('💰 Сумма скидки:', orderDiscountAmount);
    console.log('💰 Итоговая сумма:', orderTotalAmount);
    console.log('Дизайнер:', currentIsDesigner);
    console.log('🔍 Режим: ' + process.env.NODE_ENV);
    console.log('🌍 Текущий домен: ' + (typeof window !== 'undefined' ? window.location.origin : 'server'));
    console.log('🌐 NEXT_PUBLIC_API_URL из окружения: ' + process.env.NEXT_PUBLIC_API_URL);
    console.log('🔐 Токен авторизации: ' + (isAuthenticated ? 'есть' : 'нет'));

    try {
      // Получаем API URL с fallback
      const baseUrl = getApiUrl();
      
      const apiPath = (baseUrl && baseUrl.endsWith('/api')) ? '' : '/api';
      
      console.log(' Сборка URL...');
      console.log(' baseUrl: ' + baseUrl);
      console.log(' apiPath: ' + apiPath);
      
      // Выбираем правильные эндпоинты в зависимости от авторизации
      const url = isAuthenticated
        ? (paymentType === 'online'
          ? `${baseUrl}${apiPath}/orders/add-order-with-payment`
          : `${baseUrl}${apiPath}/orders/add-order-without-payment`)
        : (paymentType === 'online'
          ? `${baseUrl}${apiPath}/guest-orders/add-order-with-payment`
          : `${baseUrl}${apiPath}/guest-orders/add-order-without-payment`);

      console.log('🌐 Финальный URL для запроса: ' + url);
      console.log('🌐 Исходный API URL: ' + process.env.NEXT_PUBLIC_API_URL);
      console.log('🌐 Используемый Base URL: ' + baseUrl);
      console.log('🌐 Добавленный API Path: ' + apiPath);
      console.log('🔐 Авторизован: ' + isAuthenticated);
      console.log('💳 Тип оплаты: ' + paymentType);

      const headers: any = { 'Content-Type': 'application/json' };
      
      if (isAuthenticated) {
        headers.Authorization = `Bearer ${authToken}`;
        console.log('🔐 Пользователь авторизован, используем защищенные эндпоинты');
      } else {
        console.log('🔓 Пользователь не авторизован, используем гостевые эндпоинты');
      }

      console.log('📋 Заголовки запроса: ' + JSON.stringify(headers));
      console.log('📦 Размер данных: ' + JSON.stringify(orderPayload).length + ' символов');

      // Отправляем запрос (единая логика для всех случаев)
      console.log('📤 Отправляем заказ...');
      showNotification('Обработка заказа...', 'info');
      
      console.log('⏳ Делаем POST запрос...');
      const startTime = Date.now();
      
      const response = await axios.post(url, orderPayload, { 
        headers: headers,
        timeout: 30000, // 30 секунд таймаут
      });
      
      const endTime = Date.now();
      console.log('✅ Запрос завершен за ' + (endTime - startTime) + 'ms');

      console.log('✅ Ответ от сервера: ' + JSON.stringify(response.data));

      if (paymentType === 'online') {
        const paymentUrl = response.data.paymentUrl;
        const orderId = response.data.orderId;
        
        if (paymentUrl) {
          console.log('💳 Перенаправляем на оплату:', paymentUrl);
          console.log('🆔 ID заказа:', orderId);
          
          if (orderId && isClient) {
            localStorage.setItem('pendingOrderId', orderId);
          }
          
          showNotification('Перенаправляем на оплату...', 'success');
          
          if (typeof window !== 'undefined') {
            window.location.href = paymentUrl;
          }
        } else {
          console.log('❌ Нет URL для оплаты в ответе');
          showNotification('Не удалось получить URL для оплаты. Попробуйте позже.', 'error');
        }
                  } else {
              console.log('✅ Авторизованный заказ без оплаты создан успешно');
              showNotification('Заказ успешно создан!', 'success');
              
              // Получаем ID заказа из ответа
              const orderId = response.data.orderId || response.data._id || response.data.id;
              console.log('🆔 ID заказа из ответа:', orderId);
              console.log('🆔 Полный ответ сервера:', JSON.stringify(response.data));
              
              handleClearCart();
              
              // Всегда перенаправляем на страницу заказов после успешного создания
              console.log('🔄 Перенаправляем на страницу заказов');
              console.log('🔄 Router объект:', router);
              console.log('🔄 Текущий URL:', window.location.href);
              setTimeout(() => {
                console.log('🔄 Выполняем router.push("/orders")');
                router.push('/orders');
                console.log('🔄 router.push("/orders") выполнен');
              }, 1000); // Небольшая задержка для отображения сообщения об успехе
            }
    } catch (error) {
      console.error('❌ Ошибка при создании заказа:', error);
      
      if (error instanceof AxiosError) {
        console.log('📊 Тип ошибки: AxiosError');
        console.log('📊 Код ошибки:', error.code);
        console.log('📊 Сообщение ошибки:', error.message);
        console.log('📊 Статус ответа: ' + (error.response && error.response.status));
        console.log('📊 Данные ошибки: ' + JSON.stringify(error.response && error.response.data));
        console.log('📊 Заголовки ошибки: ' + JSON.stringify(error.response && error.response.headers));
        console.log('📊 URL запроса: ' + (error.config && error.config.url));
        console.log('📊 Метод запроса: ' + (error.config && error.config.method));
        
        // Проверка на сетевые ошибки
        if (error.code === 'ECONNABORTED') {
          showNotification('Превышено время ожидания ответа от сервера. Проверьте подключение к интернету.', 'error');
          return;
        }
        
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          showNotification('Ошибка сети. Проверьте подключение к интернету или попробуйте позже.', 'error');
          return;
        }
        
        if (!error.response) {
          console.log('📊 Нет ответа от сервера - возможно проблемы с сетью или CORS');
          showNotification('Не удалось связаться с сервером. Проверьте подключение к интернету.', 'error');
          return;
        }
        
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          // Токен недействителен или пользователь не авторизован
          console.log('🔄 Токен недействителен (401/403), пробуем гостевые эндпоинты...');
          
          // Очищаем недействительный токен
          if (error.response.status === 403 && isClient) {
            localStorage.removeItem('token');
            console.log('🧹 Удалили недействительный токен');
          }
          
          try {
            const altBaseUrl = process.env.NEXT_PUBLIC_API_URL;
            const altApiPath = (altBaseUrl && altBaseUrl.endsWith('/api')) ? '' : '/api';
            const altUrl = paymentType === 'online'
              ? (altBaseUrl + altApiPath + '/guest-orders/add-order-with-payment')
              : (altBaseUrl + altApiPath + '/guest-orders/add-order-without-payment');
            
            console.log('🌐 Альтернативный URL:', altUrl);
            
            const altHeaders = { 'Content-Type': 'application/json' };
            const altResponse = await axios.post(altUrl, orderPayload, { headers: altHeaders });
            
            console.log('✅ Альтернативный запрос успешен:', altResponse.data);
            
            if (paymentType === 'online') {
              const paymentUrl = altResponse.data.paymentUrl;
              const orderId = altResponse.data.orderId;
              
              if (paymentUrl) {
                console.log('💳 Перенаправляем на оплату:', paymentUrl);
                if (orderId && isClient) {
                  localStorage.setItem('pendingOrderId', orderId);
                }
                showNotification('Перенаправляем на оплату...', 'success');
                if (typeof window !== 'undefined') {
                  window.location.href = paymentUrl;
                }
                return;
              }
            } else {
              console.log('✅ Гостевой заказ создан успешно');
              showNotification('Заказ успешно создан!', 'success');
              
              // Получаем ID заказа из ответа
              const orderId = altResponse.data.orderId || altResponse.data._id || altResponse.data.id;
              console.log('🆔 ID заказа из альтернативного ответа:', orderId);
              console.log('🆔 Полный альтернативный ответ сервера:', JSON.stringify(altResponse.data));
              
              handleClearCart();
              
              // Всегда перенаправляем на страницу заказов после успешного создания
              console.log('🔄 Перенаправляем на страницу заказов (альтернативный путь)');
              console.log('🔄 Router объект (альт):', router);
              console.log('🔄 Текущий URL (альт):', window.location.href);
              setTimeout(() => {
                console.log('🔄 Выполняем router.push("/orders") (альт)');
                router.push('/orders');
                console.log('🔄 router.push("/orders") выполнен (альт)');
              }, 1000); // Небольшая задержка для отображения сообщения об успехе
              return;
            }
                     } catch (altError) {
             console.log('❌ Альтернативные эндпоинты также не работают:', altError);
             showNotification('Временно недоступно оформление заказов без регистрации. Попробуйте позже или войдите в аккаунт.', 'error');
           }
        } else if (error.response && error.response.status === 403) {
          showNotification('Ошибка доступа. Проверьте введенные данные.', 'error');
        } else if (error.response && error.response.status === 500) {
          showNotification('Серверная ошибка. Попробуйте позже.', 'error');
        } else if (error.response && error.response.status === 404) {
          showNotification('API эндпоинт не найден. Проверьте настройки сервера.', 'error');
        } else {
          showNotification('Ошибка ' + (error.response && error.response.status) + ': ' + ((error.response && error.response.data && error.response.data.message) || 'Неизвестная ошибка'), 'error');
        }
      } else {
        showNotification('Произошла неизвестная ошибка.', 'error');
      }
    } finally {
      console.log('🏁 ===== ЗАВЕРШЕНИЕ ОФОРМЛЕНИЯ ЗАКАЗА =====');
      setIsSubmitting(false);
    }
  };

  const subtotal = cartProducts.reduce((sum, product) => sum + (product.price || 0) * (product.quantity || 1), 0);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  useEffect(() => {
    if (!isClient) return;
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error('Ошибка парсинга профиля пользователя:', error);
      }
    }
  }, [isClient]);

  const getCurrentDesignerStatus = () => {
    if (!isClient) return false;
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        return profile?.role === 'Дизайнер';
      } catch (error) {
        console.error('Ошибка парсинга профиля пользователя:', error);
      }
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
      <section className="min-h-screen bg-white">
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner isLoading={true} />
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-white text-gray-800">
      <Head>
        <title>Корзина - Ваши товары | Elektromos</title>
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
              initial={{ opacity: 0, y: 50, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.5 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="mb-4"
            >
              <div className="bg-white/80 backdrop-blur-lg border border-gray-200 shadow-xl rounded-lg p-4 flex items-center space-x-3">
                 <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${
                      n.type === 'success' ? 'bg-green-500' : n.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`}>
                   {n.type === 'success' ? '✓' : n.type === 'error' ? '✕' : 'ℹ'}
                 </div>
                 <span className="font-medium text-gray-800">{n.message}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Шапка страницы */}
      <div className="relative bg-white pt-48 px-4">
        <div className="container max-w-[88rem] mx-auto relative z-10">
          <div className="flex items-center justify-start mb-4">
            <h1 className="text-6xl font-bold text-gray-900">Корзина</h1>
          </div>
          {isDesigner && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 bg-purple-100 border border-purple-200 rounded-full px-4 py-2">
                <span className="text-purple-600 text-sm font-medium">Дизайнер</span>
                <span className="text-gray-800 text-sm">Скидка 25%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container max-w-[88rem] mx-auto px-4 pb-20">
        {/* Информационная панель */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md text-sm border border-gray-200">
              {cartProducts.length} {cartProducts.length === 1 ? 'товар' : cartProducts.length >= 2 && cartProducts.length <= 4 ? 'товара' : 'товаров'}
            </span>
          </div>
          {cartProducts.length > 0 && (
            <div className="flex gap-4">
              <button onClick={handleExportToExcel} className="px-4 py-2 text-gray-600 hover:text-green-600 transition-colors flex items-center gap-2">
                <Download size={16} /> <span className="hidden sm:inline">Excel</span>
              </button>
              <button onClick={handleClearCart} className="px-4 py-2 text-gray-600 hover:text-[#b30000] transition-colors flex items-center gap-2">
                <Trash2 size={16} /> <span className="hidden sm:inline">Очистить</span>
              </button>
            </div>
          )}
        </div>

        {/* Содержимое */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center items-center py-20">
              <ClipLoader color="#b30000" size={40} />
            </motion.div>
          ) : error || cartProducts.length === 0 ? (
            <motion.div key="error" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-gray-50 rounded-xl p-12 text-center border border-gray-200">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Корзина пуста</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">{error || 'Добавьте товары из каталога.'}</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Товары в корзине */}
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  <AnimatePresence>
                    {cartProducts.map((product) => (
                      <motion.div
                        layout
                        key={product._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
                        className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300"
                      >
                         <div className="flex flex-col sm:flex-row">
                          <div className="sm:w-1/4 relative flex-shrink-0 bg-gray-50">
                            <Link href={`/products/${product.source}/${product.article}`} className="block relative pt-[100%] sm:pt-0 sm:h-full overflow-hidden">
                              <img src={`${product.imageUrl || '/placeholder.jpg'}?q=75&w=400`} alt={product.name as string} className="absolute inset-0 w-full h-full object-contain p-2" loading="lazy" />
                            </Link>
                          </div>
                          <div className="sm:flex-1 p-4 relative min-w-0">
                            <button onClick={() => handleRemoveProduct(product._id)} className="absolute top-3 right-3 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-[#b30000] hover:text-white transition-colors">
                              <X size={16} />
                            </button>
                            <Link href={`/products/${product.source}/${product.article}`} className="block">
                              <h3 className="text-gray-800 font-semibold mb-2 pr-10 hover:text-[#b30000] transition-colors truncate">
                                {product.name as string || 'Без названия'}
                              </h3>
                            </Link>
                            <div className="text-xs text-gray-500 mb-4 flex items-center justify-between">
                              <div>Артикул: {product.article}</div>
                              <div className="text-right">
                                {typeof product.stock !== 'undefined' ? (
                                  Number(product.stock) > 0 ? ( <div className="text-sm text-green-600">Есть</div> ) : ( <div className="text-sm text-orange-500">Под заказ</div> )
                                ) : ( <div className="text-sm text-gray-400">Остаток: —</div> )}
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="text-xl font-bold text-gray-900">
                                {product.price ? `${((product.price || 0) * (product.quantity || 1)).toLocaleString('ru-RU')} ₽` : 'По запросу'}
                              </div>
                              <div className="flex items-center gap-2 sm:gap-4">
                                <div className="flex items-center rounded-lg border border-gray-200">
                                  <button onClick={() => handleDecreaseQuantity(product._id)} className="w-10 h-10 flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-gray-200 transition-colors rounded-l-md disabled:opacity-50" disabled={(product.quantity || 1) <= 1}>
                                    <Minus size={16} />
                                  </button>
                                  <input type="number" min="1" max="999" value={product.quantity || 1} onChange={(e) => handleUpdateQuantity(product._id, parseInt(e.target.value) || 1)} className="w-12 h-10 text-center font-semibold text-gray-900 bg-white border-l border-r border-gray-200 outline-none focus:ring-1 focus:ring-[#b30000] focus:z-10" />
                                  <button onClick={() => handleIncreaseQuantity(product._id)} className="w-10 h-10 flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-gray-200 transition-colors rounded-r-md">
                                    <Plus size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <div className="mt-6">
                  <Link href="/catalog" className="inline-flex items-center text-[#b30000] hover:text-red-700 transition-colors font-medium">
                    <ChevronRight size={16} className="mr-1 rotate-180" />Продолжить покупки
                  </Link>
                </div>
              </div>

              {/* Итоговая информация - ДИНАМИЧЕСКАЯ */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl sticky top-24">
                  {/* -- ВСЕГДА ВИДИМАЯ ЧАСТЬ -- */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Ваш заказ</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Товаров на</span>
                        <span className="font-medium text-gray-800">{subtotal.toLocaleString('ru-RU')} ₽</span>
                      </div>
                      {hasDiscount && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">{isDesigner ? 'Скидка дизайнера' : 'Скидка'} ({discountPercent}%)</span>
                          <span className={`font-medium ${isDesigner ? 'text-purple-600' : 'text-green-600'}`}>–{discountAmount.toLocaleString('ru-RU')} ₽</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Доставка</span>
                        <span className="text-green-600 font-medium">Бесплатно</span>
                      </div>
                    </div>
                    <div className="pt-4 mt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-900">Итого:</span>
                        <span className="text-2xl font-bold text-[#b30000]">{totalAmount.toLocaleString('ru-RU')} ₽</span>
                      </div>
                    </div>
                  </div>

                  {/* -- КНОПКА ДЛЯ ПОКАЗА ФОРМЫ -- */}
                  {!isCheckoutFormVisible && (
                    <div className="p-6 border-t border-gray-200">
                       <motion.button 
                         layout
                         onClick={() => setCheckoutFormVisible(true)}
                         className="w-full py-3 bg-[#b30000] text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transform hover:scale-105"
                       >
                         Оформить заказ
                       </motion.button>
                    </div>
                  )}

                  {/* -- СКРЫТАЯ ФОРМА -- */}
                  <AnimatePresence>
                    {isCheckoutFormVisible && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 border-t border-gray-200 space-y-6">
                          {/* Способ оплаты */}
                          <div>
                            <h3 className="text-lg font-semibold mb-3 text-gray-900">Способ оплаты</h3>
                            <div className="grid grid-cols-1 gap-3">
                              <label className={`relative cursor-pointer block p-3 rounded-lg border-2 transition-all ${orderData.paymentMethod === 'cash' ? 'border-[#b30000] bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'}`}>
                                <input type="radio" name="paymentMethod" value="cash" checked={orderData.paymentMethod === 'cash'} onChange={(e) => handleOrderDataChange('paymentMethod', e.target.value)} className="sr-only" />
                                <span className="text-gray-800 font-medium">Наличными</span>
                              </label>
                              <label className={`relative cursor-pointer block p-3 rounded-lg border-2 transition-all ${orderData.paymentMethod === 'card' ? 'border-[#b30000] bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'}`}>
                                <input type="radio" name="paymentMethod" value="card" checked={orderData.paymentMethod === 'card'} onChange={(e) => handleOrderDataChange('paymentMethod', e.target.value)} className="sr-only" />
                                <span className="text-gray-800 font-medium">Банковской картой</span>
                              </label>
                            </div>
                          </div>

                          {/* Способ получения */}
                          <div>
                            <h3 className="text-lg font-semibold mb-3 text-gray-900">Способ получения</h3>
                            <div className="grid grid-cols-1 gap-3">
                              <label className={`relative cursor-pointer block p-3 rounded-lg border-2 transition-all ${orderData.deliveryMethod === 'pickup' ? 'border-[#b30000] bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'}`}>
                                  <input type="radio" name="deliveryMethod" value="pickup" checked={orderData.deliveryMethod === 'pickup'} onChange={(e) => handleOrderDataChange('deliveryMethod', e.target.value)} className="sr-only" />
                                  <span className="font-medium text-gray-800 block">Самовывоз</span>
                                  <span className="text-gray-500 text-sm">Заберу сам из магазина</span>
                              </label>
                              <label className={`relative cursor-pointer block p-3 rounded-lg border-2 transition-all ${orderData.deliveryMethod === 'delivery' ? 'border-[#b30000] bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'}`}>
                                  <input type="radio" name="deliveryMethod" value="delivery" checked={orderData.deliveryMethod === 'delivery'} onChange={(e) => handleOrderDataChange('deliveryMethod', e.target.value)} className="sr-only" />
                                  <span className="font-medium text-gray-800 block">Доставка</span>
                                  <span className="text-gray-500 text-sm">Доставим по вашему адресу</span>
                              </label>
                            </div>
                          </div>

                          {/* Контактные данные */}
                          <div>
                            <h3 className="text-lg font-semibold mb-1 text-gray-900">Контактные данные</h3>
                            <p className="text-sm text-gray-500 mb-4">Укажите ваши данные для связи.</p>
                            <div className="space-y-4">
                              <input type="text" placeholder="Имя" value={orderData.firstName} onChange={(e) => handleOrderDataChange('firstName', e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000] transition-all" />
                              <input type="text" placeholder="Фамилия" value={orderData.lastName} onChange={(e) => handleOrderDataChange('lastName', e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000] transition-all" />
                              <input type="tel" placeholder="Телефон" value={orderData.phone} onChange={(e) => handleOrderDataChange('phone', e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000] transition-all" />
                              <input type="email" placeholder="Электронная почта" value={orderData.email} onChange={(e) => handleOrderDataChange('email', e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000] transition-all" />
                              <textarea placeholder="Комментарий к заказу" rows={3} value={orderData.comment} onChange={(e) => handleOrderDataChange('comment', e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000] transition-all" />
                            </div>
                          </div>
                          
                          {/* Кнопки действий */}
                          <div className="space-y-3 pt-4">
                            {orderData.paymentMethod === 'card' ? (
                              <button onClick={() => confirmOrder('online')} disabled={isSubmitting} className={`w-full py-3 text-white rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#b30000] hover:bg-red-700'}`}>
                                {isSubmitting ? <><ClipLoader color="#ffffff" size={20} /> Обработка...</> : 'Оплатить картой онлайн'}
                              </button>
                            ) : (
                              <button onClick={() => confirmOrder('offline')} disabled={isSubmitting} className={`w-full py-3 text-white rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#b30000] hover:bg-red-700'}`}>
                                {isSubmitting ? <><ClipLoader color="#ffffff" size={20} /> Обработка...</> : 'Подтвердить заказ'}
                              </button>
                            )}
                            <p className="text-xs text-gray-500 mt-4 text-center">
                              Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных.
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