import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Mail, Lock, User, Github, Music, Mic, Users } from 'lucide-react'
import { enhancedSupabase } from '@/lib/supabase'
import { PromoterSignUpForm } from './PromoterSignUpForm'

interface SignUpFormProps {
  onToggleMode: () => void
}

export function SignUpForm({ onToggleMode }: SignUpFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [userType, setUserType] = useState<'artist' | 'promoter' | null>(null)
  const [showUserTypeSelection, setShowUserTypeSelection] = useState(true)
  const [showPromoterSignUp, setShowPromoterSignUp] = useState(false)
  const { signUp } = useAuth()
  const { toast } = useToast()


  const handleUserTypeSelect = (type: 'artist' | 'promoter') => {
    setUserType(type)
    if (type === 'promoter') {
      setShowPromoterSignUp(true)
    } else {
      setShowUserTypeSelection(false)
    }
  }

  const handleBackToUserTypeSelection = () => {
    setShowPromoterSignUp(false)
    setShowUserTypeSelection(true)
    setUserType(null)
  }

// Get onClose function from parent component
const onClose = () => {
  // This will be passed from the parent AuthModal
  const event = new CustomEvent('closeAuthModal')
  window.dispatchEvent(event)
}

  // Auto-generate username from email
  useEffect(() => {
    if (email && email.includes('@')) {
      const generatedUsername = email.split('@')[0]
      setUsername(generatedUsername)
    }
  }, [email])


  const handleSocialSignUp = async (provider: 'spotify') => {
    if (!userType) {
      toast({
        title: "Please Select Role",
        description: "Please select whether you're an artist or promoter first",
        variant: "destructive",
      })
      return
    }
    
    try {
      console.log('Attempting Spotify OAuth sign up with user type:', userType)
      
      // Store user type in localStorage for OAuth callback
      localStorage.setItem('pendingUserType', userType)
      
      const { error } = await enhancedSupabase.auth.signInWithOAuth({
        provider: 'spotify',
        options: {
          redirectTo: 'https://rkvmxyufjmbknldbplub.supabase.co/auth/v1/callback',
          scopes: 'user-read-email user-read-private'
        }
      })
      
      if (error) {
        console.error('Spotify OAuth error:', error)
        toast({
          title: "Spotify Login Error",
          description: error.message || "Failed to connect with Spotify",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Connecting to Spotify...",
          description: "Redirecting to Spotify for authentication",
        })
      }
    } catch (error) {
      console.error('Spotify OAuth failed:', error)
      toast({
        title: "Connection Error",
        description: "Failed to connect with Spotify. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userType) {
      toast({
        title: "Error",
        description: "Please select whether you're an artist or promoter",
        variant: "destructive",
      })
      return
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      })
      return
    }

    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Username is required",
        variant: "destructive",
      })
      return
    }
    setLoading(true)
    
    console.log('Attempting to sign up with:', { email, username, password })

    const { error } = await signUp(email, password, userType)
    
    console.log('Sign up result:', { error })
    
    if (error) {
      if (error.message.includes('User already registered') || error.message.includes('user_already_exists')) {
        toast({
          title: "Account Already Exists",
          description: "This email is already registered. Please sign in instead.",
          variant: "destructive",
        })
        onToggleMode()
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
              user_type: userType,
              email: email
            })
          
          if (authError) {
            console.error('Error saving to auth_table:', authError)
          }
          
          // Save to appropriate profile table
          if (userType === 'artist') {
            const { error: artistError } = await enhancedSupabase
              .from('artist_profiles')
              .insert({
                user_id: user.id,
                name: '', // Will be filled during profile setup
                artist_type: 'performing', // Default value
                performing_artist_type: 'singer', // Default value
                music_genres: [],
                instruments: []
              })
            
            if (artistError) {
              console.error('Error saving to artist_profiles:', artistError)
            }
          } else if (userType === 'promoter') {
            const { error: promoterError } = await enhancedSupabase
              .from('promoter_profiles')
              .insert({
                user_id: user.id,
                name: '', // Will be filled during profile setup
                promoter_type: 'promoter', // Default value
                subscription_plan: 'freemium' // Default value
              })
            
            if (promoterError) {
              console.error('Error saving to promoter_profiles:', promoterError)
            }
          }
        }
      } catch (profileError) {
        console.error('Error creating profile:', profileError)
      }
      
      const userTypeText = userType === 'artist' ? 'artist profile' : 'promoter profile'
      toast({
        title: "Success!",
        description: `🎉 Welcome to Live Vibe! Let's set up your ${userTypeText}.`,
      })
      
      // Check if user came from pricing page
      const selectedPlan = localStorage.getItem('selectedPlan')
      if (selectedPlan) {
        localStorage.removeItem('selectedPlan')
        // Show pricing page after profile setup
        setTimeout(() => {
          const showPricingEvent = new CustomEvent('showPricingAfterSignup')
          window.dispatchEvent(showPricingEvent)
        }, 1000)
      }
      
      // Close the auth modal and redirect to profile
      onClose()
      // Trigger profile setup after successful signup
      setTimeout(() => {
        const profileSetupEvent = new CustomEvent('startProfileSetup', {
          detail: { userType }
        })
        window.dispatchEvent(profileSetupEvent)
      }, 500)
    }
    
    setLoading(false)
  }

  // Show promoter signup form if selected
  if (showPromoterSignUp) {
    return (
      <PromoterSignUpForm 
        onBack={handleBackToUserTypeSelection}
        onClose={onClose}
      />
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-purple-600 to-teal-500 w-12 h-12 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription>
          Join Live Vibe and start your artistic journey
        </CardDescription>
      </CardHeader>
      <CardContent>
    <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
           <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="pl-10 h-12 rounded-xl border-2 focus:border-purple-400"
              />
            </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 h-12 rounded-xl border-2 focus:border-purple-400"
              />
            </div>
            <Command className="rounded-lg border shadow-sm">
              <CommandInput placeholder="Search user types..." />
              <CommandList>
                <CommandEmpty>No user type found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem 
                    onSelect={() => handleUserTypeSelect('artist')}
                    className="flex items-center space-x-2 p-4 cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Mic className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Artist</div>
                        <div className="text-sm text-gray-500">Perform and showcase your music</div>
                      </div>
                    </div>
                  </CommandItem>
                  <CommandItem 
                    onSelect={() => handleUserTypeSelect('promoter')}
                    className="flex items-center space-x-2 p-4 cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className="bg-teal-100 p-2 rounded-lg">
                        <Users className="h-5 w-5 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Promoter</div>
                        <div className="text-sm text-gray-500">Organize events and book artists</div>
                      </div>
                    </div>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          
      
      
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">

            </div>
           
          
          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
           
          </div>
          
          {/* Spotify Login Button */}
        
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={onToggleMode}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>  
      
    </form>
          </div>
      </CardContent>
    </Card>
  )
}