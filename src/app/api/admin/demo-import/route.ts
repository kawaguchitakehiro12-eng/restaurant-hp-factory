import { importDemoFromUrls } from "@/lib/admin/demo-url-import/import-service";
import type { DemoUrlImportInput } from "@/types/demo-url-import";
import { validateDemoUrlImportInput } from "@/lib/admin/demo-url-import";

export const maxDuration = 60;

export async function POST(request: Request) {
  let body: DemoUrlImportInput;
  try {
    body = (await request.json()) as DemoUrlImportInput;
  } catch {
    return Response.json({ error: "リクエスト形式が不正です" }, { status: 400 });
  }

  const validationError = validateDemoUrlImportInput(body);
  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 });
  }

  try {
    const result = await importDemoFromUrls(body);
    return Response.json(result);
  } catch {
    return Response.json(
      { error: "情報の取得中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
