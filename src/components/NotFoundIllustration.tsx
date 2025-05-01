import React from "react";

const NotFoundIllustration: React.FC = () => {
  return (
    <div className="w-full max-w-md mx-auto my-8">
      <svg
        viewBox="0 0 500 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {/* Background Elements */}
        <circle cx="250" cy="200" r="120" fill="#EFF6FF" />
        <circle cx="250" cy="200" r="80" fill="#DBEAFE" opacity="0.7" />

        {/* 404 Text */}
        <path d="M146 180H166V240H146V180Z" fill="#2563EB" />
        <path d="M126 240H186V260H126V240Z" fill="#2563EB" />
        <path d="M126 180H146V200H126V180Z" fill="#2563EB" />
        <path d="M126 220H146V240H126V220Z" fill="#2563EB" />

        {/* Circle (0) */}
        <circle cx="250" cy="220" r="40" stroke="#2563EB" strokeWidth="20" />

        {/* 4 on the right */}
        <path d="M334 180H354V240H334V180Z" fill="#2563EB" />
        <path d="M314 240H374V260H314V240Z" fill="#2563EB" />
        <path d="M314 180H334V200H314V180Z" fill="#2563EB" />
        <path d="M314 220H334V240H314V220Z" fill="#2563EB" />

        {/* Decorative Elements */}
        <circle cx="150" cy="120" r="8" fill="#BFDBFE" />
        <circle cx="350" cy="130" r="10" fill="#BFDBFE" />
        <circle cx="180" cy="300" r="12" fill="#BFDBFE" />
        <circle cx="320" cy="310" r="9" fill="#BFDBFE" />
        <circle cx="400" cy="220" r="14" fill="#BFDBFE" />
        <circle cx="100" cy="240" r="11" fill="#BFDBFE" />

        {/* Paper Plane */}
        <path d="M400 150L370 170L390 180L400 150Z" fill="#3B82F6" />
        <path d="M400 150L380 190L370 170L400 150Z" fill="#2563EB" />
        <path d="M400 150L390 180L400 170L400 150Z" fill="#1D4ED8" />

        {/* Compass Arrow */}
        <path d="M100 150L120 160L110 170L100 150Z" fill="#3B82F6" />
        <line
          x1="110"
          y1="165"
          x2="130"
          y2="185"
          stroke="#3B82F6"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};

export default NotFoundIllustration;
