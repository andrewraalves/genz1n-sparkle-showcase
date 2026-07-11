import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { settingsQuery, getSetting } from "@/lib/site-queries";

type Msg = { role: "user" | "assistant"; content: string };

export function Chatbot() {
  const { data: settings } = useQuery(settingsQuery);
  const cfg = getSetting(settings, "chatbot", {
    enabled: true,
    greeting: "Olá! Como posso ajudar?",
    system_prompt: "Você é um assistente virtual.",
  } as { enabled: boolean; greeting: string; system_prompt: string });

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "assistant", content: cfg.greeting }]);
    }
  }, [open, cfg.greeting, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  if (!cfg.enabled) return null;

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: next,
          system: cfg.system_prompt,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        setMessages((m) => [...m, { role: "assistant", content: `Erro: ${err || res.statusText}` }]);
      } else {
        const json = (await res.json()) as { text: string };
        setMessages((m) => [...m, { role: "assistant", content: json.text }]);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro de conexão";
      setMessages((m) => [...m, { role: "assistant", content: msg }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir chat"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#003CFF] text-white shadow-[0_0_30px_rgba(184,0,255,0.5)] flex items-center justify-center hover:scale-105 transition-transform"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] max-w-sm h-[70vh] max-h-[560px] rounded-2xl glass-panel flex flex-col overflow-hidden shadow-2xl">
          <header className="flex items-center justify-between px-4 py-3 border-b border-border gradient-brand">
            <div>
              <p className="text-sm font-semibold text-white">Assistente GenZ1n</p>
              <p className="text-[10px] text-white/70 uppercase tracking-widest">Online</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
              <X size={20} />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                }`}
              >
                <div className="prose prose-invert prose-sm max-w-none [&_p]:m-0">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 size={14} className="animate-spin" /> pensando...
              </div>
            )}
          </div>

          <form
            className="flex gap-2 p-3 border-t border-border"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escreva sua mensagem..."
              className="flex-1 rounded-full bg-background/60 border border-border px-4 py-2 text-sm outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-full gradient-brand text-white flex items-center justify-center disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
