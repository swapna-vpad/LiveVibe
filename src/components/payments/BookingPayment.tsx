import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SquarePaymentForm } from './SquarePaymentForm'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { enhancedSupabase } from '@/lib/supabase'
import { Calendar, MapPin, Music, DollarSign, ArrowLeft, Clock, Users } from 'lucide-react'

interface BookingPaymentProps {
  isOpen: boolean
  onClose: () => void
  booking: any
  onPaymentSuccess: () => void
}

export function BookingPayment({
  isOpen,
  onClose,
  booking,
  onPaymentSuccess
}: BookingPaymentProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [processing, setProcessing] = useState(false)

  if (!booking) return null

  const bookingFee = booking.final_fee || booking.proposed_fee
  const platformFee = Math.round(bookingFee * 0.10) // 10% platform fee
  const totalAmount = bookingFee + platformFee

  const handlePaymentSuccess = async (paymentResult: any) => {
    if (!user) return

    setProcessing(true)
    try {
      // Update booking status to paid
      const { error: bookingError } = await enhancedSupabase
        .from('bookings')
        .update({
          payment_status: 'paid',
          payment_id: paymentResult.payment.id,
          payment_date: new Date().toISOString()
        })
        .eq('id', booking.id)

      if (bookingError) throw bookingError

      // Store payment record
      await enhancedSupabase
        .from('payment_records')
        .insert({
          user_id: user.id,
          payment_id: paymentResult.payment.id,
          amount: paymentResult.payment.amount_money.amount,
          currency: paymentResult.payment.amount_money.currency,
          status: paymentResult.payment.status,
          payment_type: 'booking',
          booking_id: booking.id,
          artist_fee: bookingFee,
          platform_fee: platformFee
        })

      // Create notification for artist (optional)
      await enhancedSupabase
        .from('notifications')
        .insert({
          user_id: booking.artist_id,
          type: 'booking_paid',
          title: 'Booking Payment Received',
          message: `Payment for "${booking.event.title}" has been processed. You'll receive your payment within 2-3 business days.`,
          data: { booking_id: booking.id }
        })

      toast({
        title: "Payment Successful!",
        description: "Your booking payment has been processed. The artist will be notified.",
      })

      onPaymentSuccess()
      onClose()
    } catch (error: any) {
      console.error('Booking payment failed:', error)
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process booking payment. Please contact support.",
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
              <DialogTitle>Complete Booking Payment</DialogTitle>
            </div>
          </DialogHeader>
          
          <SquarePaymentForm
            amount={totalAmount / 100} // Convert cents to dollars
            description={`Booking: ${booking.event.title}`}
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
          <DialogTitle>Complete Booking Payment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{booking.event.title}</h3>
                <p className="text-gray-600">{booking.event.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{new Date(booking.event.event_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{booking.event.duration_hours}h duration</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{booking.event.venue_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{booking.event.audience_size} attendees</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Artist Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Artist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <Music className="h-6 w-6 text-gray-500" />
                </div>
                <div>
                  <h4 className="font-semibold">{booking.artist.name}</h4>
                  <p className="text-sm text-gray-600">
                    {booking.artist.city}, {booking.artist.state}
                  </p>
                </div>
                <Badge className="ml-auto">
                  {booking.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Payment Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payment Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Artist Fee:</span>
                <span>${(bookingFee / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee (10%):</span>
                <span>${(platformFee / 100).toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${(totalAmount / 100).toFixed(2)}</span>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                <p className="font-medium mb-1">Payment Protection</p>
                <p>Your payment is held securely until the event is completed. The artist receives payment within 2-3 business days after the event.</p>
              </div>
            </CardContent>
          </Card>

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
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Pay ${(totalAmount / 100).toFixed(2)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}