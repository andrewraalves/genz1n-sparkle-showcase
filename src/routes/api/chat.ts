import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

type Msg = { role: "user" | "assistant" | "system"; content: string };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: Msg[]; system?: string };
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        if (!Array.isArray(body.messages)) return new Response("messages required", { status: 400 });

        const gateway = createLovableAiGatewayProvider(key);
        try {
          const result = await generateText({
            model: gateway("google/gemini-2.5-flash"),
            system: body.system || "Você é um assistente virtual cordial.",
            messages: body.messages.map((m) => ({ role: m.role, content: m.content })),
          });
          return Response.json({ text: result.text });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "AI error";
          return new Response(msg, { status: 500 });
        }
      },
    },
  },
});
