'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Navigation } from '@/components/navigation'
import { 
  ArrowLeft, 
  Server, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ExternalLink,
  Save,
  Trash2,
  RefreshCw,
  Workflow as WorkflowIcon,
  Key,
  Shield
} from 'lucide-react'

interface InstanceData {
  id: string
  name: string
  url: string
  apiKey: string
  environment: 'production' | 'staging' | 'development'
  isActive: boolean
  version?: string
  createdAt: string
  updatedAt: string
}

interface InstanceStats {
  totalWorkflows: number
  activeWorkflows: number
  inactiveWorkflows: number
  totalCredentials: number
  activeFindings: number
  lastScanned?: Date
}

export default function InstanceDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const instanceId = params.id as string

  const [instance, setInstance] = useState<InstanceData | null>(null)
  const [stats, setStats] = useState<InstanceStats>({
    totalWorkflows: 0,
    activeWorkflows: 0,
    inactiveWorkflows: 0,
    totalCredentials: 0,
    activeFindings: 0
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    apiKey: '',
    environment: 'development' as 'production' | 'staging' | 'development'
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  // Fetch instance details
  useEffect(() => {
    if (!instanceId) return

    const fetchInstance = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/instances/${instanceId}`)
        const result = await response.json()

        if (result.success) {
          setInstance(result.data)
          setFormData({
            name: result.data.name,
            url: result.data.url,
            apiKey: result.data.apiKey,
            environment: result.data.environment
          })

          // Fetch stats
          await fetchStats()
        } else {
          setError('Instance not found')
        }
      } catch (error) {
        console.error('Failed to fetch instance:', error)
        setError('Failed to load instance details')
      } finally {
        setLoading(false)
      }
    }

    fetchInstance()
  }, [instanceId])

  const fetchStats = async () => {
    try {
      const [workflowsResponse, credentialsResponse] = await Promise.all([
        fetch(`/api/instances/${instanceId}/workflows`),
        fetch(`/api/instances/${instanceId}/credentials`)
      ])

      const workflowsResult = await workflowsResponse.json()
      const credentialsResult = await credentialsResponse.json()

      setStats({
        totalWorkflows: workflowsResult.success ? workflowsResult.breakdown?.total || 0 : 0,
        activeWorkflows: workflowsResult.success ? workflowsResult.breakdown?.active || 0 : 0,
        inactiveWorkflows: workflowsResult.success ? workflowsResult.breakdown?.inactive || 0 : 0,
        totalCredentials: credentialsResult.success ? credentialsResult.count : 0,
        activeFindings: 0
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/instances/${instanceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        setInstance(result.data)
        alert('Instance updated successfully!')
      } else {
        setError(result.error || result.message || 'Failed to update instance')
        alert(`Failed to update instance: ${result.error || result.message}`)
      }
    } catch (error) {
      console.error('Failed to update instance:', error)
      setError('Failed to update instance')
      alert('Failed to update instance')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this instance? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/instances/${instanceId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        alert('Instance deleted successfully!')
        router.push('/instances')
      } else {
        alert(`Failed to delete instance: ${result.error}`)
      }
    } catch (error) {
      console.error('Failed to delete instance:', error)
      alert('Failed to delete instance')
    }
  }

  const handleScan = async () => {
    try {
      setScanning(true)
      const response = await fetch(`/api/instances/${instanceId}/scan`, {
        method: 'POST'
      })
      const result = await response.json()

      if (result.success) {
        alert('Scan completed successfully!')
        await fetchStats()
      } else {
        alert(`Scan failed: ${result.message || result.error}`)
      }
    } catch (error) {
      console.error('Scan error:', error)
      alert('Scan failed')
    } finally {
      setScanning(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (error && !instance) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-red-600">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{error}</p>
              <Button onClick={() => router.push('/instances')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Instances
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case 'production':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'staging':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'development':
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/instances')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {instance?.name || 'Loading...'}
              </h1>
              <p className="text-gray-600">
                Manage instance settings and view statistics
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {instance?.isActive ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <Badge className={getEnvironmentColor(instance?.environment || 'development')}>
              {instance?.environment}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workflows</CardTitle>
              <WorkflowIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWorkflows}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeWorkflows} active, {stats.inactiveWorkflows} inactive
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credentials</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCredentials}</div>
              <p className="text-xs text-muted-foreground">Total credentials</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Findings</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeFindings}</div>
              <p className="text-xs text-muted-foreground">Active findings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actions</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleScan}
                disabled={scanning}
                size="sm"
                className="w-full"
              >
                {scanning ? (
                  <>
                    <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mr-2 h-3 w-3" />
                    Run Scan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Instance Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settings Form */}
          <Card>
            <CardHeader>
              <CardTitle>Instance Settings</CardTitle>
              <CardDescription>
                Update your instance configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Instance Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My n8n Instance"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">Instance URL</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://n8n.example.com"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(formData.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="n8n_api_*******************"
                />
                <p className="text-xs text-gray-500">
                  Your API key is stored securely and only used to connect to your n8n instance.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="environment">Environment</Label>
                <select
                  id="environment"
                  value={formData.environment}
                  onChange={(e) => setFormData({ ...formData, environment: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instance Information */}
          <Card>
            <CardHeader>
              <CardTitle>Instance Information</CardTitle>
              <CardDescription>
                View instance details and metadata
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-600">Instance ID</Label>
                <p className="text-sm font-mono bg-gray-50 p-2 rounded border">
                  {instance?.id}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-600">Status</Label>
                <div className="flex items-center space-x-2">
                  {instance?.isActive ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Inactive</span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-600">Created</Label>
                <p className="text-sm">
                  {instance?.createdAt ? new Date(instance.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-600">Last Updated</Label>
                <p className="text-sm">
                  {instance?.updatedAt ? new Date(instance.updatedAt).toLocaleString() : 'N/A'}
                </p>
              </div>

              {/* Danger Zone */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Deleting this instance will remove all associated data and cannot be undone.
                </p>
                <Button
                  onClick={handleDelete}
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Instance
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

