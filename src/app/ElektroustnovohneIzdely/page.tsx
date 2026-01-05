
'use client';

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from "next/image";

const ElektroustnovohneIzdely: React.FC = () => (
  <>
    <Head>
      <title>Рамки из стекла – Senso и Elite | MoreElektriki</title>
      <meta
        name="description"
        content="Стеклянные рамки Werkel Senso и Elite — минимализм и тактильность закалённого стекла."
      />
    </Head>

    <main className="min-h-screen bg-black/30 -mt-20">
      


      {/* Список серий */}
      <section className="px-6 py-24 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          
          {/* Card Werkel */}
          <Link href="/ElektroustnovohneIzdely/Werkel" className="group flex flex-col gap-4">
            <div className="aspect-square rounded-lg overflow-hidden relative ">
              <img
                src="/images/series/werkel.webp"
                alt="Werkel"
                className="w-full h-full object-cover transform translate-y-1/3 group-hover:translate-y-0 transition-transform duration-700 ease-out"
              />
              {/* Белая область снизу для карточки товара остается, чтобы текст читался на белом фоне страницы */}
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white to-transparent z-10"></div>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-medium text-neutral-900 group-hover:text-neutral-700 transition-colors duration-300">
                Werkel
              </h2>
              <p className="text-sm text-neutral-600 mt-1 group-hover:text-neutral-500 transition-colors duration-300">
                Коллекция интерьерных рамок и аксессуаров
              </p>
            </div>
          </Link>

          {/* Card Voltum */}
          <Link href="/ElektroustnovohneIzdely/Voltum" className="group flex flex-col gap-4">
            <div className="aspect-square rounded-lg overflow-hidden relative">
              <img
                src="/images/series/voltum.png"
                alt="Voltum"
                className="w-full h-full object-cover transform translate-y-1/3 group-hover:translate-y-0 transition-transform duration-700 ease-out"
              />
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white to-transparent z-10"></div>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-medium text-neutral-900 group-hover:text-neutral-700 transition-colors duration-300">
                Voltum
              </h2>
              <p className="text-sm text-neutral-600 mt-1 group-hover:text-neutral-500 transition-colors duration-300">
                Матовая текстура и минималистичный дизайн
              </p>
            </div>
          </Link>

          {/* Card Termoregulator */}
        
        </div>
      </section>
    </main>
  </>
);

export default ElektroustnovohneIzdely;