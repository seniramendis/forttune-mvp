import { NextRequest } from 'next/server';
import { addClient, removeClient } from '@/lib/product-stream';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const clientId = crypto.randomUUID();

  const stream = new ReadableStream({
    start(controller) {
      // Add this browser tab session to our active clients set
      addClient({ id: clientId, controller });

      // Send an initial connection success message
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'CONNECTED' })}\n\n`));
    },
    cancel() {
      // Clean up when the tab is closed or reloaded
      removeClient(clientId);
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
