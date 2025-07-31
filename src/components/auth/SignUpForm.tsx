import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Mail, Lock, User, Github, Music } from 'lucide-react'
import { enhancedSupabase } from '@/lib/supabase'

interface SignUpFormProps {
  onToggleMode: () => void
}

export function SignUpForm({ onToggleMode }: SignUpFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const { toast } = useToast()

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
    try {
      console.log('Attempting Spotify OAuth sign up...')
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
    
    const { error } = await signUp(email, password)
    
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
      toast({
        title: "Success!",
        description: "🎉 Welcome to Live Vibe! Let's set up your artist profile.",
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
        const profileSetupEvent = new CustomEvent('startProfileSetup')
        window.dispatchEvent(profileSetupEvent)
      }, 500)
    }
    
    setLoading(false)
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 h-12 rounded-xl border-2 focus:border-purple-400"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pl-10 h-12 rounded-xl border-2 focus:border-purple-400"
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-700 hover:to-teal-600 h-12 rounded-xl text-lg font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
        
        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Or continue with</span>
          </div>
        </div>
        
        {/* Spotify Login Button */}
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialSignUp('spotify')}
          className="w-full h-12 rounded-xl border-2 border-green-500 text-green-600 hover:bg-green-50 hover:border-green-600 transition-colors"
        >
          <Music className="mr-2 h-5 w-5" />
          Continue with Spotify
        </Button>
        
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
      </CardContent>
    </Card>
  )
}