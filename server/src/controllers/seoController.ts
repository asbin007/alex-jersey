import { Request, Response } from 'express'
import * as productService from '../services/productService'

const siteUrl = process.env.CLIENT_URL || 'https://alexjersey.com.np'

export async function getSitemap(req: Request, res: Response): Promise<void> {
  try {
    const products = await productService.getAllProductsForSitemap()
    
    const staticPages = [
      '',
      '/products',
      '/cart',
      '/checkout',
      '/login',
      '/register',
      '/orders',
    ]

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`

    // Static pages
    for (const page of staticPages) {
      const priority = page === '' ? '1.0' : '0.8'
      sitemap += `
  <url>
    <loc>${siteUrl}${page}</loc>
    <changefreq>${page === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${priority}</priority>
  </url>`
    }

    // Product pages
    for (const product of products) {
      const images = product.images.map((img: string) => 
        `    <image:image>
      <image:loc>${img}</image:loc>
    </image:image>`
      ).join('\n')
      
      sitemap += `
  <url>
    <loc>${siteUrl}/products/${product.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
${images}
  </url>`
    }

    sitemap += `
</urlset>`

    res.header('Content-Type', 'application/xml')
    res.send(sitemap)
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate sitemap' })
  }
}