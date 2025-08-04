import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { UserMenu } from '@/components/auth/UserMenu';
import { ArtistProfileSetup } from '@/components/profile/ArtistProfileSetup';
import { ArtistProfile } from '@/components/profile/ArtistProfile';
import { ArtUpload } from '@/components/profile/ArtUpload';
import { PromoterProfileSetup } from '@/components/profile/PromoterProfileSetup';
import { AIShowcaseStudio } from '@/components/ai-studio/AIShowcaseStudio';
import { ArtistWheel } from '@/components/ArtistWheel';
import { PricingPage } from '@/components/pricing/PricingPage';
import { EventBookingSystem } from '@/components/booking/EventBookingSystem';
import { Toaster } from '@/components/ui/toaster';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Music, 
  Users, 
  Calendar, 
  Star, 
  Upload, 
  Play, 
  MapPin, 
  Zap, 
  Mic, 
  Heart,
  Search,
  Filter,
  Camera,
  Headphones,
  Trophy,
  ArrowRight,
  Sparkles,
  Radio,
  Clock,
  DollarSign,
  Menu,
  X,
  ChevronDown,
  Globe,
  Shield,
  Smartphone,
  Wand2,
  Video,
  Film,
  Palette,
  Bot,
  Rocket,
  TrendingUp,
  Eye,
  Share2,
  User,
  Check
} from 'lucide-react';

function AppContent() {
  const [selectedTab, setSelectedTab] = useState('search');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileSetupOpen, setProfileSetupOpen] = useState(false);
  const [promoterSetupOpen, setPromoterSetupOpen] = useState(false);
  const [artUploadOpen, setArtUploadOpen] = useState(false);
  const [aiStudioOpen, setAiStudioOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [bookingSystemOpen, setBookingSystemOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showArtistOnboarding, setShowArtistOnboarding] = useState(false);
  const { user, loading, signIn } = useAuth();

  // Check for signup parameter on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('signup') === 'true') {
      setAuthMode('signup')
      setAuthModalOpen(true)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  // Listen for auth modal close and profile show events
  useEffect(() => {
    const handleCloseAuthModal = () => {
      console.log('App: Closing auth modal')
      setAuthModalOpen(false);
    };
    
    const handleShowProfile = () => {
      console.log('App: Showing profile')
      setShowProfile(true);
    };
    
    const handleStartProfileSetup = () => {
      console.log('App: Starting profile setup')
      setProfileSetupOpen(true);
    };
    
    const handleStartPromoterProfileSetup = () => {
      console.log('App: Starting promoter profile setup')
      setPromoterSetupOpen(true);
    };
    
    const handleShowPricingAfterSignup = () => {
      console.log('App: Showing pricing after signup')
      setShowPricing(true);
    };
    
    const handleOpenSignupModal = () => {
      console.log('App: Opening signup modal')
      setAuthMode('signup');
      setAuthModalOpen(true);
    };
    
    const handleOpenSignInModal = () => {
      console.log('App: Opening sign-in modal')
      setAuthMode('signin');
      setAuthModalOpen(true);
    };
    
    window.addEventListener('closeAuthModal', handleCloseAuthModal);
    window.addEventListener('showProfile', handleShowProfile);
    window.addEventListener('startProfileSetup', handleStartProfileSetup);
    window.addEventListener('startPromoterProfileSetup', handleStartPromoterProfileSetup);
    window.addEventListener('showPricingAfterSignup', handleShowPricingAfterSignup);
    window.addEventListener('openSignupModal', handleOpenSignupModal);
    window.addEventListener('openSignInModal', handleOpenSignInModal);
    
    return () => {
      window.removeEventListener('closeAuthModal', handleCloseAuthModal);
      window.removeEventListener('showProfile', handleShowProfile);
      window.removeEventListener('startProfileSetup', handleStartProfileSetup);
      window.removeEventListener('startPromoterProfileSetup', handleStartPromoterProfileSetup);
      window.removeEventListener('showPricingAfterSignup', handleShowPricingAfterSignup);
      window.removeEventListener('openSignupModal', handleOpenSignupModal);
      window.removeEventListener('openSignInModal', handleOpenSignInModal);
    };
  }, []);

  // Handle artist onboarding flow
  const handleStartArtistJourney = () => {
    if (user) {
      setProfileSetupOpen(true);
    } else {
      setShowArtistOnboarding(true);
    }
  };

  const artists = [
    {
      name: "Luna Martinez",
      genre: "Pop/R&B",
      rating: 4.9,
      location: "Los Angeles, CA",
      image: "https://images.pexels.com/photos/3756941/pexels-photo-3756941.jpeg?auto=compress&cs=tinysrgb&w=400",
      price: "$2,500",
      verified: true
    },
    {
      name: "Marcus Thunder",
      genre: "Hip-Hop/Rap",
      rating: 4.8,
      location: "Atlanta, GA",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400",
      price: "$3,200",
      verified: true
    },
    {
      name: "Indie Collective",
      genre: "Alternative Rock",
      rating: 4.7,
      location: "Brooklyn, NY",
      image: "https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=400",
      price: "$1,800",
      verified: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                // Scroll to top and reset any modal states
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setAuthModalOpen(false);
                setProfileSetupOpen(false);
                setPromoterSetupOpen(false);
                setArtUploadOpen(false);
                setAiStudioOpen(false);
                setShowProfile(false);
                setBookingSystemOpen(false);
                setShowPricing(false);
                setShowArtistOnboarding(false);
                setMobileMenuOpen(false);
              }}
            >
              <img 
                src="/LIVE VIBE.png" 
                alt="Live Vibe Logo" 
                className="h-12 w-12 object-contain"
              />
              <span className="text-xl font-bold text-gray-900">
                Live Vibe
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</a>
              <a href="#artists" className="text-gray-600 hover:text-gray-900 font-medium">Artists</a>
              <a href="#promoters" className="text-gray-600 hover:text-gray-900 font-medium">Promoters</a>
              <button 
                onClick={() => setShowPricing(true)}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Pricing
              </button>
              <a href="#about" className="text-gray-600 hover:text-gray-900 font-medium">About</a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <UserMenu 
                  onProfileClick={() => setShowProfile(true)}
                  onArtClick={() => setArtUploadOpen(true)}
                  onBookingClick={() => setBookingSystemOpen(true)}
                />
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setAuthMode('signin');
                      setAuthModalOpen(true);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    onClick={() => {
                      setAuthMode('signup');
                      setAuthModalOpen(true);
                    }}
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    Create AI Videos
                  </Button>

                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-4">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</a>
                <a href="#artists" className="text-gray-600 hover:text-gray-900 font-medium">Artists</a>
                <a href="#promoters" className="text-gray-600 hover:text-gray-900 font-medium">Promoters</a>
                <button 
                  onClick={() => {
                    setShowPricing(true);
                    setMobileMenuOpen(false);
                  }}
                  className="text-gray-600 hover:text-gray-900 font-medium text-left"
                >
                  Pricing
                </button>
                <a href="#about" className="text-gray-600 hover:text-gray-900 font-medium">About</a>
                {!user && (
                  <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setAuthMode('signin');
                        setAuthModalOpen(true);
                        setMobileMenuOpen(false);
                      }}
                    >
                      Sign In
                    </Button>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => {
                        setAuthMode('signup');
                        setAuthModalOpen(true);
                        setMobileMenuOpen(false);
                      }}
                    >
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-12 sm:py-16 md:py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Create Stunning 
                  <span className="text-blue-600"> AI Videos</span>
                  <br />
                  <span className="text-purple-600">Get Booked</span> for Events
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Transform your music into professional videos with AI, then get discovered by event organizers worldwide. 
                  Create, showcase, and earn from your talent all in one platform.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
                  onClick={handleStartArtistJourney}
                >
                  <Wand2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Create AI Videos Free
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg border-2"
                  onClick={() => {
                    if (user) {
                      setAiStudioOpen(true);
                    } else {
                      setAuthMode('signup');
                      setAuthModalOpen(true);
                    }
                  }}
                >
                  <Video className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  See AI Studio
                </Button>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-4 sm:gap-6 lg:gap-8 pt-4">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">50K+</div>
                  <div className="text-xs sm:text-sm text-gray-600">AI Videos Created</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">10K+</div>
                  <div className="text-xs sm:text-sm text-gray-600">Artists Earning</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">2M+</div>
                  <div className="text-xs sm:text-sm text-gray-600">Video Views</div>
                </div>
              </div>
            </div>
            <div className="relative max-w-sm sm:max-w-md mx-auto order-first lg:order-last">
              <ArtistWheel />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">AI-Powered Artist Platform</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Create stunning videos with AI, get discovered by organizers, and build your career
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { 
                title: "AI Video Creation", 
                description: "Transform your music into professional videos using advanced AI. Create music videos, lyric videos, and visual content in minutes",
                icon: Wand2,
                color: "bg-purple-100 text-purple-600"
              },
              { 
                title: "Smart Artist Matching", 
                description: "AI-powered algorithm connects you with perfect events based on your style, location, and availability",
                icon: Bot,
                color: "bg-blue-100 text-blue-600"
              },
              { 
                title: "Instant Portfolio", 
                description: "Upload your work and let AI enhance your portfolio with professional presentations and showcases",
                icon: Rocket,
                color: "bg-green-100 text-green-600"
              }
            ].map((feature, idx) => (
              <Card key={idx} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 sm:p-8 text-center space-y-4">
                  <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full ${feature.color} mb-4`}>
                    <feature.icon className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Artists Section */}
      <section id="artists" className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Featured Artists</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Discover talented artists using AI to create stunning videos and get more bookings
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {artists.map((artist, idx) => (
              <Card key={idx} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative">
                  <img 
                    src={artist.image} 
                    alt={artist.name}
                    className="w-full h-40 sm:h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    {artist.verified && (
                      <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-purple-600 text-white">
                      <Video className="h-3 w-3 mr-1" />
                      AI Portfolio
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">{artist.name}</h3>
                    <p className="text-blue-600 font-medium text-sm sm:text-base">{artist.genre}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{artist.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{artist.location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                      <DollarSign className="h-4 w-4" />
                      <span>{artist.price}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 mb-4 text-sm sm:text-base"
                  >
                    <Wand2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Create AI Videos Now
                  </Button>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm sm:text-base">
                      Book Now
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                      <Video className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                      <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8 sm:mt-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
            >
              <Wand2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Create Your AI Videos Now
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Promoters Section */}
      <section id="promoters" className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">For Event Organizers</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Find the perfect artists for your events with AI-powered matching and booking tools
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { 
                title: "AI Artist Matching", 
                description: "Our AI algorithm finds the perfect artists for your event based on genre, budget, and availability",
                icon: Bot,
                color: "bg-blue-100 text-blue-600"
              },
              { 
                title: "Easy Booking System", 
                description: "Streamlined booking process with secure payments and contract management",
                icon: Calendar,
                color: "bg-green-100 text-green-600"
              },
              { 
                title: "Event Management", 
                description: "Complete event management tools including scheduling, communication, and analytics",
                icon: Users,
                color: "bg-purple-100 text-purple-600"
              }
            ].map((feature, idx) => (
              <Card key={idx} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 sm:p-8 text-center space-y-4">
                  <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full ${feature.color} mb-4`}>
                    <feature.icon className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8 sm:mt-12">
                <Button 
                  size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
            >
              <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Find Artists for Your Event
                </Button>
              </div>
                </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">About Live Vibe</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Connecting artists with perfect events worldwide through AI-powered technology
            </p>
                </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Our Mission</h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                Live Vibe is revolutionizing the music industry by combining AI technology with human creativity. 
                We help artists create stunning videos, build their portfolios, and connect with event organizers worldwide.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                  <span className="text-sm sm:text-base text-gray-700">AI-powered video creation</span>
              </div>
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
                  <span className="text-sm sm:text-base text-gray-700">Global artist discovery</span>
                </div>
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <span className="text-sm sm:text-base text-gray-700">Secure booking system</span>
                </div>
              </div>
            </div>
            <div className="relative order-first lg:order-last">
              <img 
                src="https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=600" 
                alt="Live Vibe Team"
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6 sm:space-y-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              Ready to Transform Your Music Career?
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto px-4">
              Join thousands of artists using AI to create stunning videos, get more bookings, and build successful careers
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-purple-600 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold"
                onClick={handleStartArtistJourney}
              >
                <Wand2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Create AI Videos Free
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-purple-600 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
                onClick={() => {
                  if (user) {
                    setAiStudioOpen(true);
                  } else {
                    setAuthMode('signup');
                    setAuthModalOpen(true);
                  }
                }}
              >
                <Video className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Try AI Studio
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div 
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  // Scroll to top and reset any modal states
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setAuthModalOpen(false);
                  setProfileSetupOpen(false);
                  setPromoterSetupOpen(false);
                  setArtUploadOpen(false);
                  setAiStudioOpen(false);
                  setShowProfile(false);
                  setBookingSystemOpen(false);
                  setShowPricing(false);
                  setShowArtistOnboarding(false);
                  setMobileMenuOpen(false);
                }}
              >
                <img 
                  src="/LIVE VIBE.png" 
                  alt="Live Vibe Logo" 
                  className="h-12 w-12 object-contain"
                />
                <span className="text-xl font-bold">Live Vibe</span>
              </div>
              <p className="text-gray-400">
                Connecting artists with perfect events worldwide.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">For Artists</h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">AI Video Studio</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Create Portfolio</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Get Bookings</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Success Stories</a>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">For Organizers</h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Find Artists</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Post Event</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Event Planning</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Pricing</a>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">AI Features</h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Music Videos</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Lyric Videos</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Visual Content</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">YouTube Upload</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Live Vibe. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Pricing Page Modal */}
      {showPricing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Pricing Plans</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPricing(false)}
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {[
                  {
                    name: "Starter",
                    price: "$9",
                    period: "month",
                    description: "Perfect for new artists",
                    features: [
                      "5 AI video generations per month",
                      "Basic artist profile",
                      "Event discovery",
                      "Email support"
                    ],
                    popular: false,
                    color: "border-gray-200"
                  },
                  {
                    name: "Pro",
                    price: "$29",
                    period: "month",
                    description: "For growing artists",
                    features: [
                      "25 AI video generations per month",
                      "Advanced profile customization",
                      "Priority event matching",
                      "Analytics dashboard",
                      "Priority support"
                    ],
                    popular: true,
                    color: "border-purple-500"
                  },
                  {
                    name: "Elite",
                    price: "$99",
                    period: "month",
                    description: "For professional artists",
                    features: [
                      "Unlimited AI video generations",
                      "Premium profile placement",
                      "Direct booking requests",
                      "Advanced analytics",
                      "Dedicated support",
                      "Custom integrations"
                    ],
                    popular: false,
                    color: "border-gray-200"
                  }
                ].map((plan, idx) => (
                  <Card key={idx} className={`border-2 ${plan.color} ${plan.popular ? 'ring-2 ring-purple-500' : ''}`}>
                    <CardHeader className="text-center p-4 sm:p-6">
                      {plan.popular && (
                        <Badge className="w-fit mx-auto mb-2 bg-purple-600 text-xs sm:text-sm">Most Popular</Badge>
                      )}
                      <CardTitle className="text-xl sm:text-2xl font-bold">{plan.name}</CardTitle>
                      <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {plan.price}<span className="text-base sm:text-lg text-gray-500">/{plan.period}</span>
                      </div>
                      <p className="text-sm sm:text-base text-gray-600">{plan.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4 sm:p-6">
                      <ul className="space-y-3">
                        {plan.features.map((feature, featureIdx) => (
                          <li key={featureIdx} className="flex items-center gap-3">
                            <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className={`w-full text-sm sm:text-base ${plan.popular ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-900 hover:bg-gray-800'}`}
                        onClick={() => {
                          if (user) {
                            // Handle subscription
                            setShowPricing(false);
                          } else {
                            setAuthMode('signup');
                            setAuthModalOpen(true);
                            setShowPricing(false);
                          }
                        }}
                      >
                        {plan.popular ? 'Get Started' : 'Choose Plan'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
      <ArtistProfileSetup
        isOpen={profileSetupOpen}
        existingProfile={null}
        onClose={() => setProfileSetupOpen(false)}
      />
      <PromoterProfileSetup
        isOpen={promoterSetupOpen}
        existingProfile={null}
        onClose={() => setPromoterSetupOpen(false)}
      />
      <ArtUpload
        isOpen={artUploadOpen}
        onClose={() => setArtUploadOpen(false)}
      />
      <AIShowcaseStudio
        isOpen={aiStudioOpen}
        onClose={() => setAiStudioOpen(false)}
      />
      <EventBookingSystem
        isOpen={bookingSystemOpen}
        onClose={() => setBookingSystemOpen(false)}
      />
      
      {/* Artist Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Artist Profile</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProfile(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <ArtistProfile />
            </div>
          </div>
        </div>
      )}
      
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;