import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Mail, Lock, LogIn, Github, Music } from 'lucide-react'
import { enhancedSupabase } from '@/lib/supabase'

interface SignInFormProps {
  onToggleMode: () => void
  
}

export function SignInForm({ onToggleMode,  }: SignInFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, user } = useAuth()
  const { toast } = useToast()

// Get onClose function from parent component
const onClose = () => {
  // This will be passed from the parent AuthModal
  const event = new CustomEvent('closeAuthModal')
  window.dispatchEvent(event)
}

  const handleSocialSignIn = async (provider: 'spotify') => {
    try {
      console.log('Attempting Spotify OAuth sign in...')
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
    setLoading(true)
    
    console.log('Attempting to sign in with:', { email, password })
    
    try {
    const { error } = await signIn(email, password)
      
      console.log('Sign in result:', { error })
    
    if (error) {
        console.error('Sign in error details:', error)
      toast({
        title: "Error",
          description: error.message || "Failed to sign in. Please check your credentials and try again.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      })
      // Close the auth modal
      onClose()
      
      // The AuthContext will handle showing profile or triggering profile setup
      // based on whether the user has a profile or not
    }
    } catch (err) {
      console.error('Unexpected error during sign in:', err)
      toast({
        title: "Connection Error",
        description: "Unable to connect to authentication service. Please check your internet connection and try again.",
        variant: "destructive",
      })
    }
    
    setLoading(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-purple-600 to-teal-500 w-12 h-12 rounded-full flex items-center justify-center">
            <LogIn className="h-6 w-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
        <CardDescription>
          Sign in to your Live Vibe account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                Signing In...
              </>
            ) : (
              'Sign In'
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
          onClick={() => handleSocialSignIn('spotify')}
          className="w-full h-12 rounded-xl border-2 border-green-500 text-green-600 hover:bg-green-50 hover:border-green-600 transition-colors"
        >
          <Music className="mr-2 h-5 w-5" />
          Continue with Spotify
        </Button>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={onToggleMode}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}