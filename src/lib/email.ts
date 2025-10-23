import { Resend } from 'resend'
import { SecurityFinding, Notification } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailTemplate {
  to: string
  subject: string
  html: string
  text?: string
}

export class EmailService {
  private from = 'FlowLedger <noreply@flowledger.app>'

  // Send security alert email
  async sendSecurityAlert(
    to: string,
    findings: SecurityFinding[],
    instanceName: string
  ): Promise<boolean> {
    try {
      const criticalFindings = findings.filter(f => f.severity === 'critical')
      const highFindings = findings.filter(f => f.severity === 'high')
      
      const subject = `🚨 Security Alert: ${criticalFindings.length} critical findings in ${instanceName}`
      
      const html = this.generateSecurityAlertHtml(findings, instanceName)
      const text = this.generateSecurityAlertText(findings, instanceName)

      await resend.emails.send({
        from: this.from,
        to,
        subject,
        html,
        text,
      })

      return true
    } catch (error) {
      console.error('Failed to send security alert email:', error)
      return false
    }
  }

  // Send scan completion email
  async sendScanCompletion(
    to: string,
    instanceName: string,
    totalFindings: number,
    criticalFindings: number
  ): Promise<boolean> {
    try {
      const subject = `✅ Scan Complete: ${totalFindings} findings in ${instanceName}`
      
      const html = this.generateScanCompletionHtml(
        instanceName,
        totalFindings,
        criticalFindings
      )
      const text = this.generateScanCompletionText(
        instanceName,
        totalFindings,
        criticalFindings
      )

      await resend.emails.send({
        from: this.from,
        to,
        subject,
        html,
        text,
      })

      return true
    } catch (error) {
      console.error('Failed to send scan completion email:', error)
      return false
    }
  }

  // Send notification email
  async sendNotification(
    to: string,
    notification: Notification
  ): Promise<boolean> {
    try {
      const subject = `🔔 FlowLedger: ${notification.title}`
      
      const html = this.generateNotificationHtml(notification)
      const text = this.generateNotificationText(notification)

      await resend.emails.send({
        from: this.from,
        to,
        subject,
        html,
        text,
      })

      return true
    } catch (error) {
      console.error('Failed to send notification email:', error)
      return false
    }
  }

  // Send magic link for authentication
  async sendMagicLink(to: string, token: string): Promise<boolean> {
    try {
      const url = `${process.env.NEXTAUTH_URL}/auth/callback?token=${token}`
      
      const html = this.generateMagicLinkHtml(url)
      const text = this.generateMagicLinkText(url)

      await resend.emails.send({
        from: this.from,
        to,
        subject: '🔗 Sign in to FlowLedger',
        html,
        text,
      })

      return true
    } catch (error) {
      console.error('Failed to send magic link email:', error)
      return false
    }
  }

  // Generate security alert HTML
  private generateSecurityAlertHtml(
    findings: SecurityFinding[],
    instanceName: string
  ): string {
    const criticalCount = findings.filter(f => f.severity === 'critical').length
    const highCount = findings.filter(f => f.severity === 'high').length
    const mediumCount = findings.filter(f => f.severity === 'medium').length
    const lowCount = findings.filter(f => f.severity === 'low').length

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Security Alert - FlowLedger</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .finding { background: white; margin: 10px 0; padding: 15px; border-left: 4px solid #dc2626; }
            .critical { border-left-color: #dc2626; }
            .high { border-left-color: #f59e0b; }
            .medium { border-left-color: #3b82f6; }
            .low { border-left-color: #10b981; }
            .severity { font-weight: bold; text-transform: uppercase; }
            .summary { background: #1f2937; color: white; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 Security Alert</h1>
              <p>${instanceName}</p>
            </div>
            <div class="content">
              <div class="summary">
                <h2>Summary</h2>
                <p><strong>${criticalCount}</strong> Critical • <strong>${highCount}</strong> High • <strong>${mediumCount}</strong> Medium • <strong>${lowCount}</strong> Low</p>
              </div>
              
              <h2>Security Findings</h2>
              ${findings.map(finding => `
                <div class="finding ${finding.severity}">
                  <div class="severity">${finding.severity}</div>
                  <h3>${finding.title}</h3>
                  <p>${finding.description}</p>
                </div>
              `).join('')}
              
              <p style="margin-top: 30px;">
                <a href="${process.env.NEXTAUTH_URL}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                  View in FlowLedger
                </a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  // Generate security alert text
  private generateSecurityAlertText(
    findings: SecurityFinding[],
    instanceName: string
  ): string {
    const criticalCount = findings.filter(f => f.severity === 'critical').length
    const highCount = findings.filter(f => f.severity === 'high').length

    return `
SECURITY ALERT - ${instanceName}

Summary:
- ${criticalCount} Critical findings
- ${highCount} High findings
- ${findings.length} Total findings

Findings:
${findings.map(f => `- ${f.severity.toUpperCase()}: ${f.title}`).join('\n')}

View details: ${process.env.NEXTAUTH_URL}
    `.trim()
  }

  // Generate scan completion HTML
  private generateScanCompletionHtml(
    instanceName: string,
    totalFindings: number,
    criticalFindings: number
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Scan Complete - FlowLedger</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .summary { background: #1f2937; color: white; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Scan Complete</h1>
              <p>${instanceName}</p>
            </div>
            <div class="content">
              <div class="summary">
                <h2>Results</h2>
                <p><strong>${totalFindings}</strong> Total findings • <strong>${criticalFindings}</strong> Critical</p>
              </div>
              
              <p>
                <a href="${process.env.NEXTAUTH_URL}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                  View Results
                </a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  // Generate scan completion text
  private generateScanCompletionText(
    instanceName: string,
    totalFindings: number,
    criticalFindings: number
  ): string {
    return `
SCAN COMPLETE - ${instanceName}

Results:
- ${totalFindings} Total findings
- ${criticalFindings} Critical findings

View results: ${process.env.NEXTAUTH_URL}
    `.trim()
  }

  // Generate notification HTML
  private generateNotificationHtml(notification: Notification): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${notification.title} - FlowLedger</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 ${notification.title}</h1>
            </div>
            <div class="content">
              <p>${notification.message}</p>
              <p>
                <a href="${process.env.NEXTAUTH_URL}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                  View in FlowLedger
                </a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  // Generate notification text
  private generateNotificationText(notification: Notification): string {
    return `
${notification.title}

${notification.message}

View in FlowLedger: ${process.env.NEXTAUTH_URL}
    `.trim()
  }

  // Generate magic link HTML
  private generateMagicLinkHtml(url: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Sign in to FlowLedger</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔗 Sign in to FlowLedger</h1>
            </div>
            <div class="content">
              <p>Click the button below to sign in to your FlowLedger account:</p>
              <p>
                <a href="${url}" style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Sign In
                </a>
              </p>
              <p><small>This link will expire in 24 hours.</small></p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  // Generate magic link text
  private generateMagicLinkText(url: string): string {
    return `
Sign in to FlowLedger

Click the link below to sign in to your account:
${url}

This link will expire in 24 hours.
    `.trim()
  }
}

export const emailService = new EmailService()
export default emailService

