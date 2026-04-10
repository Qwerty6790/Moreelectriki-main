
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
    <section className="bg-[#fcfcfc] text-black py-12 sm:py-16 md:py-24 font-sans min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        
        {/* Главный заголовок */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-bold uppercase tracking-tight mb-12 sm:mb-16 md:mb-20 leading-none break-words">
          ВХОД В АККАУНТ
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 lg:gap-x-16 gap-y-16">
          
          {/* Левая колонка - Текст и визуал */}
          <div className="flex flex-col">
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-[1.5rem] font-normal uppercase mb-6 sm:mb-8 text-black leading-snug">
              С ВОЗВРАЩЕНИЕМ
            </h3>
            
            <div className="space-y-6 mb-10">
              <p className="text-base sm:text-lg md:text-[1.1rem] lg:text-xl leading-relaxed">
                Войдите в систему, чтобы управлять своими заказами, отслеживать статус доставки и первыми получать персональные предложения.
              </p>
            </div>

            {/* Изображение, стилизованное под журнальный блок */}
            <div className="relative w-full h-[600px] md:h-[600px] overflow-hidden mt-auto bg-gray-200">
              <div 
                className="absolute inset-0 bg-cover hover:scale-105 transition-transform duration-700"
                /* Замените на картинку для логина, если нужно, сейчас стоит та же самая */
                style={{ backgroundImage: `url('/images/banners/bannersregisterationdesigners.jpeg')` }}
              />
            </div>
          </div>

          {/* Правая колонка - Форма */}
          <div className="flex flex-col justify-center lg:px-8">
            <div className="w-full">
              
              {error && (
                <div className="mb-8 p-5 bg-red-50 text-red-600 text-base md:text-lg border border-red-200 uppercase tracking-wide font-medium">
                  {error}
                </div>
              )}
      
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Email */}
                <div className="group">
                  <label 
                    htmlFor="email" 
                    className="block text-sm md:text-base font-bold text-black uppercase tracking-wider mb-3"
                  >
                    Email адрес
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-4 bg-transparent border border-gray-300 text-black text-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder-gray-400"
                    placeholder="name@company.com"
                    required
                  />
                </div>
      
                {/* Пароль */}
                <div className="group">
                  <div className="flex justify-between items-center mb-3">
                    <label 
                      htmlFor="password" 
                      className="block text-sm md:text-base font-bold text-black uppercase tracking-wider"
                    >
                      Пароль
                    </label>
                    {/* Ссылка "Забыли пароль" теперь тоже в стиле минимализма */}
                    <a href="#" className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-400 hover:text-black transition-colors underline-offset-4 hover:underline">
                      Забыли?
                    </a>
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 bg-transparent border border-gray-300 text-black text-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder-gray-400"
                    placeholder="••••••••"
                    required
                  />
                </div>
      
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-black text-white text-base md:text-lg font-bold uppercase tracking-widest hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {loading ? 'ОБРАБОТКА...' : 'ВОЙТИ'}
                </button>
      
                <div className="pt-8 mt-8 border-t border-gray-200 text-left md:text-lg text-black uppercase tracking-wide">
                  Еще нет аккаунта?{' '}
                  <Link href="/auth/register" className="font-bold underline underline-offset-4 hover:text-gray-500 transition-colors">
                    Зарегистрироваться
                  </Link>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Login;
