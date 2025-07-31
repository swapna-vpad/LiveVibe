import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { squarePayments } from '@/lib/square-payments'
import { Loader2, CreditCard, Shield, Lock } from 'lucide-react'

interface SquarePaymentFormProps {
  amount: number // Amount in dollars
  description: string
  onPaymentSuccess: (paymentResult: any) => void
  onPaymentError: (error: any) => void
  customerEmail?: string
  loading?: boolean
}

export function SquarePaymentForm({
  amount,
  description,
  onPaymentSuccess,
  onPaymentError,
  customerEmail,
  loading = false
}: SquarePaymentFormProps) {
  const { toast } = useToast()
  const cardContainerRef = useRef<HTMLDivElement>(null)
  const [paymentForm, setPaymentForm] = useState<any>(null)
  const [processing, setProcessing] = useState(false)
  const [formReady, setFormReady] = useState(false)
  const [billingEmail, setBillingEmail] = useState(customerEmail || '')

  useEffect(() => {
    initializePaymentForm()
  }, [])

  const initializePaymentForm = async () => {
    try {
      if (!cardContainerRef.current) return

      const form = await squarePayments.initializePaymentForm('square-card-container', {
        onPaymentSuccess: handlePaymentSuccess,
        onPaymentError: handlePaymentError
      })

      setPaymentForm(form)
      setFormReady(true)
    } catch (error) {
      console.error('Failed to initialize Square payment form:', error)
      toast({
        title: "Payment Error",
        description: "Failed to load payment form. Please refresh and try again.",
        variant: "destructive",
      })
    }
  }

  const handlePaymentSuccess = (result: any) => {
    setProcessing(false)
    onPaymentSuccess(result)
  }

  const handlePaymentError = (error: any) => {
    setProcessing(false)
    onPaymentError(error)
  }

  const processPayment = async () => {
    if (!paymentForm || !billingEmail.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide your email address.",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)

    try {
      // Tokenize the payment method
      const token = await paymentForm.tokenize()

      // Process the payment
      const paymentResult = await squarePayments.processPayment({
        amount: squarePayments.formatAmount(amount),
        currency: 'USD',
        source_id: token,
        idempotency_key: squarePayments.generateIdempotencyKey(),
        reference_id: `livevibe-${Date.now()}`,
        note: description,
        buyer_email_address: billingEmail
      })

      toast({
        title: "Payment Successful!",
        description: `Your payment of $${amount.toFixed(2)} has been processed successfully.`,
      })

      onPaymentSuccess(paymentResult)
    } catch (error: any) {
      console.error('Payment processing failed:', error)
      toast({
        title: "Payment Failed",
        description: error.message || "Your payment could not be processed. Please try again.",
        variant: "destructive",
      })
      onPaymentError(error)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </CardTitle>
        <div className="text-sm text-gray-600">
          <p className="font-medium">{description}</p>
          <p className="text-lg font-bold text-gray-900 mt-1">${amount.toFixed(2)}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email Input */}
        <div className="space-y-2">
          <Label htmlFor="billing-email">Email Address *</Label>
          <Input
            id="billing-email"
            type="email"
            value={billingEmail}
            onChange={(e) => setBillingEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>

        {/* Square Card Container */}
        <div className="space-y-2">
          <Label>Card Information *</Label>
          <div 
            id="square-card-container"
            ref={cardContainerRef}
            className="min-h-[60px] p-3 border border-gray-300 rounded-md bg-white"
          >
            {!formReady && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">Loading payment form...</span>
              </div>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <Shield className="h-4 w-4" />
          <span>Your payment information is encrypted and secure. Powered by Square.</span>
        </div>

        {/* Payment Button */}
        <Button
          onClick={processPayment}
          disabled={!formReady || processing || loading || !billingEmail.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Pay ${amount.toFixed(2)}
            </>
          )}
        </Button>

        {/* Test Card Notice for Sandbox */}
        <div className="text-xs text-center text-gray-500 bg-yellow-50 p-2 rounded border border-yellow-200">
          <p className="font-medium text-yellow-800">Test Mode</p>
          <p>Use card: 4111 1111 1111 1111, any future date, any CVV</p>
        </div>
      </CardContent>
    </Card>
  )
}