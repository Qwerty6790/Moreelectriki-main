'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
            email,
            password,
        });

        // Сохранение токена и имени пользователя в локальном хранилище
        const token = response.data.token; // Убедитесь, что сервер возвращает токен
        localStorage.setItem('token', token); // Сохраняем токен в локальном хранилище

        // Сохранение имени пользователя в локальном состоянии или хранилище
        const username = response.data.username; // Получаем имя пользователя, если оно возвращается
        localStorage.setItem('username', username); // Сохраняем имя пользователя в локальном хранилище

        // Перенаправление пользователя
        router.push('/profile'); 

    } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
            // Обрабатываем ответ с ошибкой
            setError(err.response.data.error || 'Неверный email или пароль');
        } else {
            setError('Не удалось войти. Попробуйте еще раз.');
        }
        console.error(err);
    }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br bg-white">
    <div className="flex flex-col md:flex-row bg-white rounded-lg overflow-hidden w-full max-w-9xl">
      {/* Левая часть - Приветствие */}
      <div className="md:w-1/2 bg-gradient-to-br bg-white p-12 flex items-center justify-center text-black">
        <div>
          <h1 className="text-8xl font-bold mb-4 text-center md:text-left">
            Войдите в MoreElectriki
          </h1>
        </div>
      </div>
  
      {/* Правая часть - Форма авторизации */}
      <div className="md:w-2/4 p-8">
        <h2 className="text-4xl font-bold text-black text-center mb-6">
          Войти
        </h2>
        {error && (
          <div className="text-gray-900 mb-4 text-center text-sm font-medium">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-800"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-neutral-50000 text-base"
              placeholder="example@mail.com"
              required
            />
          </div>
  
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-800"
            >
              Пароль
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-neutral-500 text-base"
              placeholder="Пароль"
              required
            />
          </div>
  
          <div className="flex items-center justify-between mb-6">
            <a
              href="/auth/reset-password"
              className="text-sm text-black font-bold hover:underline"
            >
              Восстановить пароль
            </a>
            <a
              className="text-sm text-black font-bold hover:underline"
              href="/auth/register"
            >
              Нет аккаунта?
            </a>
          </div>
  
          <button
            type="submit"
            className="w-full py-3 px-4 bg-white text-black font-medium rounded-md shadow-md transition duration-300 hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  </div>
  

  );
};

export default Login;



