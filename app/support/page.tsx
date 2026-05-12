import Link from 'next/link'

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-organic-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-organic-primary text-center mb-4">
          Customer Support
        </h1>
        <p className="text-center text-organic-secondary mb-12">
          We&apos;re here to help you with anything you need.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="card text-center">
            <div className="text-4xl mb-4">📧</div>
            <h3 className="text-xl font-semibold text-organic-primary mb-2">Email Support</h3>
            <p className="text-gray-600 mb-4">Get a response within 24 hours</p>
            <p className="font-semibold text-organic-primary">info@organic-ecommerce.com</p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-4">📞</div>
            <h3 className="text-xl font-semibold text-organic-primary mb-2">Phone Support</h3>
            <p className="text-gray-600 mb-4">Mon-Fri, 9AM-6PM EST</p>
            <p className="font-semibold text-organic-primary">1-800-ORGANIC</p>
          </div>
        </div>

        <div className="card mb-8">
          <h2 className="text-2xl font-semibold text-organic-primary mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/faq" className="p-4 bg-organic-accent/10 rounded-lg hover:bg-organic-accent/20 transition-colors">
              <span className="font-semibold text-organic-primary">📋 FAQ</span>
              <p className="text-sm text-gray-600 mt-1">Find answers to common questions</p>
            </Link>
            <Link href="/shipping" className="p-4 bg-organic-accent/10 rounded-lg hover:bg-organic-accent/20 transition-colors">
              <span className="font-semibold text-organic-primary">🚚 Shipping Info</span>
              <p className="text-sm text-gray-600 mt-1">Delivery times and rates</p>
            </Link>
            <Link href="/returns" className="p-4 bg-organic-accent/10 rounded-lg hover:bg-organic-accent/20 transition-colors">
              <span className="font-semibold text-organic-primary">↩️ Returns</span>
              <p className="text-sm text-gray-600 mt-1">Return and refund policies</p>
            </Link>
            <Link href="/contact" className="p-4 bg-organic-accent/10 rounded-lg hover:bg-organic-accent/20 transition-colors">
              <span className="font-semibold text-organic-primary">💬 Contact Us</span>
              <p className="text-sm text-gray-600 mt-1">Send us a message directly</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
