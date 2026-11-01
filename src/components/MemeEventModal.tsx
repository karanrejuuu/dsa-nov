'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { MemeSelectionResult } from '@/lib/memeEngine';
import { MemeCard } from './MemeCard';

interface MemeEventModalProps {
  memeData: MemeSelectionResult | null;
  onClose: () => void;
  onLike?: (captionId: string) => void;
  onHide?: (captionId: string) => void;
  isLiked?: boolean;
  autoDismissMs?: number;
  isFullScreen?: boolean;
}

export const MemeEventModal: React.FC<MemeEventModalProps> = ({
  memeData,
  onClose,
  onLike,
  onHide,
  isLiked = false,
  autoDismissMs = 4500,
  isFullScreen = false,
}) => {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!memeData || paused || isFullScreen) return;
    const timer = setTimeout(() => {
      onClose();
    }, autoDismissMs);
    return () => clearTimeout(timer);
  }, [memeData, paused, autoDismissMs, onClose, isFullScreen]);

  if (!memeData) return null;

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 flex p-3 sm:p-4 bg-black/80 backdrop-blur-sm ${
          isFullScreen ? 'items-center justify-center' : 'items-end sm:items-center justify-center'
        }`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="w-full max-w-md relative"
        >
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 z-10 w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white rounded-full flex items-center justify-center shadow-lg border border-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <MemeCard
            caption={memeData.caption}
            template={memeData.template}
            onLike={onLike}
            onHide={onHide}
            isLiked={isLiked}
            onDismiss={onClose}
          />
        </div>
      </div>
    </AnimatePresence>
  );
};
