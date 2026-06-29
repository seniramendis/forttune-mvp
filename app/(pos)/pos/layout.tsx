// POS layout — full-screen, no shared chrome
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Point of Sale',
  description: 'Forttune point-of-sale terminal for in-store transactions.',
};

export default function PosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100">
      {children}
    </div>
  );
}
