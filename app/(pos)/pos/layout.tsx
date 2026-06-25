// POS layout — full-screen, no shared chrome
export default function PosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-950">
      {children}
    </div>
  );
}
