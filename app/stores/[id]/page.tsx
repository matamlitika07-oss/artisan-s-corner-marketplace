import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Store, ArrowLeft, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ProductCard } from '@/components/product-card'

async function getStore(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('stores')
    .select('*, vendor:profiles(name)')
    .eq('id', id)
    .single()
  return data
}

async function getStoreProducts(storeId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, store:stores(*), category:categories(*)')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
  return data || []
}

export default async function StorePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const store = await getStore(id)

  if (!store) {
    notFound()
  }

  const products = await getStoreProducts(id)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/stores">
          <ArrowLeft className="mr-2 h-4 w-4" />
          All Stores
        </Link>
      </Button>

      {/* Store Header */}
      <Card className="mb-8">
        <CardContent className="flex flex-col items-center gap-6 p-8 text-center sm:flex-row sm:text-left">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary/10">
            {store.logo_url ? (
              <img
                src={store.logo_url}
                alt={store.store_name}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <Store className="h-12 w-12 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="mb-2 text-3xl font-bold tracking-tight">
              {store.store_name}
            </h1>
            <p className="mb-2 text-muted-foreground">
              by {store.vendor?.name || 'Artisan'}
            </p>
            {store.description && (
              <p className="text-muted-foreground leading-relaxed">
                {store.description}
              </p>
            )}
            <div className="mt-4 flex items-center justify-center gap-1 text-sm text-muted-foreground sm:justify-start">
              <Calendar className="h-4 w-4" />
              <span>Member since {formatDate(store.created_at)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store Products */}
      <div>
        <h2 className="mb-6 text-2xl font-bold">
          Products ({products.length})
        </h2>

        {products.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                This store hasn&apos;t added any products yet
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
