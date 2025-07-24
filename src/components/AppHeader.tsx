import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { User, Page } from "@/types";
import { USER_COLORS } from "@/utils/constants";
import MonthYearSelector from "./MonthYearSelector";
import {
  Clock,
  Calendar,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Key,
  Cog,
  ChevronDown,
  BarChart3,
} from "lucide-react";

interface AppHeaderProps {
  user: User;
  currentDate: Date;
  currentPage: Page;
  onLogout: () => void;
  onNavigate: (page: Page) => void;
  onDateChange: (newDate: Date) => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  currentDate,
  currentPage,
  onLogout,
  onNavigate,
  onDateChange,
}) => {
  const { t } = useTranslation();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userInitial = user.initials || user.name.substring(0, 1).toUpperCase();
  // Ensure userColorIndex is always valid, even if user.id is very short or simple
  const userColorIndex = user.id
    ? Math.abs(
        user.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
      ) % USER_COLORS.length
    : 0;
  const userColor = USER_COLORS[userColorIndex] || USER_COLORS[0];

  const iconSize = "w-5 h-5";
  const headerBgColor = "bg-orange-500"; // New theme color
  const headerTextColor = "text-white";
  const hoverBgColor = "hover:bg-orange-600";
  const activeBgColor = "bg-orange-700";
  const activeTextColor = "text-white";
  const dropdownArrowColor = "text-orange-100";

  const navLinkClasses = (page: Page) =>
    `px-2 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
      currentPage === page ||
      (page === "admin_tabbed" && currentPage === "admin_dashboard")
        ? `${activeBgColor} ${activeTextColor} shadow-md`
        : `${headerTextColor} ${hoverBgColor} hover:text-white`
    }`;

  const changeMonth = (increment: number) => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + increment,
      1
    );
    onDateChange(newDate);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProfileNavigate = (page: Page) => {
    onNavigate(page);
    setIsProfileDropdownOpen(false);
  };

  const profileMenuItems = [
    {
      labelKey: "nav.profileSettings",
      icon: Cog,
      action: () => handleProfileNavigate("user_profile"),
    },
    {
      labelKey: "nav.changePassword",
      icon: Key,
      action: () => handleProfileNavigate("user_profile"),
    }, // Placeholder
  ];

  return (
    <header
      className={`${headerBgColor} shadow-lg sticky top-0 z-50 print:hidden`}
    >
      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Logo and Nav */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1
                className={`text-xl lg:text-2xl font-bold ${headerTextColor} flex items-center`}
              >
                <Clock className="w-6 h-6 lg:w-8 lg:h-8 mr-2" />
                <span>{t("appNameShort")}</span>
              </h1>
            </div>
            <nav className="hidden md:flex md:ml-4 lg:ml-8 md:space-x-1">
              <button
                onClick={() => onNavigate("dashboard")}
                className={navLinkClasses("dashboard")}
              >
                {t("nav.dashboard")}
              </button>
              {user.role !== "admin" && (
                <button
                  onClick={() => onNavigate("vacations")}
                  className={navLinkClasses("vacations")}
                >
                  <Calendar className={iconSize} />
                  <span>{t("nav.vacations")}</span>
                </button>
              )}
              <button
                onClick={() => onNavigate("reports")}
                className={navLinkClasses("reports")}
              >
                <BarChart3 className={iconSize} />
                <span>{t("nav.reports")}</span>
              </button>
              {user.role === "admin" && (
                <button
                  onClick={() => onNavigate("admin_tabbed")}
                  className={navLinkClasses("admin_tabbed")}
                >
                  <Shield className={iconSize} />
                  <span>{t("nav.adminPanel")}</span>
                </button>
              )}
            </nav>
          </div>

          {/* Center/Right Section (Desktop): Date Nav */}
          <div className="hidden lg:flex items-center space-x-2">
            <button
              onClick={() => changeMonth(-1)}
              className={`p-2 ${headerTextColor} ${hoverBgColor} rounded-md transition-colors`}
              aria-label={t("monthYearSelector.selectMonth")}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <MonthYearSelector
              currentDate={currentDate}
              onDateChange={onDateChange}
              labelColorClass={headerTextColor} // Adjusted for new theme
            />
            <button
              onClick={() => changeMonth(1)}
              className={`p-2 ${headerTextColor} ${hoverBgColor} rounded-md transition-colors`}
              aria-label={t("monthYearSelector.selectMonth")}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Far Right Section: User Profile */}
          <div className="flex items-center relative" ref={dropdownRef}>
            <button
              onClick={toggleProfileDropdown}
              className={`flex items-center p-1 rounded-md ${hoverBgColor} transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-orange-500 focus:ring-white`}
              aria-haspopup="true"
              aria-expanded={isProfileDropdownOpen}
              aria-controls="profile-dropdown-menu"
            >
              <div
                className={`user-initials-placeholder w-10 h-10 text-lg mr-2 ${userColor} flex items-center justify-center ring-2 ring-white/50`}
              >
                {userInitial}
              </div>
              <div className="hidden sm:block text-left">
                <span
                  className={`text-sm font-medium ${headerTextColor} truncate max-w-[120px]`}
                >
                  {user.name}
                </span>
                {user.email && (
                  <span
                    className={`block text-xs ${headerTextColor} opacity-80 truncate max-w-[120px]`}
                  >
                    {user.email}
                  </span>
                )}
              </div>
              <ChevronDown
                className={`ml-1 h-5 w-5 ${dropdownArrowColor} transition-transform duration-200 ${
                  isProfileDropdownOpen ? "transform rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>

            {isProfileDropdownOpen && (
              <div
                id="profile-dropdown-menu"
                className="origin-top-right absolute right-0 mt-2 top-full w-60 rounded-md shadow-xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none py-1 z-50"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
                tabIndex={-1}
              >
                <div className="px-4 py-3 border-b border-slate-200">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user.email || user.id}
                  </p>
                </div>
                {profileMenuItems.map((item) => (
                  <button
                    key={item.labelKey}
                    onClick={item.action}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 flex items-center space-x-3"
                    role="menuitem"
                    tabIndex={-1}
                  >
                    <item.icon className="w-5 h-5 text-slate-500" />
                    <span>{t(item.labelKey)}</span>
                  </button>
                ))}
                <button
                  onClick={() => {
                    onLogout();
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center space-x-3 border-t border-slate-200"
                  role="menuitem"
                  tabIndex={-1}
                >
                  <LogOut className="w-5 h-5" />
                  <span>{t("nav.logout")}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Nav & Controls */}
        <div
          className={`md:hidden py-3 border-t border-orange-400/50 space-y-3`}
        >
          <nav className="flex flex-wrap justify-center gap-x-3 gap-y-2">
            <button
              onClick={() => onNavigate("dashboard")}
              className={navLinkClasses("dashboard")}
            >
              {t("nav.dashboard")}
            </button>
            {user.role !== "admin" && (
              <button
                onClick={() => onNavigate("vacations")}
                className={navLinkClasses("vacations")}
              >
                <Calendar className={iconSize} /> {t("nav.vacations")}
              </button>
            )}
            <button
              onClick={() => onNavigate("reports")}
              className={navLinkClasses("reports")}
            >
              <BarChart3 className={iconSize} /> {t("nav.reports")}
            </button>
            {user.role === "admin" && (
              <button
                onClick={() => onNavigate("admin_tabbed")}
                className={navLinkClasses("admin_tabbed")}
              >
                <Shield className={iconSize} /> {t("nav.adminPanel")}
              </button>
            )}
          </nav>
          <div className="flex justify-center items-center space-x-2 pt-2">
            <button
              onClick={() => changeMonth(-1)}
              className={`p-2 ${headerTextColor} ${hoverBgColor} rounded-md transition-colors`}
              aria-label={t("monthYearSelector.selectMonth")}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <MonthYearSelector
              currentDate={currentDate}
              onDateChange={onDateChange}
              labelColorClass={headerTextColor}
            />
            <button
              onClick={() => changeMonth(1)}
              className={`p-2 ${headerTextColor} ${hoverBgColor} rounded-md transition-colors`}
              aria-label={t("monthYearSelector.selectMonth")}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
