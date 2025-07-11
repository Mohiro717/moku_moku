
import React from 'react';

const Blob: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={className}>
      <style>
        {`
          @keyframes blob-animation {
            0% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0, 0) scale(1); }
          }
          .animated-blob {
            animation: blob-animation 20s ease-in-out infinite;
          }
        `}
      </style>
      <svg
        viewBox="0 0 1000 1000"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full animated-blob"
      >
        <path
          d="M872.5,607.5Q820,715,707.5,785.5Q595,856,478.5,876.5Q362,897,261.5,821Q161,745,116,622.5Q71,500,123,382Q175,264,281,199.5Q387,135,502,112Q617,89,733.5,153Q850,217,880,358.5Q910,500,872.5,607.5Z"
          fill="#d4e2d4"
        ></path>
      </svg>
    </div>
  );
};

export default Blob;
