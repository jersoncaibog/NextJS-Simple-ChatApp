"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { FaCog, FaSignOutAlt, FaUser } from "react-icons/fa";
import { LuMenu } from "react-icons/lu";

export function UserMenu() {
  const router = useRouter();

  const handleSignOut = async () => {
    console.log("Signing out");
    const { error } = await supabase.auth.signOut();
    console.log(error);
    router.refresh();
  };

  // Placeholder user data
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    profilePicture: "", // No profile picture URL for testing
  };

  // Function to get initials from the user's name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n.charAt(0).toUpperCase())
      .join("");
  };

  return (
    <div>
      <Dialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full p-2 text-zinc-800 hover:bg-gray-200 outline-none border-0 ">
              <LuMenu className="h-6 w-6" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={5} align="start" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DialogTrigger asChild>
              <DropdownMenuItem className="cursor-pointer">
                <FaUser className="mr-2 text-zinc-600" />
                <button>Profile</button>
              </DropdownMenuItem>
            </DialogTrigger>
            <DropdownMenuItem className="cursor-pointer">
              <FaCog className="mr-2 text-zinc-600" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer "
              onClick={handleSignOut}
            >
              <FaSignOutAlt className="mr-2 text-red-400" />
              <span className="text-red-500">Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>

          <DialogContent className="w-96">
            <DialogHeader>
              <DialogTitle>Profile</DialogTitle>
              <DialogDescription>
                View and edit your profile information.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center mt-4">
              {user.profilePicture ? (
                <Image
                  src={user.profilePicture}
                  alt="Profile"
                  className="h-28 w-28 rounded-full border-2 border-gray-300"
                  width={80}
                  height={80}
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-200">
                  <span className="text-lg font-semibold text-gray-600">
                    {getInitials(user.name)}
                  </span>
                </div>
              )}
              <h2 className="text-lg mt-2 font-semibold">{user.name}</h2>
              <p className="text-gray-600 ">{user.email}</p>
            </div>

            <div className="flex justify-end">
              <button
                className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                onClick={() => {
                  // Handle edit action
                  console.log("Edit profile clicked");
                }}
              >
                Edit
              </button>
            </div>
          </DialogContent>
        </DropdownMenu>
      </Dialog>
    </div>
  );
}
