"use client";

import Sidebar from "../components/Sidebar";
import Tab from "../components/Tab";
import {
  NeynarAuthButton,
  NeynarContextProvider,
  Theme,
} from "@neynar/react";
import "@neynar/react/dist/style.css";

export default function Home() {
  return (
    <NeynarContextProvider
      settings={{
        clientId: process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID || "",
        defaultTheme: Theme.Light,
        eventsCallbacks: {
          onAuthSuccess: () => {},
          onSignout() {},
        },
      }}
    >
      <main className="flex min-h-screen items-start justify-center p-24">
        <Sidebar />
        <Tab />
        <div className="fixed top-10 right-10 z-40">
          <NeynarAuthButton />
        </div>
      </main>
    </NeynarContextProvider>
  );
}
