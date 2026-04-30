import Link from 'next/link'
import { ExternalLink, Store as StoreIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

async function getStores() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('stores')
    .select('*, vendor:profiles(name, email)')
    .order('created_at', { ascending: false })
  return data || []
}

export default async function AdminStoresPage() {
  const stores = await getStores()

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
        <h1 className="text-2xl font-bold tracking-tight">Stores</h1>
        <p className="text-muted-foreground">
          Manage vendor stores ({stores.length} total)
        </p>
      </div>

      {stores.length > 0 ? (
        <div className="space-y-4">
          {stores.map((store) => (
            <Card key={store.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  {store.logo_url ? (
                    <img
                      src={store.logo_url}
                      alt={store.store_name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <StoreIcon className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{store.store_name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {store.vendor?.name || 'Unknown'} - {store.vendor?.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total Earnings: ${store.total_earnings.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Created</p>
                    <p>{formatDate(store.created_at)}</p>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/stores/${store.id}`} target="_blank">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">No stores found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
