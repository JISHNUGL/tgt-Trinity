'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', subject: '', message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-organic-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-organic-primary text-center mb-4">
          Contact Us
        </h1>
        <p className="text-center text-organic-secondary mb-12 max-w-2xl mx-auto">
          Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll get back to you as soon as possible.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            {submitted ? (
              <div className="card text-center py-12">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-semibold text-organic-primary mb-2">Message Sent!</h3>
                <p className="text-gray-600 mb-6">
                  Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }) }}
                  className="btn-primary"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <div className="card">
                <h2 className="text-2xl font-semibold text-organic-primary mb-6">Send a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-organic-secondary font-semibold mb-2">Name</label>
                    <input
                      type="text" name="name" value={formData.name} onChange={handleChange}
                      className="input-field" required placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-organic-secondary font-semibold mb-2">Email</label>
                    <input
                      type="email" name="email" value={formData.email} onChange={handleChange}
                      className="input-field" required placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-organic-secondary font-semibold mb-2">Subject</label>
                    <input
                      type="text" name="subject" value={formData.subject} onChange={handleChange}
                      className="input-field" required placeholder="How can we help?"
                    />
                  </div>
                  <div>
                    <label className="block text-organic-secondary font-semibold mb-2">Message</label>
                    <textarea
                      name="message" value={formData.message} onChange={handleChange}
                      className="input-field" rows={5} required placeholder="Your message..."
                    />
                  </div>
                  <button type="submit" className="w-full btn-primary">
                    Send Message
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="text-xl font-semibold text-organic-primary mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">📧</span>
                  <div>
                    <p className="font-semibold text-organic-primary">Email</p>
                    <p className="text-gray-600">info@organic-ecommerce.com</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">📞</span>
                  <div>
                    <p className="font-semibold text-organic-primary">Phone</p>
                    <p className="text-gray-600">1-800-ORGANIC</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="font-semibold text-organic-primary">Address</p>
                    <p className="text-gray-600">123 Green Street, Organic City, OC 12345</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">🕐</span>
                  <div>
                    <p className="font-semibold text-organic-primary">Business Hours</p>
                    <p className="text-gray-600">Mon-Fri: 9AM-6PM EST</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-organic-accent/20 border-organic-accent">
              <h3 className="text-xl font-semibold text-organic-primary mb-2">B2B Inquiries</h3>
              <p className="text-gray-600 mb-4">
                Looking for bulk ordering or business partnerships? Contact our B2B team directly.
              </p>
              <p className="font-semibold text-organic-primary">b2b@organic-ecommerce.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
