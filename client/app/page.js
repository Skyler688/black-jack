import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import axios from "axios";

// Components

// IMPORTANT NOTE -> The session cookie on the express server is used to restrict all
// important routes, in this case it is used in the login step to allow access to the main
// page of the application.

export default async function Home() {
  const cookieStore = await cookies();
  const session = cookieStore.get("connect.sid"); // grabs the session cookie from the express server

  // checks if the cookie exist
  if (!session?.value) {
    redirect("/login");
  }

  // Extra security step to validate that the cookie is actualy valid on the express server.
  // This prevents someone from generating a random cookie with the name of connect.sid and bypasing the login page.
  try {
    const checkCookie = await axios.post(
      "http://localhost:4000/user/check",
      {
        message: "Cookie check",
      },
      {
        headers: {
          Cookie: `connect.sid=${session.value}`,
        },
      }
    );

    if (checkCookie.status !== 200) {
      redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
    redirect("/login");
  }

  return (
    <div className="flex flex-col items-center justify-center h-[100vh] bg-emerald-700">
      <h1>Game hear</h1>
    </div>
  );
}
