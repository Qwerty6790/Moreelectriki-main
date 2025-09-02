'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { toast, Toaster } from 'sonner'; // Импортируем функцию для уведомлений
import { FaCopy } from "react-icons/fa"; // Импортируем иконку копирования
import 'tailwindcss/tailwind.css';

const UserProfile = () => {
    const router = useRouter();
    const { userId } = router.query;
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) return;

            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`);
                setUser(response.data);
            } catch (error) {
                console.error('Ошибка при загрузке данных пользователя', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId]);

    const copyEmailToClipboard = () => {
        if (user) {
            navigator.clipboard.writeText(user.email)
                .then(() => {
                    toast.success('Email скопирован в буфер обмена!'); // Используем sonner для уведомления
                })
                .catch(err => {
                    console.error('Ошибка при копировании email:', err);
                });
        }
    };

    if (loading) return <div className="text-center text-lg text-white">Загрузка...</div>;

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Toaster position="top-center" richColors />
            <div className="max-w-2xl p-8 bg-gray-900 text-white rounded-lg shadow-lg">
                <h1 className="text-4xl font-bold text-center mb-6">Профиль пользователя</h1>
                {user ? (
                    <div className="space-y-4">
                        <p className="text-lg">
                            <span className="font-semibold">Имя пользователя:</span> 
                            <span className="font-bold ml-2">{user.username}</span>
                        </p>
                        <p className="text-lg flex items-center">
                            <span className="font-semibold">Email:</span> 
                            <span className="font-bold ml-2">{user.email}</span>
                            <button 
                                className="ml-4 p-2 bg-indigo-800 hover:bg-indigo-900 text-white rounded transition duration-300 flex items-center"
                                onClick={copyEmailToClipboard}
                            >
                                <FaCopy className="h-5 w-5" />
                            </button>
                        </p>
                        <div className="mt-6">
                            <button
                                className="w-full px-4 py-2 bg-indigo-800 hover:bg-indigo-900 text-white rounded-lg transition duration-300 shadow-md"
                                onClick={() => router.push('/admin')}
                            >
                                Вернуться назад
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-900 text-lg">Пользователь не найден.</p>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
