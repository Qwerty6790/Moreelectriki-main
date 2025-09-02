'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const Register: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/register`, {
            username,
            email,
            password,
        });
        
        // Сохранение токена и имени пользователя в локальном хранилище
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', username); // Сохраняем имя пользователя
        
        router.push('/profile');

    } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
            // Обрабатываем ответ с ошибкой
            setError(err.response.data.error || 'Регистрация не удалась. Попробуйте снова.');
        } else {
            setError('Регистрация не удалась. Попробуйте снова.');
        }
        console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br bg-white  flex items-center justify-center px-6">
    <div className="flex flex-col md:flex-row w-full max-w-9xl mt-20 bg-white  overflow-hidden">
      {/* Левая часть - изображение или декоративный блок */}
      <div className="hidden md:flex md:w-1/2 b bg-white p-12 text-black items-center justify-center">
        <div className="text-center md:text-left">
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-4 leading-snug">
            Добро пожаловать в MoreElectriki
          </h2>
          <p className="text-base md:text-lg lg:text-xl">
            Зарегистрируйтесь, чтобы получить доступ к лучшим предложениям и товарам.
          </p>
        </div>
      </div>
  
      {/* Правая часть - форма авторизации */}
      <div className="w-full bg-gradient-to-br bg-white md:w-1/2 py-12 px-8 lg:py-16 lg:px-24">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-8 text-center">
          Авторизация в систему
        </h1>
  
        {error && (
          <div className="text-gray-900 mb-6 text-center text-base md:text-lg font-medium">
            {error}
          </div>
        )}
  
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Поле для имени пользователя */}
          <div className="relative">
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="peer w-full px-4 py-3 bg-neutral-700 rounded-lg text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
              placeholder=" "
              required
            />
            <label
              htmlFor="username"
              className="absolute left-4 -top-6 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-0.5 peer-focus:text-sm peer-focus:text-blue-500"
            >
              Имя пользователя
            </label>
          </div>
  
          {/* Поле для email */}
          <div className="relative">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="peer w-full px-4 py-3 bg-neutral-700 rounded-lg shadow-sm text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
              placeholder=" "
              required
            />
            <label
              htmlFor="email"
              className="absolute left-4 -top-6 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-0.5 peer-focus:text-sm peer-focus:text-blue-500"
            >
              Email
            </label>
          </div>
  
          {/* Поле для пароля */}
          <div className="relative">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer w-full px-4 py-3 bg-neutral-700 rounded-lg shadow-sm text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
              placeholder=" "
              required
            />
            <label
              htmlFor="password"
              className="absolute left-4 -top-6 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-0.5 peer-focus:text-sm peer-focus:text-blue-500"
            >
              Пароль
            </label>
          </div>
  
          <div className="flex flex-wrap justify-between items-center mt-6 text-center">
            <a
              href="/auth/reset-password"
              className="text-black hover:underline text-sm md:text-base font-medium"
            >
              Забыли пароль?
            </a>
            <a
              href="/auth/login"
              className="text-black hover:underline text-sm md:text-base font-medium"
            >
              Уже есть аккаунт?
            </a>
          </div>
  
          <button
            type="submit"
            className="mt-8 w-full py-3 bg-gradient-to-r bg-white text-black text-lg font-semibold rounded-lg shadow-md hover:from-neutral-600 hover:to-neutral-700 transition-all duration-300"
          >
            Зарегистрироваться
          </button>
        </form>
      </div>
    </div>
  </div>
  
  

  );
};

export default Register;
