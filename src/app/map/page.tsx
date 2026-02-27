
'use client';

import React, { useState } from 'react';
import { YMaps, Map as YMap, Placemark, ZoomControl, FullscreenControl } from '@pbe/react-yandex-maps';
import { FaMapMarkerAlt, FaPhoneAlt, FaClock } from 'react-icons/fa';

// Ваши актуальные магазины
const STORES = [
  {
    id: 2,
    title: "ТК Конструктор",
    address: "Москва, 25-км МКАД, ТК Конструктор, Главный корпус, B2.9 B2.10",
    phone: "+7 (966)-033-31-11",
    hours: "с 10:00 до 21:00",
    coords: [55.583222, 37.710800], 
  },
  // Можно добавить еще магазины для проверки скролла
];

export default function AboutPage() {
  // Состояние активного магазина для подсветки в списке
  const [activeStoreId, setActiveStoreId] = useState<number | null>(STORES[0].id);

  // Состояние карты
  const [mapState, setMapState] = useState({
    center: STORES[0].coords, // Сразу центрируем на первом магазине (или можно оставить общую [55.67, 37.77])
    zoom: 15, 
    controls: [] 
  });

  // Обработчик клика по магазину
  const handleStoreSelect = (store: typeof STORES[0]) => {
    setActiveStoreId(store.id);
    setMapState({
      ...mapState,
      center: store.coords,
      zoom: 16,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <section id="where-to-buy" className="max-w-7xl mx-auto py-8 md:py-16">
        
        {/* Заголовок */}
        <div className="mb-10 text-center md:text-left">
          <h2 className='text-3xl md:text-5xl font-bold tracking-tight mb-4 text-slate-900'>
            Где нас найти
          </h2>
          <p className="text-slate-500 text-lg">
            Посетите наши шоурумы и убедитесь в качестве продукции
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[650px]">
          
          {/* Левая колонка: Список магазинов */}
          <div className="w-full lg:w-1/3 flex flex-col gap-4 lg:overflow-y-auto custom-scrollbar pr-2">
            {STORES.map((store) => {
              const isActive = activeStoreId === store.id;
              
              return (
                <div 
                  key={store.id} 
                  onClick={() => handleStoreSelect(store)}
                  className={`
                    relative p-6 rounded-2xl cursor-pointer transition-all duration-300 border
                    ${isActive 
                      ? ' text-black  shadow-xl scale-[1.02]' 
                      : 'bg-white text-black  hover:shadow-md'
                    }
                  `}
                >
                  <h3 className={`text-xl font-bold mb-4 ${isActive ? 'text-black' : 'text-slate-900'}`}>
                    {store.title}
                  </h3>

                  <div className="space-y-3 text-sm leading-relaxed">
                    {/* Адрес */}
                    <div className="flex items-start gap-3">
                      <FaMapMarkerAlt className={`mt-1 shrink-0 ${isActive ? 'text-gray-400' : 'text-blue-600'}`} />
                      <span>{store.address}</span>
                    </div>

                    {/* Телефон */}
                    <div className="flex items-center gap-3">
                      <FaPhoneAlt className={`shrink-0 ${isActive ? 'text-gray-400' : 'text-blue-600'}`} />
                      <a 
                        href={`tel:${store.phone}`} 
                        className="hover:underline font-medium" 
                        onClick={(e) => e.stopPropagation()}
                      >
                        {store.phone}
                      </a>
                    </div>

                    {/* Часы работы */}
                    <div className="flex items-center gap-3">
                      <FaClock className={`shrink-0 ${isActive ? 'text-gray-400' : 'text-blue-600'}`} />
                      <span>{store.hours}</span>
                    </div>
                  </div>
  
                
                </div>
              );
            })}
          </div>
          
          {/* Центральная колонка: Карта */}
          <div className="w-full lg:w-2/3 h-[400px] lg:h-full bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-200 relative z-0">
            <YMaps query={{ lang: 'ru_RU', apikey: '' }}>
              <YMap 
                state={mapState}
                defaultState={{ center: [55.67, 37.77], zoom: 10 }} 
                width="100%" 
                height="100%"
                className="w-full h-full grayscale-[0.3]" // Чуть приглушаем цвета карты для стиля (можно убрать)
                modules={["control.ZoomControl", "control.FullscreenControl"]}
              >
                <ZoomControl options={{ position: { right: 10, top: 50 }, size: 'small' }} />
                <FullscreenControl />
                
                {STORES.map((store) => (
                  <Placemark
                    key={store.id}
                    geometry={store.coords}
                    properties={{ 
                      balloonContentHeader: `<strong style="font-size:16px;">${store.title}</strong>`,
                      balloonContentBody: `${store.address}<br/><b>${store.phone}</b>`,
                    }}
                    modules={['geoObject.addon.balloon', 'geoObject.addon.hint']}
                    options={{ 
                      iconLayout: 'default#image', 
                      iconImageHref: '/images/banners/markerbanners.png', // Проверьте путь
                      iconImageSize: [120, 120], // Чуть уменьшил для аккуратности
                      iconImageOffset: [-25, -25],
                      hideIconOnBalloonOpen: false,
                    }}
                    onClick={() => handleStoreSelect(store)}
                  />
                ))}
              </YMap>
            </YMaps>
          </div>

        </div>
      </section>
    </div>
  );
}
