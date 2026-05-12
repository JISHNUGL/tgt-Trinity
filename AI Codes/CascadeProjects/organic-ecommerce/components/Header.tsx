'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-organic-white shadow-sm border-b border-organic-muted/20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-organic-primary rounded-full flex items-center justify-center">
              <span className="text-organic-white font-bold text-sm">OE</span>
            </div>
            <span className="text-xl font-bold text-organic-primary">Organic E-commerce</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-organic-secondary hover:text-organic-primary transition-colors">
              Home
            </Link>
            <Link href="/products" className="text-organic-secondary hover:text-organic-primary transition-colors">
              Products
            </Link>
            <Link href="/about" className="text-organic-secondary hover:text-organic-primary transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-organic-secondary hover:text-organic-primary transition-colors">
              Contact
            </Link>
            <Link href="/b2b" className="text-organic-secondary hover:text-organic-primary transition-colors">
              B2B
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/auth/login" className="text-organic-secondary hover:text-organic-primary transition-colors">
              Login
            </Link>
            <Link href="/auth/register" className="btn-secondary">
              Register
            </Link>
            <Link href="/cart" className="relative">
              <div className="w-8 h-8 bg-organic-muted rounded-full flex items-center justify-center">
                <span className="text-organic-white text-sm">🛒</span>
              </div>
            </Link>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-organic-accent/20 transition-colors"
          >
            <div className="w-6 h-6 flex flex-col justify-center space-y-1">
              <div className={`w-6 h-0.5 bg-organic-secondary transition-all ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
              <div className={`w-6 h-0.5 bg-organic-secondary transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></div>
              <div className={`w-6 h-0.5 bg-organic-secondary transition-all ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
            </div>
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-organic-muted/20">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-organic-secondary hover:text-organic-primary transition-colors">
                Home
              </Link>
              <Link href="/products" className="text-organic-secondary hover:text-organic-primary transition-colors">
                Products
              </Link>
              <Link href="/about" className="text-organic-secondary hover:text-organic-primary transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-organic-secondary hover:text-organic-primary transition-colors">
                Contact
              </Link>
              <Link href="/b2b" className="text-organic-secondary hover:text-organic-primary transition-colors">
                B2B
              </Link>
              <div className="flex space-x-4 pt-4 border-t border-organic-muted/20">
                <Link href="/auth/login" className="text-organic-secondary hover:text-organic-primary transition-colors">
                  Login
                </Link>
                <Link href="/auth/register" className="btn-secondary">
                  Register
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
