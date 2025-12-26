
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface DashboardCardProps {
  titleKey: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  glowing?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ titleKey, children, className = '', onClick, glowing = false }) => {
  const { t } = useTranslation();
  
  const cardContent = (
    <>
      {/* FIX: Cast titleKey to any to satisfy the type constraints of the t function. */}
      <h2 className="text-sm font-semibold text-cyan-400 mb-3 tracking-wider uppercase">{t(titleKey as any)}</h2>
      <div className="h-[calc(100%-28px)]">
        {children}
      </div>
    </>
  );

  const baseClasses = `bg-slate-900/50 backdrop-blur-sm border rounded-lg p-4 shadow-[0_0_15px_rgba(0,255,255,0.1)] transition-all duration-300`;
  const borderClasses = glowing ? 'border-purple-500/80 animate-pulse-border' : 'border-cyan-400/30';
  
  if (onClick) {
    return (
      <button 
        onClick={onClick}
        className={`${baseClasses} ${borderClasses} text-left w-full hover:border-cyan-400/60 hover:shadow-[0_0_25px_rgba(0,255,255,0.2)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 ${className}`}
      >
        {cardContent}
      </button>
    );
  }

  return (
    <div className={`${baseClasses} ${borderClasses} ${className}`}>
      {cardContent}
    </div>
  );
};