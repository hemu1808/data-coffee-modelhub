'use client';

import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'line' | 'circle' | 'rect';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, variant = 'rect', width, height }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-hub-hover/80 shrink-0',
        variant === 'circle' && 'rounded-full',
        variant === 'line' && 'rounded-full h-3',
        variant === 'rect' && 'rounded-hub-sm',
        className
      )}
      style={{ width, height }}
    />
  );
}

export function ChatListSkeleton() {
  return (
    <div className="space-y-2 px-2 py-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2.5 px-2.5 py-2">
          <Skeleton variant="circle" width={7} height={7} />
          <Skeleton variant="line" className="flex-1 h-3" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <Skeleton variant="circle" width={28} height={28} className="rounded-lg mt-0.5" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="line" className="w-20 h-3" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
    </div>
  );
}
