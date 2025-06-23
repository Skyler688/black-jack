import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import axios from "axios";

// Components
import GamePlay from "@/components/gamePlay";

// IMPORTANT NOTE -> The session cookie on the express server is used to restrict all
// important routes, in this case it is used in the login step to allow access to the main
// page of the application.

export default async function Home() {
  // used to pass game state to the client.
  let gameState = "";
  let username = "";
  let money = "";
  let dealerHand = [];
  let playerHand = [];

  const cookieStore = await cookies();
  const session = cookieStore.get("connect.sid"); // grabs the session cookie that is from the express server

  // checks if the cookie exist
  if (!session?.value) {
    if (process.env.AUTH_DISABLED === "true") {
      // Used to bypass user auth during development.
      console.log("\nUser auth bypassed\n");

      redirect(
        `/devLogin?username=${process.env.USERNAME}&password=${process.env.PASSWORD}`
      ); // used to give the client the cookie
    }

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
      if (process.env.AUTH_DISABLED === "true") {
        // Used to bypass user auth during development.
        console.log("\nUser auth bypassed\n");

        redirect(
          `/devLogin?username=${process.env.USERNAME}&password=${process.env.PASSWORD}`
        ); // used to give the client the cookie
      } else {
        redirect("/login");
      }
    }
  } catch (error) {
    console.log(error.message);
    if (process.env.AUTH_DISABLED === "true") {
      // Used to bypass user auth during development.
      console.log("\nUser auth bypassed\n");

      redirect(
        `/devLogin?username=${process.env.USERNAME}&password=${process.env.PASSWORD}`
      ); // used to give the client the cookie
    } else {
      redirect("/login");
    }
  }

  // game state check
  try {
    // send game state check to render correct game state in the event of refresh.
    const userInfo = await axios.post(
      "http://localhost:4000/game/check/state",
      { username: "Testing123" }, // used in auth bypass mode, else will use the session on the express server.
      {
        headers: {
          Cookie: `connect.sid=${session.value}`,
        },
      }
    );

    gameState = userInfo.data.gameState;
    console.log("Users game state: ", gameState);

    // if the game is in the hitStand state grab the hands to pass to client
    if (gameState === "hitStand" || gameState === "bet") {
      dealerHand = userInfo.data.dealerHand;
      playerHand = userInfo.data.playerHand;
      username = userInfo.data.username;
      money = userInfo.data.money;
    }

    if (gameState === "start") {
      // start game instance on backend server
      const userInfo = await axios.post(
        "http://localhost:4000/game/start",
        { username: "Testing123" },
        {
          headers: {
            Cookie: `connect.sid=${session.value}`,
          },
        }
      );

      console.log(userInfo.data);

      gameState = "bet";
      username = userInfo.data.username;
      money = userInfo.data.money;
    }
  } catch (error) {
    console.log(error.message);
    redirect("/login");
  }

  return (
    <GamePlay
      gameState={gameState}
      username={username}
      money={money}
      dealer={dealerHand}
      player={playerHand}
    />
  );
}
