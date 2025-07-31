import React, { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { enhancedSupabase } from '@/lib/supabase'
import { 
  Upload, 
  Image, 
  Music, 
  Video, 
  File, 
  X, 
  Play, 
  Pause,
  Volume2,
  Eye,
  Download,
  Trash2,
  Edit,
  Loader2,
  Sparkles,
  Camera
} from 'lucide-react'

interface ArtUploadProps {
  isOpen: boolean
  onClose: () => void
}

interface ArtPiece {
  id: string
  title: string
  description: string
  type: 'image' | 'audio' | 'video' | 'document'
  file_url: string
  file_name: string
  file_size: number
  created_at: string
}

export function ArtUpload({ isOpen, onClose }: ArtUploadProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [uploading, setUploading] = useState(false)
  const [artPieces, setArtPieces] = useState<ArtPiece[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [audioPlaying, setAudioPlaying] = useState<string | null>(null)

  React.useEffect(() => {
    if (isOpen && user) {
      fetchArtPieces()
    }
  }, [isOpen, user])

  const fetchArtPieces = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data, error } = await enhancedSupabase
        .from('art_pieces')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setArtPieces(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load your art pieces",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getFileType = (file: File): 'image' | 'audio' | 'video' | 'document' => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('audio/')) return 'audio'
    if (file.type.startsWith('video/')) return 'video'
    return 'document'
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-5 w-5" />
      case 'audio': return <Music className="h-5 w-5" />
      case 'video': return <Video className="h-5 w-5" />
      default: return <File className="h-5 w-5" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 50MB",
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)
    setTitle(file.name.split('.')[0])

    // Create preview for images and videos
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !user || !title.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a file and provide a title",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
              const { data: uploadData, error: uploadError } = await enhancedSupabase.storage
        .from('art-pieces')
        .upload(fileName, selectedFile)

      if (uploadError) throw uploadError

      // Get public URL
              const { data: { publicUrl } } = enhancedSupabase.storage
        .from('art-pieces')
        .getPublicUrl(fileName)

      // Save metadata to database
      const { data: artPieceData, error: dbError } = await enhancedSupabase
        .from('art_pieces')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
          type: getFileType(selectedFile),
          file_url: publicUrl,
          file_name: selectedFile.name,
          file_size: selectedFile.size
        })
        .select()
        .single()

      if (dbError) throw dbError

      // Add to local state
      if (artPieceData) {
        setArtPieces(prev => [artPieceData, ...prev])
      }

      toast({
        title: "Success!",
        description: "Your art piece has been uploaded successfully",
      })

      // Reset form
      setSelectedFile(null)
      setTitle('')
      setDescription('')
      setPreviewUrl(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload your art piece",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteArtPiece = async (artPiece: ArtPiece) => {
    if (!user) return

    try {
      // Delete from storage
      const fileName = artPiece.file_url.split('/').pop()
      if (fileName) {
        const { error: storageError } = await enhancedSupabase.storage
          .from('art-pieces')
          .remove([`${user.id}/${fileName}`])
        
        if (storageError) throw storageError
      }

      // Delete from database
      const { error: dbError } = await enhancedSupabase
        .from('art_pieces')
        .delete()
        .eq('id', artPiece.id)
        .eq('user_id', user.id)

      if (dbError) throw dbError

      // Remove from local state
      setArtPieces(prev => prev.filter(piece => piece.id !== artPiece.id))

      toast({
        title: "Success!",
        description: "Art piece deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete art piece",
        variant: "destructive",
      })
    }
  }

  const handleUpdateArtPiece = async (artPiece: ArtPiece, newTitle: string, newDescription: string) => {
    if (!user) return

    try {
      const { data, error } = await enhancedSupabase
        .from('art_pieces')
        .update({
          title: newTitle.trim(),
          description: newDescription.trim()
        })
        .eq('id', artPiece.id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      // Update local state
      setArtPieces(prev => prev.map(piece => 
        piece.id === artPiece.id ? data : piece
      ))

      toast({
        title: "Success!",
        description: "Art piece updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update art piece",
        variant: "destructive",
      })
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setTitle('')
    setDescription('')
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const toggleAudioPlay = (id: string) => {
    if (audioPlaying === id) {
      setAudioPlaying(null)
    } else {
      setAudioPlaying(id)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Your Portfolio
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            Showcase your best work to attract event organizers. Artists with complete portfolios receive 5x more booking requests!
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Section */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Add to Your Portfolio</h3>
                  <p className="text-sm text-gray-600">Every piece you add increases your booking potential</p>
                </div>
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-3 rounded-full">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              
              {/* File Upload */}
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    accept="image/*,audio/*,video/*,.pdf,.doc,.docx"
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Upload Your Best Work
                    </p>
                    <p className="text-sm text-gray-500">
                      Photos, Audio, Videos, or Documents • Max 50MB • All formats supported
                    </p>
                  </label>
                </div>

                {/* Selected File Preview */}
                {selectedFile && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {previewUrl && selectedFile.type.startsWith('image/') ? (
                            <img 
                              src={previewUrl} 
                              alt="Preview" 
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                              {getFileIcon(getFileType(selectedFile))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{selectedFile.name}</p>
                              <p className="text-sm text-gray-600">
                                {formatFileSize(selectedFile.size)} • {getFileType(selectedFile)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveFile}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor="title">Title *</Label>
                              <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter title for your art piece"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="description">Description</Label>
                              <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your art piece..."
                                rows={3}
                              />
                            </div>
                          </div>
                          
                          <Button
                            onClick={handleUpload}
                            disabled={uploading || !title.trim()}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          >
                            {uploading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Add to Portfolio
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Art Collection */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Your Portfolio</h3>
                <Badge variant="secondary">
                  {artPieces.length} piece{artPieces.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Loading your portfolio...</p>
                </div>
              ) : artPieces.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-dashed border-purple-200">
                  <div className="bg-white p-4 rounded-full w-fit mx-auto mb-4 shadow-lg">
                    <Camera className="h-12 w-12 text-purple-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Start Building Your Portfolio</h4>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Upload your best work to attract event organizers. Artists with portfolios get booked 5x more often!
                  </p>
                  <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-6">
                    <div className="text-center">
                      <div className="bg-blue-100 p-2 rounded-full w-fit mx-auto mb-1">
                        <Image className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="text-xs text-gray-600">Photos</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-green-100 p-2 rounded-full w-fit mx-auto mb-1">
                        <Music className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-xs text-gray-600">Audio</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-purple-100 p-2 rounded-full w-fit mx-auto mb-1">
                        <Video className="h-4 w-4 text-purple-600" />
                      </div>
                      <p className="text-xs text-gray-600">Videos</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {artPieces.map((piece) => (
                    <Card key={piece.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-gray-100 relative">
                        {piece.type === 'image' ? (
                          <img 
                            src={piece.file_url} 
                            alt={piece.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {getFileIcon(piece.type)}
                          </div>
                        )}
                        
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-white/90 text-gray-800">
                            {piece.type}
                          </Badge>
                        </div>
                      </div>
                      
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-900 truncate">{piece.title}</h4>
                          {piece.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">{piece.description}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {formatFileSize(piece.file_size)} • {new Date(piece.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          {piece.type === 'audio' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleAudioPlay(piece.id)}
                            >
                              {audioPlaying === piece.id ? (
                                <Pause className="h-3 w-3" />
                              ) : (
                                <Play className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteArtPiece(piece)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}