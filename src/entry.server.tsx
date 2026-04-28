import { renderToString } from "react-dom/server";
import { ServerRouter } from "react-router";
import type { AppLoadContext, EntryContext } from "react-router";

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  entryContext: EntryContext,
  _loadContext: AppLoadContext,
): Response {
  const html = renderToString(
    <ServerRouter context={entryContext} url={request.url} />
  );

  responseHeaders.set("Content-Type", "text/html");

  return new Response(html, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
