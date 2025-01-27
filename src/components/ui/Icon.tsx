import {
  HamburgerMenuIcon,
  NewChatIcon,
  SettingsIcon,
  SignOutIcon,
  UserIcon,
} from "./icons";

interface IconProps {
  name: "new-chat" | "user" | "settings" | "sign-out" | "hamburger-menu";
  className?: string;
}

const icons = {
  "new-chat": NewChatIcon,
  user: UserIcon,
  settings: SettingsIcon,
  "sign-out": SignOutIcon,
  "hamburger-menu": HamburgerMenuIcon,
};

export function Icon({ name, className = "h-5 w-5" }: IconProps) {
  const IconComponent = icons[name];
  return <IconComponent className={className} />;
}
