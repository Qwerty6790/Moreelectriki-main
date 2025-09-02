'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
interface Color {
  id: string;
  name: string;
  image: string;
  logo: string;
  url: string;
}

interface Frame {
  id: string;
  name: string;
  image: string;
  url: string;
}

interface WerkelSeries {
  id: string;
  name: string;
  image: string;
  url?: string;
  colors: Color[];
  frames?: Frame[];
  description?: string;
}

// Все серии Werkel из name.tsx
const werkelSeriesData: WerkelSeries[] = [
 
   
 
  {
    id: 'Выдвижной блок',
    name: 'Выдвижной блок',
    image: '/images/seris/vidihonyblokDonel.png',
    description: 'Винтажный стиль для ценителей классической элегантности',
    colors: [
      { id: 'Алюминий', name: 'Donel', image: '/images/seris/vidihonyblokDonel.png', logo: '/images/brands/donellogo.svg', url: '/ElektroustnovohneIzdely/VidviznoyBlock/VidihnoyblockDonel' },
    ],
  },
  {
    id: 'Выдвижной блок',
    name: 'Выдвижной блок',
    image: '/images/seris/vidihonyblokWerkel.png',
    description: 'Винтажный стиль для ценителей классической элегантности',
    colors: [
      { id: 'Серебряный', name: 'Werkel', image: '/images/seris/vidihonyblokWerkel.png', logo: '/images/brands/werkellogo.png', url: '/ElektroustnovohneIzdely/VidviznoyBlock/VidihnoyblockWerkel' },
    ],
  },
 
];

export default function WerkelPage() {
  const router = useRouter();

  const handleSeriesClick = (color: Color) => {
    router.push(color.url);
  };

  return (
    <div style={{ backgroundColor: 'var(--background)' }} className="min-h-screen text-[var(--foreground)] pt-32 max-w-[92rem] mx-auto">
    <Head>
        <title>Выдвижные блоки,Donel,Werkel — Elektromos</title>
        <meta name="description" content="Купить  Выдвижные блоки,Donel,Werkel — Elektromos" />
        <meta property="og:title" content="Выдвижные блоки,Donel,Werkel — Elektromos" />
        <meta property="og:description" content="Купить Выдвижные блоки,Donel,Werkel — Elektromos" />
        <meta property="og:url" content="https://elektromos.uz/ElektroustnovohneIzdely/Vstraivaemy-series" />
        <meta property="og:image" content="/images/seris/vidihonyblokDonel.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className="flex flex-col md:flex-row">
      
        {/* Left Fixed/Sticky Part */}
        <div className="md:w-1/2 md:h-screen md:sticky md:top-0 bg-[#101010] p-8 md:p-16 flex flex-col justify-center">
          <h1 className="text-4xl md:text-7xl font-medium text-white mb-6">
            Серия Выдвижных блоков
          </h1>
          <p className="text-white mb-4 text-lg">
            Откройте для себя превосходные электроустановочные изделия Werkel – эталон немецкого качества и элегантного дизайна в мире электрики!
          </p>
          <p className="text-white mb-4 text-lg">
            Каждая серия Werkel представляет собой гармоничное сочетание функциональности и стиля. От классических встраиваемых серий до премиальных коллекций Gallant и Vintage – каждое изделие создано с учетом высочайших стандартов качества.
          </p>
          <p className="text-white text-lg">
            Werkel — это не просто электрика, это искусство создания совершенного пространства. Выбирайте качество, выбирайте Werkel!
          </p>
        </div>

        {/* Right Scrollable Part */}
        <div className="md:w-1/2 p-4 md:p-8 overflow-y-auto">
          <div className="py-44">
            <div className="mb-8">
              <h2 className="text-4xl text-white font-bold mb-4">
                Выдвижные блоки
              </h2>
            </div>
            <div className="flex flex-col gap-6">
              {werkelSeriesData.map((series) => 
                series.colors.map((color) => (
                  <div
                    key={`${series.id}-${color.id}`}
                    onClick={() => handleSeriesClick(color)}
                    className="group cursor-pointer h-full"
                  >
                    <div className="bg-[#101010] border border-white/20 rounded-xl overflow-hidden transition-all duration-300 hover:border-red-500 hover:shadow-lg h-full">
                      <div className="flex items-center p-6 h-full min-h-[160px]">
                        <div className="flex-1 pr-6 flex flex-col justify-center">
                          <div className="w-56 h-20 sm:w-64 sm:h-24 md:w-80 md:h-28 lg:w-full lg:h-32 mb-3">
                            <Image
                              src={color.logo}
                              alt={color.name}
                              width={400}
                              height={400}
                              className="object-contain w-full h-full"
                            />
                          </div>
                          <p className="text-white text-base mb-4 leading-relaxed">
                            {series.description}
                          </p>
                          <div className="flex items-center text-white">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="text-sm">Перейти к товарам</span>
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0 w-32 sm:w-40 md:w-52 h-32 sm:h-40 md:h-52">
                          <div className="w-full h-full rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                            <Image
                              src={color.image}
                              alt={color.name}
                              width={450}
                              height={450}
                              className="object-contain max-w-full max-h-full"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
  
        </div>
      </div>
    </div>
  );
}