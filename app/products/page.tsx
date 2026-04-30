import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/product-card'
import { ProductFilters } from './product-filters'
import { Spinner } from '@/components/ui/spinner'

interface SearchParams {
  category?: string
  search?: string
  sort?: string
  minPrice?: string
  maxPrice?: string
}

async function getProducts(searchParams: SearchParams) {
  const supabase = await createClient()
  
  let query = supabase
    .from('products')
    .select('*, store:stores(*), category:categories(*)')

  // Filter by category
  if (searchParams.category) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', searchParams.category)
      .single()
    if (category) {
      query = query.eq('category_id', category.id)
    }
  }

  // Search by title
  if (searchParams.search) {
    query = query.ilike('title', `%${searchParams.search}%`)
  }

  // Filter by price range
  if (searchParams.minPrice) {
    query = query.gte('price', parseFloat(searchParams.minPrice))
  }
  if (searchParams.maxPrice) {
    query = query.lte('price', parseFloat(searchParams.maxPrice))
  }

  // Sort
  switch (searchParams.sort) {
    case 'price-asc':
      query = query.order('price', { ascending: true })
      break
    case 'price-desc':
      query = query.order('price', { ascending: false })
      break
    case 'rating':
      query = query.order('rating_average', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const { data } = await query
  return data || []
}

async function getCategories() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  return data || []
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const [products, categories] = await Promise.all([
    getProducts(params),
    getCategories(),
  ])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Browse Products</h1>
        <p className="mt-2 text-muted-foreground">
          Discover unique handmade crafts from talented artisans
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Filters Sidebar */}
        <aside className="w-full shrink-0 lg:w-64">
          <ProductFilters categories={categories} />
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <Suspense fallback={<ProductsLoading />}>
            {products.length > 0 ? (
              <>
                <p className="mb-4 text-sm text-muted-foreground">
                  Showing {products.length} product{products.length !== 1 ? 's' : ''}
                </p>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
                <p className="text-lg font-medium">No products found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters or search term
                </p>
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function ProductsLoading() {
  return (
    <div className="flex items-center justify-center py-16">
      <Spinner className="h-8 w-8" />
    </div>
  )
}
