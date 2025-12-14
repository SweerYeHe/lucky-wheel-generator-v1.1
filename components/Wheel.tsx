import React, { useRef, useEffect, useState } from 'react';
import { Prize } from '../types';
import { playTick } from '../utils/audio';

interface WheelProps {
  prizes: Prize[];
  onFinished: (prize: Prize) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
}

const Wheel: React.FC<WheelProps> = ({ prizes, onFinished, isSpinning, setIsSpinning }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // State for rendering
  const [rotation, setRotation] = useState(0);
  
  // Refs for animation logic to avoid re-renders interrupting the loop
  const rotationRef = useRef(0);
  const isSpinningRef = useRef(false);
  const animationFrameId = useRef<number>(0);
  const lastTickIndexRef = useRef<number>(-1);

  // Constants
  const SIZE = 600; 
  const CENTER = SIZE / 2;
  const RADIUS = SIZE / 2 - 20;

  useEffect(() => {
    drawWheel();
  }, [prizes, rotation]);

  const getSliceIndexFromRotation = (currentRotation: number) => {
    const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
    // Normalize rotation. Pointer is at -PI/2 (top). 
    // We want the angle on the wheel that is currently at -PI/2.
    // WheelAngle + Rotation = -PI/2  =>  WheelAngle = -PI/2 - Rotation
    
    let angle = (-Math.PI / 2 - currentRotation) % (2 * Math.PI);
    if (angle < 0) angle += 2 * Math.PI;

    let currentWeight = 0;
    for (let i = 0; i < prizes.length; i++) {
      const sliceSize = (prizes[i].weight / totalWeight) * 2 * Math.PI;
      const start = (currentWeight / totalWeight) * 2 * Math.PI;
      const end = start + sliceSize;
      
      if (angle >= start && angle < end) {
        return i;
      }
      currentWeight += prizes[i].weight;
    }
    return -1;
  };

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, SIZE, SIZE);

    const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
    let startAngle = 0;

    // Draw Slices
    prizes.forEach((prize) => {
      const sliceAngle = (prize.weight / totalWeight) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(CENTER, CENTER);
      ctx.arc(CENTER, CENTER, RADIUS, startAngle + rotation, endAngle + rotation);
      ctx.fillStyle = prize.color;
      ctx.fill();
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(CENTER, CENTER);
      ctx.rotate(startAngle + sliceAngle / 2 + rotation);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px "Noto Sans SC", sans-serif';
      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 2;
      ctx.fillText(prize.name, RADIUS - 40, 10);
      ctx.restore();

      startAngle = endAngle;
    });

    // Draw Outer Ring
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, RADIUS, 0, 2 * Math.PI);
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    
    // Inner Ring decoration
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, RADIUS - 5, 0, 2 * Math.PI);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.stroke();

    // Center Knob
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, 25, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.shadowBlur = 5;
    ctx.fill();
  };

  const spin = () => {
    if (isSpinningRef.current || prizes.length === 0) return;

    setIsSpinning(true);
    isSpinningRef.current = true;
    lastTickIndexRef.current = -1;
    
    const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
    
    // Select winner
    let random = Math.random() * totalWeight;
    let winnerIndex = -1;
    for (let i = 0; i < prizes.length; i++) {
      random -= prizes[i].weight;
      if (random <= 0) {
        winnerIndex = i;
        break;
      }
    }
    const winner = prizes[winnerIndex];

    // Calculate target rotation to land winner in center
    // 1. Calculate center angle of winner slice (unrotated)
    let weightBefore = 0;
    for (let i = 0; i < winnerIndex; i++) weightBefore += prizes[i].weight;
    const sliceAngle = (winner.weight / totalWeight) * 2 * Math.PI;
    const winnerCenterAngle = (weightBefore / totalWeight) * 2 * Math.PI + sliceAngle / 2;
    
    // 2. We want: rotation + winnerCenterAngle = -PI/2 (top)
    // So targetRotation = -PI/2 - winnerCenterAngle
    let targetBase = -Math.PI / 2 - winnerCenterAngle;
    
    // 3. Current rotation
    let current = rotationRef.current;
    
    // 4. Add multiple full spins (min 5, max 8)
    // Adjust target to be ahead of current
    // We want target > current
    const fullSpins = (5 + Math.floor(Math.random() * 3)) * 2 * Math.PI;
    
    // Normalize current relative to targetBase to find next valid landing spot
    // We want final target to be: targetBase + K * 2PI
    // such that finalTarget > current + fullSpins
    
    // First, align current to modulo 2PI
    // It's easier to just take targetBase and add enough 2PIs until it's far enough
    let finalTarget = targetBase;
    while (finalTarget < current + fullSpins) {
      finalTarget += 2 * Math.PI;
    }
    
    // Add a tiny randomness within the slice (-40% to +40% of slice width) to look natural
    // but keep it safe from boundaries
    const randomOffset = (Math.random() - 0.5) * 0.8 * sliceAngle;
    finalTarget += randomOffset;

    const startTime = performance.now();
    const duration = 6000; // 6 seconds for better suspense

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Quintic Ease Out: 1 - (1-t)^5
      // This provides a very strong initial burst and a very long, slow finish
      const ease = 1 - Math.pow(1 - progress, 5);
      
      const newRot = current + (finalTarget - current) * ease;
      rotationRef.current = newRot;
      setRotation(newRot);

      // Sound check
      const currentSliceIndex = getSliceIndexFromRotation(newRot);
      if (currentSliceIndex !== -1 && currentSliceIndex !== lastTickIndexRef.current) {
         playTick();
         lastTickIndexRef.current = currentSliceIndex;
      }

      if (progress < 1) {
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        isSpinningRef.current = false;
        setIsSpinning(false);
        onFinished(winner);
      }
    };

    animationFrameId.current = requestAnimationFrame(animate);
  };
  
  useEffect(() => {
    if (isSpinning && !isSpinningRef.current) {
      spin();
    }
  }, [isSpinning]);

  return (
    <div className="relative w-full max-w-[600px] aspect-square mx-auto my-4">
      {/* Pointer at Top Center */}
      <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 z-20 pointer-events-none drop-shadow-lg">
         {/* Fancy Pointer */}
        <div className="w-0 h-0 
          border-l-[15px] border-l-transparent
          border-r-[15px] border-r-transparent
          border-t-[40px] border-t-amber-400">
        </div>
        <div className="w-4 h-4 bg-white rounded-full absolute -top-[40px] left-1/2 -translate-x-1/2 shadow-sm"></div>
      </div>
      
      <div className="relative w-full h-full">
         <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            className="w-full h-full drop-shadow-2xl rounded-full"
            style={{ transform: `rotate(0deg)` }}
        />
      </div>

      {/* Center Spin Button */}
      <button 
        onClick={() => { if (!isSpinning) setIsSpinning(true); }}
        disabled={isSpinning}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          w-20 h-20 rounded-full bg-gradient-to-br from-white to-slate-100 border-4 border-indigo-500
          flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.2)] z-30 transition-all
          ${isSpinning ? 'scale-95 opacity-90 cursor-not-allowed shadow-none' : 'hover:scale-110 hover:-rotate-3 active:scale-95'}
        `}
      >
        <span className="font-display text-2xl text-indigo-600 font-bold tracking-widest pl-1">
          {isSpinning ? '...' : '抽'}
        </span>
      </button>
    </div>
  );
};

export default Wheel;
