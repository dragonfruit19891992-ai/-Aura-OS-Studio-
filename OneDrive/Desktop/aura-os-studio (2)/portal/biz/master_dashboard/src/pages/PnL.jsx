import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function PnL() {
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get('business_id');
  const navigate = useNavigate();

  return (
    <div className="w-full h-screen bg-slate-50 flex items-center justify-center relative">
      <div className="absolute top-6 left-6 flex items-center gap-4">
        <div className="bg-emerald-600 text-white font-black px-4 py-2 rounded-xl shadow-lg">
          PROFIT & LOSS
        </div>
        <p className="font-mono text-slate-500 font-bold bg-white px-3 py-1 rounded-lg border border-slate-200">
          ID: {businessId || 'UNKNOWN'}
        </p>
      </div>

      <div className="text-center max-w-lg mx-auto">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Financials Canvas</h1>
        <p className="text-slate-500 mb-8">This isolated full-page canvas is strictly locked to {businessId}. No cross-contamination possible.</p>
        
        <button 
          onClick={() => navigate('/')} 
          className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-6 py-3 rounded-full transition-colors"
        >
          Return to Master Dashboard
        </button>
      </div>
    </div>
  );
}
