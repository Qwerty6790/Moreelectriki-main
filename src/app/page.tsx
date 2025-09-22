'use client';
import MainPage from '@/components/Hero';
import SEO from '@/components/SEO';

const Home = () => {
  return (
    <>
      <SEO
        title="Купить светильники, теплые полы, Купить S70 Voltum, Werkel встраиваемя серия, обогрев и электроустановочные изделия в Москве"
        description="Интернет-магазин электрики: Купить S70 Voltum, Werkel встраиваемя серия кабельный теплый пол, обогрев кровли и площадок, специальный греющий кабель, термостаты и электроустановочные изделия, Werkel, Voltum. Доставка по России."
        keywords="Купить S70 Voltum, Werkel встраиваемя серия кабельный теплый пол, обогрев кровли, греющий кабель, термостаты, Купить S70 Voltum, Werkel встраиваемя серия Werkel встроенные серии, Voltum S70, теплые полы купить, электроустановочные изделия купить"
        url="https://moreelectriki.ru/"
        type="website"
        image="/images/logo.webp"
        openGraph={{
          title: "Купить S70 Voltum, Werkel встраиваемя серия,теплые полы и электроустановочные изделия elektromos",
          description: "Купить S70 Voltum, Werkel встраиваемя серия кабельный теплый пол, обогрев кровли и площадок, специальный греющий кабель — а также розетки и выключатели , Werkel, Voltum",
          url: "https://moreelectriki.ru",
          type: "website",
          image: "/images/logo.webp",
          site_name: "MoreElektriki"
        }}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Store",
          name: "Интернет-магазин электрики и отопления",
          description: "Продажа Купить S70 Voltum, Werkel встраиваемя серия матов нагревательных, кабельных теплых полов, обогрева кровли и площадок, греющих кабелей, термостатов и электроустановочных изделий, Werkel, Voltum",
          url: "https://moreelectriki.ru",
          telephone: "8(926) 552-21-73",
          address: {
            "@type": "PostalAddress",
            streetAddress: "г. Москва, 25 километр, ТК Конструктор",
            addressLocality: "Москва",
            postalCode: "121601",
            addressCountry: "RU"
          },
          hasOfferCatalog: [
          
            {
              "@type": "OfferCatalog",
              name: "Термостаты и терморегуляторы",
              itemListElement: [
                {
                  "@type": "Offer",
                  itemOffered: { "@type": "Product", name: "Термостаты для теплого пола", category: "Управление отоплением" }
                }
              ]
            },
            {
              "@type": "OfferCatalog",
              name: "Электроустановочные изделия",
              itemListElement: [
                { "@type": "Offer", itemOffered: { "@type": "Product", name: "Werkel Встраиваемые серии", category: "Выключатели и рамки" } },
                { "@type": "Offer", itemOffered: { "@type": "Product", name: "Voltum S70", category: "Розетки и механизмы" } }
              ]
            }
          ],
          potentialAction: {
            "@type": "SearchAction",
            target: "https://moreelectriki.ru/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />
      <div className="w-full">
        <MainPage />
      </div>
    </>
  );
};

export default Home;
