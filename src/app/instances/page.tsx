'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Navigation } from '@/components/navigation'
import { 
  Plus, 
  Server, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ExternalLink,
  Settings,
  Trash2
} from 'lucide-react'

export default function InstancesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [instances, setInstances] = useState<any[]>([])

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  // Fetch instances from API
  useEffect(() => {
    const fetchInstances = async () => {
      try {
        const response = await fetch('/api/instances')
        const result = await response.json()
        
        if (result.success && result.data.length > 0) {
          // Fetch real data for each instance
          const instancesWithRealData = await Promise.all(
            result.data.map(async (instance: any) => {
              try {
                // Fetch real workflows and credentials
                const [workflowsResponse, credentialsResponse] = await Promise.all([
                  fetch(`/api/instances/${instance.id}/workflows`),
                  fetch(`/api/instances/${instance.id}/credentials`)
                ])
                
                const workflowsResult = await workflowsResponse.json()
                const credentialsResult = await credentialsResponse.json()
                
                return {
                  ...instance,
                  totalWorkflows: workflowsResult.success ? workflowsResult.breakdown?.total || 0 : 0,
                  activeWorkflows: workflowsResult.success ? workflowsResult.breakdown?.active || 0 : 0,
                  inactiveWorkflows: workflowsResult.success ? workflowsResult.breakdown?.inactive || 0 : 0,
                  totalCredentials: credentialsResult.success ? credentialsResult.count : 0,
                  activeFindings: 0, // Will be updated after scan
                  lastScanned: instance.lastScanned || new Date(Date.now() - 24 * 60 * 60 * 1000),
                }
              } catch (error) {
                console.error(`Failed to fetch data for instance ${instance.id}:`, error)
                return {
                  ...instance,
                  totalWorkflows: 0,
                  totalCredentials: 0,
                  activeFindings: 0,
                  lastScanned: new Date(Date.now() - 24 * 60 * 60 * 1000),
                }
              }
            })
          )
          setInstances(instancesWithRealData)
        } else {
          // No instances yet
          setInstances([])
        }
      } catch (error) {
        console.error('Failed to fetch instances:', error)
        setInstances([])
      }
    }

    fetchInstances()
  }, [])

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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              n8n Instances
            </h1>
            <p className="text-gray-600">
              Manage your n8n instances and monitor their security status
            </p>
          </div>
          <Button onClick={() => router.push('/instances/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Instance
          </Button>
        </div>

        {/* Instances Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instances.map((instance) => (
            <Card key={instance.id} className="hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Server className="h-5 w-5 text-blue-700" />
                    <CardTitle className="text-lg text-blue-900">{instance.name}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    {instance.isActive ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <Badge className={getEnvironmentColor(instance.environment)}>
                      {instance.environment}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="flex items-center space-x-2 text-blue-700">
                  <ExternalLink className="h-3 w-3" />
                  <span className="text-xs">{instance.url}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-700">
                        {instance.totalWorkflows}
                      </div>
                      <div className="text-xs text-blue-800">Total Workflows</div>
                      <div className="text-xs text-blue-700">
                        {instance.activeWorkflows} active
                      </div>
                      <div className="text-xs text-blue-600">
                        {instance.inactiveWorkflows} inactive
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-700">
                        {instance.totalCredentials}
                      </div>
                      <div className="text-xs text-blue-800">Credentials</div>
                      <div className="text-2xl font-bold text-blue-700 mt-2">
                        {instance.activeFindings}
                      </div>
                      <div className="text-xs text-blue-800">Findings</div>
                    </div>
                  </div>

                  {/* Last Scan */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-700">Last Scan:</span>
                    <span className="text-blue-900">
                      {instance.lastScanned.toLocaleString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => router.push(`/instances/${instance.id}`)}
                    >
                      <Settings className="mr-1 h-3 w-3" />
                      Manage
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        console.log(`Starting security scan for: ${instance.name}`)
                        try {
                          const response = await fetch(`/api/instances/${instance.id}/scan`, {
                            method: 'POST',
                          })
                          const result = await response.json()
                          
                          if (result.success) {
                            console.log('Scan completed:', result.data)
                            const stats = result.data.stats
                            alert(`Scan completed!\n\nWorkflows:\n- ${stats.workflows.total} total\n- ${stats.workflows.active} active\n- ${stats.workflows.inactive} inactive\n\nCredentials: ${stats.totalCredentials}\nSecurity Findings: ${stats.activeFindings}\n\nCheck console for details.`)
                            
                            // Refresh the instances to show updated data
                            window.location.reload()
                          } else {
                            console.error('Scan failed:', result)
                            alert(`Scan failed: ${result.message || result.error || 'Unknown error'}`)
                          }
                        } catch (error) {
                          console.error('Scan error:', error)
                          alert(`Scan failed: ${error}`)
                        }
                      }}
                    >
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Scan
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {instances.length === 0 && (
          <Card className="text-center py-12 bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200">
            <CardContent>
              <Server className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <CardTitle className="text-xl mb-2 text-blue-900">No n8n Instances</CardTitle>
              <CardDescription className="mb-6 text-blue-700">
                Get started by adding your first n8n instance to begin monitoring workflows and credentials.
              </CardDescription>
              <Button onClick={() => router.push('/instances/new')} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Instance
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
