'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Star,
  Award,
  Shield, 
  Clock,
  MessageSquare,
  Lightbulb,
  Gem,
  Zap,
  Phone,
  MapPin,
  Mail,
  Building
} from 'lucide-react';

const About = () => {
  const [activeSection, setActiveSection] = useState('expertise');

  const expertise = [
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Дизайнерские люстры",
      description: "Эксклюзивные коллекции от ведущих европейских дизайнеров"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Умное освещение",
      description: "Современные системы управления светом для вашего комфорта"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Гарантия качества",
      description: "5 лет гарантии на всю продукцию и профессиональный монтаж"
    }
  ];

  const advantages = [
    {
      icon: <Star className="w-6 h-6" />,
      title: "15+ лет опыта",
      description: "Создаем уникальные световые решения с 2008 года"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "1000+ проектов",
      description: "Успешно реализованных дизайнерских проектов"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Консультации",
      description: "Бесплатные консультации дизайнера по свету"
    }
  ];

  const services = [
    {
      title: "Подбор освещения",
      description: "Профессиональный подбор светильников под ваш интерьер",
      items: ["Расчет освещенности", "3D-визуализация", "Подбор цветовой температуры"]
    },
    {
      title: "Монтаж и установка",
      description: "Квалифицированная установка любой сложности",
      items: ["Профессиональный монтаж", "Настройка систем управления", "Гарантийное обслуживание"]
    },
    {
      title: "Проектирование",
      description: "Создание проекта освещения для вашего помещения",
      items: ["Светотехнический расчет", "Схема размещения", "Спецификация оборудования"]
    }
  ];

  const photos = [
    "/images/moreelecktrikiabout.webp",
  ];

  const theses = [
    {
   
      title: "ЛИДЕР РЫНКА",
      description: "MoreElectriki — ведущий поставщик электрооборудования и светотехники в России"
    },
    {
    
      title: "КАЧЕСТВО",
      description: "Только сертифицированная продукция от проверенных производителей"
    },
    {
      
      title: "ОПЫТ",
      description: "Более 15 лет успешной работы на рынке электрооборудования"
    }
  ];

  return (
    <div className="min-h-screen mt-20">
 

      {/* Company Theses Section */}
      <div className="w-full bg-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-6xl font-black mb-8 text-gray-900 tracking-tight">
              MOREELECTRIKI
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {theses.map((thesis, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6"
              >
              
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{thesis.title}</h3>
                <p className="text-gray-600">{thesis.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="w-full h-[600px] bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/d.png')",
            backgroundPosition: 'center 30%'
          }}
        >
          
        </div>
      </div>

     

      {/* Collaboration Request Section */}
      <div className="w-full bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10"
            >
            </motion.div>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Название компании</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="ООО 'Компания'"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Контактное лицо</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="Иван Иванов"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Электронная почта</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="info@company.ru"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                  <input 
                    type="tel" 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Комментарий</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 h-32"
                  placeholder="Расскажите о ваших потребностях или предложениях"
                ></textarea>
              </div>
              
              <div className="text-center">
                <button 
                  type="submit"
                  className="bg-yellow-400 text-black px-8 py-4 rounded-lg font-medium hover:bg-yellow-300 transition-colors inline-flex items-center"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Отправить заявку
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

     
    </div>
  );
};

export default About;