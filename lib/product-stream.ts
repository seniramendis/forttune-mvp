// Shared SSE client registry + broadcast helper.
// This must live OUTSIDE any app/api/**/route.ts file, because Next.js
// App Router route files may only export HTTP method handlers (GET, POST, ...)
// and a small set of route config values (dynamic, revalidate, runtime, ...).
// Exporting anything else (like a broadcastReload function) from a route.ts
// causes Next.js to reject the route entirely, resulting in 404s.

type Client = { id: string; controller: ReadableStreamDefaultController };

let clients = new Set<Client>();

export function addClient(client: Client) {
  clients.add(client);
}

export function removeClient(id: string) {
  clients = new Set([...clients].filter((c) => c.id !== id));
}

// Trigger the reload signal to all open tabs
export function broadcastReload() {
  const encoder = new TextEncoder();
  clients.forEach((client) => {
    try {
      client.controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'RELOAD' })}\n\n`)
      );
    } catch (e) {
      // Session already dead, ignore
    }
  });
}
