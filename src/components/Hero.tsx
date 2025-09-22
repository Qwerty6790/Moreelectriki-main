'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Banner() {
  const videoSources = ['/images/banners/titan.mp4'];

  const [currentVideoIndex] = useState(0); // всегда 0, т.к. 1 видео
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  /* ---------- определяем мобильную версию ---------- */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* ---------- обработчики событий видео ---------- */
  const handleLoadedMetadata = () => setIsVideoLoaded(true);
  const handleCanPlay = () => {
    if (!isVideoLoaded) setIsVideoLoaded(true);
  };
  const handleError = () => {
    setVideoError(true);
    setIsVideoLoaded(false);
  };

  /* ---------- запускаем воспроизведение ---------- */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.load(); // грузим метаданные
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        /* можно добавить fallback-изображение, если нужно */
      });
    }
  }, []);

  /* ---------- если через 5 секунд видео всё ещё не загружено — считаем ошибкой ---------- */
  useEffect(() => {
    if (isVideoLoaded || videoError) return;
    const t = setTimeout(() => setVideoError(true), 5000);
    return () => clearTimeout(t);
  }, [isVideoLoaded, videoError]);

  const categoriesRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="relative w-full">
      <style jsx>{`
        .video-transition { transition: opacity 0.5s ease-in-out; }
      `}</style>

      <Link href="/ElektroustnovohneIzdely/Voltum" className="block">
        <section className="relative h-[60vh] md:h-[105vh] bg-black overflow-hidden cursor-pointer">
          <div className="absolute inset-0 z-0">
            {!videoError && (
              <video
                ref={videoRef}
                key={currentVideoIndex}
                className={`w-full h-full object-cover video-transition ${
                  isVideoLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                muted
                playsInline
                preload="metadata"
                onLoadedMetadata={handleLoadedMetadata}
                onCanPlay={handleCanPlay}
                onError={handleError}
              >
                <source src={videoSources[currentVideoIndex]} type="video/mp4" />
              </video>
            )}
            <div className="absolute inset-0 bg-black/20 z-10" />
            {videoError && (
              <div className="absolute top-4 left-4 bg-red-500/80 text-white px-3 py-1 rounded text-sm z-30">
                Видео не загружается, попробуем позже
              </div>
            )}
          </div>
        </section>
      </Link>

      {/* ---------- категории ---------- */}
      <div className="mt-8 mb-8 max-w-8xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-3xl font-bold text-black">КАТЕГОРИИ</h2>
          <Link href="/catalog" className="text-sm underline">
            перейти в каталог
          </Link>
        </div>

        <div className="relative">
          <div
            ref={categoriesRef}
            className="flex gap-6 overflow-hidden flex-nowrap scroll-smooth py-2 md:py-4"
          >
            <div className="flex-shrink-0 w-[85%] md:w-1/3">
              <Link
                href="/catalog/chandeliers"
                className="group relative rounded-2xl overflow-hidden h-64 md:h-[520px] block"
              >
                <Image
                  src="/images/category/dekoratvinysvetcategory.webp"
                  alt="Декоративный свет"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width:768px) 100vw, 33vw"
                />
              </Link>
              <div className="mt-4 text-lg md:text-xl font-semibold text-black">
                Декоративный свет
              </div>
            </div>

            <div className="flex-shrink-0 w-[85%] md:w-1/3">
              <Link
                href="/catalog/lights/pendant-lights"
                className="group relative rounded-2xl overflow-hidden h-64 md:h-[520px] block"
              >
                <Image
                  src="/images/category/funcionaltsvet.webp"
                  alt="Технический свет"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width:768px) 100vw, 33vw"
                />
              </Link>
              <div className="mt-4 text-lg md:text-xl font-semibold text-black">
                Функциональный свет
              </div>
            </div>

            <div className="flex-shrink-0 w-[85%] md:w-1/3">
              <Link
                href="/catalog/outdoor-lights"
                className="group relative rounded-2xl overflow-hidden h-64 md:h-[520px] block"
              >
                <Image
                  src="/images/category/ylichysvetcategory.webp"
                  alt="Уличный свет"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width:768px) 100vw, 33vw"
                />
              </Link>
              <div className="mt-4 text-lg md:text-xl font-semibold text-black">
                Уличный свет
              </div>
            </div>

            <div className="flex-shrink-0 w-[85%] md:w-1/3">
              <Link
                href="/ElektroustnovohneIzdely"
                className="group relative rounded-2xl overflow-hidden h-64 md:h-[520px] block"
              >
                <Image
                  src="/images/category/elektroustnovohneIzdelycategory.jpg"
                  alt="Электроустановочное изделие"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width:768px) 100vw, 33vw"
                />
              </Link>
              <div className="mt-4 text-lg md:text-xl font-semibold text-black">
                Электроустановочное изделие
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              const el = categoriesRef.current;
              if (!el) return;
              const amount = Math.max(el.clientWidth * 0.7, 300);
              el.scrollBy({ left: -amount, behavior: 'smooth' });
            }}
            aria-label="Предыдущая категория"
            className="md:flex items-center justify-center w-10 h-10 text-neutral-300 absolute left-2 top-1/2 transform -translate-y-1/2 z-10"
          >
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => {
              const el = categoriesRef.current;
              if (!el) return;
              const amount = Math.max(el.clientWidth * 0.7, 300);
              el.scrollBy({ left: amount, behavior: 'smooth' });
            }}
            aria-label="Следующая категория"
            className="md:flex items-center justify-center w-10 h-10 text-neutral-300 absolute right-2 top-1/2 transform -translate-y-1/2 z-10"
          >
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ---------- текстовый блок ---------- */}
      <div className="mb-12 md:mb-24 max-w-8xl mx-auto px-4 md:px-4">
        <div className="flex flex-col md:flex-row gap-12 md:gap-12">
          <div className="w-full md:w-1/2 space-y-8 md:space-y-8 py-4 md:py-8 order-2 md:order-1">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Твой свет для комфорта:<br />
              новинки от производителей
            </h2>
            <p className="text-base md:text-lg text-black mb-4 md:mb-8">
              Новые функциональные светильники от производителей, которые придадут вашему интерьеру элегантность.
            </p>
            <div className="relative h-[200px] md:h-[500px] mt-4 md:mt-8 group">
              <div className="absolute inset-0 bg-[url('/images/banners/bannersabouts.png')] bg-cover bg-center rounded-2xl overflow-hidden transition-opacity duration-500 ease-in-out">
                <div className="absolute inset-x-0 top-0 h-16 md:h-32 pointer-events-none bg-gradient-to-b from-white to-transparent rounded-t-2xl" />
                <div className="absolute inset-x-0 bottom-0 h-16 md:h-32 pointer-events-none bg-gradient-to-t from-white to-transparent rounded-b-2xl" />
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 relative h-auto md:h-[600px] group order-1 md:order-2 px-0 md:px-0">
            <h2 className="text-3xl md:text-4xl py-4 md:py-8 font-bold text-gray-900">
              Открывай для себя новые возможности каждый день
            </h2>
            <span className="text-lg md:text-2xl text-black">
              Мы предлагаем широкий ассортимент светильников, люстр и электротехнических товаров от лучших мировых производителей. В нашем каталоге представлены как классические, так и современные решения для освещения: от изысканных хрустальных люстр до стильных подвесных светильников, функциональных спотов и энергосберегающих систем. У нас вы можете найти всё, что необходимо для создания комфортной и гармоничной световой атмосферы в доме, офисе, ресторане или торговом помещении.
              <br />
              <br />
              Мы предоставляем не только продажу товаров, но и полный комплекс услуг — от профессионального проектирования и подбора оборудования до квалифицированного монтажа и последующего сервисного обслуживания. Наши специалисты помогут разработать индивидуальный проект освещения с учётом особенностей вашего интерьера, технических требований и бюджета.
              <br />
              <br />
              Дополнительным преимуществом является гибкость работы: мы сотрудничаем как с частными клиентами, так и с организациями, строительными компаниями, дизайнерами и архитекторами.
            </span>
          </div>
        </div>

        <div>
          <div className="gap-8 md:gap-12 items-center">
            <div className="space-y-4 md:space-y-6">
              <div className="space-y-10 mt-20 md:space-y-4">
                <h3 className="text-3xl md:text-4xl font-bold text-black">Освещаем вашу жизнь</h3>
                <p className="text-lg md:text-2xl text-black leading-relaxed">
                  MoreElektriki — ведущий поставщик качественного освещения в России. Мы специализируемся на продаже премиальных светильников, люстр и электротехнических товаров от лучших мировых производителей.
                </p>
                <p className="text-lg md:text-2xl text-black leading-relaxed">
                  Наша команда профессионалов поможет вам создать идеальное освещение для дома, офиса или коммерческого объекта. Мы предлагаем не только продажу, но и полный комплекс услуг по проектированию и монтажу.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}