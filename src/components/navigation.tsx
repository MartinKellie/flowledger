'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Shield, 
  Workflow, 
  Key, 
  Settings, 
  LogOut,
  User,
  Menu,
  X,
  Server,
  Search
} from 'lucide-react'
import { useState } from 'react'
import { VersionDisplay } from '@/components/version-display'
import { SearchModal } from '@/components/search-modal'
import { useInstances } from '@/hooks/use-instances'
import { useWorkflows } from '@/hooks/use-workflows'

export function Navigation() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { instances } = useInstances()
  const { workflows } = useWorkflows()

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Shield },
    { name: 'Instances', href: '/instances', icon: Server },
    { name: 'Workflows', href: '/workflows', icon: Workflow },
    { name: 'Credentials', href: '/credentials', icon: Key },
  ]

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="relative bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 shadow-lg border-b border-emerald-300 overflow-hidden">
      {/* Sparkly Animation Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-2 left-4 w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-6 right-8 w-1 h-1 bg-white rounded-full animate-ping"></div>
        <div className="absolute top-4 left-1/4 w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
        <div className="absolute top-8 right-1/3 w-1 h-1 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-3 right-1/4 w-2 h-2 bg-white rounded-full animate-ping"></div>
        <div className="absolute top-7 left-1/3 w-1 h-1 bg-white rounded-full animate-bounce"></div>
        <div className="absolute top-5 right-1/2 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-1 left-1/2 w-1 h-1 bg-white rounded-full animate-ping"></div>
        <div className="absolute top-9 right-1/5 w-2 h-2 bg-white rounded-full animate-bounce"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-white mr-2 drop-shadow-lg" />
            <span className="text-xl font-bold text-white drop-shadow-lg">FlowLedger</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className="flex items-center space-x-2 text-white/90 hover:text-white hover:bg-white/20 px-3 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </button>
              )
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(true)}
              className="text-white/90 hover:bg-white/20 backdrop-blur-sm"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <VersionDisplay variant="minimal" className="text-xs text-white/80" />
            {session ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-white/90">
                  <User className="h-4 w-4" />
                  <span className="text-sm">
                    {session.user?.name || session.user?.email}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => router.push('/auth/signin')}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm"
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:bg-white/20"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/30 bg-gradient-to-r from-emerald-600 to-green-600">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      router.push(item.href)
                      setIsMobileMenuOpen(false)
                    }}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-white/90 hover:text-white hover:bg-white/20 rounded-md transition-all duration-200 backdrop-blur-sm"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </button>
                )
              })}
              
              <div className="border-t border-white/30 pt-3 mt-3">
                <div className="px-3 py-2">
                  <VersionDisplay variant="minimal" className="text-xs text-white/80" />
                </div>
              </div>
              
              {session ? (
                <div className="border-t border-white/30 pt-3 mt-3">
                  <div className="flex items-center space-x-2 px-3 py-2 text-sm text-white/90">
                    <User className="h-4 w-4" />
                    <span>{session.user?.name || session.user?.email}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-white/90 hover:text-white hover:bg-white/20 rounded-md transition-all duration-200 backdrop-blur-sm"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="border-t border-white/30 pt-3 mt-3">
                  <Button 
                    className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm" 
                    onClick={() => {
                      router.push('/auth/signin')
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        workflows={workflows}
        instances={instances}
      />
    </nav>
  )
}
