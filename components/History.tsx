import React from 'react';
import { HistoryItem } from '../types';
import { X, Trash2, Clock } from 'lucide-react';

interface HistoryProps {
  history: HistoryItem[];
  onClear: () => void;
  onClose: () => void;
}

const History: React.FC<HistoryProps> = ({ history, onClear, onClose }) => {
  return (
    <div className="bg-white/95 backdrop-blur rounded-2xl p-6 md:p-8 shadow-2xl w-full max-w-md mx-auto text-slate-800 h-[70vh] flex flex-col relative animate-fade-in">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-xl font-bold font-display text-indigo-600 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                中奖记录
            </h2>
            <div className="flex gap-2">
                 {history.length > 0 && (
                    <button 
                        onClick={onClear}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="清空记录"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                )}
                <button 
                    onClick={onClose} 
                    className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                    <Clock className="w-12 h-12 opacity-20" />
                    <p>暂无中奖记录</p>
                </div>
            ) : (
                history.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="font-medium text-slate-700">{item.prizeName}</span>
                        <span className="text-xs text-slate-400">
                            {new Date(item.timestamp).toLocaleString('zh-CN', {
                                month: 'numeric',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};

export default History;
