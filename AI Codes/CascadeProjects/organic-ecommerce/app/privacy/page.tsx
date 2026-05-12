export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-organic-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-organic-primary text-center mb-8">
          Privacy Policy
        </h1>
        <div className="card prose max-w-none">
          <p className="text-gray-600 mb-6">Last updated: January 2024</p>
          
          <h2 className="text-xl font-semibold text-organic-primary mt-6 mb-3">1. Information We Collect</h2>
          <p className="text-gray-600 mb-4">
            We collect information you provide directly, including name, email, shipping address, and payment details when you create an account or place an order.
          </p>

          <h2 className="text-xl font-semibold text-organic-primary mt-6 mb-3">2. How We Use Your Information</h2>
          <p className="text-gray-600 mb-4">
            Your information is used to process orders, communicate about your purchases, and improve our services. We do not sell your personal information to third parties.
          </p>

          <h2 className="text-xl font-semibold text-organic-primary mt-6 mb-3">3. Data Security</h2>
          <p className="text-gray-600 mb-4">
            We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your personal information.
          </p>

          <h2 className="text-xl font-semibold text-organic-primary mt-6 mb-3">4. Cookies</h2>
          <p className="text-gray-600 mb-4">
            We use cookies to enhance your browsing experience, remember preferences, and analyze site traffic. You can control cookie settings in your browser.
          </p>

          <h2 className="text-xl font-semibold text-organic-primary mt-6 mb-3">5. Contact Us</h2>
          <p className="text-gray-600 mb-4">
            For privacy-related questions, contact us at info@organic-ecommerce.com.
          </p>
        </div>
      </div>
    </div>
  )
}
