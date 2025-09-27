import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "@/components/Footer";
import AdBlockWarning from "@/components/AdBlockWarning";
import Head from "next/head";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <title>moreelecktiki</title>
        <meta name="description" content="Люстры и прочая электрика" />
        <meta
          name="keywords"
          content="люстра потолочная, люстра подвесная купить, учильные светильники moreelecktiki, moreelecktiki"
        />
        {/* Метатег для Яндекс.Верификации */}
        <meta name="yandex-verification" content="0747f13ec82aa5" />
      </Head>

      {/* Яндекс.Метрика */}
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`
          (function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) { return; } }
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
          })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=104303280', 'ym');

          ym(104303280, 'init', {
              ssr: true,
              webvisor: true,
              clickmap: true,
              ecommerce: "dataLayer",
              accurateTrackBounce: true,
              trackLinks: true
          });
        `}
      </Script>

      {/* <noscript> для Яндекс.Метрики */}
      <noscript
        dangerouslySetInnerHTML={{
          __html: `<div><img src="https://mc.yandex.ru/watch/104303280" style="position:absolute; left:-9999px;" alt="" /></div>`,
        }}
      />

      <body className={inter.className}>
        <AdBlockWarning />
        <main>
          <Header />
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
