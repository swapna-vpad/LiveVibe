import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { enhancedSupabase } from '@/lib/supabase'
import { Calendar, MapPin, DollarSign, Users, Clock, Music, Loader2 } from 'lucide-react'

interface EventCreatorProps {
  isOpen: boolean
  onClose: () => void
  onEventCreated?: () => void
}

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

const MUSIC_GENRES = [
  'Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz', 'Blues', 'Classical', 'Country',
  'R&B', 'Reggae', 'Soul', 'Funk', 'Metal', 'Folk', 'Ska'
]

export function EventCreator({ isOpen, onClose, onEventCreated }: EventCreatorProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    venue_name: '',
    venue_address: '',
    city: '',
    state: '',
    country: '',
    budget_min: '',
    budget_max: '',
    event_type: '',
    duration_hours: '2',
    audience_size: '',
    required_genres: [] as string[],
    status: 'draft'
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleGenreChange = (genre: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({ ...prev, required_genres: [...prev.required_genres, genre] }))
    } else {
      setFormData(prev => ({ ...prev, required_genres: prev.required_genres.filter(g => g !== genre) }))
    }
  }

  const handleSubmit = async () => {
    if (!user || !formData.title || !formData.event_date || !formData.venue_name) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Combine date and time
      const eventDateTime = formData.event_time 
        ? `${formData.event_date}T${formData.event_time}:00`
        : `${formData.event_date}T12:00:00`

      const { error } = await enhancedSupabase
        .from('events')
        .insert({
          organizer_id: user.id,
          title: formData.title.trim(),
          description: formData.description.trim(),
          event_date: eventDateTime,
          venue_name: formData.venue_name.trim(),
          venue_address: formData.venue_address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          country: formData.country.trim(),
          budget_min: formData.budget_min ? parseInt(formData.budget_min) : 0,
          budget_max: formData.budget_max ? parseInt(formData.budget_max) : 0,
          event_type: formData.event_type,
          duration_hours: parseInt(formData.duration_hours),
          audience_size: formData.audience_size ? parseInt(formData.audience_size) : 0,
          required_genres: formData.required_genres,
          status: formData.status
        })

      if (error) throw error

      toast({
        title: "Event created!",
        description: "Your event has been created successfully.",
      })

      // Reset form
      setFormData({
        title: '',
        description: '',
        event_date: '',
        event_time: '',
        venue_name: '',
        venue_address: '',
        city: '',
        state: '',
        country: '',
        budget_min: '',
        budget_max: '',
        event_type: '',
        duration_hours: '2',
        audience_size: '',
        required_genres: [],
        status: 'draft'
      })

      onEventCreated?.()
      onClose()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Create New Event
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Summer Music Festival"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your event..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event_date">Event Date *</Label>
                  <Input
                    id="event_date"
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => handleInputChange('event_date', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event_time">Event Time</Label>
                  <Input
                    id="event_time"
                    type="time"
                    value={formData.event_time}
                    onChange={(e) => handleInputChange('event_time', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event_type">Event Type</Label>
                  <Select
                    value={formData.event_type}
                    onValueChange={(value) => handleInputChange('event_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration_hours">Duration (hours)</Label>
                  <Input
                    id="duration_hours"
                    type="number"
                    value={formData.duration_hours}
                    onChange={(e) => handleInputChange('duration_hours', e.target.value)}
                    min="1"
                    max="24"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Venue Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Venue Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="venue_name">Venue Name *</Label>
                <Input
                  id="venue_name"
                  value={formData.venue_name}
                  onChange={(e) => handleInputChange('venue_name', e.target.value)}
                  placeholder="The Grand Theater"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue_address">Venue Address</Label>
                <Input
                  id="venue_address"
                  value={formData.venue_address}
                  onChange={(e) => handleInputChange('venue_address', e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Los Angeles"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="California"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="United States"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget and Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Budget & Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget_min">Minimum Budget ($)</Label>
                  <Input
                    id="budget_min"
                    type="number"
                    value={formData.budget_min}
                    onChange={(e) => handleInputChange('budget_min', e.target.value)}
                    placeholder="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget_max">Maximum Budget ($)</Label>
                  <Input
                    id="budget_max"
                    type="number"
                    value={formData.budget_max}
                    onChange={(e) => handleInputChange('budget_max', e.target.value)}
                    placeholder="5000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience_size">Expected Audience Size</Label>
                <Input
                  id="audience_size"
                  type="number"
                  value={formData.audience_size}
                  onChange={(e) => handleInputChange('audience_size', e.target.value)}
                  placeholder="200"
                />
              </div>

              <div className="space-y-3">
                <Label>Preferred Music Genres</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {MUSIC_GENRES.map((genre) => (
                    <div key={genre} className="flex items-center space-x-2">
                      <Checkbox
                        id={genre}
                        checked={formData.required_genres.includes(genre)}
                        onCheckedChange={(checked) => handleGenreChange(genre, checked as boolean)}
                      />
                      <Label htmlFor={genre} className="text-sm">{genre}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setFormData(prev => ({ ...prev, status: 'draft' }))
                handleSubmit()
              }}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              Save as Draft
            </Button>
            <Button
              onClick={() => {
                setFormData(prev => ({ ...prev, status: 'published' }))
                handleSubmit()
              }}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Publish Event'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}