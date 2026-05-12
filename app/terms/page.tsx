export default function TermsPage() {
  return (
    <div className="min-h-screen bg-organic-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-organic-primary text-center mb-8">
          Terms of Service
        </h1>
        <div className="card prose max-w-none">
          <p className="text-gray-600 mb-6">Last updated: January 2024</p>

          <h2 className="text-xl font-semibold text-organic-primary mt-6 mb-3">1. Acceptance of Terms</h2>
          <p className="text-gray-600 mb-4">
            By accessing or using our website, you agree to be bound by these Terms of Service and all applicable laws and regulations.
          </p>

          <h2 className="text-xl font-semibold text-organic-primary mt-6 mb-3">2. Products & Pricing</h2>
          <p className="text-gray-600 mb-4">
            All prices are listed in USD and are subject to change without notice. We strive to display accurate pricing but reserve the right to correct any errors.
          </p>

          <h2 className="text-xl font-semibold text-organic-primary mt-6 mb-3">3. Orders & Payment</h2>
          <p className="text-gray-600 mb-4">
            By placing an order, you warrant that you are legally capable of entering into binding contracts. Payment is required at the time of purchase.
          </p>

          <h2 className="text-xl font-semibold text-organic-primary mt-6 mb-3">4. Shipping & Delivery</h2>
          <p className="text-gray-600 mb-4">
            Delivery times are estimates and may vary. We are not responsible for delays caused by shipping carriers or unforeseen circumstances.
          </p>

          <h2 className="text-xl font-semibold text-organic-primary mt-6 mb-3">5. Returns & Refunds</h2>
          <p className="text-gray-600 mb-4">
            Our return policy allows returns within 30 days for non-perishable items. Perishable items are subject to our freshness guarantee.
          </p>

          <h2 className="text-xl font-semibold text-organic-primary mt-6 mb-3">6. Contact</h2>
          <p className="text-gray-600 mb-4">
            For questions about these terms, contact us at info@organic-ecommerce.com.
          </p>
        </div>
      </div>
    </div>
  )
}
