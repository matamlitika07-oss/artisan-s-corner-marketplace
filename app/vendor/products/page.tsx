import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Trash2, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DeleteProductButton } from './delete-product-button'

async function getVendorProducts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('vendor_id', user.id)
    .order('created_at', { ascending: false })

  return data || []
}

export default async function VendorProductsPage() {
  const products = await getVendorProducts()

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your product listings
          </p>
        </div>
        <Button asChild>
          <Link href="/vendor/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
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
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>${product.price.toFixed(2)}</span>
                      <span>Stock: {product.stock}</span>
                      <span className="hidden sm:inline">
                        Rating: {product.rating_average > 0 ? product.rating_average.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/vendor/products/${product.id}/edit`}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                    <DeleteProductButton productId={product.id} />
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
            <h2 className="mb-2 text-xl font-semibold">No products yet</h2>
            <p className="mb-6 text-muted-foreground">
              Start by adding your first product
            </p>
            <Button asChild>
              <Link href="/vendor/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Product
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
