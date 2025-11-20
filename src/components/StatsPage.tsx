'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDate, copyToClipboard } from '@/lib/utils'

interface LinkData {
  id: string
  code: string
  url: string
  clicks: number
  createdAt: string
  lastClicked: string | null
}

export default function StatsPage({ code }: { code: string }) {
  const router = useRouter()
  const [link, setLink] = useState<LinkData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const shortUrl = `${baseUrl}/${code}`

  useEffect(() => {
    fetchLinkStats()
  }, [code])

  const fetchLinkStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/links/${code}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Link not found')
        }
        throw new Error('Failed to fetch link stats')
      }
      const data = await response.json()
      setLink(data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to load link stats')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await copyToClipboard(shortUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      alert('Failed to copy to clipboard')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this link?')) return

    try {
      const response = await fetch(`/api/links/${code}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete link')

      router.push('/')
    } catch (err) {
      alert('Failed to delete link. Please try again.')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading link statistics...</p>
        </div>
      </div>
    )
  }

  if (error || !link) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-red-900 mb-2">Link Not Found</h2>
          <p className="text-red-700 mb-4">
            {error || 'The link you are looking for does not exist.'}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
          ← Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Link Statistics</h1>
        <p className="text-gray-600">Detailed information for short code: <span className="font-mono font-semibold">{code}</span></p>
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        {/* Short URL */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-500 mb-2">Short URL</label>
          <div className="flex items-center gap-3">
            <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-lg text-gray-900">
              {shortUrl}
            </div>
            <button
              onClick={handleCopy}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Target URL */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-500 mb-2">Target URL</label>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 hover:underline break-all"
          >
            {link.url}
          </a>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
            <div className="text-sm font-medium text-blue-800 mb-1">Total Clicks</div>
            <div className="text-4xl font-bold text-blue-900">{link.clicks}</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
            <div className="text-sm font-medium text-green-800 mb-1">Created</div>
            <div className="text-lg font-semibold text-green-900">{formatDate(link.createdAt)}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
            <div className="text-sm font-medium text-purple-800 mb-1">Last Clicked</div>
            <div className="text-lg font-semibold text-purple-900">{formatDate(link.lastClicked)}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-6 border-t border-gray-200">
          <button
            onClick={handleDelete}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Delete Link
          </button>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">About This Link</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Link ID: <span className="font-mono">{link.id}</span></li>
          <li>• Short Code: <span className="font-mono">{link.code}</span></li>
          <li>• Every time someone visits <span className="font-mono">{shortUrl}</span>, they'll be redirected to the target URL and the click count will increase.</li>
        </ul>
      </div>
    </div>
  )
}