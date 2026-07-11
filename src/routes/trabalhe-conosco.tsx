import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { jobsQuery, settingsQuery, getSetting } from "@/lib/site-queries";
import { MapPin, Briefcase, Clock, Send } from "lucide-react";

export const Route = createFileRoute("/trabalhe-conosco")({
  head: () => ({
    meta: [
      { title: "Trabalhe Conosco — GenZ1n Tech" },
      { name: "description", content: "Vagas abertas na GenZ1n. Faça parte de um time que redefine o design digital." },
      { property: "og:title", content: "Vagas — GenZ1n" },
      { property: "og:description", content: "Faça parte do time GenZ1n." },
    ],
  }),
  component: Careers,
});

const applicationSchema = z.object({
  full_name: z.string().trim().min(2, "Nome muito curto").max(200),
  email: z.string().trim().email("E-mail inválido").max(200),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  portfolio_url: z.string().trim().url("URL inválida").max(500).optional().or(z.literal("")),
  message: z.string().trim().max(5000).optional().or(z.literal("")),
});

function Careers() {
  const { data: jobs } = useQuery(jobsQuery);
  const { data: settings } = useQuery(settingsQuery);
  const info = getSetting(settings, "careers", {
    title: "Trabalhe Conosco",
    intro: "Faça parte de um time que redefine o design digital.",
  } as { title: string; intro: string });

  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", portfolio_url: "", message: "" });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = applicationSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("job_applications").insert({
      job_id: selectedJob,
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      portfolio_url: parsed.data.portfolio_url || null,
      message: parsed.data.message || null,
    });
    setLoading(false);
    if (error) {
      toast.error("Não foi possível enviar. Tente novamente.");
    } else {
      toast.success("Candidatura enviada! Entraremos em contato em breve.");
      setForm({ full_name: "", email: "", phone: "", portfolio_url: "", message: "" });
      setSelectedJob(null);
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-24">
      <header className="max-w-3xl mb-16">
        <p className="text-accent font-mono text-xs tracking-[0.3em] uppercase mb-3">Carreiras</p>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gradient-brand">{info.title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{info.intro}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section>
          <h2 className="text-2xl font-bold mb-6">Vagas abertas</h2>
          <div className="space-y-4">
            {(jobs ?? []).map((j) => (
              <button
                key={j.id}
                onClick={() => setSelectedJob(j.id)}
                className={`w-full text-left glass-panel rounded-2xl p-6 hover:border-accent transition-colors ${
                  selectedJob === j.id ? "border-accent" : ""
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">{j.title}</h3>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                      {j.department && <span className="flex items-center gap-1"><Briefcase size={12} />{j.department}</span>}
                      {j.location && <span className="flex items-center gap-1"><MapPin size={12} />{j.location}</span>}
                      {j.employment_type && <span className="flex items-center gap-1"><Clock size={12} />{j.employment_type}</span>}
                    </div>
                    {j.description && <p className="mt-3 text-sm text-muted-foreground">{j.description}</p>}
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full ${selectedJob === j.id ? "gradient-brand text-white" : "bg-secondary"}`}>
                    {selectedJob === j.id ? "Selecionada" : "Candidatar"}
                  </span>
                </div>
              </button>
            ))}
            {(jobs ?? []).length === 0 && (
              <p className="text-muted-foreground">Nenhuma vaga aberta no momento. Envie seu portfólio pelo formulário — vamos guardar por aqui.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Envie sua candidatura</h2>
          <form onSubmit={submit} className="glass-panel rounded-2xl p-8 space-y-4">
            <Field label="Nome completo" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} required />
            <Field label="E-mail" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
            <Field label="Telefone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <Field label="URL do portfólio" value={form.portfolio_url} onChange={(v) => setForm({ ...form, portfolio_url: v })} placeholder="https://..." />
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Sobre você</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={4}
                className="mt-1 w-full bg-background/60 border border-border rounded-lg p-3 text-sm outline-none focus:border-accent"
                placeholder="Fale um pouco sobre sua experiência..."
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#003CFF] text-white font-semibold inline-flex justify-center items-center gap-2 disabled:opacity-50"
            >
              <Send size={16} /> {loading ? "Enviando..." : "Enviar candidatura"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function Field({
  label, value, onChange, type = "text", required, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}{required && " *"}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full bg-background/60 border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent"
      />
    </div>
  );
}
