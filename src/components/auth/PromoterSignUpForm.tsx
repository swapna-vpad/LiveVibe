import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { enhancedSupabase } from '@/lib/supabase'
import { Loader2, Mail, Lock, User, MapPin, Music, Smartphone } from 'lucide-react'

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
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formRefs, setFormRefs] = useState<{ [key: string]: HTMLDivElement | null }>({})
  
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

  // Scrollspy functionality
  const updateCurrentStep = () => {
    const formSections = [
      'personal-info',
      'contact-info', 
      'preferences',
      'security'
    ]
    
    for (let i = formSections.length - 1; i >= 0; i--) {
      const section = formSections[i]
      const element = formRefs[section]
      if (element) {
        const rect = element.getBoundingClientRect()
        if (rect.top <= 100) {
          setCurrentStep(i + 1)
          break
        }
      }
    }
  }

  // Add scroll event listener
  React.useEffect(() => {
    const handleScroll = () => {
      updateCurrentStep()
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [formRefs])

  const scrollToSection = (sectionId: string) => {
    const element = formRefs[sectionId]
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
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
        // Save promoter data to database
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
            
            // Save to promoter_profiles with the new fields
            const { error: promoterError } = await enhancedSupabase
              .from('promoter_profiles')
              .insert({
                user_id: user.id,
                first_name: formData.firstName,
                last_name: formData.lastName,
                stage_name: formData.stageName,
                city: formData.cityLocation,
                creator_type: formData.creatorType,
                platform: formData.platform,
                promoter_type: 'promoter',
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
        
        onClose()
        
        // Trigger profile setup after successful signup
        setTimeout(() => {
          const profileSetupEvent = new CustomEvent('startProfileSetup', {
            detail: { userType: 'promoter' }
          })
          window.dispatchEvent(profileSetupEvent)
        }, 500)
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
    <Card className="w-full max-w-sm sm:max-w-md mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center p-4 sm:p-6">
        <div className="flex items-center justify-center mb-3 sm:mb-4">
          <div className="bg-gradient-to-r from-teal-600 to-blue-500 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-xl sm:text-2xl font-bold">Promoter Sign Up</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Create your promoter account and start organizing amazing events
        </CardDescription>
      </CardHeader>
      
      {/* Scrollspy Navigation */}
      <div className="px-4 sm:px-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={onBack}
            className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center sm:justify-start"
          >
            ← Back to role selection
          </button>
          <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
            Selected: <span className="font-medium">Promoter</span>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[
            { id: 1, label: 'Personal', section: 'personal-info' },
            { id: 2, label: 'Contact', section: 'contact-info' },
            { id: 3, label: 'Preferences', section: 'preferences' },
            { id: 4, label: 'Security', section: 'security' }
          ].map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => scrollToSection(step.section)}
                className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                  currentStep >= step.id
                    ? 'bg-teal-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {step.id}
              </button>
              {index < 3 && (
                <div className={`w-8 sm:w-12 h-0.5 mx-2 ${
                  currentStep > step.id ? 'bg-teal-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        
        {/* Step Labels */}
        <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-4">
          <span className={currentStep >= 1 ? 'text-teal-600 font-medium' : ''}>Personal Info</span>
          <span className={currentStep >= 2 ? 'text-teal-600 font-medium' : ''}>Contact</span>
          <span className={currentStep >= 3 ? 'text-teal-600 font-medium' : ''}>Preferences</span>
          <span className={currentStep >= 4 ? 'text-teal-600 font-medium' : ''}>Security</span>
        </div>
      </div>
      
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-6">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div 
              ref={(el) => setFormRefs(prev => ({ ...prev, 'personal-info': el }))}
              className="space-y-4"
            >
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Personal Information
              </h3>
              
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm sm:text-base">First Name *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    className="h-10 sm:h-12 rounded-xl border-2 focus:border-teal-400 text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm sm:text-base">Last Name *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                    className="h-10 sm:h-12 rounded-xl border-2 focus:border-teal-400 text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Stage Name */}
              <div className="space-y-2">
                <Label htmlFor="stageName" className="text-sm sm:text-base">Stage Name</Label>
                <div className="relative">
                  <Music className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="stageName"
                    type="text"
                    placeholder="Enter your stage name"
                    value={formData.stageName}
                    onChange={(e) => handleInputChange('stageName', e.target.value)}
                    className="pl-10 h-10 sm:h-12 rounded-xl border-2 focus:border-teal-400 text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="pl-10 h-10 sm:h-12 rounded-xl border-2 focus:border-teal-400 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* City Location */}
            <div className="space-y-2">
              <Label htmlFor="cityLocation" className="text-sm sm:text-base">City Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="cityLocation"
                  type="text"
                  placeholder="Enter your city"
                  value={formData.cityLocation}
                  onChange={(e) => handleInputChange('cityLocation', e.target.value)}
                  required
                  className="pl-10 h-10 sm:h-12 rounded-xl border-2 focus:border-teal-400 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Creator Type Selection */}
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Select Creator Type: *</Label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCreatorTypeDropdown(!showCreatorTypeDropdown)}
                  className="w-full h-10 sm:h-12 px-3 text-left border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none bg-white text-sm sm:text-base"
                >
                  {selectedCreatorType ? (
                    <div className="flex items-center gap-2">
                      <span className="text-base sm:text-lg">{selectedCreatorType.icon}</span>
                      <span>{selectedCreatorType.label}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">Select a creator type...</span>
                  )}
                </button>
                
                {showCreatorTypeDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-48 sm:max-h-60 overflow-auto">
                    <Command>
                      <CommandInput placeholder="Search creator types..." className="text-sm sm:text-base" />
                      <CommandList>
                        <CommandEmpty>No creator type found.</CommandEmpty>
                        <CommandGroup>
                          {CREATOR_TYPES.map((type) => (
                            <CommandItem
                              key={type.value}
                              onSelect={() => handleCreatorTypeSelect(type.value)}
                              className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 cursor-pointer hover:bg-gray-50 text-sm sm:text-base"
                            >
                              <span className="text-base sm:text-lg">{type.icon}</span>
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
                  <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg">
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
          </form>
        </div>
      </CardContent>
    </Card>
  )
} 