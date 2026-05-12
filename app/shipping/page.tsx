import Link from 'next/link'

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-organic-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-organic-primary text-center mb-8">
          Shipping Information
        </h1>

        <div className="space-y-8">
          <div className="card">
            <h2 className="text-2xl font-semibold text-organic-primary mb-4">Shipping Rates</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-organic-accent/10 rounded-lg">
                <span className="font-medium">Orders over $50</span>
                <span className="font-bold text-organic-primary">FREE Shipping</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Orders under $50</span>
                <span className="font-semibold">$9.99 flat rate</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-2xl font-semibold text-organic-primary mb-4">Delivery Times</h2>
            <div className="space-y-3 text-gray-600">
              <p>📦 <strong>Standard Shipping:</strong> 5-7 business days</p>
              <p>🚚 <strong>Express Shipping:</strong> 2-3 business days</p>
              <p>⚡ <strong>Same-Day Delivery:</strong> Available in select areas</p>
            </div>
          </div>

          <div className="card">
            <h2 className="text-2xl font-semibold text-organic-primary mb-4">Shipping Areas</h2>
            <p className="text-gray-600 mb-4">
              We currently ship to all provinces and territories across Canada and all 50 US states.
              International shipping is available for select countries.
            </p>
          </div>

          <div className="card bg-organic-accent/20 border-organic-accent">
            <h2 className="text-xl font-semibold text-organic-primary mb-2">B2B Shipping</h2>
            <p className="text-gray-600 mb-4">
              Business customers enjoy special shipping rates and priority handling.
              Contact our B2B team for custom shipping solutions.
            </p>
            <Link href="/b2b" className="text-organic-primary font-semibold hover:underline">
              Learn about B2B →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
