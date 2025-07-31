import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { enhancedSupabase } from '@/lib/supabase'
import { SubscriptionPayment } from '@/components/payments/SubscriptionPayment'
import { 
  Check, 
  Star, 
  Crown, 
  Zap, 
  Users, 
  Calendar, 
  BarChart3,
  Sparkles,
  Shield,
  Headphones,
  ArrowRight,
  Loader2
} from 'lucide-react'

interface SubscriptionPlan {
  id: string
  name: string
  type: 'artist' | 'organizer'
  tier: 'starter' | 'pro' | 'elite'
  price_monthly: number
  price_yearly: number
  features: string[]
  commission_rate: number
  ai_generations: number
  active: boolean
}

interface UserSubscription {
  id: string
  plan_id: string
  status: string
  billing_cycle: 'monthly' | 'yearly'
  current_period_end: string
  plan: SubscriptionPlan
}

export function PricingPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<'artist' | 'organizer'>('artist')
  const [isYearly, setIsYearly] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)

  useEffect(() => {
    fetchPlans()
    if (user) {
      fetchUserSubscription()
    }
  }, [user])

  const fetchPlans = async () => {
    try {
          const { data, error } = await enhancedSupabase
        .from('subscription_plans')
        .select('*')
        .eq('active', true)
        .order('price_monthly', { ascending: true })

      if (error) throw error
      setPlans(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load subscription plans",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUserSubscription = async () => {
    if (!user) return

    try {
          const { data, error } = await enhancedSupabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setUserSubscription(data)
    } catch (error: any) {
      console.log('No active subscription found')
    }
  }

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    // Store selected plan in localStorage for after signup
    localStorage.setItem('selectedPlan', JSON.stringify(plan))
    
    // Always trigger signup modal for all users
    const signupEvent = new CustomEvent('openSignupModal')
    window.dispatchEvent(signupEvent)
  }

  const handleSubscriptionSuccess = () => {
    // Refresh user subscription data
    fetchUserSubscription()
    setPaymentModalOpen(false)
    setSelectedPlan(null)
  }

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(0)
  }

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'starter': return <Zap className="h-6 w-6" />
      case 'pro': return <Star className="h-6 w-6" />
      case 'elite': return <Crown className="h-6 w-6" />
      default: return <Zap className="h-6 w-6" />
    }
  }

  const getPlanColor = (tier: string) => {
    switch (tier) {
      case 'starter': return 'border-gray-200 hover:border-gray-300'
      case 'pro': return 'border-blue-200 hover:border-blue-300 bg-blue-50/50'
      case 'elite': return 'border-purple-200 hover:border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50'
      default: return 'border-gray-200'
    }
  }

  const getButtonColor = (tier: string) => {
    switch (tier) {
      case 'starter': return 'bg-gray-600 hover:bg-gray-700'
      case 'pro': return 'bg-blue-600 hover:bg-blue-700'
      case 'elite': return 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
      default: return 'bg-gray-600 hover:bg-gray-700'
    }
  }

  const isCurrentPlan = (planId: string) => {
    return userSubscription?.plan_id === planId
  }

  const filteredPlans = plans.filter(plan => plan.type === selectedTab)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Choose Your <span className="text-blue-600">Live Vibe</span> Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock your potential with our comprehensive platform designed for artists and event organizers
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
            Monthly
          </span>
          <Switch
            checked={isYearly}
            onCheckedChange={setIsYearly}
            className="data-[state=checked]:bg-blue-600"
          />
          <span className={`text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
            Yearly
          </span>
          {isYearly && (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
              Save up to 17%
            </Badge>
          )}
        </div>

        {/* Plan Type Tabs */}
        <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'artist' | 'organizer')} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
            <TabsTrigger value="artist" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              For Artists
            </TabsTrigger>
            <TabsTrigger value="organizer" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              For Organizers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="artist" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Artist Plans</h2>
              <p className="text-gray-600">Get discovered, create content, and grow your fanbase</p>
            </div>
          </TabsContent>

          <TabsContent value="organizer" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Organizer Plans</h2>
              <p className="text-gray-600">Find talent, manage events, and streamline bookings</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {filteredPlans.map((plan) => {
            const price = isYearly ? plan.price_yearly : plan.price_monthly
            const monthlyPrice = isYearly ? plan.price_yearly / 12 : plan.price_monthly
            
            return (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden transition-all duration-300 ${getPlanColor(plan.tier)} ${
                  plan.tier === 'pro' ? 'scale-105 shadow-xl' : 'hover:shadow-lg'
                }`}
              >
                {plan.tier === 'pro' && (
                  <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                {plan.tier === 'elite' && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-2 text-sm font-medium">
                    Premium Choice
                  </div>
                )}
                
                <CardHeader className={`text-center ${plan.tier === 'pro' || plan.tier === 'elite' ? 'pt-12' : 'pt-6'}`}>
                  <div className="flex items-center justify-center mb-4">
                    <div className={`p-3 rounded-full ${
                      plan.tier === 'starter' ? 'bg-gray-100 text-gray-600' :
                      plan.tier === 'pro' ? 'bg-blue-100 text-blue-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {getPlanIcon(plan.tier)}
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-gray-900">
                      ${formatPrice(monthlyPrice)}
                      <span className="text-lg font-normal text-gray-600">/month</span>
                    </div>
                    {isYearly && price > 0 && (
                      <p className="text-sm text-gray-500">
                        Billed ${formatPrice(price)} yearly
                      </p>
                    )}
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <span className="text-gray-600">Commission:</span>
                      <Badge variant="secondary">
                        {(plan.commission_rate * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    onClick={() => handleSubscribe(plan)}
                    disabled={subscribing === plan.id || isCurrentPlan(plan.id)}
                    className={`w-full ${getButtonColor(plan.tier)} text-white`}
                  >
                    {subscribing === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentPlan(plan.id) ? (
                      'Current Plan'
                    ) : price === 0 ? (
                      'Get Started Free'
                    ) : (
                      <>
                        Subscribe Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  
                  {isCurrentPlan(plan.id) && userSubscription && (
                    <div className="text-center">
                      <Badge className="bg-green-100 text-green-800">
                        Active until {new Date(userSubscription.current_period_end).toLocaleDateString()}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Commission Structure */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                Booking Commission Structure
              </CardTitle>
              <p className="text-gray-600">Transparent pricing for all bookings</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-900 mb-2">10%</div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Standard Rate</div>
                  <div className="text-xs text-gray-500">Starter & Pro tiers</div>
                </div>
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">7%</div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Artist Elite</div>
                  <div className="text-xs text-gray-500">Reduced commission</div>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">8%</div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Organizer Elite</div>
                  <div className="text-xs text-gray-500">Artists pay less</div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Example Booking:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Booking Fee:</span>
                    <span className="font-medium">$1,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Live Vibe Commission (10%):</span>
                    <span className="font-medium text-red-600">-$100</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Artist Receives:</span>
                    <span className="text-green-600">$900</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Questions?</h3>
          <p className="text-gray-600 mb-6">
            Our team is here to help you choose the right plan for your needs.
          </p>
          <Button variant="outline" className="border-2">
            <Headphones className="mr-2 h-4 w-4" />
            Contact Support
          </Button>
        </div>
      </div>

      {/* Payment Modal */}
      <SubscriptionPayment
        isOpen={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false)
          setSelectedPlan(null)
        }}
        selectedPlan={selectedPlan}
        onSubscriptionSuccess={handleSubscriptionSuccess}
      />
    </div>
  )
}