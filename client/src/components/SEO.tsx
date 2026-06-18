import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'product' | 'article'
  noIndex?: boolean
  product?: {
    name: string
    description: string
    price: number
    currency?: string
    availability?: 'in_stock' | 'out_of_stock'
    image: string
    sku?: string
    brand?: string
    rating?: number
    reviewCount?: number
  }
  structuredData?: Record<string, unknown>
}

const defaultTitle = 'Alex Jersey Shop — FIFA World Cup 2026 Jerseys | Nepal'
const defaultDescription =
  'Shop premium FIFA World Cup 2026 jerseys for all 48 nations. Cash on Delivery across Nepal. Argentina, Brazil, France, England, and more. Order online or via WhatsApp.'
const defaultImage = 'https://alexjersey.com.np/og-image.jpg'
const siteUrl = 'https://alexjersey.com.np'

/** Breadcrumb + WebSite schema always present */
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Alex Jersey Shop',
  url: siteUrl,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteUrl}/products?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Alex Jersey Shop',
  url: siteUrl,
  logo: `${siteUrl}/favicon.svg`,
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: '+977-9747235169',
      contactType: 'customer service',
      availableLanguage: ['English', 'Nepali'],
    },
  ],
  sameAs: ['https://www.facebook.com/AlexJerseyShop'],
}

export default function SEO({
  title,
  description = defaultDescription,
  keywords,
  image = defaultImage,
  url,
  type = 'website',
  noIndex = false,
  product,
  structuredData,
}: SEOProps) {
  const fullTitle = title ? `${title} | Alex Jersey Shop` : defaultTitle
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl
  const ogImage = image.startsWith('http') ? image : `${siteUrl}${image}`

  /** Product rich result */
  const productSchema = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.image,
        description: product.description,
        sku: product.sku,
        brand: {
          '@type': 'Brand',
          name: product.brand ?? 'Alex Jersey Shop',
        },
        ...(product.rating !== undefined && product.reviewCount !== undefined
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.rating,
                reviewCount: product.reviewCount,
              },
            }
          : {}),
        offers: {
          '@type': 'Offer',
          priceCurrency: product.currency ?? 'NPR',
          price: product.price,
          availability: `https://schema.org/${
            product.availability === 'out_of_stock' ? 'OutOfStock' : 'InStock'
          }`,
          url: fullUrl,
          priceValidUntil: '2026-12-31',
          seller: {
            '@type': 'Organization',
            name: 'Alex Jersey Shop',
          },
        },
      }
    : null

  const mainSchema = structuredData ?? productSchema ?? {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: fullTitle,
    description,
    url: fullUrl,
    isPartOf: { '@type': 'WebSite', url: siteUrl },
  }

  return (
    <Helmet>
      {/* Core */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      <meta name="author" content="Alex Jersey Shop" />
      <meta name="theme-color" content="#FFD700" />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={product ? 'product' : type} />
      <meta property="og:site_name" content="Alex Jersey Shop" />
      <meta property="og:locale" content="en_NP" />
      {product && (
        <>
          <meta property="product:price:amount" content={String(product.price)} />
          <meta property="product:price:currency" content={product.currency ?? 'NPR'} />
        </>
      )}

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@AlexJerseyShop" />

      {/* Canonical */}
      <link rel="canonical" href={fullUrl} />

      {/* Structured Data — always include org + website on every page */}
      <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(mainSchema)}</script>
    </Helmet>
  )
}
