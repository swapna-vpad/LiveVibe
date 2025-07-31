import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Play, Heart } from 'lucide-react';

interface Artist {
  id: number;
  name: string;
  genre: string;
  rating: number;
  location: string;
  image: string;
  price: string;
  verified: boolean;
  description: string;
}

const featuredArtists: Artist[] = [
  {
    id: 1,
    name: "Luna Martinez",
    genre: "Pop/R&B",
    rating: 4.9,
    location: "Los Angeles, CA",
    image: "https://images.pexels.com/photos/3756941/pexels-photo-3756941.jpeg?auto=compress&cs=tinysrgb&w=400",
    price: "$2,500",
    verified: true,
    description: "Award-winning vocalist with 10+ years of experience"
  },
  {
    id: 2,
    name: "Marcus Thunder",
    genre: "Hip-Hop/Rap",
    rating: 4.8,
    location: "Atlanta, GA",
    image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400",
    price: "$3,200",
    verified: true,
    description: "Chart-topping rapper with millions of streams"
  },
  {
    id: 3,
    name: "Indie Collective",
    genre: "Alternative Rock",
    rating: 4.7,
    location: "Brooklyn, NY",
    image: "https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=400",
    price: "$1,800",
    verified: false,
    description: "Rising indie band with unique sound and energy"
  },
  {
    id: 4,
    name: "Sofia Jazz",
    genre: "Jazz/Blues",
    rating: 4.9,
    location: "New Orleans, LA",
    image: "https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg?auto=compress&cs=tinysrgb&w=400",
    price: "$2,800",
    verified: true,
    description: "Soulful jazz performer with classical training"
  },
  {
    id: 5,
    name: "Electric Pulse",
    genre: "Electronic/EDM",
    rating: 4.6,
    location: "Miami, FL",
    image: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400",
    price: "$4,000",
    verified: true,
    description: "High-energy DJ duo taking dance floors by storm"
  }
];

export function ArtistWheel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredArtists.length);
        setIsAnimating(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const currentArtist = featuredArtists[currentIndex];

  const handlePrevious = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + featuredArtists.length) % featuredArtists.length);
      setIsAnimating(false);
    }, 300);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredArtists.length);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="relative">
      {/* Main Artist Card */}
      <Card className={`bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${isAnimating ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}>
        <div className="relative">
          <img 
            src={currentArtist.image} 
            alt={currentArtist.name}
            className="w-full h-64 object-cover"
          />
          <div className="absolute top-4 right-4 flex gap-2">
            {currentArtist.verified && (
              <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
                Verified
              </Badge>
            )}
            <Badge variant="secondary" className="bg-white/90 text-gray-800">
              {currentArtist.price}
            </Badge>
          </div>
          <div className="absolute top-4 left-4">
            <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
              <Play className="h-4 w-4 mr-1" />
              Preview
            </Button>
          </div>
        </div>
        
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">{currentArtist.name}</h3>
            <p className="text-blue-600 font-medium">{currentArtist.genre}</p>
            <p className="text-gray-600 text-sm">{currentArtist.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{currentArtist.rating}</span>
                <span className="text-gray-400">(127 reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{currentArtist.location}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Book Now
            </Button>
            <Button variant="outline" size="icon">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
        disabled={isAnimating}
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
        disabled={isAnimating}
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {featuredArtists.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (!isAnimating) {
                setIsAnimating(true);
                setTimeout(() => {
                  setCurrentIndex(index);
                  setIsAnimating(false);
                }, 300);
              }
            }}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentIndex 
                ? 'bg-blue-600 scale-110' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      {/* Artist Counter */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-500">
          Featured Artist {currentIndex + 1} of {featuredArtists.length}
        </p>
      </div>
    </div>
  );
}