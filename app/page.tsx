import Link from 'next/link'
import { ArrowRight, Sparkles, Shield, Truck, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/product-card'

async function getFeaturedProducts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, store:stores(*), category:categories(*)')
    .order('created_at', { ascending: false })
    .limit(8)
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

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ])

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary to-background px-4 py-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Discover Unique Handcrafted
              <span className="text-primary"> Treasures</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed text-pretty">
              Connect with talented artisans from around the world. Every purchase supports independent creators and brings a one-of-a-kind piece into your life.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/products">
                  Browse Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/become-vendor">Start Selling</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </section>

      {/* Features */}
      <section className="border-y bg-card px-4 py-12">
        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Unique Crafts</h3>
              <p className="text-sm text-muted-foreground">One-of-a-kind handmade items</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Secure Payments</h3>
              <p className="text-sm text-muted-foreground">Safe and encrypted checkout</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Global Shipping</h3>
              <p className="text-sm text-muted-foreground">Worldwide delivery options</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Support Artisans</h3>
              <p className="text-sm text-muted-foreground">Help independent creators thrive</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Shop by Category
              </h2>
              <p className="mt-2 text-muted-foreground">
                Find the perfect handmade piece in your favorite craft
              </p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/categories">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <Link key={category.id} href={`/categories/${category.slug}`}>
                <Card className="group transition-all hover:shadow-md hover:border-primary/30">
                  <CardContent className="flex items-center gap-4 p-6">
                    <span className="text-3xl" role="img" aria-hidden="true">
                      {categoryIcons[category.slug] || '🎁'}
                    </span>
                    <div>
                      <h3 className="font-medium group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/categories">
                View All Categories
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-secondary/30 px-4 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Featured Products
              </h2>
              <p className="mt-2 text-muted-foreground">
                Handpicked creations from our talented artisans
              </p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/products">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {products.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Card className="py-16 text-center">
              <CardContent>
                <p className="text-muted-foreground">
                  No products available yet. Check back soon!
                </p>
                <Button asChild className="mt-4">
                  <Link href="/become-vendor">Become a Vendor</Link>
                </Button>
              </CardContent>
            </Card>
          )}
          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/products">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="flex flex-col items-center gap-6 p-8 text-center lg:p-12">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-balance">
                Ready to Share Your Craft with the World?
              </h2>
              <p className="max-w-2xl text-primary-foreground/80 text-pretty">
                Join our community of talented artisans. Set up your store in minutes and start reaching customers who appreciate handmade quality.
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/become-vendor">
                  Start Selling Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
