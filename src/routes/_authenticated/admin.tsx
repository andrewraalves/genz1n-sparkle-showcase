import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { settingsQuery, getSetting } from "@/lib/site-queries";
import {
  LayoutDashboard, FolderKanban, Briefcase, MessageSquare, Settings, LogOut,
  Plus, Trash2, Save, Loader2, Search, Bell, TrendingUp, ArrowUpRight,
  Users, Inbox, Sparkles, Activity, ExternalLink, CheckCircle2, Clock,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Painel admin — GenZ1n" }] }),
  component: AdminPage,
});

type Tab = "dashboard" | "projects" | "jobs" | "messages" | "applications" | "settings";

function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) { navigate({ to: "/auth" }); return; }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userRes.user.id);
      setIsAdmin((roles ?? []).some((r) => r.role === "admin"));
    })();
  }, [navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">Acesso restrito</h1>
          <p className="text-muted-foreground mt-2">Sua conta não tem permissão de administrador.</p>
          <button onClick={signOut} className="mt-6 px-6 py-2 rounded-full gradient-brand text-white">Sair</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row admin-panel bg-background text-foreground">
      <aside className="md:w-64 md:min-h-screen border-b md:border-b-0 md:border-r border-border p-4 md:p-6 glass-panel md:sticky md:top-0">
        <Link to="/" className="flex items-center gap-2 font-display font-black text-lg mb-8">
          <span className="w-8 h-8 rounded-md gradient-brand" />
          <span className="text-gradient-brand">GenZ1n</span>
        </Link>
        <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
          <NavItem icon={LayoutDashboard} label="Dashboard" active={tab === "dashboard"} onClick={() => setTab("dashboard")} />
          <NavItem icon={FolderKanban} label="Projetos" active={tab === "projects"} onClick={() => setTab("projects")} />
          <NavItem icon={Briefcase} label="Vagas" active={tab === "jobs"} onClick={() => setTab("jobs")} />
          <NavItem icon={MessageSquare} label="Mensagens" active={tab === "messages"} onClick={() => setTab("messages")} />
          <NavItem icon={Briefcase} label="Candidaturas" active={tab === "applications"} onClick={() => setTab("applications")} />
          <NavItem icon={Settings} label="Configurações" active={tab === "settings"} onClick={() => setTab("settings")} />
        </nav>
        <button
          onClick={signOut}
          className="mt-8 hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-accent"
        >
          <LogOut size={16} /> Sair
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-10">
        {tab === "dashboard" && <Dashboard />}
        {tab === "projects" && <ProjectsAdmin />}
        {tab === "jobs" && <JobsAdmin />}
        {tab === "messages" && <MessagesAdmin />}
        {tab === "applications" && <ApplicationsAdmin />}
        {tab === "settings" && <SettingsAdmin />}
      </main>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }: { icon: typeof LayoutDashboard; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
        active ? "gradient-brand text-white" : "text-foreground/80 hover:bg-secondary"
      }`}
    >
      <Icon size={16} /> {label}
    </button>
  );
}

/* ----------------------------- Dashboard ------------------------------ */
function Dashboard() {
  const [counts, setCounts] = useState({ projects: 0, jobs: 0, messages: 0, applications: 0 });

  useEffect(() => {
    (async () => {
      const [p, j, m, a] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("job_openings").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }),
        supabase.from("job_applications").select("id", { count: "exact", head: true }),
      ]);
      setCounts({
        projects: p.count ?? 0,
        jobs: j.count ?? 0,
        messages: m.count ?? 0,
        applications: a.count ?? 0,
      });
    })();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Painel</h1>
      <p className="text-muted-foreground mb-8">Visão geral do site.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Projetos", value: counts.projects },
          { label: "Vagas", value: counts.jobs },
          { label: "Mensagens", value: counts.messages },
          { label: "Candidaturas", value: counts.applications },
        ].map((s) => (
          <div key={s.label} className="glass-panel rounded-2xl p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
            <p className="text-3xl font-bold text-gradient-brand mt-2">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- Projects ------------------------------ */
type Project = {
  id: string; title: string; category: string; year: string | null; image_url: string | null;
  project_url: string | null; description: string | null; sort_order: number; is_published: boolean;
};

function ProjectsAdmin() {
  const qc = useQueryClient();
  const { data, refetch } = useQuery({
    queryKey: ["admin_projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").order("sort_order");
      if (error) throw error;
      return data as Project[];
    },
  });

  async function add() {
    const { error } = await supabase.from("projects").insert({
      title: "Novo projeto", category: "Categoria", is_published: false, sort_order: (data?.length ?? 0) * 10 + 10,
    });
    if (error) toast.error(error.message); else { toast.success("Criado"); refetch(); }
  }

  async function update(id: string, patch: Partial<Project>) {
    const { error } = await supabase.from("projects").update(patch).eq("id", id);
    if (error) toast.error(error.message);
    else { qc.invalidateQueries({ queryKey: ["projects"] }); refetch(); }
  }

  async function remove(id: string) {
    if (!confirm("Excluir projeto?")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Excluído"); refetch(); qc.invalidateQueries({ queryKey: ["projects"] }); }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Projetos</h1>
          <p className="text-muted-foreground">Gerencie o portfólio do site.</p>
        </div>
        <button onClick={add} className="px-5 py-2.5 rounded-full gradient-brand text-white text-sm inline-flex items-center gap-2">
          <Plus size={16} /> Novo
        </button>
      </div>

      <div className="space-y-4">
        {(data ?? []).map((p) => (
          <ProjectRow key={p.id} project={p} onSave={(patch) => update(p.id, patch)} onDelete={() => remove(p.id)} />
        ))}
      </div>
    </div>
  );
}

function ProjectRow({ project, onSave, onDelete }: { project: Project; onSave: (p: Partial<Project>) => void; onDelete: () => void }) {
  const [p, setP] = useState(project);
  useEffect(() => setP(project), [project]);
  return (
    <div className="glass-panel rounded-2xl p-5 grid grid-cols-1 md:grid-cols-[100px_1fr_auto] gap-4 items-start">
      {p.image_url ? (
        <img src={p.image_url} alt="" className="w-full md:w-24 h-24 object-cover rounded-lg" />
      ) : (
        <div className="w-full md:w-24 h-24 rounded-lg bg-secondary" />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input label="Título" value={p.title} onChange={(v) => setP({ ...p, title: v })} />
        <Input label="Categoria" value={p.category} onChange={(v) => setP({ ...p, category: v })} />
        <Input label="Ano" value={p.year ?? ""} onChange={(v) => setP({ ...p, year: v })} />
        <Input label="URL do projeto" value={p.project_url ?? ""} onChange={(v) => setP({ ...p, project_url: v })} />
        <Input label="URL da imagem" value={p.image_url ?? ""} onChange={(v) => setP({ ...p, image_url: v })} className="md:col-span-2" />
        <Input label="Ordem" type="number" value={String(p.sort_order)} onChange={(v) => setP({ ...p, sort_order: Number(v) || 0 })} />
        <label className="flex items-center gap-2 text-sm mt-6">
          <input type="checkbox" checked={p.is_published} onChange={(e) => setP({ ...p, is_published: e.target.checked })} />
          Publicado
        </label>
      </div>
      <div className="flex md:flex-col gap-2">
        <button onClick={() => onSave(p)} className="px-3 py-2 rounded-lg gradient-brand text-white text-xs inline-flex items-center gap-1">
          <Save size={12} /> Salvar
        </button>
        <button onClick={onDelete} className="px-3 py-2 rounded-lg bg-destructive/20 text-destructive text-xs inline-flex items-center gap-1">
          <Trash2 size={12} /> Excluir
        </button>
      </div>
    </div>
  );
}

/* ----------------------------- Jobs ------------------------------ */
type Job = {
  id: string; title: string; department: string | null; location: string | null;
  employment_type: string | null; description: string | null; is_active: boolean; sort_order: number;
};

function JobsAdmin() {
  const qc = useQueryClient();
  const { data, refetch } = useQuery({
    queryKey: ["admin_jobs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("job_openings").select("*").order("sort_order");
      if (error) throw error;
      return data as Job[];
    },
  });

  async function add() {
    const { error } = await supabase.from("job_openings").insert({ title: "Nova vaga", is_active: false, sort_order: (data?.length ?? 0) * 10 + 10 });
    if (error) toast.error(error.message); else refetch();
  }
  async function update(id: string, patch: Partial<Job>) {
    const { error } = await supabase.from("job_openings").update(patch).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Salvo"); qc.invalidateQueries({ queryKey: ["jobs"] }); refetch(); }
  }
  async function remove(id: string) {
    if (!confirm("Excluir vaga?")) return;
    const { error } = await supabase.from("job_openings").delete().eq("id", id);
    if (error) toast.error(error.message); else { refetch(); qc.invalidateQueries({ queryKey: ["jobs"] }); }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Vagas</h1>
          <p className="text-muted-foreground">Gerencie as posições abertas.</p>
        </div>
        <button onClick={add} className="px-5 py-2.5 rounded-full gradient-brand text-white text-sm inline-flex items-center gap-2">
          <Plus size={16} /> Nova
        </button>
      </div>
      <div className="space-y-4">
        {(data ?? []).map((j) => <JobRow key={j.id} job={j} onSave={(patch) => update(j.id, patch)} onDelete={() => remove(j.id)} />)}
      </div>
    </div>
  );
}

function JobRow({ job, onSave, onDelete }: { job: Job; onSave: (j: Partial<Job>) => void; onDelete: () => void }) {
  const [j, setJ] = useState(job);
  useEffect(() => setJ(job), [job]);
  return (
    <div className="glass-panel rounded-2xl p-5 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input label="Título" value={j.title} onChange={(v) => setJ({ ...j, title: v })} />
        <Input label="Departamento" value={j.department ?? ""} onChange={(v) => setJ({ ...j, department: v })} />
        <Input label="Localização" value={j.location ?? ""} onChange={(v) => setJ({ ...j, location: v })} />
        <Input label="Regime" value={j.employment_type ?? ""} onChange={(v) => setJ({ ...j, employment_type: v })} />
      </div>
      <div>
        <label className="text-xs uppercase tracking-widest text-muted-foreground">Descrição</label>
        <textarea rows={3} value={j.description ?? ""} onChange={(e) => setJ({ ...j, description: e.target.value })}
          className="mt-1 w-full bg-background/60 border border-border rounded-lg p-3 text-sm" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={j.is_active} onChange={(e) => setJ({ ...j, is_active: e.target.checked })} /> Ativa
          </label>
          <Input label="Ordem" type="number" value={String(j.sort_order)} onChange={(v) => setJ({ ...j, sort_order: Number(v) || 0 })} />
        </div>
        <div className="flex gap-2">
          <button onClick={() => onSave(j)} className="px-4 py-2 rounded-lg gradient-brand text-white text-xs inline-flex items-center gap-1"><Save size={12} /> Salvar</button>
          <button onClick={onDelete} className="px-4 py-2 rounded-lg bg-destructive/20 text-destructive text-xs inline-flex items-center gap-1"><Trash2 size={12} /> Excluir</button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Messages ------------------------------ */
function MessagesAdmin() {
  const { data, refetch } = useQuery({
    queryKey: ["admin_messages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      if (error) throw error; return data;
    },
  });
  async function remove(id: string) {
    if (!confirm("Excluir mensagem?")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) toast.error(error.message); else refetch();
  }
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Mensagens</h1>
      <p className="text-muted-foreground mb-8">Contatos recebidos pelo site.</p>
      <div className="space-y-4">
        {(data ?? []).map((m) => (
          <div key={m.id} className="glass-panel rounded-2xl p-5">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="font-semibold">{m.name} <span className="text-muted-foreground text-sm">· {m.email}</span></p>
                {m.subject && <p className="text-sm text-accent mt-1">{m.subject}</p>}
                <p className="mt-2 whitespace-pre-wrap">{m.message}</p>
                <p className="text-xs text-muted-foreground mt-3">{new Date(m.created_at).toLocaleString("pt-BR")}</p>
              </div>
              <button onClick={() => remove(m.id)} className="text-destructive hover:opacity-80"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {(data ?? []).length === 0 && <p className="text-muted-foreground">Nenhuma mensagem ainda.</p>}
      </div>
    </div>
  );
}

/* ----------------------------- Applications ------------------------------ */
function ApplicationsAdmin() {
  const { data, refetch } = useQuery({
    queryKey: ["admin_applications"],
    queryFn: async () => {
      const { data, error } = await supabase.from("job_applications").select("*").order("created_at", { ascending: false });
      if (error) throw error; return data;
    },
  });
  async function remove(id: string) {
    if (!confirm("Excluir candidatura?")) return;
    const { error } = await supabase.from("job_applications").delete().eq("id", id);
    if (error) toast.error(error.message); else refetch();
  }
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Candidaturas</h1>
      <p className="text-muted-foreground mb-8">Recebidas via página Trabalhe Conosco.</p>
      <div className="space-y-4">
        {(data ?? []).map((a) => (
          <div key={a.id} className="glass-panel rounded-2xl p-5">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="font-semibold">{a.full_name} <span className="text-muted-foreground text-sm">· {a.email}</span></p>
                {a.phone && <p className="text-sm text-muted-foreground">{a.phone}</p>}
                {a.portfolio_url && <a href={a.portfolio_url} target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline">{a.portfolio_url}</a>}
                {a.message && <p className="mt-2 whitespace-pre-wrap">{a.message}</p>}
                <p className="text-xs text-muted-foreground mt-3">{new Date(a.created_at).toLocaleString("pt-BR")}</p>
              </div>
              <button onClick={() => remove(a.id)} className="text-destructive hover:opacity-80"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {(data ?? []).length === 0 && <p className="text-muted-foreground">Nenhuma candidatura ainda.</p>}
      </div>
    </div>
  );
}

/* ----------------------------- Settings ------------------------------ */
function SettingsAdmin() {
  const qc = useQueryClient();
  const { data: settings, refetch } = useQuery(settingsQuery);
  const [draft, setDraft] = useState<Record<string, Record<string, unknown>>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (settings) setDraft(settings); }, [settings]);

  function setField(section: string, field: string, value: string | boolean) {
    setDraft((d) => ({ ...d, [section]: { ...(d[section] ?? {}), [field]: value } }));
  }

  async function saveSection(section: string) {
    setSaving(true);
    const { error } = await supabase.from("site_settings").upsert({ key: section, value: draft[section] as never });
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Salvo"); qc.invalidateQueries({ queryKey: ["site_settings"] }); refetch(); }
  }

  const hero = getSetting(draft, "hero", { title: "", subtitle: "", description: "", cta_label: "", cta_href: "" } as Record<string, string>);
  const contact = getSetting(draft, "contact_info", { email: "", phone: "", address: "", hours: "" } as Record<string, string>);
  const social = getSetting(draft, "social", { instagram: "", linkedin: "", behance: "", github: "" } as Record<string, string>);
  const footer = getSetting(draft, "footer", { tagline: "", copyright: "" } as Record<string, string>);
  const careers = getSetting(draft, "careers", { title: "", intro: "" } as Record<string, string>);
  const chatbot = getSetting(draft, "chatbot", { enabled: true, greeting: "", system_prompt: "" } as { enabled: boolean; greeting: string; system_prompt: string });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Configurações</h1>
      <p className="text-muted-foreground mb-8">Edite os textos e informações do site.</p>

      <div className="space-y-8">
        <Section title="Hero (Home)" onSave={() => saveSection("hero")} saving={saving}>
          <Input label="Título" value={hero.title} onChange={(v) => setField("hero", "title", v)} />
          <Input label="Sub-título (linha superior)" value={hero.subtitle} onChange={(v) => setField("hero", "subtitle", v)} />
          <Input label="Descrição" value={hero.description} onChange={(v) => setField("hero", "description", v)} className="md:col-span-2" />
          <Input label="Texto do botão" value={hero.cta_label} onChange={(v) => setField("hero", "cta_label", v)} />
          <Input label="Link do botão" value={hero.cta_href} onChange={(v) => setField("hero", "cta_href", v)} />
        </Section>

        <Section title="Contato" onSave={() => saveSection("contact_info")} saving={saving}>
          <Input label="E-mail" value={contact.email} onChange={(v) => setField("contact_info", "email", v)} />
          <Input label="Telefone" value={contact.phone} onChange={(v) => setField("contact_info", "phone", v)} />
          <Input label="Endereço" value={contact.address} onChange={(v) => setField("contact_info", "address", v)} className="md:col-span-2" />
          <Input label="Horário" value={contact.hours} onChange={(v) => setField("contact_info", "hours", v)} className="md:col-span-2" />
        </Section>

        <Section title="Redes sociais" onSave={() => saveSection("social")} saving={saving}>
          <Input label="Instagram" value={social.instagram} onChange={(v) => setField("social", "instagram", v)} />
          <Input label="LinkedIn" value={social.linkedin} onChange={(v) => setField("social", "linkedin", v)} />
          <Input label="Behance" value={social.behance} onChange={(v) => setField("social", "behance", v)} />
          <Input label="GitHub" value={social.github} onChange={(v) => setField("social", "github", v)} />
        </Section>

        <Section title="Rodapé" onSave={() => saveSection("footer")} saving={saving}>
          <Input label="Tagline" value={footer.tagline} onChange={(v) => setField("footer", "tagline", v)} className="md:col-span-2" />
          <Input label="Copyright" value={footer.copyright} onChange={(v) => setField("footer", "copyright", v)} className="md:col-span-2" />
        </Section>

        <Section title="Trabalhe Conosco" onSave={() => saveSection("careers")} saving={saving}>
          <Input label="Título" value={careers.title} onChange={(v) => setField("careers", "title", v)} />
          <Input label="Intro" value={careers.intro} onChange={(v) => setField("careers", "intro", v)} className="md:col-span-2" />
        </Section>

        <Section title="Chatbot" onSave={() => saveSection("chatbot")} saving={saving}>
          <label className="flex items-center gap-2 md:col-span-2 text-sm">
            <input type="checkbox" checked={!!chatbot.enabled} onChange={(e) => setField("chatbot", "enabled", e.target.checked)} /> Chatbot ativado
          </label>
          <Input label="Saudação" value={chatbot.greeting} onChange={(v) => setField("chatbot", "greeting", v)} className="md:col-span-2" />
          <div className="md:col-span-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Prompt do sistema</label>
            <textarea
              rows={5}
              value={chatbot.system_prompt}
              onChange={(e) => setField("chatbot", "system_prompt", e.target.value)}
              className="mt-1 w-full bg-background/60 border border-border rounded-lg p-3 text-sm"
            />
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children, onSave, saving }: { title: string; children: React.ReactNode; onSave: () => void; saving: boolean }) {
  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold">{title}</h2>
        <button onClick={onSave} disabled={saving} className="px-4 py-2 rounded-full gradient-brand text-white text-xs inline-flex items-center gap-1 disabled:opacity-50">
          <Save size={12} /> Salvar
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", className = "" }: { label: string; value: string; onChange: (v: string) => void; type?: string; className?: string }) {
  return (
    <div className={className}>
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-background/60 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
      />
    </div>
  );
}
