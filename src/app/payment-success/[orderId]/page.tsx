'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import Link from 'next/link';
import { CheckCircle, XCircle, FileText, Home, ShoppingCart } from 'lucide-react';

// Define a type for order details for better type safety
interface OrderDetails {
  _id: string;
  createdAt: string;
  totalAmount: number;
  paid: boolean;
}

const PaymentSuccess: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderId as string;
  const [isLoading, setIsLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPaymentSuccess = async () => {
      try {
        setIsLoading(true);
        
        // Clear cart from local storage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('cart');
          localStorage.setItem('cartCount', '0');
          localStorage.removeItem('pendingOrderId');
        }
        
        // Fetch order details from the server
        const token = localStorage.getItem('token');
        if (token && orderId) {
          try {
            const response = await axios.get<OrderDetails>(
              `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                }
              }
            );
            setOrderDetails(response.data);
          } catch (err) {
            console.warn('Could not fetch order details, but payment was successful:', err);
            // Don't show an error to the user, as the primary goal (payment) was successful.
          }
        }
        
        toast.success('Оплата прошла успешно! Ваш заказ оформлен.');
        
      } catch (e) {
        console.error('Error processing payment success:', e);
        setError('Произошла ошибка при обработке вашего платежа. Пожалуйста, свяжитесь с поддержкой.');
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      processPaymentSuccess();
    } else {
      setError('ID заказа не найден. Невозможно подтвердить оплату.');
      setIsLoading(false);
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <section className="min-h-screen bg-white flex flex-col items-center justify-center text-center p-4">
        <Toaster position="top-center" richColors />
        <ClipLoader color="#111827" size={40} />
        <p className="mt-4 text-gray-600">Обрабатываем ваш платеж...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-screen bg-white flex flex-col items-center justify-center text-center p-4">
        <Toaster position="top-center" richColors />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto"
        >
          <XCircle className="mx-auto h-16 w-16 text-red-500" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Произошла ошибка</h1>
          <p className="mt-2 text-gray-600">{error}</p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-2.5 bg-black text-white rounded-md font-semibold hover:bg-gray-800 transition-colors"
            >
              <Home className="mr-2" size={16} />
              Вернуться на главную
            </Link>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 text-gray-800">
      <Toaster position="top-center" richColors />
      
      <div className="flex flex-col items-center justify-center pt-32 pb-16 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900">Заказ успешно оформлен!</h1>
          <p className="mt-2 text-lg text-gray-600 max-w-xl mx-auto">
            Спасибо за покупку! Мы получили ваш заказ и скоро начнем его обработку.
          </p>
        </motion.div>
      </div>

      <div className="container max-w-2xl mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 mb-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 flex items-center">
              <FileText className="text-gray-500 mr-3" size={22} />
              Детали заказа
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Номер заказа</span>
                <span className="font-mono font-medium text-gray-800">#{orderId}</span>
              </div>
              
              {orderDetails?.createdAt && (
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Дата</span>
                  <span className="text-gray-800">
                    {new Date(orderDetails.createdAt).toLocaleDateString('ru-RU', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Статус оплаты</span>
                <span className="font-semibold text-green-600">Оплачено</span>
              </div>
              
              {orderDetails?.totalAmount && (
                <div className="flex justify-between items-center pt-3">
                  <span className="text-gray-600 font-semibold">Сумма</span>
                  <span className="text-xl font-bold text-gray-900">
                    {orderDetails.totalAmount.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 text-sm text-green-800">
              <h3 className="font-semibold mb-2">Что дальше?</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Мы отправили подтверждение вашего заказа на email.</li>
                <li>Наш менеджер свяжется с вами в ближайшее время для уточнения деталей.</li>
                <li>Вы можете отслеживать статус заказа в личном кабинете.</li>
              </ul>
            </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-white text-gray-800 border border-gray-300 rounded-md font-semibold hover:bg-gray-100 transition-colors"
            >
              <ShoppingCart className="mr-2" size={16} />
              Продолжить покупки
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PaymentSuccess;