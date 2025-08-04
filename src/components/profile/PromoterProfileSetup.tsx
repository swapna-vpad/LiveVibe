import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { enhancedSupabase } from '@/lib/supabase'
import { 
  Loader2, 
  User, 
  MapPin, 
  Phone, 
  Camera, 
  Instagram, 
  Users,
  Crown,
  Zap,
  Star,
  Globe
} from 'lucide-react'

interface PromoterProfileSetupProps {
  isOpen: boolean
  onClose: () => void
  existingProfile?: any
}

const SUBSCRIPTION_PLANS = [
  {
    id: 'freemium',
    name: 'Vibe Discovery',
    price: '$0/month',
    description: 'For occasional organizers exploring the talent pool',
    icon: Zap,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    features: [
      'Create Organizer Profile',
      'Browse Artist Marketplace',
      'Send booking requests',
      'Bookmark favorite artists',
      'Limited to 3 AI suggestions/week',
      'Manage 1 active event'
    ]
  },
  {
    id: 'vibe_pro',
    name: 'Vibe Pro',
    price: '$25/month',
    description: 'For professional event organizers and venues',
    icon: Star,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    popular: true,
    features: [
      'All Discovery features',
      'Unlimited event management',
      'Advanced search filters',
      'Unlimited AI suggestions',
      'Calendar integration',
      'Contract management',
      'Collaborator Finder access'
    ]
  },
  {
    id: 'vibe_elite',
    name: 'Vibe Elite',
    price: '$60/month',
    description: 'For high-volume agencies and large organizations',
    icon: Crown,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    features: [
      'All Pro features',
      'Team accounts',
      'Reduced 8% commission for artists',
      'Direct outreach tools',
      'Custom analytics & reporting',
      'Dedicated account manager',
      'Priority support'
    ]
  }
]

export function PromoterProfileSetup({ isOpen, onClose, existingProfile }: PromoterProfileSetupProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: existingProfile?.name || '',
    phone_number: existingProfile?.phone_number || '',
    city: existingProfile?.city || '',
    state: existingProfile?.state || '',
    country: existingProfile?.country || '',
    number_of_clients: existingProfile?.number_of_clients?.toString() || '',
    profile_photo_url: existingProfile?.profile_photo_url || '',
    instagram: existingProfile?.instagram || '',
    tiktok: existingProfile?.tiktok || '',
    pinterest: existingProfile?.pinterest || '',
    youtube: existingProfile?.youtube || '',
    behance: existingProfile?.behance || '',
    facebook: existingProfile?.facebook || '',
    linkedin: existingProfile?.linkedin || '',
    spotify: existingProfile?.spotify || '',
    promoter_type: existingProfile?.promoter_type || '',
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
        number_of_clients: existingProfile.number_of_clients?.toString() || '',
        profile_photo_url: existingProfile.profile_photo_url || '',
        instagram: existingProfile.instagram || '',
        tiktok: existingProfile.tiktok || '',
        pinterest: existingProfile.pinterest || '',
        youtube: existingProfile.youtube || '',
        behance: existingProfile.behance || '',
        facebook: existingProfile.facebook || '',
        linkedin: existingProfile.linkedin || '',
        spotify: existingProfile.spotify || '',
        promoter_type: existingProfile.promoter_type || '',
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!user) return

    setLoading(true)
    try {
              const { error } = await enhancedSupabase
        .from('promoter_profiles')
        .upsert({
          user_id: user.id,
          ...formData,
          number_of_clients: formData.number_of_clients ? parseInt(formData.number_of_clients) : 0
        })

      if (error) throw error

      toast({
        title: "Success!",
        description: existingProfile ? "Your promoter profile has been updated successfully." : "Your promoter profile has been created successfully.",
      })
      onClose()
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

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4))
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1))

  const selectedPlan = SUBSCRIPTION_PLANS.find(plan => plan.id === formData.subscription_plan)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {existingProfile ? 'Edit Your Promoter Profile' : 'Create Your Promoter Profile'}
          </DialogTitle>
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i <= step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600">Step {step} of 4</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
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
                    <Label htmlFor="city">City</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="clients">Number of Clients</Label>
                  <Input
                    id="clients"
                    type="number"
                    value={formData.number_of_clients}
                    onChange={(e) => handleInputChange('number_of_clients', e.target.value)}
                    placeholder="50"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo">Profile Photo URL</Label>
                  <Input
                    id="photo"
                    value={formData.profile_photo_url}
                    onChange={(e) => handleInputChange('profile_photo_url', e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Social Media */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Social Media Profiles
                </CardTitle>
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
                      placeholder="Profile URL"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Promoter Type */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Promoter Type
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Are you a promoter or curator? *</Label>
                  <RadioGroup
                    value={formData.promoter_type}
                    onValueChange={(value) => handleInputChange('promoter_type', value)}
                    className="space-y-3"
                  >
                    <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors ${
                      formData.promoter_type === 'promoter' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <RadioGroupItem value="promoter" id="promoter" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="promoter" className="font-medium text-gray-900">Promoter</Label>
                        <p className="text-sm text-gray-600 mt-1">
                          I organize and promote events, concerts, and performances. I book artists and manage event logistics.
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors ${
                      formData.promoter_type === 'curator' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <RadioGroupItem value="curator" id="curator" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="curator" className="font-medium text-gray-900">Curator</Label>
                        <p className="text-sm text-gray-600 mt-1">
                          I curate artistic experiences and exhibitions. I select and showcase artists for galleries, venues, or cultural events.
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Subscription Plan */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Choose Your Subscription Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Which subscription plan would you like to use? *</Label>
                  <RadioGroup
                    value={formData.subscription_plan}
                    onValueChange={(value) => handleInputChange('subscription_plan', value)}
                    className="space-y-4"
                  >
                    {SUBSCRIPTION_PLANS.map((plan) => {
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
              Previous
            </Button>
            
            {step < 4 ? (
              <Button
                onClick={nextStep}
                disabled={
                  (step === 1 && !formData.name) ||
                  (step === 3 && !formData.promoter_type)
                }
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || uploadingPhoto || !formData.promoter_type || !formData.subscription_plan}
              >
                {loading || uploadingPhoto ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {uploadingPhoto ? 'Uploading Photo...' : existingProfile ? 'Updating Profile...' : 'Creating Profile...'}
                  </>
                ) : (
                  existingProfile ? 'Update Profile' : 'Create Profile'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}