import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-organic-secondary text-organic-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-organic-accent rounded-full flex items-center justify-center">
                <span className="text-organic-secondary font-bold text-sm">OE</span>
              </div>
              <span className="text-xl font-bold">Organic E-commerce</span>
            </div>
            <p className="text-organic-accent">
              Premium organic products for conscious consumers and businesses.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-organic-accent hover:text-organic-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-organic-accent hover:text-organic-white transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/b2b" className="text-organic-accent hover:text-organic-white transition-colors">
                  B2B Solutions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-organic-accent hover:text-organic-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/shipping" className="text-organic-accent hover:text-organic-white transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-organic-accent hover:text-organic-white transition-colors">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-organic-accent hover:text-organic-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-organic-accent hover:text-organic-white transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-2 text-organic-accent">
              <li>📧 info@organic-ecommerce.com</li>
              <li>📞 1-800-ORGANIC</li>
              <li>📍 123 Green Street, Organic City, OC 12345</li>
              <li>🕐 Mon-Fri: 9AM-6PM EST</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-organic-muted mt-8 pt-8 text-center">
          <p className="text-organic-accent">
            © 2024 Organic E-commerce. All rights reserved. | 
            <Link href="/privacy" className="hover:text-organic-white transition-colors ml-1">
              Privacy Policy
            </Link> | 
            <Link href="/terms" className="hover:text-organic-white transition-colors ml-1">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
