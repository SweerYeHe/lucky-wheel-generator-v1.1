import React, { useState } from 'react';
import { Prize, WheelScenario } from '../types';
import { COLORS } from '../constants';
import { Trash2, Plus, RefreshCw, Wand2, ArrowLeft, Layout, Edit2, Check, X as XIcon } from 'lucide-react';
import { generatePrizesFromTheme } from '../services/geminiService';

interface SettingsProps {
  currentScenario: WheelScenario;
  scenarios: WheelScenario[];
  onUpdatePrizes: (prizes: Prize[]) => void;
  onSwitchScenario: (id: string) => void;
  onAddScenario: (name: string) => void;
  onRenameScenario: (id: string, newName: string) => void;
  onDeleteScenario: (id: string) => void;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  currentScenario,
  scenarios,
  onUpdatePrizes, 
  onSwitchScenario,
  onAddScenario,
  onRenameScenario,
  onDeleteScenario,
  onClose 
}) => {
  const [newPrizeName, setNewPrizeName] = useState('');
  const [newPrizeWeight, setNewPrizeWeight] = useState(1);
  const [theme, setTheme] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Scenario editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempScenarioName, setTempScenarioName] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');

  const prizes = currentScenario.prizes;

  const addPrize = () => {
    if (!newPrizeName.trim()) return;
    const newPrize: Prize = {
      id: Date.now().toString(),
      name: newPrizeName,
      weight: Math.max(1, Math.floor(newPrizeWeight)),
      color: COLORS[prizes.length % COLORS.length]
    };
    onUpdatePrizes([...prizes, newPrize]);
    setNewPrizeName('');
    setNewPrizeWeight(1);
  };

  const removePrize = (id: string) => {
    onUpdatePrizes(prizes.filter(p => p.id !== id));
  };

  const updateWeight = (id: string, newWeight: number) => {
    onUpdatePrizes(prizes.map(p => p.id === id ? { ...p, weight: Math.max(1, newWeight) } : p));
  };

  const handleAiGenerate = async () => {
    if (!theme.trim()) return;
    setIsGenerating(true);
    setErrorMsg('');
    try {
      const generatedPrizes = await generatePrizesFromTheme(theme);
      onUpdatePrizes(generatedPrizes);
      setTheme('');
    } catch (e: any) {
      setErrorMsg('AI 生成失败，请检查 API Key 配置或稍后重试。');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRename = () => {
    if (tempScenarioName.trim()) {
      onRenameScenario(currentScenario.id, tempScenarioName);
    }
    setIsEditingName(false);
  };

  const handleCreateScenario = () => {
    if (newScenarioName.trim()) {
      onAddScenario(newScenarioName);
      setNewScenarioName('');
      setIsAddingNew(false);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur rounded-2xl p-6 md:p-8 shadow-2xl w-full max-w-3xl mx-auto text-slate-800 h-[85vh] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold font-display text-indigo-600">设置</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
        
        {/* Scenario Management Section */}
        <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
           <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <Layout className="w-5 h-5" />
                当前场景
              </h3>
              {!isAddingNew && (
                <button 
                  onClick={() => setIsAddingNew(true)}
                  className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-200 transition-colors font-medium"
                >
                  + 新建场景
                </button>
              )}
           </div>

           {/* New Scenario Input */}
           {isAddingNew && (
             <div className="flex gap-2 mb-3 animate-fade-in">
               <input 
                 type="text" 
                 autoFocus
                 placeholder="输入新场景名称..."
                 className="flex-1 px-3 py-1.5 rounded border border-indigo-300 focus:ring-2 focus:ring-indigo-400 outline-none text-sm"
                 value={newScenarioName}
                 onChange={e => setNewScenarioName(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleCreateScenario()}
               />
               <button onClick={handleCreateScenario} className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700">确定</button>
               <button onClick={() => setIsAddingNew(false)} className="text-slate-500 px-2 hover:text-slate-700"><XIcon className="w-4 h-4" /></button>
             </div>
           )}

           {/* Scenario Switcher */}
           <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <select 
                  value={currentScenario.id}
                  onChange={(e) => onSwitchScenario(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-400 outline-none bg-white text-slate-700 font-medium"
                >
                  {scenarios.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                
                {isEditingName ? (
                   <div className="flex items-center gap-1 bg-white border border-indigo-300 rounded-lg px-2">
                      <input 
                        type="text"
                        autoFocus
                        className="w-32 py-1 outline-none text-sm"
                        value={tempScenarioName}
                        onChange={e => setTempScenarioName(e.target.value)}
                        onBlur={handleSaveRename}
                        onKeyDown={e => e.key === 'Enter' && handleSaveRename()}
                      />
                      <button onClick={handleSaveRename} className="text-green-500"><Check className="w-4 h-4"/></button>
                   </div>
                ) : (
                   <button 
                    onClick={() => { setTempScenarioName(currentScenario.name); setIsEditingName(true); }}
                    className="p-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-500"
                    title="重命名场景"
                   >
                     <Edit2 className="w-4 h-4" />
                   </button>
                )}
                
                {scenarios.length > 1 && (
                  <button 
                    onClick={() => onDeleteScenario(currentScenario.id)}
                    className="p-2 bg-white border border-red-200 text-red-400 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
                    title="删除当前场景"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
           </div>
        </div>

        {/* AI Generator Section */}
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
          <h3 className="font-semibold text-indigo-700 mb-2 flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            AI 灵感生成奖品
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={`为 "${currentScenario.name}" 生成奖品...`}
              className="flex-1 px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAiGenerate()}
            />
            <button 
              onClick={handleAiGenerate}
              disabled={isGenerating || !theme}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : '生成'}
            </button>
          </div>
          {errorMsg && <p className="text-red-500 text-sm mt-2">{errorMsg}</p>}
        </div>

        {/* Manual Add Section */}
        <div className="space-y-4">
           <h3 className="font-bold text-slate-700">奖品列表 ({prizes.length})</h3>
           
           <div className="flex gap-2 items-end bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1">奖品名称</label>
              <input
                type="text"
                value={newPrizeName}
                onChange={(e) => setNewPrizeName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addPrize()}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="输入奖品..."
              />
            </div>
            <div className="w-24">
              <label className="block text-xs font-semibold text-slate-500 mb-1">权重 (概率)</label>
              <input
                type="number"
                min="1"
                value={newPrizeWeight}
                onChange={(e) => setNewPrizeWeight(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <button 
              onClick={addPrize}
              className="bg-green-500 text-white p-2.5 rounded-lg hover:bg-green-600 transition-colors mb-[1px]"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            {prizes.length === 0 && (
              <p className="text-center text-slate-400 py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                暂无奖品，请添加或使用 AI 生成
              </p>
            )}
            {prizes.map((prize) => (
              <div key={prize.id} className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-slate-100 group">
                <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: prize.color }}></div>
                <div className="flex-1 font-medium text-slate-700">{prize.name}</div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>权重:</span>
                  <input 
                    type="number" 
                    min="1"
                    value={prize.weight}
                    onChange={(e) => updateWeight(prize.id, parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1 border rounded text-center focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <button 
                  onClick={() => removePrize(prize.id)}
                  className="text-slate-300 hover:text-red-500 p-1 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-100 text-right">
        <button 
          onClick={onClose}
          className="bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-900 font-medium"
        >
          完成设置
        </button>
      </div>
    </div>
  );
};

export default Settings;