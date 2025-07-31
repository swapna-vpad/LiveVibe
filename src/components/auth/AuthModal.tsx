import React, { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { SignInForm } from './SignInForm'
import { SignUpForm } from './SignUpForm'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'signin' | 'signup'
}

export function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 bg-transparent border-0 shadow-none">
        <DialogTitle className="sr-only">
          {mode === 'signin' ? 'Sign In' : 'Sign Up'}
        </DialogTitle>
        {mode === 'signin' ? (
          <SignInForm onToggleMode={toggleMode}  />
        ) : (
          <SignUpForm onToggleMode={toggleMode}  />
        )}
      </DialogContent>
    </Dialog>
  )
}