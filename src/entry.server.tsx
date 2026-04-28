import { PassThrough } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";
import { ServerRouter } from "react-router";
import type { AppLoadContext, EntryContext } from "react-router";

const PRERENDER_TIMEOUT_MS = 5000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  entryContext: EntryContext,
  _loadContext: AppLoadContext,
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const body = new PassThrough();
    const chunks: Buffer[] = [];
    body.on("data", (chunk: Buffer) => chunks.push(chunk));
    body.on("end", () => {
      responseHeaders.set("Content-Type", "text/html");
      resolve(
        new Response(Buffer.concat(chunks), {
          headers: responseHeaders,
          status: responseStatusCode,
        }),
      );
    });
    body.on("error", reject);

    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={entryContext} url={request.url} />,
      {
        onAllReady() {
          pipe(body);
        },
        onError(error: unknown) {
          console.error(error);
        },
      },
    );

    setTimeout(abort, PRERENDER_TIMEOUT_MS);
  });
}
