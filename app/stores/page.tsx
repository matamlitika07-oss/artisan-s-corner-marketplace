import Link from 'next/link'
import { Store, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

async function getStores() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('stores')
    .select('*, vendor:profiles(name)')
    .order('created_at', { ascending: false })
  return data || []
}

export default async function StoresPage() {
  const stores = await getStores()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Artisan Stores</h1>
        <p className="mt-2 text-muted-foreground">
          Discover talented artisans and explore their unique handmade creations
        </p>
      </div>

      {stores.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <Link key={store.id} href={`/stores/${store.id}`}>
              <Card className="group h-full transition-all hover:shadow-lg hover:border-primary/30">
                <CardContent className="flex flex-col p-6">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    {store.logo_url ? (
                      <img
                        src={store.logo_url}
                        alt={store.store_name}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <Store className="h-8 w-8 text-primary" />
                    )}
                  </div>
                  <h2 className="mb-1 text-xl font-semibold group-hover:text-primary transition-colors">
                    {store.store_name}
                  </h2>
                  <p className="mb-2 text-sm text-muted-foreground">
                    by {store.vendor?.name || 'Artisan'}
                  </p>
                  {store.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                      {store.description}
                    </p>
                  )}
                  <div className="mt-auto pt-4">
                    <span className="inline-flex items-center text-sm font-medium text-primary">
                      Visit Store
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Store className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">No stores yet</h2>
            <p className="mb-6 text-muted-foreground">
              Be the first to open a store on Artisan&apos;s Corner
            </p>
            <Button asChild>
              <Link href="/become-vendor">
                Become a Vendor
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
