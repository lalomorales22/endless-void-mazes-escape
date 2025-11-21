import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';
import { Button } from './button';

interface OnboardingTutorialProps {
  onComplete: () => void;
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'WELCOME TO TRON DATABASE INTERFACE',
      content: 'Experience your database in a stunning 3D visualization. Each building represents a table in your database.',
      image: '🏙️'
    },
    {
      title: 'NAVIGATION',
      content: 'Use WASD or Arrow keys to move around. Click and drag with your mouse to rotate the view. Scroll to zoom in and out.',
      image: '🎮'
    },
    {
      title: 'CAMERA PRESETS',
      content: 'Press 1-4 on your keyboard to switch between different camera angles: Overview, Bird\'s Eye, Cinematic, and Low Angle views.',
      image: '📷'
    },
    {
      title: 'INTERACTING WITH DATA',
      content: 'Click on the glowing data blocks inside buildings to view and edit records. Click on building names in the right panel to navigate directly to them.',
      image: '💎'
    },
    {
      title: 'SEARCH & ANALYTICS',
      content: 'Use the SEARCH button to find specific records across tables. Click ANALYTICS to view comprehensive database statistics and insights.',
      image: '📊'
    },
    {
      title: 'MINIMAP',
      content: 'The minimap in the bottom-right shows your position and all database tables. Click on any table dot to navigate to it instantly.',
      image: '🗺️'
    },
    {
      title: 'CREATE & MANAGE',
      content: 'Press SPACE or click CREATE TABLE to add new tables. Use the REFRESH button to reload database data at any time.',
      image: '✨'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-auto">
      <div className="bg-gradient-to-br from-black to-gray-900 border-2 border-cyan-400 rounded-lg shadow-2xl shadow-cyan-400/30 max-w-2xl w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b border-cyan-400/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-cyan-400 font-mono">{steps[currentStep].title}</h2>
              <div className="text-cyan-300 text-sm font-mono mt-2">
                Step {currentStep + 1} of {steps.length}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-gray-400 hover:text-red-400"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="flex flex-col items-center">
            <div className="text-8xl mb-6">{steps[currentStep].image}</div>
            <p className="text-cyan-100 text-lg text-center leading-relaxed font-mono">
              {steps[currentStep].content}
            </p>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center gap-2 pb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? 'w-8 bg-cyan-400'
                  : index < currentStep
                  ? 'w-2 bg-cyan-600'
                  : 'w-2 bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-cyan-600/10 to-blue-600/10 border-t border-cyan-400/50 p-6">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black disabled:opacity-30 font-mono"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              PREVIOUS
            </Button>

            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-gray-400 hover:text-cyan-400 font-mono"
            >
              SKIP TUTORIAL
            </Button>

            <Button
              onClick={handleNext}
              className="bg-cyan-400 text-black hover:bg-cyan-300 font-mono"
            >
              {currentStep === steps.length - 1 ? 'GET STARTED' : 'NEXT'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
