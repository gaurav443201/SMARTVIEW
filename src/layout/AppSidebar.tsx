import { useSidebar } from "@/context/SidebarContext";
import { useSmartView } from "@/context/SmartViewContext";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
} from "../icons";
import { cn } from "../utils";

// ─── Custom SmartView Icons (inline SVG as components) ───────────────────────

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function ReportIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function AiSparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  );
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  );
}

// ─── Nav Types ────────────────────────────────────────────────────────────────

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string }[];
};

// ─── SmartView Navigation ─────────────────────────────────────────────────────

const navItems: NavItem[] = [
  {
    icon: <GridIcon fontSize={22} />,
    name: "Home",
    path: "/",
  },
  {
    icon: <UploadIcon className="h-[22px] w-[22px]" />,
    name: "Upload Dataset",
    path: "/upload",
  },
  {
    icon: <DashboardIcon className="h-[22px] w-[22px]" />,
    name: "Smart Dashboard",
    path: "/smart-dashboard",
  },
  {
    icon: <AiSparklesIcon className="h-[22px] w-[22px]" />,
    name: "AI Insights",
    path: "/ai-insights",
  },
  {
    icon: <ReportIcon className="h-[22px] w-[22px]" />,
    name: "Report Download",
    path: "/reports",
  },
];

const archiveNavItems: NavItem[] = [
  {
    icon: <HistoryIcon className="h-[22px] w-[22px]" />,
    name: "History",
    path: "/history",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, setIsMobileOpen } = useSidebar();
  const { user, logout, currentDataset } = useSmartView();
  const location = useLocation();
  const navigate = useNavigate();

  const [openSubmenu, setOpenSubmenu] = useState<{ type: string; index: number } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (isMobileOpen) setIsMobileOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

  useEffect(() => {
    let matched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((sub) => {
          if (isActive(sub.path)) {
            setOpenSubmenu({ type: "main", index });
            matched = true;
          }
        });
      }
    });
    if (!matched) setOpenSubmenu(null);
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({ ...prev, [key]: subMenuRefs.current[key]?.scrollHeight || 0 }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, type: "main" | "account") => {
    setOpenSubmenu((prev) =>
      prev && prev.type === type && prev.index === index ? null : { type, index }
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  const showLabel = isExpanded || isHovered || isMobileOpen;

  const renderItems = (items: NavItem[], type: "main" | "account") => (
    <ul className="flex flex-col gap-1">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <>
              <button
                onClick={() => handleSubmenuToggle(index, type)}
                className={`group menu-item ${openSubmenu?.type === type && openSubmenu?.index === index ? "menu-item-active" : "menu-item-inactive"} cursor-pointer ${!isExpanded && !isHovered ? "xl:justify-center" : "xl:justify-start"}`}
              >
                <span className={`menu-item-icon-size ${openSubmenu?.type === type && openSubmenu?.index === index ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                  {nav.icon}
                </span>
                {showLabel && <span className="menu-item-text">{nav.name}</span>}
                {showLabel && (
                  <ChevronDownIcon className={`ms-auto h-5 w-5 transition-transform duration-200 ${openSubmenu?.type === type && openSubmenu?.index === index ? "rotate-180 text-brand-500" : ""}`} />
                )}
              </button>
              {(isExpanded || isHovered || isMobileOpen) && (
                <div
                  ref={(el) => { subMenuRefs.current[`${type}-${index}`] = el; }}
                  className="overflow-hidden transition-all duration-300"
                  style={{ height: openSubmenu?.type === type && openSubmenu?.index === index ? `${subMenuHeight[`${type}-${index}`]}px` : "0px" }}
                >
                  <ul className="ms-9 mt-2 space-y-1">
                    {nav.subItems.map((sub) => (
                      <li key={sub.name}>
                        <Link
                          to={sub.path}
                          className={`menu-dropdown-item ${isActive(sub.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`group menu-item ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`}
              >
                <span className={`menu-item-icon-size ${isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                  {nav.icon}
                </span>
                {showLabel && <span className="menu-item-text">{nav.name}</span>}
                {/* Dataset status dot for Dashboard and Upload */}
                {showLabel && (nav.path === "/smart-dashboard" || nav.path === "/upload") && currentDataset && (
                  <span className="ms-auto h-2 w-2 rounded-full bg-success-400" title="Dataset loaded" />
                )}
              </Link>
            )
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={cn(
        "fixed inset-s-0 top-0 z-50 flex h-screen flex-col border-e border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out xl:translate-x-0 xl:rtl:translate-x-0 dark:border-gray-800 dark:bg-gray-900",
        isExpanded || isMobileOpen ? "w-72.5" : isHovered ? "w-72.5" : "w-22.5",
        isMobileOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
      )}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div className={cn("flex py-7", !isExpanded && !isHovered ? "xl:justify-center" : "justify-start")}>
        <Link to="/" className="flex items-center gap-3">
          {/* SmartView Icon */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-sm">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="8" fill="white" fillOpacity="0.15" />
              <path d="M5.5 9l2.5 2.5L12.5 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="9" r="3.5" stroke="white" strokeWidth="1.2" strokeDasharray="2.5 1.5"/>
            </svg>
          </div>
          {showLabel && (
            <div>
              <span className="block text-base font-bold text-gray-900 dark:text-white">SmartView</span>
              <span className="block text-[10px] text-brand-500 font-medium">AI Data Analytics</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear flex-1">
        <nav className="flex-1">
            {/* Main Navigation */}
            <div>
              <h2 className={`mb-3 flex text-xs leading-5 text-gray-400 uppercase tracking-wider ${!isExpanded && !isHovered ? "xl:justify-center" : "justify-start"}`}>
                {showLabel ? "Analytics" : <HorizontaLDots className="size-6" />}
              </h2>
              {renderItems(navItems, "main")}
            </div>

            {/* Separated Option: History & Past Datasets */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80">
              <h2 className={`mb-3 flex text-xs leading-5 text-gray-400 uppercase tracking-wider ${!isExpanded && !isHovered ? "xl:justify-center" : "justify-start"}`}>
                {showLabel ? "Archive" : <HorizontaLDots className="size-6" />}
              </h2>
              {renderItems(archiveNavItems, "main")}
            </div>
        </nav>

        {/* User Info + Logout */}
        {showLabel && user && (
          <div className="mb-4 mt-2 rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/60">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-800 dark:text-gray-200">{user.name}</p>
                <p className="truncate text-xs text-gray-400">{user.email}</p>
              </div>
            </div>
            <button
              id="sidebar-logout-btn"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-error-600 dark:hover:bg-gray-800 dark:hover:text-error-400"
            >
              <LogoutIcon className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        )}

        {/* Not logged in */}
        {showLabel && !user && (
          <div className="mb-4 mt-2 rounded-xl border border-brand-100 bg-brand-50 p-3 dark:border-brand-900 dark:bg-brand-900/20">
            <p className="mb-2 text-xs text-gray-600 dark:text-gray-400">Sign in to save your analysis sessions.</p>
            <Link
              to="/signin"
              className="block w-full rounded-lg bg-brand-500 py-1.5 text-center text-xs font-semibold text-white hover:bg-brand-600"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};

export default AppSidebar;
