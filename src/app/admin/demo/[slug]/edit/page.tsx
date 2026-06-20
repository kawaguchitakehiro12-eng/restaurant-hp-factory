import { DemoEditPageClient } from "@/components/admin/operator/DemoEditPageClient";

type DemoEditPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function DemoEditPage({ params }: DemoEditPageProps) {
  await params;
  return <DemoEditPageClient />;
}
