"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";

import FormField, { buttonClass, inputClass } from "@/components/FormField";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/errors";
import PasswordInput from "@/components/PasswordInput";

export default function LoginPage() {
  const { login } = useAuth();
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: "", password: "" } });

  const onSubmit = async (values) => {
    setFormError("");
    try {
      // On success, AuthLayout notices the new status and redirects
      await login(values);
    } catch (error) {
      setFormError(
        error.response?.status === 401
          ? "Invalid email or password."
          : getErrorMessage(error)
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <h2 className="text-lg font-semibold">Log in</h2>

      {formError && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {formError}
        </p>
      )}

      <FormField label="Email" htmlFor="email" error={errors.email?.message}>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className={inputClass}
          {...register("email", {
            required: "Email is required.",
            pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email." },
          })}
        />
      </FormField>

      <FormField label="Password" htmlFor="password" error={errors.password?.message}>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          {...register("password", { required: "Password is required." })}
        />
      </FormField>

      <button type="submit" disabled={isSubmitting} className={buttonClass}>
        {isSubmitting ? "Logging in..." : "Log in"}
      </button>

      <p className="text-center text-sm text-gray-600">
        No account yet?{" "}
        <Link href="/register" className="font-medium text-violet-700 hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}