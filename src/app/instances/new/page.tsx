'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Navigation } from '@/components/navigation'
import { ArrowLeft, Server, CheckCircle, XCircle } from 'lucide-react'

export default function AddInstancePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    environment: 'development',
    apiKey: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    console.log('Add instance page mounted')
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted with data:', formData)
    alert('Form submitted! Check console for details.')
    setIsLoading(true)
    setError('')

    try {
      console.log('Sending request to /api/instances')
      const response = await fetch('/api/instances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      console.log('Response status:', response.status)
      const result = await response.json()
      console.log('Response result:', result)

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add instance')
      }

      // Redirect to instances page
      router.push('/instances')
    } catch (error) {
      console.error('Error submitting form:', error)
      setError(error instanceof Error ? error.message : 'Failed to add instance. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const testConnection = async () => {
    console.log('Testing connection with:', { url: formData.url, apiKey: formData.apiKey })
    alert('Testing connection! Check console for details.')
    setConnectionStatus('testing')
    setError('')

    try {
      console.log('Sending test connection request')
      const response = await fetch('/api/instances/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: formData.url,
          apiKey: formData.apiKey,
        }),
      })

      console.log('Test connection response status:', response.status)
      const result = await response.json()
      console.log('Test connection result:', result)

      if (result.success) {
        setConnectionStatus('success')
        setError('') // Clear any previous errors
      } else {
        setConnectionStatus('error')
        setError(result.message || 'Failed to connect to n8n instance. Please check your URL and API key.')
      }
    } catch (error) {
      console.error('Test connection error:', error)
      setConnectionStatus('error')
      setError('Connection test failed.')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Add n8n Instance
            </h1>
            <p className="text-gray-600">
              Connect a new n8n instance to start monitoring workflows and credentials
            </p>
          </div>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Instance Details</CardTitle>
              <CardDescription>
                Provide the details for your n8n instance. We'll test the connection before saving.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Instance Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Instance Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Production n8n"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                {/* URL */}
                <div className="space-y-2">
                  <Label htmlFor="url">n8n URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://n8n.yourcompany.com"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    required
                  />
                </div>

                {/* Environment */}
                <div className="space-y-2">
                  <Label htmlFor="environment">Environment</Label>
                  <select
                    id="environment"
                    className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={formData.environment}
                    onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                  >
                    <option value="development">Development</option>
                    <option value="staging">Staging</option>
                    <option value="production">Production</option>
                  </select>
                </div>

                {/* API Key */}
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Your n8n API key"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-600">
                    You can find your API key in n8n Settings → Personal Access Tokens
                  </p>
                </div>

                {/* Connection Test */}
                <div className="space-y-2">
                  <Label>Connection Test</Label>
                  <div className="flex items-center space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={testConnection}
                      disabled={!formData.url || !formData.apiKey || connectionStatus === 'testing'}
                    >
                      <Server className="mr-2 h-4 w-4" />
                      {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                    </Button>
                    
                    {connectionStatus === 'success' && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm">Connection successful</span>
                      </div>
                    )}
                    
                    {connectionStatus === 'error' && (
                      <div className="flex items-center text-red-600">
                        <XCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm">Connection failed</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Adding Instance...' : 'Add Instance'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
