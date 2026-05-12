'use client'

import { useState } from 'react'

const faqs = [
  {
    q: 'What makes your products organic?',
    a: 'All our products are certified organic by recognized certification bodies. They are grown without synthetic pesticides, herbicides, or genetically modified organisms (GMOs).'
  },
  {
    q: 'Do you offer free shipping?',
    a: 'Yes! We offer free shipping on all orders over $50. Orders under $50 have a flat shipping rate of $9.99.'
  },
  {
    q: 'What is your return policy?',
    a: 'We offer a 30-day return policy for non-perishable items. For perishable goods, please contact us within 48 hours if there are any issues with your delivery.'
  },
  {
    q: 'How do I become a B2B customer?',
    a: 'Simply register on our website and select "Business Customer (B2B)" as your account type. Our team will review your application and get back to you within 1-2 business days.'
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards (Visa, Mastercard, American Express), and are working on adding additional payment options including PayPal and e-Transfer.'
  },
  {
    q: 'How fresh are your products?',
    a: 'We work directly with farms to ensure maximum freshness. Most produce is shipped within 24-48 hours of harvest. Our packaging is designed to maintain freshness during transit.'
  },
  {
    q: 'Do you deliver to my area?',
    a: 'We currently ship to all provinces and territories in Canada and all 50 US states. Check our shipping page for delivery timeframes to your area.'
  },
  {
    q: 'Can I modify or cancel my order?',
    a: 'Orders can be modified or cancelled within 2 hours of placement. After that, please contact our support team and we\'ll do our best to accommodate your request.'
  }
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-organic-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-organic-primary text-center mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-center text-organic-secondary mb-12">
          Find answers to common questions about our products and services.
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="card cursor-pointer" onClick={() => setOpenIndex(openIndex === index ? null : index)}>
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-organic-primary pr-4">{faq.q}</h3>
                <span className="text-organic-primary text-xl flex-shrink-0">
                  {openIndex === index ? '−' : '+'}
                </span>
              </div>
              {openIndex === index && (
                <p className="text-gray-600 mt-4 pt-4 border-t border-organic-muted/20">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <a href="/contact" className="btn-primary inline-block">Contact Us</a>
        </div>
      </div>
    </div>
  )
}
