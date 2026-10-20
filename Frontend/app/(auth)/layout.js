"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { FullPageSpinner } from "@/components/Spinner";
import { useAuth } from "@/context/AuthContext";

// Wraps /login and /register. Logged-in users have no business here.
export default function AuthLayout({ children }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  // Covers "loading" and the moment between logging in and being redirected
  if (status !== "unauthenticated") return <FullPageSpinner />;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        <h1 className="mb-6 text-center text-2xl font-bold text-emerald-700">
          💸 SpendWise
        </h1>
        {children}
      </div>
    </main>
  );
}