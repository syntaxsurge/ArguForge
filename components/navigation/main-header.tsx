import Link from "next/link";
import { memo } from "react";

import { Menu } from "lucide-react";

import { logout } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteConfig } from "@/lib/config/site";

import { ModeToggle } from "../theme-toggle";

interface MainHeaderProps {
  user?: {
    id: string;
    email?: string | null;
    user_metadata?: {
      name?: string | null;
      full_name?: string | null;
    };
  } | null;
  compact?: boolean;
}

function Header({ user, compact = false }: MainHeaderProps) {
  const displayName =
    user?.user_metadata?.name ??
    user?.user_metadata?.full_name ??
    user?.email ??
    "Guest";

  const Links = (
    <>
      <Link href="/dashboard" className="font-medium hover:underline">
        Dashboard
      </Link>
      <Link href="/dashboard/practice" className="font-medium hover:underline">
        Practice
      </Link>
    </>
  );

  return (
    <header className="border-b">
      <div
        className={`${compact ? "max-w-5xl" : "container"} mx-auto flex h-16 items-center justify-between p-4`}
      >
        {/* Left – site name & desktop nav */}
        <div className="flex items-center gap-4">
          <Link href="/" className="font-bold text-xl">
            {siteConfig.name}
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm">
            {Links}
          </nav>
        </div>

        {/* Right – theme switcher & auth controls */}
        <div className="hidden md:flex items-center gap-4">
          <ModeToggle />
          {user ? (
            <>
              <div className="text-sm text-muted-foreground">{displayName}</div>
              <form>
                <Button
                  variant="outline"
                  size="sm"
                  formAction={logout}
                  className="border-secondary hover:bg-secondary/20"
                >
                  Logout
                </Button>
              </form>
            </>
          ) : (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-secondary hover:bg-secondary/20"
            >
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>

        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-secondary/20"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[80vw] bg-card">
            {/* Accessible title for screen readers */}
            <SheetHeader>
              <SheetTitle className="sr-only">
                {siteConfig.name} Navigation Menu
              </SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Site & theme toggle */}
              <div className="flex items-center justify-between">
                <Link href="/" className="font-bold text-xl">
                  {siteConfig.name}
                </Link>
                <ModeToggle />
              </div>

              <nav className="space-y-1 pt-6 border-t border-secondary">
                {Links}
              </nav>

              <div className="pt-6 border-t border-secondary">
                {user ? (
                  <>
                    <div className="mb-4 text-sm text-muted-foreground">
                      {displayName}
                    </div>
                    <form>
                      <Button
                        variant="outline"
                        size="sm"
                        formAction={logout}
                        className="w-full border-secondary hover:bg-secondary/20"
                      >
                        Logout
                      </Button>
                    </form>
                  </>
                ) : (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full border-secondary hover:bg-secondary/20"
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export const MainHeader = memo(Header);
