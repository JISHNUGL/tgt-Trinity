export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-organic-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-organic-primary text-center mb-8">
          Returns & Refunds
        </h1>

        <div className="space-y-8">
          <div className="card">
            <h2 className="text-2xl font-semibold text-organic-primary mb-4">Our Return Policy</h2>
            <p className="text-gray-600 mb-4">
              We want you to be completely satisfied with your purchase. If you&apos;re not happy with your order, 
              we offer hassle-free returns within 30 days of delivery.
            </p>
          </div>

          <div className="card">
            <h2 className="text-2xl font-semibold text-organic-primary mb-4">How to Return</h2>
            <ol className="space-y-3 text-gray-600">
              <li className="flex items-start space-x-3">
                <span className="bg-organic-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">1</span>
                <span>Contact our support team at info@organic-ecommerce.com with your order number</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="bg-organic-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">2</span>
                <span>Receive a prepaid return shipping label</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="bg-organic-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">3</span>
                <span>Pack items securely and ship within 14 days</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="bg-organic-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">4</span>
                <span>Refund processed within 5-7 business days of receiving the return</span>
              </li>
            </ol>
          </div>

          <div className="card">
            <h2 className="text-2xl font-semibold text-organic-primary mb-4">Perishable Items</h2>
            <p className="text-gray-600">
              Due to the nature of organic food products, perishable items cannot be returned once delivered. 
              However, if you receive damaged or spoiled goods, please contact us within 48 hours with 
              photos and we&apos;ll arrange a full refund or replacement.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
