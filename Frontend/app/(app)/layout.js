"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/Navbar";
import { FullPageSpinner } from "@/components/Spinner";
import { useAuth } from "@/context/AuthContext";

// Every page inside (app)/ is protected by this one file
export default function ProtectedLayout({ children }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  // Never render protected content (not even for a flash) until we know who the user is
  if (status !== "authenticated") return <FullPageSpinner />;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </>
  );
}