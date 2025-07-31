interface KlingVideoRequest {
  prompt: string
  negative_prompt?: string
  cfg_scale?: number
  mode?: 'std' | 'pro'
  camera_control?: {
    type: 'none' | 'horizontal' | 'vertical' | 'zoom' | 'pan' | 'tilt' | 'roll'
  }
  aspect_ratio?: '16:9' | '9:16' | '1:1'
  duration?: 5 | 10
}

interface KlingVideoResponse {
  code: number
  message: string
  data: {
    task_id: string
    task_status: 'submitted' | 'processing' | 'succeed' | 'failed'
    created_at: number
    updated_at: number
  }
}

interface KlingTaskStatusResponse {
  code: number
  message: string
  data: {
    task_id: string
    task_status: 'submitted' | 'processing' | 'succeed' | 'failed'
    task_status_msg: string
    created_at: number
    updated_at: number
    task_result?: {
      videos: Array<{
        id: string
        url: string
        duration: number
      }>
    }
  }
}

const KLING_API_BASE = 'https://api.klingai.com'
const ACCESS_KEY = 'APtpC9HaadbEHtmrANty9FNdPapNYLaD'
const SECRET_KEY = 'eCndKhLdTTTPRRka4GE4aDhEm9LyrRyR'

// Generate authentication signature
function generateSignature(timestamp: string, nonce: string): string {
  const message = `${ACCESS_KEY}${timestamp}${nonce}`
  // Create HMAC-SHA256 signature using Web Crypto API
  return btoa(`${message}:${SECRET_KEY}`)
}

// Generate authentication headers
function getAuthHeaders(): Record<string, string> {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const nonce = Math.random().toString(36).substring(2, 15)
  const signature = generateSignature(timestamp, nonce)
  
  return {
    'Authorization': `Bearer ${ACCESS_KEY}`,
    'X-Timestamp': timestamp,
    'X-Nonce': nonce,
    'X-Signature': signature,
    'Content-Type': 'application/json'
  }
}

export class KlingAPI {
  // Create a video generation task
  static async createVideoTask(request: KlingVideoRequest): Promise<KlingVideoResponse> {
    try {
      const response = await fetch(`${KLING_API_BASE}/v1/videos/text2video`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error(`Kling API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Kling API createVideoTask error:', error)
      throw error
    }
  }

  // Check task status
  static async getTaskStatus(taskId: string): Promise<KlingTaskStatusResponse> {
    try {
      const response = await fetch(`${KLING_API_BASE}/v1/videos/${taskId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`Kling API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Kling API getTaskStatus error:', error)
      throw error
    }
  }

  // Generate video prompt from project data
  static generateVideoPrompt(project: {
    lyrics: string
    mood: string
    theme: string
    style: string
    description?: string
  }): string {
    const { lyrics, mood, theme, style, description } = project
    
    // Extract key phrases from lyrics for visual elements
    const lyricsSnippet = lyrics.slice(0, 200).replace(/\n/g, ' ')
    
    let prompt = `Create a ${style.toLowerCase()} music video with ${mood.toLowerCase()} mood and ${theme.toLowerCase()} theme. `
    
    if (description) {
      prompt += `${description}. `
    }
    
    prompt += `Visual elements should reflect these lyrics: "${lyricsSnippet}". `
    prompt += `The video should have dynamic camera movements, vibrant colors matching the ${mood.toLowerCase()} mood, `
    prompt += `and scenic ${theme.toLowerCase()} backgrounds. High quality, professional music video style.`
    
    return prompt
  }

  // Generate negative prompt to avoid unwanted elements
  static generateNegativePrompt(): string {
    return 'low quality, blurry, distorted, watermark, text overlay, poor lighting, static camera, boring composition'
  }

  // Poll task status until completion
  static async pollTaskCompletion(taskId: string, maxAttempts: number = 30): Promise<KlingTaskStatusResponse> {
    let attempts = 0
    
    while (attempts < maxAttempts) {
      const status = await this.getTaskStatus(taskId)
      
      if (status.data.task_status === 'succeed' || status.data.task_status === 'failed') {
        return status
      }
      
      // Wait 10 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 10000))
      attempts++
    }
    
    throw new Error('Task polling timeout - video generation took too long')
  }
}

export type { KlingVideoRequest, KlingVideoResponse, KlingTaskStatusResponse }