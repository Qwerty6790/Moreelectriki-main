import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'tailwindcss/tailwind.css';
import { useRouter } from 'next/router';
import { Toaster } from 'sonner';
import { motion } from 'framer-motion';
import Link from 'next/link';


interface Item {
  article: string;
  source: string;
  quantity: number;
  status: string;
  price: number; // Added property for price
}

interface Order {
  _id: string;
  products: Item[];
  status: string;
  createdAt: string;
}

const OrderDetails: React.FC = () => {
  const router = useRouter();
  const { orderId } = router.query;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;

      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        try {
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`, { headers });
          setOrder(res.data.order);
        } catch (err) {
          // Повторная попытка без токена (на случай гостевого заказа)
          try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`);
            setOrder(res.data.order);
          } catch (err2) {
            console.error('Ошибка при загрузке заказа:', err2);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) return <div className="flex justify-center items-center h-screen text-white"><span>Загрузка...</span></div>;
  if (!order) return <div className="text-center text-white">Заказ не найден</div>;

  // Calculate the total amount of the order
  const totalAmount = order.products.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-black to-black p-6 md:p-8">
      <Toaster position="top-center" richColors />
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white drop-shadow-lg">Детали заказа</h1>
      
      {/* Display the total amount */}
      <div className="mt-2 mb-6 text-white">
        <h2 className="text-2xl font-bold">Общая сумма заказа: {totalAmount} ₽</h2>
      </div>

      <p className="text-center mb-2 text-gray-400"><strong>ID Заказа:</strong> {order._id}</p>
      <p className="text-center mb-2 text-gray-400"><strong>Статус:</strong> {order.status}</p>
      <p className="text-center mb-6 text-gray-400"><strong>Дата создания:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
      <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-center text-white drop-shadow-lg">Товары в заказе:</h2>
      
      {/* Products Grid with animation for individual cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {order.products.map((item, index) => {
          // Encoding the article value to handle slashes
          const encodedArticle = encodeURIComponent(item.article);
          return (
            <motion.div
              key={item.article}
              className="bg-black rounded-lg p-4 md:p-6 shadow-lg transition-transform transform hover:scale-105 cursor-pointer flex flex-col justify-between border border-blue-50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }} // Delay for staggered animation
            >
              <div>
                <Link href={`/products/${item.source}/${encodedArticle}`} passHref>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.article}</h3>
                  <p className="text-gray-400">Поставщик: <span className="text-gray-200">{item.source}</span></p>
                  <p className="text-gray-400">Количество: <span className="text-gray-200">{item.quantity}</span></p>
                  <p className="text-gray-400">Статус: <span className="text-gray-200">{item.status}</span></p>
                  <p className="text-gray-400">Цена: <span className="text-gray-200">{item.price} ₽</span></p> {/* Display price */}
                </Link>
              </div>
              <div className="border-t border-blue-50 my-2"></div>
              <p className="text-neutral-600 text-sm">Нажмите на товар для просмотра деталей</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderDetails;
