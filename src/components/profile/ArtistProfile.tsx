import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { enhancedSupabase } from '@/lib/supabase'
import { ArtistProfileSetup } from './ArtistProfileSetup'
import { 
  User, 
  MapPin, 
  Phone, 
  Edit, 
  Instagram, 
  Music, 
  Palette,
  Globe,
  Camera,
  Mic,
  Guitar,
  Star,
  Calendar,
  DollarSign,
  ExternalLink,
  Image,
  Video,
  File,
  Play,
  Pause,
  Eye,
  Plus,
  X,
  Upload,
  Sparkles
} from 'lucide-react'

interface ArtistProfileData {
  id: string
  name: string
  phone_number?: string
  city?: string
  state?: string
  country?: string
  travel_distance?: number
  profile_photo_url?: string
  instagram?: string
  tiktok?: string
  pinterest?: string
  youtube?: string
  behance?: string
  facebook?: string
  linkedin?: string
  spotify?: string
  artist_type?: string
  visual_artist_category?: string
  performing_artist_type?: string
  music_genres?: string[]
  instruments?: string[]
  created_at: string
  updated_at: string
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

export function ArtistProfile() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [profile, setProfile] = useState<ArtistProfileData | null>(null)
  const [artPieces, setArtPieces] = useState<ArtPiece[]>([])
  const [loading, setLoading] = useState(true)
  const [artLoading, setArtLoading] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedArt, setSelectedArt] = useState<ArtPiece | null>(null)
  const [audioPlaying, setAudioPlaying] = useState<string | null>(null)
  const [artUploadOpen, setArtUploadOpen] = useState(false)

  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchArtPieces()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await enhancedSupabase
        .from('artist_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setProfile(data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchArtPieces = async () => {
    if (!user) return

    setArtLoading(true)
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
        description: "Failed to load artwork",
        variant: "destructive",
      })
    } finally {
      setArtLoading(false)
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
      setSelectedArt(null) // Close modal if this piece was selected

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

  const toggleAudioPlay = (id: string) => {
    if (audioPlaying === id) {
      setAudioPlaying(null)
    } else {
      setAudioPlaying(id)
    }
  }

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="h-4 w-4" />
      case 'tiktok': return <Music className="h-4 w-4" />
      case 'youtube': return <Camera className="h-4 w-4" />
      case 'spotify': return <Music className="h-4 w-4" />
      default: return <Globe className="h-4 w-4" />
    }
  }

  const formatSocialUrl = (platform: string, value: string) => {
    if (value.startsWith('http')) return value
    
    switch (platform) {
      case 'instagram':
        return value.startsWith('@') ? `https://instagram.com/${value.slice(1)}` : `https://instagram.com/${value}`
      case 'tiktok':
        return value.startsWith('@') ? `https://tiktok.com/${value}` : `https://tiktok.com/@${value}`
      case 'youtube':
        return value.includes('youtube.com') ? value : `https://youtube.com/${value}`
      case 'spotify':
        return value.includes('spotify.com') ? value : `https://open.spotify.com/artist/${value}`
      case 'facebook':
        return value.includes('facebook.com') ? value : `https://facebook.com/${value}`
      case 'linkedin':
        return value.includes('linkedin.com') ? value : `https://linkedin.com/in/${value}`
      case 'behance':
        return value.includes('behance.net') ? value : `https://behance.net/${value}`
      case 'pinterest':
        return value.includes('pinterest.com') ? value : `https://pinterest.com/${value}`
      default:
        return value
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="text-center py-16 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-200">
          <CardContent>
            <div className="bg-white p-6 rounded-full w-fit mx-auto mb-6 shadow-lg">
              <Sparkles className="h-16 w-16 text-purple-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Launch Your Artist Career Today!</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Join 10,000+ artists earning from their talent. Create your profile and start receiving event bookings within 24 hours.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="bg-blue-100 p-4 rounded-full w-fit mx-auto mb-3">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Setup Profile</h3>
                <p className="text-sm text-gray-600">2 minutes to complete</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 p-4 rounded-full w-fit mx-auto mb-3">
                  <Upload className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Add Portfolio</h3>
                <p className="text-sm text-gray-600">Show your best work</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 p-4 rounded-full w-fit mx-auto mb-3">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Start Earning</h3>
                <p className="text-sm text-gray-600">Get booked for events</p>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg mb-6 max-w-md mx-auto border border-green-200">
              <p className="text-sm text-green-800 font-medium">
                ✨ Free forever • Average artist earns $2,500/month • No hidden fees
              </p>
            </div>
            
            <div className="space-y-4">
              <Button 
                onClick={() => setEditModalOpen(true)}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Start Earning as an Artist - Free
              </Button>
              
              <p className="text-sm text-gray-500">
                Join artists earning $500-$5000 per event • No credit card required
              </p>
            </div>
          </CardContent>
        </Card>
        <ArtistProfileSetup
          isOpen={editModalOpen}
          existingProfile={null}
          onClose={() => {
            setEditModalOpen(false)
            fetchProfile()
          }}
        />
      </div>
    )
  }

  const socialPlatforms = [
    { key: 'instagram', label: 'Instagram', value: profile.instagram },
    { key: 'tiktok', label: 'TikTok', value: profile.tiktok },
    { key: 'youtube', label: 'YouTube', value: profile.youtube },
    { key: 'spotify', label: 'Spotify', value: profile.spotify },
    { key: 'facebook', label: 'Facebook', value: profile.facebook },
    { key: 'linkedin', label: 'LinkedIn', value: profile.linkedin },
    { key: 'behance', label: 'Behance', value: profile.behance },
    { key: 'pinterest', label: 'Pinterest', value: profile.pinterest },
  ].filter(platform => platform.value)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back, {profile.name}! 👋</h1>
          <p className="text-gray-600">Your artist career hub - manage bookings, showcase talent, and grow your income</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setArtUploadOpen(true)}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload New Work
          </Button>
          <Button 
            onClick={() => setEditModalOpen(true)}
            variant="outline"
            className="border-2"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Main Profile Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
        <CardContent className="relative pt-0 pb-8">
          <div className="flex flex-col md:flex-row md:items-end md:space-x-6 -mt-16 relative z-10">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg mb-4 md:mb-0">
              <AvatarImage src={profile.profile_photo_url} alt={profile.name} />
              <AvatarFallback className="text-2xl bg-gray-200">
                {profile.name?.charAt(0)?.toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
              
              {/* Artist Type Badges */}
              <div className="flex flex-wrap gap-2">
                {profile.artist_type === 'visual' && (
                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                    <Palette className="h-3 w-3 mr-1" />
                    Visual Artist
                  </Badge>
                )}
                {profile.artist_type === 'performing' && (
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                    <Mic className="h-3 w-3 mr-1" />
                    Performing Artist
                  </Badge>
                )}
                {profile.artist_type === 'both' && (
                  <>
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                      <Palette className="h-3 w-3 mr-1" />
                      Visual Artist
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                      <Mic className="h-3 w-3 mr-1" />
                      Performing Artist
                    </Badge>
                  </>
                )}
              </div>

              {/* Location and Contact */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {(profile.city || profile.state || profile.country) && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {[profile.city, profile.state, profile.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                {profile.phone_number && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span>{profile.phone_number}</span>
                  </div>
                )}
                {profile.travel_distance && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>Travels up to {profile.travel_distance} miles</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Artist Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Artist Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.visual_artist_category && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Visual Artist Category</h4>
                <p className="text-gray-600 text-sm">{profile.visual_artist_category}</p>
              </div>
            )}
            
            {profile.performing_artist_type && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Performing Artist Type</h4>
                <p className="text-gray-600 text-sm capitalize">
                  {profile.performing_artist_type}
                </p>
              </div>
            )}

            {profile.music_genres && profile.music_genres.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Music Genres</h4>
                <div className="flex flex-wrap gap-1">
                  {profile.music_genres.map((genre) => (
                    <Badge key={genre} variant="secondary" className="text-xs">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {profile.instruments && profile.instruments.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Instruments</h4>
                <div className="space-y-1">
                  {profile.instruments.map((instrument) => (
                    <div key={instrument} className="flex items-center gap-2 text-sm text-gray-600">
                      <Guitar className="h-3 w-3" />
                      <span>{instrument}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Social Media */}
        {socialPlatforms.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Social Media
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {socialPlatforms.map((platform) => (
                  <div key={platform.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getSocialIcon(platform.key)}
                      <span className="font-medium text-gray-900">{platform.label}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <a 
                        href={formatSocialUrl(platform.key, platform.value!)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        Visit
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Profile Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Profile Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Total Bookings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">-</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {new Date(profile.created_at).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-600">Member Since</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Artwork Gallery */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              My Artwork
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {artPieces.length} piece{artPieces.length !== 1 ? 's' : ''}
              </Badge>
              <Button 
                onClick={() => setArtUploadOpen(true)}
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Art
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {artLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : artPieces.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-dashed border-purple-200">
              <div className="bg-white p-4 rounded-full w-fit mx-auto mb-4 shadow-lg">
                <Camera className="h-12 w-12 text-purple-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Ready to Get Booked?</h4>
              <p className="text-gray-600 mb-4">
                Upload your portfolio to start receiving event invitations. Artists with portfolios get 5x more bookings!
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
              
              <Button 
                onClick={() => setArtUploadOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Upload Your Portfolio Now
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artPieces.map((piece) => (
                <Card key={piece.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                  <div 
                    className="aspect-square bg-gray-100 relative overflow-hidden"
                    onClick={() => setSelectedArt(piece)}
                  >
                    {piece.type === 'image' ? (
                      <img 
                        src={piece.file_url} 
                        alt={piece.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <div className="text-center">
                          <div className="bg-white rounded-full p-4 mb-3 shadow-md">
                            {getFileIcon(piece.type)}
                          </div>
                          <p className="text-sm font-medium text-gray-700">{piece.type.toUpperCase()}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {piece.type === 'audio' ? (
                          <Button
                            size="sm"
                            className="bg-white/90 text-gray-900 hover:bg-white"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleAudioPlay(piece.id)
                            }}
                          >
                            {audioPlaying === piece.id ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-white/90 text-gray-900 hover:bg-white"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Type Badge */}
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-white/90 text-gray-800 text-xs">
                        {piece.type}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h4 className="font-medium text-gray-900 truncate mb-1">{piece.title}</h4>
                    {piece.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{piece.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatFileSize(piece.file_size)}</span>
                      <span>{new Date(piece.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ArtistProfileSetup
        isOpen={editModalOpen}
        existingProfile={profile}
        onClose={() => {
          setEditModalOpen(false)
          fetchProfile()
        }}
      />

      {/* Art Piece Detail Modal */}
      {selectedArt && (
        <Dialog open={!!selectedArt} onOpenChange={() => setSelectedArt(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2">
                  {getFileIcon(selectedArt.type)}
                  {selectedArt.title}
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteArtPiece(selectedArt)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Art Display */}
              <div className="bg-gray-50 rounded-lg p-4">
                {selectedArt.type === 'image' ? (
                  <img 
                    src={selectedArt.file_url} 
                    alt={selectedArt.title}
                    className="w-full max-h-96 object-contain rounded-lg"
                  />
                ) : selectedArt.type === 'video' ? (
                  <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Video className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Video Preview</p>
                      <p className="text-sm text-gray-500">{selectedArt.file_name}</p>
                    </div>
                  </div>
                ) : selectedArt.type === 'audio' ? (
                  <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="bg-white rounded-full p-6 mb-4 shadow-lg">
                        <Music className="h-12 w-12 text-blue-600" />
                      </div>
                      <p className="text-lg font-medium text-gray-900 mb-2">{selectedArt.title}</p>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => toggleAudioPlay(selectedArt.id)}
                      >
                        {audioPlaying === selectedArt.id ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Play
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <File className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Document</p>
                      <p className="text-sm text-gray-500">{selectedArt.file_name}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Art Details */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedArt.title}</h3>
                  {selectedArt.description && (
                    <p className="text-gray-600 mt-1">{selectedArt.description}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <File className="h-4 w-4" />
                    {selectedArt.file_name}
                  </span>
                  <span>{formatFileSize(selectedArt.file_size)}</span>
                  <span>{new Date(selectedArt.created_at).toLocaleDateString()}</span>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Details
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteArtPiece(selectedArt)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}