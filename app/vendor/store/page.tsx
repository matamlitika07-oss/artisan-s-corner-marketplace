'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import type { Store } from '@/lib/types'

export default function StoreSettingsPage() {
  const [store, setStore] = useState<Store | null>(null)
  const [storeName, setStoreName] = useState('')
  const [description, setDescription] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getStore = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('store_id')
        .eq('id', user.id)
        .single()

      if (profile?.store_id) {
        const { data: storeData } = await supabase
          .from('stores')
          .select('*')
          .eq('id', profile.store_id)
          .single()

        if (storeData) {
          setStore(storeData)
          setStoreName(storeData.store_name)
          setDescription(storeData.description || '')
          setLogoUrl(storeData.logo_url || '')
        }
      }
    }

    getStore()
  }, [supabase])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', files[0])

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else if (data.url) {
        setLogoUrl(data.url)
      }
    } catch {
      setError('Failed to upload logo')
    }

    setIsUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!store) return

    setIsSaving(true)
    setError('')
    setSuccess(false)

    const { error: updateError } = await supabase
      .from('stores')
      .update({
        store_name: storeName.trim(),
        description: description.trim() || null,
        logo_url: logoUrl || null,
      })
      .eq('id', store.id)

    if (updateError) {
      setError(updateError.message)
      setIsSaving(false)
      return
    }

    setSuccess(true)
    setIsSaving(false)
    router.refresh()
  }

  if (!store) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading store settings...</p>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Store Settings</h1>
          <p className="text-muted-foreground">
            Customize how your store appears to customers
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  id="storeName"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Store Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell customers about your craft, your story, and what makes your products special..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Store Logo</CardTitle>
              <CardDescription>
                Upload a logo or image that represents your store
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Store logo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl text-muted-foreground">
                      {storeName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <label className="inline-flex cursor-pointer items-center">
                    <Button type="button" variant="outline" asChild disabled={isUploading}>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        {isUploading ? 'Uploading...' : 'Upload Logo'}
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Recommended: Square image, at least 200x200 pixels
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Store Link</CardTitle>
              <CardDescription>
                Share this link with your customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/stores/${store.id}`}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.open(`/stores/${store.id}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {success && (
            <p className="text-sm text-green-600">Store settings saved successfully!</p>
          )}

          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>
    </div>
  )
}
