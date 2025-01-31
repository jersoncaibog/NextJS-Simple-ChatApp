"use client";

import Image from "next/image";

interface HeaderProps {
  profilePicture?: string;
  userName: string;
  activeStatus: string;
}

export function Header({
  profilePicture,
  userName,
  activeStatus,
}: HeaderProps) {
  const renderProfile = () => {
    if (profilePicture) {
      return (
        <Image
          src={profilePicture}
          alt="Profile"
          width={32}
          height={32}
          className="h-8 w-8 rounded-full mr-2"
          unoptimized
        />
      );
    } else {
      const initials = userName
        .split(" ")
        .map((name) => name.charAt(0))
        .join("")
        .toUpperCase();
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mr-2">
          <span>{initials}</span>
        </div>
      );
    }
  };

  return (
    <header className="border-b bg-background px-4 py-3">
      <div className="flex flex-col items-start">
        <div className="flex items-center">
          {renderProfile()}
          <div className="flex flex-col">
            <h1 className="text-md font-medium text-foreground">{userName}</h1>
            <span className="text-xs text-muted-foreground">
              {activeStatus}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
