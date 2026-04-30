import { Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

async function getVendorOrders() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('order_items')
    .select(`
      *,
      product:products(title, images),
      order:orders(
        id, 
        status, 
        created_at,
        shipping_street,
        shipping_city,
        shipping_state,
        shipping_zip,
        shipping_country,
        buyer:profiles(name, email)
      )
    `)
    .eq('vendor_id', user.id)
    .order('created_at', { ascending: false })

  return data || []
}

export default async function VendorOrdersPage() {
  const orderItems = await getVendorOrders()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Group by order
  const orderMap = new Map<string, typeof orderItems>()
  orderItems.forEach((item) => {
    const orderId = item.order_id
    if (!orderMap.has(orderId)) {
      orderMap.set(orderId, [])
    }
    orderMap.get(orderId)!.push(item)
  })

  const orders = Array.from(orderMap.entries())

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">
          View and manage orders for your products
        </p>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map(([orderId, items]) => {
            const order = items[0].order
            const totalPayout = items.reduce((sum, item) => sum + item.vendor_payout, 0)

            return (
              <Card key={orderId}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle className="text-base font-medium">
                      Order #{orderId.slice(0, 8)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order?.created_at || '')}
                    </p>
                  </div>
                  <Badge className={statusColors[order?.status || 'pending'] || 'bg-gray-100 text-gray-800'}>
                    {order?.status?.charAt(0).toUpperCase() + order?.status?.slice(1)}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {item.product?.images?.[0] && (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.title}
                              className="h-10 w-10 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium">{item.product?.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} x ${item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <span className="font-medium">
                          ${item.vendor_payout.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="mb-3 flex justify-between text-sm">
                      <span className="text-muted-foreground">Your Payout</span>
                      <span className="font-semibold">${totalPayout.toFixed(2)}</span>
                    </div>

                    {/* Shipping Address */}
                    {order && (
                      <div className="rounded-lg bg-muted/50 p-3 text-sm">
                        <p className="mb-1 font-medium">Ship to:</p>
                        <p className="text-muted-foreground">
                          {order.buyer?.name || 'Customer'}
                        </p>
                        <p className="text-muted-foreground">
                          {order.shipping_street}
                        </p>
                        <p className="text-muted-foreground">
                          {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
                        </p>
                        <p className="text-muted-foreground">
                          {order.shipping_country}
                        </p>
                      </div>
                    )}
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
            <h2 className="mb-2 text-xl font-semibold">No orders yet</h2>
            <p className="text-muted-foreground">
              When customers purchase your products, orders will appear here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
