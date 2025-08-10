import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { enhancedSupabase } from '@/lib/supabase'
import { Loader2, Upload, User, MapPin, Phone, Camera, Instagram, Music, Palette, Crown, Star, Zap, X, Image, ChevronDown, ArrowRight, Sparkles, Users } from 'lucide-react'

interface ArtistProfileSetupProps {
  isOpen: boolean
  onClose: () => void
  existingProfile?: any
}

interface SubscriptionConfirmationProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade: (planId: string) => void
  selectedPlan: any
}

function SubscriptionConfirmationModal({ isOpen, onClose, onUpgrade, selectedPlan }: SubscriptionConfirmationProps) {
  const [upgrading, setUpgrading] = useState(false)

  const handleUpgrade = async (planId: string) => {
    setUpgrading(true)
    await onUpgrade(planId)
    setUpgrading(false)
  }

  const paidPlans = ARTIST_SUBSCRIPTION_PLANS.filter(plan => plan.id !== 'artist_starter')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            🎉 Welcome to Live Vibe!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Success Message */}
          <div className="text-center space-y-4">
            <div className="bg-gradient-to-r from-green-100 to-blue-100 p-6 rounded-lg">
              <div className="bg-white p-4 rounded-full w-fit mx-auto mb-4 shadow-lg">
                <Sparkles className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Your {selectedPlan?.name} Account is Ready!
              </h3>
              <p className="text-gray-600">
                You can now start uploading your portfolio and receiving booking requests from event organizers worldwide.
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="text-center">
                <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Upload Portfolio</p>
                <p className="text-xs text-gray-500">Show your work</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-2">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Get Discovered</p>
                <p className="text-xs text-gray-500">By organizers</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-2">
                  <Star className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Start Earning</p>
                <p className="text-xs text-gray-500">From bookings</p>
              </div>
            </div>
          </div>

          {/* Upgrade Options */}
          {selectedPlan?.id === 'artist_starter' && (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  🚀 Ready to Supercharge Your Career?
                </h4>
                <p className="text-gray-600 text-sm">
                  Upgrade now and get more bookings, AI generations, and premium features
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paidPlans.map((plan) => {
                  const IconComponent = plan.icon
                  return (
                    <Card key={plan.id} className={`border-2 hover:shadow-lg transition-all cursor-pointer ${
                      plan.popular ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <CardContent className="p-4">
                        {plan.popular && (
                          <div className="text-center mb-2">
                            <Badge className="bg-blue-600 text-white text-xs">Most Popular</Badge>
                          </div>
                        )}
                        <div className="text-center space-y-3">
                          <div className={`p-3 rounded-full w-fit mx-auto ${plan.bgColor}`}>
                            <IconComponent className={`h-6 w-6 ${plan.color}`} />
                          </div>
                          <div>
                            <h5 className="font-bold text-gray-900">{plan.name}</h5>
                            <div className="text-lg font-bold text-gray-900">{plan.price}</div>
                            <p className="text-xs text-gray-600 mt-1">{plan.description}</p>
                          </div>
                          <div className="space-y-1">
                            {plan.features.slice(0, 3).map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                <span>{feature}</span>
                              </div>
                            ))}
                            {plan.features.length > 3 && (
                              <p className="text-xs text-gray-500">+{plan.features.length - 3} more features</p>
                            )}
                          </div>
                          <Button
                            onClick={() => handleUpgrade(plan.id)}
                            disabled={upgrading}
                            className={`w-full ${
                              plan.popular 
                                ? 'bg-blue-600 hover:bg-blue-700' 
                                : 'bg-gray-600 hover:bg-gray-700'
                            }`}
                          >
                            {upgrading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Upgrading...
                              </>
                            ) : (
                              <>
                                <Crown className="mr-2 h-4 w-4" />
                                Upgrade Now
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Limited Time Offer</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Upgrade within 24 hours and get your first month 50% off! 
                  Plus, unlock unlimited AI showcase generations.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {selectedPlan?.id === 'artist_starter' ? (
              <>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Continue with Free Plan
                </Button>
                <Button
                  onClick={() => handleUpgrade('artist_pro')}
                  disabled={upgrading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {upgrading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Upgrading...
                    </>
                  ) : (
                    <>
                      <Star className="mr-2 h-4 w-4" />
                      Upgrade to Pro
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Start Building Your Portfolio
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const VISUAL_ARTIST_CATEGORIES = [
  'Fine Artists (Painters, Sculptors, Printmakers, Illustrators, Muralists, Installation artists)',
  'Applied/Decorative Artists (Graphic designers, Fashion designers, Industrial designers, Textile artists, Jewelers)',
  'Commercial/Media Artists (Photographers, Filmmakers, Animators, Video game artists, Set designers)',
  'Craft Artists (Ceramists, Potters, Glass artists, Woodworkers, Paper artists)',
  'Architectural and Environmental Artists (Architects, Landscape architects, Urban designers)'
]

const MUSIC_GENRES = [
  'Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz', 'Blues', 'Classical', 'Country',
  'R&B (Rhythm and Blues)', 'Reggae', 'Soul', 'Funk', 'Metal', 'Folk', 'Ska'
]

const INSTRUMENTS = [
  'Strings (Violin, guitar, cello)',
  'Woodwinds (Flute, clarinet, saxophone)',
  'Brass (Trumpet, trombone, tuba)',
  'Percussion (Drum, xylophone, cymbal)',
  'Keyboard (Piano, organ, synthesizer)',
  'Aerophones (Flute, trumpet, harmonica)',
  'Chordophones (Guitar, violin, harp)',
  'Idiophones (Xylophone, bell, maracas)',
  'Membranophones (Snare drum, conga, bass drum)',
  'Electrophones (Synthesizer, electric guitar, theremin)'
]

const ARTIST_SUBSCRIPTION_PLANS = [
  {
    id: 'artist_starter',
    name: 'Vibe Discovery',
    price: '$0/month',
    description: 'For emerging artists exploring opportunities',
    icon: Zap,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    features: [
      'Create Artist Profile',
      'Upload portfolio (up to 10 pieces)',
      'Basic profile visibility',
      'Receive booking requests',
      '1 AI showcase generation/month',
      'Standard 10% commission'
    ]
  },
  {
    id: 'artist_pro',
    name: 'Vibe Pro',
    price: '$15/month',
    description: 'For professional artists ready to grow',
    icon: Star,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    popular: true,
    features: [
      'All Discovery features',
      'Unlimited portfolio uploads',
      'Enhanced profile visibility',
      'Advanced booking tools',
      '10 AI showcase generations/month',
      'Analytics dashboard',
      'Priority support'
    ]
  },
  {
    id: 'artist_elite',
    name: 'Vibe Elite',
    price: '$35/month',
    description: 'For established artists maximizing income',
    icon: Crown,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    features: [
      'All Pro features',
      'Reduced 7% commission rate',
      'Unlimited AI showcase generations',
      'Featured artist placement',
      'Direct fan engagement tools',
      'Custom branding options',
      'Dedicated account manager'
    ]
  }
]

export function ArtistProfileSetup({ isOpen, onClose, existingProfile }: ArtistProfileSetupProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [step, setStep] = useState(1)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [createdPlan, setCreatedPlan] = useState<any>(null)
  const photoInputRef = React.useRef<HTMLInputElement>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: existingProfile?.name || '',
    phone_number: existingProfile?.phone_number || '',
    city: existingProfile?.city || '',
    state: existingProfile?.state || '',
    country: existingProfile?.country || '',
    travel_distance: existingProfile?.travel_distance?.toString() || '',
    profile_photo_url: existingProfile?.profile_photo_url || '',
    instagram: existingProfile?.instagram || '',
    tiktok: existingProfile?.tiktok || '',
    pinterest: existingProfile?.pinterest || '',
    youtube: existingProfile?.youtube || '',
    behance: existingProfile?.behance || '',
    facebook: existingProfile?.facebook || '',
    linkedin: existingProfile?.linkedin || '',
    spotify: existingProfile?.spotify || '',
    artist_type: existingProfile?.artist_type || '',
    visual_artist_category: existingProfile?.visual_artist_category || '',
    performing_artist_type: existingProfile?.performing_artist_type || '',
    music_genres: existingProfile?.music_genres || [] as string[],
    instruments: existingProfile?.instruments || [] as string[],
    subscription_plan: existingProfile?.subscription_plan || ''
  })

  // Update form data when existingProfile changes
  React.useEffect(() => {
    if (existingProfile) {
      setFormData({
        name: existingProfile.name || '',
        phone_number: existingProfile.phone_number || '',
        city: existingProfile.city || '',
        state: existingProfile.state || '',
        country: existingProfile.country || '',
        travel_distance: existingProfile.travel_distance?.toString() || '',
        profile_photo_url: existingProfile.profile_photo_url || '',
        instagram: existingProfile.instagram || '',
        tiktok: existingProfile.tiktok || '',
        pinterest: existingProfile.pinterest || '',
        youtube: existingProfile.youtube || '',
        behance: existingProfile.behance || '',
        facebook: existingProfile.facebook || '',
        linkedin: existingProfile.linkedin || '',
        spotify: existingProfile.spotify || '',
        artist_type: existingProfile.artist_type || '',
        visual_artist_category: existingProfile.visual_artist_category || '',
        performing_artist_type: existingProfile.performing_artist_type || '',
        music_genres: existingProfile.music_genres || [],
        instruments: existingProfile.instruments || [],
        subscription_plan: existingProfile.subscription_plan || ''
      })
    }
  }, [existingProfile])

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setStep(1)
    }
  }, [isOpen])

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleGenreChange = (genre: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({ ...prev, music_genres: [...prev.music_genres, genre] }))
    } else {
      setFormData(prev => ({ ...prev, music_genres: prev.music_genres.filter((g: string) => g !== genre) }))
    }
  }

  const handleInstrumentChange = (instrument: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({ ...prev, instruments: [...prev.instruments, instrument] }))
    } else {
      setFormData(prev => ({ ...prev, instruments: prev.instruments.filter((i: string) => i !== instrument) }))
    }
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setUploadingPhoto(true)
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/profile.${fileExt}`
      
      const { data, error } = await enhancedSupabase.storage
        .from('profile-photos')
        .upload(fileName, file, { upsert: true })

      if (error) throw error

      // Get public URL
              const { data: { publicUrl } } = enhancedSupabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName)

      setFormData(prev => ({ ...prev, profile_photo_url: publicUrl }))
      
      toast({
        title: "Success!",
        description: "Profile photo uploaded successfully",
      })
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload profile photo",
        variant: "destructive",
      })
    } finally {
      setUploadingPhoto(false)
    }
  }

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, profile_photo_url: '' }))
    if (photoInputRef.current) {
      photoInputRef.current.value = ''
    }
  }

  const handleUpgrade = async (planId: string) => {
    if (!user) return

    try {
      // Get the new plan details
                const { data: planData, error: planError } = await enhancedSupabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single()

      if (planError) throw planError

      // Update the subscription
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      
      const { error: subscriptionError } = await enhancedSupabase
        .from('user_subscriptions')
        .update({
          plan_id: planId,
          current_period_end: endDate.toISOString()
        })
        .eq('user_id', user.id)
        .eq('status', 'active')

      if (subscriptionError) throw subscriptionError

      toast({
        title: "Upgraded successfully!",
        description: `Welcome to ${planData.name}! Your new features are now active.`,
      })

      setShowConfirmation(false)
      onClose()
    } catch (error: any) {
      toast({
        title: "Upgrade failed",
        description: error.message || "Failed to upgrade subscription",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async () => {
    if (!user) return

    setLoading(true)
    try {
      // First create/update the artist profile
              const { error: profileError } = await enhancedSupabase
        .from('artist_profiles')
        .upsert({
          user_id: user.id,
          ...formData,
          travel_distance: formData.travel_distance ? parseInt(formData.travel_distance) : null,
          subscription_plan: formData.subscription_plan
        })

      if (profileError) throw profileError

      // If a subscription plan is selected, create/update the subscription
      if (formData.subscription_plan) {
        // Get the plan details
        const { data: planData, error: planError } = await enhancedSupabase
          .from('subscription_plans')
          .select('*')
          .eq('name', formData.subscription_plan)
          .eq('type', 'artist')
          .single()

        if (planError) {
          console.warn('Could not find subscription plan:', planError)
        } else if (planData) {
          // Remove any previous active subscription
          const { error: subscriptionError } = await enhancedSupabase
            .from('user_subscriptions')
            .delete()
            .eq('user_id', user.id)
            .eq('status', 'active')

          // Create new subscription
          const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          
          const { error: subscriptionError2 } = await enhancedSupabase
            .from('user_subscriptions')
            .insert({
              user_id: user.id,
              plan_id: planData.id,
              status: 'active',
              billing_cycle: 'monthly',
              current_period_start: new Date().toISOString(),
              current_period_end: endDate.toISOString()
            })

          if (subscriptionError2) {
            console.warn('Could not create subscription:', subscriptionError2)
          }
        }
      }

      // Find the selected plan for confirmation modal
      const selectedPlan = ARTIST_SUBSCRIPTION_PLANS.find(plan => 
        plan.name.toLowerCase().replace(' ', '_') === formData.subscription_plan ||
        plan.id === formData.subscription_plan
      )
      setCreatedPlan(selectedPlan)

      toast({
        title: "Success!",
        description: existingProfile 
          ? "Your artist profile has been updated successfully." 
          : "Your artist profile has been created successfully!",
      })
      
      if (!existingProfile) {
        // Show confirmation modal instead of closing immediately
        setShowConfirmation(true)
      } else {
        onClose()
      }
      
      // Redirect to profile page to see the created profile
      if (!existingProfile) {
        setTimeout(() => {
          const showProfileEvent = new CustomEvent('showProfile')
          window.dispatchEvent(showProfileEvent)
        }, 500)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || (existingProfile ? "Failed to update profile" : "Failed to create profile"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5))
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1))

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {existingProfile ? 'Edit Your Artist Profile' : 'Launch Your Artist Career'}
          </DialogTitle>
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i <= step ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600">Step {step} of 5 • {step === 1 ? 'Almost there!' : step === 5 ? 'Final step!' : 'Keep going!'}</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Let's Get You Discovered
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Event organizers use this info to find the perfect artist for their events. The more complete your profile, the more bookings you'll receive!
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone_number}
                      onChange={(e) => handleInputChange('phone_number', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Los Angeles"
                      required
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
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      placeholder="United States"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="travel">How far will you travel for work? (miles)</Label>
                  <Input
                    id="travel"
                    type="number"
                    value={formData.travel_distance}
                    onChange={(e) => handleInputChange('travel_distance', e.target.value)}
                    placeholder="50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo">Profile Photo URL</Label>
                  <div className="space-y-3">
                    {formData.profile_photo_url ? (
                      <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
                        <img 
                          src={formData.profile_photo_url} 
                          alt="Profile preview" 
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Profile photo uploaded</p>
                          <p className="text-sm text-gray-600">Your profile photo is ready</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removePhoto}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <input
                          ref={photoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label htmlFor="photo-upload" className="cursor-pointer">
                          <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Upload Profile Photo
                          </p>
                          <p className="text-xs text-gray-500">
                            JPG, PNG up to 5MB
                          </p>
                        </label>
                      </div>
                    )}
                    
                    <div className="text-center text-sm text-gray-500">or</div>
                    
                    <Input
                      id="photo-url"
                      value={formData.profile_photo_url}
                      onChange={(e) => handleInputChange('profile_photo_url', e.target.value)}
                      placeholder="Enter photo URL"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Social Media */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Instagram className="h-5 w-5" />
                  Showcase Your Online Presence
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Social media links build trust with organizers and show your professional reach. Add as many as you have!
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.instagram}
                      onChange={(e) => handleInputChange('instagram', e.target.value)}
                      placeholder="@username or full URL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tiktok">TikTok</Label>
                    <Input
                      id="tiktok"
                      value={formData.tiktok}
                      onChange={(e) => handleInputChange('tiktok', e.target.value)}
                      placeholder="@username or full URL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input
                      id="youtube"
                      value={formData.youtube}
                      onChange={(e) => handleInputChange('youtube', e.target.value)}
                      placeholder="Channel URL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={formData.facebook}
                      onChange={(e) => handleInputChange('facebook', e.target.value)}
                      placeholder="Profile or page URL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={formData.linkedin}
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      placeholder="Profile URL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="behance">Behance</Label>
                    <Input
                      id="behance"
                      value={formData.behance}
                      onChange={(e) => handleInputChange('behance', e.target.value)}
                      placeholder="Portfolio URL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pinterest">Pinterest</Label>
                    <Input
                      id="pinterest"
                      value={formData.pinterest}
                      onChange={(e) => handleInputChange('pinterest', e.target.value)}
                      placeholder="Profile URL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spotify">Spotify</Label>
                    <Input
                      id="spotify"
                      value={formData.spotify}
                      onChange={(e) => handleInputChange('spotify', e.target.value)}
                      placeholder="Artist profile URL"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Artist Type */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Define Your Artistic Identity
                </CardTitle>
                <p className="text-sm text-gray-600">
                  This helps us match you with the perfect events. Choose what best describes your artistic talents.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Are you a visual artist, performing artist, or both? *</Label>
                  <RadioGroup
                    value={formData.artist_type}
                    onValueChange={(value) => handleInputChange('artist_type', value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="visual" id="visual" />
                      <Label htmlFor="visual">Visual Artist</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="performing" id="performing" />
                      <Label htmlFor="performing">Performing Artist</Label>
                    </div>
                    <div className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                      formData.artist_type === 'both' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <RadioGroupItem value="both" id="both" />
                      <Label htmlFor="both">Both</Label>
                    </div>
                  </RadioGroup>
                </div>

                {(formData.artist_type === 'visual' || formData.artist_type === 'both') && (
                  <div className="space-y-4">
                    <Label>Visual Artist Category</Label>
                    <Select
                      value={formData.visual_artist_category}
                      onValueChange={(value) => handleInputChange('visual_artist_category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your category" />
                      </SelectTrigger>
                      <SelectContent>
                        {VISUAL_ARTIST_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {(formData.artist_type === 'performing' || formData.artist_type === 'both') && (
                  <div className="space-y-4">
                    <Label>Performing Artist Type</Label>
                    <RadioGroup
                      value={formData.performing_artist_type}
                      onValueChange={(value) => handleInputChange('performing_artist_type', value)}
                      className="space-y-3"
                    >
                      <div className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                        formData.performing_artist_type === 'singer' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <RadioGroupItem value="singer" id="singer-vocalist" />
                        <Label htmlFor="singer-vocalist">Singers/Vocalists: Use their voice to interpret and perform songs</Label>
                      </div>
                      <div className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                        formData.performing_artist_type === 'instrumentalist' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <RadioGroupItem value="instrumentalist" id="instrumentalist-musician" />
                        <Label htmlFor="instrumentalist-musician">Instrumentalists/Musicians: Play musical instruments (piano, guitar, violin, drums, etc.)</Label>
                      </div>
                      <div className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                        formData.performing_artist_type === 'both' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <RadioGroupItem value="both" id="singer-and-instrumentalist" />
                        <Label htmlFor="singer-and-instrumentalist">Both</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 4: Music Details */}
          {step === 4 && (formData.artist_type === 'performing' || formData.artist_type === 'both') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Show Off Your Musical Skills
                </CardTitle>
                <p className="text-sm text-gray-600">
                  The more genres and instruments you select, the more event opportunities you'll receive. Don't be modest!
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>What genre(s) of music do you play professionally?</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {MUSIC_GENRES.map((genre) => (
                      <div key={genre} className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                        formData.music_genres.includes(genre)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <Checkbox
                          id={genre}
                          checked={formData.music_genres.includes(genre)}
                          onCheckedChange={(checked) => handleGenreChange(genre, checked as boolean)}
                        />
                        <Label htmlFor={genre} className="text-sm font-medium cursor-pointer flex-1">{genre}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {(formData.performing_artist_type === 'instrumentalist' || formData.performing_artist_type === 'both') && (
                  <div className="space-y-4">
                    <Label>What instrument(s) do you play professionally?</Label>
                    <div className="grid grid-cols-1 gap-3">
                      {INSTRUMENTS.map((instrument) => (
                        <div key={instrument} className={`flex items-center space-x-2 p-2 rounded-lg border transition-colors ${
                          formData.instruments.includes(instrument)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <Checkbox
                            id={instrument}
                            checked={formData.instruments.includes(instrument)}
                            onCheckedChange={(checked) => handleInstrumentChange(instrument, checked as boolean)}
                          />
                          <Label htmlFor={instrument} className="text-sm font-medium cursor-pointer flex-1">{instrument}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 5: Subscription Plan */}
          {step === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Choose Your Success Plan
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Start free and upgrade anytime. All plans include booking management and secure payments.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Which plan fits your artistic goals? *</Label>
                  <RadioGroup
                    value={formData.subscription_plan}
                    onValueChange={(value) => handleInputChange('subscription_plan', value)}
                    className="space-y-4"
                  >
                    {ARTIST_SUBSCRIPTION_PLANS.map((plan) => {
                      const IconComponent = plan.icon
                      return (
                        <div key={plan.id} className={`relative p-4 rounded-lg border-2 transition-colors ${
                          formData.subscription_plan === plan.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          {plan.popular && (
                            <div className="absolute -top-2 left-4">
                              <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                            </div>
                          )}
                          <div className="flex items-start space-x-3">
                            <RadioGroupItem value={plan.id} id={plan.id} className="mt-1" />
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`p-2 rounded-full ${plan.bgColor}`}>
                                  <IconComponent className={`h-4 w-4 ${plan.color}`} />
                                </div>
                                <div>
                                  <Label htmlFor={plan.id} className="font-semibold text-gray-900">{plan.name}</Label>
                                  <div className="text-lg font-bold text-gray-900">{plan.price}</div>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                                {plan.features.map((feature, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                    <span>{feature}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
            >
              <ChevronDown className="mr-2 h-4 w-4 rotate-90" />
              Previous
            </Button>
            
            {step < 5 ? (
              <Button
                onClick={nextStep}
                disabled={
                  (step === 1 && (!formData.name || !formData.city || !formData.country)) ||
                  (step === 3 && !formData.artist_type) ||
                  (step === 4 && (formData.artist_type === 'performing' || formData.artist_type === 'both') && formData.music_genres.length === 0)
                }
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || uploadingPhoto || !formData.artist_type || !formData.subscription_plan}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {loading || uploadingPhoto ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {uploadingPhoto ? 'Uploading Photo...' : existingProfile ? 'Updating Profile...' : 'Creating Profile...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {existingProfile ? 'Update Profile' : 'Launch My Artist Career 🚀'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
      
      <SubscriptionConfirmationModal
        isOpen={showConfirmation}
        onClose={() => { setShowConfirmation(false); onClose(); }}
        onUpgrade={handleUpgrade}
        selectedPlan={createdPlan}
      />
    </Dialog>
  )
}