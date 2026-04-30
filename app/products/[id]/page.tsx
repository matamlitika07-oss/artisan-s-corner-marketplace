import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Store, Package, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AddToCartButton } from './add-to-cart-button'
import { ProductReviews } from './product-reviews'
import { ProductCard } from '@/components/product-card'

async function getProduct(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, store:stores(*), category:categories(*)')
    .eq('id', id)
    .single()
  return data
}

async function getReviews(productId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('reviews')
    .select('*, buyer:profiles(name)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
  return data || []
}

async function getRelatedProducts(categoryId: string | null, productId: string) {
  if (!categoryId) return []
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, store:stores(*), category:categories(*)')
    .eq('category_id', categoryId)
    .neq('id', productId)
    .limit(4)
  return data || []
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  const [reviews, relatedProducts] = await Promise.all([
    getReviews(id),
    getRelatedProducts(product.category_id, id),
  ])

  const imageUrl = product.images[0] || '/placeholder-product.jpg'

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/products">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(0, 4).map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-md bg-muted"
                >
                  <Image
                    src={image}
                    alt={`${product.title} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            {product.category && (
              <Link href={`/categories/${product.category.slug}`}>
                <Badge variant="secondary" className="mb-2">
                  {product.category.name}
                </Badge>
              </Link>
            )}
            <h1 className="text-3xl font-bold tracking-tight text-balance">
              {product.title}
            </h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.round(product.rating_average)
                      ? 'fill-accent text-accent'
                      : 'fill-muted text-muted'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {product.rating_average > 0
                ? `${product.rating_average.toFixed(1)} (${product.rating_count} reviews)`
                : 'No reviews yet'}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">${product.price.toFixed(2)}</span>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            {product.stock > 0 ? (
              <span className="text-sm">
                <span className="font-medium text-green-600">{product.stock}</span> in stock
              </span>
            ) : (
              <span className="text-sm font-medium text-destructive">Out of stock</span>
            )}
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h2 className="mb-2 font-semibold">Description</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {product.description || 'No description available.'}
            </p>
          </div>

          <Separator />

          {/* Add to Cart */}
          <AddToCartButton product={product} />

          {/* Store Info */}
          {product.store && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Sold by</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/stores/${product.store.id}`}
                  className="flex items-center gap-3 transition-colors hover:text-primary"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Store className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{product.store.store_name}</p>
                    <p className="text-xs text-muted-foreground">View store</p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-16">
        <h2 className="mb-6 text-2xl font-bold">Customer Reviews</h2>
        <ProductReviews productId={product.id} initialReviews={reviews} />
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold">You May Also Like</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
