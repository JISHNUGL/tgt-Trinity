import Link from 'next/link'

export default function B2BPage() {
  return (
    <div className="min-h-screen bg-organic-white">
      <div className="bg-organic-secondary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            B2B Solutions
          </h1>
          <p className="text-organic-accent text-lg max-w-2xl mx-auto mb-8">
            Wholesale organic products for businesses. Volume pricing, dedicated support, and streamlined ordering.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="btn-secondary inline-block">
              Apply for B2B Account
            </Link>
            <Link href="/auth/login" className="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors inline-block">
              B2B Sign In
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="card text-center">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-organic-primary mb-2">Volume Pricing</h3>
            <p className="text-gray-600">
              Get competitive wholesale prices with volume-based discounts up to 30% off retail.
            </p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold text-organic-primary mb-2">Quick Reorder</h3>
            <p className="text-gray-600">
              Save time with one-click reordering from your order history and saved templates.
            </p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-organic-primary mb-2">Custom Quotes</h3>
            <p className="text-gray-600">
              Request custom quotes for large orders with flexible payment terms.
            </p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold text-organic-primary mb-2">Dedicated Support</h3>
            <p className="text-gray-600">
              Get a dedicated account manager for personalized service and priority support.
            </p>
          </div>
        </div>

        <div className="bg-organic-accent/20 rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-organic-primary text-center mb-8">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-organic-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="font-semibold text-organic-primary mb-2">Apply</h3>
              <p className="text-gray-600 text-sm">Register as a B2B customer with your business details</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-organic-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="font-semibold text-organic-primary mb-2">Get Approved</h3>
              <p className="text-gray-600 text-sm">Our team reviews and approves your application within 1-2 days</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-organic-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="font-semibold text-organic-primary mb-2">Start Ordering</h3>
              <p className="text-gray-600 text-sm">Access wholesale pricing, custom quotes, and B2B features</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-organic-primary mb-4">
            Ready to partner with us?
          </h2>
          <p className="text-gray-600 mb-6">
            Join hundreds of businesses that trust us for their organic supply needs.
          </p>
          <Link href="/auth/register" className="btn-primary inline-block">
            Get Started Today
          </Link>
        </div>
      </div>
    </div>
  )
}
