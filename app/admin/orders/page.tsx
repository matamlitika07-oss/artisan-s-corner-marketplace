import { ShoppingCart } from 'lucide-react'
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

async function getOrders() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select(`
      *,
      buyer:profiles(name, email),
      items:order_items(
        *,
        product:products(title),
        vendor:profiles(name)
      )
    `)
    .order('created_at', { ascending: false })
  return data || []
}

export default async function AdminOrdersPage() {
  const orders = await getOrders()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">
          All orders on the marketplace ({orders.length} total)
        </p>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="text-base font-medium">
                    Order #{order.id.slice(0, 8)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(order.created_at)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.buyer?.name || 'Customer'} - {order.buyer?.email}
                  </p>
                </div>
                <Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-800'}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </CardHeader>
              <CardContent>
                {/* Order Items */}
                <div className="mb-4 space-y-2">
                  {order.items?.map((item: { id: string; quantity: number; price: number; product: { title: string } | null; vendor: { name: string } | null }) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.product?.title || 'Product'} x {item.quantity}
                        <span className="text-muted-foreground">
                          {' '}(by {item.vendor?.name || 'Vendor'})
                        </span>
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Shipping Address */}
                <div className="mb-4 rounded-lg bg-muted/50 p-3 text-sm">
                  <p className="mb-1 font-medium">Shipping Address:</p>
                  <p className="text-muted-foreground">
                    {order.shipping_street}, {order.shipping_city}, {order.shipping_state} {order.shipping_zip}, {order.shipping_country}
                  </p>
                </div>

                {/* Order Summary */}
                <div className="flex justify-between border-t pt-4">
                  <div className="text-sm text-muted-foreground">
                    <p>Subtotal: ${order.total_amount.toFixed(2)}</p>
                    <p>Platform Fee (10%): ${order.platform_fee.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      Total: ${order.total_amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No orders found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
