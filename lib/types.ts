export type UserRole = 'buyer' | 'vendor' | 'admin'

export interface Profile {
  id: string
  name: string | null
  email: string | null
  role: UserRole
  store_id: string | null
  created_at: string
}

export interface Store {
  id: string
  vendor_id: string
  store_name: string
  logo_url: string | null
  description: string | null
  total_earnings: number
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Product {
  id: string
  title: string
  description: string | null
  price: number
  images: string[]
  category_id: string | null
  stock: number
  vendor_id: string
  store_id: string
  rating_average: number
  rating_count: number
  created_at: string
  // Joined fields
  category?: Category
  store?: Store
}

export interface Order {
  id: string
  buyer_id: string
  shipping_street: string | null
  shipping_city: string | null
  shipping_state: string | null
  shipping_zip: string | null
  shipping_country: string | null
  payment_intent: string | null
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  platform_fee: number
  total_amount: number
  created_at: string
  // Joined fields
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  vendor_id: string
  quantity: number
  price: number
  vendor_payout: number
  created_at: string
  // Joined fields
  product?: Product
}

export interface Review {
  id: string
  product_id: string
  buyer_id: string
  rating: number
  comment: string | null
  created_at: string
  // Joined fields
  buyer?: Profile
}

export interface CartItem {
  product: Product
  quantity: number
}
