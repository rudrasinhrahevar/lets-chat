import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Logout from "../accounts/Logout";
import {
  BellIcon,
  ShieldCheckIcon,
  MoonIcon,
  LogoutIcon,
} from "@heroicons/react/outline";

export default function Settings() {
  const { currentUser, logout } = useAuth();
  const [modal, setModal] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [privacy, setPrivacy] = useState("friends");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const handleNotificationToggle = () => {
    setNotifications(!notifications);
  };

  const handlePrivacyChange = (e) => {
    setPrivacy(e.target.value);
  };

  const handleThemeToggle = () => {
    if (localStorage.getItem("color-theme")) {
      if (localStorage.getItem("color-theme") === "light") {
        document.documentElement.classList.add("dark");
        localStorage.setItem("color-theme", "dark");
        setIsDark(true);
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("color-theme", "light");
        setIsDark(false);
      }
    } else {
      if (document.documentElement.classList.contains("dark")) {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("color-theme", "light");
        setIsDark(false);
      } else {
        document.documentElement.classList.add("dark");
        localStorage.setItem("color-theme", "dark");
        setIsDark(true);
      }
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-surface-50 dark:bg-gray-950 overflow-y-auto">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your preferences and account settings
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Notifications Section */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <BellIcon className="w-6 h-6 text-primary-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h2>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Control how you receive notifications
            </p>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">
                Enable notifications
              </span>
              <button
                onClick={handleNotificationToggle}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  notifications
                    ? "bg-primary-500"
                    : "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    notifications ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Privacy Section */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheckIcon className="w-6 h-6 text-primary-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Privacy
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Control who can see your profile and send you messages
            </p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="privacy"
                  value="everyone"
                  checked={privacy === "everyone"}
                  onChange={handlePrivacyChange}
                  className="w-4 h-4 text-primary-500 cursor-pointer"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Everyone can view my profile
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="privacy"
                  value="friends"
                  checked={privacy === "friends"}
                  onChange={handlePrivacyChange}
                  className="w-4 h-4 text-primary-500 cursor-pointer"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Only my contacts can view my profile
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="privacy"
                  value="private"
                  checked={privacy === "private"}
                  onChange={handlePrivacyChange}
                  className="w-4 h-4 text-primary-500 cursor-pointer"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Private - Nobody can see my profile
                </span>
              </label>
            </div>
          </div>

          {/* Theme Section */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <MoonIcon className="w-6 h-6 text-primary-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Theme
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Choose your preferred theme
            </p>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">
                Dark mode
              </span>
              <button
                onClick={handleThemeToggle}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  isDark ? "bg-primary-500" : "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    isDark ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Account Section */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <LogoutIcon className="w-6 h-6 text-red-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Account
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Logged in as {currentUser?.email}
            </p>
            <button
              onClick={() => setModal(true)}
              className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      {modal && <Logout modal={modal} setModal={setModal} />}
    </div>
  );
}
