
import React from 'react';

const AboutCompany = () => {
  return (
    <section className="bg-[#fcfcfc] text-black py-12 sm:py-16 md:py-24 font-sans overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        
        {/* Главный заголовок */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-bold uppercase tracking-tight mb-8 sm:mb-12 md:mb-16 leading-none">
          О КОМПАНИИ
        </h1>

        {/* Текстовый блок о компании в 2 колонки */}
        {/* Я добавил пример текста, чтобы блок не был пустым */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-16 gap-y-6 mb-16 sm:mb-20 md:mb-28">
          <div className="space-y-4 sm:space-y-6">
             <p className="text-base sm:text-lg md:text-[1.1rem] lg:text-xl leading-relaxed">
                Мы — команда профессионалов, создающая уникальные решения для вашего интерьера. 
                Наша миссия состоит в том, чтобы сделать качественный свет доступным, 
                а процесс выбора — легким и вдохновляющим.
              </p>
          </div>
          <div className="space-y-4 sm:space-y-6">
             <p className="text-base sm:text-lg md:text-[1.1rem] lg:text-xl leading-relaxed">
                За годы работы мы наладили производство и логистику так, чтобы каждый клиент 
                получал свой заказ вовремя и в идеальном состоянии. Ваш комфорт — наш главный приоритет.
              </p>
          </div>
        </div>

        {/* Блок: Доставка */}
        <div className="mb-16 sm:mb-20 md:mb-28">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[4rem] font-bold uppercase tracking-tight mb-4 sm:mb-8 md:mb-10 leading-none">
            ДОСТАВКА
          </h2>
          <h3 className="text-lg sm:text-xl md:text-2xl lg:text-[1.5rem] font-normal uppercase mb-6 sm:mb-8 md:mb-10 text-gray-800">
            БЫСТРО И НАДЕЖНО С ЯНДЕКС GO
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-16 gap-y-6">
            <div className="space-y-4 sm:space-y-6">
              <p className="text-base sm:text-lg md:text-[1.1rem] lg:text-xl leading-relaxed">
                Мы ценим ваше время и стремимся сделать процесс покупки максимально комфортным. 
                Именно поэтому нашим главным партнером по логистике является сервис <b>Яндекс Go</b>. Доставка занимает 2-3 дня с учетом местности и осуществляется в пределах МКАД и Москвы.
              </p>
            </div>
            <div className="space-y-4 sm:space-y-6">
              <p className="text-base sm:text-lg md:text-[1.1rem] lg:text-xl leading-relaxed">
                Выбирайте экспресс-доставку до двери в удобное для вас время. 
                Отслеживайте перемещение ваших новых светильников в реальном времени 
                прямо в приложении на экране смартфона.
              </p>
            </div>
          </div>
        </div>

        {/* Блок: Конфиденциальность */}
        <div>
          {/* break-words обязателен здесь, т.к. слово очень длинное и на iPhone SE порвет верстку */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[4rem] font-bold uppercase tracking-tight mb-4 sm:mb-8 md:mb-10 leading-none break-words">
            КОНФИДЕНЦИАЛЬНОСТЬ
          </h2>
          <h3 className="text-lg sm:text-xl md:text-2xl lg:text-[1.5rem] font-normal uppercase mb-6 sm:mb-8 md:mb-10 text-gray-800">
            ВАШИ ДАННЫЕ ПОД НАДЕЖНОЙ ЗАЩИТОЙ
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-16 gap-y-6">
            <div className="space-y-4 sm:space-y-6">
              <p className="text-base sm:text-lg md:text-[1.1rem] lg:text-xl leading-relaxed">
                 Гарантируем полную безопасность вашей личной информации. 
                Все данные, которые вы предоставляете при оформлении заказа, надежно зашифрованы 
                и хранятся на защищенных серверах.
              </p>
            </div>
            <div className="space-y-4 sm:space-y-6">
              <p className="text-base sm:text-lg md:text-[1.1rem] lg:text-xl leading-relaxed">
                Мы строго соблюдаем политику конфиденциальности и не передаем ваши контакты 
                третьим лицам. Исключение составляют лишь транспортные партнеры (например, Яндекс Go), 
                которым данные нужны исключительно для доставки вашего заказа.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default AboutCompany;
