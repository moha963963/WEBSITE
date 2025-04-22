"use client";
import { useState } from "react";
import { account, ID } from "@/app/utils/appwrite";
import { useRouter } from "next/navigation";
import { db } from "../utils/database";

// Global Constants
const REGISTER_TITLE = "Register";
const EMAIL_PLACEHOLDER = "Email";
const USERNAME_PLACEHOLDER = "UserName";
const PASSWORD_PLACEHOLDER = "Password";
const LOGIN_TEXT = "Do you have an account? ";
const LOGIN_LINK_TEXT = "Login";
const REGISTER_BUTTON_TEXT = "Register";

// Helper function to validate email
const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const router = useRouter();

  async function register() {
    setError(null);
    setSuccessMessage(null);

    if (!isValidEmail(email)) {
      setError("Invalid email format. Please enter a valid email.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    try {
      const authUser = await account.create(ID.unique(), email, password, name);

      const response = await db.users.create(
        {
          username: name,
          email: email,
          authId: authUser.$id,
        },
        authUser.$id
      );

      await account.createEmailPasswordSession(email, password);

      setSuccessMessage("Registration successful! Redirecting...");
      setTimeout(() => router.push(`/profile/${authUser.$id}`), 2000);
    } catch (e) {
      console.error("Registration error:", e);

      if (e.message.includes("already exists")) {
        setError("This email is already registered.");
      } else {
        setError("Registration failed. Please try again.");
      }

      if (authUser) {
        try {
          await account.delete(authUser.$id);
        } catch (cleanupError) {
          console.error("Cleanup error:", cleanupError);
        }
      }
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
        {REGISTER_TITLE}
      </h2>

      {error && (
        <div className="text-red-600 text-center mb-4">
          <p>{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="text-green-600 text-center mb-4">
          <p>{successMessage}</p>
        </div>
      )}

      <input
        type="email"
        placeholder={EMAIL_PLACEHOLDER}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
      />
      <input
        type="name"
        placeholder={USERNAME_PLACEHOLDER}
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
      />

      <input
        type="password"
        placeholder={PASSWORD_PLACEHOLDER}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
      />
      <span>
        {LOGIN_TEXT}
        <a className="text-blue-800" href="/login">
          {LOGIN_LINK_TEXT}
        </a>
      </span>

      <button
        onClick={register}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
      >
        {REGISTER_BUTTON_TEXT}
      </button>
    </div>
  );
};

export default RegisterPage;
