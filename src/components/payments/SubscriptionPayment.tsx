import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SquarePaymentForm } from './SquarePaymentForm'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { enhancedSupabase } from '@/lib/supabase'
import { squarePayments } from '@/lib/square-payments'
import { Crown, Star, Zap, Check, ArrowLeft } from 'lucide-react'

interface SubscriptionPaymentProps {
  isOpen: boolean
  onClose: () => void
  selectedPlan: any
  onSubscriptionSuccess: () => void
}

export function SubscriptionPayment({
  isOpen,
  onClose,
  selectedPlan,
  onSubscriptionSuccess
}: SubscriptionPaymentProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [processing, setProcessing] = useState(false)

  if (!selectedPlan) return null

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'starter': return <Zap className="h-6 w-6" />
      case 'pro': return <Star className="h-6 w-6" />
      case 'elite': return <Crown className="h-6 w-6" />
      default: return <Zap className="h-6 w-6" />
    }
  }

  const getPlanPrice = () => {
    return billingCycle === 'yearly' 
      ? selectedPlan.price_yearly / 100 
      : selectedPlan.price_monthly / 100
  }

  const getDisplayPrice = () => {
    const price = getPlanPrice()
    if (billingCycle === 'yearly') {
      return `$${price.toFixed(2)}/year`
    }
    return `$${price.toFixed(2)}/month`
  }

  const getSavingsAmount = () => {
    if (billingCycle === 'yearly') {
      const monthlyTotal = (selectedPlan.price_monthly / 100) * 12
      const yearlyPrice = selectedPlan.price_yearly / 100
      return monthlyTotal - yearlyPrice
    }
    return 0
  }

  const handlePaymentSuccess = async (paymentResult: any) => {
    if (!user) return

    setProcessing(true)
    try {
      // Create customer in Square if needed
      const customer = await squarePayments.createCustomer({
        given_name: user.email?.split('@')[0] || 'User',
        email_address: user.email || ''
      })

      // Calculate subscription end date
      const startDate = new Date()
      const endDate = new Date()
      if (billingCycle === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1)
      } else {
        endDate.setMonth(endDate.getMonth() + 1)
      }

      // Update user subscription in Supabase
      const { error: subscriptionError } = await enhancedSupabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          plan_id: selectedPlan.id,
          status: 'active',
          billing_cycle: billingCycle,
          current_period_start: startDate.toISOString(),
          current_period_end: endDate.toISOString()
        })

      if (subscriptionError) throw subscriptionError

      // Store payment record (optional - for tracking)
              await enhancedSupabase
        .from('payment_records')
        .insert({
          user_id: user.id,
          payment_id: paymentResult.payment.id,
          amount: paymentResult.payment.amount_money.amount,
          currency: paymentResult.payment.amount_money.currency,
          status: paymentResult.payment.status,
          payment_type: 'subscription',
          plan_id: selectedPlan.id,
          billing_cycle: billingCycle
        })

      toast({
        title: "Subscription Activated!",
        description: `Welcome to ${selectedPlan.name}! Your subscription is now active.`,
      })

      onSubscriptionSuccess()
      onClose()
    } catch (error: any) {
      console.error('Subscription creation failed:', error)
      toast({
        title: "Subscription Error",
        description: error.message || "Failed to activate subscription. Please contact support.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handlePaymentError = (error: any) => {
    console.error('Payment failed:', error)
    toast({
      title: "Payment Failed",
      description: "Your payment could not be processed. Please try again.",
      variant: "destructive",
    })
  }

  if (showPaymentForm) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPaymentForm(false)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <DialogTitle>Complete Payment</DialogTitle>
            </div>
          </DialogHeader>
          
          <SquarePaymentForm
            amount={getPlanPrice()}
            description={`${selectedPlan.name} - ${getDisplayPrice()}`}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            customerEmail={user?.email}
            loading={processing}
          />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Subscribe to {selectedPlan.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Plan Summary */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  {getPlanIcon(selectedPlan.tier)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedPlan.name}</h3>
                  <p className="text-blue-600 font-medium">{selectedPlan.tier} Plan</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {selectedPlan.features.slice(0, 4).map((feature: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
                {selectedPlan.features.length > 4 && (
                  <p className="text-sm text-gray-600">
                    +{selectedPlan.features.length - 4} more features
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Billing Cycle Selection */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Choose Billing Cycle</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  billingCycle === 'monthly'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">Monthly</div>
                <div className="text-lg font-bold">
                  ${(selectedPlan.price_monthly / 100).toFixed(2)}/mo
                </div>
              </button>
              
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`p-4 rounded-lg border-2 text-left transition-colors relative ${
                  billingCycle === 'yearly'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {getSavingsAmount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-green-600 text-white text-xs">
                    Save ${getSavingsAmount().toFixed(0)}
                  </Badge>
                )}
                <div className="font-medium">Yearly</div>
                <div className="text-lg font-bold">
                  ${(selectedPlan.price_yearly / 100).toFixed(2)}/yr
                </div>
                <div className="text-xs text-gray-500">
                  ${((selectedPlan.price_yearly / 100) / 12).toFixed(2)}/mo
                </div>
              </button>
            </div>
          </div>

          {/* Total Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Plan:</span>
              <span>{selectedPlan.name}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Billing:</span>
              <span className="capitalize">{billingCycle}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span>${getPlanPrice().toFixed(2)}</span>
            </div>
            {billingCycle === 'yearly' && getSavingsAmount() > 0 && (
              <div className="text-sm text-green-600 text-right">
                You save ${getSavingsAmount().toFixed(2)} per year!
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setShowPaymentForm(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Continue to Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}