'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCart } from '@/lib/cart-context'
import type { Product } from '@/lib/types'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product, 1)
  }

  const imageUrl = product.images[0] || '/placeholder-product.jpg'

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <span className="font-medium text-muted-foreground">Out of Stock</span>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 font-medium leading-tight text-balance">
              {product.title}
            </h3>
          </div>
          
          {product.store && (
            <p className="mb-2 text-xs text-muted-foreground">
              by {product.store.store_name}
            </p>
          )}

          <div className="mb-3 flex items-center gap-1">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="text-sm font-medium">
              {product.rating_average > 0 ? product.rating_average.toFixed(1) : 'New'}
            </span>
            {product.rating_count > 0 && (
              <span className="text-xs text-muted-foreground">
                ({product.rating_count})
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-lg font-semibold">
              ${product.price.toFixed(2)}
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="opacity-0 transition-opacity group-hover:opacity-100"
            >
              <ShoppingCart className="mr-1 h-4 w-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
