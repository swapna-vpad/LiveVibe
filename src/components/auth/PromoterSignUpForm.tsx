import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { enhancedSupabase } from '@/lib/supabase'
import { Loader2, Mail, Lock, User, MapPin, Music, Users } from 'lucide-react'

interface PromoterSignUpFormProps {
  onBack: () => void
  onClose: () => void
}

const CREATOR_TYPES = [
  { value: 'artist', label: 'Artist', icon: '🎨' },
  { value: 'band', label: 'Band', icon: '🎸' },
  { value: 'curator', label: 'Curator', icon: '🎭' },
  { value: 'dj', label: 'DJ', icon: '🎧' },
  { value: 'educator', label: 'Educator', icon: '📚' },
  { value: 'podcaster', label: 'Podcaster', icon: '🎙️' },
  { value: 'producer', label: 'Producer', icon: '🎛️' },
  { value: 'venue', label: 'Venue', icon: '🏢' },
  { value: 'musician', label: 'Musician', icon: '🎼' },
  { value: 'singer-songwriter', label: 'Singer-Songwriter', icon: '🎤' }
]

const PLATFORMS = [
  { value: 'ios', label: 'iOS', icon: '📱' },
  { value: 'android', label: 'Android', icon: '🤖' }
]

export function PromoterSignUpForm({ onBack, onClose }: PromoterSignUpFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    stageName: '',
    email: '',
    password: '',
    confirmPassword: '',
    cityLocation: '',
    creatorType: '',
    platform: ''
  })
  const [loading, setLoading] = useState(false)
  const [showCreatorTypeDropdown, setShowCreatorTypeDropdown] = useState(false)
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false)
  
  const { signUp } = useAuth()
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCreatorTypeSelect = (type: string) => {
    handleInputChange('creatorType', type)
    setShowCreatorTypeDropdown(false)
  }

  const handlePlatformSelect = (platform: string) => {
    handleInputChange('platform', platform)
    setShowPlatformDropdown(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      })
      return
    }

    if (!formData.creatorType) {
      toast({
        title: "Error",
        description: "Please select a creator type",
        variant: "destructive",
      })
      return
    }

    if (!formData.platform) {
      toast({
        title: "Error",
        description: "Please select a platform",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    
    try {
      const { error } = await signUp(formData.email, formData.password, 'promoter')
      
      if (error) {
        if (error.message.includes('User already registered') || error.message.includes('user_already_exists')) {
          toast({
            title: "Account Already Exists",
            description: "This email is already registered. Please sign in instead.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          })
        }
      } else {
        // Save user data to appropriate tables
        try {
          const { data: { user } } = await enhancedSupabase.auth.getUser()
          
          if (user) {
            // Save to auth_table
            const { error: authError } = await enhancedSupabase
              .from('auth_table')
              .insert({
                user_id: user.id,
                user_type: 'promoter',
                email: formData.email
              })
            
            if (authError) {
              console.error('Error saving to auth_table:', authError)
            }
            
            // Save to promoter_profiles
            const { error: promoterError } = await enhancedSupabase
              .from('promoter_profiles')
              .insert({
                user_id: user.id,
                name: `${formData.firstName} ${formData.lastName}`,
                promoter_type: formData.creatorType,
                subscription_plan: 'freemium'
              })
            
            if (promoterError) {
              console.error('Error saving to promoter_profiles:', promoterError)
            }
          }
        } catch (profileError) {
          console.error('Error creating profile:', profileError)
        }
        
        toast({
          title: "Success!",
          description: "🎉 Welcome to Live Vibe! Your promoter account has been created successfully.",
        })
        
        // Close the signup modal
        onClose()
        
        // Redirect directly to PromoterProfileSetup
        // Dispatch a custom event to trigger navigation to PromoterProfileSetup
      /*  const redirectToPromoterSetupEvent = new CustomEvent('redirectToPromoterProfileSetup', {
          detail: {
            userData: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              creatorType: formData.creatorType,
              cityLocation: formData.cityLocation
            }
          }  
        }) 
        window.dispatchEvent(redirectToPromoterSetupEvent)*/
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedCreatorType = CREATOR_TYPES.find(type => type.value === formData.creatorType)
  const selectedPlatform = PLATFORMS.find(platform => platform.value === formData.platform)

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm max-h-[85vh] overflow-y-auto">
      <CardHeader className="space-y-1 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-teal-600 to-blue-500 w-12 h-12 rounded-full flex items-center justify-center">
            <Users className="h-6 w-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Promoter Sign Up</CardTitle>
        <CardDescription>
          Create your promoter account and start organizing amazing events
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 px-6 pb-6">
        {/* Back Button */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
          >
            ← Back to role selection
          </button>
          <div className="text-sm text-gray-500">
            Selected: <span className="font-medium">Promoter</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4 border-b border-gray-100 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Personal Information
            </h3>
            
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                  className="h-12 rounded-xl border-2 focus:border-teal-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                  className="h-12 rounded-xl border-2 focus:border-teal-400"
                />
              </div>
            </div>

            {/* Stage Name */}
            <div className="space-y-2">
              <Label htmlFor="stageName">Stage Name</Label>
              <div className="relative">
                <Music className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="stageName"
                  type="text"
                  placeholder="Enter your stage name"
                  value={formData.stageName}
                  onChange={(e) => handleInputChange('stageName', e.target.value)}
                  className="pl-10 h-12 rounded-xl border-2 focus:border-teal-400"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4 border-b border-gray-100 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Contact Information
            </h3>
            
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="pl-10 h-12 rounded-xl border-2 focus:border-teal-400"
                />
              </div>
            </div>

            {/* City Location */}
            <div className="space-y-2">
              <Label htmlFor="cityLocation">City Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="cityLocation"
                  type="text"
                  placeholder="Enter your city"
                  value={formData.cityLocation}
                  onChange={(e) => handleInputChange('cityLocation', e.target.value)}
                  required
                  className="pl-10 h-12 rounded-xl border-2 focus:border-teal-400"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4 border-b border-gray-100 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Preferences
            </h3>
            
            {/* Creator Type Selection */}
            <div className="space-y-2">
              <Label>Select Creator Type: *</Label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCreatorTypeDropdown(!showCreatorTypeDropdown)}
                  className="w-full h-12 px-3 text-left border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none bg-white"
                >
                  {selectedCreatorType ? (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{selectedCreatorType.icon}</span>
                      <span>{selectedCreatorType.label}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">Select a creator type...</span>
                  )}
                </button>
                
                {showCreatorTypeDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    <Command>
                      <CommandInput placeholder="Search creator types..." />
                      <CommandList>
                        <CommandEmpty>No creator type found.</CommandEmpty>
                        <CommandGroup>
                          {CREATOR_TYPES.map((type) => (
                            <CommandItem
                              key={type.value}
                              onSelect={() => handleCreatorTypeSelect(type.value)}
                              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50"
                            >
                              <span className="text-lg">{type.icon}</span>
                              <span>{type.label}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </div>
                )}
              </div>
            </div>

            {/* Platform Selection */}
            <div className="space-y-2">
              <Label>Select a Platform: *</Label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPlatformDropdown(!showPlatformDropdown)}
                  className="w-full h-12 px-3 text-left border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none bg-white"
                >
                  {selectedPlatform ? (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{selectedPlatform.icon}</span>
                      <span>{selectedPlatform.label}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">Select a platform...</span>
                  )}
                </button>
                
                {showPlatformDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    <Command>
                      <CommandInput placeholder="Search platforms..." />
                      <CommandList>
                        <CommandEmpty>No platform found.</CommandEmpty>
                        <CommandGroup>
                          {PLATFORMS.map((platform) => (
                            <CommandItem
                              key={platform.value}
                              onSelect={() => handlePlatformSelect(platform.value)}
                              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50"
                            >
                              <span className="text-lg">{platform.icon}</span>
                              <span>{platform.label}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="space-y-4 pb-2">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Security
            </h3>
            
            {/* Password Fields */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  className="pl-10 h-12 rounded-xl border-2 focus:border-teal-400"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  className="pl-10 h-12 rounded-xl border-2 focus:border-teal-400"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-600 to-blue-500 hover:from-teal-700 hover:to-blue-600 h-12 rounded-xl text-lg font-medium"
            >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Promoter Account'
            )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 