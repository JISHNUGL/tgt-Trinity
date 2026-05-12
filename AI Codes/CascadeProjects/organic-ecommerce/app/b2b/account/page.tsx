'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface B2BPreferences {
  id?: number
  user_id?: number
  default_payment_method: string
  default_shipping_address: string
  email_notifications: boolean
  order_confirmations: boolean
  quote_notifications: boolean
  auto_reorder_reminders: boolean
  preferred_delivery_days: string
  special_instructions: string
}

interface User {
  id?: number
  email: string
  full_name: string
  phone: string
  role: string
  b2bApproved: boolean
  businessName?: string
  businessAddress?: string
}

export default function B2BAccount() {
  const [user, setUser] = useState<User | null>(null)
  const [preferences, setPreferences] = useState<B2BPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('profile')
  const router = useRouter()

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    businessName: '',
    businessAddress: ''
  })

  const [preferencesData, setPreferencesData] = useState({
    default_payment_method: 'credit_card',
    default_shipping_address: '',
    email_notifications: true,
    order_confirmations: true,
    quote_notifications: true,
    auto_reorder_reminders: false,
    preferred_delivery_days: '',
    special_instructions: ''
  })

  useEffect(() => {
    checkB2BAccess()
    fetchUserData()
    fetchPreferences()
  }, [])

  const checkB2BAccess = () => {
    const token = localStorage.getItem('token')
    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    
    if (!token || userData.role !== 'b2b' || !userData.b2bApproved) {
      router.push('/auth/login')
      return
    }
    
    setUser(userData)
    setFormData({
      full_name: userData.full_name || '',
      phone: userData.phone || '',
      businessName: userData.businessName || '',
      businessAddress: userData.businessAddress || ''
    })
  }

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token')
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      
      // For now, use stored user data. In production, this would fetch from API
      setUser(userData)
    } catch (error) {
      setError('Failed to load user data')
    }
  }

  const fetchPreferences = async () => {
    try {
      const token = localStorage.getItem('token')
      // Mock preferences data - in production, this would fetch from API
      const mockPreferences: B2BPreferences = {
        id: 1,
        user_id: user?.id || 1,
        default_payment_method: 'credit_card',
        default_shipping_address: '',
        email_notifications: true,
        order_confirmations: true,
        quote_notifications: true,
        auto_reorder_reminders: false,
        preferred_delivery_days: 'Monday, Wednesday, Friday',
        special_instructions: ''
      }
      
      setPreferences(mockPreferences)
      setPreferencesData({
        default_payment_method: mockPreferences.default_payment_method,
        default_shipping_address: mockPreferences.default_shipping_address,
        email_notifications: mockPreferences.email_notifications,
        order_confirmations: mockPreferences.order_confirmations,
        quote_notifications: mockPreferences.quote_notifications,
        auto_reorder_reminders: mockPreferences.auto_reorder_reminders,
        preferred_delivery_days: mockPreferences.preferred_delivery_days,
        special_instructions: mockPreferences.special_instructions
      })
    } catch (error) {
      setError('Failed to load preferences')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e: any) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      
      // Mock update - in production, this would call API
      const updatedUser = {
        ...user,
        full_name: formData.full_name,
        phone: formData.phone,
        businessName: formData.businessName,
        businessAddress: formData.businessAddress
      }
      
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser as User)
      setSuccess('Profile updated successfully!')
      
    } catch (error) {
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePreferencesUpdate = async (e: any) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      
      // Mock update - in production, this would call API
      const updatedPreferences = {
        ...preferences,
        ...preferencesData
      }
      
      setPreferences(updatedPreferences as B2BPreferences)
      setSuccess('Preferences updated successfully!')
      
    } catch (error) {
      setError('Failed to update preferences')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-organic-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-organic-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-organic-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-organic-primary">
            Account Settings
          </h1>
          <button
            onClick={() => router.push('/b2b/dashboard')}
            className="btn-secondary"
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-organic-muted/20">
          <div className="border-b border-organic-muted/20">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-organic-primary text-organic-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Business Profile
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'preferences'
                    ? 'border-organic-primary text-organic-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Preferences
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'security'
                    ? 'border-organic-primary text-organic-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Security
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-organic-primary mb-4">
                    Business Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-organic-secondary font-semibold mb-2">
                        Business Name
                      </label>
                      <input
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          businessName: e.target.value
                        }))}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-organic-secondary font-semibold mb-2">
                        Contact Person
                      </label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          full_name: e.target.value
                        }))}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-organic-secondary font-semibold mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="input-field bg-gray-100"
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        Email cannot be changed
                      </p>
                    </div>

                    <div>
                      <label className="block text-organic-secondary font-semibold mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          phone: e.target.value
                        }))}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-organic-secondary font-semibold mb-2">
                      Business Address
                    </label>
                    <textarea
                      value={formData.businessAddress}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        businessAddress: e.target.value
                      }))}
                      className="input-field"
                      rows={3}
                      placeholder="Enter your complete business address"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'preferences' && (
              <form onSubmit={handlePreferencesUpdate} className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-organic-primary mb-4">
                    Order Preferences
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-organic-secondary font-semibold mb-2">
                        Default Payment Method
                      </label>
                      <select
                        value={preferencesData.default_payment_method}
                        onChange={(e) => setPreferencesData(prev => ({
                          ...prev,
                          default_payment_method: e.target.value
                        }))}
                        className="input-field"
                      >
                        <option value="credit_card">Credit Card</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="net_terms">Net Terms</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-organic-secondary font-semibold mb-2">
                        Default Shipping Address
                      </label>
                      <textarea
                        value={preferencesData.default_shipping_address}
                        onChange={(e) => setPreferencesData(prev => ({
                          ...prev,
                          default_shipping_address: e.target.value
                        }))}
                        className="input-field"
                        rows={3}
                        placeholder="Enter your default shipping address"
                      />
                    </div>

                    <div>
                      <label className="block text-organic-secondary font-semibold mb-2">
                        Preferred Delivery Days
                      </label>
                      <input
                        type="text"
                        value={preferencesData.preferred_delivery_days}
                        onChange={(e) => setPreferencesData(prev => ({
                          ...prev,
                          preferred_delivery_days: e.target.value
                        }))}
                        className="input-field"
                        placeholder="e.g., Monday, Wednesday, Friday"
                      />
                    </div>

                    <div>
                      <label className="block text-organic-secondary font-semibold mb-2">
                        Special Instructions
                      </label>
                      <textarea
                        value={preferencesData.special_instructions}
                        onChange={(e) => setPreferencesData(prev => ({
                          ...prev,
                          special_instructions: e.target.value
                        }))}
                        className="input-field"
                        rows={3}
                        placeholder="Any special delivery or handling instructions"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-organic-primary mb-4">
                    Notification Preferences
                  </h3>
                  
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferencesData.email_notifications}
                        onChange={(e) => setPreferencesData(prev => ({
                          ...prev,
                          email_notifications: e.target.checked
                        }))}
                        className="mr-3 h-4 w-4 text-organic-primary focus:ring-organic-primary border-gray-300 rounded"
                      />
                      <span className="text-gray-700">Email notifications</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferencesData.order_confirmations}
                        onChange={(e) => setPreferencesData(prev => ({
                          ...prev,
                          order_confirmations: e.target.checked
                        }))}
                        className="mr-3 h-4 w-4 text-organic-primary focus:ring-organic-primary border-gray-300 rounded"
                      />
                      <span className="text-gray-700">Order confirmations</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferencesData.quote_notifications}
                        onChange={(e) => setPreferencesData(prev => ({
                          ...prev,
                          quote_notifications: e.target.checked
                        }))}
                        className="mr-3 h-4 w-4 text-organic-primary focus:ring-organic-primary border-gray-300 rounded"
                      />
                      <span className="text-gray-700">Quote notifications</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferencesData.auto_reorder_reminders}
                        onChange={(e) => setPreferencesData(prev => ({
                          ...prev,
                          auto_reorder_reminders: e.target.checked
                        }))}
                        className="mr-3 h-4 w-4 text-organic-primary focus:ring-organic-primary border-gray-300 rounded"
                      />
                      <span className="text-gray-700">Auto-reorder reminders</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Update Preferences'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-organic-primary mb-4">
                    Password Security
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-organic-secondary font-semibold mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="input-field"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div>
                      <label className="block text-organic-secondary font-semibold mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="input-field"
                        placeholder="Enter new password"
                      />
                    </div>

                    <div>
                      <label className="block text-organic-secondary font-semibold mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="input-field"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-organic-primary mb-4">
                    Account Status
                  </h3>
                  
                  <div className="bg-organic-accent/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-organic-primary">
                          B2B Account Status
                        </p>
                        <p className="text-sm text-gray-600">
                          Your account is approved for B2B purchasing
                        </p>
                      </div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button className="btn-secondary">
                    Cancel
                  </button>
                  <button
                    disabled={saving}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
