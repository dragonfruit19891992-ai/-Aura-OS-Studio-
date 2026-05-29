import React, { useState } from 'react';
import { Image as ImageIcon, ShoppingCart, Lock, Monitor, ChevronRight, CheckCircle2, ChevronDown, Upload, Users, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [step, setStep] = useState(1);
  const [isBuilding, setIsBuilding] = useState(false);

  // Form State
  const [welcomeData, setWelcomeData] = useState({ title: 'Welcome to our Business', subtitle: 'We provide the best services in town.', bg: '#0f172a' });
  const [aboutData, setAboutData] = useState({ title: 'Who We Are', subtitle: 'Our Story', text: 'We started this business to help people...', bg: '#1e293b' });
  const [terminalData, setTerminalData] = useState({ companyId: 'comp_1' });
  const [loginData, setLoginData] = useState({ employeeTitle: 'Employee Login', clientTitle: 'Client Portal', usernameLabel: 'Username', passLabel: 'Password' });

  const handlePublish = () => {
    setIsBuilding(true);
    setTimeout(() => {
      setIsBuilding(false);
      setStep(5);
    }, 2500);
  };

  const companies = [
    { id: 'comp_1', name: "Acme Plumbing Co." },
    { id: 'comp_2', name: "Acme HVAC Services" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Top Nav */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="font-black text-xl tracking-tight text-slate-800">AURA<span className="font-light">Sovereign</span> Wizard</h1>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-2 w-16 rounded-full transition-colors ${s <= step && step !== 5 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
          ))}
        </div>
      </header>

      <main className="flex-1 flex p-8 gap-8 max-w-7xl mx-auto w-full">
        
        {/* LEFT COLUMN: Controls */}
        <div className="w-1/2 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Welcome Page */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-3xl font-black mb-2">Step 1: Welcome Page</h2>
                <p className="text-slate-500 mb-8">Set up the first thing your customers see.</p>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Main Title</label>
                    <input type="text" value={welcomeData.title} onChange={e => setWelcomeData({...welcomeData, title: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subtitle</label>
                    <input type="text" value={welcomeData.subtitle} onChange={e => setWelcomeData({...welcomeData, subtitle: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 font-medium" />
                  </div>
                  <div className="flex gap-4">
                    <button className="flex-1 border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 transition-colors">
                      <ImageIcon className="w-6 h-6" /> <span className="text-sm font-bold">Upload Background</span>
                    </button>
                    <button className="flex-1 border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 transition-colors">
                      <Upload className="w-6 h-6" /> <span className="text-sm font-bold">Upload Logo</span>
                    </button>
                  </div>
                  <button onClick={() => setStep(2)} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all mt-4">
                    Continue to About Us <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Who We Are */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-3xl font-black mb-2">Step 2: Who We Are</h2>
                <p className="text-slate-500 mb-8">Tell your customers your story.</p>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Section Title</label>
                    <input type="text" value={aboutData.title} onChange={e => setAboutData({...aboutData, title: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subtitle</label>
                    <input type="text" value={aboutData.subtitle} onChange={e => setAboutData({...aboutData, subtitle: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">About Text</label>
                    <textarea rows={4} value={aboutData.text} onChange={e => setAboutData({...aboutData, text: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 font-medium resize-none" />
                  </div>
                  <div className="flex gap-4 pt-2">
                    <button onClick={() => setStep(1)} className="px-6 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Back</button>
                    <button onClick={() => setStep(3)} className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all">
                      Link Terminal <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Link Terminal */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-3xl font-black mb-2">Step 3: Link Terminal</h2>
                <p className="text-slate-500 mb-8">Securely connect your POS and webhooks.</p>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
                  <div className="bg-indigo-50 text-indigo-700 p-4 rounded-xl flex gap-4 items-start border border-indigo-100">
                    <ShoppingCart className="w-6 h-6 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">Your products page will automatically link to the Sovereign POS engine for the company selected below.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Company</label>
                    <div className="relative">
                      <select 
                        value={terminalData.companyId} 
                        onChange={e => setTerminalData({companyId: e.target.value})}
                        className="w-full border-2 border-slate-200 rounded-xl px-4 py-4 outline-none focus:border-indigo-600 font-bold appearance-none bg-white cursor-pointer"
                      >
                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button onClick={() => setStep(2)} className="px-6 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Back</button>
                    <button onClick={() => setStep(4)} className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all">
                      Configure Logins <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Login Setup */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-3xl font-black mb-2">Step 4: Login Portals</h2>
                <p className="text-slate-500 mb-8">Customize what your clients and employees see.</p>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Employee Portal Title</label>
                      <input type="text" value={loginData.employeeTitle} onChange={e => setLoginData({...loginData, employeeTitle: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 font-medium text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Client Portal Title</label>
                      <input type="text" value={loginData.clientTitle} onChange={e => setLoginData({...loginData, clientTitle: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 font-medium text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Username Field Label</label>
                      <input type="text" value={loginData.usernameLabel} onChange={e => setLoginData({...loginData, usernameLabel: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 font-medium text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password Field Label</label>
                      <input type="text" value={loginData.passLabel} onChange={e => setLoginData({...loginData, passLabel: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 font-medium text-sm" />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button onClick={() => setStep(3)} className="px-6 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Back</button>
                    <button disabled={isBuilding} onClick={handlePublish} className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                      {isBuilding ? <span className="animate-pulse">Building...</span> : <><Monitor className="w-5 h-5" /> Publish Live</>}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Success */}
            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-black mb-2 text-slate-900">Website Published!</h2>
                <p className="text-slate-500 mb-8">All webhooks, terminals, and logins are actively linked to True Oath Five.</p>
                <button onClick={() => setStep(1)} className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors">Start Over</button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: Live Preview */}
        <div className="w-1/2 bg-slate-200 rounded-3xl p-4 flex flex-col shadow-inner relative overflow-hidden">
          <div className="bg-slate-800 h-6 w-full rounded-t-xl flex items-center px-4 gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-[10px] text-slate-400 font-mono ml-4">Live Preview</span>
          </div>
          
          <div className="flex-1 bg-white rounded-b-xl overflow-hidden flex flex-col relative shadow-lg border border-slate-300">
            {step === 1 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-white" style={{ background: welcomeData.bg }}>
                <h1 className="text-4xl font-black mb-4">{welcomeData.title}</h1>
                <p className="text-lg opacity-80">{welcomeData.subtitle}</p>
              </div>
            )}
            
            {step === 2 && (
              <div className="flex-1 flex flex-col p-8 text-white" style={{ background: aboutData.bg }}>
                <h1 className="text-3xl font-black mb-2">{aboutData.title}</h1>
                <h3 className="text-lg font-bold opacity-80 mb-6">{aboutData.subtitle}</h3>
                <p className="text-sm opacity-90 leading-relaxed">{aboutData.text}</p>
              </div>
            )}

            {step === 3 && (
              <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-8">
                <ShoppingCart className="w-16 h-16 text-indigo-200 mb-6" />
                <h2 className="text-xl font-bold text-slate-800">Products Page</h2>
                <p className="text-sm text-slate-500 mt-2">Linked to {companies.find(c => c.id === terminalData.companyId)?.name}</p>
                <div className="mt-8 bg-white border border-slate-200 rounded-lg p-4 w-full text-center text-xs text-slate-400">
                  Products will render here dynamically.
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 p-8">
                <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl">
                  <Lock className="w-8 h-8 text-indigo-600 mb-4" />
                  <h2 className="text-xl font-black text-slate-900 mb-6">{loginData.employeeTitle}</h2>
                  <div className="space-y-4">
                    <input type="text" placeholder={loginData.usernameLabel} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none" disabled />
                    <input type="password" placeholder={loginData.passLabel} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none" disabled />
                    <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold text-sm mt-2" disabled>Login</button>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="flex-1 flex flex-col items-center justify-center bg-white p-8">
                <CheckCircle2 className="w-20 h-20 text-emerald-500 mb-4" />
                <h2 className="text-2xl font-black text-slate-800">Preview Live</h2>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
