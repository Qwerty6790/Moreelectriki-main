'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface GallantColor {
  id: string;
  name: string;
  image: string;
  url: string;
}

const gallantColors: GallantColor[] = [
  {
    id: 'graphite-corrugated',
    name: 'Графит рифленый',
    image: '/images/графитрифленыйGallant.webp',
    url: '/ElektroustnovohneIzdely/Werkel/gallant-graphite-corrugated'
  },
  {
    id: 'black-chrome',
    name: 'Черный хром',
    image: '/images/черныйхромGallant.webp',
    url: '/ElektroustnovohneIzdely/Werkel/gallant-black-chrome'
  },
  {
    id: 'ivory',
    name: 'Слоновая кость',
    image: '/images/слоноваякостьGallant.webp',
    url: '/ElektroustnovohneIzdely/Werkel/gallant-ivory'
  },
  {
    id: 'silver',
    name: 'Серебряный',
    image: '/images/серебряныйGallant.webp',
    url: '/ElektroustnovohneIzdely/Werkel/gallant-silver'
  },
  {
    id: 'champagne-corrugated',
    name: 'Шампань рифленый',
    image: '/images/шампаньрифленыйGallant.webp',
    url: '/ElektroustnovohneIzdely/Werkel/gallant-champagne-corrugated'
  },
  {
    id: 'white',
    name: 'Белый',
    image: '/images/белыйGallant.webp',
    url: '/ElektroustnovohneIzdely/Werkel/gallant-white'
  }
];

export default function GallantSeriesPage() {
  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', color: 'var(--foreground)' }}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-52">
        {/* Кнопка назад */}
        <div className="mb-8">
          <Link
            href="/ElektroustnovohneIzdely/Werkel"
            className="flex items-center text-gray-700 hover:text-black mb-6 transition-colors duration-300 w-fit"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Назад к сериям
          </Link>
          
          {/* Блок с заголовком и изображением серии */}
          <div className="rounded-lg p-6 mb-8">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-lg p-2 flex items-center justify-center">
                <Image
                  src="/images/Снимок экрана 2025-06-18 211948.png"
                  alt="Серия Gallant"
                  width={80}
                  height={80}
                  className="object-contain max-w-full max-h-full"
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Серия Gallant
                </h2>
                <p className="text-gray-400">
                  {gallantColors.length} доступных цветов
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Сетка цветов в стиле W55 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {gallantColors.map((color) => (
            <div key={color.id} className="group cursor-pointer" onClick={() => window.location.href = color.url}>
              <div className="rounded-lg overflow-hidden transition-all duration-300 hover:border-gray-400">
                <div className="aspect-square p-3 flex items-center justify-center">
                  <Image
                    src={color.image}
                    alt={color.name}
                    width={120}
                    height={120}
                    className="object-contain max-w-full max-h-full group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-black group-hover:text-gray-900 transition-colors duration-300 text-center text-sm leading-tight">
                    {color.name}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 