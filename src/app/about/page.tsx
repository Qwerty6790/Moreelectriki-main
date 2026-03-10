
import React from 'react';

const AboutCompany = () => {
  return (
    <section className="bg-[#fcfcfc] text-black py-16 md:py-24 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12">
        
        {/* Главный заголовок */}
        <h1 className="text-5xl md:text-[5.5rem] font-bold uppercase tracking-tight mb-12 md:mb-16">
          О КОМПАНИИ
        </h1>

  
        {/* Текстовый блок о компании в 2 колонки */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-16 gap-y-6 mb-16 md:mb-20">
          
        </div>




        {/* Блок: Доставка */}
        <div className="mb-20 md:mb-28">
          <h2 className="text-4xl md:text-[4rem] font-bold uppercase tracking-tight mb-8 md:mb-12">
            ДОСТАВКА
          </h2>
          <h3 className="text-xl md:text-2xl lg:text-[1.5rem] font-normal uppercase mb-8 md:mb-10">
            БЫСТРО И НАДЕЖНО С ЯНДЕКС GO
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-16 gap-y-6">
            <div className="space-y-6">
              <p className="text-[1.1rem] md:text-xl leading-snug">
                Мы ценим ваше время и стремимся сделать процесс покупки максимально комфортным. 
                Именно поэтому нашим главным партнером по логистике является сервис <b>Яндекс Go</b> доставка занимает 2-3 дня с учетом местности,доставка осуществляется в пределах МКАД и Москвы.
              </p>
            </div>
            <div className="space-y-6">
              <p className="text-[1.1rem] md:text-xl leading-snug">
                Выбирайте экспресс-доставку до двери в удобное для вас время. 
                Отслеживайте перемещение ваших новых светильников в реальном времени 
                прямо в приложении на экране смартфона.
              </p>
            </div>
          </div>
        </div>

        {/* Блок: Конфиденциальность */}
        <div>
          <h2 className="text-4xl md:text-[4rem] font-bold uppercase tracking-tight mb-8 md:mb-12">
            КОНФИДЕНЦИАЛЬНОСТЬ
          </h2>
          <h3 className="text-xl md:text-2xl lg:text-[1.5rem] font-normal uppercase mb-8 md:mb-10">
            ВАШИ ДАННЫЕ ПОД НАДЕЖНОЙ ЗАЩИТОЙ
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-16 gap-y-6">
            <div className="space-y-6">
              <p className="text-[1.1rem] md:text-xl leading-snug">
                Lightstar Group гарантирует полную безопасность вашей личной информации. 
                Все данные, которые вы предоставляете при оформлении заказа, надежно зашифрованы 
                и хранятся на защищенных серверах.
              </p>
            </div>
            <div className="space-y-6">
              <p className="text-[1.1rem] md:text-xl leading-snug">
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
