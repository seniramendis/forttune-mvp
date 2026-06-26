import { NextRequest } from 'next/server';

// Global memory set to keep track of active browser tabs
type Client = { id: string; controller: ReadableStreamDefaultController };
let clients = new Set<Client>();

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const clientId = crypto.randomUUID();
  
  const stream = new ReadableStream({
    start(controller) {
      // Add this browser tab session to our active clients set
      clients.add({ id: clientId, controller });
      
      // Send an initial connection success message
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'CONNECTED' })}\n\n`));
    },
    cancel() {
      // Clean up when the tab is closed or reloaded
      clients = new Set([...clients].filter(c => c.id !== clientId));
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}

// Global helper function to trigger the reload signal to all open tabs
export function broadcastReload() {
  const encoder = new TextEncoder();
  clients.forEach((client) => {
    try {
      client.controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'RELOAD' })}\n\n`));
    } catch (e) {
      // Session already dead, ignore
    }
  });
}