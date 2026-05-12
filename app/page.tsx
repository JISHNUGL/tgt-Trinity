'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

const heroProducts = [
  { name: 'Fresh Avocados', emoji: '🥑', color: 'from-green-400 to-emerald-600' },
  { name: 'Organic Honey', emoji: '🍯', color: 'from-amber-400 to-orange-500' },
  { name: 'Farm Berries', emoji: '🫐', color: 'from-purple-400 to-indigo-600' },
]

const categories = [
  { name: 'Fresh Produce', emoji: '🥬', count: 24, slug: 'fresh-produce', gradient: 'from-green-50 to-emerald-100', border: 'border-green-200' },
  { name: 'Dairy Products', emoji: '🧀', count: 18, slug: 'dairy-products', gradient: 'from-yellow-50 to-amber-100', border: 'border-yellow-200' },
  { name: 'Grains & Cereals', emoji: '🌾', count: 15, slug: 'grains-cereals', gradient: 'from-orange-50 to-amber-100', border: 'border-orange-200' },
  { name: 'Herbs & Spices', emoji: '🌿', count: 12, slug: 'herbs-spices', gradient: 'from-lime-50 to-green-100', border: 'border-lime-200' },
]

const features = [
  { icon: '🌱', title: '100% Organic', desc: 'Certified organic produce sourced from trusted farms' },
  { icon: '🚚', title: 'Fast Delivery', desc: 'Same-day delivery on orders placed before 2 PM' },
  { icon: '💰', title: 'Best Prices', desc: 'Competitive pricing with bulk discounts for B2B' },
  { icon: '♻️', title: 'Eco Packaging', desc: 'Sustainable, recyclable packaging on every order' },
  { icon: '🤝', title: 'B2B Solutions', desc: 'Dedicated accounts, volume pricing, and quotes' },
  { icon: '⭐', title: 'Quality Assured', desc: 'Every product tested for freshness and quality' },
]

const testimonials = [
  { name: 'Sarah Mitchell', role: 'Restaurant Owner', text: 'The quality of organic produce from this platform is consistently excellent. Our customers love it!', rating: 5 },
  { name: 'James Rodriguez', role: 'Health Coach', text: 'I recommend this store to all my clients. The freshness and variety are unmatched.', rating: 5 },
  { name: 'Emily Chen', role: 'Home Chef', text: 'Amazing prices for organic products. The B2B program saved us 20% on bulk orders.', rating: 5 },
]

export default function Home() {
  const [currentHero, setCurrentHero] = useState(0)
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHero(prev => (prev + 1) % heroProducts.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetch('/api/products?limit=4')
      .then(res => res.json())
      .then(data => setProducts(data.products || []))
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-organic-secondary via-organic-primary to-organic-muted text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-8xl animate-pulse">🌿</div>
          <div className="absolute top-20 right-20 text-6xl animate-pulse" style={{ animationDelay: '1s' }}>🍃</div>
          <div className="absolute bottom-10 left-1/3 text-7xl animate-pulse" style={{ animationDelay: '2s' }}>🌱</div>
          <div className="absolute bottom-20 right-1/4 text-5xl animate-pulse" style={{ animationDelay: '0.5s' }}>🥬</div>
        </div>
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full text-sm mb-6 backdrop-blur-sm">
                <span className="mr-2">🌱</span> 100% Organic & Sustainably Sourced
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Fresh Organic<br />
                <span className="text-organic-accent">Goodness</span><br />
                Delivered Daily
              </h1>
              <p className="text-lg text-white/80 mb-8 max-w-lg">
                Premium organic products from farm to table. Shop fresh produce, dairy, grains, herbs and more — with bulk pricing for businesses.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/products" className="inline-flex items-center px-8 py-4 bg-organic-accent text-organic-secondary rounded-xl font-bold text-lg hover:bg-white hover:text-organic-primary transition-all shadow-lg hover:shadow-xl">
                  Shop Now →
                </Link>
                <Link href="/b2b" className="inline-flex items-center px-8 py-4 bg-white/10 text-white border border-white/30 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all backdrop-blur-sm">
                  B2B Solutions
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-10 text-white/70 text-sm">
                <div className="flex items-center gap-2"><span className="text-organic-accent font-bold text-lg">500+</span> Products</div>
                <div className="w-px h-6 bg-white/20" />
                <div className="flex items-center gap-2"><span className="text-organic-accent font-bold text-lg">1200+</span> Customers</div>
                <div className="w-px h-6 bg-white/20" />
                <div className="flex items-center gap-2"><span className="text-organic-accent font-bold text-lg">4.9★</span> Rating</div>
              </div>
            </div>
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative w-80 h-80">
                {heroProducts.map((p, i) => (
                  <div
                    key={i}
                    className={`absolute inset-0 flex flex-col items-center justify-center rounded-full bg-gradient-to-br ${p.color} shadow-2xl transition-all duration-700 ${
                      i === currentHero ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                    }`}
                  >
                    <span className="text-8xl mb-4">{p.emoji}</span>
                    <span className="text-xl font-bold text-white">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-organic-primary mb-3">Shop by Category</h2>
            <p className="text-gray-600 max-w-lg mx-auto">Browse our curated selection of premium organic products</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map(cat => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className={`bg-gradient-to-br ${cat.gradient} border ${cat.border} rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group`}
              >
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{cat.emoji}</div>
                <h3 className="font-bold text-organic-primary text-lg">{cat.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{cat.count} products</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-organic-primary mb-2">Featured Products</h2>
                <p className="text-gray-600">Handpicked organic essentials for your kitchen</p>
              </div>
              <Link href="/products" className="hidden md:inline-flex items-center text-organic-primary font-semibold hover:text-organic-secondary transition-colors">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 4).map(product => (
                <Link key={product.id} href={`/products/${product.slug}`} className="group">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1">
                    <div className="h-48 bg-gradient-to-br from-organic-accent/20 to-organic-accent/5 flex items-center justify-center relative">
                      <span className="text-6xl group-hover:scale-110 transition-transform">🌱</span>
                      {product.is_organic && (
                        <span className="absolute top-3 right-3 bg-organic-accent text-organic-secondary text-xs font-bold px-2 py-1 rounded-full">Organic</span>
                      )}
                    </div>
                    <div className="p-5">
                      {product.category_name && (
                        <span className="text-xs text-organic-muted uppercase tracking-wider">{product.category_name}</span>
                      )}
                      <h3 className="font-bold text-organic-primary mt-1 mb-2 group-hover:text-organic-secondary transition-colors">{product.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-organic-primary">${product.price.toFixed(2)}</span>
                        <button className="bg-organic-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-organic-secondary transition-colors">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8 md:hidden">
              <Link href="/products" className="btn-primary">View All Products</Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-br from-organic-secondary to-organic-primary text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Why Choose Us</h2>
            <p className="text-white/70 max-w-lg mx-auto">We&apos;re committed to bringing you the freshest organic products</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/15 transition-colors border border-white/10">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-white/70">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-organic-primary mb-3">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex gap-1 text-yellow-400 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => <span key={j}>⭐</span>)}
                </div>
                <p className="text-gray-700 mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-organic-accent/30 flex items-center justify-center font-bold text-organic-primary">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-organic-primary">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* B2B CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-organic-primary to-organic-secondary rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-10 text-7xl">📦</div>
              <div className="absolute bottom-4 left-10 text-6xl">🏢</div>
            </div>
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Business Customer?</h2>
              <p className="text-lg text-white/80 mb-8">
                Get bulk pricing, dedicated account management, and custom quotes. Join our B2B program and save up to 20% on orders.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/b2b" className="px-8 py-4 bg-organic-accent text-organic-secondary rounded-xl font-bold text-lg hover:bg-white transition-colors">
                  Learn More
                </Link>
                <Link href="/auth/register" className="px-8 py-4 bg-white/10 text-white border border-white/30 rounded-xl font-semibold text-lg hover:bg-white/20 transition-colors">
                  Apply Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
