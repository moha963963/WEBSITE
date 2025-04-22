"use client";
import React, { useState, useEffect } from "react";
import { account } from "@/app/utils/appwrite";
import { useRouter } from "next/navigation";

const ADMIN_DASHBOARD = "Admin Dashboard";
const WELCOME_MESSAGE = "Welcome, ";
const CREATE_NEW_POST_BUTTON = "✨ Create New Post";
const LOGOUT_BUTTON = "Logout";
const LOADING_MESSAGE = "Loading...";
const MAIN_PAGE_LABEL = "Main Page";
const MESSAGES_LABEL = "See Messages";
const POSTS_LABEL = "Posts";
const SEND_MESSAGE_LABEL = "Send Message";
const USERS_LABEL = "Users";
const HIDE_USERS_LABEL = "Hide Users";

export default function Navbar({
  admin,
  onToggle,
  onUsersToggle,
  clicked,
  clickedUsers,
}) {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const user = account.get();
    user.then(
      (res) => setUserInfo(res),
      () => router.push("/login")
    );
  }, [router]);

  function handleCreatePost() {
    router.push("/CreateNewPost");
  }

  const logout = async () => {
    try {
      await account.deleteSession("current");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="mb-10 bg-gray-100">
      <div className="flex items-center justify-between px-6 py-4 bg-white shadow-md fixed top-0 left-0 right-0 z-10">
        {userInfo ? (
          <>
            <p className="text-lg font-semibold">
              {admin ? ADMIN_DASHBOARD : MAIN_PAGE_LABEL}
            </p>
            <p className="text-lg font-semibold">
              {WELCOME_MESSAGE} {userInfo?.name || LOADING_MESSAGE}
            </p>
            <div className="flex items-center gap-4">
              {admin && (
                <button
                  onClick={handleCreatePost}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
                >
                  {CREATE_NEW_POST_BUTTON}
                </button>
              )}
              {admin && (
                <button
                  onClick={onUsersToggle}
                  className="px-4 py-2 rounded-lg transition duration-300 shadow-mdbg-blue-600 text-white bg-blue-600"
                >
                  {clickedUsers ? HIDE_USERS_LABEL : USERS_LABEL}
                </button>
              )}
              {admin ? (
                <button
                  onClick={onToggle}
                  className={`px-4 py-2 rounded-lg transition duration-300 shadow-md ${
                    clicked
                      ? "bg-blue-700 text-white"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {clicked ? POSTS_LABEL : MESSAGES_LABEL}
                </button>
              ) : (
                <button
                  onClick={onToggle}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
                >
                  {clicked ? POSTS_LABEL : SEND_MESSAGE_LABEL}
                </button>
              )}

              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
              >
                {LOGOUT_BUTTON}
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center min-h-screen p-6 bg-gray-100">
            <p className="text-lg text-gray-600">{LOADING_MESSAGE}</p>
          </div>
        )}
      </div>
    </div>
  );
}
