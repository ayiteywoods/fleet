// Date formatting utility functions

/**
 * Formats a date string or Date object to "25-Oct-2025 08:37 AM" format
 * @param dateString - The date string or Date object to format
 * @returns Formatted date string or 'N/A' if invalid
 */
export const formatDateTime = (dateString: string | Date | null | undefined): string => {
  if (!dateString || dateString === null || dateString === undefined) return 'N/A'
  
  try {
    let date: Date
    
    if (typeof dateString === 'string') {
      // Check if it's a valid date string
      if (dateString === 'Invalid Date' || dateString.includes('NaN')) {
        return 'N/A'
      }
      date = new Date(dateString)
    } else {
      date = new Date(dateString)
    }
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'N/A'
    }
    
    const day = date.getDate().toString().padStart(2, '0')
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const year = date.getFullYear()
    const time = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }).toUpperCase() // Use uppercase AM/PM
    
    return `${day}-${month}-${year} ${time}`
  } catch (error) {
    console.error('Error formatting date:', error, 'Input:', dateString)
    return 'N/A'
  }
}

/**
 * Formats a date string or Date object to date only "25-Oct-2025" format
 * @param dateString - The date string or Date object to format
 * @returns Formatted date string or 'N/A' if invalid
 */
export const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString || dateString === null || dateString === undefined) return 'N/A'
  
  try {
    let date: Date
    
    if (typeof dateString === 'string') {
      if (dateString === 'Invalid Date' || dateString.includes('NaN')) {
        return 'N/A'
      }
      date = new Date(dateString)
    } else {
      date = new Date(dateString)
    }
    
    if (isNaN(date.getTime())) {
      return 'N/A'
    }
    
    const day = date.getDate().toString().padStart(2, '0')
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const year = date.getFullYear()
    
    return `${day}-${month}-${year}`
  } catch (error) {
    console.error('Error formatting date:', error, 'Input:', dateString)
    return 'N/A'
  }
}

/**
 * Formats a date string or Date object to time only "08:37 AM" format
 * @param dateString - The date string or Date object to format
 * @returns Formatted time string or 'N/A' if invalid
 */
export const formatTime = (dateString: string | Date | null | undefined): string => {
  if (!dateString || dateString === null || dateString === undefined) return 'N/A'
  
  try {
    let date: Date
    
    if (typeof dateString === 'string') {
      if (dateString === 'Invalid Date' || dateString.includes('NaN')) {
        return 'N/A'
      }
      date = new Date(dateString)
    } else {
      date = new Date(dateString)
    }
    
    if (isNaN(date.getTime())) {
      return 'N/A'
    }
    
    const time = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }).toUpperCase()
    
    return time
  } catch (error) {
    console.error('Error formatting time:', error, 'Input:', dateString)
    return 'N/A'
  }
}
