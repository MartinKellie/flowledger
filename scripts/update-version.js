#!/usr/bin/env node

/**
 * Version update script for FlowLedger
 * Usage: node scripts/update-version.js <new-version>
 * Example: node scripts/update-version.js 1.1.0
 */

const fs = require('fs')
const path = require('path')

const newVersion = process.argv[2]

if (!newVersion) {
  console.error('❌ Please provide a version number')
  console.log('Usage: node scripts/update-version.js <new-version>')
  console.log('Example: node scripts/update-version.js 1.1.0')
  process.exit(1)
}

// Validate version format (semantic versioning)
const versionRegex = /^\d+\.\d+\.\d+$/
if (!versionRegex.test(newVersion)) {
  console.error('❌ Invalid version format. Please use semantic versioning (e.g., 1.0.0)')
  process.exit(1)
}

console.log(`🔄 Updating version to ${newVersion}...`)

// Update package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
packageJson.version = newVersion
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
console.log('✅ Updated package.json')

// Update version.ts
const versionTsPath = path.join(__dirname, '..', 'src', 'lib', 'version.ts')
let versionTsContent = fs.readFileSync(versionTsPath, 'utf8')
versionTsContent = versionTsContent.replace(
  /export const APP_VERSION = '[^']*'/,
  `export const APP_VERSION = '${newVersion}'`
)
fs.writeFileSync(versionTsPath, versionTsContent)
console.log('✅ Updated src/lib/version.ts')

console.log(`🎉 Successfully updated version to ${newVersion}!`)
console.log('📝 Don\'t forget to commit your changes:')
console.log(`   git add .`)
console.log(`   git commit -m "chore: bump version to ${newVersion}"`)
console.log(`   git tag v${newVersion}`)

