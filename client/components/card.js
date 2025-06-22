"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Card() {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="perspective w-[15vw] h-[22vw]"
      onClick={() => setFlipped(!flipped)}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Front Side */}
        <div className="absolute w-full h-full bg-red-500 rounded-xl flex items-center justify-center backface-hidden">
          <span className="text-white text-2xl">Front</span>
        </div>

        {/* Back Side */}
        <div className="absolute w-full h-full bg-blue-600 rounded-xl flex items-center justify-center rotate-y-180 backface-hidden">
          <span className="text-white text-2xl">Back</span>
        </div>
      </motion.div>
    </div>
  );
}
