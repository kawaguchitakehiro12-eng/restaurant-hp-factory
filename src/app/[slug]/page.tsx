import { PublicStorePage } from "@/components/public/PublicStorePage";

type SlugPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = await params;
  return <PublicStorePage slug={slug} />;
}
