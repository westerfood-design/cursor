import { TotemClient } from "@/components/totem-client";

export default async function TotemPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string; device?: string }>;
}) {
  const params = await searchParams;
  const clientSlug = params.client ?? "acme-mining";
  const deviceCode = params.device ?? "TOTEM-NORTE-01";

  return <TotemClient clientSlug={clientSlug} deviceCode={deviceCode} />;
}
