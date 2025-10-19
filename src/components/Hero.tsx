'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// --- Компонент карточки товара ---
const DemoProductCard = ({
  name,
  article,
  imageUrl,
  price,
}: {
  name: string;
  article: string;
  imageUrl: string;
  price: string;
}) => {
  return (
    <div className="bg-white flex flex-col h-full overflow-hidden product-card rounded-lg border border-gray-200/80 transition-shadow duration-300 hover:shadow-xl">
      <div className="flex flex-col flex-grow">
        <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden product-image">
          <div className="absolute top-3 right-3 z-10">
            <span
              title="Ожидается"
              aria-label="Ожидается"
              className="bg-orange-500 w-3 h-3 rounded-full inline-block border border-white/20"
            />
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-xs sm:text-sm mt-1">
              <img src={imageUrl} alt={name} className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <div className="text-[10px] text-gray-400 mb-2">Арт. {article}</div>
          <h3 className="text-base font-light text-black mb-2 line-clamp-2 flex-grow">
            {name}
          </h3>
          <div className="flex items-baseline gap-2 mb-3 mt-2">
            <div className="text-xl font-extrabold text-black">{price}</div>
          </div>
        </div>
      </div>
      <div className="px-4 pb-4 pt-0 mt-auto">
        <button className="w-full h-11 rounded-md text-sm font-medium uppercase tracking-wider transition-colors duration-200 text-black">
          8(926) 552-21-73 для уточнение деталей
        </button>
      </div>
    </div>
  );
};

// --- Основной компонент страницы ---
export default function Banner() {
  const demoProducts = [
    { name: 'Кабель силовой ВВГ-Пнг(А) 3х2.5 Калужский кабельный завод (ККЗ) (ГОСТ)', article: 'ЦС000038155', imageUrl: '/images/series/ввг-пнг.jpg', price: '85 руб' },
    { name: 'Кабель силовой ВВГ-Пнг(А) 3х1.5 плоский Калужский кабельный завод (ККЗ) (ГОСТ)', article: 'ЦС000038156', imageUrl: '/images/series/ввг-пнг.jpg', price: '58 руб' },
    { name: 'Кабель силовой ВВГ-Пнг(А) 3х6 плоский Калужский кабельный завод (ККЗ) (ГОСТ)', article: 'ЦС000038157', imageUrl: '/images/series/ввг-пнг.jpg', price: '250 руб' },
    { name: 'Кабель силовой ВВГ-Пнг(А) 3х4 плоский Калужский кабельный завод (ККЗ) (ГОСТ)', article: 'ЦС000038158', imageUrl: '/images/series/ввг-пнг.jpg', price: '150 руб' },
  ];

  const videoSources = {
    elektro: '/images/banners/elektrosutanovny.mp4',
    svet: '/images/banners/trekovysvet.mp4',
  };
  
  const [activeVideo, setActiveVideo] = useState<'elektro' | 'svet'>('elektro');

  const videoRefElektro = useRef<HTMLVideoElement | null>(null);
  const videoRefSvet = useRef<HTMLVideoElement | null>(null);
  
  useEffect(() => {
    const videoElektro = videoRefElektro.current;
    const videoSvet = videoRefSvet.current;

    if (!videoElektro || !videoSvet) return;

    if (activeVideo === 'elektro') {
      videoSvet.pause();
      videoElektro.currentTime = 0;
      videoElektro.play().catch((err) => console.error('Ошибка воспроизведения elektro:', err));
    } else {
      videoElektro.pause();
      videoSvet.currentTime = 0;
      videoSvet.play().catch((err) => console.error('Ошибка воспроизведения svet:', err));
    }
  }, [activeVideo]);

  const categoriesRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="relative w-full">
      <style jsx>{`
        .video-transition { transition: opacity 0.5s ease-in-out; }
        .scroll-container::-webkit-scrollbar { display: none; }
        .scroll-container { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      {/* ---------- Видео-баннер ---------- */}
      <section className="relative h-[80vh] sm:h-[90vh] md:h-[105vh] bg-black overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRefElektro}
            className={`w-full h-full object-cover video-transition absolute inset-0 ${activeVideo === 'elektro' ? 'opacity-100' : 'opacity-0'}`}
            autoPlay muted playsInline preload="auto" src={videoSources.elektro}
            poster="/images/banners/elektro-poster.jpg"
          />
          <video
            ref={videoRefSvet}
            className={`w-full h-full object-cover video-transition absolute inset-0 ${activeVideo === 'svet' ? 'opacity-100' : 'opacity-0'}`}
            autoPlay muted playsInline preload="auto" src={videoSources.svet}
            poster="/images/banners/svet-poster.jpg"
          />
        </div>
        <div className="absolute inset-0 bg-black/30 z-10" />
      </section>

      {/* ---------- Минималистичные переключатели видео ---------- */}
      <div className="max-w-8xl mx-auto px-4 md:px-6 -mt-20 md:-mt-24 relative z-20">
        <div className="flex justify-center items-center gap-6 md:gap-16">
          <Link href="/catalog" className="group" onMouseEnter={() => setActiveVideo('svet')}>
            <div className="relative text-center cursor-pointer py-4">
              <h2 className={`text-white text-base md:text-2xl font-semibold tracking-wide transition-opacity duration-300 ${activeVideo === 'svet' ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                Освещение
              </h2>
              <div className={`absolute bottom-0 left-0 h-0.5 bg-white rounded-full transition-all duration-300 ease-out ${activeVideo === 'svet' ? 'w-full' : 'w-0'}`} />
            </div>
          </Link>
          <Link href="/ElektroustnovohneIzdely" className="group" onMouseEnter={() => setActiveVideo('elektro')}>
            <div className="relative text-center cursor-pointer py-4">
              <h2 className={`text-white text-base md:text-2xl font-semibold tracking-wide transition-opacity duration-300 ${activeVideo === 'elektro' ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                Электроустановочное изделие
              </h2>
              <div className={`absolute bottom-0 left-0 h-0.5 bg-white rounded-full transition-all duration-300 ease-out ${activeVideo === 'elektro' ? 'w-full' : 'w-0'}`} />
            </div>
          </Link>
        </div>
      </div>

      {/* ---------- Категории ---------- */}
      <div className="mt-8 mb-8 max-w-8xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-3xl font-bold text-black">КАТЕГОРИИ</h2>
          <Link href="/catalog" className="text-sm underline">
            перейти в каталог
          </Link>
        </div>
        <div className="relative">
          <div ref={categoriesRef} className="flex gap-4 md:gap-6 overflow-x-auto scroll-smooth py-2 md:py-4 scroll-container">
            <div className="flex-shrink-0 w-[70vw] sm:w-[50vw] md:w-1/3">
              <Link href="/catalog/chandeliers" className="group relative rounded-2xl overflow-hidden h-64 md:h-[520px] block">
                <Image src="/images/category/dekoratvinysvetcategory.webp" alt="Декоративный свет" fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" sizes="(max-width: 768px) 70vw, (max-width: 1024px) 50vw, 33vw" />
              </Link>
              <div className="mt-4 text-base md:text-xl font-semibold text-black">Декоративный свет</div>
            </div>
            <div className="flex-shrink-0 w-[70vw] sm:w-[50vw] md:w-1/3">
              <Link href="/catalog/lights/pendant-lights" className="group relative rounded-2xl overflow-hidden h-64 md:h-[520px] block">
                <Image src="/images/category/funcionaltsvet.webp" alt="Технический свет" fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" sizes="(max-width: 768px) 70vw, (max-width: 1024px) 50vw, 33vw" />
              </Link>
              <div className="mt-4 text-base md:text-xl font-semibold text-black">Функциональный свет</div>
            </div>
            <div className="flex-shrink-0 w-[70vw] sm:w-[50vw] md:w-1/3">
              <Link href="/catalog/outdoor-lights" className="group relative rounded-2xl overflow-hidden h-64 md:h-[520px] block">
                <Image src="/images/category/ylichysvetcategory.webp" alt="Уличный свет" fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" sizes="(max-width: 768px) 70vw, (max-width: 1024px) 50vw, 33vw" />
              </Link>
              <div className="mt-4 text-base md:text-xl font-semibold text-black">Уличный свет</div>
            </div>
            <div className="flex-shrink-0 w-[70vw] sm:w-[50vw] md:w-1/3">
              <Link href="/ElektroustnovohneIzdely" className="group relative rounded-2xl overflow-hidden h-64 md:h-[520px] block">
                <Image src="/images/category/elektroustnovohneIzdelycategory.jpg" alt="Электроустановочное изделие" fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" sizes="(max-width: 768px) 70vw, (max-width: 1024px) 50vw, 33vw" />
              </Link>
              <div className="mt-4 text-base md:text-xl font-semibold text-black">Электроустановочное изделие</div>
            </div>
          </div>
          <button onClick={() => { const el = categoriesRef.current; if (el) el.scrollBy({ left: -Math.max(el.clientWidth * 0.7, 300), behavior: 'smooth' }); }} aria-label="Предыдущая категория" className="hidden md:flex items-center justify-center w-10 h-10 text-neutral-300 absolute left-2 top-1/2 transform -translate-y-1/2 z-10">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={() => { const el = categoriesRef.current; if (el) el.scrollBy({ left: Math.max(el.clientWidth * 0.7, 300), behavior: 'smooth' }); }} aria-label="Следующая категория" className="hidden md:flex items-center justify-center w-10 h-10 text-neutral-300 absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      {/* ---------- Текстовый блок ---------- */}
      <div className="mb-12 md:mb-24 max-w-8xl mx-auto px-4 md:px-4">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          <div className="w-full md:w-1/2 space-y-4 md:space-y-8 py-4 md:py-8 order-2 md:order-1">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900">Твой свет для комфорта:<br />новинки от производителей</h2>
            <p className="text-base md:text-lg text-black mb-4 md:mb-8">Новые функциональные светильники от производителей, которые придадут вашему интерьеру элегантность.</p>
            <div className="relative h-[250px] md:h-[500px] mt-4 md:mt-8 group">
              <div className="absolute inset-0 bg-[url('/images/banners/bannersabouts.png')] bg-cover bg-center rounded-2xl overflow-hidden transition-opacity duration-500 ease-in-out">
                <div className="absolute inset-x-0 top-0 h-16 md:h-32 pointer-events-none bg-gradient-to-b from-white to-transparent rounded-t-2xl" />
                <div className="absolute inset-x-0 bottom-0 h-16 md:h-32 pointer-events-none bg-gradient-to-t from-white to-transparent rounded-b-2xl" />
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 relative h-auto group order-1 md:order-2 px-0">
            <h2 className="text-2xl md:text-4xl py-4 md:py-8 font-bold text-gray-900">Открывай для себя новые возможности каждый день</h2>
            <span className="text-base md:text-2xl text-black">
              Мы предлагаем широкий ассортимент светильников, люстр и электротехнических товаров от лучших мировых производителей. В нашем каталоге представлены как классические, так и современные решения для освещения: от изысканных хрустальных люстр до стильных подвесных светильников, функциональных спотов и энергосберегающих систем. У нас вы можете найти всё, что необходимо для создания комфортной и гармоничной световой атмосферы в доме, офисе, ресторане или торговом помещении.
              <br /><br />
              Мы предоставляем не только продажу товаров, но и полный комплекс услуг — от профессионального проектирования и подбора оборудования до квалифицированного монтажа и последующего сервисного обслуживания. Наши специалисты помогут разработать индивидуальный проект освещения с учётом особенностей вашего интерьера, технических требований и бюджета.
              <br /><br />
              Дополнительным преимуществом является гибкость работы: мы сотрудничаем как с частными клиентами, так и с организациями, строительными компаниями, дизайнерами и архитекторами.
            </span>
          </div>
        </div>
        <div>
          <div className="gap-8 md:gap-12 items-center">
            <div className="space-y-4 md:space-y-6">
              <div className="space-y-6 md:space-y-10 mt-12 md:mt-20">
                <h3 className="text-2xl md:text-4xl font-bold text-black">Освещаем вашу жизнь</h3>
                <p className="text-base md:text-2xl text-black leading-relaxed">MoreElektriki — ведущий поставщик качественного освещения в России. Мы специализируемся на продаже премиальных светильников, люстр и электротехнических товаров от лучших мировых производителей.</p>
                <p className="text-base md:text-2xl text-black leading-relaxed">Наша команда профессионалов поможет вам создать идеальное освещение для дома, офиса или коммерческого объекта. Мы предлагаем не только продажу, но и полный комплекс услуг по проектированию и монтажу.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Популярные под заказ ---------- */}
      <div className="mb-12 md:mb-24 max-w-8xl mx-auto px-4 md:px-6">
        <h2 className="text-2xl md:text-4xl font-bold text-center text-black mb-8 md:mb-12">Популярные под заказ силовые кабели</h2>
        <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6 lg:grid-cols-4 lg:gap-6 xl:grid-cols-4 xl:gap-9">
          {demoProducts.map((product, index) => (
            <DemoProductCard key={index} name={product.name} article={product.article} imageUrl={product.imageUrl} price={product.price} />
          ))}
        </div>
      </div>
    </div>
  );
}