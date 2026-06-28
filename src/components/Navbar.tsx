"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Dialog } from "./Dialog";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);
  const pathname = usePathname();

  const isAdmin = session?.user?.role === "ADMIN";

  const navigation = [
    { name: "Generator", href: "/" },
    { name: "History", href: "/history" },
    { name: "Templates", href: "/templates" },
    ...(isAdmin ? [{ name: "Analytics", href: "/admin/analytics" }] : []),
  ];

  if (status === "loading") {
    return <div className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900" />;
  }

  // Don't show navbar on auth pages
  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                brandsparkx AI
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? "border-blue-500 text-gray-900 dark:text-white"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <ThemeToggle />
            {session ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {session.user?.name}
                </span>
                <button
                  onClick={() => setIsSignOutOpen(true)}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 ml-2"
            >
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`${
                  pathname === item.href
                    ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/50 dark:border-blue-500 dark:text-blue-100"
                    : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            {session ? (
              <div className="flex items-center px-4 justify-between">
                <div>
                  <div className="text-base font-medium text-gray-800 dark:text-white">
                    {session.user?.name}
                  </div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {session.user?.email}
                  </div>
                </div>
                <button
                  onClick={() => setIsSignOutOpen(true)}
                  className="mt-3 block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="block px-4 py-2 text-base font-medium text-blue-600 hover:text-blue-800 hover:bg-gray-100 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-gray-800"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}

      <Dialog
        isOpen={isSignOutOpen}
        onClose={() => setIsSignOutOpen(false)}
        title="Sign out"
        description="Are you sure you want to sign out?"
        confirmText="Sign out"
        onConfirm={() => signOut()}
      />
    </nav>
  );
}
