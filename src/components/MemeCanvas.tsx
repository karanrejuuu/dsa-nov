'use client';

import React, { useRef, useEffect, useState } from 'react';
import { MemeCaption, MemeTemplate } from '@/types';

interface MemeCanvasProps {
  caption: MemeCaption;
  template: MemeTemplate | null;
  className?: string;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

export const MemeCanvas: React.FC<MemeCanvasProps> = ({
  caption,
  template,
  className = '',
  onCanvasReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
    setLoadError(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!template?.url) {
      drawFallbackCard(ctx, canvas, caption);
      setImageLoaded(true);
      if (onCanvasReady) onCanvasReady(canvas);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = template.url;

    img.onload = () => {
      canvas.width = img.width || 600;
      canvas.height = img.height || 600;

      // Draw background template image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Render caption lines with classic Impact meme typography
      renderMemeText(ctx, canvas.width, canvas.height, caption, template);

      setImageLoaded(true);
      if (onCanvasReady) onCanvasReady(canvas);
    };

    img.onerror = () => {
      setLoadError(true);
      canvas.width = 600;
      canvas.height = 400;
      drawFallbackCard(ctx, canvas, caption);
      setImageLoaded(true);
      if (onCanvasReady) onCanvasReady(canvas);
    };
  }, [caption, template, onCanvasReady]);

  return (
    <div className={`relative overflow-hidden rounded-xl bg-slate-950 flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-auto object-contain max-h-[380px] rounded-lg shadow-inner"
        style={{ display: imageLoaded ? 'block' : 'none' }}
      />
      {!imageLoaded && (
        <div className="w-full h-48 bg-slate-900 animate-pulse flex flex-col items-center justify-center text-slate-500 font-mono text-xs">
          <span>Loading meme template...</span>
        </div>
      )}
    </div>
  );
};

function drawFallbackCard(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  caption: MemeCaption
) {
  // Deep space dark cyberpunk gradient card
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#090d16');
  grad.addColorStop(1, '#020617');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 6;
  ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

  // Template tag
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`[ ${caption.template_name.toUpperCase()} ]`, canvas.width / 2, 40);

  // Text
  renderClassicTopBottom(ctx, canvas.width, canvas.height, caption.lines);
}

function renderMemeText(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  caption: MemeCaption,
  template: MemeTemplate
) {
  const normName = template.name.toLowerCase();
  const lines = caption.lines || [];

  // 1. Drake / Two-panel vertical split
  if (normName.includes('drake') || normName.includes('tuxedo winnie') || (template.box_count === 2 && normName.includes('two paths'))) {
    renderDrakePanels(ctx, width, height, lines);
    return;
  }

  // 2. Side-by-side horizontal split (Woman Yelling at Cat, Spiderman Pointing, Buff Doge)
  if (
    normName.includes('woman yelling') ||
    normName.includes('spiderman pointing') ||
    normName.includes('buff doge') ||
    normName.includes('two guys on a bus')
  ) {
    renderSideBySide(ctx, width, height, lines);
    return;
  }

  // 3. Four-panel (Gru's Plan, Anakin Padme)
  if (template.box_count >= 4 || normName.includes('gru') || normName.includes('anakin padme') || lines.length === 4) {
    renderFourPanels(ctx, width, height, lines);
    return;
  }

  // 4. Default: Classic Top and Bottom macro
  renderClassicTopBottom(ctx, width, height, lines);
}

function renderClassicTopBottom(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  lines: string[]
) {
  const topLine = lines[0] || '';
  const bottomLine = lines.length > 1 ? lines[lines.length - 1] : '';

  if (topLine) {
    drawMemeLine(ctx, topLine, width / 2, height * 0.12, width * 0.9, height * 0.2);
  }
  if (bottomLine) {
    drawMemeLine(ctx, bottomLine, width / 2, height * 0.92, width * 0.9, height * 0.2);
  }
}

function renderDrakePanels(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  lines: string[]
) {
  // Top right quadrant
  const topText = lines[0] || '';
  const bottomText = lines[1] || '';

  // Right half: X from width * 0.5 to width
  const centerX = width * 0.72;
  const maxWidth = width * 0.48;

  if (topText) {
    drawMemeLine(ctx, topText, centerX, height * 0.28, maxWidth, height * 0.35);
  }
  if (bottomText) {
    drawMemeLine(ctx, bottomText, centerX, height * 0.75, maxWidth, height * 0.35);
  }
}

function renderSideBySide(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  lines: string[]
) {
  const leftText = lines[0] || '';
  const rightText = lines[1] || '';

  const leftX = width * 0.25;
  const rightX = width * 0.75;
  const maxWidth = width * 0.44;

  if (leftText) {
    drawMemeLine(ctx, leftText, leftX, height * 0.18, maxWidth, height * 0.25);
  }
  if (rightText) {
    drawMemeLine(ctx, rightText, rightX, height * 0.18, maxWidth, height * 0.25);
  }
}

function renderFourPanels(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  lines: string[]
) {
  const positions = [
    { x: width * 0.25, y: height * 0.42 },
    { x: width * 0.75, y: height * 0.42 },
    { x: width * 0.25, y: height * 0.92 },
    { x: width * 0.75, y: height * 0.92 },
  ];

  const maxWidth = width * 0.44;

  lines.slice(0, 4).forEach((text, i) => {
    const pos = positions[i];
    if (pos && text) {
      drawMemeLine(ctx, text, pos.x, pos.y, maxWidth, height * 0.2);
    }
  });
}

function drawMemeLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  maxWidth: number,
  maxHeight: number
) {
  if (!text) return;

  const upper = text.toUpperCase();
  let fontSize = Math.min(48, Math.floor(maxHeight * 0.65));
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Auto-shrink text until it fits within maxWidth
  ctx.font = `900 ${fontSize}px Impact, "Arial Black", Anton, sans-serif`;
  while (ctx.measureText(upper).width > maxWidth && fontSize > 16) {
    fontSize -= 2;
    ctx.font = `900 ${fontSize}px Impact, "Arial Black", Anton, sans-serif`;
  }

  // Word wrap if still too long
  const words = upper.split(' ');
  const linesToDraw: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + ' ' + words[i];
    if (ctx.measureText(testLine).width < maxWidth) {
      currentLine = testLine;
    } else {
      linesToDraw.push(currentLine);
      currentLine = words[i];
    }
  }
  linesToDraw.push(currentLine);

  const lineHeight = fontSize * 1.15;
  const startY = centerY - ((linesToDraw.length - 1) * lineHeight) / 2;

  linesToDraw.forEach((line, index) => {
    const y = startY + index * lineHeight;

    // Classic Meme Text: Thick Black Stroke + Crisp White Fill
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(4, Math.floor(fontSize / 7));
    ctx.strokeText(line, centerX, y);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(line, centerX, y);
  });
}
