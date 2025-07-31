import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { enhancedSupabase } from '@/lib/supabase'
import { EventCreator } from './EventCreator'
import { 
  Search, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Music, 
  Star, 
  Filter,
  Users,
  Clock,
  Send,
  Heart,
  Eye,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

interface Artist {
  id: string
  name: string
  city: string
  state: string
  country: string
  profile_photo_url: string
  artist_type: string
  music_genres: string[]
  instruments: string[]
  travel_distance: number
  user_id: string
}

interface Event {
  id: string
  title: string
  description: string
  event_date: string
  venue_name: string
  venue_address: string
  city: string
  state: string
  country: string
  budget_min: number
  budget_max: number
  required_genres: string[]
  event_type: string
  duration_hours: number
  audience_size: number
  status: string
  organizer_id: string
}

interface Booking {
  id: string
  event_id: string
  artist_id: string
  organizer_id: string
  status: string
  proposed_fee: number
  final_fee: number
  message: string
  created_at: string
  event: Event
  artist: Artist
}

interface EventBookingSystemProps {
  isOpen: boolean
  onClose: () => void
}

const MUSIC_GENRES = [
  'Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz', 'Blues', 'Classical', 'Country',
  'R&B', 'Reggae', 'Soul', 'Funk', 'Metal', 'Folk', 'Ska'
]

const EVENT_TYPES = [
  { value: 'concert', label: 'Concert' },
  { value: 'festival', label: 'Festival' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'corporate', label: 'Corporate Event' },
  { value: 'private_party', label: 'Private Party' },
  { value: 'club', label: 'Club/Bar' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'other', label: 'Other' }
]

export function EventBookingSystem({ isOpen, onClose }: EventBookingSystemProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState<'search' | 'events' | 'bookings'>('search')
  const [artists, setArtists] = useState<Artist[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [eventCreatorOpen, setEventCreatorOpen] = useState(false)
  
  // Search filters
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    genre: '',
    budget_min: '',
    budget_max: '',
    event_type: '',
    date_from: '',
    date_to: ''
  })
  
  // Booking form
  const [bookingForm, setBookingForm] = useState({
    event_id: '',
    proposed_fee: '',
    message: ''
  })

  useEffect(() => {
    if (isOpen && user) {
      if (activeTab === 'search') {
        searchArtists()
      } else if (activeTab === 'events') {
        fetchMyEvents()
      } else if (activeTab === 'bookings') {
        fetchMyBookings()
      }
    }
  }, [isOpen, user, activeTab])

  const searchArtists = async () => {
    setLoading(true)
    try {
      let query = enhancedSupabase
        .from('artist_profiles')
        .select(`
          *,
          users!inner(id, email)
        `)

      // Apply filters
      if (searchFilters.location) {
        query = query.or(`city.ilike.%${searchFilters.location}%,state.ilike.%${searchFilters.location}%,country.ilike.%${searchFilters.location}%`)
      }
      
      if (searchFilters.genre) {
        query = query.contains('music_genres', [searchFilters.genre])
      }

      const { data, error } = await query.limit(20)

      if (error) throw error

      const formattedArtists = data?.map(profile => ({
        id: profile.id,
        name: profile.name,
        city: profile.city || '',
        state: profile.state || '',
        country: profile.country || '',
        profile_photo_url: profile.profile_photo_url || '',
        artist_type: profile.artist_type || '',
        music_genres: profile.music_genres || [],
        instruments: profile.instruments || [],
        travel_distance: profile.travel_distance || 0,
        user_id: profile.user_id
      })) || []

      setArtists(formattedArtists)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to search artists",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchMyEvents = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data, error } = await enhancedSupabase
        .from('events')
        .select('*')
        .eq('organizer_id', user.id)
        .order('event_date', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchMyBookings = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data, error } = await enhancedSupabase
        .from('bookings')
        .select(`
          *,
          event:events(*),
          artist:artist_profiles(*)
        `)
        .eq('organizer_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBookings(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBookArtist = (artist: Artist) => {
    setSelectedArtist(artist)
    setBookingModalOpen(true)
  }

  const submitBookingRequest = async () => {
    if (!user || !selectedArtist || !bookingForm.event_id || !bookingForm.proposed_fee) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await enhancedSupabase
        .from('bookings')
        .insert({
          event_id: bookingForm.event_id,
          artist_id: selectedArtist.user_id,
          organizer_id: user.id,
          proposed_fee: parseInt(bookingForm.proposed_fee) * 100, // Convert to cents
          message: bookingForm.message,
          status: 'pending'
        })

      if (error) throw error

      toast({
        title: "Booking request sent!",
        description: "The artist will be notified of your booking request.",
      })

      setBookingModalOpen(false)
      setBookingForm({ event_id: '', proposed_fee: '', message: '' })
      
      if (activeTab === 'bookings') {
        fetchMyBookings()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send booking request",
        variant: "destructive",
      })
    }
  }

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toLocaleString()}`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'accepted': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'declined': return <XCircle className="h-4 w-4 text-red-500" />
      case 'cancelled': return <XCircle className="h-4 w-4 text-gray-500" />
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'declined': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Event Booking System
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6">
          <Button
            variant={activeTab === 'search' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('search')}
            className="flex-1"
          >
            <Search className="h-4 w-4 mr-2" />
            Find Artists
          </Button>
          <Button
            variant={activeTab === 'events' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('events')}
            className="flex-1"
          >
            <Calendar className="h-4 w-4 mr-2" />
            My Events
          </Button>
          <Button
            variant={activeTab === 'bookings' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('bookings')}
            className="flex-1"
          >
            <Users className="h-4 w-4 mr-2" />
            My Bookings
          </Button>
        </div>

        {/* Search Artists Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            {/* Search Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Search Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      placeholder="City, State, or Country"
                      value={searchFilters.location}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Genre</Label>
                    <Select
                      value={searchFilters.genre}
                      onValueChange={(value) => setSearchFilters(prev => ({ ...prev, genre: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Genres</SelectItem>
                        {MUSIC_GENRES.map(genre => (
                          <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Event Type</Label>
                    <Select
                      value={searchFilters.event_type}
                      onValueChange={(value) => setSearchFilters(prev => ({ ...prev, event_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Types</SelectItem>
                        {EVENT_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={searchArtists} className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Search Artists
                </Button>
              </CardContent>
            </Card>

            {/* Artists Results */}
            <Card>
              <CardHeader>
                <CardTitle>Available Artists ({artists.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Searching for artists...</p>
                  </div>
                ) : artists.length === 0 ? (
                  <div className="text-center py-12">
                    <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No artists found</h3>
                    <p className="text-gray-600">Try adjusting your search filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {artists.map((artist) => (
                      <Card key={artist.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={artist.profile_photo_url} alt={artist.name} />
                              <AvatarFallback>{artist.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{artist.name}</h3>
                              <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                                <MapPin className="h-3 w-3" />
                                <span>{[artist.city, artist.state, artist.country].filter(Boolean).join(', ')}</span>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {artist.artist_type}
                              </Badge>
                            </div>
                          </div>
                          
                          {artist.music_genres.length > 0 && (
                            <div className="mb-4">
                              <div className="flex flex-wrap gap-1">
                                {artist.music_genres.slice(0, 3).map((genre) => (
                                  <Badge key={genre} variant="outline" className="text-xs">
                                    {genre}
                                  </Badge>
                                ))}
                                {artist.music_genres.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{artist.music_genres.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleBookArtist(artist)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Book Artist
                            </Button>
                            <Button variant="outline" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon">
                              <Heart className="h-4 w-4" />
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
        )}

        {/* My Events Tab */}
        {activeTab === 'events' && (
          <Card>
            <CardHeader>
              <CardTitle>My Events ({events.length})</CardTitle>
              <Button
                onClick={() => setEventCreatorOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Loading your events...</p>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
                  <p className="text-gray-600">Create your first event to start booking artists</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <Card key={event.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(event.event_date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{event.venue_name}, {event.city}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                <span>${event.budget_min} - ${event.budget_max}</span>
                              </div>
                            </div>
                            {event.required_genres.length > 0 && (
                              <div className="mt-3">
                                <div className="flex flex-wrap gap-1">
                                  {event.required_genres.map((genre) => (
                                    <Badge key={genre} variant="outline" className="text-xs">
                                      {genre}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(event.status)}>
                              {event.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* My Bookings Tab */}
        {activeTab === 'bookings' && (
          <Card>
            <CardHeader>
              <CardTitle>My Bookings ({bookings.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Loading your bookings...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                  <p className="text-gray-600">Start booking artists for your events</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <Card key={booking.id} className="border-l-4 border-l-purple-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={booking.artist?.profile_photo_url} alt={booking.artist?.name} />
                              <AvatarFallback>{booking.artist?.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-gray-900">{booking.artist?.name}</h3>
                              <p className="text-sm text-gray-600">{booking.event?.title}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(booking.event?.event_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(booking.status)}
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Proposed Fee:</span>
                            <span className="font-medium ml-2">{formatPrice(booking.proposed_fee)}</span>
                          </div>
                          {booking.final_fee > 0 && (
                            <div>
                              <span className="text-gray-500">Final Fee:</span>
                              <span className="font-medium ml-2">{formatPrice(booking.final_fee)}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-500">Requested:</span>
                            <span className="font-medium ml-2">{new Date(booking.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        {booking.message && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">{booking.message}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Booking Modal */}
        <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Book {selectedArtist?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Event</Label>
                <Select
                  value={bookingForm.event_id}
                  onValueChange={(value) => setBookingForm(prev => ({ ...prev, event_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.filter(e => e.status === 'published' || e.status === 'booking_open').map(event => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title} - {new Date(event.event_date).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Proposed Fee ($)</Label>
                <Input
                  type="number"
                  placeholder="Enter your offer"
                  value={bookingForm.proposed_fee}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, proposed_fee: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Message (Optional)</Label>
                <Textarea
                  placeholder="Add a personal message to the artist..."
                  value={bookingForm.message}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setBookingModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitBookingRequest}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Event Creator Modal */}
        <EventCreator
          isOpen={eventCreatorOpen}
          onClose={() => setEventCreatorOpen(false)}
          onEventCreated={fetchMyEvents}
        />
      </DialogContent>
    </Dialog>
  )
}