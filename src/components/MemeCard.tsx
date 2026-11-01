'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, Heart, EyeOff, Check } from 'lucide-react';
import { MemeCaption, MemeTemplate } from '@/types';
import { MemeCanvas } from './MemeCanvas';

interface MemeCardProps {
  caption: MemeCaption;
  template: MemeTemplate | null;
  onLike?: (captionId: string) => void;
  onHide?: (captionId: string) => void;
  isLiked?: boolean;
  onDismiss?: () => void;
  showActions?: boolean;
  className?: string;
}

export const MemeCard: React.FC<MemeCardProps> = ({
  caption,
  template,
  onLike,
  onHide,
  isLiked = false,
  onDismiss,
  showActions = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(isLiked);

  const tone = caption.tone || 'self';

  // Glow border classes
  const toneGlow = {
    hype: 'border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.25)]',
    self: 'border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.25)]',
    roast: 'border-rose-500/80 shadow-[0_0_30px_rgba(244,63,94,0.35)]',
  }[tone];

  const toneBadge = {
    hype: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    self: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    roast: 'bg-rose-500/25 text-rose-300 border-rose-500/50',
  }[tone];

  // Motion variants
  const animationVariants = {
    initial: {
      scale: tone === 'roast' ? 1.15 : 0.9,
      opacity: 0,
      rotate: tone === 'roast' ? -2 : 0,
    },
    animate: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        type: 'spring' as const,
        stiffness: tone === 'roast' ? 400 : 300,
        damping: tone === 'roast' ? 15 : 20,
      },
    },
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `dsa-quest-${caption.event}-${Date.now()}.png`;
      a.click();
    } catch (err) {
      console.warn('Canvas export error:', err);
    }
  };

  const handleShare = async () => {
    const text = `${caption.lines.join(' / ')} (via DSA Quest)`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'DSA Quest Meme',
          text,
          url: window.location.href,
        });
        return;
      } catch {
        // fallback to clipboard
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleLike = () => {
    setLiked(!liked);
    if (onLike) onLike(caption.id);
  };

  return (
    <motion.div
      variants={animationVariants}
      initial="initial"
      animate="animate"
      className={`bg-slate-900 border-2 rounded-2xl p-3.5 sm:p-4 text-slate-100 relative overflow-hidden ${toneGlow} ${className}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${toneBadge}`}>
            {tone === 'hype' ? '🔥 HYPE' : tone === 'roast' ? '💀 BRUTAL ROAST' : '🤡 SELF DEPRECATING'}
          </span>
          <span className="text-[10px] font-mono text-slate-400 truncate max-w-[160px]">
            {caption.template_name}
          </span>
        </div>

        {showActions && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleLike}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                liked
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Weight ×3"
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-rose-400' : ''}`} />
            </button>

            {onHide && (
              <button
                onClick={() => onHide(caption.id)}
                className="p-1.5 rounded-lg border bg-slate-800 text-slate-400 border-slate-700 hover:text-rose-400 transition-colors cursor-pointer"
                title="Hide this caption"
              >
                <EyeOff className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Rendered Canvas */}
      <MemeCanvas
        caption={caption}
        template={template}
        onCanvasReady={(c) => {
          canvasRef.current = c;
        }}
      />

      {/* Bottom Action Footer */}
      {showActions && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <span className="text-[10px] text-slate-500">
            {caption.event.replace('_', ' ')}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 text-[11px] font-bold border border-slate-700 cursor-pointer"
            >
              <Download className="w-3 h-3 text-cyan-400" />
              <span>Save</span>
            </button>

            <button
              onClick={handleShare}
              className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 text-[11px] font-bold border border-slate-700 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3 h-3 text-cyan-400" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
