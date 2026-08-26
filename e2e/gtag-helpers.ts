// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT
// Shared gtag.js test helpers. Used by consent.spec.ts and smoke.spec.ts.

import type { Page } from "@playwright/test";

export const GTAG_HOST = "**googletagmanager.com/**";
export const STORAGE_KEY = "analytics_consent";

// Realistic gtag.js stub: processes the queued dataLayer config command and
// fires a GA4 collect fetch when send_page_view is not explicitly false.
// Serves in place of real gtag.js so tests never send live hits to Google.
// Other googletagmanager.com requests (init pixel, etc.) are served empty by
// the GTAG_HOST catch-all — keeps no-violation invariant testable in CI.
export const GA_STUB = `(function(){
  var dl=window.dataLayer||[];
  var mid='';
  try{mid=new URL(document.currentScript.src).searchParams.get('id')||'';}catch(e){}
  if(!mid)return;
  for(var i=0;i<dl.length;i++){
    var cmd=dl[i];
    if(cmd&&cmd[0]==='config'&&cmd[1]===mid&&(!cmd[2]||cmd[2].send_page_view!==false)){
      fetch('https://www.google-analytics.com/g/collect?v=2&tid='+encodeURIComponent(mid)+'&en=page_view&dp='+encodeURIComponent(location.pathname),{keepalive:true}).catch(function(){});
      break;
    }
  }
})();`;

// Stubs gtag.js with GA_STUB and intercepts GA4 collect endpoints.
// Returns a snapshot function: call it to read accumulated event names.
export async function setupCollectInterception(page: Page): Promise<() => string[]> {
  const hits: string[] = [];
  // Catch-all registered first (lower LIFO priority) — silences any other
  // googletagmanager.com requests (init pixel, etc.) so CSP tests see no violations.
  await page.route(GTAG_HOST, (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" }),
  );
  // gtag/js* registered last (highest LIFO priority) — intercepts the script
  // request and responds with GA_STUB instead of the real gtag.js.
  await page.route("**googletagmanager.com/gtag/js*", (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: GA_STUB }),
  );
  // Single pattern matches both www.google-analytics.com and region1.google-analytics.com.
  await page.route("**google-analytics.com/g/collect*", (route) => {
    hits.push(new URL(route.request().url()).searchParams.get("en") ?? "");
    return route.fulfill({ status: 204, body: "" });
  });
  return () => [...hits];
}
