// src/components/promoter/PromoterInternalPage.tsx
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Users, Star, MapPin, DollarSign, Calendar, MessageSquare, Check, X, ArrowRight
} from 'lucide-react'

export function PromoterInternalPage() {
  const matchedArtists = [
    {
      name: 'Luna Martinez',
      genre: 'Pop/R&B',
      location: 'Los Angeles, CA',
      price: '$2,500',
      image: 'https://images.pexels.com/photos/3756941/pexels-photo-3756941.jpeg?auto=compress&cs=tinysrgb&w=400',
      score: 96,
      verified: true
    },
    {
      name: 'Marcus Thunder',
      genre: 'Hip-Hop/Rap',
      location: 'Atlanta, GA',
      price: '$3,200',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
      score: 92,
      verified: true
    },
    {
      name: 'Indie Collective',
      genre: 'Alternative Rock',
      location: 'Brooklyn, NY',
      price: '$1,800',
      image: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=400',
      score: 88,
      verified: false
    }
  ]

  const pendingOffers = [
    { artist: 'Nova Beats', event: 'Summer Night Market', date: 'Aug 22, 2025', city: 'San Diego, CA' },
    { artist: 'Echo Vibes', event: 'Tech Summit Afterparty', date: 'Sep 3, 2025', city: 'Austin, TX' },
    { artist: 'Soul Collective', event: 'Rooftop Lounge', date: 'Sep 10, 2025', city: 'New York, NY' }
  ]

  const bookedGigs = [
    { artist: 'Luna Martinez', event: 'City Arts Festival', when: 'Aug 30, 2025 • 8:00 PM', city: 'Los Angeles, CA' },
    { artist: 'Marcus Thunder', event: 'Startup Expo Night', when: 'Sep 12, 2025 • 9:30 PM', city: 'San Francisco, CA' }
  ]

  const messages = [
    { from: 'Luna Martinez', preview: 'Hi! Confirming set length and soundcheck time.', time: '2h ago' },
    { from: 'Indie Collective', preview: 'Thanks for the invite! Sharing our tech rider.', time: '5h ago' },
    { from: 'Nova Beats', preview: 'Can we push the load-in by 30 minutes?', time: 'Yesterday' }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header (landing-style) */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/LIVE VIBE.png" alt="Live Vibe Logo" className="h-10 w-10 object-contain" />
            <span className="text-xl font-bold text-gray-900">Live Vibe</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a className="text-gray-900 font-semibold" href="#home">Home</a>
            <a className="text-gray-600 hover:text-gray-900" href="#discover">Discover</a>
            <a className="text-gray-600 hover:text-gray-900" href="#bookings">Bookings</a>
            <a className="text-gray-600 hover:text-gray-900" href="#connect">Connect</a>
            <a className="text-gray-600 hover:text-gray-900" href="#plan">Plan</a>
          </div>
        </div>
      </nav>

      {/* Body */}
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          {/* Home section intro */}
          <section id="home" className="space-y-3">
            <h1 className="text-3xl font-bold text-gray-900">Welcome, Organizer</h1>
            <p className="text-gray-600">
              Manage your bookings, discover top artists, and keep conversations moving—all in one place.
            </p>
          </section>

          {/* 1) Matched Artists (demo similar to creators gallery) */}
          <section id="discover" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" /> Matched Artists
              </h2>
              <a
                href="https://live-vibe-outskill.replit.app/creators"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                See demo reference
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchedArtists.map((a) => (
                <Card key={a.name} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <img src={a.image} alt={a.name} className="w-full h-40 object-cover" />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-blue-600 text-white">Match {a.score}%</Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      {a.verified && <Badge className="bg-green-600 text-white">Verified</Badge>}
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">{a.name}</h3>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="h-4 w-4 fill-yellow-400" />
                          <span className="text-sm font-medium">4.8</span>
                        </div>
                      </div>
                      <p className="text-blue-600 text-sm font-medium">{a.genre}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{a.location}</span>
                      </div>
                      <div className="flex items-center gap-1 font-semibold text-green-600">
                        <DollarSign className="h-4 w-4" />
                        <span>{a.price}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button className="flex-1 bg-blue-600 hover:bg-blue-700">Invite</Button>
                      <Button variant="outline" className="flex-1">View Profile</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* 2) Pending Offers */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Pending Offers</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingOffers.map((o, i) => (
                <Card key={i} className="border-0 shadow-md">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${o.artist}`} />
                        <AvatarFallback>{o.artist[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-gray-900">{o.artist}</div>
                        <div className="text-sm text-gray-600">{o.event} • {o.city}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 flex items-center gap-1 justify-end">
                        <Calendar className="h-4 w-4" /> {o.date}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Check className="h-4 w-4 mr-1" /> Accept
                        </Button>
                        <Button size="sm" variant="outline">
                          <X className="h-4 w-4 mr-1" /> Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* 3) Booked Gigs */}
          <section id="bookings" className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Booked Gigs</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {bookedGigs.map((g, i) => (
                <Card key={i} className="border-0 shadow-md">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{g.event}</div>
                      <div className="text-sm text-gray-600">{g.artist} • {g.city}</div>
                    </div>
                    <div className="text-sm text-gray-500">{g.when}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* 4) Messages */}
          <section id="connect" className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-600" /> Messages
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {messages.map((m, i) => (
                <Card key={i} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${m.from}`} />
                        <AvatarFallback>{m.from[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-gray-900">{m.from}</div>
                        <div className="text-sm text-gray-600">{m.preview}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">{m.time}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Plan anchor (placeholder) */}
          <section id="plan">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Plan Your Next Event</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                Tools for budgeting, scheduling, and team collaboration coming soon.
                <div className="mt-4">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                    Get Updates <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      {/* Footer (landing-style) */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src="/LIVE VIBE.png" alt="Live Vibe Logo" className="h-10 w-10 object-contain" />
                <span className="text-xl font-bold">Live Vibe</span>
              </div>
              <p className="text-gray-400">Connecting artists with perfect events worldwide.</p>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">For Artists</h4>
              <div className="space-y-2">
                <a className="block text-gray-400 hover:text-white">AI Video Studio</a>
                <a className="block text-gray-400 hover:text-white">Create Portfolio</a>
                <a className="block text-gray-400 hover:text-white">Get Bookings</a>
                <a className="block text-gray-400 hover:text-white">Success Stories</a>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">For Organizers</h4>
              <div className="space-y-2">
                <a className="block text-gray-400 hover:text-white">Find Artists</a>
                <a className="block text-gray-400 hover:text-white">Post Event</a>
                <a className="block text-gray-400 hover:text-white">Event Planning</a>
                <a className="block text-gray-400 hover:text-white">Pricing</a>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">AI Features</h4>
              <div className="space-y-2">
                <a className="block text-gray-400 hover:text-white">Music Videos</a>
                <a className="block text-gray-400 hover:text-white">Lyric Videos</a>
                <a className="block text-gray-400 hover:text-white">Visual Content</a>
                <a className="block text-gray-400 hover:text-white">YouTube Upload</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2025 Live Vibe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}