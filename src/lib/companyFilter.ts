import { prisma } from './prisma'

/**
 * Check if user is admin
 */
export function isAdmin(user?: any): boolean {
  if (!user || !user.role) return false
  const roleLower = (user.role || '').toLowerCase()
  return roleLower === 'admin' || 
         roleLower === 'super admin' || 
         roleLower === 'superadmin' || 
         roleLower === 'super_user' || 
         roleLower === 'superuser'
}

/**
 * Get user's company information
 * Returns company name and spcode if user has a company assigned
 */
export async function getUserCompany(user?: any): Promise<{ companyName: string | null; spcode: bigint | null } | null> {
  if (!user) return null
  
  // Admins can see all data
  if (isAdmin(user)) {
    return null // null means no filtering needed
  }
  
  // If user has no spcode, they should see nothing
  if (!user.spcode) {
    return { companyName: null, spcode: null }
  }
  
  try {
    const spcode = BigInt(user.spcode)
    
    // Try to get company name from companies table
    const company = await prisma.companies.findUnique({
      where: { id: spcode },
      select: { name: true }
    }).catch(() => null)
    
    if (company?.name) {
      return { companyName: company.name, spcode }
    }
    
    // Fallback: return spcode even if company name not found
    return { companyName: null, spcode }
  } catch (error) {
    console.error('Error getting user company:', error)
    return { companyName: null, spcode: null }
  }
}

/**
 * Check if user should see empty results (no company assigned)
 */
export function shouldReturnEmpty(user?: any): boolean {
  if (!user) return false
  if (isAdmin(user)) return false // Admins see all
  return !user.spcode // No company = no data
}

