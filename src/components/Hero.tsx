
'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';


// --- Компонент карточки товара (ОРИГИНАЛЬНЫЙ) ---
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
        <div className="relative aspect-square bg-gradient-to-br  flex items-center justify-center overflow-hidden product-image">
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
          8(926) 552-21-73 для уточнения 
        </button>
      </div>
    </div>
  );
};

// --- Основной компонент страницы ---
export default function Banner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const demoProducts = [
    { name: 'Кабель силовой ВВГ-Пнг(А) 3х2.5 Калужский кабельный завод (ККЗ) (ГОСТ)', article: 'ЦС000038155', imageUrl: '/images/series/ввг-пнг.jpg', price: '85 руб' },
    { name: 'Кабель силовой ВВГ-Пнг(А) 3х1.5 плоский Калужский кабельный завод (ККЗ) (ГОСТ)', article: 'ЦС000038156', imageUrl: '/images/series/ввг-пнг.jpg', price: '58 руб' },
    { name: 'Кабель силовой ВВГ-Пнг(А) 3х6 плоский Калужский кабельный завод (ККЗ) (ГОСТ)', article: 'ЦС000038157', imageUrl: '/images/series/ввг-пнг.jpg', price: '250 руб' },
    { name: 'Кабель силовой ВВГ-Пнг(А) 3х4 плоский Калужский кабельный завод (ККЗ) (ГОСТ)', article: 'ЦС000038158', imageUrl: '/images/series/ввг-пнг.jpg', price: '150 руб' },
  ];

  const categoriesRef = useRef<HTMLDivElement | null>(null);

  const heroSlides = [
    {
      id: 1,
      src: '/images/banners/LantraBanners.jpg',
      alt: 'Главный баннер'
    },
    // Добавьте еще слайды по необходимости
  ]; 

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <div className="relative w-full">
      <style jsx>{`
        .scroll-container::-webkit-scrollbar { display: none; }
        .scroll-container { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      {/* ---------- СЛАЙДЕР (НОВЫЙ МИНИМАЛИСТИЧНЫЙ ДИЗАЙН) ---------- */}
      <section className="relative h-[120vh] overflow-hidden group">
        {heroSlides.map((slide, index) => (
          <div 
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
        ))}
        
        <div className="relative z-20 h-full flex items-center max-w-screen-2xl mx-auto px-6 md:px-12">
            <div className="max-w-2xl text-white">
                <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-4 drop-shadow-sm">Добро пожаловать</h1>
                <p className='text-lg md:text-xl font-light opacity-90 mb-8 max-w-md drop-shadow-sm'>
                  Воплощение дизайна в каждом доме. Чистота линий и света.
                </p>
                <Link 
                  href="catalog/maytoni/outdoor-lights/landscape-lights" 
                  className="inline-block border border-white text-white hover:bg-white hover:text-black transition-colors duration-300 py-3 px-10 text-xs font-bold uppercase tracking-[0.2em]"
                >
                    Подробнее
                </Link>
            </div>
        </div>

        {/* Точки навигации (Минималистичные) */}
        {heroSlides.length > 1 && (
          <div className="absolute bottom-10 left-6 md:left-12 z-30 flex space-x-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-12 h-[2px] transition-all duration-300 ${
                  index === currentSlide ? 'bg-white' : 'bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Слайд ${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>


      {/* <div className="mt-16 mb-8 max-w-8xl mx-auto px-4 md:px-6">
      <h2 className="text-xl md:text-3xl font-bold text-black">КАТЕГОРИИ ПОДХОДЯЩИХ ТОВАРОВ</h2>
        <div className="flex items-center justify-between mb-4">
       
        </div>
      </div> */}

     

 {/* ---------- ТЕКСТОВЫЕ БЛОКИ (ЖУРНАЛЬНАЯ ВЕРСТКА) ---------- */}
 <div className="max-w-[1400px] text-black mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-16 md:py-24 space-y-24 md:space-y-32">
        
        {/* Блок 1: Новинки (Текст слева, Картинка справа) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 lg:gap-x-16 gap-y-12 items-center">
          <div className="flex flex-col justify-center order-2 lg:order-1">
            <h2 className="text-4xl md:text-5xl lg:text-[4rem] font-bold uppercase tracking-tight leading-none mb-8 break-words">
              ТВОЙ СВЕТ ДЛЯ КОМФОРТА
            </h2>
            <h3 className="text-xl md:text-2xl uppercase tracking-wide text-gray-800 mb-8">
              НОВИНКИ ОТ ПРОИЗВОДИТЕЛЕЙ
            </h3>
            <p className="text-base sm:text-lg md:text-xl leading-relaxed">
              Новые функциональные светильники от производителей, которые придадут вашему интерьеру элегантность и подчеркнут архитектурные особенности пространства.
            </p>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative h-[300px] md:h-[500px] w-full bg-gray-200 overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center hover:scale-100 transition-transform duration-700"
                style={{ backgroundImage: `url('/images/banners/LightStarbanners.webp')` }}
              />
            </div>
          </div>
        </div>

        {/* Блок 2: Описание (Длинный текст разбит на колонки) */}
        <div>
          <h2 className="text-4xl md:text-5xl lg:text-[4.5rem] font-bold uppercase tracking-tight leading-none mb-12 break-words max-w-5xl">
            ОТКРЫВАЙ ДЛЯ СЕБЯ НОВЫЕ ВОЗМОЖНОСТИ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-16 gap-y-8">
            <p className="text-base sm:text-lg md:text-xl leading-relaxed">
              Мы предлагаем широкий ассортимент светильников, люстр и электротехнических товаров от лучших мировых производителей. В нашем каталоге представлены как классические, так и современные решения для освещения: от изысканных хрустальных люстр до стильных подвесных светильников, функциональных спотов и энергосберегающих систем. У нас вы можете найти всё, что необходимо для создания комфортной атмосферы.
            </p>
            <div className="space-y-8">
              <p className="text-base sm:text-lg md:text-xl leading-relaxed">
                Мы предоставляем не только продажу товаров, но и полный комплекс услуг — от профессионального проектирования и подбора оборудования до квалифицированного монтажа и последующего сервисного обслуживания. Наши специалисты помогут разработать индивидуальный проект освещения.
              </p>
              <p className="text-base sm:text-lg md:text-xl leading-relaxed">
                Дополнительным преимуществом является гибкость работы: мы сотрудничаем как с частными клиентами, так и с организациями, строительными компаниями, дизайнерами и архитекторами.
              </p>
            </div>
          </div>
        </div>

        {/* Блок 3: Освещаем вашу жизнь (Крупный акцентный текст) */}
        <div className=" pt-12 md:pt-16">
          <h2 className="text-4xl md:text-5xl lg:text-[4.5rem] font-bold uppercase tracking-tight leading-none mb-12 break-words">
            ОСВЕЩАЕМ ВАШУ ЖИЗНЬ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-16 gap-y-8">
            <p className="text-lg md:text-2xl font-medium leading-relaxed text-black">
              MoreElektriki — ведущий поставщик качественного освещения в России. Мы специализируемся на продаже премиальных светильников, люстр и электротехнических товаров от лучших мировых производителей.
            </p>
            <p className="text-base sm:text-lg md:text-xl leading-relaxed text-gray-800">
              Наша команда профессионалов поможет вам создать идеальное освещение для дома, офиса или коммерческого объекта. Мы предлагаем не только продажу, но и полный комплекс услуг по проектированию и монтажу, обеспечивая безупречный результат на каждом этапе.
            </p>
          </div>
        </div>
        
      </div>

      {/* ---------- ПОПУЛЯРНЫЕ ТОВАРЫ (ОРИГИНАЛЬНЫЙ ДИЗАЙН) ---------- */}
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
