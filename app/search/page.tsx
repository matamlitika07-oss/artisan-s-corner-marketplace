'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Search Products</h1>
        <p className="text-muted-foreground">
          Find unique handmade crafts from our artisans
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="search"
              placeholder="Search for pottery, jewelry, textiles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
              autoFocus
            />
            <Button type="submit">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Popular searches:</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {['ceramic vase', 'handmade jewelry', 'woven basket', 'wooden bowl'].map((term) => (
            <Button
              key={term}
              variant="outline"
              size="sm"
              onClick={() => {
                setQuery(term)
                router.push(`/products?search=${encodeURIComponent(term)}`)
              }}
            >
              {term}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
