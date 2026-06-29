import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account",
  description: "View your orders, saved addresses and wishlist on Forttune.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
