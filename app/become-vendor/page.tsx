'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Store, CheckCircle, ArrowRight, Sparkles, DollarSign, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

export default function BecomeVendorPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [storeName, setStoreName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
        
        // Redirect if already a vendor
        if (data?.role === 'vendor') {
          router.push('/vendor/dashboard')
        }
      }
    }
    getProfile()
  }, [supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setIsLoading(true)
    setError('')

    if (!storeName.trim()) {
      setError('Please enter a store name')
      setIsLoading(false)
      return
    }

    // Create the store
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .insert({
        vendor_id: profile.id,
        store_name: storeName.trim(),
        description: description.trim() || null,
      })
      .select()
      .single()

    if (storeError) {
      setError(storeError.message)
      setIsLoading(false)
      return
    }

    // Update user profile to vendor
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'vendor', store_id: store.id })
      .eq('id', profile.id)

    if (profileError) {
      setError(profileError.message)
      setIsLoading(false)
      return
    }

    // Redirect to vendor dashboard
    router.push('/vendor/dashboard')
    router.refresh()
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <Store className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h1 className="mb-2 text-2xl font-bold">Become a Vendor</h1>
        <p className="mb-6 text-muted-foreground">
          Sign in to start selling your handmade crafts
        </p>
        <Button asChild>
          <Link href="/auth/login?redirect=/become-vendor">Sign In</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:py-12">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Store className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Start Selling on Artisan&apos;s Corner
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Join our community of talented artisans and share your handmade creations with customers worldwide.
        </p>
      </div>

      {/* Benefits */}
      <div className="mb-12 grid gap-6 sm:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 font-semibold">Showcase Your Craft</h3>
            <p className="text-sm text-muted-foreground">
              Create a beautiful storefront to display your unique handmade products
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 font-semibold">Earn 90% Revenue</h3>
            <p className="text-sm text-muted-foreground">
              Keep most of your earnings - we only take a 10% platform fee
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 font-semibold">Reach Customers</h3>
            <p className="text-sm text-muted-foreground">
              Connect with buyers who appreciate and seek out handmade quality
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Application Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create Your Store</CardTitle>
          <CardDescription>
            Fill in the details below to set up your artisan store
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                placeholder="My Artisan Shop"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                This is how customers will find your store
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Store Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Tell customers about your craft, your story, and what makes your products special..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex items-start gap-3 rounded-lg bg-muted p-4">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div className="text-sm">
                <p className="font-medium">What happens next?</p>
                <p className="text-muted-foreground">
                  Once you create your store, you&apos;ll be able to add products and start selling immediately!
                </p>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Store...' : (
                <>
                  Create My Store
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
