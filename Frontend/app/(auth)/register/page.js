"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";

import FormField, { buttonClass, inputClass } from "@/components/FormField";
import { useAuth } from "@/context/AuthContext";
import { applyFieldErrors, getErrorMessage } from "@/lib/errors";
import PasswordInput from "@/components/PasswordInput";

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { first_name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async ({ confirmPassword, ...payload }) => {
    setFormError("");
    try {
      await registerUser(payload);
    } catch (error) {
      // Field errors from the API (duplicate email, weak password...) go under
      // the matching input; anything else becomes a general message.
      if (!applyFieldErrors(error, setError)) {
        setFormError(getErrorMessage(error));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <h2 className="text-lg font-semibold">Create your account</h2>

      {formError && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {formError}
        </p>
      )}

      <FormField label="First name (optional)" htmlFor="first_name" error={errors.first_name?.message}>
        <input
          id="first_name"
          autoComplete="given-name"
          className={inputClass}
          {...register("first_name")}
        />
      </FormField>

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
          autoComplete="new-password"
          {...register("password", {
            required: "Password is required.",
            minLength: { value: 8, message: "Use at least 8 characters." },
          })}
        />
      </FormField>

      <FormField label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          {...register("confirmPassword", {
            required: "Please repeat your password.",
            validate: (value) =>
              value === getValues("password") || "Passwords do not match.",
          })}
        />
      </FormField>

      <button type="submit" disabled={isSubmitting} className={buttonClass}>
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-sm text-gray-600">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-violet-700 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}