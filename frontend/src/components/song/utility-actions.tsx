'use client';

import { useState } from 'react';
import QRCode from 'qrcode';
import { Printer, Download, QrCode, Copy, Share2, Check } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function UtilityActions({ songId, title }: { songId: string; title: string }) {
  const [qr, setQr] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleQr = async () => {
    if (!qr) {
      try {
        const dataUrl = await QRCode.toDataURL(window.location.href, { margin: 1, width: 220 });
        setQr(dataUrl);
      } catch {
        /* ignore */
      }
    }
    setShowQr((s) => !s);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const share = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url: window.location.href });
      } catch {
        /* user cancelled */
      }
    } else {
      void copy();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print
        </Button>
        <a
          href={`/api/songs/${songId}/download`}
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
          <Download className="h-4 w-4" /> PDF
        </a>
        <Button variant="outline" size="sm" onClick={toggleQr}>
          <QrCode className="h-4 w-4" /> QR
        </Button>
        <Button variant="outline" size="sm" onClick={copy}>
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy link'}
        </Button>
        <Button variant="outline" size="sm" onClick={share}>
          <Share2 className="h-4 w-4" /> Share
        </Button>
      </div>
      {showQr && qr ? (
        <div className="inline-block rounded-xl border bg-card p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR code to this song" width={180} height={180} />
        </div>
      ) : null}
    </div>
  );
}
