
'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const Register: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/register`, {
        username,
        email,
        password,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', username);
      
      router.push('/profile');
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || 'Ошибка регистрации.');
      } else {
        setError('Что-то пошло не так. Попробуйте позже.');
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
          РЕГИСТРАЦИЯ ДИЗАЙНЕРОВ
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 lg:gap-x-16 gap-y-16">
          
          {/* Левая колонка - Текст и визуал */}
          <div className="flex flex-col">
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-[1.5rem] font-normal uppercase mb-6 sm:mb-8 text-black leading-snug">
              ПРИСОЕДИНЯЙТЕСЬ К ПРОФЕССИОНАЛЬНОМУ СООБЩЕСТВУ
            </h3>
            
            <div className="space-y-6 mb-10">
              <p className="text-base sm:text-lg md:text-[1.1rem] lg:text-xl leading-relaxed">
                Доступ к эксклюзивным товарам, специальным условиям сотрудничества и лучшим предложениям начинается здесь.
              </p>
              <p className="text-base sm:text-lg md:text-[1.1rem] lg:text-xl leading-relaxed">
                Мы ценим работу дизайнеров интерьера и архитекторов, предоставляя удобные инструменты, 3D-модели и персональную поддержку для реализации ваших проектов.
              </p>
            </div>

            {/* Изображение, стилизованное под журнальный блок */}
            <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden mt-auto bg-gray-200">
              <div 
                className="absolute inset-0 bg-cover bg-center hover:scale-105 transition-transform duration-700"
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
                {/* Имя пользователя */}
                <div className="group">
                  <label className="block text-sm md:text-base font-bold text-black uppercase tracking-wider mb-3">
                    Имя пользователя
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-5 py-4 bg-transparent border border-gray-300 text-black text-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder-gray-400"
                    placeholder="Введите ваше имя"
                    required
                  />
                </div>
      
                {/* Email */}
                <div className="group">
                  <label className="block text-sm md:text-base font-bold text-black uppercase tracking-wider mb-3">
                    Email адрес
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-4 bg-transparent border border-gray-300 text-black text-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder-gray-400"
                    placeholder="name@company.com"
                    required
                  />
                </div>
      
                {/* Пароль */}
                <div className="group">
                  <label className="block text-sm md:text-base font-bold text-black uppercase tracking-wider mb-3">
                    Пароль
                  </label>
                  <input
                    type="password"
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
                  {loading ? 'ОБРАБОТКА...' : 'ЗАРЕГИСТРИРОВАТЬСЯ'}
                </button>
      
                <div className="pt-8 mt-8 border-t border-gray-200 text-left md:text-lg text-black uppercase tracking-wide">
                  Уже есть аккаунт?{' '}
                  <Link href="/auth/login" className="font-bold underline underline-offset-4 hover:text-gray-500 transition-colors">
                    Войти
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

export default Register;
