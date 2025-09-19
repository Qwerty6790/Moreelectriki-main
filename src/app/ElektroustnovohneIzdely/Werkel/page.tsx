'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Head from 'next/head';

interface Color {
  id: string;
  name: string;
  image: string;
  url: string;
  description?: string;
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
  previewImages?: string[];
}

// Все серии Werkel из name.tsx
const werkelSeriesData: WerkelSeries[] = [
  {
    id: 'info-sockets-werkel',
    name: 'Встраиваемая серия',
    image: '/images/series/werkel.webp',
    previewImages: ['/images/series/seriesvstraivayemay.webp','/images/series/seriesvstraivayemay2.webp','/images/series/seriesvstraivayemay3.webp'],
    colors: [
      { id: 'Белое глянцевое', name: 'Белое глянцевое', image: '/images/colors/белыйглянцевыйWerkel.webp', url: '/ElektroustnovohneIzdely/Werkel/white-gloss', description: 'Элегантный глянцевый белый — идеален для современных интерьеров, легко очищается и визуально расширяет пространство.' },
      { id: 'Черный матовый', name: 'Черный матовый', image: '/images/colors/черныйматовыйWerkel.webp', url: '/ElektroustnovohneIzdely/Werkel/black-matte', description: 'Роскошный матовый чёрный — устойчив к отпечаткам, создаёт глубокий контраст в интерьере.' },
      { id: 'Белый акрил', name: 'Белый акрил', image: '/images/colors/белыйакрилWerkel.webp', url: '/ElektroustnovohneIzdely/Werkel/white-acrylic', description: 'Прочный акриловый белый с мягким световым отражением — приятен на ощупь и долговечен.' },
      { id: 'Серебряный матовый', name: 'Серебряный матовый', image: '/images/colors/серебряныйматовыйWerkel.webp', url: '/ElektroustnovohneIzdely/Werkel/silver-matte', description: 'Стильный серебристый мат — добавляет сдержанной элегантности и хорошо сочетается с металлами.' },
      { id: 'Серебряный рифленый', name: 'Серебряный рифленый', image: '/images/colors/серебряныйрифленыйWerkel.webp', url: '/ElektroustnovohneIzdely/Werkel/silver-corrugated', description: 'Текстурированный серебристый — скрывает мелкие дефекты и добавляет тактильности.' },
      { id: 'Никель рифленый глянцевый', name: 'Никель рифленый глянцевый', image: '/images/colors/никельрифленыйглянцевыйWerkel.webp', url: '/ElektroustnovohneIzdely/Werkel/nickel-corrugated-gloss', description: 'Никелевый глянец с рифлением — роскошный акцент, создаёт богатую игру света.' },
      { id: 'Айвори матовый', name: 'Айвори матовый', image: '/images/colors/айвориматовыйWerkel.webp', url: '/ElektroustnovohneIzdely/Werkel/ivory-matte', description: 'Теплый айвори в матовом исполнении — мягкий и уютный выбор для жилых пространств.' },    
      { id: 'Айвори акрил', name: 'Айвори акрил', image: '/images/colors/айвориакрилWerkel.webp', url: '/ElektroustnovohneIzdely/Werkel/ivory-acrylic', description: 'Акриловый айвори — гигиеничный и лёгкий в уходе, с приятным блеском.' },
      { id: 'Слоновая кость глянцевый', name: 'Слоновая кость глянцевый', image: '/images/colors/слоноваякостьгялнцевыйWerkel.webp', url: '/ElektroustnovohneIzdely/Werkel/ivory-gloss', description: 'Классическая слоновая кость с глянцем — нейтральный, но благородный вариант.' },
      { id: 'Шампань металлик', name: 'Шампань металлик', image: '/images/colors/шампаньметалликWerkel.webp', url: '/ElektroustnovohneIzdely/Werkel/champagne-metallic', description: 'Шампань с металлическим отблеском — тёплый металлический оттенок для роскошных интерьеров.' },
      { id: 'Шампань рифленый', name: 'Шампань рифленый', image: '/images/colors/шампаньрифленыйWerkel.webp', url: '/ElektroustnovohneIzdely/Werkel/champagne-corrugated', description: 'Рифлёный шампань — практичен и визуально интересен за счёт текстуры.' },
      { id: 'Бронза глянцевый', name: 'Бронза глянцевый', image: '/images/colors/бронзаглянцевыйWerkel.webp', url: '/ElektroustnovohneIzdely/Werkel/bronze-corrugated', description: 'Тёплая бронза в глянце — создаёт уют и стильный винтажный акцент.' },
      { id: 'Графит акрил', name: 'Графит акрил', image: '/images/colors/графитакрилWerkel.webp', url: '/ElektroustnovohneIzdely/Werkel/graphite-acrylic', description: 'Акриловый графит — глубокий оттенок с современным характером и гладкой поверхностью.' },
      { id: 'Графит матовый', name: 'Графит матовый', image: '/images/colors/графитматовыйWerkel.webp', url: '/ElektroustnovohneIzdely/Werkel/graphite-matte', description: 'Матовый графит — минималистичный и практичный, отлично скрывает следы.' },
      { id: 'Графит рифленый', name: 'Графит рифленый', image: '/images/colors/графитрифленыйWerkel.webp', url: '/ElektroustnovohneIzdely/Werkel/graphite-corrugated', description: 'Рифлёный графит добавляет глубины и тактильности дизайну.' },
      { id: 'Черный акрил', name: 'Черный акрил', image: '/images/colors/черныйакрилWerkel.webp', url: '/ElektroustnovohneIzdely/Werkel/black-acrylic', description: 'Гладкий чёрный акрил — современный, устойчивый к царапинам и легко чистится.' },
    ],
    frames: [
      { id: 'Черная латунь', name: 'Черная латунь', image: '/images/frames/черныйлатуньрамкаWerkel.webp', url: '/catalog/products?category=(черный/латунь)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
      { id: 'Черный алюминий', name: 'Черный алюминий', image: '/images/frames/черныйалюминийрамкаWerkel.webp', url: '/catalog/products?category=(черный алюминий)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
      { id: 'Хаммер', name: 'Хаммер', image: '/images/frames/хаммеррамкаWerkel.webp', url: '/catalog/products?category=08&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка,Диммер,soft,Acrylic,Умный' },
      { id: 'Слоновая кость', name: 'Слоновая кость', image: '/images/frames/слоноваякостьрамкаWerkel.webp', url: '/catalog/products?category=(слоновая кость)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
      { id: 'Серый', name: 'Серый', image: '/images/frames/серыйрамкаWerkel.webp', url: '/catalog/products?category=(серый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
      { id: 'Серебряный матовый', name: 'Серебряный матовый', image: '/images/frames/серебряныйматовыйрамкаWerkel.webp', url: '/catalog/products?category=(серебряный матовый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
      { id: 'Серебро', name: 'Серебро', image: '/images/frames/сереброрамкаWerkel.webp', url: '/catalog/products?category=(серебро)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
      { id: 'Перламутровый', name: 'Перламутровый', image: '/images/frames/перламутровыйрамкаWerkel.webp', url: '/catalog/products?category=(перламутровый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
      { id: 'Молочный', name: 'Молочный', image: '/images/frames/молочныйрамкаWerkel.webp', url: '/catalog/werkel/frames?color=black-matte' },
      { id: 'Латте', name: 'Латте', image: '/images/frames/латтерамкаWerkel.webp', url: '/catalog/products?source=Werkel&category=%28латте%29&exclude_name=Vintage%2CРетро%2CGallant%2CВыключатель%2CРозетка&page=1' },
      { id: 'Дымчатый', name: 'Дымчатый', image: '/images/frames/дымчатыйрамкаWerkel.webp', url: '/catalog/products?category=(дымчатый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
      { id: 'Дымчатый белый', name: 'Дымчатый белый', image: '/images/frames/дымчатыйбелыйрамкаWerkel.webp', url: '/catalog/products?category=(дымчатый белый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
      { id: 'Графит матовый', name: 'Графит матовый', image: '/images/frames/графитматовыйрамкаWerkel.webp', url: '/catalog/products?category=(графит матовый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
      { id: 'Бронза матовый', name: 'Бронза матовый', image: '/images/frames/бронзаматовыйрамкаWerkel.webp', url: '/catalog/products?category=(бронза матовый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
      { id: 'Белый черный', name: 'Белый черный', image: '/images/frames/белыйчерныйрамкаWerkel.webp', url: '/catalog/products?category=(белый черный)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
      { id: 'Белый матовый', name: 'Белый матовый', image: '/images/frames/белыйматовыйрамкаWerkel.webp', url: '/catalog/products?category=(белый матовый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
      { id: 'Айвори матовый', name: 'Айвори матовый', image: '/images/frames/айвориматовыйрамкаWerkel.webp', url: '/catalog/products?category=(айвори матовый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
      { id: 'Айвори латунь', name: 'Айвори латунь', image: '/images/frames/айворилатуньрамкаWerkel.webp', url: '/catalog/products?category=(айвори латунь)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
      { id: 'Айвори белый', name: 'Айвори белый', image: '/images/frames/айворибелыйрамкаWerkel.webp', url: '/catalog/products?category=(айвори белый)&page=1&subcategory=&source=Werkel&exclude_name=Vintage,Ретро,Gallant,Выключатель,Розетка' },
    ]
  },
  {
    id: 'gallant',
    name: 'Серия Gallant',
    image: '/images/series/seriesnaklandnoy3.png',
    previewImages: ['/images/series/gallant.png','/images/series/seriesnaklandnoy.png','/images/series/seriesnaklandnoy2.png', ],
    colors: [
      { id: 'Графит рифленый', name: 'Графит рифленый', image: '/images/colors/графитрифленыйGallant.webp', url: '/ElektroustnovohneIzdely/Werkel/gallant-graphite-corrugated' },
      { id: 'Черный хром', name: 'Черный хром', image: '/images/colors/черныйхромGallant.webp', url: '/ElektroustnovohneIzdely/Werkel/gallant-black-chrome' },
      { id: 'Слоновая кость', name: 'Слоновая кость', image: '/images/colors/слоноваякостьGallant.webp', url: '/ElektroustnovohneIzdely/Werkel/gallant-ivory' },
      { id: 'Серебряный', name: 'Серебряный', image: '/images/colors/серебряныйGallant.webp', url: '/ElektroustnovohneIzdely/Werkel/gallant-silver' },
      { id: 'Шампань рифленый', name: 'Шампань рифленый', image: '/images/colors/шампаньрифленыйGallant.webp', url: '/ElektroustnovohneIzdely/Werkel/gallant-champagne-corrugated' },
      { id: 'Белый', name: 'Белый', image: '/images/colors/белыйGallant.webp', url: '/ElektroustnovohneIzdely/Werkel/gallant-white' },
    ]
  },
  {
    id: 'retro',
    name: 'Серия Retro',
    image: '/images/series/retro.png',
    previewImages: ['/images/series/seriesretro3.png','/images/series/seriesretro4.png','/images/series/seriesretro2.png',],
    colors: [
      { id: 'Металлическое', name: 'Металлическое', image: '/images/colors/ретрометалическоеWerkel.png', url: '/ElektroustnovohneIzdely/Werkel/retro-metallic' },
      { id: 'Керамическое', name: 'Керамическое', image: '/images/colors/ретрокерамическоеWerkel.png', url: '/ElektroustnovohneIzdely/Werkel/retro-ceramic' },
    ],
  },
  {
    id: 'vintage',
    name: 'Серия Vintage',
    image: '/images/series/vintage.png',
    previewImages: ['/images/series/serisvintage3.png','/images/series/serisvintage2.png','/images/series/serisvintage4.png'],
    colors: [
      { id: 'Черный матовый', name: 'Черный матовый', image: '/images/colors/черныйматовыйхромWerkel.webp', url: '/ElektroustnovohneIzdely/Werkel/vintage-black-matte' },
      { id: 'Мокко матовый хром', name: 'Мокко матовый хром', image: '/images/colors/моккоматоыйхромWerkel.webp', url: '/ElektroustnovohneIzdely/Werkel/vintage-mokko-chrome' },
    ],
    frames: [
      { id: 'Runda', name: 'Runda', image: '/images/rundretroрамкаWerkel.webp', url: '/' },
    ]
  },
  {
    id: 'Выдвижной блок',
    name: 'Выдвижной блок',
    image: '/images/series/vidivihnoyblock.png',
    previewImages: ['/images/series/vidivihnoyblock.png',],
    colors: [
      { id: 'Выдвижной блок', name: 'Выдвижной блок', image: '/images/series/vidivihnoyblock.png', url: '/ElektroustnovohneIzdely/VidviznoyBlock/VidihnoyblockWerkel' },
    ],
  },
];

const WerkelPage: React.FC = () => {
  const [selectedSeries, setSelectedSeries] = useState<WerkelSeries | null>(null);
  const [showFrames, setShowFrames] = useState(false);
  
  // Добавляем ref для слайдера
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const slideCount = 3; // Количество слайдов в слайдере
  
  // Простая и надежная функция для переключения слайдов
  const goToSlide = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
  };
  
  // Функция для перехода к следующему слайду
  const nextSlide = useCallback(() => {
    const newSlide = (currentSlide + 1) % slideCount;
    setCurrentSlide(newSlide);
  }, [currentSlide, slideCount]);
  
  // Функция для перехода к предыдущему слайду
  const prevSlide = useCallback(() => {
    const newSlide = (currentSlide - 1 + slideCount) % slideCount;
    setCurrentSlide(newSlide);
  }, [currentSlide, slideCount]);

  // Автоматическое перелистывание слайдов
  useEffect(() => {
    if (!autoplayEnabled) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Интервал между сменой слайдов - 5 секунд
    
    return () => clearInterval(interval);
  }, [nextSlide, autoplayEnabled]);
  
  // Пауза автопрокрутки при наведении мыши
  const pauseAutoplay = () => setAutoplayEnabled(false);
  const resumeAutoplay = () => setAutoplayEnabled(true);

  const handleSeriesClick = (series: WerkelSeries) => {
    if (series.url) {
      window.location.href = series.url;
    } else {
      setSelectedSeries(series);
      setShowFrames(false);
    }
  };

  const handleBackToSeries = () => {
    setSelectedSeries(null);
    setShowFrames(false);
  };

  const handleFramesClick = () => {
    setShowFrames(true);
  };

  const handleBackFromFrames = () => {
    setShowFrames(false);
  };

  

  return (
    <>
      <Head>
        <title>Werkel - Коллекции электроустановочных изделий | Elektromos</title>
        <meta name="description" content="Изучите коллекции Werkel - от классического винтажа до современных матовых серий. Качественные электроустановочные изделия для вашего интерьера." />
      </Head>

    

      <div className="min-h-screen bg-white py-56">
        <div className="container mx-auto px-4">
        <h2 className='text-black  text-6xl font-bold mb-10'>Werkel</h2>
          {!selectedSeries ? (  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 max-w-7xl mx-auto">
              {werkelSeriesData.map((series) => {
                const isSinglePreview = !!(series.previewImages && series.previewImages.length === 1);
                return (
                  <div
                    key={series.id}
                    onClick={() => handleSeriesClick(series)}
                    className="space-y-4 block transition-transform duration-300 hover:scale-105 cursor-pointer"
                  >
                    <div className="relative overflow-visible rounded-lg pl-6">{/* allow overflow for preview images */}
                      {isSinglePreview ? (
                        // Если только одна картинка — делаем её большой и заполняющей блок
                        <img
                          src={series.previewImages?.[0] || series.image}
                          alt={`Серия ${series.name}`}
                          className="w-full h-64 sm:h-72 md:h-80 object-cover rounded-lg mx-auto"
                        />
                      ) : (
                        <>
                          {/* three overlapping preview images behind the main image */}
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
                            <img
                              src={series.image}
                              alt={`Серия ${series.name}`}
                              className="w-[190px] h-[190px] object-contain mx-auto"
                            />
                          </div>
                        </>
                      )}
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-5xl font-bold text-black">{series.name}</h2>
                      <p className="text-lg text-gray-700 leading-relaxed">Перейти к цветам</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">    
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-12">
                {selectedSeries.colors.map((color, idx) => (
                  <Link
                    key={color.id ?? `${color.name}-${idx}`}
                    href={color.url}
                    className="space-y-4 block transition-transform duration-300 hover:scale-105"
                  >
                    <div className="relative overflow-hidden rounded-lg">
                      <img
                        src={color.image}
                        alt={`Цвет ${color.name}`}
                        className="w-[300px] h-[300px] object-contain mx-auto"
                      />
                    </div>
                    <div className="space-y-2 text-center">
                      <h3 className="text-4xl font-semibold text-black">{color.name}</h3>
                      {color.description && (
                        <p className="text-base text-gray-600 max-w-xl mx-auto mt-2">{color.description}</p>
                      )}
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
};

export default WerkelPage;
