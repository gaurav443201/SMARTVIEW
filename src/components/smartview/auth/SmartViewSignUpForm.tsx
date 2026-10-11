import Label from "@/components/form/Label";
import { useSmartView } from "@/context/SmartViewContext";
import type { User } from "@/context/SmartViewContext";
import { saveUserToDynamoDB } from "@/services/dynamoDbService";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";

export default function SmartViewSignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useSmartView();
  const navigate = useNavigate();

  // Password Security Criteria
  const passwordChecks = useMemo(() => {
    return {
      length: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    };
  }, [password]);

  const securityScore = useMemo(() => {
    let score = 0;
    if (passwordChecks.length) score++;
    if (passwordChecks.hasUpper) score++;
    if (passwordChecks.hasNumber) score++;
    if (passwordChecks.hasSpecial) score++;
    return score;
  }, [passwordChecks]);

  const isPasswordSecure = securityScore === 4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanUsername || !cleanEmail || !password || !confirm) {
      setError("Please fill in all required fields.");
      return;
    }

    // Username format check (alphanumeric + underscores, 3-24 chars)
    if (!/^[a-zA-Z0-9_]{3,24}$/.test(cleanUsername)) {
      setError("Username must be 3-24 characters (letters, numbers, or underscore).");
      return;
    }

    // Email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Security password check
    if (!isPasswordSecure) {
      setError("Please ensure your password satisfies all 4 security requirements.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    // Check for existing username or email in smartview_users
    const users: User[] = JSON.parse(localStorage.getItem("smartview_users") ?? "[]");

    if (users.some((u) => u.username?.toLowerCase() === cleanUsername)) {
      setError("This username is already taken. Please choose another one.");
      setLoading(false);
      return;
    }

    if (users.some((u) => u.email?.toLowerCase() === cleanEmail)) {
      setError("An account with this email already exists. Please sign in.");
      setLoading(false);
      return;
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      username: cleanUsername,
      name: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
      email: cleanEmail,
      createdAt: new Date().toISOString(),
    };

    // Save user profile & password to DynamoDB (and local storage mirror)
    await saveUserToDynamoDB(newUser, password);

    login(newUser);
    navigate("/");
  };

  return (
    <div className="w-full max-w-[400px] mx-auto py-3">
      {/* Brand Header */}
      <div className="mb-4 text-center">
        <div className="mb-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-500 p-2 shadow-md">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 12C3 7.029 7.029 3 12 3s9 4.029 9 9-4.029 9-9 9S3 16.971 3 12Z" fill="white" fillOpacity="0.2" />
            <path d="M7 12l3.5 3.5L17 8.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="3.5" stroke="white" strokeWidth="1.5" strokeDasharray="3 1.5" />
          </svg>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          Create SmartView Account
        </h1>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          Enter your details with a secure password to get started
        </p>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-xs text-error-700 dark:border-error-800 dark:bg-error-900/20 dark:text-error-400">
          {error}
        </div>
      )}

      {/* Sign Up Form */}
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div>
          <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Username <span className="text-error-500">*</span>
          </Label>
          <div className="relative mt-1">
            <input
              id="signup-username"
              type="text"
              required
              placeholder="e.g. gaurav80"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 placeholder-gray-400 shadow-2xs transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Email Address <span className="text-error-500">*</span>
          </Label>
          <div className="relative mt-1">
            <input
              id="signup-email"
              type="email"
              required
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 placeholder-gray-400 shadow-2xs transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Password <span className="text-error-500">*</span>
            </Label>
            <div className="relative mt-1">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Min 8 chars"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 placeholder-gray-400 shadow-2xs transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Confirm Password <span className="text-error-500">*</span>
            </Label>
            <div className="relative mt-1">
              <input
                id="signup-confirm"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Re-enter password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 pe-8 text-xs text-gray-800 placeholder-gray-400 shadow-2xs transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 end-0 flex items-center pe-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeIcon className="size-3.5" />
                ) : (
                  <EyeCloseIcon className="size-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Security Password Check Indicators */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-2.5 dark:border-gray-800 dark:bg-gray-900/40">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
              Security Password Check
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                securityScore === 4
                  ? "text-emerald-600 dark:text-emerald-400"
                  : securityScore >= 2
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-rose-500"
              }`}
            >
              {securityScore === 4 ? "Strong" : securityScore >= 2 ? "Medium" : "Weak"}
            </span>
          </div>

          {/* Strength Bar */}
          <div className="h-1 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden mb-2">
            <div
              className={`h-full transition-all duration-300 ${
                securityScore === 4
                  ? "w-full bg-emerald-500"
                  : securityScore === 3
                  ? "w-3/4 bg-amber-500"
                  : securityScore === 2
                  ? "w-1/2 bg-amber-400"
                  : password.length > 0
                  ? "w-1/4 bg-rose-500"
                  : "w-0"
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-1 text-[11px]">
            <div className={`flex items-center gap-1.5 ${passwordChecks.length ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-gray-400"}`}>
              <span>{passwordChecks.length ? "✓" : "○"}</span>
              <span>8+ characters</span>
            </div>
            <div className={`flex items-center gap-1.5 ${passwordChecks.hasUpper ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-gray-400"}`}>
              <span>{passwordChecks.hasUpper ? "✓" : "○"}</span>
              <span>1 uppercase (A-Z)</span>
            </div>
            <div className={`flex items-center gap-1.5 ${passwordChecks.hasNumber ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-gray-400"}`}>
              <span>{passwordChecks.hasNumber ? "✓" : "○"}</span>
              <span>1 number (0-9)</span>
            </div>
            <div className={`flex items-center gap-1.5 ${passwordChecks.hasSpecial ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-gray-400"}`}>
              <span>{passwordChecks.hasSpecial ? "✓" : "○"}</span>
              <span>1 special (!@#$%)</span>
            </div>
          </div>
        </div>

        <button
          id="signup-submit"
          type="submit"
          className="w-full h-9 mt-1 rounded-xl bg-brand-500 hover:bg-brand-600 font-semibold text-xs text-white shadow-sm transition-all active:scale-98 cursor-pointer disabled:opacity-60"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating Secure Account…
            </span>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      {/* Switch to Sign In */}
      <div className="mt-3.5 text-center">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
