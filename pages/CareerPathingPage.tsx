import React from 'react';
import { CareerPathing } from '../components/CareerPathing';

const CareerPathingModule: React.FC = () => {
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-6 shadow-[0_0_15px_rgba(0,255,255,0.1)]">
        <CareerPathing />
    </div>
  );
};

export default CareerPathingModule;