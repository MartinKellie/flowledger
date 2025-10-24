'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navigation } from '@/components/navigation'
import { useWorkflowStats } from '@/hooks/use-workflow-stats'
import { useInstances } from '@/hooks/use-instances'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock,
  RefreshCw,
  Filter,
  FileText,
  ChevronDown,
  ChevronUp,
  GitBranch,
  User,
  Tag,
  Boxes,
  ExternalLink,
  Archive,
  Network
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NodeNetwork } from '@/components/node-network'
import type { Workflow } from '@/types'

interface WorkflowWithInstance extends Partial<Workflow> {
  id: string
  n8nId?: string
  name: string
  description?: string
  instanceId: string
  instanceName?: string
  isActive: boolean
  tags?: string[]
  updatedAt?: string
  createdAt?: string
  nodes?: any[]
  connections?: any[]
  owner?: string
  lastExecuted?: Date | string
}

export default function WorkflowsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { stats, loading, error, refetch } = useWorkflowStats()
  const { instances } = useInstances()
  const [workflows, setWorkflows] = useState<WorkflowWithInstance[]>([])
  const [workflowsLoading, setWorkflowsLoading] = useState(true)
  const [expandedWorkflowId, setExpandedWorkflowId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'archived'>('all')
  const [showNodeNetwork, setShowNodeNetwork] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  // Fetch all workflows from all instances
  const fetchAllWorkflows = async () => {
    if (instances.length === 0) {
      setWorkflows([])
      setWorkflowsLoading(false)
      return
    }

    try {
      setWorkflowsLoading(true)
      
      const workflowPromises = instances.map(async (instance) => {
        try {
          const response = await fetch(`/api/instances/${instance.id}/workflows`)
          if (!response.ok) {
            throw new Error(`Failed to fetch workflows for ${instance.name}`)
          }
          const result = await response.json()
          
          if (result.success && result.data) {
            return result.data.map((workflow: any) => ({
              ...workflow,
              instanceName: instance.name,
            }))
          }
          return []
        } catch (error) {
          console.error(`Error fetching workflows for instance ${instance.id}:`, error)
          return []
        }
      })

      const results = await Promise.all(workflowPromises)
      const allWorkflows = results.flat()
      setWorkflows(allWorkflows)
    } catch (error) {
      console.error('Error fetching workflows:', error)
    } finally {
      setWorkflowsLoading(false)
    }
  }

  useEffect(() => {
    fetchAllWorkflows()
  }, [instances])

  const handleRefresh = () => {
    refetch()
    fetchAllWorkflows()
  }

  // Get workflow status
  const getWorkflowStatus = (workflow: WorkflowWithInstance): 'active' | 'inactive' | 'archived' => {
    const isArchived = !workflow.name.startsWith('(')
    return isArchived ? 'archived' : (workflow.isActive ? 'active' : 'inactive')
  }

  // Sort and filter workflows
  const sortedAndFilteredWorkflows = workflows
    .filter(workflow => {
      if (filterStatus === 'all') return true
      return getWorkflowStatus(workflow) === filterStatus
    })
    .sort((a, b) => {
      const statusOrder = { active: 1, inactive: 2, archived: 3 }
      const statusA = getWorkflowStatus(a)
      const statusB = getWorkflowStatus(b)
      return statusOrder[statusA] - statusOrder[statusB]
    })

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
              Workflows
            </h1>
            <p className="text-gray-600">
              Monitor and manage workflows across all your n8n instances
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowNodeNetwork(!showNodeNetwork)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Network className="mr-2 h-4 w-4" />
              {showNodeNetwork ? 'Hide' : 'Show'} Node Network
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading || workflowsLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${(loading || workflowsLoading) ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">Active Workflows</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {workflowsLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                  <span className="text-sm text-green-700">Loading...</span>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-800">
                    {workflows.filter(w => w.name.startsWith('(') && w.isActive).length}
                  </div>
                  <p className="text-xs text-green-700">
                    Currently running
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-50 to-slate-100 border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">Inactive Workflows</CardTitle>
              <XCircle className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              {workflowsLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  <span className="text-sm text-gray-700">Loading...</span>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-gray-700">
                    {workflows.filter(w => w.name.startsWith('(') && !w.isActive).length}
                  </div>
                  <p className="text-xs text-gray-700">
                    Not running
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-fuchsia-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">Total Workflows</CardTitle>
              <Activity className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              {workflowsLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  <span className="text-sm text-purple-700">Loading...</span>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-purple-900">{workflows.length}</div>
                  <p className="text-xs text-purple-700">
                    Across all instances
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-900">Archived Workflows</CardTitle>
              <Archive className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              {workflowsLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
                  <span className="text-sm text-amber-700">Loading...</span>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-amber-800">
                    {workflows.filter(w => !w.name.startsWith('(')).length}
                  </div>
                  <p className="text-xs text-amber-700">
                    Archived flows
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Node Network Modal */}
        {showNodeNetwork && (
          <NodeNetwork 
            workflows={workflows} 
            isModal={true}
            onClose={() => setShowNodeNetwork(false)}
          />
        )}

        {/* Workflows List */}
        <Card className="bg-gradient-to-br from-purple-50 to-fuchsia-100 border-purple-200">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-purple-900">Workflow Details</CardTitle>
                <CardDescription className="text-purple-700">
                  All workflows across your n8n instances
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 border rounded-md p-1 bg-white">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                  className="h-8"
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'active' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterStatus('active')}
                  className={`h-8 ${filterStatus === 'active' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Button>
                <Button
                  variant={filterStatus === 'inactive' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterStatus('inactive')}
                  className="h-8"
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Inactive
                </Button>
                <Button
                  variant={filterStatus === 'archived' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterStatus('archived')}
                  className={`h-8 ${filterStatus === 'archived' ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
                >
                  <Archive className="h-3 w-3 mr-1" />
                  Archived
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="max-h-[400px] overflow-y-auto">
            {workflowsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-2 text-sm text-purple-700">Loading workflows...</span>
              </div>
            ) : sortedAndFilteredWorkflows.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <p className="text-purple-800 mb-2">
                  {workflows.length === 0 ? 'No workflows found' : `No ${filterStatus} workflows found`}
                </p>
                <p className="text-sm text-purple-600">
                  {workflows.length === 0 
                    ? 'Add an n8n instance to start tracking workflows'
                    : 'Try selecting a different filter'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedAndFilteredWorkflows.map((workflow) => {
                  const isExpanded = expandedWorkflowId === `${workflow.instanceId}-${workflow.id}`
                  const nodeTypes = workflow.nodes 
                    ? [...new Set(workflow.nodes.map(node => node.type.split('.').pop()))]
                    : []
                  const credentialCount = workflow.nodes
                    ? workflow.nodes.filter(node => node.credentials && Object.keys(node.credentials).length > 0).length
                    : 0
                  
                  // Determine workflow status based on naming convention
                  const isArchived = !workflow.name.startsWith('(')
                  const workflowStatus = isArchived ? 'archived' : (workflow.isActive ? 'active' : 'inactive')
                  
                  return (
                    <div 
                      key={`${workflow.instanceId}-${workflow.id}`}
                      className="border border-purple-200 rounded-lg hover:shadow-md transition-all bg-white"
                    >
                      {/* Main Row - Always Visible */}
                      <div 
                        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-purple-50 transition-colors"
                        onClick={() => setExpandedWorkflowId(isExpanded ? null : `${workflow.instanceId}-${workflow.id}`)}
                      >
                        <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{workflow.name}</h3>
                          
                          <Badge 
                            variant={workflowStatus === 'active' ? "default" : "secondary"}
                            className={`flex-shrink-0 ${
                              workflowStatus === 'active' ? "bg-green-100 text-green-800 hover:bg-green-100" : 
                              workflowStatus === 'archived' ? "bg-amber-100 text-amber-800 hover:bg-amber-100" : ""
                            }`}
                          >
                            {workflowStatus === 'active' ? (
                              <><CheckCircle className="h-3 w-3 mr-1" /> Active</>
                            ) : workflowStatus === 'archived' ? (
                              <><Archive className="h-3 w-3 mr-1" /> Archived</>
                            ) : (
                              <><XCircle className="h-3 w-3 mr-1" /> Inactive</>
                            )}
                          </Badge>
                          
                          {workflow.description && (
                            <span className="text-sm text-gray-600 truncate hidden md:inline">
                              {workflow.description}
                            </span>
                          )}
                          
                          <span className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                            <Activity className="h-3 w-3" />
                            {workflow.instanceName}
                          </span>
                          
                          {workflow.tags && workflow.tags.length > 0 && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {workflow.tags.slice(0, 2).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {workflow.tags.length > 2 && (
                                <span className="text-xs text-gray-400">+{workflow.tags.length - 2}</span>
                              )}
                            </div>
                          )}
                          
                          {workflow.updatedAt && (
                            <span className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                              <Clock className="h-3 w-3" />
                              {new Date(workflow.updatedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        )}
                      </div>
                      
                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="relative overflow-hidden px-3 pb-3 pt-2 border-t border-purple-200 bg-gradient-to-br from-purple-400 via-fuchsia-500 to-purple-600">
                          {/* Animated background elements */}
                          <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute -top-1/2 -left-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                            <div className="absolute -bottom-1/2 -right-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                            <div className="absolute top-1/4 left-1/3 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                          </div>
                          
                          {/* Floating particles */}
                          <div className="absolute inset-0">
                            {[...Array(10)].map((_, i) => (
                              <div
                                key={i}
                                className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
                                style={{
                                  left: `${Math.random() * 100}%`,
                                  top: `${Math.random() * 100}%`,
                                  animationDelay: `${Math.random() * 5}s`,
                                  animationDuration: `${5 + Math.random() * 10}s`,
                                }}
                              ></div>
                            ))}
                          </div>

                          {/* View in n8n Button */}
                          <div className="relative z-10 mb-4">
                            <Button
                              size="sm"
                              className="w-full md:w-auto bg-white/90 hover:bg-white text-purple-700 border border-white"
                              onClick={(e) => {
                                e.stopPropagation()
                                const instance = instances.find(i => i.id === workflow.instanceId)
                                if (instance) {
                                  // Use n8nId if available, otherwise fall back to id
                                  const workflowId = workflow.n8nId || workflow.id
                                  const n8nUrl = `${instance.url}/workflow/${workflowId}`
                                  window.open(n8nUrl, '_blank', 'noopener,noreferrer')
                                }
                              }}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Workflow in n8n
                            </Button>
                          </div>
                          
                          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Left Column */}
                            <div className="space-y-3">
                              {workflow.description && (
                                <div>
                                  <div className="text-xs font-semibold text-white mb-1 drop-shadow">Description</div>
                                  <p className="text-sm text-white/90 drop-shadow">{workflow.description}</p>
                                </div>
                              )}
                              
                              {workflow.nodes && workflow.nodes.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-1 text-xs font-semibold text-white mb-1 drop-shadow">
                                    <Boxes className="h-3 w-3" />
                                    Nodes ({workflow.nodes.length})
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {nodeTypes.map((type, index) => (
                                      <Badge key={index} variant="outline" className="text-xs bg-white/90 border-white">
                                        {type}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {workflow.connections && workflow.connections.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-1 text-xs font-semibold text-white drop-shadow">
                                    <GitBranch className="h-3 w-3" />
                                    Connections: {workflow.connections.length}
                                  </div>
                                </div>
                              )}
                              
                              {credentialCount > 0 && (
                                <div>
                                  <div className="flex items-center gap-1 text-xs font-semibold text-white drop-shadow">
                                    <User className="h-3 w-3" />
                                    Credentials Used: {credentialCount}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Right Column */}
                            <div className="space-y-3">
                              {workflow.tags && workflow.tags.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-1 text-xs font-semibold text-white mb-1 drop-shadow">
                                    <Tag className="h-3 w-3" />
                                    All Tags
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {workflow.tags.map((tag, index) => (
                                      <Badge key={index} variant="outline" className="text-xs bg-white/90 border-white">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {workflow.owner && (
                                <div>
                                  <div className="text-xs font-semibold text-white mb-1 drop-shadow">Owner</div>
                                  <p className="text-sm text-white/90 drop-shadow">{workflow.owner}</p>
                                </div>
                              )}
                              
                              <div>
                                <div className="text-xs font-semibold text-white mb-1 drop-shadow">Timestamps</div>
                                <div className="space-y-1 text-xs text-white/90 drop-shadow">
                                  <div>Created: {new Date(workflow.createdAt || '').toLocaleString()}</div>
                                  <div>Updated: {new Date(workflow.updatedAt || '').toLocaleString()}</div>
                                  {workflow.lastExecuted && (
                                    <div>Last Executed: {new Date(workflow.lastExecuted).toLocaleString()}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

