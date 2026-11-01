'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Problem } from '@/types';
import { useApp } from '@/context/AppContext';

interface ProblemLinkProps {
  problem: Problem;
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
}

export const ProblemLink: React.FC<ProblemLinkProps> = ({
  problem,
  className = '',
  children,
  showIcon = false,
}) => {
  const { openProblem } = useApp();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openProblem(problem);
  };

  return (
    <a
      href={problem.url}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 hover:underline transition-colors cursor-pointer group ${className}`}
      title={`Open ${problem.title} on LeetCode`}
    >
      <span className="group-hover:text-cyan-400 transition-colors">
        {children || problem.title}
      </span>
      {showIcon && (
        <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:text-cyan-400 transition-opacity flex-shrink-0" />
      )}
    </a>
  );
};
