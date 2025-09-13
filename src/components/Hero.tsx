'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// CSS для анимации появления текста
const fadeInAnimation = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.8);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @keyframes slideInFromBottom {
    from {
      opacity: 0;
      transform: translateY(50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes textGlow {
    0% {
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }
    50% {
      text-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.6);
    }
    100% {
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }
  }
  
  .animate-fade-in {
    animation: fadeIn 2s ease-out forwards;
  }
  
  .animate-slide-in {
    animation: slideInFromBottom 1.5s ease-out forwards;
  }
  
  .animate-delay-1 {
    animation-delay: 0.5s;
    opacity: 0;
  }
  
  .animate-delay-2 {
    animation-delay: 1.2s;
    opacity: 0;
  }

  .text-glow {
    animation: textGlow 3s ease-in-out infinite;
  }

  .search-text-container {
    opacity: 0;
    transform: scale(0.9);
    transition: all 1s ease-out;
  }

  .search-text-visible {
    opacity: 1;
    transform: scale(1);
  }

  /* Плавное появление слева */
  @keyframes slideInFromLeft {
    from {
      opacity: 0;
      transform: translateX(-40px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .slide-in-left {
    animation: slideInFromLeft 0.7s ease-out forwards;
  }

  .word-slide-in-left {
    display: inline-block;
    /* Делать текст видимым сразу, чтобы не было "мигания" при загрузке */
    opacity: 1;
    transform: translateX(0);
    /* animation-fill-mode both помогает избежать резкого появления */
    animation: slideInFromLeft 0.45s ease-out both;
    will-change: transform, opacity;
    margin-right: 0.32em;
    backface-visibility: hidden;
    -webkit-font-smoothing: antialiased;
  }
  /* Анимация раскрытия книги для текста слайдов */
  @keyframes bookOpenLeft {
    0% {
      transform: perspective(1000px) rotateY(-90deg) translateY(10px);
      opacity: 0;
    }
    60% { opacity: 1; }
    100% {
      transform: perspective(1000px) rotateY(0deg) translateY(0);
      opacity: 1;
    }
  }

  @keyframes bookOpenRight {
    0% {
      transform: perspective(1000px) rotateY(90deg) translateY(10px);
      opacity: 0;
    }
    60% { opacity: 1; }
    100% {
      transform: perspective(1000px) rotateY(0deg) translateY(0);
      opacity: 1;
    }
  }

  .book-open-left {
    transform-origin: left;
    animation: bookOpenLeft 0.7s ease-out forwards;
  }

  .book-open-right {
    transform-origin: right;
    animation: bookOpenRight 0.7s ease-out forwards;
  }

  .book-open-delay-1 { animation-delay: 0.05s; }
  .book-open-delay-2 { animation-delay: 0.18s; }

  /* Плавная анимация для заголовков (включается/выключается целиком) */
  .heading-animate {
    opacity: 0;
    transform: translateX(-18px) scale(0.995);
    transition: opacity 450ms cubic-bezier(.2,.9,.2,1), transform 450ms cubic-bezier(.2,.9,.2,1);
    will-change: opacity, transform;
  }

  .heading-visible {
    opacity: 1;
    transform: translateX(0) scale(1);
  }

  @keyframes wordSlideIn {
    from { opacity: 0; transform: translateX(-14px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .word-animate {
    display: inline-block;
    opacity: 0;
    transform: translateX(-14px);
    will-change: opacity, transform;
    backface-visibility: hidden;
    /* Увеличенный отступ между словами в заголовках */
    margin-right: 0.2em;
    word-spacing: 0.1em;
  }

  .heading-visible .word-animate {
    animation: wordSlideIn 420ms cubic-bezier(.2,.9,.2,1) forwards;
    animation-delay: var(--d);
  }
`;

interface SideBannerSlide {
   id: number;
   image: string;
   alt: string;
   title1: string;
   title2: string;
   description: string;
   buttonText: string;
}

interface VideoBanner {
  id: number;
  title: string;
  subtitle: string;
  textColor: 'white' | 'black';
  bgImage: string;
}

export default function Banner() {
  // Слайды главного баннера (текст + цвет)
  const videoBanners: VideoBanner[] = [
    { id: 1, title: 'Свет, который вдохновляет', subtitle: 'Люстры и светильники для любого интерьера', textColor: 'white', bgImage: '/images/banners/bannersyosveheny4.jpeg' },
    { id: 2, title: 'Ищите, купите, используйте', subtitle: 'Люстры и светильники для любого интерьера', textColor: 'white', bgImage: '/images/banners/bannersyosveheny7.jpg' },
  ];

  // Инициализируем базовый фон из первого слайда, чтобы не показывать устаревшие/удалённые изображения
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [baseBg, setBaseBg] = useState<string>(videoBanners[0].bgImage);
  const [transitionBg, setTransitionBg] = useState<string | null>(null);
  const [isCrossfading, setIsCrossfading] = useState(false);

  const currentBanner = videoBanners[currentVideoIndex];
  const [titleVisible, setTitleVisible] = useState(true);

  // Detect mobile to limit banners and adjust layout
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const visibleVideoBanners = isMobile ? videoBanners.slice(0, 2) : videoBanners;
  const safeCurrentIndex = Math.min(currentVideoIndex, Math.max(0, visibleVideoBanners.length - 1));
  const safeCurrentBanner = visibleVideoBanners[safeCurrentIndex] || visibleVideoBanners[0];

  // Авто-смена слайдов: каждые 3 секунды (учитываем видимые баннеры)
  useEffect(() => {
    if (visibleVideoBanners.length <= 1) return;
    const timer = setTimeout(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % visibleVideoBanners.length);
    }, 3000);
    return () => clearTimeout(timer);
  }, [currentVideoIndex, visibleVideoBanners.length]);

  // Инициализация базового фона теперь задаётся сразу через initialBaseBg, без эффекта

  // Кроссфейд фона при смене слайда (учитываем безопасный баннер)
  useEffect(() => {
    const nextBg = safeCurrentBanner?.bgImage;
    if (!nextBg || nextBg === baseBg) return;
    setTransitionBg(nextBg);
    const raf = requestAnimationFrame(() => setIsCrossfading(true));
    setTitleVisible(false);
    const titleTimer = setTimeout(() => setTitleVisible(true), 160);
    const t = setTimeout(() => {
      setBaseBg(nextBg);
      setTransitionBg(null);
      setIsCrossfading(false);
    }, 500);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(titleTimer);
      clearTimeout(t);
    };
  }, [safeCurrentBanner?.bgImage, baseBg]);

  const handleManualNavigation = (index: number) => {
    setCurrentVideoIndex(index);
  };

  // Прогресс-бар: реф и анимация заполнения одной полосы
  const progressRef = useRef<HTMLDivElement | null>(null);
  // Реф и стейт для блока категорий (слайдер из 4 карточек, 3 видны)
  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const [categoryPage, setCategoryPage] = useState<number>(0);

  useEffect(() => {
    const el = progressRef.current;
    if (!el || visibleVideoBanners.length <= 1) return;
    // Сбрасываем ширину без анимации
    el.style.transition = 'none';
    el.style.width = '0%';
    // Принудительный reflow чтобы transition сработал
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    el.offsetWidth;
    const duration = 3000; // ms, совпадает с таймером смены слайда
    el.style.transition = `width ${duration}ms linear`;
    // Запускаем анимацию заполнения
    el.style.width = '100%';

    return () => {
      if (el) {
        el.style.transition = '';
      }
    };
  }, [currentVideoIndex, visibleVideoBanners.length]);

  return (
    <div className="relative w-full">
      <style jsx>{fadeInAnimation}</style>
      {/* Верхний блок баннера (в пределах секции) */}
      <section className="relative h-[60vh] md:h-[96vh] bg-black">
        {/* Фото для текущего слайда с плавной сменой */}
        <div className="absolute inset-0 z-0">
          {/* Базовый фон */}
          {baseBg && (
            <Image
              src={baseBg}
              alt="Главный баннер"
              fill
              priority
              className={`object-cover ${currentVideoIndex === 2 ? 'md:object-center object-left' : ''}`}
              sizes="100vw"
            />
          )}
          {/* Переходный фон поверх с кроссфейдом */}
          {transitionBg && (
            <Image
              src={transitionBg}
              alt="Главный баннер (смена)"
              fill
              priority
              className="object-cover transition-opacity duration-500"
              sizes="100vw"
              style={{ opacity: isCrossfading ? 1 : 0 }}
            />
          )}
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Контент баннера */}
        <div className="relative  w-full h-full">
        <div className="absolute mt-20  max-lg:mt-52   inset-0 flex items-start md:items-center justify-start px-4 md:px-44 z-20">
          <div className="max-w-3xl">
            <h1
              className={`text-left text-5xl md:text-7xl font-bold  ${
                currentBanner.textColor === 'white' ? 'text-white' : 'text-black'
              } ${titleVisible ? 'heading-animate heading-visible' : 'heading-animate'}`}
            >
              {currentBanner.title.split(' ').map((word, i) => (
                <span
                  key={`t-${i}`}
                  className="word-animate"
                  style={{ ['--d' as any]: `${i * 70}ms` }}
                >
                  {word}
                  {i !== currentBanner.title.split(' ').length - 1 ? ' ' : ''}
                </span>
              ))}
            </h1>
            <h2
              className={`text-left text-xl md:text-5xl  ${
                currentBanner.textColor === 'white' ? 'text-white/90' : 'text-black/90'
              } ${titleVisible ? 'heading-animate heading-visible' : 'heading-animate'}`}
            >
              {currentBanner.subtitle.split(' ').map((word, i) => (
                <span
                  key={`s-${i}`}
                  className="word-animate"
                  style={{ ['--d' as any]: `${220 + i * 35}ms` }}
                >
                  {word}
                  {i !== currentBanner.subtitle.split(' ').length - 1 ? ' ' : ''}
                </span>
              ))}
            </h2>
          </div>
        </div>

        {/* Индикатор видео — одна шкала заполняется и после заполнения меняется слайд */}
        {visibleVideoBanners.length > 1 && (
          <div className="absolute bottom-8 left-0 right-0 z-20 px-4 md:px-8">
            <div
              className="w-full h-2 md:h-3 bg-white/10 rounded-full cursor-pointer"
              onClick={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const pct = Math.max(0, Math.min(1, x / rect.width));
                const target = Math.round(pct * (visibleVideoBanners.length - 1));
                handleManualNavigation(target);
              }}
              role="button"
              aria-label="Прогресс слайдов"
            >
              <div
                ref={progressRef}
                className="h-2 md:h-3 bg-white/40 rounded-full transition-all duration-300 ease-linear"
                style={{ width: '0%' }}
              />
            </div>
          </div>
        )}

        {/* Стрелки управления (скрываем на мобилке если только 1 баннер) */}
        {visibleVideoBanners.length > 1 && (
          <>
            <button
              onClick={() => handleManualNavigation(
                currentVideoIndex === 0 ? visibleVideoBanners.length - 1 : currentVideoIndex - 1
              )}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-all duration-300 ease-in-out z-20"
              style={{ left: '14px' }}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => handleManualNavigation((currentVideoIndex + 1) % videoBanners.length)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-all duration-300 ease-in-out z-20"
              style={{ right: '14px' }}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        </div>
      </section>

         {/* Популярные категории — горизонтальный скролл с рабочими стрелками */}
         <div className="mt-8 mb-8 max-w-8xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-3xl font-bold text-black">КАТЕГОРИИ</h2>
          <Link href="/catalog" className="text-sm underline">перейти в каталог</Link>
        </div>

        <div className="relative">
          {/* Горизонтальный контейнер для карточек категорий */}
          <div ref={categoriesRef} className="flex gap-6 overflow-hidden flex-nowrap scroll-smooth py-2 md:py-4">
            <div className="flex-shrink-0 w-[85%] md:w-1/3">
              <Link href="/catalog/chandeliers/" className="group relative rounded-2xl overflow-hidden h-64 md:h-[520px] block">
                <Image src="/images/category/dekoratvinysvetcategory.webp" alt="Декоративный свет" fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" sizes="(max-width:768px) 100vw, 33vw" />
              </Link>
              <div className="mt-4 text-lg md:text-xl font-semibold text-black">Декоративный свет</div>
            </div>

            <div className="flex-shrink-0 w-[85%] md:w-1/3">
              <Link href="/osveheny?category=Светильник&page=1" className="group relative rounded-2xl overflow-hidden h-64 md:h-[520px] block">
                <Image src="/images/category/funcionaltsvet.webp" alt="Технический свет" fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" sizes="(max-width:768px) 100vw, 33vw" />
              </Link>
              <div className="mt-4 text-lg md:text-xl font-semibold text-black">Функциональный свет</div>
            </div>

            <div className="flex-shrink-0 w-[85%] md:w-1/3">
              <Link href="/ElektroustnovohneIzdely" className="group relative rounded-2xl overflow-hidden h-64 md:h-[520px] block">
                <Image src="/images/category/ylichysvetcategory.webp" alt="Уличный свет" fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" sizes="(max-width:768px) 100vw, 33vw" />
              </Link>
              <div className="mt-4 text-lg md:text-xl font-semibold text-black">Уличный свет</div>
            </div>
            <div className="flex-shrink-0 w-[85%] md:w-1/3">
              <Link href="/ElektroustnovohneIzdely" className="group relative rounded-2xl overflow-hidden h-64 md:h-[520px] block">
                <Image src="/images/category/elektroustnovohneIzdelycategory.jpg" alt="Уличный свет" fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" sizes="(max-width:768px) 100vw, 33vw" />
              </Link>
              <div className="mt-4 text-lg md:text-xl font-semibold text-black">Электроустоновчное изделие</div>
            </div>
          </div>

          {/* Кнопки-стрелки для десктопа */}
          <button
            onClick={() => {
              const el = categoriesRef.current;
              if (!el) return;
              const amount = Math.max(el.clientWidth * 0.7, 300);
              el.scrollBy({ left: -amount, behavior: 'smooth' });
            }}
            aria-label="Предыдущая категория"
            className="md:flex items-center justify-center w-10 h-10  text-neutral-300 absolute left-2 top-1/2 transform -translate-y-1/2  z-10 mobile-arrow"
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
            className="md:flex items-center justify-center w-10 h-10   text-neutral-300 absolute right-2 top-1/2 transform -translate-y-1/2  z-10 mobile-arrow"
          >
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Категории товаров — удалено, оставлен только блок популярных категорий */}

   

      {/* Новая секция с тезисами и фотографией */}
      <div className="mb-12 md:mb-24 max-w-8xl mx-auto px-4 md:px-4">
        <div className="flex flex-col md:flex-row gap-12 md:gap-12">
          {/* На мобилках показываем фото первым (order) */}
          {/* Левая часть с тезисами */}
          <div className="w-full md:w-1/2 space-y-8 md:space-y-8 py-4 md:py-8 order-2 md:order-1">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Твой свет для комфорта:<br/>
              новинки от производителей
            </h2>
            <p className="text-base md:text-lg text-black mb-4 md:mb-8">
              Новые функциональные светильники от производителей, которые придадут вашему интерьеру элегантность.
            </p>
            <div className="relative  h-[200px] md:h-[500px] mt-4 md:mt-8 group">
              <div className="absolute inset-0 bg-[url('/images/banners/bannersabouts.png')] bg-cover bg-center rounded-2xl overflow-hidden transition-opacity duration-500 ease-in-out">
                <div className="absolute inset-x-0 top-0 h-16 md:h-32 pointer-events-none bg-gradient-to-b from-white to-transparent rounded-t-2xl" />
                <div className="absolute inset-x-0 bottom-0 h-16 md:h-32 pointer-events-none bg-gradient-to-t from-white to-transparent rounded-b-2xl" />
              </div>
            </div>
          </div>

          {/* Правая часть с фотографией */}
          <div className="w-full md:w-1/2 relative h-auto md:h-[600px] group order-1 md:order-2 px-0 md:px-0">
            <h2 className='text-3xl md:text-4xl py-4 md:py-8 font-bold text-gray-900'>
              Открывай для себя новые возможности каждый день
            </h2>
            <span className='text-lg md:text-2xl text-black'>
            Мы предлагаем широкий ассортимент светильников, люстр и электротехнических товаров от лучших мировых производителей. В нашем каталоге представлены как классические, так и современные решения для освещения: от изысканных хрустальных люстр до стильных подвесных светильников, функциональных спотов и энергосберегающих систем. У нас вы можете найти всё, что необходимо для создания комфортной и гармоничной световой атмосферы в доме, офисе, ресторане или торговом помещении.

Мы предоставляем не только продажу товаров, но и полный комплекс услуг — от профессионального проектирования и подбора оборудования до квалифицированного монтажа и последующего сервисного обслуживания. Наши специалисты помогут разработать индивидуальный проект освещения с учётом особенностей вашего интерьера, технических требований и бюджета.

Дополнительным преимуществом является гибкость работы: мы сотрудничаем как с частными клиентами, так и с организациями, строительными компаниями, дизайнерами и архитекторами.

            </span>
          </div>
        </div>
        <div>
          <div className="gap-8 md:gap-12 items-center">
            {/* Левая часть - текст о компании */}
            <div className="space-y-4 md:space-y-6">
              <div className="space-y-10 mt-20  md:space-y-4">
                <h3 className="text-3xl   md:text-4xl font-bold text-black">Освещаем вашу жизнь</h3>
                <p className="text-lg md:text-2xl text-black leading-relaxed">
                  MoreElektriki — ведущий поставщик качественного освещения в России. 
                  Мы специализируемся на продаже премиальных светильников, люстр и 
                  электротехнических товаров от лучших мировых производителей.
                </p>
                <p className="text-lg md:text-2xl text-black leading-relaxed">
                  Наша команда профессионалов поможет вам создать идеальное освещение 
                  для дома, офиса или коммерческого объекта. Мы предлагаем не только 
                  продажу, но и полный комплекс услуг по проектированию и монтажу.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}