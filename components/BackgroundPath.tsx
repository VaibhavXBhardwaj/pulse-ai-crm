'use client'

import { motion, useScroll, useSpring } from 'framer-motion'

export default function BackgroundPath() {
  const { scrollYProgress } = useScroll()

  const progress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 25,
    mass: 0.5,
  })

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[800px] right-0 h-[700px] w-[700px] rounded-full bg-violet-400/10 blur-[220px]" />

<div className="absolute top-[2500px] left-1/2 h-[700px] w-[700px] rounded-full bg-cyan-400/10 blur-[220px]" />
      <svg
        className="absolute top-0 left-0 w-full h-[4500px]"
        viewBox="0 0 1440 4500"
        fill="none"
        preserveAspectRatio="none"
        
      >
        <defs>
          <linearGradient id="beamGradient">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>


        {/* Animated beam */}

        <motion.path
        
          d="
            M 900 100
            C 1200 500, 1200 900, 850 1300
            S 250 2200, 800 2800
            S 1200 3600, 650 4300
          "
          stroke="url(#beamGradient)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          style={{
            pathLength: progress,
            filter: `
  drop-shadow(0 0 8px rgba(139,92,246,.5))
drop-shadow(0 0 20px rgba(139,92,246,.3))
  
`,
          }}
        />

<circle
  cx="900"
  cy="100"
  r="4"
  fill="#8B5CF6"
/>

<circle
  cx="900"
  cy="100"
  r="10"
  fill="#8B5CF6"
  opacity="0.2"
/>

</svg>
    </div>
  )
}