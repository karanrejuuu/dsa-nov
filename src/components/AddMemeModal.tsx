'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Search, Sparkles } from 'lucide-react';
import { MemeCaption, MemeEventName, MemeTemplate, MemeTone } from '@/types';
import { getCachedTemplates } from '@/lib/memeEngine';
import { MemeCanvas } from './MemeCanvas';

interface AddMemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCaption: (caption: MemeCaption) => void;
}

export const AddMemeModal: React.FC<AddMemeModalProps> = ({
  isOpen,
  onClose,
  onSaveCaption,
}) => {
  const templates = getCachedTemplates();
  const [search, setSearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate>(templates[0]);
  const [selectedEvent, setSelectedEvent] = useState<MemeEventName>('solved_clean');
  const [selectedTone, setSelectedTone] = useState<MemeTone>('hype');
  const [line0, setLine0] = useState('ME AFTER SOLVING IN O(1)');
  const [line1, setLine1] = useState('FAANG RECRUITER SENDING OFFER');

  if (!isOpen) return null;

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const previewCaption: MemeCaption = {
    id: `custom-${Date.now()}`,
    event: selectedEvent,
    template_name: selectedTemplate.name,
    lines: [line0, line1].filter(Boolean),
    tone: selectedTone,
    enabled: true,
    created_by: 'user',
    times_shown: 0,
  };

  const handleSave = () => {
    onSaveCaption(previewCaption);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-cyan-400">
                MEME WORKSHOP
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">Add Custom Caption</h2>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: Config */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-mono block mb-1">Target Event</label>
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value as MemeEventName)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white font-mono"
                >
                  <option value="solved_clean">Solved clean (hype)</option>
                  <option value="solved_hint">Solved with hint (self)</option>
                  <option value="needed_solution">Needed solution (self)</option>
                  <option value="skipped">Problem Skipped (roast)</option>
                  <option value="day_complete">Day complete</option>
                  <option value="streak_7">Streak 7 Milestone</option>
                  <option value="behind_1">Behind 1 Day</option>
                  <option value="behind_3">Behind 3 Days</option>
                  <option value="behind_5plus">Behind 5+ Days</option>
                  <option value="boss_win">Boss fight win</option>
                  <option value="landing">Landing hero</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-mono block mb-1">Tone</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['hype', 'self', 'roast'] as MemeTone[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTone(t)}
                      className={`py-1.5 rounded-lg border text-xs font-mono font-bold capitalize cursor-pointer ${
                        selectedTone === t
                          ? t === 'hype'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                            : t === 'self'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Picker */}
              <div>
                <label className="text-slate-400 font-mono block mb-1">Select Template</label>
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div className="max-h-32 overflow-y-auto space-y-1 pr-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
                  {filteredTemplates.slice(0, 15).map((tpl) => (
                    <button
                      key={tpl.imgflip_id}
                      type="button"
                      onClick={() => setSelectedTemplate(tpl)}
                      className={`w-full text-left px-2 py-1.5 rounded text-xs truncate cursor-pointer transition-colors ${
                        selectedTemplate.imgflip_id === tpl.imgflip_id
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {tpl.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lines */}
              <div className="space-y-2">
                <div>
                  <label className="text-slate-400 font-mono block mb-1">Top / Panel 1 Line</label>
                  <input
                    type="text"
                    value={line0}
                    onChange={(e) => setLine0(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-mono block mb-1">Bottom / Panel 2 Line</label>
                  <input
                    type="text"
                    value={line1}
                    onChange={(e) => setLine1(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white uppercase font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Live Preview */}
            <div className="space-y-2">
              <label className="text-slate-400 font-mono text-xs block">Live Canvas Preview</label>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 flex items-center justify-center min-h-[220px]">
                <MemeCanvas caption={previewCaption} template={selectedTemplate} />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/25"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Save Custom Meme</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
