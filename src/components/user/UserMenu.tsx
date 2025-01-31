"use client";

import { useTheme } from "@/components/theme-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCog, FaSignOutAlt, FaUser } from "react-icons/fa";
import { LuMenu } from "react-icons/lu";

type UserData = {
  name: string | null;
  email: string | null;
  avatar_url: string | null;
};

function ProfileSkeleton() {
  return (
    <div className="flex flex-col items-center mt-4 animate-pulse">
      {/* Avatar skeleton */}
      <div className="h-28 w-28 rounded-full bg-muted" />
      {/* Name skeleton */}
      <div className="h-6 w-32 bg-muted mt-2 rounded-md" />
      {/* Email skeleton */}
      <div className="h-`4 w-48 bg-muted mt-2 rounded-md" />
    </div>
  );
}

export function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    async function loadUserData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        console.log(user);

        if (user) {
          setUser({
            name: user.user_metadata.full_name ?? null,
            email: user.user_metadata.email ?? null,
            avatar_url: user.user_metadata.avatar_url ?? null,
          });
        }
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserData();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div>
      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="w-96 max-w-[90vw] rounded-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-start text-2xl font-semibold tracking-tight">
              Settings
            </DialogTitle>
            <DialogDescription className="text-start text-base text-muted-foreground">
              Manage your application preferences
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-8 py-6">
            {/* Appearance Section */}
            <section className="space-y-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-medium tracking-tight">
                  Appearance
                </h3>
                <p className="text-sm text-muted-foreground">
                  Customize the look and feel of the application
                </p>
              </div>

              <div className="grid gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="theme"
                      className="text-sm font-medium leading-none"
                    >
                      Theme
                    </label>
                  </div>
                  <select
                    id="theme"
                    value={theme}
                    onChange={(e) =>
                      setTheme(e.target.value as "light" | "dark" | "system")
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="light">Light mode</option>
                    <option value="dark">Dark mode</option>
                    <option value="system">System preference</option>
                  </select>
                  <p className="text-[13px] text-muted-foreground">
                    Select a theme for the application interface
                  </p>
                </div>
              </div>
            </section>

            {/* System Info Section */}
            <section className="space-y-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-medium tracking-tight">System</h3>
                <p className="text-sm text-muted-foreground">
                  Application and system information
                </p>
              </div>

              <div className="rounded-lg border bg-card">
                <div className="p-6 space-y-4">
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Version
                      </span>
                      <span className="text-sm font-medium">1.0.0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Last Updated
                      </span>
                      <span className="text-sm font-medium">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className=" rounded-lg w-96 max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className=" text-start">Profile</DialogTitle>
            <DialogDescription className="text-start">
              Your profile information.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <ProfileSkeleton />
          ) : (
            <div className="flex flex-col items-center space-y-4 py-4">
              {user?.avatar_url && !imageError ? (
                <Image
                  src={user.avatar_url}
                  alt={user.name || "User avatar"}
                  width={80}
                  height={80}
                  className="h-28 w-28 rounded-full border-2 border-border"
                  onError={() => setImageError(true)}
                  unoptimized
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-border bg-muted">
                  <span className="text-2xl font-semibold text-muted-foreground">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
              )}
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground">
                  {user?.name || "Anonymous User"}
                </h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dropdown Menu */}
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full p-2 text-foreground hover:bg-accent outline-none border-0">
            <LuMenu className="h-6 w-6" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={5} align="start" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              setDropdownOpen(false);
              setProfileOpen(true);
            }}
          >
            <FaUser className="mr-2 text-muted-foreground" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              setDropdownOpen(false);
              setSettingsOpen(true);
            }}
          >
            <FaCog className="mr-2 text-muted-foreground" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
            <FaSignOutAlt className="mr-2 text-red-400 dark:text-red-400" />
            <span className="text-red-500 dark:text-red-400">Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
