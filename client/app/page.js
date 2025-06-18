import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Components

export default function Home() {
  const session = cookies().get("connect.sid");

  if (!session?.value) {
    redirect("/login");
  }

  return <h1>Home</h1>;
}
