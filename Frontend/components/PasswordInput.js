"use client";

import { forwardRef, useState } from "react";

import { inputClass } from "@/components/FormField";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";

const PasswordInput = forwardRef(function PasswordInput({ className = "", ...props }, ref) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        ref={ref}
        type={visible ? "text" : "password"}
        className={`${inputClass} pr-10 ${className}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex items-center rounded-r-lg px-3 text-gray-400 hover:text-gray-700 focus:outline-none focus-visible:text-emerald-700"
      >
        { visible
          ? <FaRegEyeSlash />
          : <FaRegEye />
        }
      </button>
    </div>
  );
});

export default PasswordInput;