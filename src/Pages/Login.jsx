import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

import toast, { Toaster } from "react-hot-toast";
import { API_LINK } from "@/utils/link";

import { Account, Client, Storage } from "appwrite";

const client = new Client()
  .setProject("67692a65002c349b75f3")
  .setEndpoint("https://cloud.appwrite.io/v1");
const account = new Account(client);
const storage = new Storage(client);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = {
      email,
      password,
    };

    try {
      // Send a login request to your backend
      const response = await fetch(`${API_LINK}api/auth/login`, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify(user),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.response || "Login failed");
        return;
      }

      toast.success("Logged In");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Authenticate the user with Appwrite
      try {
        const session = await account.createEmailPasswordSession(
          data.user.email,
          password
        );
        console.log("User authenticated with Appwrite:", session);

        // Optionally store Appwrite session details in localStorage if needed
        localStorage.setItem("appwriteSession", JSON.stringify(session));
      } catch (error) {
        console.error("Appwrite authentication failed:", error);
        alert("Appwrite authentication failed, please log in.");
      }

      // Navigate to home page or desired route
      navigate("/");
    } catch (error) {
      console.error("Login request failed:", error);
      toast.error("Failed to log in.");
    }

    console.log("Login submitted:", { email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-lg shadow-lg w-96"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Sign In
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[1px] focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none  focus:ring-[1px] focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Login
          </motion.button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Not Registered?{" "}
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Register
          </Link>
        </p>
      </motion.div>
      <Toaster />
    </div>
  );
}
