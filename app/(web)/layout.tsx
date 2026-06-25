// Customer-facing layout — add Navbar / Footer wrappers here
// when the storefront needs its own distinct wrappers.
export default function WebLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
