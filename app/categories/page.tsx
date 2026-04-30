import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'

async function getCategories() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  return data || []
}

const categoryIcons: Record<string, string> = {
  'pottery-ceramics': '🏺',
  'jewelry': '💎',
  'textiles-fiber': '🧶',
  'woodwork': '🪵',
  'candles-soaps': '🕯️',
  'art-prints': '🎨',
  'home-decor': '🏠',
  'leather-goods': '👜',
}

const categoryDescriptions: Record<string, string> = {
  'pottery-ceramics': 'Handcrafted bowls, vases, plates, and sculptural pieces',
  'jewelry': 'Unique rings, necklaces, earrings, and bracelets',
  'textiles-fiber': 'Woven, knitted, and sewn creations',
  'woodwork': 'Carved, turned, and crafted wooden items',
  'candles-soaps': 'Artisan candles and natural soaps',
  'art-prints': 'Original artwork and limited edition prints',
  'home-decor': 'Decorative items for your living space',
  'leather-goods': 'Handcrafted bags, wallets, and accessories',
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="mt-2 text-muted-foreground">
          Browse our collection of handmade crafts by category
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link key={category.id} href={`/categories/${category.slug}`}>
            <Card className="group h-full transition-all hover:shadow-lg hover:border-primary/30">
              <CardContent className="flex flex-col p-6">
                <span className="mb-4 text-4xl" role="img" aria-hidden="true">
                  {categoryIcons[category.slug] || '🎁'}
                </span>
                <h2 className="mb-2 text-xl font-semibold group-hover:text-primary transition-colors">
                  {category.name}
                </h2>
                <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                  {categoryDescriptions[category.slug] || 'Explore unique handmade items'}
                </p>
                <div className="mt-auto">
                  <span className="inline-flex items-center text-sm font-medium text-primary">
                    Browse Products
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
