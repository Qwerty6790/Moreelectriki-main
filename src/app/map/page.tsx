
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
    phone: "+7 926 552-21-73",
    hours: "с 10:00 до 21:00",
    coords: [55.583222, 37.710800], 
  },
  // Можно добавить еще магазины для проверки скролла
];

export default function AboutPage() {
  const [activeStoreId, setActiveStoreId] = useState<number | null>(STORES[0].id);

  const [mapState, setMapState] = useState({
    center: STORES[0].coords,
    zoom: 15, 
    controls: [] 
  });

  const handleStoreSelect = (store: typeof STORES[0]) => {
    setActiveStoreId(store.id);
    setMapState({
      ...mapState,
      center: store.coords,
      zoom: 16,
    });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <section id="where-to-buy" className="max-w-7xl mx-auto py-8 md:py-16">
        
        {/* Заголовок */}
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-4xl md:text-[4rem] font-bold uppercase tracking-tight mb-8 md:mb-12">
            Где нас найти
          </h2>
          <p className=" text-base md:text-lg">
            Посетите наши шоурумы и убедитесь в качестве продукции
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8 h-auto lg:h-[600px]">
          
          {/* Левая колонка: Список магазинов */}
          <div className="w-full lg:w-1/3 flex flex-col gap-2 lg:overflow-y-auto custom-scrollbar pr-2">
            {STORES.map((store) => {
              const isActive = activeStoreId === store.id;
              
              return (
                <div 
                  key={store.id} 
                  onClick={() => handleStoreSelect(store)}
                  className={`
                    group p-5 cursor-pointer transition-colors duration-200 border-l-2
                    ${isActive 
                      ? 'border-black bg-white' 
                      : 'border-transparent hover:bg-gray-50/50'
                    }
                  `}
                >
                  <h3 className="text-lg font-medium mb-4 text-gray-900">
                    {store.title}
                  </h3>

                  <div className="space-y-3 text-sm text-gray-600">
                    {/* Адрес */}
                    <div className="flex items-start gap-3">
                      <FaMapMarkerAlt className="mt-1 shrink-0 text-gray-400" />
                      <span>{store.address}</span>
                    </div>

                    {/* Телефон */}
                    <div className="flex items-center gap-3">
                      <FaPhoneAlt className="shrink-0 text-gray-400" />
                      <a 
                        href={`tel:${store.phone}`} 
                        className="hover:text-black transition-colors" 
                        onClick={(e) => e.stopPropagation()}
                      >
                        {store.phone}
                      </a>
                    </div>

                    {/* Часы работы */}
                    <div className="flex items-center gap-3">
                      <FaClock className="shrink-0 text-gray-400" />
                      <span>{store.hours}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Центральная колонка: Карта */}
          <div className="w-full lg:w-2/3 h-[450px] lg:h-full bg-gray-100 rounded-xl overflow-hidden relative z-0">
            <YMaps query={{ lang: 'ru_RU', apikey: '' }}>
              <YMap 
                state={mapState}
                defaultState={{ center: [55.67, 37.77], zoom: 10 }} 
                width="100%" 
                height="100%"
                className="w-full h-full grayscale-[0.5] opacity-90" // Усилили ч/б эффект для минимализма
                modules={["control.ZoomControl", "control.FullscreenControl"]}
              >
                <ZoomControl options={{ position: { right: 10, top: 50 }, size: 'small' }} />
                <FullscreenControl />
                
                {STORES.map((store) => (
                  <Placemark
                    key={store.id}
                    geometry={store.coords}
                    properties={{ 
                      balloonContentHeader: `<strong style="font-size:14px; font-family: sans-serif;">${store.title}</strong>`,
                      balloonContentBody: `<div style="font-family: sans-serif; font-size:13px; margin-top:5px;">${store.address}<br/><br/><b>${store.phone}</b></div>`,
                    }}
                    modules={['geoObject.addon.balloon', 'geoObject.addon.hint']}
                    options={{ 
                      iconLayout: 'default#image', 
                      iconImageHref: '/images/banners/markerbanners.png',
                      iconImageSize: [60, 60], // Уменьшил размер маркера (120 - это очень много)
                      iconImageOffset: [-30, -60], // Скорректировал центр (чтобы указывал "ножкой" на точку)
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
