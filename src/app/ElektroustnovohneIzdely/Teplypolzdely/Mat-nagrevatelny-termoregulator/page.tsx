'use client';

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface AllSeries {
  id: string;
  name: string;
  image: string;
  url: string;
  previewImages?: string[];
}

const allSeriesData: AllSeries[] = [
  {
    id: 'voltum',
    name: 'Voltum',
    image: '/images/series/termortegulatorvoltum.png',
    url: '/ElektroustnovohneIzdely/Teplypolzdely/Voltum/Termoregulator',
    previewImages: ['/images/series/voltums704.webp', '/images/series/voltums703.webp'],
  },
  {
    id: 'werkel',
    name: 'Werkel',
    image: '/images/series/termortegulatorwerkel.png',
    url: '/ElektroustnovohneIzdely/Teplypolzdely/Werkel/Termoregulator',
    previewImages: ['/images/series/werekel01.png'],
  },
  {
    id: 'Мат нагревательный',
    name: 'Теплый пол Voltum',
    image: '/images/series/matnagrevatelnyVoltum.png',
    url: '/ElektroustnovohneIzdely/Teplypolzdely/Voltum/Matnagrevatelny',
    // у этой карточки превью НЕ будет
  },
];

export default function AllPage() {
  return (
    <>
      <Head>
        <title>Voltum - Серия S70 | MoreElektriki</title>
        <meta
          name="description"
          content="Серия S70 Voltum — коллекция электроустановочных изделий."
        />
      </Head>

      <div className="min-h-screen bg-white py-56">
        <div className="container mx-auto px-4">
          <h2 className="text-black max-lg:text-4xl text-7xl  font-bold mb-10">Терморегуляторы</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 max-w-7xl mx-auto">
            {allSeriesData.map((series) => (
              <Link
                key={series.id}
                href={series.url}
                className="space-y-4 block transition-transform duration-300 hover:scale-105"
              >
                <div className="relative overflow-visible rounded-lg">
                  {/* превью-ободок рисуем только если переданы previewImages */}
                  {series.previewImages?.length ? (
                    <div className="absolute -left-6 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                      {series.previewImages.slice(0, 3).map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`preview-${i}`}
                          className={`w-32 h-32 object-contain scale-125 rounded -ml-0 ${
                            i === 0
                              ? 'opacity-60 translate-x-0'
                              : i === 1
                              ? 'opacity-50 translate-x-4'
                              : 'opacity-40 translate-x-8'
                          }`}
                        />
                      ))}
                    </div>
                  ) : null}

                  {/* основное изображение */}
                  <div className="relative z-10">
                    <img
                      src={series.image}
                      alt={`Серия ${series.name}`}
                      className="w-[290px] h-[290px] object-contain mx-auto"
                    />
                  </div>
                </div>

                <div className="space-y-4 text-center">
                  <h2 className="text-5xl font-bold text-black">{series.name}</h2>
                  <p className="text-lg text-gray-700 leading-relaxed">Перейти к серии</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}