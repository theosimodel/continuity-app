import React from 'react';
import { Star, Sparkles, BookOpen, Minus } from 'lucide-react';
import { AIEnrichment } from '../types';

interface SignificanceBadgeProps {
  enrichment: AIEnrichment;
  size?: 'sm' | 'md' | 'lg';
}

type BadgeInfo = {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
};

/**
 * Get badge info based on enrichment data
 */
const getBadgeInfo = (enrichment: AIEnrichment): BadgeInfo | null => {
  // Check for first appearances (high priority)
  const hasFirstAppearances =
    enrichment.firstAppearances?.characters?.length ||
    enrichment.firstAppearances?.items?.length ||
    enrichment.firstAppearances?.teams?.length;

  if (hasFirstAppearances) {
    return {
      label: 'First Appearance',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      icon: <Sparkles size={12} />,
    };
  }

  // Check significance level
  if (enrichment.significance === 'major' || enrichment.mustRead) {
    return {
      label: 'Key Issue',
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/20',
      icon: <Star size={12} />,
    };
  }

  if (enrichment.significance === 'minor') {
    return {
      label: 'Notable',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      icon: <BookOpen size={12} />,
    };
  }

  if (enrichment.significance === 'filler' || enrichment.canSkip) {
    return {
      label: 'Optional',
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/20',
      icon: <Minus size={12} />,
    };
  }

  return null;
};

const SignificanceBadge: React.FC<SignificanceBadgeProps> = ({ enrichment, size = 'md' }) => {
  const badge = getBadgeInfo(enrichment);

  if (!badge) return null;

  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5 gap-1',
    md: 'text-[10px] px-2 py-1 gap-1.5',
    lg: 'text-xs px-3 py-1.5 gap-2',
  };

  return (
    <span
      className={`inline-flex items-center font-bold uppercase tracking-wider rounded ${badge.bgColor} ${badge.color} ${sizeClasses[size]}`}
      title={enrichment.significanceNotes}
    >
      {badge.icon}
      {badge.label}
    </span>
  );
};

export default SignificanceBadge;

/**
 * Get formatted first appearances text
 */
export const getFirstAppearancesText = (enrichment: AIEnrichment): string | null => {
  const fa = enrichment.firstAppearances;
  if (!fa) return null;

  const parts: string[] = [];

  if (fa.characters?.length) {
    parts.push(fa.characters.join(', '));
  }
  if (fa.items?.length) {
    parts.push(fa.items.join(', '));
  }
  if (fa.teams?.length) {
    parts.push(fa.teams.join(', '));
  }

  return parts.length > 0 ? parts.join(' | ') : null;
};
