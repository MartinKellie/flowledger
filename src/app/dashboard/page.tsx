'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Navigation } from '@/components/navigation'
import { useInstances } from '@/hooks/use-instances'
import { useWorkflowStats } from '@/hooks/use-workflow-stats'
import { useCredentialStats } from '@/hooks/use-credential-stats'
import { useSecurityFindings } from '@/hooks/use-security-findings'
import { calculateInstanceStats, getInstanceStatusText } from '@/lib/dashboard-stats'
import { FindingDetailModal } from '@/components/finding-detail-modal'
import { ElapsedTimer } from '@/components/elapsed-timer'
import { 
  Shield, 
  Workflow, 
  Key, 
  AlertTriangle, 
  Plus,
  Activity,
  Clock,
  CheckCircle,
  RefreshCw
} from 'lucide-react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { instances, loading: instancesLoading, error: instancesError, refetch: refetchInstances } = useInstances()
  const { stats: workflowStats, loading: workflowsLoading, error: workflowsError, refetch: refetchWorkflows } = useWorkflowStats()
  const { stats: credentialStats, loading: credentialsLoading, error: credentialsError, refetch: refetchCredentials } = useCredentialStats()
  const { stats: securityStats, loading: securityLoading, error: securityError, refetch: refetchSecurity, runScan } = useSecurityFindings()
  const instanceStats = calculateInstanceStats(instances)
  
  // Modal state for finding details
  const [selectedFinding, setSelectedFinding] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Fetch detailed workflow data for proper classification
  const [detailedWorkflows, setDetailedWorkflows] = useState<any[]>([])
  
  useEffect(() => {
    const fetchDetailedWorkflows = async () => {
      if (instances.length === 0) return
      
      try {
        const workflowPromises = instances.map(async (instance) => {
          try {
            const response = await fetch(`/api/instances/${instance.id}/workflows`)
            if (!response.ok) return []
            const result = await response.json()
            return result.success && result.data ? result.data : []
          } catch (error) {
            return []
          }
        })
        
        const results = await Promise.all(workflowPromises)
        setDetailedWorkflows(results.flat())
      } catch (error) {
        console.error('Error fetching detailed workflows:', error)
      }
    }
    
    fetchDetailedWorkflows()
  }, [instances])

  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

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

  // Calculate workflow stats based on naming convention
  const activeWorkflowsCount = detailedWorkflows.filter(w => w.name?.startsWith('(') && w.isActive).length
  const inactiveWorkflowsCount = detailedWorkflows.filter(w => w.name?.startsWith('(') && !w.isActive).length
  const archivedWorkflowsCount = detailedWorkflows.filter(w => !w.name?.startsWith('(')).length
  
  // Real data from API
  const stats = {
    totalInstances: instanceStats.totalInstances,
    activeInstances: instanceStats.activeInstances,
    totalWorkflows: detailedWorkflows.length || workflowStats.totalWorkflows,
    activeWorkflows: activeWorkflowsCount,
    inactiveWorkflows: inactiveWorkflowsCount,
    archivedWorkflows: archivedWorkflowsCount,
    totalCredentials: credentialStats.totalCredentials,
    uniqueCredentials: credentialStats.uniqueCredentials,
    activeFindings: securityStats.activeFindings,
    criticalFindings: securityStats.criticalFindings,
    highFindings: securityStats.highFindings,
    mediumFindings: securityStats.mediumFindings,
    lowFindings: securityStats.lowFindings,
    lastScanDate: securityStats.lastScanDate || new Date(Date.now() - 2 * 60 * 60 * 1000)
  }

  // Get recent findings from security stats
  const recentFindings = securityStats.findings
    ?.slice(0, 10) // Show latest 10 findings
    .map(finding => ({
      id: finding.id,
      title: finding.title,
      severity: finding.severity,
      instance: instances.find(i => i.id === finding.instanceId)?.name || 'Unknown Instance',
      workflow: finding.workflowName || finding.workflowId || 'Unknown Workflow',
      createdAt: new Date(finding.createdAt),
      description: finding.description,
      type: finding.type,
      suggestion: finding.suggestion,
      metadata: finding.metadata,
    })) || []

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 shadow-xl">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-1/2 -left-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-1/2 -right-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
            
            {/* Floating particles */}
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
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

            {/* Content */}
            <div className="relative z-10">
              <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                Welcome back, {session.user?.name || session.user?.email}!
              </h1>
              <p className="text-white/90 drop-shadow">
                Here's an overview of your n8n security status
              </p>
            </div>
          </div>
          
          {/* Last Security Scan Card with Timer */}
          <Card className="bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Clock className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-emerald-900">Last Security Scan</p>
                      <p className="text-xs text-emerald-700">
                        {stats.lastScanDate.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <ElapsedTimer lastScanDate={stats.lastScanDate} />
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={runScan}
                  disabled={securityLoading}
                  className="w-full bg-white hover:bg-emerald-50 border-emerald-300"
                >
                  <Shield className="mr-2 h-3 w-3" />
                  {securityLoading ? 'Scanning...' : 'Run Scan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/instances')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Instances</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    refetchInstances()
                  }}
                  disabled={instancesLoading}
                  className="h-6 w-6 p-0 hover:bg-blue-200/50"
                >
                  <RefreshCw className={`h-3 w-3 text-blue-700 ${instancesLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Workflow className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              {instancesLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-blue-700">Loading...</span>
                </div>
              ) : instancesError ? (
                <div className="text-sm text-red-600">
                  Error loading instances
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-blue-900">{stats.totalInstances}</div>
                  <p className="text-xs text-blue-700">
                    {getInstanceStatusText(stats.totalInstances)}
                  </p>
                  {stats.totalInstances > 0 && (
                    <div className="mt-1 text-xs text-blue-600">
                      {stats.activeInstances} active
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-fuchsia-100 border-purple-200" onClick={() => router.push('/workflows')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">Workflows</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    refetchWorkflows()
                  }}
                  disabled={workflowsLoading}
                  className="h-6 w-6 p-0 hover:bg-purple-200/50"
                >
                  <RefreshCw className={`h-3 w-3 text-purple-700 ${workflowsLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Activity className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              {workflowsLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  <span className="text-sm text-purple-700">Loading...</span>
                </div>
              ) : workflowsError ? (
                <div className="text-sm text-red-600">
                  Error loading workflows
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-purple-900">{stats.totalWorkflows}</div>
                  <p className="text-xs text-purple-700">
                    Total workflows tracked
                  </p>
                  {stats.totalWorkflows > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-green-700">Active</span>
                        <span className="font-medium text-green-800">{stats.activeWorkflows}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Inactive</span>
                        <span className="font-medium text-gray-700">{stats.inactiveWorkflows}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-amber-600">Archived</span>
                        <span className="font-medium text-amber-700">{stats.archivedWorkflows}</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200" onClick={() => router.push('/credentials')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-900">Credentials</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    refetchCredentials()
                  }}
                  disabled={credentialsLoading}
                  className="h-6 w-6 p-0 hover:bg-amber-200/50"
                >
                  <RefreshCw className={`h-3 w-3 text-amber-700 ${credentialsLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Key className="h-4 w-4 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              {credentialsLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
                  <span className="text-sm text-amber-700">Loading...</span>
                </div>
              ) : credentialsError ? (
                <div className="text-sm text-red-600">
                  Error loading credentials
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-amber-900">{stats.totalCredentials}</div>
                  <p className="text-xs text-amber-700">
                    Credentials found in workflows
                  </p>
                  {stats.totalCredentials > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-amber-800">Unique</span>
                        <span className="font-medium text-amber-900">{stats.uniqueCredentials}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-amber-600">Total Usage</span>
                        <span className="font-medium text-amber-800">{stats.totalCredentials}</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-rose-100 border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-900">Security Issues</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={runScan}
                  disabled={securityLoading}
                  className="h-6 w-6 p-0 hover:bg-red-200/50"
                >
                  <RefreshCw className={`h-3 w-3 text-red-700 ${securityLoading ? 'animate-spin' : ''}`} />
                </Button>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              {securityLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  <span className="text-sm text-red-700">Scanning...</span>
                </div>
              ) : securityError ? (
                <div className="text-sm text-red-700">
                  Error loading findings
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-red-700">{stats.activeFindings}</div>
                  <p className="text-xs text-red-700">
                    Security issues detected
                  </p>
                  {stats.activeFindings > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-red-800">Critical</span>
                        <span className="font-medium text-red-900">{stats.criticalFindings}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-red-700">High</span>
                        <span className="font-medium text-red-800">{stats.highFindings}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-red-600">Medium</span>
                        <span className="font-medium text-red-700">{stats.mediumFindings}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-red-500">Low</span>
                        <span className="font-medium text-red-600">{stats.lowFindings}</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Findings - Full Width */}
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-900">Recent Security Findings</CardTitle>
            <CardDescription className="text-orange-700">
              Latest security issues detected in your workflows
            </CardDescription>
          </CardHeader>
          <CardContent>
              {securityLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                  <span className="ml-2 text-sm text-orange-700">Loading findings...</span>
                </div>
              ) : securityError ? (
                <div className="text-center py-8">
                  <div className="text-sm text-red-600 mb-2">Error loading findings</div>
                  <Button variant="outline" size="sm" onClick={refetchSecurity} className="border-orange-300 hover:bg-orange-100">
                    Try Again
                  </Button>
                </div>
              ) : recentFindings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-sm text-orange-700 mb-2">No security findings detected</div>
                  <div className="text-xs text-orange-600">Your workflows appear to be secure!</div>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-100">
                  {recentFindings.map((finding) => (
                    <div 
                      key={finding.id} 
                      className="flex items-center justify-between p-3 border border-orange-200 rounded-lg hover:bg-orange-100/50 bg-white cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedFinding(finding)
                        setIsModalOpen(true)
                      }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{finding.title}</h4>
                          <Badge 
                            variant={
                              finding.severity === 'critical' ? 'destructive' : 
                              finding.severity === 'high' ? 'destructive' :
                              finding.severity === 'medium' ? 'secondary' : 'outline'
                            }
                            className="text-xs"
                          >
                            {finding.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">
                          {finding.instance} • {finding.workflow}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {finding.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400 capitalize">
                            {finding.type.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-400">
                            {new Date(finding.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 ml-2">
                        {new Date(finding.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
      </div>
      
      {/* Finding Detail Modal */}
      {selectedFinding && (
        <FindingDetailModal
          finding={selectedFinding}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedFinding(null)
          }}
        />
      )}
    </div>
  )
}
