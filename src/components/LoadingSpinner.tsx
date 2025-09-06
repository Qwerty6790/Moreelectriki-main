import React from 'react';

interface LoadingSpinnerProps {
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  showText?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Загружаем товары...', 
  showText = true 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-8 h-8';
      case 'md': return 'w-12 h-12';
      case 'lg': return 'w-16 h-16';
      case 'xl': return 'w-24 h-24';
      default: return 'w-12 h-12';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'text-sm';
      case 'md': return 'text-base';
      case 'lg': return 'text-lg';
      case 'xl': return 'text-xl';
      default: return 'text-base';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">

     

      {/* Анимированный текст MORELEKTRIKI */}
      <div className="mt-6 text-center">
        <div className="flex items-center justify-center space-x-1 mb-2">
          {'MORELEKTRIKI'.split('').map((letter, index) => (
            <span
              key={index}
              className={`font-bold text-black ${getTextSize()} animate-pulse`}
              style={{
                animationDelay: `${index * 0.1}s`,
                animationDuration: '1.5s'
              }}
            >
              {letter}
            </span>
          ))}
        </div>
      </div>

      {/* Дополнительная анимация волны */}
      <div className="mt-4 flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-1 h-8 bg-gradient-to-t from-black to-gray-400 rounded-full animate-pulse"
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s'
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSpinner; 