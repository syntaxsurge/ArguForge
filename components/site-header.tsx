'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import { ChevronDown, Menu, X } from 'lucide-react'

import { ModeToggle } from '@/components/theme-toggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { logout } from '@/app/login/actions'
import { useUser } from '@/lib/contexts/user-context'
import { cn } from '@/lib/utils'

/* -------------------------------------------------------------------------- */
/*                               NAVIGATION DATA                              */
/* -------------------------------------------------------------------------- */

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/practice', label: 'Practice' },
] as const

/* -------------------------------------------------------------------------- */
/*                                  HEADER                                    */
/* -------------------------------------------------------------------------- */

export default function SiteHeader() {
  const { userProfile } = useUser()
  const [mobileOpen, setMobileOpen] = useState(false)

  const displayName =
    userProfile?.name ?? userProfile?.email ?? 'Guest'

  return (
    <>
      <header className='border-border/60 bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b shadow-sm backdrop-blur'>
        <div className='mx-auto grid h-16 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-6 px-4 md:px-6'>
          {/* Brand ------------------------------------------------------------------ */}
          <Link
            href='/'
            className='text-primary flex items-center gap-2 text-lg font-extrabold tracking-tight whitespace-nowrap'
            onClick={() => setMobileOpen(false)}
          >
            <Image
              src='/favicon.ico'
              alt='ArguForge logo'
              width={40}
              height={40}
              priority
              className='h-10 w-auto md:h-8'
            />
            <span className='hidden md:inline'>ArguForge</span>
          </Link>

          {/* Desktop nav ------------------------------------------------------------ */}
          <nav className='hidden justify-center gap-6 md:flex'>
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className='text-foreground/80 hover:text-foreground text-sm font-medium transition-colors'
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right-aligned controls -------------------------------------------------- */}
          <div className='flex items-center justify-end gap-3'>
            {/* Mobile controls */}
            <div className='flex items-center gap-2 md:hidden'>
              <ModeToggle />
            </div>

            {/* Mobile hamburger */}
            <button
              type='button'
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              className='flex items-center md:hidden'
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
            </button>

            {/* Desktop controls */}
            <div className='hidden items-center gap-3 md:flex'>
              <ModeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button aria-label='Account menu'>
                    <Avatar className='h-8 w-8'>
                      {userProfile?.avatar_url && (
                        <AvatarImage
                          src={userProfile.avatar_url}
                          alt={displayName}
                        />
                      )}
                      <AvatarFallback>
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem disabled>{displayName}</DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <form action={logout} className='w-full'>
                      <button type='submit' className='w-full text-left'>
                        Logout
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Mobile slide-down menu --------------------------------------------------- */}
        {mobileOpen && (
          <div className='bg-background/95 absolute inset-x-0 top-16 z-40 shadow-lg backdrop-blur md:hidden'>
            <nav className='flex flex-col gap-4 px-4 py-6'>
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className='text-sm font-medium'
                >
                  {l.label}
                </Link>
              ))}

              <div className='pt-4 flex items-center gap-2'>
                <ModeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button aria-label='Account menu'>
                      <Avatar className='h-8 w-8'>
                        {userProfile?.avatar_url && (
                          <AvatarImage
                            src={userProfile.avatar_url}
                            alt={displayName}
                          />
                        )}
                        <AvatarFallback>
                          {displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem disabled>{displayName}</DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <form action={logout} className='w-full'>
                        <button type='submit' className='w-full text-left'>
                          Logout
                        </button>
                      </form>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  )
}