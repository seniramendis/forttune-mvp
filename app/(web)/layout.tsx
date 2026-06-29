// Customer-facing layout — add Navbar / Footer wrappers here
// when the storefront needs its own distinct wrappers.
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Laptops, Desktops & IT Equipment in Sri Lanka",
  description:
    "Browse laptops, desktops, monitors, networking gear, printers, servers, storage and accessories — all in stock at Forttune.",
};

export default function WebLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
