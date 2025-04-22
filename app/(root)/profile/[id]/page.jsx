"use client";
import Cards from "@/components/Cards";
import Navbar from "@/components/NavBar";
import SendMessage from "@/components/userpage/SendMessage";
import { useState } from "react";

export default function UserPage() {
  const [showSendMessages, setShowSendMessages] = useState(false);
  const handleToggleSendMessages = () => {
    setShowSendMessages((prev) => !prev);
  };
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar
        admin={false}
        onToggle={handleToggleSendMessages}
        clicked={showSendMessages}
      />
      <div className="pt-24 px-6 py-4">
        {showSendMessages ? <SendMessage /> : <Cards />}
      </div>
    </div>
  );
}
