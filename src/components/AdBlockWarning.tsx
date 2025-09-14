"use client";
import React, { useState, useEffect } from 'react';

const AdBlockWarning: React.FC = () => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Проверяем доступность API
    const checkApiAccess = async () => {
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/health', {
          method: 'HEAD',
          mode: 'no-cors'
        });
        setIsBlocked(false);
      } catch (error: unknown) {
        if (error instanceof Error && (error.message?.includes('ERR_BLOCKED_BY_CLIENT') || 
            error.name === 'TypeError' && error.message.includes('Failed to fetch'))) {
          setIsBlocked(true);
          setShowWarning(true);
        }
      }
    };

    checkApiAccess();
  }, []);

  if (!showWarning) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black text-white p-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-2xl">🚫</div>
          <div>
            <h3 className="font-bold">Запросы блокируются</h3>
            <p className="text-sm">
              Отключите AdBlock/uBlock для домена more-elecktriki-backand.vercel.app
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowWarning(false)}
          className="bg-gray-900 hover:bg-black px-4 py-2 rounded text-sm"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default AdBlockWarning; 