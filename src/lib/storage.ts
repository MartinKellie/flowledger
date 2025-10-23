import fs from 'fs'
import path from 'path'

const STORAGE_FILE = path.join(process.cwd(), 'data', 'instances.json')

// Ensure data directory exists
const ensureDataDirectory = () => {
  const dataDir = path.dirname(STORAGE_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Load instances from file
export const loadInstances = (): Map<string, any> => {
  try {
    ensureDataDirectory()
    
    if (!fs.existsSync(STORAGE_FILE)) {
      return new Map()
    }
    
    const data = fs.readFileSync(STORAGE_FILE, 'utf8')
    const instances = JSON.parse(data)
    
    // Convert array back to Map
    const instanceMap = new Map()
    if (Array.isArray(instances)) {
      instances.forEach(instance => {
        instanceMap.set(instance.id, instance)
      })
    }
    
    return instanceMap
  } catch (error) {
    console.error('Failed to load instances:', error)
    return new Map()
  }
}

// Save instances to file
export const saveInstances = (instances: Map<string, any>): void => {
  try {
    ensureDataDirectory()
    
    // Convert Map to array for JSON serialization
    const instancesArray = Array.from(instances.values())
    
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(instancesArray, null, 2))
    console.log(`Saved ${instancesArray.length} instances to storage`)
  } catch (error) {
    console.error('Failed to save instances:', error)
  }
}

// Add instance to storage
export const addInstance = (instance: any): void => {
  const instances = loadInstances()
  instances.set(instance.id, instance)
  saveInstances(instances)
}

// Get instance by ID
export const getInstance = (id: string): any => {
  const instances = loadInstances()
  return instances.get(id)
}

// Get all instances
export const getAllInstances = (): any[] => {
  const instances = loadInstances()
  return Array.from(instances.values())
}

// Update instance
export const updateInstance = (id: string, updates: any): void => {
  const instances = loadInstances()
  const instance = instances.get(id)
  if (instance) {
    instances.set(id, { ...instance, ...updates })
    saveInstances(instances)
  }
}

// Delete instance
export const deleteInstance = (id: string): void => {
  const instances = loadInstances()
  instances.delete(id)
  saveInstances(instances)
}

