export const APP_NAME = 'FlowLedger'
export const APP_DESCRIPTION = 'A comprehensive project tracker for n8n workflows and API keys'

export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const

export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const

export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
} as const

export const SECURITY_FINDING_TYPES = {
  PLAINTEXT: 'plaintext',
  SHARED_KEY: 'shared_key',
  DEPRECATED: 'deprecated',
  UNUSED: 'unused',
  WEAK_AUTH: 'weak_auth',
} as const

export const NOTIFICATION_TYPES = {
  SECURITY: 'security',
  SCAN: 'scan',
  SYSTEM: 'system',
} as const

export const SCAN_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const

export const API_ENDPOINTS = {
  INSTANCES: '/api/instances',
  WORKFLOWS: '/api/workflows',
  CREDENTIALS: '/api/credentials',
  FINDINGS: '/api/findings',
  SCANS: '/api/scans',
  NOTIFICATIONS: '/api/notifications',
  AUTH: '/api/auth',
} as const

export const N8N_NODE_TYPES = {
  HTTP_REQUEST: 'n8n-nodes-base.httpRequest',
  WEBHOOK: 'n8n-nodes-base.webhook',
  SCHEDULE: 'n8n-nodes-base.schedule',
  MANUAL_TRIGGER: 'n8n-nodes-base.manualTrigger',
  SET: 'n8n-nodes-base.set',
  IF: 'n8n-nodes-base.if',
  SWITCH: 'n8n-nodes-base.switch',
  MERGE: 'n8n-nodes-base.merge',
  SPLIT_IN_BATCHES: 'n8n-nodes-base.splitInBatches',
  WAIT: 'n8n-nodes-base.wait',
  STOP_AND_ERROR: 'n8n-nodes-base.stopAndError',
} as const

export const DEPRECATED_NODES = [
  'n8n-nodes-base.ftp',
  'n8n-nodes-base.sftp',
  'n8n-nodes-base.httpRequest', // Deprecated in favour of HTTP Request v2
] as const

export const CREDENTIAL_TYPES = {
  HTTP_HEADER_AUTH: 'httpHeaderAuth',
  HTTP_BASIC_AUTH: 'httpBasicAuth',
  HTTP_DIGEST_AUTH: 'httpDigestAuth',
  OAUTH2_API: 'oAuth2Api',
  API_KEY: 'apiKey',
  BEARER_TOKEN: 'bearerToken',
  AWS: 'aws',
  GOOGLE_SHEETS: 'googleSheetsOAuth2Api',
  SLACK: 'slackOAuth2Api',
  SALESFORCE: 'salesforceOAuth2Api',
  SHOPIFY: 'shopifyOAuth2Api',
  STRIPE: 'stripeApi',
  TWILIO: 'twilioApi',
  ZOOM: 'zoomOAuth2Api',
} as const

export const SECURITY_PATTERNS = {
  PLAINTEXT_PASSWORD: /password\s*[:=]\s*["']?[^"'\s]+["']?/i,
  PLAINTEXT_API_KEY: /api[_-]?key\s*[:=]\s*["']?[^"'\s]+["']?/i,
  PLAINTEXT_SECRET: /secret\s*[:=]\s*["']?[^"'\s]+["']?/i,
  PLAINTEXT_TOKEN: /token\s*[:=]\s*["']?[^"'\s]+["']?/i,
  HTTP_URL: /http:\/\//i,
  BASIC_AUTH: /basic\s+auth/i,
  BEARER_TOKEN: /bearer\s+token/i,
} as const

export const EMAIL_TEMPLATES = {
  SECURITY_ALERT: 'security-alert',
  SCAN_COMPLETE: 'scan-complete',
  MAGIC_LINK: 'magic-link',
  NOTIFICATION: 'notification',
} as const

export const CACHE_KEYS = {
  USER: 'user',
  INSTANCES: 'instances',
  WORKFLOWS: 'workflows',
  CREDENTIALS: 'credentials',
  FINDINGS: 'findings',
  SCANS: 'scans',
  NOTIFICATIONS: 'notifications',
  DASHBOARD_STATS: 'dashboard-stats',
} as const

export const CACHE_TTL = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 60 * 60 * 1000, // 1 hour
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
} as const

export const RATE_LIMITS = {
  API_REQUESTS: 100, // per minute
  EMAIL_SENDS: 10, // per minute
  SCAN_REQUESTS: 5, // per minute
} as const

export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
} as const

export const VALIDATION_RULES = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 1,
  MAX_NAME_LENGTH: 100,
  MIN_DESCRIPTION_LENGTH: 0,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_TAGS: 10,
  MAX_TAG_LENGTH: 50,
} as const

export const UI_CONSTANTS = {
  TOAST_DURATION: 5000,
  MODAL_ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
} as const

export const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Please enter a valid email address',
  REQUIRED_FIELD: 'This field is required',
  INVALID_URL: 'Please enter a valid URL',
  INVALID_API_KEY: 'Please enter a valid API key',
  CONNECTION_FAILED: 'Failed to connect to n8n instance',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  SERVER_ERROR: 'Internal server error',
  NETWORK_ERROR: 'Network error occurred',
  TIMEOUT_ERROR: 'Request timeout',
  VALIDATION_ERROR: 'Validation error',
  AUTHENTICATION_REQUIRED: 'Authentication required',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
} as const

export const SUCCESS_MESSAGES = {
  INSTANCE_CREATED: 'n8n instance added successfully',
  INSTANCE_UPDATED: 'n8n instance updated successfully',
  INSTANCE_DELETED: 'n8n instance deleted successfully',
  WORKFLOW_SCANNED: 'Workflow scanned successfully',
  CREDENTIAL_ADDED: 'Credential added successfully',
  CREDENTIAL_UPDATED: 'Credential updated successfully',
  CREDENTIAL_DELETED: 'Credential deleted successfully',
  SCAN_STARTED: 'Security scan started',
  SCAN_COMPLETED: 'Security scan completed',
  FINDING_RESOLVED: 'Security finding resolved',
  NOTIFICATION_SENT: 'Notification sent successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
} as const

export const INFO_MESSAGES = {
  SCAN_IN_PROGRESS: 'Security scan is in progress',
  NO_FINDINGS: 'No security findings detected',
  ALL_FINDINGS_RESOLVED: 'All security findings have been resolved',
  INSTANCE_OFFLINE: 'n8n instance is offline',
  INSTANCE_ONLINE: 'n8n instance is online',
  LAST_SCAN_OLD: 'Last scan was more than 24 hours ago',
} as const

export const WARNING_MESSAGES = {
  CRITICAL_FINDINGS: 'Critical security findings detected',
  HIGH_FINDINGS: 'High severity findings detected',
  DEPRECATED_NODES: 'Deprecated nodes detected in workflows',
  UNUSED_CREDENTIALS: 'Unused credentials detected',
  WEAK_AUTHENTICATION: 'Weak authentication methods detected',
  PLAINTEXT_CREDENTIALS: 'Plaintext credentials detected',
  SHARED_CREDENTIALS: 'Shared credentials detected',
} as const

