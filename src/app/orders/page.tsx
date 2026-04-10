
'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import Link from 'next/link';
import axios, { AxiosError } from 'axios';
import { OrderI } from '../../types/interfaces';
import { ClipLoader } from 'react-spinners';
// Добавили FiInfo для красивого блока информации
import { FiShoppingBag, FiXCircle, FiInfo } from 'react-icons/fi';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<OrderI[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      try {
        // Запрос всех заказов
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setOrders(response.data.orders);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        if (error instanceof AxiosError && error.response?.status === 403) {
          toast.error('Пожалуйста, войдите в аккаунт.');
          localStorage.removeItem('token');
        } else {
          toast.error('Ошибка при загрузке заказов');
          console.error(error);
        }
      }
    };

    fetchOrders();
  }, []);

  const handleOpenModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrderId(null);
  };

  const handleCancelOrder = async () => {
    if (!selectedOrderId) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${selectedOrderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setOrders((prevOrders) => prevOrders.filter(order => order._id !== selectedOrderId));
      toast.success('Заказ успешно отменен');
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 403) {
        toast.error('Пожалуйста, войдите в аккаунт снова.');
        localStorage.removeItem('token');
      } else {
        console.error(error);
        toast.error('Ошибка при отмене заказа');
      }
    } finally {
      handleCloseModal();
    }
  };

  return (
    <motion.section
      className="py-20 bg-white text-gray-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Toaster position="top-center" /> {/* Убедитесь, что Toaster добавлен, чтобы toast.error/success работали */}
      <div className="container mx-auto">
        <div className="p-4 mx-auto md:px-10 lg:px-32 xl:max-w-3xl">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-6">Мои Заказы</h1>

          {/* Информационный блок об уведомлениях на email/телефон */}
          <div className="mb-6 flex items-start p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
            <FiInfo className="text-gray-500 text-xl mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600">
              Уведомления о статусе, а также детали заказа будут отправлены на ваш <strong>Email</strong> (если вы оформляли заказ как гость) или по SMS на <strong>указанный номер телефона</strong>.
            </p>
          </div>

          {orders.length > 0 && (
            <p className="mb-6 text-center text-gray-500">
              Нажмите на заказ ID, чтобы увидеть детали. Заказы можно забрать по адресу магазина.
            </p>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <ClipLoader color="#000" size={50} />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center text-gray-600 py-10">Для дизайнеров заказы будут отображаться в личном кабинете</div>
          ) : (
            <div className="grid gap-6">
              {orders.map((order) => (
                <motion.div
                  key={order._id}
                  className="relative bg-white border border-gray-200 rounded-lg shadow-md p-6 transform transition-all duration-300 hover:shadow-lg hover:scale-105"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <FiShoppingBag className="text-lg text-gray-500 mr-2" />
                      <Link href={`/orders/${order._id}`} className="text-lg font-semibold text-gray-900 hover:underline">
                        Заказ ID: {order._id}
                      </Link>
                    </div>
                    <button
                      className="text-red-500 hover:text-red-700 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(order._id);
                      }}
                      title="Отменить заказ"
                    >
                      <FiXCircle className="text-xl" />
                    </button>
                  </div>
                  <p className="text-gray-600">Общая сумма: <strong>{order.totalAmount} ₽</strong></p>
                  <p className="text-gray-600">Статус: <span className="font-medium">{order.status}</span></p>
                </motion.div>
              ))}
            </div>
          )}

          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Подтверждение отмены</h2>
                <p className="text-gray-700 mb-6">Вы уверены, что хотите отменить этот заказ? Это действие нельзя отменить.</p>
                <div className="flex justify-end gap-3">
                  <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition" onClick={handleCloseModal}>
                    Отмена
                  </button>
                  <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition" onClick={handleCancelOrder}>
                    Подтвердить
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default Orders;
