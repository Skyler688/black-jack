"use client";

import { useState, useEffect } from "react";

import axios from "axios";
import { motion } from "framer-motion";

import Card from "./card";

export default function ControlePanal({
  gameState,
  username,
  money,
  dealer,
  player,
}) {
  const [balance, setBalance] = useState(money);
  const [gameStage, setGameStage] = useState(gameState); // states (bet, continue, win, tie, bust, lose)
  const [bet, setBet] = useState(0);
  const [playerHand, setPlayerHand] = useState(player);
  const [dealerHand, setDealerHand] = useState(dealer);

  async function placeBet() {
    try {
      const userInfo = await axios.post(
        "http://localhost:4000/game/bet",
        { username: "Testing123", bet: bet }, // NOTE remove username latter and replace backend with session.userId
        { withCredentials: true }
      );

      setBalance(userInfo.data.money);
      setPlayerHand(userInfo.data.playerHand);
      setDealerHand(userInfo.data.dealerHand);
      setGameStage(userInfo.data.game);
      console.log(userInfo.data?.gameState); // prints gameState in development mode.
    } catch (error) {
      console.log(error.message);
    }
  }

  async function stand() {
    try {
      const userInfo = await axios.post(
        "http://localhost:4000/game/stand",
        { username: "Testing123" },
        { withCredentials: true }
      );

      // if the money changes it will send the object, else the object will not be sent.
      if (userInfo.data?.money !== undefined) {
        setBalance(userInfo.data.money);
      }
      setPlayerHand(userInfo.data.playerHand);
      setDealerHand(userInfo.data.dealerHand);
      setGameStage(userInfo.data.game);
      console.log(userInfo.data);
    } catch (error) {
      console.error(error.message);
    }
  }

  async function hit() {
    try {
      const userInfo = await axios.post(
        "http://localhost:4000/game/hit",
        { username: "Testing123" }, // remove later
        { withCredentials: true }
      );

      // if the money changes it will send the object, else the object will not be sent.
      if (userInfo.data?.money !== undefined) {
        setBalance(userInfo.data.money);
      }
      setPlayerHand(userInfo.data.playerHand);
      setDealerHand(userInfo.data.dealerHand);
      setGameStage(userInfo.data.game);
      console.log(userInfo.data?.gameState);
    } catch (error) {
      console.log(error.message);
    }
  }

  return (
    <div className="bg-emerald-600 h-[100vh]">
      <header>
        <h2>{username}</h2>
        <h2>Total ${balance}</h2>
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

      {gameStage === "hitStand" && (
        <div className="flex flex-col justify-center items-center h-[100vh]">
          <div className="">
            Dealer Hand:
            {dealerHand.map((card, index) => {
              return (
                <p key={index}>
                  Card:{index + 1} = "{card.display} of {card.suit}" Value:
                  {card.num}
                </p>
              );
            })}
          </div>
          <div>
            PlayerHand:
            {playerHand.map((card, index) => {
              return (
                <p key={index}>
                  card:{index + 1} = "{card.display} of {card.suit}" Value:
                  {card.num}
                </p>
              );
            })}
          </div>
          <div>
            <button
              onClick={stand}
              className="bg-black text-white px-4 py-4 text-[20px] mx-5"
            >
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

      {gameStage === "bust" && (
        <div className="flex justify-center items-center h-[100vh]">
          <h1 className="text-7xl">Bust!</h1>
        </div>
      )}

      {gameStage === "lose" && (
        <div className="flex justify-center items-center h-[100vh]">
          <h1 className="text-7xl">Dealer wins!</h1>
        </div>
      )}

      {gameStage === "win" && (
        <div className="flex justify-center items-center h-[100vh]">
          <h1 className="text-7xl">You win!</h1>
        </div>
      )}

      {gameStage === "tie" && (
        <div className="flex justify-center items-center h-[100vh]">
          <h1 className="text-7xl">Tie!</h1>
        </div>
      )}
    </div>
  );
}
