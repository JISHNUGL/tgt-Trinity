'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface B2BApplication {
  id: number
  business_name: string
  business_address: string
  tax_id: string
  contact_person: string
  contact_email: string
  contact_phone: string
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string
  created_at: string
  reviewed_at?: string
}

export default function B2BApplicationsPage() {
  const [applications, setApplications] = useState<B2BApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [selectedApplication, setSelectedApplication] = useState<B2BApplication | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [processing, setProcessing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAdminAccess()
    fetchApplications()
  }, [filter])

  const checkAdminAccess = () => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    
    if (!token || user.role !== 'admin') {
      router.push('/auth/login')
      return
    }
  }

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token')
      const status = filter === 'all' ? '' : filter
      
      const response = await fetch(`/api/admin/b2b-applications${status ? `?status=${status}` : ''}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to fetch applications')
      
      const data = await response.json()
      setApplications(data.applications || [])
    } catch (error) {
      setError('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const handleApplicationAction = async (applicationId: number, action: 'approve' | 'reject') => {
    setProcessing(true)
    
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/admin/b2b-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          applicationId,
          status: action,
          adminNotes: adminNotes.trim()
        })
      })

      if (!response.ok) throw new Error('Failed to process application')
      
      setSelectedApplication(null)
      setAdminNotes('')
      fetchApplications()
    } catch (error) {
      setError('Failed to process application')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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
            B2B Applications
          </h1>
          <button
            onClick={() => router.push('/admin')}
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

        <div className="mb-6">
          <div className="flex space-x-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === status
                    ? 'bg-organic-primary text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status === 'pending' && applications.filter(a => a.status === 'pending').length > 0 && (
                  <span className="ml-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs">
                    {applications.filter(a => a.status === 'pending').length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-gray-600">No {filter === 'all' ? '' : filter} applications found</p>
              </div>
            ) : (
              applications.map(application => (
                <div
                  key={application.id}
                  className={`card cursor-pointer transition-all ${
                    selectedApplication?.id === application.id ? 'ring-2 ring-organic-primary' : ''
                  }`}
                  onClick={() => setSelectedApplication(application)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-organic-primary">
                        {application.business_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Applied: {new Date(application.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <p><strong>Contact:</strong> {application.contact_person}</p>
                    <p><strong>Email:</strong> {application.contact_email}</p>
                    <p><strong>Phone:</strong> {application.contact_phone || 'Not provided'}</p>
                    <p><strong>Tax ID:</strong> {application.tax_id || 'Not provided'}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div>
            {selectedApplication ? (
              <div className="card">
                <h2 className="text-xl font-semibold text-organic-primary mb-4">
                  Application Details
                </h2>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name
                    </label>
                    <p className="text-organic-secondary">{selectedApplication.business_name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Address
                    </label>
                    <p className="text-organic-secondary whitespace-pre-wrap">
                      {selectedApplication.business_address}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person
                    </label>
                    <p className="text-organic-secondary">{selectedApplication.contact_person}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email
                    </label>
                    <p className="text-organic-secondary">{selectedApplication.contact_email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    <p className="text-organic-secondary">
                      {selectedApplication.contact_phone || 'Not provided'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax ID
                    </label>
                    <p className="text-organic-secondary">
                      {selectedApplication.tax_id || 'Not provided'}
                    </p>
                  </div>
                  
                  {selectedApplication.admin_notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Previous Notes
                      </label>
                      <p className="text-organic-secondary bg-gray-50 p-3 rounded">
                        {selectedApplication.admin_notes}
                      </p>
                    </div>
                  )}
                  
                  {selectedApplication.status === 'pending' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Admin Notes
                      </label>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="input-field"
                        rows={4}
                        placeholder="Add notes about this decision..."
                      />
                    </div>
                  )}
                </div>
                
                {selectedApplication.status === 'pending' && (
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleApplicationAction(selectedApplication.id, 'approve')}
                      disabled={processing}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {processing ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleApplicationAction(selectedApplication.id, 'reject')}
                      disabled={processing}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {processing ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                )}
                
                {selectedApplication.status !== 'pending' && (
                  <div className="text-center">
                    <p className="text-gray-600">
                      Application {selectedApplication.status} on{' '}
                      {selectedApplication.reviewed_at 
                        ? new Date(selectedApplication.reviewed_at).toLocaleDateString()
                        : 'N/A'
                      }
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="card text-center py-8">
                <p className="text-gray-600">Select an application to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
