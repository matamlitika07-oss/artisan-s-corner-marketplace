import Link from 'next/link'
import { Package, DollarSign, ShoppingCart, TrendingUp, Plus, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

async function getVendorStats(vendorId: string) {
  const supabase = await createClient()
  
  // Get product count
  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('vendor_id', vendorId)

  // Get orders for this vendor
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('*, order:orders(*)')
    .eq('vendor_id', vendorId)

  const totalOrders = new Set(orderItems?.map(item => item.order_id)).size
  const totalRevenue = orderItems?.reduce((sum, item) => sum + item.vendor_payout, 0) || 0
  const pendingOrders = orderItems?.filter(item => 
    item.order?.status === 'paid' || item.order?.status === 'pending'
  ).length || 0

  return {
    productCount: productCount || 0,
    totalOrders,
    totalRevenue,
    pendingOrders,
  }
}

async function getRecentOrders(vendorId: string) {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('order_items')
    .select(`
      *,
      product:products(title),
      order:orders(id, status, created_at, buyer:profiles(name))
    `)
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false })
    .limit(5)

  return data || []
}

async function getVendorProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}

export default async function VendorDashboardPage() {
  const profile = await getVendorProfile()
  if (!profile) return null

  const [stats, recentOrders] = await Promise.all([
    getVendorStats(profile.id),
    getRecentOrders(profile.id),
  ])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile.name || 'Vendor'}
          </p>
        </div>
        <Button asChild>
          <Link href="/vendor/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Products</p>
              <p className="text-2xl font-bold">{stats.productCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Orders</p>
              <p className="text-2xl font-bold">{stats.pendingOrders}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/vendor/orders">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{item.product?.title || 'Product'}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.order?.buyer?.name || 'Customer'} - {formatDate(item.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${item.vendor_payout.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              No orders yet. Share your store to get your first sale!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
