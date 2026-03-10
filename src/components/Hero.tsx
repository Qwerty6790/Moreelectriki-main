
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

     

      {/* ---------- ТЕКСТОВЫЙ БЛОК (ОРИГИНАЛЬНЫЙ ДИЗАЙН) ---------- */}
      <div className="mb-12 md:mb-24 max-w-8xl mx-auto px-4 md:px-4">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          <div className="w-full md:w-1/2 space-y-4 md:space-y-8 py-4 md:py-8 order-2 md:order-1">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900">Твой свет для комфорта:<br />новинки от производителей</h2>
            <p className="text-base md:text-lg text-black mb-4 md:mb-8">Новые функциональные светильники от производителей, которые придадут вашему интерьеру элегантность.</p>
            <div className="relative h-[250px] md:h-[500px] mt-4 md:mt-8 group">
              <div className="absolute inset-0 bg-[url('/images/banners/LightStarbanners.webp')] bg-cover bg-center rounded-2xl overflow-hidden transition-opacity duration-500 ease-in-out">
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
