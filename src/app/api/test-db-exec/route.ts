import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET(request: NextRequest) {
  try {
    // Execute the standalone database test script
    const { stdout, stderr } = await execAsync('node test-db-standalone.js', {
      cwd: process.cwd(),
      env: { ...process.env }
    })
    
    // Parse the JSON result from the script
    const lines = stdout.trim().split('\n')
    const resultLine = lines[lines.length - 1] // Last line contains the JSON result
    
    try {
      const result = JSON.parse(resultLine)
      return NextResponse.json(result)
    } catch (parseError) {
      // If JSON parsing fails, return the raw output
      return NextResponse.json({
        success: false,
        error: 'Failed to parse script output',
        rawOutput: stdout,
        stderr: stderr,
        timestamp: new Date().toISOString()
      })
    }
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
