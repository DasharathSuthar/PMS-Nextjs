'use client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { Button } from './ui/button';
import { useUserStore } from '@/store/useUserStore';
import LoadingBtn from './LoadingBtn';
import NavLink from './NavLink';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { User, Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';

const Navbar = () => {
  const { logoutUser, isLoading, profile, fetchProfile } = useUserStore();
  const { data: session, status } = useSession();

  const role = session?.user?.role;

  // Public + User links
  const userLinks = [
    { href: '/', label: 'home' },
    { href: '/products', label: 'products' },
    { href: '/contact', label: 'contact' },
  ];

  // Admin links
  const adminLinks = [
    { href: '/dashboard', label: 'dashboard' },
    { href: '/users', label: 'users' },
    { href: '/add-product', label: 'add-products' },
    { href: '/all-products', label: 'all-products' },
    { href: '/reports', label: 'reports' },
  ];

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session]);

  // Prevent hydration mismatch
  if (status === 'loading') {
    return (
      <nav className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <span className="animate-pulse text-gray-500">Loading...</span>
      </nav>
    );
  }

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-secondary bg-white relative transition-all shadow-md">
      {/* Logo */}
      {role === 'admin' ? (
        <Link
          href="/dashboard"
          className="font-semibold text-2xl text-blue-500"
        >
          PMS <span className="text-black border-l-2 ml-1.5 pl-1.5">Admin</span>
        </Link>
      ) : (
        <Link href="/" className="font-semibold text-2xl text-blue-500">
          PMS
        </Link>
      )}

      {/* Desktop Links */}
      <div className="hidden md:flex capitalize font-medium text-gray-800 items-center gap-3">
        {(role === 'admin' ? adminLinks : userLinks).map(link => (
          <NavLink key={link.href} href={link.href}>
            {link.label}
          </NavLink>
        ))}
      </div>

      {/* Auth/Profile Desktop */}
      <div className="hidden md:flex">
        {!session ? (
          <div className="flex gap-2">
            <Link
              className="bg-black rounded-md text-white font-semibold py-2 px-4 text-sm"
              href="/login"
            >
              Login
            </Link>
            <Link
              className="bg-black rounded-md text-white font-semibold py-2 px-4 text-sm"
              href="/register"
            >
              Register
            </Link>
          </div>
        ) : (
          <div className="flex gap-3 items-center">
            {/* Avatar with tooltip */}
            <Link href="/profile">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="w-10 h-10 cursor-pointer">
                      <AvatarImage
                        src={profile?.avatar}
                        alt={profile?.username || 'User Avatar'}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        <User />
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Profile</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Link>

            {/* Logout */}
            {!isLoading ? (
              <Button onClick={() => logoutUser()} size="sm">
                Logout
              </Button>
            ) : (
              <LoadingBtn />
            )}
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 p-2">
            <SheetHeader>
              <SheetTitle>
                {role === 'admin' ? 'Admin Panel' : 'Menu'}
              </SheetTitle>
            </SheetHeader>

            <div className="flex flex-col gap-4 mt-6">
              {(role === 'admin' ? adminLinks : userLinks).map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="capitalize text-gray-800 font-medium hover:text-blue-500"
                >
                  {link.label}
                </Link>
              ))}

              {!session ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    className="bg-black text-white rounded-md font-semibold py-2 px-4 text-sm text-center"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-black text-white rounded-md font-semibold py-2 px-4 text-sm text-center"
                  >
                    Register
                  </Link>
                </div>
              ) : (
                <Button
                  onClick={() => logoutUser()}
                  size="sm"
                  className="w-full"
                >
                  Logout
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;
