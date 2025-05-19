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
import { cn } from "@/lib/utils";

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
    <header className="sticky top-0 z-50 w-full border-b border-secondary/40 bg-card/70 backdrop-blur-sm supports-[backdrop-filter]:bg-card/60">
      <div
        className={cn(
          compact ? "max-w-5xl" : "mx-auto max-w-7xl",
          "flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8",
        )}
      >
        {/* Site name & desktop nav */}
        <div className="flex flex-shrink-0 items-center gap-6">
          <Link href="/" className="whitespace-nowrap text-xl font-bold">
            {siteConfig.name}
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            {Links}
          </nav>
        </div>

        {/* Right controls */}
        <div className="hidden items-center gap-4 md:flex">
          <ModeToggle />
          {user ? (
            <>
              <div className="max-w-[10rem] truncate text-sm text-muted-foreground">
                {displayName}
              </div>
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

        {/* Mobile menu trigger */}
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
          <SheetContent className="flex w-[85vw] flex-col gap-8 bg-card sm:max-w-xs">
            <SheetHeader>
              <SheetTitle className="sr-only">
                {siteConfig.name} Navigation Menu
              </SheetTitle>
            </SheetHeader>

            <div className="flex items-center justify-between">
              <Link href="/" className="text-xl font-bold">
                {siteConfig.name}
              </Link>
              <ModeToggle />
            </div>

            <nav className="flex flex-col gap-4 pt-6 text-base">{Links}</nav>

            <div className="mt-auto pt-8">
              {user ? (
                <>
                  <div className="mb-4 truncate text-sm text-muted-foreground">
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
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export const MainHeader = memo(Header);