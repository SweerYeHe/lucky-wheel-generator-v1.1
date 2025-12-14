import React, { useState, useEffect } from 'react';
import Wheel from './components/Wheel';
import Settings from './components/Settings';
import History from './components/History';
import { DEFAULT_SCENARIOS } from './constants';
import { Prize, HistoryItem, WheelScenario } from './types';
import { Settings as SettingsIcon, Gift, X, Sparkles, History as HistoryIcon, Layout } from 'lucide-react';
import { playWin } from './utils/audio';

const App: React.FC = () => {
  // Scenario State Management
  const [scenarios, setScenarios] = useState<WheelScenario[]>(() => {
    const saved = localStorage.getItem('lucky_wheel_scenarios');
    return saved ? JSON.parse(saved) : DEFAULT_SCENARIOS;
  });

  const [currentScenarioId, setCurrentScenarioId] = useState<string>(() => {
    const saved = localStorage.getItem('lucky_wheel_current_id');
    // Ensure the ID actually exists in scenarios, else default to first
    const exists = saved && JSON.parse(localStorage.getItem('lucky_wheel_scenarios') || '[]').some((s: WheelScenario) => s.id === saved);
    return (exists && saved) ? saved : DEFAULT_SCENARIOS[0].id;
  });

  // Derived state: current active prizes
  const currentScenario = scenarios.find(s => s.id === currentScenarioId) || scenarios[0];
  const prizes = currentScenario.prizes;

  // Persist scenarios
  useEffect(() => {
    localStorage.setItem('lucky_wheel_scenarios', JSON.stringify(scenarios));
  }, [scenarios]);

  // Persist selection
  useEffect(() => {
    localStorage.setItem('lucky_wheel_current_id', currentScenarioId);
  }, [currentScenarioId]);

  // Modals state
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Prize | null>(null);
  
  // History state
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('lucky_wheel_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('lucky_wheel_history', JSON.stringify(history));
  }, [history]);

  // --- Scenario Handlers ---

  const handleUpdatePrizes = (newPrizes: Prize[]) => {
    setScenarios(prev => prev.map(s => 
      s.id === currentScenarioId 
        ? { ...s, prizes: newPrizes } 
        : s
    ));
  };

  const handleAddScenario = (name: string) => {
    const newScenario: WheelScenario = {
      id: Date.now().toString(),
      name: name,
      prizes: [], // Start empty? Or maybe default items? Let's start empty.
      createdAt: Date.now()
    };
    setScenarios([...scenarios, newScenario]);
    setCurrentScenarioId(newScenario.id);
  };

  const handleRenameScenario = (id: string, newName: string) => {
    setScenarios(prev => prev.map(s => s.id === id ? { ...s, name: newName } : s));
  };

  const handleDeleteScenario = (id: string) => {
    if (scenarios.length <= 1) {
      alert("至少需要保留一个转盘场景");
      return;
    }
    if (confirm("确定要删除这个转盘场景吗？此操作无法撤销。")) {
      const remaining = scenarios.filter(s => s.id !== id);
      setScenarios(remaining);
      // If we deleted the current one, switch to the first available
      if (currentScenarioId === id) {
        setCurrentScenarioId(remaining[0].id);
      }
    }
  };

  // --- Wheel Handlers ---

  const handleSpinFinished = (prize: Prize) => {
    setWinner(prize);
    playWin();
    
    // Add to history
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      prizeName: prize.name,
      timestamp: Date.now()
    };
    setHistory(prev => [newItem, ...prev]);

    // Trigger confetti
    if (window.confetti) {
      const duration = 3000;
      const end = Date.now() + duration;

      (function frame() {
        window.confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: [prize.color, '#ffffff']
        });
        window.confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: [prize.color, '#ffffff']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }
  };

  const clearHistory = () => {
    if (window.confirm('确定要清空所有中奖记录吗？')) {
      setHistory([]);
    }
  };

  const closeModal = () => {
    setWinner(null);
  };

  return (
    <div className="min-h-screen relative flex flex-col font-sans transition-colors duration-500">
      {/* Header */}
      <header className="px-4 py-4 md:px-8 md:py-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-full shadow-lg backdrop-blur-sm">
            <Gift className="w-6 h-6 text-yellow-300" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white tracking-wider drop-shadow-md leading-none">
              {currentScenario.name}
            </h1>
            <span className="text-xs text-white/60 mt-1 flex items-center gap-1">
               <Layout className="w-3 h-3" /> 点击设置切换场景
            </span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
             onClick={() => setShowHistory(true)}
             disabled={isSpinning}
             className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-2.5 rounded-full text-white transition-all disabled:opacity-50 hover:scale-105 active:scale-95 shadow-lg"
             title="中奖记录"
          >
            <HistoryIcon className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setShowSettings(true)}
            disabled={isSpinning}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-full text-white flex items-center gap-2 transition-all disabled:opacity-50 hover:scale-105 active:scale-95 shadow-lg font-medium"
          >
            <SettingsIcon className="w-5 h-5" />
            <span className="hidden md:inline">设置</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative w-full max-w-5xl mx-auto">
        
        {/* Default View */}
        {!showSettings && !showHistory && (
          <div className="w-full flex flex-col items-center gap-8 animate-fade-in pb-10">
            <Wheel 
              prizes={prizes} 
              onFinished={handleSpinFinished}
              isSpinning={isSpinning}
              setIsSpinning={setIsSpinning}
            />
            
            {!isSpinning && (
               <div className="text-white/90 text-sm font-medium bg-black/20 px-6 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-xl">
                 当前场景：{currentScenario.name} · <span className="text-yellow-300 font-bold mx-1">{prizes.length}</span> 个选项
               </div>
            )}
          </div>
        )}

        {/* Settings Modal Overlay */}
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
             <Settings 
                currentScenario={currentScenario}
                scenarios={scenarios}
                onUpdatePrizes={handleUpdatePrizes}
                onSwitchScenario={setCurrentScenarioId}
                onAddScenario={handleAddScenario}
                onRenameScenario={handleRenameScenario}
                onDeleteScenario={handleDeleteScenario}
                onClose={() => setShowSettings(false)} 
             />
          </div>
        )}

        {/* History Modal Overlay */}
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
             <History 
                history={history} 
                onClear={clearHistory}
                onClose={() => setShowHistory(false)} 
             />
          </div>
        )}
      </main>

      {/* Winner Modal */}
      {winner && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl p-8 md:p-12 max-w-md w-full text-center shadow-2xl relative transform transition-all scale-100 animate-bounce-short border-4 border-yellow-200">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-full shadow-lg border-4 border-white">
               <Sparkles className="w-10 h-10 text-white animate-pulse" />
            </div>
            
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="mt-8 mb-2 text-slate-400 font-medium tracking-wide uppercase text-sm">
                {currentScenario.name} 结果
            </div>
            <div className="text-4xl md:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600 mb-10 break-words leading-tight py-2">
              {winner.name}
            </div>
            
            <button 
              onClick={closeModal}
              className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-95 transition-all"
            >
              太棒了
            </button>
          </div>
        </div>
      )}
      
      <footer className="p-4 text-center text-white/50 text-xs">
         © 2024 Lucky Wheel Generator
      </footer>
    </div>
  );
};

export default App;