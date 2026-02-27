
'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const Login: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
        email,
        password,
      });

      // Сохраняем данные
      const token = response.data.token;
      const username = response.data.username;
      
      localStorage.setItem('token', token);
      if (username) {
        localStorage.setItem('username', username);
      }

      router.push('/profile');
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || 'Неверный email или пароль');
      } else {
        setError('Не удалось войти. Попробуйте еще раз.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      {/* Левая часть - Визуал (Идентично регистрации для симметрии, можно сменить картинку) */}
      <div className="hidden lg:flex lg:w-1/2 relative  items-center justify-center overflow-hidden">
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-80"
            // Здесь можно поставить другое изображение для логина, например '/images/banners/login-banner.png'
            style={{ backgroundImage: `url('/images/banners/bannersregisterationdesigners.jpeg')` }}
        />
      
        
        <div className="relative z-10 px-12 text-black max-w-2xl text-center lg:text-left">
          <h2 className="text-5xl font-bold mb-6 tracking-tight leading-tight">
            С возвращением
          </h2>
          <p className="text-lg text-black font-light leading-relaxed opacity-90">
            Войдите в систему, чтобы управлять заказами, отслеживать статус доставки и получать персональные предложения.
          </p>
        </div>
      </div>
  
      {/* Правая часть - Форма */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Вход в аккаунт
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              Введите свои учетные данные для доступа
            </p>
          </div>
  
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}
  
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="group">
              <label 
                htmlFor="email" 
                className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1"
              >
                Email адрес
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 placeholder-gray-400"
                placeholder="name@company.com"
                required
              />
            </div>
  
            {/* Пароль */}
            <div className="group">
              <div className="flex justify-between items-center mb-2 ml-1">
                <label 
                  htmlFor="password" 
                  className="block text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  Пароль
                </label>
                {/* Ссылка на восстановление пароля (опционально) */}
                <a href="#" className="text-xs text-gray-500 hover:text-black transition-colors">
                  Забыли пароль?
                </a>
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 placeholder-gray-400"
                placeholder="••••••••"
                required
              />
            </div>
  
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-black text-white text-sm font-bold uppercase tracking-wider rounded-lg shadow-lg hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
  
            <div className="mt-8 text-center text-sm text-gray-600">
              Еще нет аккаунта?{' '}
              <Link href="/auth/register" className="font-semibold text-black hover:underline transition-all">
                Зарегистрироваться
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
