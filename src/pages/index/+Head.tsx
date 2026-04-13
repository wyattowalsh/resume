import { sharedSeoMetadata } from "@/lib/seo";

export default function Head() {
  const {
    canonicalUrl,
    description,
    imageAlt,
    imageHeight,
    imageUrl,
    imageWidth,
    locale,
    siteName,
    structuredData,
    title,
  } = sharedSeoMetadata;

  return (
    <>
      <title>{title}</title>
      <link rel="canonical" href={canonicalUrl} />
      <meta name="description" content={description} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={imageAlt} />
      {imageWidth ? (
        <meta property="og:image:width" content={String(imageWidth)} />
      ) : null}
      {imageHeight ? (
        <meta property="og:image:height" content={String(imageHeight)} />
      ) : null}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={imageAlt} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
