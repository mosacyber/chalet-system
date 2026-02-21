import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;

  if (!session?.user) {
    redirect(`/${locale}/auth/login`);
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") {
    redirect(`/${locale}`);
  }

  return <DashboardShell>{children}</DashboardShell>;
}
