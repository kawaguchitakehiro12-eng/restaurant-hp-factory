import {
  importDemoFromUrlsStreaming,
  type DemoImportStreamEvent,
} from "@/lib/admin/demo-url-import/import-service";
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
