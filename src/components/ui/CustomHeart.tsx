'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { twMerge } from 'tailwind-merge'
import { clsx, type ClassValue } from 'clsx'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface CustomHeartProps {
  className?: string
  size?: number
  animate?: boolean
  onClick?: () => void
}

export function CustomHeart({
  className,
  size = 24,
  animate = true,
  onClick
}: CustomHeartProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={animate ? { scale: 1.15 } : {}}
      whileTap={animate ? { scale: 0.85, rotate: -5 } : {}}
      className={cn("relative flex items-center justify-center shrink-0 cursor-pointer overflow-visible", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src="/heart.png"
        alt="Heart"
        width={size}
        height={size}
        className="object-contain w-full h-full drop-shadow-sm"
        priority
      />
    </motion.div>
  )
}
