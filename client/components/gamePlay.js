"use client";

import { useState, useEffect } from "react";

import axios from "axios";

export default function ControlePanal() {
  const [username, setUsername] = useState("");
  const [money, setMoney] = useState(0);
  const [gameStage, setGameStage] = useState("bet"); // states (bet, continue, win, tie, bust)
  const [bet, setBet] = useState(0);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);

  async function startGame() {
    try {
      const userInfo = await axios.post(
        "http://localhost:4000/game/start",
        { username: "Testing123" }, // NOTE remove latter when using session.userId
        { withCredentials: true }
      );

      console.log(userInfo.data);

      setUsername(userInfo.data.username);
      setMoney(userInfo.data.money);
    } catch (error) {
      console.log("Error starting game");
    }
  }

  async function placeBet() {
    try {
      const userInfo = await axios.post(
        "http://localhost:4000/game/bet",
        { username: "Testing123", bet: bet }, // NOTE remove username latter and replace backend with session.userId
        { withCredentials: true }
      );

      setMoney(userInfo.data.money);
      setPlayerHand(userInfo.data.playerHand);
      setDealerHand(userInfo.data.dealerHand);
      setGameStage(userInfo.data.game);
      console.log(userInfo.data?.gameState); // prints gameState in development mode.
    } catch (error) {
      console.log("Error placing bet");
    }
  }

  async function hit() {
    try {
      const userInfo = await axios.post(
        "http://localhost:4000/game/hit",
        { username: "Testing123" }, // remove later
        { withCredentials: true }
      );
    } catch (error) {
      console.log("Error hitting");
    }
  }

  useEffect(() => {
    startGame(); // run on loading of page
  }, []);

  return (
    <div className="bg-emerald-600 h-[100vh]">
      <header>
        <h2>{username}</h2>
        <h2>Total ${money}</h2>
      </header>

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

      {gameStage === "continue" && (
        <div className="flex flex-col justify-center items-center h-[100vh]">
          <div className="">
            Dealer Hand:
            {dealerHand.map((card, index) => {
              return (
                <p key={index}>
                  card:{index + 1} = "{card.display} of {card.suit}"
                </p>
              );
            })}
          </div>
          <div>
            PlayerHand:
            {playerHand.map((card, index) => {
              return (
                <p key={index}>
                  card:{index + 1} = "{card.display} of {card.suit}"
                </p>
              );
            })}
          </div>
          <div>
            <button className="bg-black text-white px-4 py-4 text-[20px] mx-5">
              Stand
            </button>
            <button
              onClick={hit}
              className="bg-black text-white px-4 py-4 text-[20px] mx-5"
            >
              Hit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
