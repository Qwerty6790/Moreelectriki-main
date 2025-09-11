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



	{/* Контент */}
	<section className="bg-white py-36 md:py-36">
	<div className="relative z-10 h-full flex items-start justify-start px-4">
			<h1 className="text-3xl md:text-5xl lg:text-8xl font-bold text-black text-left">Электроустоновочное изделие</h1>
		</div>
		<div className="container mx-auto px-12 py-10">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-20 max-w-7xl mx-auto">
				{/* Werkel */}
				<Link href="/ElektroustnovohneIzdely/Werkel" className="flex flex-col md:flex-row items-center gap-4 p-3 transition-transform duration-300 hover:scale-105 rounded-lg">
					<div className="w-40 h-40 md:w-64 md:h-64 lg:w-96 lg:h-96 flex-shrink-0 overflow-hidden rounded-md">
						<img 
							src="/images/series/werkel.webp" 
							alt="Серия Werkel" 
							className="w-full h-full object-cover"
						/>
					</div>
					<div className="space-y-1">
						<h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black">Werkel</h2>
						<p className="text-sm text-gray-700 hidden md:block">Коллекция интерьерных рамок и аксессуаров.</p>
					</div>
				</Link>

				{/* Voltum */}
				<Link href="/ElektroustnovohneIzdely/Voltum" className="flex flex-col md:flex-row items-center gap-4 p-3 transition-transform duration-300 hover:scale-105 rounded-lg">
					<div className="w-40 h-40 md:w-64 md:h-64 lg:w-96 lg:h-96 flex-shrink-0 overflow-hidden rounded-md">
						<img 
							src="/images/series/voltum.png" 
							alt="Серия Voltum" 
							className="w-full h-full object-cover"
						/>
					</div>
					<div className="space-y-1">
						<h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black">Voltum</h2>
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