'use client';
import React, { useEffect, useState } from 'react';
import { CircleUser } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    checkUserLogged();
  };
 
  const checkUserLogged = () => {
    setIsLoggedIn(!!localStorage.getItem('token'));
    setUsername(localStorage.getItem('username'));
  };

  useEffect(() => {
    checkUserLogged();
  }, []);

  return (
    <motion.section
      className="min-h-screen flex items-center justify-center bg-black"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-lg p-8 mt-36 bg-black rounded-2xl shadow-xl text-center">
        <CircleUser 
          className={`mx-auto mb-6 ${isLoggedIn ? 'text-green-900 ' : 'text-gray-900 '}`} 
          size={100} 
        />
        <h1 className="text-4xl font-extrabold mb-4 text-neutral-500 ">Профиль</h1>
        {isLoggedIn && (
          <p className="text-lg text-neutral-400  mb-4">Приятных вам покупок!</p>
        )}
        <div className="p-8 mt-6  bg-black rounded-lg shadow-md">
          {isLoggedIn ? (
            <>
              <p className="text-xl font-semibold text-green-600  mb-4">Вы вошли в аккаунт</p>
              <div className="flex flex-col items-center mt-4 space-y-6">
                <a href="/profile" className="flex items-center justify-center text-gray-200 ">
                  <span className="text-lg font-medium">{username}</span>
                </a>
                <button 
                  onClick={handleLogout} 
                  className="w-3/4 px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-900 transition duration-300"
                >
                  Выйти
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-xl font-semibold text-gray-900 mb-4">Войдите в аккаунт</p>
              <div className="flex flex-col items-center mt-4">
                <a href="/auth/register" className="w-3/4 px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-900 transition duration-300">
                  Войти
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default Profile;
