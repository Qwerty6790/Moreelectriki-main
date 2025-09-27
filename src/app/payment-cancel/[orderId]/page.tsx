'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, ShoppingCart, Home, RefreshCw } from 'lucide-react';

const PaymentCancel: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderId as string;

  return (
    <section className="min-h-screen bg-white text-gray-800">
      
      {/* Шапка страницы */}
      <div className="relative bg-gray-50 pt-40 pb-16 px-4 mb-8">
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-red-100 border-4 border-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="text-red-500" size={48} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Оплата отменена</h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              Ваш платеж не был завершен. Товары остались в корзине, и вы можете попробовать оформить заказ снова.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">Что произошло?</h2>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold mb-3 text-red-600">Возможные причины:</h3>
              <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                <li>Вы отменили платеж на странице вашего банка.</li>
                <li>Произошла техническая ошибка при обработке платежа.</li>
                <li>Недостаточно средств на вашей карте.</li>
                <li>Ваш банк заблокировал данную транзакцию.</li>
              </ul>
            </div>

            {orderId && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  Номер заказа для справки: <span className="font-mono font-medium text-gray-900">#{orderId}</span>
                </p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
              <h3 className="font-semibold mb-2 text-blue-700">Что делать дальше?</h3>
              <ul className="text-sm text-blue-900 space-y-1 list-disc list-inside">
                <li>Проверьте данные карты и попробуйте еще раз, вернувшись в корзину.</li>
                <li>Обратитесь в ваш банк, если проблема повторяется.</li>
                <li>Свяжитесь с нашей поддержкой для получения помощи.</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cart"
              className="inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="mr-2" size={16} />
              Вернуться в корзину
            </Link>
            
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-800 border border-gray-300 rounded-md font-semibold hover:bg-gray-100 transition-colors"
            >
              <ShoppingCart className="mr-2" size={16} />
              Продолжить покупки
            </Link>
            
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-800 text-white rounded-md font-semibold hover:bg-black transition-colors"
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