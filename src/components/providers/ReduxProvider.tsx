"use client";

import { store } from "@/lib/store/store";
import { Provider as ReduxProvider } from "react-redux";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ReduxProvider store={store}>{children}</ReduxProvider>;
}
