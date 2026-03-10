
"use client";

import React from 'react';
import Link from 'next/link';
import { YMaps, Map as YMap, Placemark, ZoomControl, FullscreenControl } from '@pbe/react-yandex-maps';

// Данные вашего магазина для отображения на карте
const storeInfo = {
  title: "ТК Конструктор",
  address: "Москва, 25-км МКАД, ТК Конструктор, Главный корпус, B2.9 B2.10",
  phone: "+7 926 552-21-73",
  coords: [55.583222, 37.710800], 
};

const Footer = () => {
  return (
    <footer className="text-black py-6 border-t border-gray-100 mt-auto">
      <div className="container mx-auto px-4 max-w-[1550px]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-black font-bold text-3xl">MOREELEKTRIKI</h3>
            <span className="text-black font-bold text-sm">© {new Date().getFullYear()}</span>
          </div>

          <nav className="flex md:flex items-center gap-6 text-sm font-bold text-black">
            <Link href="/about" className="hover:text-black">О нас</Link>
            <Link href="/about" className="hover:text-black">Доставка</Link>
            <Link href="/about" className="hover:text-black">Гарантия</Link>
            <Link href="/auth/register" className="hover:text-black">Дизайнеры</Link>
          </nav>

          <div className="md:flex text-[6px] flex items-center font-bold gap-4 md:text-sm">
            <span>ИНН: 503227257585</span>
            <span>ИП: Садыгов Рамиль Тофик Оглы</span>
            <span>ОГРИНП: 317502400058732</span>
          </div>
        </div>
      </div>
      
      {/* Центральная колонка: Карта */}
      <div className="w-full lg:w-2/3 h-[400px] bg-gray-100 rounded-3xl overflow-hidden shadow-lg border border-gray-200 relative z-0 mt-8 mx-auto">
        <YMaps query={{ lang: 'ru_RU', apikey: '' }}>
          <YMap 
            defaultState={{ center: storeInfo.coords, zoom: 15 }} // Центрируем по координатам магазина
            width="100%" 
            height="100%"
            className="w-full h-full grayscale-[0.5] opacity-90" // Стили из вашего кода
            modules={["control.ZoomControl", "control.FullscreenControl"]}
          >
            <ZoomControl options={{ position: { right: 10, top: 50 }, size: 'small' }} />
            <FullscreenControl />
            
            {/* Точка с кастомной картинкой и информацией (баллуном) */}
            <Placemark
              geometry={storeInfo.coords}
              properties={{ 
                balloonContentHeader: `<strong style="font-size:14px; font-family: sans-serif;">${storeInfo.title}</strong>`,
                balloonContentBody: `<div style="font-family: sans-serif; font-size:13px; margin-top:5px;">${storeInfo.address}<br/><br/><b>${storeInfo.phone}</b></div>`,
              }}
              modules={['geoObject.addon.balloon', 'geoObject.addon.hint']}
              options={{ 
                iconLayout: 'default#image', 
                iconImageHref: '/images/banners/markerbanners.png', // Ваш кастомный маркер
                iconImageSize: [60, 60],
                iconImageOffset: [-30, -60],
                hideIconOnBalloonOpen: false,
              }}
            />
          </YMap>
        </YMaps>
      </div>
    </footer>
  );
};

export default Footer;

