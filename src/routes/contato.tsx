import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { settingsQuery, getSetting } from "@/lib/site-queries";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — GenZ1n Tech" },
      { name: "description", content: "Fale com o time GenZ1n. Projetos, parcerias e propostas." },
      { property: "og:title", content: "Contato — GenZ1n Tech" },
      { property: "og:description", content: "Fale com o time GenZ1n." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(200),
  email: z.string().trim().email("E-mail inválido").max(200),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(5, "Mensagem muito curta").max(5000),
});

function ContactPage() {
  const { data: settings } = useQuery(settingsQuery);
  const contact = getSetting(settings, "contact_info", {
    email: "ola@genz1n.com",
    phone: "+55 11 00000-0000",
    address: "São Paulo, BR",
    hours: "Seg. a Sex. 09h — 18h",
  } as { email: string; phone: string; address: string; hours: string });

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject || null,
      message: parsed.data.message,
    });
    setLoading(false);
    if (error) return toast.error("Não foi possível enviar. Tente novamente.");
    toast.success("Mensagem enviada! Vamos te responder em breve.");
    setForm({ name: "", email: "", subject: "", message: "" });
  }

  return (
    <main className="relative py-24 px-6 overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="blob w-[500px] h-[500px] left-[-100px] top-[10%] bg-[#003CFF]" />
        <div className="blob w-[600px] h-[600px] right-[-150px] bottom-[10%] bg-[#B800FF]" style={{ animationDelay: "-5s" }} />
      </div>

      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-16">
          <p className="text-accent font-mono text-xs tracking-[0.3em] uppercase mb-3">Vamos conversar</p>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            <span className="text-gradient-brand">Diga oi</span> para o time.
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Conte sua ideia, um projeto, uma dúvida. A gente responde em até 48h.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact info cards - left */}
          <aside className="lg:col-span-2 space-y-4">
            <InfoCard icon={Mail} label="E-mail" value={contact.email} href={`mailto:${contact.email}`} />
            <InfoCard icon={Phone} label="Telefone" value={contact.phone} href={`tel:${contact.phone.replace(/\D/g, "")}`} />
            <InfoCard icon={MapPin} label="Endereço" value={contact.address} />
            <InfoCard icon={Clock} label="Horário" value={contact.hours} />
          </aside>

          {/* Form - right */}
          <div className="lg:col-span-3">
            <form onSubmit={submit} className="glass-panel rounded-3xl p-8 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 gradient-brand" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl gradient-brand flex items-center justify-center">
                  <MessageSquare size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Envie uma mensagem</h2>
                  <p className="text-xs text-muted-foreground">Todos os campos com * são obrigatórios</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Field label="Nome" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                <Field label="E-mail" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
              </div>
              <div className="mb-4">
                <Field label="Assunto" value={form.subject} onChange={(v) => setForm({ ...form, subject: v })} />
              </div>
              <div className="mb-6">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Mensagem *</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={6}
                  required
                  className="mt-1 w-full bg-background/60 border border-border rounded-xl p-4 text-sm outline-none focus:border-accent resize-none"
                  placeholder="Como podemos ajudar?"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full gradient-brand text-white font-semibold inline-flex justify-center items-center gap-2 shadow-[0_0_30px_rgba(0,60,255,0.4)] hover:scale-[1.01] transition-transform disabled:opacity-50"
              >
                <Send size={16} /> {loading ? "Enviando..." : "Enviar mensagem"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoCard({
  icon: Icon, label, value, href,
}: { icon: typeof Mail; label: string; value: string; href?: string }) {
  const inner = (
    <div className="glass-panel rounded-2xl p-5 flex items-start gap-4 hover:border-accent transition-colors">
      <div className="w-11 h-11 rounded-xl gradient-brand flex items-center justify-center shrink-0">
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="text-sm mt-1 text-foreground">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href}>{inner}</a> : inner;
}

function Field({
  label, value, onChange, type = "text", required,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}{required && " *"}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-1 w-full bg-background/60 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent"
      />
    </div>
  );
}
