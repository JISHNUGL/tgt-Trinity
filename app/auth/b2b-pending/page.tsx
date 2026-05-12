import Link from 'next/link'

export default function B2BPendingPage() {
  return (
    <div className="min-h-screen bg-organic-accent/20 flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full">
        <div className="card text-center">
          <div className="text-6xl mb-6">⏳</div>
          <h2 className="text-3xl font-bold text-organic-primary mb-4">
            Application Under Review
          </h2>
          <p className="text-organic-secondary mb-6">
            Thank you for registering as a B2B customer! Your application is currently being reviewed by our team. 
            You&apos;ll receive an email notification once your account has been approved.
          </p>
          <div className="bg-organic-accent/20 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-organic-primary mb-2">What happens next?</h3>
            <ul className="text-left text-organic-secondary space-y-2 text-sm">
              <li>✅ Our team will review your business details</li>
              <li>✅ Verification typically takes 1-2 business days</li>
              <li>✅ You&apos;ll receive an email with the decision</li>
              <li>✅ Once approved, you&apos;ll unlock B2B pricing & features</li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="btn-primary">
              Browse Products
            </Link>
            <Link href="/" className="btn-secondary">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
