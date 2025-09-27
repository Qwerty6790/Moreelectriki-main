'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import Link from 'next/link';
import { CheckCircle, ShoppingCart, FileText, Home, X } from 'lucide-react';

const PaymentSuccess: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderId as string;
  const [isLoading, setIsLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPaymentSuccess = async () => {
      try {
        setIsLoading(true);
        
        // Очищаем корзину после успешной оплаты
        localStorage.removeItem('cart');
        localStorage.setItem('cartCount', '0');
        localStorage.removeItem('pendingOrderId');
        
        // Получаем детали заказа с сервера
        const token = localStorage.getItem('token');
        if (token && orderId) {
          try {
            const response = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            setOrderDetails(response.data);
          } catch (err) {
            console.log('Не удалось загрузить детали заказа:', err);
            // Не показываем ошибку пользователю, так как главное - оплата прошла успешно
          }
        }
        
        toast.success('Оплата прошла успешно! Ваш заказ оформлен.');
        
      } catch (error) {
        console.error('Ошибка при обработке успешной оплаты:', error);
        setError('Произошла ошибка при обработке платежа');
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      processPaymentSuccess();
    } else {
      setError('Отсутствует ID заказа');
      setIsLoading(false);
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <section className="min-h-screen bg-black text-white flex items-center justify-center">
        <Toaster position="top-center" richColors />
        <div className="text-center">
          <ClipLoader color="#b30000" size={50} />
          <p className="mt-4 text-gray-400">Обрабатываем ваш платеж...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-screen bg-white text-black flex items-center justify-center">
        <Toaster position="top-center" richColors />
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          </div>
          <h1 className="text-2xl font-bold mb-4">Ваш заказ был успешно оформлен!</h1>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3  text-black rounded-md hover:bg-red-9
Тип файла	Файл Sitemap
Количество ссылок	153
Ошибка в XML
стр.
поз.	
3
Дополнительное содержимое после закрывающего корневого тега00 transition-all duration-300"
          >
            <Home className="mr-2" size={16} />
            На главную
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-white text-black">
      <Toaster position="top-center" richColors />
      
      {/* Шапка страницы */}
      <div className="relative bg-gradient-to-b from-[#dfdbdb] to-black pt-40 pb-16 px-4 mb-8">
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            </div>
            {orderDetails?.paid ? (
              <>
                <h1 className="text-4xl font-bold mb-4">Оплата успешна!</h1>
                <p className="text-black max-w-xl mx-auto">
                  Спасибо за покупку! Ваш заказ успешно оплачен и принят в обработку.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-4xl font-bold mb-4">Статус оплаты: в обработке</h1>
                <p className="text-black max-w-xl mx-auto">
                Ваш заказ был успешно оформлен!
                </p>
              </>
            )}
          </motion.div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-green-600 rounded-full filter blur-[100px] opacity-20"></div>
          <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-green-600 rounded-full filter blur-[100px] opacity-10"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-[#c1c1c1] rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <FileText className="text-[#b30000] mr-3" size={24} />
              Детали заказа
            </h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center py-3 border-b border-[#222]">
                <span className="text-black">Номер заказа:</span>
                <span className="font-mono text-black">#{orderId}</span>
              </div>
              
              {orderDetails?.createdAt && (
                <div className="flex justify-between items-center py-3 border-b border-[#222]">
                  <span className="text-black">Дата заказа:</span>
                  <span className="text-black">
                    {new Date(orderDetails.createdAt).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-center py-3 border-b border-[#222]">
                <span className="text-black">Статус оплаты:</span>
                <span className="text-green-500 font-semibold">Оплачено</span>
              </div>
              
              {orderDetails?.totalAmount && (
                <div className="flex justify-between items-center py-3">
                  <span className="text-black">Сумма заказа:</span>
                  <span className="text-xl font-bold text-[#b30000]">
                    {orderDetails.totalAmount.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              )}
            </div>

            <div className="bg-[#1a1a1a] rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-2 text-green-400">Что дальше?</h3>
              <ul className="text-sm text-black space-y-1">
                <li>• Мы отправим вам email-подтверждение заказа</li>
                <li>• Наш менеджер свяжется с вами для уточнения деталей доставки</li>
                <li>• Вы можете отслеживать статус заказа в личном кабинете</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/orders"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#b30000] text-black rounded-md hover:bg-red-800 transition-all duration-300"
            >
              <FileText className="mr-2" size={16} />
              Мои заказы
            </Link>
            
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#222] text-black rounded-md hover:bg-[#333] transition-all duration-300"
            >
              <ShoppingCart className="mr-2" size={16} />
              Продолжить покупки
            </Link>
            
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-black rounded-md hover:bg-gray-700 transition-all duration-300"
            >
              <Home className="mr-2" size={16} />
              На главную
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PaymentSuccess; 