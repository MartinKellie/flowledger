/**
 * Application version configuration
 * Update this file to change the version displayed across the application
 */

export const APP_VERSION = '1.2.0'
export const APP_NAME = 'FlowLedger'
export const APP_DESCRIPTION = 'n8n Workflow Security Tracker'

export interface VersionInfo {
  version: string
  name: string
  description: string
  buildDate: string
  buildTime: string
}

export const getVersionInfo = (): VersionInfo => {
  const now = new Date()
  return {
    version: APP_VERSION,
    name: APP_NAME,
    description: APP_DESCRIPTION,
    buildDate: now.toISOString().split('T')[0],
    buildTime: now.toTimeString().split(' ')[0]
  }
}

export const getVersionString = (): string => {
  return `v${APP_VERSION}`
}

export const getFullVersionString = (): string => {
  const info = getVersionInfo()
  return `${info.name} ${getVersionString()}`
}
