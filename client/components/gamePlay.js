"use client";

import { useState, useEffect, useRef } from "react";

import axios from "axios";
import { motion, AnimatePresence, color } from "framer-motion";

import PlaceBetModal from "./modals/placeBet";

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
    <div className="h-[100vh]">
      <header>
        <h2>{username}</h2>
        <h2>Total ${balance}</h2>
      </header>

      <AnimatePresence>
        {gameStage === "bet" && (
          <motion.div
            initial={{ y: "100vh" }}
            animate={{ y: "45vh" }}
            exit={{ y: "100vh" }}
            transition={{ duration: 0.5 }}
            className="flex justify-center w-[100vw]"
            style={{
              position: "fixed",
            }}
          >
            <PlaceBetModal
              bet={bet}
              setBet={setBet}
              money={money}
              setBalance={setBalance}
              setDealerHand={setDealerHand}
              setPlayerHand={setPlayerHand}
              setGameStage={setGameStage}
            ></PlaceBetModal>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gameStage === "hitStand" && (
          <div className="flex flex-col-reverse justify-start items-center mt-auto">
            <div className="mb-[10vh]">
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
            <div className="flex justify-center h-[40vh] relative">
              {playerHand.map((card, index) => {
                const overlapOffset = 30;
                const centerOffset =
                  ((playerHand.length - 1) / 2) * overlapOffset;
                const x = overlapOffset * index - centerOffset;
                return (
                  <motion.div
                    key={`${card.display}-${card.suit}-${index}`}
                    initial={{ x: "50vw" }}
                    animate={{
                      x: `${x}px`,
                      y: `${index * 5}vh`,
                    }}
                    // exit={{ x: "50vw" }}
                    transition={{ duration: 0.5 }}
                    className="w-[14vh] h-[20vh] bg-white absolute"
                  >
                    <p className="text-center">
                      card:{index + 1} = "{card.display} of {card.suit}" Value:
                      {card.num}
                    </p>
                  </motion.div>
                );
              })}
            </div>
            <div className="flex justify-center h-[30vh]">
              {dealerHand.map((card, index) => {
                return (
                  <motion.div
                    key={`${card.display}-${card.suit}-${index}`}
                    initial={{ x: "50vw" }}
                    animate={{ x: "0vw" }}
                    // exit={{ x: "50vw" }}
                    transition={{ duration: 0.5 }}
                    className="w-[14vh] h-[20vh] bg-amber-200 re"
                  >
                    <p className="text-center">
                      Card:{index + 1} = "{card.display} of {card.suit}" Value:
                      {card.num}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </AnimatePresence>

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
