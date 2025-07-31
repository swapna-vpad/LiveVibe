import React from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { User, Settings, LogOut, Camera, Sparkles, Wand2, Calendar } from 'lucide-react'

interface UserMenuProps {
  onProfileClick?: () => void
  onArtClick?: () => void
  onAiStudioClick?: () => void
  onBookingClick?: () => void
}

export function UserMenu({ onProfileClick, onArtClick, onAiStudioClick, onBookingClick }: UserMenuProps) {
  const { user, signOut } = useAuth()

  if (!user) return null

  const initials = user.email?.charAt(0).toUpperCase() || 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-r from-purple-600 to-teal-500 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Welcome!</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onProfileClick}>
          <User className="mr-2 h-4 w-4" />
          <span>My Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onArtClick}>
          <Camera className="mr-2 h-4 w-4" />
          <span>Upload Portfolio</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAiStudioClick}>
          <Wand2 className="mr-2 h-4 w-4" />
          <span>AI Studio</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onBookingClick}>
          <Calendar className="mr-2 h-4 w-4" />
          <span>Event Bookings</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}