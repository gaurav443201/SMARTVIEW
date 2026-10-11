import Label from "@/components/form/Label";
import { useSmartView } from "@/context/SmartViewContext";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { getUserFromDynamoDB } from "@/services/dynamoDbService";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router";

export default function SmartViewSignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const { login } = useSmartView();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const identifier = usernameOrEmail.trim();
    if (!identifier || !password) {
      setError("Please enter your username/email and password.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 450));

    // Lookup user through DynamoDB service
    const account = await getUserFromDynamoDB(identifier);

    if (!account) {
      setError("Account not found. Please check your username/email or sign up.");
      setLoading(false);
      return;
    }

    if (account.passwordHash !== password) {
      setError("Incorrect password. Please try again.");
      setLoading(false);
      return;
    }

    login(account.user);
    navigate("/");
  };

  return (
    <div className="w-full max-w-[380px] mx-auto py-6">
      {/* Brand Header */}
      <div className="mb-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 shadow-md mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 12C3 7.029 7.029 3 12 3s9 4.029 9 9-4.029 9-9 9S3 16.971 3 12Z" fill="white" fillOpacity="0.2" />
            <path d="M7 12l3.5 3.5L17 8.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="3.5" stroke="white" strokeWidth="1.5" strokeDasharray="3 1.5" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Sign In
        </h1>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Enter your username and password to access your secure analytics workspace.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-error-200 bg-error-50 px-3.5 py-2.5 text-xs text-error-700 dark:border-error-800 dark:bg-error-900/20 dark:text-error-400">
          {error}
        </div>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Username or Email
          </Label>
          <div className="relative mt-1">
            <input
              id="signin-username"
              type="text"
              required
              placeholder="e.g. gaurav80 or user@example.com"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-xs text-gray-800 placeholder-gray-400 shadow-2xs transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Password
            </Label>
          </div>
          <div className="relative mt-1">
            <input
              id="signin-password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 pe-10 text-xs text-gray-800 placeholder-gray-400 shadow-2xs transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? (
                <EyeIcon className="size-4" />
              ) : (
                <EyeCloseIcon className="size-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">Remember me</span>
          </label>
        </div>

        <button
          id="signin-submit"
          type="submit"
          className="w-full h-10 mt-1 rounded-xl bg-brand-500 hover:bg-brand-600 font-semibold text-xs text-white shadow-sm transition-all active:scale-98 cursor-pointer disabled:opacity-60"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Verifying credentials…
            </span>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {/* Switch to Sign Up */}
      <div className="mt-5 text-center">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
