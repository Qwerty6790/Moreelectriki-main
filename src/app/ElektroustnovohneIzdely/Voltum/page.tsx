'use client';

import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface Color {
  id: string;
  name: string;
  image: string;
  url: string;
  description?: string;
}

interface VoltumSeries {
  id: string;
  name: string;
  image: string;
  url?: string;
  colors: Color[];
  previewImages?: string[];
}

// Одна серия S70 как в запросе
const voltumSeriesData: VoltumSeries[] = [
  {
    id: 's70',
    name: 'Серия S70',
    image: '/images/series/voltum.png',
    previewImages: ['/images/series/voltums702.webp','/images/series/voltums704.webp','/images/series/voltums703.webp',],
    colors: [
      { id: 'white-matte', name: 'Белое матовое', image: '/images/colors/белыйматовыйVoltum.png', url: '/ElektroustnovohneIzdely/Voltum/white-matte', description: 'Белое матовое покрытие — современно и практично.' },
      { id: 'black-matte', name: 'Черный матовый', image: '/images/colors/черныйматовыйVoltum.png', url: '/ElektroustnovohneIzdely/Voltum/black-matte', description: 'Матовый черный для контрастных интерьеров.' },
      { id: 'cashmere', name: 'Кашемир', image: '/images/colors/кашемирVoltum.png', url: '/ElektroustnovohneIzdely/Voltum/cashmere', description: 'Кашемир для контрастных интерьеров.' },
      { id: 'graphite', name: 'Графит', image: '/images/colors/графитVoltum.png', url: '/ElektroustnovohneIzdely/Voltum/graphite', description: 'Графит для контрастных интерьеров.' },
      { id: 'shelk', name: 'Шелк', image: '/images/colors/шелкVoltum.png', url: '/ElektroustnovohneIzdely/Voltum/shelk', description: 'Шелк для контрастных интерьеров.' },
      { id: 'steel', name: 'Сталь', image: '/images/colors/стальVoltum.png', url: '/ElektroustnovohneIzdely/Voltum/steel', description: 'Сталь для контрастных интерьеров.' },
      { id: 'white-gloss', name: 'Белый глянцевый', image: '/images/colors/белыйглянцевыйVoltum.png', url: '/ElektroustnovohneIzdely/Voltum/white-gloss', description: 'Белый глянцевый для контрастных интерьеров.' },
      { id: 'titan', name: 'Титан', image: '/images/colors/титанVoltum.png', url: '/ElektroustnovohneIzdely/Voltum/titan', description: 'Титан для контрастных интерьеров.' },
    ],
    
  },
];

export default function VoltumPage() {
  const [selectedSeries, setSelectedSeries] = useState<VoltumSeries | null>(null);

  const handleSeriesClick = (series: VoltumSeries) => {
    if (series.url) {
      window.location.href = series.url;
    } else {
      setSelectedSeries(series);
    }
  };

  const handleBackToSeries = () => setSelectedSeries(null);

  return (
    <>
      <Head>
        <title>Voltum - Серия S70 | Elektromos</title>
        <meta name="description" content="Серия S70 Voltum — коллекция электроустановочных изделий." />
      </Head>

      <div className="min-h-screen bg-white py-56">
        <div className="container mx-auto px-4">
          <h2 className="text-black text-6xl font-bold mb-10">Voltum</h2>

          {!selectedSeries ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 max-w-7xl mx-auto">
              {voltumSeriesData.map((series) => (
                <div
                  key={series.id}
                  onClick={() => handleSeriesClick(series)}
                  className="space-y-4 block transition-transform duration-300 hover:scale-105 cursor-pointer"
                >
                  <div className="relative overflow-visible rounded-lg pl-6">
                    <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none">
                      {(series.previewImages && series.previewImages.length ? series.previewImages.slice(0, 3) : [series.image, series.image, series.image]).map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`preview-${i}`}
                          className={`w-32 h-32 object-contain scale-125 rounded -ml-12 ${i === 0 ? 'opacity-60 translate-x-0' : i === 1 ? 'opacity-50 translate-x-4' : 'opacity-40 translate-x-8'}`}
                        />
                      ))}
                    </div>

                    <div className="relative z-10">
                      <img src={series.image} alt={`Серия ${series.name}`} className="w-[190px] h-[190px] object-contain mx-auto" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-5xl font-bold text-black">{series.name}</h2>
                    <p className="text-lg text-gray-700 leading-relaxed">Перейти к цветам</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-12">
                {selectedSeries.colors.map((color, idx) => (
                  <Link key={color.id ?? `${color.name}-${idx}`} href={color.url} className="space-y-4 block transition-transform duration-300 hover:scale-105">
                    <div className="relative overflow-hidden rounded-lg">
                      <img src={color.image} alt={`Цвет ${color.name}`} className="w-[300px] h-[300px] object-contain mx-auto" />
                    </div>
                    <div className="space-y-2 text-center">
                      <h3 className="text-4xl font-semibold text-black">{color.name}</h3>
                      {color.description && <p className="text-base text-gray-600 max-w-xl mx-auto mt-2">{color.description}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}