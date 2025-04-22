"use client";
import React, { useState, useEffect } from "react";
import { account, listUsers } from "@/app/utils/appwrite";
import { useRouter } from "next/navigation";
import Cards from "@/components/Cards";
import Navbar from "@/components/NavBar";
import ReciveMessage from "@/components/adminpage/ReciveMessage";
import UsersList from "@/components/adminpage/UsersList";

export default function AdminPage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState(null);
  const [showMessages, setShowMessages] = useState(false);
  const [showUsers, setShowUsers] = useState(false);

  useEffect(() => {
    const user = account.get();
    user.then(
      (res) => setUserInfo(res),
      () => router.push("/login")
    );
  }, [router]);

  const handleToggleMessages = () => {
    setShowMessages((prev) => !prev);
    setShowUsers(false);
  };

  const handleToggleUsers = () => {
    setShowUsers((prev) => !prev);
    setShowMessages(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar
        admin={true}
        onToggle={handleToggleMessages}
        onUsersToggle={handleToggleUsers}
        clicked={showMessages}
        clickedUsers={showUsers}
      />
      <div className="pt-24 px-6 py-4">
        {showMessages ? (
          <ReciveMessage />
        ) : showUsers ? (
          <UsersList />
        ) : (
          <Cards />
        )}
      </div>
    </div>
  );
}
