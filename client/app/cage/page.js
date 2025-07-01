"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Cage() {
  const [name, setName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiration, setExpiration] = useState("");
  const [cvv, setCvv] = useState("");
  const [buyIn, setBuyIn] = useState(0);

  const router = useRouter();

  function toGame() {
    router.push("/");
  }

  async function buyChips() {
    try {
      await axios.post(
        "http://localhost:4000/user/buy",
        { amount: buyIn },
        { withCredentials: true }
      );

      router.push("/");
    } catch (error) {
      console.log(error.message);
    }
  }

  async function cashout() {
    try {
      await axios.post(
        "http://localhost:4000/user/cashout",
        {},
        { withCredentials: true }
      );

      router.push("/");
    } catch (error) {
      console.log(error.message);
    }
  }

  return (
    <div className="flex flex-col h-[100vh]">
      <button className="bg-gray-600 options" onClick={toGame}>
        Exit
      </button>

      <div className="flex flex-col items-center my-auto">
        <div className="flex flex-col text-end gap-[2vh] my-auto">
          <p className="text-[2vh] text-red-700">
            Note: This is a fake checkout
          </p>
          <label className="label">
            Name On Card:
            <input
              className="input"
              type="text"
              value={name}
              onChange={(e) => setName(e)}
              placeholder="Enter name"
            ></input>
          </label>

          <label className="label">
            Card Number:
            <input
              className="input"
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="Enter card number"
            ></input>
          </label>

          <label className="label">
            Expiration:
            <input
              className="input"
              type="date"
              value={expiration}
              onChange={(e) => setExpiration(e.target.value)}
            ></input>
          </label>

          <label className="label">
            CVV:
            <input
              className="input"
              type="password"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              placeholder="Enter CVV"
            ></input>
          </label>

          <label className="label">
            Buy In $:
            <input
              className="input"
              type="number"
              value={buyIn}
              onChange={(e) => setBuyIn(Number(e.target.value))}
              min={0}
              max={10000}
            ></input>
          </label>
        </div>

        <div className="flex justify-between w-[60vw] lg:w-[40vw] mt-[5vh]">
          <button
            className="bg-blue-700 options"
            disabled={buyIn !== 0}
            onClick={cashout}
          >
            Cashout
          </button>
          <button
            className="bg-red-600 options"
            disabled={buyIn === 0}
            onClick={buyChips}
          >
            Buy Chips
          </button>
        </div>
      </div>
    </div>
  );
}
