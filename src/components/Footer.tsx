import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="text-black py-6 border-t border-gray-100">
      <div className="container mx-auto px-4 max-w-[1550px]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-black font-bold text-3xl">MOREELEKTRIKI</h3>
            <span className="text-black font-bold text-sm">© {new Date().getFullYear()}</span>
          </div>

          <nav className="flex  md:flex items-center gap-6 text-sm font-bold text-black">
            <Link href="/" className="hover:text-black">О нас</Link>
            <Link href="/" className="hover:text-black">Доставка</Link>
            <Link href="/" className="hover:text-black">Гарантия</Link>
            <Link href="/" className="hover:text-black">Дизайнеры</Link>
          </nav>

          <div className="md:flex text-[6px] flex items-center font-bold gap-4 md:text-sm">
           <span>ИНН: 503227257585</span>
            <span>ИП: Садыгов Рамиль Тофик Оглы</span>
            <span> ОГРИНП: 317502400058732</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;