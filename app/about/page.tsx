import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-organic-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-organic-primary text-center mb-4">
          About Organic E-commerce
        </h1>
        <p className="text-center text-organic-secondary mb-12 max-w-2xl mx-auto">
          Your trusted source for premium organic products, sustainably sourced from certified farms.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-2xl font-semibold text-organic-primary mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-4">
              We believe everyone deserves access to pure, organic food. Our mission is to bridge the gap between 
              sustainable organic farms and conscious consumers, making it easy to shop for high-quality organic 
              products from the comfort of your home.
            </p>
            <p className="text-gray-600">
              Every product in our catalog is carefully selected and verified for organic certification, 
              ensuring you get nothing but the best for your family.
            </p>
          </div>
          <div className="bg-organic-accent/20 rounded-2xl p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🌿</div>
              <p className="text-organic-primary font-semibold text-lg">100% Certified Organic</p>
              <p className="text-organic-secondary text-sm">Every product, every time</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="card text-center">
            <div className="text-4xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-organic-primary mb-2">Sustainably Sourced</h3>
            <p className="text-gray-600">
              We partner with farms that prioritize sustainable agriculture and environmental stewardship.
            </p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold text-organic-primary mb-2">Fair Trade</h3>
            <p className="text-gray-600">
              We ensure fair compensation for farmers and support local communities through ethical trade.
            </p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-4">🚚</div>
            <h3 className="text-xl font-semibold text-organic-primary mb-2">Fast Delivery</h3>
            <p className="text-gray-600">
              Free shipping on orders over $50. We deliver nationwide with eco-friendly packaging.
            </p>
          </div>
        </div>

        <div className="bg-organic-secondary rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to go organic?</h2>
          <p className="text-organic-accent mb-6">
            Join thousands of conscious consumers making a healthier choice every day.
          </p>
          <Link href="/products" className="btn-secondary inline-block">
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  )
}
