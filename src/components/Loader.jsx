import React from "react";
import { FaLeaf } from "react-icons/fa";

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      <div className="relative">
        {/* Rotating outer circle */}
        <div className="absolute inset-0 animate-spin-slow">
          <FaLeaf className="text-green-300 text-6xl transform rotate-0" />
          <FaLeaf className="text-green-400 text-6xl transform rotate-90 absolute top-0" />
          <FaLeaf className="text-green-500 text-6xl transform rotate-180 absolute top-0" />
          <FaLeaf className="text-green-600 text-6xl transform rotate-270 absolute top-0" />
        </div>
        
        {/* Center eco icon */}
        <div className="relative z-10 animate-pulse">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <FaLeaf className="text-green-600 text-3xl" />
          </div>
        </div>
      </div>
      
      <p className="mt-4 text-green-700 font-medium animate-pulse">
        Loading sustainable world...
      </p>
    </div>
  );
};

export default Loader;
