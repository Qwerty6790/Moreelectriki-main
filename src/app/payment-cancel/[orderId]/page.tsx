'use client';
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, ShoppingCart, Home, RefreshCw } from 'lucide-react';

const PaymentCancel: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderId as string;

  useEffect(() => {
    toast.error('Оплата была отменена');
  }, []);

  return (
    <section className="min-h-screen bg-white text-black">
      <Toaster position="top-center" richColors />
      
      {/* Шапка страницы */}
      <div className="relative bg-gradient-to-b from-[#c0bdbd] to-black pt-40 pb-16 px-4 mb-8">
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="text-black" size={40} />
            </div>
            <h1 className="text-4xl font-bold mb-4">Оплата отменена</h1>
            <p className="text-black max-w-xl mx-auto">
              Ваш платеж был отменен. Товары остались в корзине, вы можете попробовать оформить заказ снова.
            </p>
          </motion.div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-red-600 rounded-full filter blur-[100px] opacity-20"></div>
          <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-red-600 rounded-full filter blur-[100px] opacity-10"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="bg-[#bab6b6] rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Что произошло?</h2>
            
            <div className="bg-[#bab9b9] rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold mb-3 text-red-400">Возможные причины:</h3>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• Вы отменили платеж на странице банка</li>
                <li>• Произошла техническая ошибка при обработке платежа</li>
                <li>• Недостаточно средств на карте</li>
                <li>• Банк заблокировал транзакцию</li>
              </ul>
            </div>

            {orderId && (
              <div className="bg-[#bab9b9] rounded-lg p-4 mb-6">
                <p className="text-sm text-black">
                  Номер заказа для справки: <span className="font-mono text-black">#{orderId}</span>
                </p>
              </div>
            )}

            <div className="bg-[#a9a7a7] rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-2 text-blue-400">Что делать дальше?</h3>
              <ul className="text-sm text-black space-y-1">
                <li>• Проверьте данные карты и попробуйте еще раз</li>
                <li>• Обратитесь в банк, если проблема повторяется</li>
                <li>• Свяжитесь с нашей поддержкой для помощи</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cart"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#b30000] text-black rounded-md hover:bg-red-800 transition-all duration-300"
            >
              <RefreshCw className="mr-2" size={16} />
              Попробовать снова
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

export default PaymentCancel; 