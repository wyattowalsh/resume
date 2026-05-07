import { sharedSeoMetadata } from "@/lib/seo";

export default function Head() {
  const {
    canonicalUrl,
    author,
    description,
    imageAlt,
    imageHeight,
    imageUrl,
    imageWidth,
    locale,
    keywords,
    siteName,
    profileFirstName,
    profileLastName,
    structuredData,
    title,
  } = sharedSeoMetadata;

  return (
    <>
      <title>{title}</title>
      <link rel="canonical" href={canonicalUrl} />
      <meta name="description" content={description} />
      <meta name="author" content={author} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />

      <meta property="og:type" content="profile" />
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
      <meta property="profile:first_name" content={profileFirstName} />
      <meta property="profile:last_name" content={profileLastName} />

      <meta name="twitter:card" content="summary_large_image" />
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
