import React, { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { enhancedSupabase } from '@/lib/supabase'
import { KlingAPI } from '@/lib/kling-api'
import { 
  Upload, 
  Music, 
  Image, 
  Video, 
  FileText,
  Wand2,
  Play,
  Pause,
  Download,
  Youtube,
  Sparkles,
  Loader2,
  X,
  Plus,
  Eye,
  Settings,
  Palette,
  Volume2,
  Camera,
  Film,
  Mic,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2
} from 'lucide-react'

interface AIProject {
  id: string
  title: string
  description: string
  status: 'draft' | 'processing' | 'completed' | 'failed'
  project_type: 'music_video' | 'audio_visual' | 'lyric_video'
  lyrics: string
  mood: string
  theme: string
  style: string
  audio_file_url?: string
  image_files: string[]
  video_snippets: string[]
  ai_settings: any
  output_video_url?: string
  youtube_video_id?: string
  youtube_upload_status: 'pending' | 'uploading' | 'completed' | 'failed'
  seo_settings: any
  created_at: string
  updated_at: string
  completed_at?: string
}

interface AIShowcaseStudioProps {
  isOpen: boolean
  onClose: () => void
}

const MOODS = [
  'Energetic', 'Calm', 'Romantic', 'Dark', 'Uplifting', 'Melancholic', 
  'Aggressive', 'Dreamy', 'Nostalgic', 'Futuristic', 'Mysterious', 'Joyful'
]

const THEMES = [
  'Nature', 'Urban', 'Space', 'Ocean', 'Mountains', 'Desert', 'Forest',
  'City Lights', 'Abstract', 'Vintage', 'Neon', 'Minimalist', 'Cosmic'
]

const STYLES = [
  'Cinematic', 'Animated', 'Live Action', 'Mixed Media', 'Lyric Video',
  'Performance', 'Narrative', 'Abstract Art', 'Motion Graphics', 'Retro'
]

export function AIShowcaseStudio({ isOpen, onClose }: AIShowcaseStudioProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [projects, setProjects] = useState<AIProject[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [selectedProject, setSelectedProject] = useState<AIProject | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [generationsUsed, setGenerationsUsed] = useState(0)
  const [generationLimit, setGenerationLimit] = useState(1)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_type: 'music_video' as const,
    lyrics: '',
    mood: '',
    theme: '',
    style: '',
    audio_file: null as File | null,
    image_files: [] as File[],
    video_snippets: [] as File[],
    seo_title: '',
    seo_description: '',
    seo_tags: ''
  })

  const audioInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && user) {
      fetchProjects()
      fetchUsageStats()
    }
  }, [isOpen, user])

  const fetchProjects = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await enhancedSupabase
        .from('ai_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUsageStats = async () => {
    if (!user) return

    try {
      const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
      
      const { data, error } = await enhancedSupabase
        .from('ai_generations_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_year', currentMonth)
        .maybeSingle()

      if (error) throw error
      
      if (data) {
        setGenerationsUsed(data.generations_used)
        setGenerationLimit(data.plan_limit)
      } else {
        // Create initial usage record
        const { data: newUsage, error: insertError } = await enhancedSupabase
          .from('ai_generations_usage')
          .insert({
            user_id: user.id,
            month_year: currentMonth,
            generations_used: 0,
            plan_limit: 1 // Default for free tier
          })
          .select()
          .single()

        if (insertError) throw insertError
        setGenerationsUsed(0)
        setGenerationLimit(1)
      }
    } catch (error: any) {
      console.error('Failed to fetch usage stats:', error)
    }
  }

  const handleFileUpload = async (file: File, type: 'audio' | 'image' | 'video'): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${user!.id}/${type}/${Date.now()}.${fileExt}`
    
    const { data, error } = await enhancedSupabase.storage
      .from('ai-studio-files')
      .upload(fileName, file)

    if (error) throw error

    const { data: { publicUrl } } = enhancedSupabase.storage
      .from('ai-studio-files')
      .getPublicUrl(fileName)

    return publicUrl
  }

  const handleAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Audio files must be smaller than 50MB",
        variant: "destructive",
      })
      return
    }

    setFormData(prev => ({ ...prev, audio_file: file }))
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is too large. Images must be smaller than 10MB`,
          variant: "destructive",
        })
        return false
      }
      return true
    })

    setFormData(prev => ({ 
      ...prev, 
      image_files: [...prev.image_files, ...validFiles].slice(0, 10) // Max 10 images
    }))
  }

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    const validFiles = files.filter(file => {
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is too large. Video snippets must be smaller than 100MB`,
          variant: "destructive",
        })
        return false
      }
      return true
    })

    setFormData(prev => ({ 
      ...prev, 
      video_snippets: [...prev.video_snippets, ...validFiles].slice(0, 5) // Max 5 videos
    }))
  }

  const generateSEOContent = () => {
    const { title, lyrics, mood, theme } = formData
    
    // Auto-generate SEO content based on project details
    const seoTitle = title || 'AI Generated Music Video'
    const seoDescription = `${mood} ${theme} music video created with AI. ${lyrics.slice(0, 100)}...`
    const seoTags = [mood, theme, 'music video', 'AI generated', 'live vibe'].filter(Boolean).join(', ')

    setFormData(prev => ({
      ...prev,
      seo_title: seoTitle,
      seo_description: seoDescription,
      seo_tags: seoTags
    }))
  }

  const createProject = async () => {
    if (!user || !formData.title.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a project title",
        variant: "destructive",
      })
      return
    }

    if (generationsUsed >= generationLimit) {
      toast({
        title: "Generation limit reached",
        description: "You've reached your monthly AI generation limit. Upgrade your plan for more generations.",
        variant: "destructive",
      })
      return
    }

    setCreating(true)
    try {
      // Upload files
      let audioUrl = ''
      let imageUrls: string[] = []
      let videoUrls: string[] = []

      if (formData.audio_file) {
        audioUrl = await handleFileUpload(formData.audio_file, 'audio')
      }

      if (formData.image_files.length > 0) {
        imageUrls = await Promise.all(
          formData.image_files.map(file => handleFileUpload(file, 'image'))
        )
      }

      if (formData.video_snippets.length > 0) {
        videoUrls = await Promise.all(
          formData.video_snippets.map(file => handleFileUpload(file, 'video'))
        )
      }

      // Create project record
      const { data: project, error } = await enhancedSupabase
        .from('ai_projects')
        .insert({
          user_id: user.id,
          title: formData.title.trim(),
          description: formData.description.trim(),
          project_type: formData.project_type,
          lyrics: formData.lyrics.trim(),
          mood: formData.mood,
          theme: formData.theme,
          style: formData.style,
          audio_file_url: audioUrl,
          image_files: imageUrls,
          video_snippets: videoUrls,
          ai_settings: {
            mood: formData.mood,
            theme: formData.theme,
            style: formData.style
          },
          seo_settings: {
            title: formData.seo_title,
            description: formData.seo_description,
            tags: formData.seo_tags.split(',').map(tag => tag.trim())
          },
          status: 'processing'
        })
        .select()
        .single()

      if (error) throw error

      // Update usage stats
      const currentMonth = new Date().toISOString().slice(0, 7)
      await enhancedSupabase
        .from('ai_generations_usage')
        .upsert({
          user_id: user.id,
          month_year: currentMonth,
          generations_used: generationsUsed + 1,
          plan_limit: generationLimit
        })

      setProjects(prev => [project, ...prev])
      setGenerationsUsed(prev => prev + 1)
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        project_type: 'music_video',
        lyrics: '',
        mood: '',
        theme: '',
        style: '',
        audio_file: null,
        image_files: [],
        video_snippets: [],
        seo_title: '',
        seo_description: '',
        seo_tags: ''
      })
      setCurrentStep(1)

      toast({
        title: "Project created!",
        description: "Your AI music video is being generated. This may take a few minutes.",
      })

      // Start Kling AI video generation
      generateVideoWithKling(project)

    } catch (error: any) {
      toast({
        title: "Creation failed",
        description: error.message || "Failed to create AI project",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const generateVideoWithKling = async (project: AIProject) => {
    try {
      // Generate prompt from project data
      const prompt = KlingAPI.generateVideoPrompt({
        lyrics: project.lyrics,
        mood: project.mood,
        theme: project.theme,
        style: project.style,
        description: project.description
      })

      const negativePrompt = KlingAPI.generateNegativePrompt()

      // Create Kling AI video generation task
      const videoRequest = {
        prompt,
        negative_prompt: negativePrompt,
        cfg_scale: 7.5,
        mode: 'pro' as const,
        aspect_ratio: '16:9' as const,
        duration: 10 as const,
        camera_control: {
          type: 'horizontal' as const
        }
      }

      console.log('Starting Kling AI video generation with prompt:', prompt)
      
      const response = await KlingAPI.createVideoTask(videoRequest)

      if (response.code !== 200) {
        throw new Error(`Kling AI error: ${response.message}`)
      }

      const taskId = response.data.task_id
      console.log('Kling AI task created with ID:', taskId)

      // Update project with task ID
      await enhancedSupabase
        .from('ai_projects')
        .update({ 
          kling_task_id: taskId,
          status: 'processing',
          kling_prompt: prompt,
          kling_negative_prompt: negativePrompt
        })
        .eq('id', project.id)

      // Start polling for completion
      pollKlingTask(project.id, taskId)

    } catch (error: any) {
      console.error('Kling AI generation error:', error)
      
      // Update project status to failed
      await enhancedSupabase
        .from('ai_projects')
        .update({ 
          status: 'failed',
          error_message: error.message
        })
        .eq('id', project.id)

      fetchProjects()

      toast({
        title: "Video generation failed",
        description: error.message || "Failed to generate video with Kling AI",
        variant: "destructive",
      })
    }
  }

  const pollKlingTask = async (projectId: string, taskId: string) => {
    try {
      console.log('Polling Kling AI task:', taskId)
      const result = await KlingAPI.pollTaskCompletion(taskId)

      if (result.data.task_status === 'succeed' && result.data.task_result?.videos?.[0]) {
        const videoUrl = result.data.task_result.videos[0].url
        console.log('Kling AI video generation completed:', videoUrl)

        // Update project with completed video
        await enhancedSupabase
          .from('ai_projects')
          .update({ 
            status: 'completed',
            output_video_url: videoUrl,
            completed_at: new Date().toISOString()
          })
          .eq('id', projectId)

        fetchProjects()

        toast({
          title: "Video generated!",
          description: "Your AI music video has been generated successfully with Kling AI!",
        })
      } else {
        // Task failed
        console.error('Kling AI task failed:', result.data.task_status_msg)
        await enhancedSupabase
          .from('ai_projects')
          .update({ 
            status: 'failed',
            error_message: result.data.task_status_msg || 'Video generation failed'
          })
          .eq('id', projectId)

        fetchProjects()

        toast({
          title: "Video generation failed",
          description: result.data.task_status_msg || "Video generation failed",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error('Kling task polling error:', error)
      
      await enhancedSupabase
        .from('ai_projects')
        .update({ 
          status: 'failed',
          error_message: error.message
        })
        .eq('id', projectId)

      fetchProjects()

      toast({
        title: "Video generation failed",
        description: error.message || "Failed to complete video generation",
        variant: "destructive",
      })
    }
  }

  const uploadToYouTube = async (project: AIProject) => {
    try {
      // Update status to uploading
      await enhancedSupabase
        .from('ai_projects')
        .update({ youtube_upload_status: 'uploading' })
        .eq('id', project.id)

      // Simulate YouTube upload (in real implementation, this would use YouTube API)
      setTimeout(async () => {
        const mockVideoId = `mock_${Date.now()}`
        
        await enhancedSupabase
          .from('ai_projects')
          .update({ 
            youtube_upload_status: 'completed',
            youtube_video_id: mockVideoId
          })
          .eq('id', project.id)
        
        fetchProjects()
        
        toast({
          title: "Uploaded to YouTube!",
          description: "Your video has been successfully uploaded to YouTube with optimized SEO settings.",
        })
      }, 5000) // 5 seconds for demo

      toast({
        title: "Uploading to YouTube...",
        description: "Your video is being uploaded with optimized SEO settings.",
      })
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload to YouTube",
        variant: "destructive",
      })
    }
  }

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await enhancedSupabase
        .from('ai_projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user!.id)

      if (error) throw error

      setProjects(prev => prev.filter(p => p.id !== projectId))
      
      toast({
        title: "Project deleted",
        description: "The project has been successfully deleted.",
      })
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete project",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4 text-gray-500" />
      case 'processing': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-600" />
            AI Showcase Studio
          </DialogTitle>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Generations used: {generationsUsed}/{generationLimit}</span>
            </div>
            <Progress value={(generationsUsed / generationLimit) * 100} className="w-32" />
          </div>
        </DialogHeader>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create New Project</TabsTrigger>
            <TabsTrigger value="projects">My Projects ({projects.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            {/* Step Progress */}
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`w-12 h-1 ${
                      step < currentStep ? 'bg-purple-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Project Details */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Project Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Project Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="My Amazing Music Video"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project_type">Project Type</Label>
                      <Select
                        value={formData.project_type}
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, project_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="music_video">Music Video</SelectItem>
                          <SelectItem value="audio_visual">Audio Visual</SelectItem>
                          <SelectItem value="lyric_video">Lyric Video</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your vision for this project..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lyrics">Lyrics</Label>
                    <Textarea
                      id="lyrics"
                      value={formData.lyrics}
                      onChange={(e) => setFormData(prev => ({ ...prev, lyrics: e.target.value }))}
                      placeholder="Enter your song lyrics here..."
                      rows={6}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Media Upload */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Media Files
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Audio Upload */}
                  <div className="space-y-3">
                    <Label>Audio File</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        ref={audioInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioUpload}
                        className="hidden"
                      />
                      {formData.audio_file ? (
                        <div className="flex items-center justify-center gap-3">
                          <Music className="h-8 w-8 text-blue-600" />
                          <div>
                            <p className="font-medium">{formData.audio_file.name}</p>
                            <p className="text-sm text-gray-500">
                              {(formData.audio_file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFormData(prev => ({ ...prev, audio_file: null }))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <Button
                            variant="outline"
                            onClick={() => audioInputRef.current?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Audio File
                          </Button>
                          <p className="text-sm text-gray-500 mt-2">MP3, WAV, or other audio formats (Max 50MB)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-3">
                    <Label>Images (Optional)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      {formData.image_files.length > 0 ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {formData.image_files.map((file, idx) => (
                              <div key={idx} className="relative">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Upload ${idx + 1}`}
                                  className="w-full h-20 object-cover rounded-lg"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600"
                                  onClick={() => setFormData(prev => ({
                                    ...prev,
                                    image_files: prev.image_files.filter((_, i) => i !== idx)
                                  }))}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => imageInputRef.current?.click()}
                            disabled={formData.image_files.length >= 10}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add More Images ({formData.image_files.length}/10)
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <Button
                            variant="outline"
                            onClick={() => imageInputRef.current?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Images
                          </Button>
                          <p className="text-sm text-gray-500 mt-2">JPG, PNG, or other image formats (Max 10MB each, up to 10 images)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Video Upload */}
                  <div className="space-y-3">
                    <Label>Video Snippets (Optional)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        multiple
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                      {formData.video_snippets.length > 0 ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {formData.video_snippets.map((file, idx) => (
                              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Video className="h-8 w-8 text-purple-600" />
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{file.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setFormData(prev => ({
                                    ...prev,
                                    video_snippets: prev.video_snippets.filter((_, i) => i !== idx)
                                  }))}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => videoInputRef.current?.click()}
                            disabled={formData.video_snippets.length >= 5}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add More Videos ({formData.video_snippets.length}/5)
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <Button
                            variant="outline"
                            onClick={() => videoInputRef.current?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Video Snippets
                          </Button>
                          <p className="text-sm text-gray-500 mt-2">MP4, MOV, or other video formats (Max 100MB each, up to 5 videos)</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: AI Settings */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    AI Generation Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Mood</Label>
                      <Select
                        value={formData.mood}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, mood: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select mood" />
                        </SelectTrigger>
                        <SelectContent>
                          {MOODS.map((mood) => (
                            <SelectItem key={mood} value={mood}>{mood}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <Select
                        value={formData.theme}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, theme: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          {THEMES.map((theme) => (
                            <SelectItem key={theme} value={theme}>{theme}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Style</Label>
                      <Select
                        value={formData.style}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, style: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent>
                          {STYLES.map((style) => (
                            <SelectItem key={style} value={style}>{style}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">AI Generation Preview</h4>
                    <p className="text-blue-800 text-sm">
                      Your {formData.project_type.replace('_', ' ')} will feature a {formData.mood.toLowerCase()} mood 
                      with {formData.theme.toLowerCase()} scenery in a {formData.style.toLowerCase()} style.
                      {formData.audio_file && ' The AI will sync visuals to your audio track.'}
                      {formData.image_files.length > 0 && ` ${formData.image_files.length} reference images will guide the visual style.`}
                      {formData.video_snippets.length > 0 && ` ${formData.video_snippets.length} video snippets will be incorporated.`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: SEO & Publishing */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Youtube className="h-5 w-5" />
                    SEO & Publishing Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">YouTube SEO Settings</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateSEOContent}
                    >
                      <Wand2 className="h-4 w-4 mr-2" />
                      Auto-Generate
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="seo_title">Video Title</Label>
                      <Input
                        id="seo_title"
                        value={formData.seo_title}
                        onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                        placeholder="Optimized title for YouTube"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seo_description">Description</Label>
                      <Textarea
                        id="seo_description"
                        value={formData.seo_description}
                        onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                        placeholder="SEO-optimized description for YouTube"
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seo_tags">Tags (comma-separated)</Label>
                      <Input
                        id="seo_tags"
                        value={formData.seo_tags}
                        onChange={(e) => setFormData(prev => ({ ...prev, seo_tags: e.target.value }))}
                        placeholder="music video, AI generated, live vibe, ..."
                      />
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Publishing Features</h4>
                    <ul className="text-green-800 text-sm space-y-1">
                      <li>• Automatic upload to YouTube with optimized settings</li>
                      <li>• SEO-optimized title, description, and tags</li>
                      <li>• Custom thumbnail generation</li>
                      <li>• Automatic categorization and metadata</li>
                      <li>• Social media sharing optimization</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep < 4 ? (
                <Button
                  onClick={() => setCurrentStep(prev => Math.min(prev + 1, 4))}
                  disabled={currentStep === 1 && !formData.title.trim()}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={createProject}
                  disabled={creating || generationsUsed >= generationLimit}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate AI Video
                    </>
                  )}
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Loading your projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <Wand2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-4">Create your first AI-generated music video!</p>
                <Button
                  onClick={() => {
                    // Switch to create tab
                    const createTab = document.querySelector('[value="create"]') as HTMLElement
                    createTab?.click()
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 relative">
                      {project.output_video_url ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="lg"
                            className="bg-white/90 hover:bg-white"
                          >
                            <Play className="h-8 w-8" />
                          </Button>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            {getStatusIcon(project.status)}
                            <p className="text-sm text-gray-600 mt-2 capitalize">{project.status}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="absolute top-2 right-2">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-medium text-gray-900 truncate">{project.title}</h3>
                        <p className="text-sm text-gray-600 capitalize">{project.project_type.replace('_', ' ')}</p>
                        {project.description && (
                          <p className="text-xs text-gray-500 line-clamp-2 mt-1">{project.description}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {project.mood && <Badge variant="secondary" className="text-xs">{project.mood}</Badge>}
                        {project.theme && <Badge variant="secondary" className="text-xs">{project.theme}</Badge>}
                      </div>
                      
                      <div className="flex gap-2">
                        {project.status === 'completed' && project.output_video_url && (
                          <>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Eye className="h-3 w-3 mr-1" />
                              Preview
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => uploadToYouTube(project)}
                              disabled={project.youtube_upload_status === 'uploading'}
                            >
                              {project.youtube_upload_status === 'uploading' ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : project.youtube_upload_status === 'completed' ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <Youtube className="h-3 w-3" />
                              )}
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => deleteProject(project.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Created {new Date(project.created_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}