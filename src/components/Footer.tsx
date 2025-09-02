import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className=" text-black py-8 border-t border-gray-100">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Main Footer Content - Compact Version */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
        <h3 className="text-black font-medium text-2xl  mb-3">MoreElecriki</h3>
          {/* About MoreElecriki */}
          <div>
          <h3 className="text-black font-medium text-lg mb-3">О компании</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-gray-900 transition-colors duration-200">О компании</Link></li>
              <li><Link href="/about" className="hover:text-gray-900 transition-colors duration-200">Контакты</Link></li>
              <li><Link href="/about" className="hover:text-gray-900 transition-colors duration-200">Карта сайта</Link></li>
            </ul>
          </div>

          {/* For Buyers */}
          <div>
            <h3 className="text-black font-medium text-lg mb-3">Для дизайнеров</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/register" className="hover:text-gray-900 transition-colors duration-200">Личный кабинет</Link></li>
              <li><Link href="/auth/register" className="hover:text-gray-900 transition-colors duration-200">Доставка и оплата</Link></li>
              <li><Link href="/auth/register" className="hover:text-gray-900 transition-colors duration-200">Гарантия</Link></li>
            </ul>
          </div>

          {/* For Designers */}
          <div>
            <h3 className="text-black font-medium text-lg mb-3">Дизайнерам</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/designers/3d-models" className="hover:text-gray-900 transition-colors duration-200">База 3D моделей</Link></li>
              <li><Link href="/designers/club" className="hover:text-gray-900 transition-colors duration-200">Клуб дизайнеров</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-black font-medium text-lg mb-3">Контакты</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <Phone className="w-3 h-3 mr-2 text-black" /> 
                <Link href="tel:88007771537" className="hover:text-gray-900 transition-colors duration-200">8 800 777 15 37</Link>
              </li>
              <li className="flex items-center">
                <Mail className="w-3 h-3 mr-2 text-black" /> 
                <Link href="mailto:info@moreelecriki.ru" className="hover:text-gray-900 transition-colors duration-200">info@moreelecriki.ru</Link>
              </li>
              <li className="flex items-center">
                <MessageCircle className="w-3 h-3 mr-2 text-black" /> 
                <Link href="https://wa.me/88007771537" className="hover:text-gray-900 transition-colors duration-200">WhatsApp</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500">
         
        </div>
      </div>
    </footer>
  );
};

export default Footer;