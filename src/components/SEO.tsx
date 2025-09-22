'use client';

import Head from 'next/head';

export interface OpenGraph {
  title: string;
  description: string;
  url: string;
  type?: string;
  image: string;
  site_name: string;
}

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  url: string;
  type?: string;
  image: string;
  openGraph?: OpenGraph;
  jsonLd?: object;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  url,
  type = 'website',
  image,
  openGraph,
  jsonLd
}) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta property="og:title" content={openGraph?.title || title} />
      <meta property="og:description" content={openGraph?.description || description} />
      <meta property="og:url" content={openGraph?.url || url} />
      <meta property="og:type" content={openGraph?.type || type} />
      <meta property="og:image" content={openGraph?.image || image} />
      <meta property="og:site_name" content={openGraph?.site_name || ''} />
      <link rel="canonical" href={url} />
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </Head>
  );
};

export default SEO;
