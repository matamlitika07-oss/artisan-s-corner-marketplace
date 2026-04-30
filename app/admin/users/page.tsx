import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User } from 'lucide-react'

const roleColors: Record<string, string> = {
  buyer: 'bg-blue-100 text-blue-800',
  vendor: 'bg-purple-100 text-purple-800',
  admin: 'bg-red-100 text-red-800',
}

async function getUsers() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*, store:stores(store_name)')
    .order('created_at', { ascending: false })
  return data || []
}

export default async function AdminUsersPage() {
  const users = await getUsers()

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
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          Manage platform users ({users.length} total)
        </p>
      </div>

      {users.length > 0 ? (
        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium truncate">{user.name || 'Unnamed User'}</h3>
                    <Badge className={roleColors[user.role] || 'bg-gray-100 text-gray-800'}>
                      {user.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  {user.store && (
                    <p className="text-xs text-muted-foreground">
                      Store: {user.store.store_name}
                    </p>
                  )}
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>Joined</p>
                  <p>{formatDate(user.created_at)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">No users found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
