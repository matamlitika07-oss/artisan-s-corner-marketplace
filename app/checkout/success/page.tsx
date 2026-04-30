import Link from 'next/link'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>
}) {
  const params = await searchParams
  const orderId = params.order

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Card>
        <CardContent className="flex flex-col items-center p-8 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="mb-2 text-2xl font-bold">Order Confirmed!</h1>
          <p className="mb-6 text-muted-foreground">
            Thank you for your purchase. Your order has been placed successfully.
          </p>

          {orderId && (
            <div className="mb-6 rounded-lg bg-muted px-4 py-2">
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-mono text-sm font-medium">{orderId}</p>
            </div>
          )}

          <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>You will receive an email confirmation shortly</span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/orders">
                View My Orders
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
