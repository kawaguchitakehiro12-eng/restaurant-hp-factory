import {readOperatorJson,OperatorInputError} from "@/lib/api/operator-input";
import { importDemoFromUrls } from "@/lib/admin/demo-url-import/import-service";
import type { DemoUrlImportInput } from "@/types/demo-url-import";
import { validateDemoUrlImportInput } from "@/lib/admin/demo-url-import";
import { requireOperatorApi } from "@/lib/auth/operator";

export const maxDuration = 60;

export async function POST(request: Request) {
  const denied = await requireOperatorApi();
  if (denied) return denied;

  let body: DemoUrlImportInput;
  try {
    body = (await readOperatorJson(request,10000)) as DemoUrlImportInput;
  } catch (error) {
    if(error instanceof OperatorInputError)return Response.json({error:error.message},{status:error.status});
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
