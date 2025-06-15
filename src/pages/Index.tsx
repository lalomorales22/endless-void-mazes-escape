
import React from "react";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center">
        <svg
          className="animate-spin h-12 w-12 text-primary mb-6"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
        <h1 className="text-4xl font-bold mb-2 text-primary">Your App is Running!</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Welcome to your project. The setup is working!
        </p>
        <span className="text-gray-500 text-sm">You can start building your app now.</span>
      </div>
    </div>
  );
};

export default Index;
