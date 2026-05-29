// BackgroundIcon.tsx
import React from 'react';
import { CATEGORY_ICONS } from '../assets/icon';
import { CATEGORY_COLORS } from './graph';

interface BackgroundIconProps {
  category: string;
  altText?: string; 
}

export default function BackgroundIcon({ category, altText }: BackgroundIconProps) {
  
  const iconSource = CATEGORY_ICONS[category] || CATEGORY_ICONS["อื่น ๆ"];

  return (
    <div className={`w-10 h-10 rounded-4xl bg- flex items-center justify-center p-2 shadow-sm`} style={{ backgroundColor: CATEGORY_COLORS[category] }}> 
      <img 
        src={iconSource} 
        alt={altText || category} 
        className="w-full h-full object-contain"
      />
    </div>
  );
}