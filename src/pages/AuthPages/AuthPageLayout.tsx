import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-screen max-h-screen w-full overflow-hidden bg-white dark:bg-gray-950">
      <div className="flex h-full w-full flex-col lg:flex-row">
        {/* Left column: Simple & Professional Auth Form */}
        <div className="flex h-full w-full flex-1 flex-col justify-center px-6 sm:px-12 lg:w-1/2 lg:px-16 xl:px-20 overflow-y-auto lg:overflow-hidden">
          {children}
        </div>

        {/* Right column: Clean, Professional Platform Presentation (Static & Elegant) */}
        <div className="relative hidden h-full w-full flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 p-10 text-white lg:flex lg:w-1/2 xl:p-14">
          {/* Subtle ambient lighting */}
          <div className="pointer-events-none absolute -end-20 -top-20 h-80 w-80 rounded-full bg-brand-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -start-20 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

          {/* Top Brand Area */}
          <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 shadow-md">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12C3 7.029 7.029 3 12 3s9 4.029 9 9-4.029 9-9 9S3 16.971 3 12Z" fill="white" fillOpacity="0.2" />
                  <path d="M7 12l3.5 3.5L17 8.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="3.5" stroke="white" strokeWidth="1.5" strokeDasharray="3 1.5" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-white">SmartView</h2>
                <p className="text-xs text-slate-400">AI-Powered Data Analytics Platform</p>
              </div>
            </div>

            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
              v1.0 Release
            </span>
          </div>

          {/* Middle Content: Clean Headline + Professional Features */}
          <div className="relative z-10 my-auto py-4">
            <h1 className="text-2xl font-bold tracking-tight text-white xl:text-3xl">
              Turn Raw Datasets Into <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-blue-200 to-cyan-300">
                Actionable Intelligence
              </span>
            </h1>
            <p className="mt-3 text-xs leading-relaxed text-slate-300 xl:text-sm max-w-lg">
              SmartView automates data preprocessing, exploratory statistical analysis, and machine learning models — delivering interactive charts and executive insights without writing code.
            </p>

            {/* Feature List */}
            <div className="mt-6 space-y-3.5">
              <div className="flex items-start gap-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-brand-300 border border-white/10">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">Automated Preprocessing & EDA</h3>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Instantly detects missing cells, normalizes types, and computes distributions & correlation matrices.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-cyan-300 border border-white/10">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">Machine Learning & Anomaly Detection</h3>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Unsupervised K-Means clustering, Z-Score outlier detection, and automated trend estimation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-emerald-300 border border-white/10">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">Interactive Visualizations & Reports</h3>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Smart chart selection tailored to data types and one-click comprehensive HTML report download.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust & Privacy Note */}
          <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span>100% Client-Side Privacy · Zero Server Transmission</span>
            </div>
            <span className="text-[11px]">Academic Prototype</span>
          </div>
        </div>

        {/* Theme Toggler */}
        <div className="fixed top-4 end-4 z-50">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
