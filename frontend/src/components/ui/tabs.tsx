'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabsCtx {
  value: string;
  setValue: (v: string) => void;
}
const Ctx = React.createContext<TabsCtx | null>(null);

export function Tabs({
  value,
  onValueChange,
  defaultValue,
  children,
  className,
}: {
  value?: string;
  onValueChange?: (v: string) => void;
  defaultValue?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [internal, setInternal] = React.useState(defaultValue ?? '');
  const val = value ?? internal;
  const setValue = (v: string) => {
    onValueChange?.(v);
    if (value === undefined) setInternal(v);
  };
  return <Ctx.Provider value={{ value: val, setValue }}><div className={className}>{children}</div></Ctx.Provider>;
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('inline-flex flex-wrap gap-1 rounded-lg bg-muted p-1', className)}>{children}</div>;
}

export function TabsTrigger({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(Ctx)!;
  const active = ctx.value === value;
  return (
    <button
      type="button"
      onClick={() => ctx.setValue(value)}
      className={cn(
        'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        active ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(Ctx)!;
  if (ctx.value !== value) return null;
  return <div className={cn('animate-fade-in', className)}>{children}</div>;
}
