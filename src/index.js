// フレームワークなしの検証用

addEventListener("fetch", (event) => {
  return event.respondWith(handleRequest(event));
});

async function handleRequest(e) {
  const { request } = e;
  if (request.method == "POST") {
    const { headers } = request;
    const contentType = headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const json = await request.json();
      if (json.events[0]) {
        console.log(JSON.stringify(json.events[0]));
        return new Response(JSON.stringify(json.events[0]), {
          headers: { "content-type": "application/json" },
        });
      }
      return new Response(JSON.stringify(json), {
        headers: { "content-type": "application/json" },
      });
    }
    return new Response("POST REQUEST", {
      headers: { "content-type": "application/json" },
    });
  } else {
    return new Response("GET REQUEST", {
      headers: { "content-type": "application/json" },
    });
  }
}
