'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatDate, truncateUrl, copyToClipboard } from '@/lib/utils'

interface LinkData {
  id: string
  code: string
  url: string
  clicks: number
  createdAt: string
  lastClicked: string | null
}

export default function Dashboard() {
  const [links, setLinks] = useState<LinkData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({ url: '', code: '' })
  const [formError, setFormError] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [sortField, setSortField] = useState<'createdAt' | 'clicks'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  useEffect(() => {
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/links')
      if (!response.ok) throw new Error('Failed to fetch links')
      const data = await response.json()
      setLinks(data)
      setError(null)
    } catch (err) {
      setError('Failed to load links. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormLoading(true)

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: formData.url,
          code: formData.code || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create link')
      }

      // Success
      setFormData({ url: '', code: '' })
      setShowAddForm(false)
      fetchLinks()
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (code: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return

    try {
      const response = await fetch(`/api/links/${code}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete link')

      fetchLinks()
    } catch (err) {
      alert('Failed to delete link. Please try again.')
      console.error(err)
    }
  }

  const handleCopy = async (code: string) => {
    const shortUrl = `${baseUrl}/${code}`
    try {
      await copyToClipboard(shortUrl)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      alert('Failed to copy to clipboard')
    }
  }

  const filteredLinks = links.filter(
    (link) =>
      link.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.url.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedLinks = [...filteredLinks].sort((a, b) => {
    const aVal = sortField === 'clicks' ? a.clicks : new Date(a.createdAt).getTime()
    const bVal = sortField === 'clicks' ? b.clicks : new Date(b.createdAt).getTime()
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
  })

  const toggleSort = (field: 'createdAt' | 'clicks') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">TinyLink</h1>
        <p className="text-gray-600">Shorten URLs and track clicks</p>
      </header>

      {/* Actions Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <input
          type="text"
          placeholder="Search by code or URL..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
        />
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {showAddForm ? 'Cancel' : '+ Add Link'}
        </button>
      </div>

      {/* Add Link Form */}
      {showAddForm && (
        <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Create Short Link</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                Target URL *
              </label>
              <input
                type="url"
                id="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com/very/long/url"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={formLoading}
              />
              <p className="mt-1 text-sm text-gray-500">Must include http:// or https://</p>
            </div>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Custom Code (optional)
              </label>
              <input
                type="text"
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="mycode (6-8 alphanumeric chars)"
                pattern="[A-Za-z0-9]{6,8}"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={formLoading}
              />
              <p className="mt-1 text-sm text-gray-500">6-8 alphanumeric characters (leave empty for random)</p>
            </div>
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {formError}
              </div>
            )}
            <button
              type="submit"
              disabled={formLoading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formLoading ? 'Creating...' : 'Create Short Link'}
            </button>
          </form>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading links...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && sortedLinks.length === 0 && !error && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 text-lg">
            {searchQuery ? 'No links found matching your search.' : 'No links yet. Create your first short link!'}
          </p>
        </div>
      )}

      {/* Links Table */}
      {!loading && sortedLinks.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Short Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target URL
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => toggleSort('clicks')}
                  >
                    Clicks {sortField === 'clicks' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => toggleSort('createdAt')}
                  >
                    Created {sortField === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Clicked
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/code/${link.code}`}
                        className="text-blue-600 hover:text-blue-800 font-mono font-medium"
                      >
                        {link.code}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-900 hover:text-blue-600 max-w-md truncate"
                          title={link.url}
                        >
                          {truncateUrl(link.url, 60)}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {link.clicks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(link.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(link.lastClicked)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleCopy(link.code)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        title="Copy short URL"
                      >
                        {copiedCode === link.code ? '✓ Copied' : 'Copy'}
                      </button>
                      <button
                        onClick={() => handleDelete(link.code)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <Link href="/healthz" className="hover:text-gray-700">
          System Health
        </Link>
      </footer>
    </div>
  )
}
