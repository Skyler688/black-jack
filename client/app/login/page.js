"use client";

import axios from "axios";
import { useRouter } from "next/navigation";

import { useState } from "react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [warning, setWarning] = useState(false);
  const router = useRouter();

  // Sends a reqest to the express server and grabs the cookie that allows home page
  // to be accessed, as well as granting access to restricted api routes on the express server.
  async function login() {
    try {
      await axios.post(
        "http://localhost:4000/user/login",
        { username: username, password: password },
        {
          withCredentials: true,
        }
      );

      router.push("/");
    } catch (error) {
      if (error.status === 401) {
        return setWarning(true);
      }
      console.log("ERROR making axios request");
    }
  }

  function createAccount() {
    try {
      router.push("/createAccount");
    } catch (error) {
      console.log(error.message);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-10 h-[100vh] bg-emerald-700">
      <h2 className="text-[4vh] font-bold">Login</h2>
      {warning && <p className="text-red-600">Invalid username or password.</p>}
      <label className="label">
        Username
        <input
          className="input"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
        ></input>
      </label>

      <label className="label">
        Password
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
        ></input>
      </label>

      <div className="flex">
        <button className="bg-amber-700 options" onClick={createAccount}>
          New
        </button>

        <button className="bg-blue-700 options" onClick={login}>
          Login
        </button>
      </div>
    </div>
  );
}
