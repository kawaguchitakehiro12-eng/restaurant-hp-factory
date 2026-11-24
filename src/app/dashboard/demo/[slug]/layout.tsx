import { DemoCustomerLayoutShell } from "@/components/dashboard/demo/DemoCustomerLayoutShell";

type DemoDashboardLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function DemoDashboardLayout({
  children,
  params,
}: DemoDashboardLayoutProps) {
  const { slug } = await params;
  return <DemoCustomerLayoutShell slug={slug}>{children}</DemoCustomerLayoutShell>;
}
