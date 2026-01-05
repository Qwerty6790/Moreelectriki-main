
'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  PenTool, 
  Users, 
  FileText, 
  ChevronRight,
  Package,
  Phone
} from 'lucide-react';

const About = () => {
  const [activeSection, setActiveSection] = useState('about');

  // Данные для навигации
  const sections = [
    { id: 'about', label: 'О бренде' },
    { id: 'delivery', label: 'Доставка и Оплата' },
    { id: 'designers', label: 'Дизайнерам' },
    { id: 'privacy', label: 'Конфиденциальность' },
  ];

  return (
    <div className="min-h-screen mt-20 bg-white text-neutral-900 font-sans selection:bg-black selection:text-white">
      
      {/* Заголовок */}
      <div className="container mx-auto px-6 py-12 md:py-20 border-b border-neutral-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-6 uppercase leading-none">
            Moreelektriki<br />
            <span className="text-neutral-400">в вашем пространстве</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 max-w-2xl font-medium">
            Свет, который не просто освещает, а создает атмосферу. Мы объединяем функциональность и эстетику.
          </p>
        </motion.div>
      </div>

      {/* Навигация (Табы) */}
      <div className="sticky top-20 z-10 bg-white/90 backdrop-blur-md border-b border-neutral-100">
        <div className="container mx-auto px-6 overflow-x-auto no-scrollbar">
          <div className="flex space-x-8 md:space-x-12 min-w-max py-4">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`text-sm md:text-base font-bold uppercase tracking-widest transition-colors duration-300 relative py-2 ${
                  activeSection === section.id ? 'text-black' : 'text-neutral-400 hover:text-black'
                }`}
              >
                {section.label}
                {activeSection === section.id && (
                  <motion.div 
                    layoutId="underline" 
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-black"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Контентная область */}
      <div className="container mx-auto px-6 py-16 min-h-[600px]">
        <AnimatePresence mode="wait">
          
          {/* СЕКЦИЯ: О БРЕНДЕ */}
          {activeSection === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-16"
            >
              <div className="space-y-8">
                <p className="text-xl md:text-2xl font-light leading-relaxed">
                  <span className="font-bold">Moreelektriki</span> — это кураторская коллекция освещения. От хрустальной классики до архитектурного минимализма.
                </p>
                <div className="space-y-6 text-neutral-600">
                  <p>
                    Наша цель — помочь вам создать комфортное и гармоничное пространство. Мы тщательно подбираем товары разных ценовых категорий, сотрудничая только с проверенными производителями, гарантирующими качество и стиль.
                  </p>
                  <p>
                    Каждый источник света в нашем каталоге проходит отбор: он должен не только светить, но и украшать интерьер даже в выключенном состоянии.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { title: "Ассортимент", desc: "От лофта до классики" },
                  { title: "Качество", desc: "Проверенные бренды" },
                  { title: "Сервис", desc: "Помощь экспертов" },
                  { title: "Гарантия", desc: "На всю продукцию" },
                ].map((item, idx) => (
                  <div key={idx} className="bg-neutral-50 p-6 border border-neutral-100">
                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-neutral-500 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* СЕКЦИЯ: ДОСТАВКА */}
          {activeSection === 'delivery' && (
            <motion.div
              key="delivery"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="max-w-4xl"
            >
              <h2 className="text-3xl font-black mb-12">Условия доставки и получения</h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-16">
                {/* Москва */}
                <div className="border border-neutral-200 p-8 hover:border-black transition-colors duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-6 h-6" />
                    <h3 className="text-xl font-bold">Москва</h3>
                  </div>
                  <ul className="space-y-4 text-neutral-600">
                    <li className="flex gap-3">
                      <Clock className="w-5 h-5 flex-shrink-0" />
                      <span>Срок: 1–2 рабочих дня</span>
                    </li>
                    <li className="flex gap-3">
                      <Truck className="w-5 h-5 flex-shrink-0" />
                      <span>Доставка до двери курьером</span>
                    </li>
                    <li className="flex gap-3">
                      <Package className="w-5 h-5 flex-shrink-0" />
                      <span>Доступен самовывоз из ПВЗ</span>
                    </li>
                  </ul>
                </div>

                {/* МО */}
                <div className="border border-neutral-200 p-8 hover:border-black transition-colors duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-6 h-6" />
                    <h3 className="text-xl font-bold">Московская область</h3>
                  </div>
                  <ul className="space-y-4 text-neutral-600">
                    <li className="flex gap-3">
                      <Clock className="w-5 h-5 flex-shrink-0" />
                      <span>Срок: 2–4 рабочих дня</span>
                    </li>
                    <li className="flex gap-3">
                      <Truck className="w-5 h-5 flex-shrink-0" />
                      <span>В любой населенный пункт</span>
                    </li>
                    <li className="flex gap-3">
                      <Phone className="w-5 h-5 flex-shrink-0" />
                      <span>Согласование времени заранее</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-neutral-50 p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
                <ShieldCheck className="w-12 h-12 text-black flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-lg mb-2">Безопасная транспортировка</h4>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    Светильники и люстры — хрупкий груз. Мы используем усиленную упаковку, пузырчатую пленку и обрешетку при необходимости, чтобы исключить повреждения. Ответственность за сохранность груза до момента вручения лежит на нас.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* СЕКЦИЯ: ДИЗАЙНЕРАМ (НОВАЯ) */}
          {activeSection === 'designers' && (
            <motion.div
              key="designers"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="max-w-5xl"
            >
              <div className="flex flex-col md:flex-row gap-12 items-start">
                <div className="flex-1">
                  <h2 className="text-3xl font-black mb-6">Сотрудничество</h2>
                  <p className="text-lg text-neutral-600 mb-8">
                    Мы ценим профессионалов. Приглашаем к сотрудничеству дизайн-студии, частных дизайнеров интерьера и архитекторов. 
                  </p>
                  
                  <div className="space-y-6">
                    {[
                      { 
                        icon: Users, 
                        title: "Персональный менеджер", 
                        text: "За вами закрепляется специалист, который поможет с подбором, расчетом освещенности и контролем отгрузки." 
                      },
                      { 
                        icon: PenTool, 
                        title: "Работа с проектами", 
                        text: "Поможем с комплектацией объекта под ключ по вашим визуализациям или спецификациям." 
                      },
                      { 
                        icon: FileText, 
                        title: "Специальные условия", 
                        text: "Система бонусов, накопительные скидки и защита проекта. Предоставляем 3D модели для визуализаций." 
                      }
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="w-12 h-12 bg-neutral-100 flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold mb-1">{item.title}</h4>
                          <p className="text-neutral-500 text-sm">{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="mt-10 px-8 py-4 bg-black text-white font-bold text-sm tracking-widest uppercase hover:bg-neutral-800 transition-colors">
                    Стать партнером
                  </button>
                </div>

                <div className="flex-1 bg-neutral-100 p-8 md:p-12 h-full min-h-[400px] flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-4">Как начать?</h3>
                  <ul className="space-y-4">
                    {['Напишите нам на почту partners@moreelektriki.ru', 'Приложите портфолио или ссылку на соцсети', 'Получите доступ к закрытому каталогу'].map((step, i) => (
                      <li key={i} className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-full border border-black flex items-center justify-center font-bold text-sm">{i + 1}</span>
                        <span className="text-neutral-700">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* СЕКЦИЯ: ПОЛИТИКА */}
          {activeSection === 'privacy' && (
            <motion.div
              key="privacy"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="max-w-3xl"
            >
              <h2 className="text-3xl font-black mb-8">Политика конфиденциальности</h2>
              <div className="space-y-8 text-neutral-600 leading-relaxed">
                <div>
                  <h4 className="text-black font-bold mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" /> Сбор данных
                  </h4>
                  <p>
                    Мы запрашиваем только минимально необходимую информацию для выполнения заказа: имя, контактный телефон, адрес доставки и электронную почту. Эти данные необходимы для формирования чека, связи курьера и уведомлениях о статусе заказа.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-black font-bold mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5" /> Использование и хранение
                  </h4>
                  <p>
                    Вся информация хранится в защищённом контуре и обрабатывается строго в соответствии с ФЗ-152 «О персональных данных». Мы не используем ваши данные для спам-рассылок без вашего явного согласия.
                  </p>
                </div>

                <div>
                  <h4 className="text-black font-bold mb-2 flex items-center gap-2">
                    <Users className="w-5 h-5" /> Третьи лица
                  </h4>
                  <p>
                    Мы гарантируем, что ваши данные не будут переданы третьим лицам, за исключением логистических партнеров (служб доставки), которым необходим адрес и телефон для вручения товара.
                  </p>
                </div>

                <div className="pt-8 border-t border-neutral-200">
                  <p className="text-sm">
                    Вы имеете право в любой момент запросить удаление или изменение своих персональных данных, обратившись в нашу службу поддержки.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default About;