'use client';

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const ElektroustnovohneIzdely: React.FC = () => {
  return (
    <>
      <Head>
        <title>Рамки из стекла - Senso и Elite | Elektromos</title>
        <meta name="description" content="Стеклянные рамки Werkel Senso и Elite – непередаваемый тактильный и визуальный эффект закаленного стекла для современных интерьеров." />
      </Head>

	{/* Hero с фоновым изображением под прозрачным хедером */}
	<section className="relative h-[80vh] md:h-[44vh]">
		<img src="/images/banners/bannerselektroustnovohneIzdely.png" alt="Электроустановочные изделия" className="absolute inset-0 w-full h-full object-cover" />
		<div className="absolute inset-0 bg-black/40" />
		<div className="relative z-10 h-full flex items-center justify-center px-4">
			<h1 className="text-5xl md:text-7xl font-bold text-white text-center">Электроустоновочное изделие</h1>
		</div>
	</section>

	{/* Контент */}
	<section className="bg-white py-10 md:py-24">
		<div className="container mx-auto px-4">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-20 max-w-7xl mx-auto">
				{/* Werkel */}
				<Link href="/ElektroustnovohneIzdely/Werkel" className="flex items-center gap-4 p-3 transition-transform duration-300 hover:scale-105 rounded-lg">
					<div className="w-52 h-52 flex-shrink-0 overflow-hidden rounded-md">
						<img 
							src="/images/series/werkel.webp" 
							alt="Серия Werkel" 
							className="w-full h-full object-cover"
						/>
					</div>
					<div className="space-y-1">
						<h2 className="text-4xl font-bold text-black">Werkel</h2>
						<p className="text-sm text-gray-700 hidden md:block">Коллекция интерьерных рамок и аксессуаров.</p>
					</div>
				</Link>

				{/* Voltum */}
				<Link href="/ElektroustnovohneIzdely/Voltum" className="flex items-center gap-4 p-3 transition-transform duration-300 hover:scale-105 rounded-lg">
					<div className="w-52 h-52 flex-shrink-0 overflow-hidden rounded-md">
						<img 
							src="/images/series/voltum.png" 
							alt="Серия Voltum" 
							className="w-full h-full object-cover"
						/>
					</div>
					<div className="space-y-1">
						<h2 className="text-4xl font-bold text-black">Voltum</h2>
						<p className="text-sm text-gray-700 hidden md:block">Современная серия с матовой текстурой и минималистичным дизайном.</p>
					</div>
				</Link>
			</div>
		</div>
	</section>
    </>
  );
};

export default ElektroustnovohneIzdely;