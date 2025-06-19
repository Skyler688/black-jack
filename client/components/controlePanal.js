"use client";

import { useState, useEffect } from "react";

import axios from "axios";

export default function ControlePanal() {
  const [username, setUsername] = useState("");
  const [money, setMoney] = useState(0);
  const [gameStage, setGameStage] = useState("bet");
  const [bet, setBet] = useState(0);

  async function startGame() {
    try {
      const userInfo = await axios.post(
        "http://localhost:4000/game/start",
        { username: "Testing123" }, // NOTE remove latter when using session.userId
        { withCredentials: true }
      );

      console.log(userInfo.data);
    } catch (error) {
      console.log("Error starting game");
    }
  }

  async function placeBet() {
    try {
      await axios.post(
        "http://localhost:4000/game/bet",
        { username: "Testing123", bet: bet }, // NOTE remove username latter and replace backend with session.userId
        { withCredentials: true }
      );
    } catch (error) {
      console.log("Error placing bet");
    }
  }

  useEffect(() => {
    startGame(); // run on loding of page
  }, []);

  return (
    <div>
      {gameStage === "bet" && (
        <div className="flex flex-col items-center">
          <h2 className="text-[30px]">Total Bet ${bet}</h2>

          <div className="flex items-center">
            <button
              className="bg-white px-4 py-4 text-[20px] mx-5"
              onClick={() => {
                setBet((prev) => prev + 1);
              }}
            >
              $1
            </button>

            <button
              className="bg-red-800 text-white px-4 py-4 text-[20px] mx-5"
              onClick={() => {
                setBet((prev) => prev + 5);
              }}
            >
              $5
            </button>

            <button
              className="bg-green-800 text-white px-4 py-4 text-[20px] mx-5"
              onClick={() => {
                setBet((prev) => prev + 25);
              }}
            >
              $25
            </button>

            <button
              className="bg-black text-white px-4 py-4 text-[20px] mx-5"
              onClick={() => {
                setBet((prev) => prev + 100);
              }}
            >
              $100
            </button>
          </div>

          <div className="flex justify-between my-10">
            <button
              className="bg-emerald-400 px-4 py-1 text-[20px] mx-5"
              onClick={() => {
                setBet(0);
              }}
            >
              Reset
            </button>

            <button
              className="bg-emerald-400 px-4 py-1 text-[20px] mx-5"
              onClick={placeBet}
            >
              Place Bet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
