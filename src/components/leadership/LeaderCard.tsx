'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronDown, ChevronUp, Quote } from 'lucide-react';

interface LeaderCardProps {
  name: string;
  title: string;
  image: string;
  bio?: string;
  qualifications?: string;
  quote?: string;
  variant?: 'horizontal' | 'square' | 'small';
  imagePosition?: string;
}

export default function LeaderCard({
  name,
  title,
  image,
  bio,
  qualifications,
  quote,
  variant = 'square',
  imagePosition = 'object-top',
}: LeaderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasContent = bio || quote;

  // Determine container height/aspect ratio based on variant
  const containerClasses = {
    horizontal: 'h-[320px] w-full',
    square: 'aspect-square w-full',
    small: 'h-[300px] w-full',
  }[variant];

  return (
    <div className={`group bg-white rounded-[2rem] border border-gray-100 shadow-premium overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-primary/20 ${isExpanded ? 'ring-2 ring-primary/10' : ''}`}>
      <div className={`flex flex-col h-full`}>
        {/* Top Header Section (Always Visible) */}
        <div className={`relative ${containerClasses} overflow-hidden`}>
          <Image
            src={image}
            alt={name}
            fill
            className={`object-cover transition-transform duration-700 group-hover:scale-105 ${imagePosition}`}
          />
          {/* Refined Gradient for readability without burying faces */}
          <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          <div className="absolute bottom-10 left-8 right-8 text-white">
            {/* Reduced Gold Title Font for more professional aesthetic */}
            <span className="text-sm md:text-base font-black uppercase tracking-[0.15em] text-gold-leeds mb-2 block leading-none drop-shadow-md">
              {title}
            </span>
            {/* Reduced Name Font size to ensure single-line display */}
            <h3 className="text-xl md:text-2xl font-black tracking-tight leading-tight">
              {name}
            </h3>
            {qualifications && variant !== 'small' && (
              <p className="text-[10px] font-medium text-white/70 mt-1 uppercase tracking-widest">{qualifications}</p>
            )}
          </div>
        </div>

        {/* Action / "Dropdown" Toggle */}
        {hasContent && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between px-8 py-4 bg-gray-50/50 hover:bg-gray-100/50 transition-colors border-t border-gray-100"
          >
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              {isExpanded ? 'Hide Details' : 'Read Bio'}
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
            {!isExpanded && (
              <div className="flex gap-1 items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-gold-leeds animate-pulse" />
                <span className="text-[10px] font-bold text-gold-leeds/60 uppercase">Details inside</span>
              </div>
            )}
          </button>
        )}

        {/* Expandable Dropdown Content */}
        {isExpanded && (
          <div className="px-8 py-8 bg-white border-t border-gray-100 animate-in slide-in-from-top-2 fade-in duration-300">
            {quote && (
              <div className="relative mb-6 pl-6 border-l-4 border-gold-leeds/30">
                <Quote className="absolute -left-2 -top-3 w-5 h-5 text-gold-leeds/20 rotate-180" />
                <p className="text-gray-700 italic text-[15px] leading-relaxed whitespace-pre-line">
                  {quote}
                </p>
              </div>
            )}
            {bio && (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm leading-relaxed font-medium">
                  {bio}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
