'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navigation } from '@/components/navigation'
import { useCredentialStats } from '@/hooks/use-credential-stats'
import { useInstances } from '@/hooks/use-instances'
import { Badge } from '@/components/ui/badge'
import { CredentialDetailModal } from '@/components/credential-detail-modal'
import { 
  Key, 
  RefreshCw,
  Filter,
  Shield,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Credential {
  id: string
  name: string
  type: string
  instanceId: string
  instanceName?: string
  usageCount: number
  workflowNames: string[]
}

export default function CredentialsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { stats, loading, error, refetch } = useCredentialStats()
  const { instances } = useInstances()
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [credentialsLoading, setCredentialsLoading] = useState(true)
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  // Fetch all credentials from all instances
  const fetchAllCredentials = async () => {
    if (instances.length === 0) {
      setCredentials([])
      setCredentialsLoading(false)
      return
    }

    try {
      setCredentialsLoading(true)
      
      // Fetch credentials from workflows (primary source) and n8n API (if available)
      const workflowPromises = instances.map(async (instance) => {
        try {
          // Fetch workflows to extract credentials
          const workflowResponse = await fetch(`/api/instances/${instance.id}/workflows`)
          const workflowResult = await workflowResponse.json()
          
          const credentialsMap = new Map<string, Credential>()
          
          // Extract credentials from workflows - this is our primary source
          if (workflowResult.success && workflowResult.data) {
            workflowResult.data.forEach((workflow: any) => {
              if (workflow.nodes && Array.isArray(workflow.nodes)) {
                workflow.nodes.forEach((node: any) => {
                  // The API transforms credentials to an array of credential names/IDs
                  if (node.credentials && Array.isArray(node.credentials)) {
                    node.credentials.forEach((credentialName: string) => {
                      // Use the credential name as the ID (this is what we get from the API)
                      const credId = String(credentialName)
                      
                      if (!credentialsMap.has(credId)) {
                        credentialsMap.set(credId, {
                          id: credId,
                          name: credentialName,
                          type: node.type || 'Unknown',
                          instanceId: instance.id,
                          instanceName: instance.name,
                          usageCount: 0,
                          workflowNames: []
                        })
                      }
                      
                      const cred = credentialsMap.get(credId)!
                      cred.usageCount++
                      if (!cred.workflowNames.includes(workflow.name)) {
                        cred.workflowNames.push(workflow.name)
                      }
                    })
                  }
                })
              }
            })
          }
          
          // Try to fetch from n8n credentials API to enrich data (optional)
          try {
            const credResponse = await fetch(`/api/instances/${instance.id}/credentials`)
            const credResult = await credResponse.json()
            
            if (credResult.success && credResult.data && Array.isArray(credResult.data)) {
              credResult.data.forEach((cred: any) => {
                const credId = String(cred.id)
                if (credentialsMap.has(credId)) {
                  // Update existing credential with more accurate data from API
                  const existing = credentialsMap.get(credId)!
                  existing.name = cred.name || existing.name
                  existing.type = cred.type || existing.type
                } else {
                  // Add credential from API that wasn't found in workflows
                  credentialsMap.set(credId, {
                    id: credId,
                    name: cred.name,
                    type: cred.type,
                    instanceId: instance.id,
                    instanceName: instance.name,
                    usageCount: 0,
                    workflowNames: []
                  })
                }
              })
            }
          } catch (credError) {
            // Credentials API not available, using workflow data only
          }
          
          return Array.from(credentialsMap.values())
        } catch (error) {
          console.error(`Error fetching credentials for instance ${instance.id}:`, error)
          return []
        }
      })

      const results = await Promise.all(workflowPromises)
      const allCredentials = results.flat()
      setCredentials(allCredentials)
    } catch (error) {
      console.error('Error fetching credentials:', error)
    } finally {
      setCredentialsLoading(false)
    }
  }

  useEffect(() => {
    fetchAllCredentials()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instances])

  const handleRefresh = () => {
    refetch()
    fetchAllCredentials()
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Credentials
            </h1>
            <p className="text-gray-600">
              Monitor and manage credentials across all your n8n instances
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading || credentialsLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${(loading || credentialsLoading) ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-900">Total Credentials</CardTitle>
              <Key className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
                  <span className="text-sm text-amber-700">Loading...</span>
                </div>
              ) : error ? (
                <div className="text-sm text-red-600">Error loading data</div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-amber-900">{stats.totalCredentials}</div>
                  <p className="text-xs text-amber-700">
                    Credentials found in workflows
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-900">Unique Credentials</CardTitle>
              <Shield className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
                  <span className="text-sm text-amber-700">Loading...</span>
                </div>
              ) : error ? (
                <div className="text-sm text-red-600">Error loading data</div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-amber-800">{stats.uniqueCredentials}</div>
                  <p className="text-xs text-amber-700">
                    Distinct credentials
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-900">Credentials in Use</CardTitle>
              <Activity className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
                  <span className="text-sm text-amber-700">Loading...</span>
                </div>
              ) : error ? (
                <div className="text-sm text-red-600">Error loading data</div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-amber-800">{stats.credentialsUsedInWorkflows}</div>
                  <p className="text-xs text-amber-700">
                    Active in workflows
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Credentials List */}
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-900">Credential Details</CardTitle>
            <CardDescription className="text-amber-700">
              All credentials across your n8n instances
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[500px] overflow-y-auto">
            {credentialsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                <span className="ml-2 text-sm text-amber-700">Loading credentials...</span>
              </div>
            ) : credentials.length === 0 ? (
              <div className="text-center py-12">
                <Key className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                <p className="text-amber-800 mb-2">No credentials found</p>
                <p className="text-sm text-amber-600">
                  Add workflows with credentials to start tracking
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {credentials.map((credential) => (
                  <div 
                    key={`${credential.instanceId}-${credential.id}`}
                    className="flex items-center gap-3 p-4 border border-amber-200 rounded-lg hover:bg-amber-100/50 hover:shadow-md transition-all cursor-pointer bg-white"
                    onClick={() => {
                      setSelectedCredential(credential)
                      setIsModalOpen(true)
                    }}
                  >
                    <Key className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{credential.name}</h3>
                        
                        <Badge variant="outline" className="flex-shrink-0">
                          {credential.type}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {credential.instanceName}
                        </span>
                        
                        <span className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          Used in {credential.usageCount} {credential.usageCount === 1 ? 'place' : 'places'}
                        </span>
                      </div>
                      
                      {credential.workflowNames.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Used in workflows:</p>
                          <div className="flex flex-wrap gap-1">
                            {credential.workflowNames.slice(0, 3).map((workflowName, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {workflowName}
                              </Badge>
                            ))}
                            {credential.workflowNames.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{credential.workflowNames.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Credential Detail Modal */}
      <CredentialDetailModal
        credential={selectedCredential}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedCredential(null)
        }}
      />
    </div>
  )
}

