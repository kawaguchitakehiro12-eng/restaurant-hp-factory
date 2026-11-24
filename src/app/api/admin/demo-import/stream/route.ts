import {readOperatorJson,OperatorInputError} from "@/lib/api/operator-input";
import {
  importDemoFromUrlsStreaming,
  type DemoImportStreamEvent,
} from "@/lib/admin/demo-url-import/import-service";
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

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (event: DemoImportStreamEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      await importDemoFromUrlsStreaming(body, send);
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
