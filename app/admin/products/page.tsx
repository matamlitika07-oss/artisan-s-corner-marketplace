import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

async function getProducts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, store:stores(store_name), category:categories(name)')
    .order('created_at', { ascending: false })
  return data || []
}

export default async function AdminProductsPage() {
  const products = await getProducts()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground">
          All products on the marketplace ({products.length} total)
        </p>
      </div>

      {products.length > 0 ? (
        <div className="space-y-4">
          {products.map((product) => {
            const imageUrl = product.images[0] || '/placeholder-product.jpg'
            
            return (
              <Card key={product.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={imageUrl}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{product.title}</h3>
                      {product.category && (
                        <Badge variant="secondary" className="hidden sm:inline-flex">
                          {product.category.name}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {product.store?.store_name || 'Unknown Store'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>${product.price.toFixed(2)}</span>
                      <span>Stock: {product.stock}</span>
                      <span className={product.stock === 0 ? 'text-destructive' : ''}>
                        {product.stock === 0 ? 'Out of stock' : 'In stock'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Created</p>
                      <p>{formatDate(product.created_at)}</p>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/products/${product.id}`} target="_blank">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No products found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
