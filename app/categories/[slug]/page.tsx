import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ProductCard } from '@/components/product-card'

async function getCategory(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()
  return data
}

async function getCategoryProducts(categoryId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, store:stores(*), category:categories(*)')
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false })
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

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) {
    notFound()
  }

  const products = await getCategoryProducts(category.id)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/categories">
          <ArrowLeft className="mr-2 h-4 w-4" />
          All Categories
        </Link>
      </Button>

      <div className="mb-8">
        <div className="flex items-center gap-3">
          <span className="text-4xl" role="img" aria-hidden="true">
            {categoryIcons[category.slug] || '🎁'}
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
            <p className="text-muted-foreground">
              {products.length} product{products.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="mb-2 text-lg font-medium">No products in this category yet</p>
            <p className="text-muted-foreground">
              Check back soon or browse other categories
            </p>
            <Button asChild className="mt-4">
              <Link href="/categories">Browse Categories</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
