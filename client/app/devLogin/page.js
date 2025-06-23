"use client"; // to give cookie to client
// export const dynamic = "force-dynamic";

// import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import axios from "axios";

export default function DevLogin() {
  const router = useRouter();
  // const params = useSearchParams();

  // const username = params.get("username");
  // const password = params.get("password");

  const username = "Testing123";
  const password = "test-2";

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
      console.log(error.message);
    }
  }

  useEffect(() => {
    login();
  }, []);

  return <div>Loging in dev</div>;
}
