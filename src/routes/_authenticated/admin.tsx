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
    <div className="min-h-screen admin-panel bg-background text-foreground">
      <aside className="fixed top-0 left-0 z-40 flex flex-col w-full md:w-64 md:h-screen border-b md:border-b-0 md:border-r border-border p-4 md:p-6 glass-panel">
        <Link to="/" className="flex items-center gap-2 font-display font-black text-lg md:mb-8">
          <span className="w-8 h-8 rounded-md gradient-brand" />
          <span className="text-gradient-brand">GenZ1n</span>
        </Link>
        <nav className="hidden md:flex flex-col flex-1 justify-center gap-2 py-4">
          <NavItem icon={LayoutDashboard} label="Dashboard" active={tab === "dashboard"} onClick={() => setTab("dashboard")} />
          <NavItem icon={FolderKanban} label="Projetos" active={tab === "projects"} onClick={() => setTab("projects")} />
          <NavItem icon={Briefcase} label="Vagas" active={tab === "jobs"} onClick={() => setTab("jobs")} />
          <NavItem icon={MessageSquare} label="Mensagens" active={tab === "messages"} onClick={() => setTab("messages")} />
          <NavItem icon={Briefcase} label="Candidaturas" active={tab === "applications"} onClick={() => setTab("applications")} />
          <NavItem icon={Settings} label="Configurações" active={tab === "settings"} onClick={() => setTab("settings")} />
        </nav>
        <nav className="flex md:hidden items-center gap-1 overflow-x-auto">
          <NavItem icon={LayoutDashboard} label="Dashboard" active={tab === "dashboard"} onClick={() => setTab("dashboard")} />
          <NavItem icon={FolderKanban} label="Projetos" active={tab === "projects"} onClick={() => setTab("projects")} />
          <NavItem icon={Briefcase} label="Vagas" active={tab === "jobs"} onClick={() => setTab("jobs")} />
          <NavItem icon={MessageSquare} label="Mensagens" active={tab === "messages"} onClick={() => setTab("messages")} />
          <NavItem icon={Briefcase} label="Candidaturas" active={tab === "applications"} onClick={() => setTab("applications")} />
          <NavItem icon={Settings} label="Configurações" active={tab === "settings"} onClick={() => setTab("settings")} />
        </nav>
        <button
          onClick={signOut}
          className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-accent mt-auto pt-6 border-t border-border/30"
        >
          <LogOut size={16} /> Sair
        </button>
      </aside>

      <main className="pt-[72px] md:pt-0 md:ml-64 flex-1 p-6 md:p-10 min-h-screen">
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
      className={`flex items-center gap-3 px-3 py-3 md:py-3.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
        active ? "gradient-brand text-white shadow-lg" : "text-foreground/80 hover:bg-secondary"
      }`}
    >
      <Icon size={18} /> {label}
    </button>
  );
}

/* ----------------------------- Dashboard ------------------------------ */
type RecentProject = {
  id: string; title: string; category: string; is_published: boolean;
  created_at: string; image_url: string | null; project_url: string | null;
};
type RecentMessage = { id: string; name: string; subject: string | null; created_at: string };
type RecentApplication = { id: string; full_name: string; created_at: string };

function Dashboard() {
  const { data: user } = useQuery({
    queryKey: ["admin_user"],
    queryFn: async () => (await supabase.auth.getUser()).data.user,
  });

  const { data: stats } = useQuery({
    queryKey: ["admin_dashboard_stats"],
    queryFn: async () => {
      const since30 = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
      const since60 = new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString();

      const [projects, publishedProjects, jobs, activeJobs, messages, msg30, msg60, applications, app30, app60, recentProjects, recentMessages, recentApplications, msgSeries] =
        await Promise.all([
          supabase.from("projects").select("id", { count: "exact", head: true }),
          supabase.from("projects").select("id", { count: "exact", head: true }).eq("is_published", true),
          supabase.from("job_openings").select("id", { count: "exact", head: true }),
          supabase.from("job_openings").select("id", { count: "exact", head: true }).eq("is_active", true),
          supabase.from("contact_messages").select("id", { count: "exact", head: true }),
          supabase.from("contact_messages").select("id", { count: "exact", head: true }).gte("created_at", since30),
          supabase.from("contact_messages").select("id", { count: "exact", head: true }).gte("created_at", since60).lt("created_at", since30),
          supabase.from("job_applications").select("id", { count: "exact", head: true }),
          supabase.from("job_applications").select("id", { count: "exact", head: true }).gte("created_at", since30),
          supabase.from("job_applications").select("id", { count: "exact", head: true }).gte("created_at", since60).lt("created_at", since30),
          supabase.from("projects").select("id,title,category,is_published,created_at,image_url,project_url").order("created_at", { ascending: false }).limit(5),
          supabase.from("contact_messages").select("id,name,subject,created_at").order("created_at", { ascending: false }).limit(5),
          supabase.from("job_applications").select("id,full_name,created_at").order("created_at", { ascending: false }).limit(5),
          supabase.from("contact_messages").select("created_at").gte("created_at", since30),
        ]);

      // Build 14-day series of contact messages
      const days: { date: string; label: string; value: number }[] = [];
      const now = new Date();
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        days.push({
          date: d.toISOString().slice(0, 10),
          label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
          value: 0,
        });
      }
      for (const row of msgSeries.data ?? []) {
        const k = new Date(row.created_at).toISOString().slice(0, 10);
        const bucket = days.find((x) => x.date === k);
        if (bucket) bucket.value += 1;
      }

      return {
        projects: projects.count ?? 0,
        publishedProjects: publishedProjects.count ?? 0,
        jobs: jobs.count ?? 0,
        activeJobs: activeJobs.count ?? 0,
        messages: messages.count ?? 0,
        messagesTrend: pctChange(msg30.count ?? 0, msg60.count ?? 0),
        applications: applications.count ?? 0,
        applicationsTrend: pctChange(app30.count ?? 0, app60.count ?? 0),
        recentProjects: (recentProjects.data ?? []) as RecentProject[],
        recentMessages: (recentMessages.data ?? []) as RecentMessage[],
        recentApplications: (recentApplications.data ?? []) as RecentApplication[],
        series: days,
      };
    },
  });

  const displayName = useMemo(() => {
    const m = user?.user_metadata as { full_name?: string; name?: string } | undefined;
    return m?.full_name || m?.name || user?.email?.split("@")[0] || "Admin";
  }, [user]);

  const totalActivities = (stats?.recentMessages.length ?? 0) + (stats?.recentApplications.length ?? 0) + (stats?.recentProjects.length ?? 0);

  const activities = useMemo(() => {
    if (!stats) return [];
    const items: { id: string; icon: typeof MessageSquare; title: string; subtitle: string; when: string; color: string }[] = [];
    for (const m of stats.recentMessages) items.push({ id: `m-${m.id}`, icon: MessageSquare, title: "Nova mensagem recebida", subtitle: m.name + (m.subject ? ` · ${m.subject}` : ""), when: m.created_at, color: "bg-[#003CFF]" });
    for (const a of stats.recentApplications) items.push({ id: `a-${a.id}`, icon: Users, title: "Nova candidatura", subtitle: a.full_name, when: a.created_at, color: "bg-[#B800FF]" });
    for (const p of stats.recentProjects) items.push({ id: `p-${p.id}`, icon: FolderKanban, title: p.is_published ? "Projeto publicado" : "Projeto criado", subtitle: p.title, when: p.created_at, color: "bg-[#001167]" });
    return items.sort((a, b) => +new Date(b.when) - +new Date(a.when)).slice(0, 6);
  }, [stats]);

  const donutData = stats ? [
    { name: "Publicados", value: stats.publishedProjects, color: "#003CFF" },
    { name: "Rascunhos", value: Math.max(0, stats.projects - stats.publishedProjects), color: "#9CC7DB" },
    { name: "Vagas ativas", value: stats.activeJobs, color: "#B800FF" },
  ] : [];
  const donutTotal = donutData.reduce((s, x) => s + x.value, 0);
  const publishedPct = stats && stats.projects > 0 ? Math.round((stats.publishedProjects / stats.projects) * 100) : 0;

  const cards = stats ? [
    { label: "Projetos ativos", value: stats.publishedProjects, hint: `${stats.projects} no total`, icon: FolderKanban, tint: "bg-[#E6ECFF] text-[#003CFF]" },
    { label: "Mensagens (30d)", value: stats.messages, hint: trendLabel(stats.messagesTrend), icon: Inbox, tint: "bg-[#F1E6FF] text-[#B800FF]" },
    { label: "Candidaturas (30d)", value: stats.applications, hint: trendLabel(stats.applicationsTrend), icon: Users, tint: "bg-[#001167] text-white" },
    { label: "Vagas abertas", value: stats.activeJobs, hint: `${stats.jobs} publicadas`, icon: Briefcase, tint: "bg-[#E6ECFF] text-[#003CFF]" },
  ] : [];

  if (!stats) {
    return <div className="flex items-center justify-center py-32"><Loader2 className="animate-spin text-[#003CFF]" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Header row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
            Olá, {displayName}! <span className="text-3xl">👋</span>
          </h1>
          <p className="text-muted-foreground mt-1">Aqui está o resumo do que está acontecendo no site.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Buscar..." className="pl-9 pr-4 py-2.5 rounded-xl w-64 text-sm" />
          </div>
          <button className="relative w-11 h-11 rounded-xl grid place-items-center border border-[rgba(0,17,103,0.12)] bg-white">
            <Bell size={16} />
            {totalActivities > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full gradient-brand text-white text-[10px] grid place-items-center">{totalActivities}</span>
            )}
          </button>
          <Link to="/admin" onClick={(e) => e.preventDefault()} className="hidden md:inline-flex px-4 py-2.5 rounded-xl gradient-brand text-white text-sm items-center gap-2">
            <Plus size={16} /> Novo Projeto
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map((c) => (
          <div key={c.label} className="glass-panel rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl grid place-items-center ${c.tint}`}>
                <c.icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="text-3xl font-bold text-gradient-brand mt-1">{c.value}</p>
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <TrendingUp size={12} /> {c.hint}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="glass-panel rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold">Mensagens recebidas</h2>
              <p className="text-sm text-muted-foreground">Últimos 14 dias</p>
            </div>
            <span className="text-xs px-3 py-1.5 rounded-lg bg-[rgba(0,17,103,0.06)] text-[#001167]">14 dias</span>
          </div>
          <div className="text-3xl font-bold mb-4">{stats.series.reduce((s, x) => s + x.value, 0)}</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.series} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B800FF" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#003CFF" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#001167aa" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#001167aa" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,17,103,0.12)", background: "#fff", color: "#001167" }} />
                <Area type="monotone" dataKey="value" stroke="#B800FF" strokeWidth={2.5} fill="url(#fillGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold">Distribuição de conteúdo</h2>
              <p className="text-sm text-muted-foreground">Projetos e vagas</p>
            </div>
          </div>
          <div className="relative h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {donutData.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <div className="text-center">
                <div className="text-3xl font-bold">{publishedPct}%</div>
                <div className="text-xs text-muted-foreground">Publicados</div>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {donutData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span>{d.name}</span>
                </div>
                <span className="font-medium">{d.value}</span>
              </div>
            ))}
            {donutTotal === 0 && <p className="text-xs text-muted-foreground">Nenhum dado ainda.</p>}
          </div>
        </div>
      </div>

      {/* Recent + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Projetos recentes</h2>
            <span className="text-sm text-[#003CFF] cursor-default">Ver todos</span>
          </div>
          <ul className="divide-y divide-[rgba(0,17,103,0.08)]">
            {stats.recentProjects.map((p) => (
              <li key={p.id} className="py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-[rgba(0,17,103,0.08)] shrink-0 grid place-items-center">
                  {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover" /> : <Sparkles size={16} className="text-[#003CFF]" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.category}</p>
                </div>
                <StatusPill published={p.is_published} />
                <span className="text-xs text-muted-foreground hidden md:inline">
                  {new Date(p.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                </span>
                {p.project_url && (
                  <a href={p.project_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-[#003CFF]">
                    <ExternalLink size={14} />
                  </a>
                )}
              </li>
            ))}
            {stats.recentProjects.length === 0 && <p className="text-sm text-muted-foreground py-4">Nenhum projeto ainda.</p>}
          </ul>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Atividades recentes</h2>
            <span className="text-sm text-[#003CFF] cursor-default">Ver todas</span>
          </div>
          <ul className="space-y-4">
            {activities.map((a) => (
              <li key={a.id} className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full grid place-items-center text-white shrink-0 ${a.color}`}>
                  <a.icon size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{a.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.subtitle}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                  <Clock size={11} /> {relativeTime(a.when)}
                </span>
              </li>
            ))}
            {activities.length === 0 && <p className="text-sm text-muted-foreground">Sem atividade recente.</p>}
          </ul>
        </div>
      </div>

      {/* Quick summary bar */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl grid place-items-center bg-[#E6ECFF] text-[#003CFF]">
            <Activity size={18} />
          </div>
          <div>
            <p className="font-semibold">Tudo funcionando normalmente</p>
            <p className="text-sm text-muted-foreground">
              {stats.publishedProjects} projetos publicados · {stats.activeJobs} vagas abertas · {stats.messages} mensagens totais
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-600">
          <CheckCircle2 size={16} /> Sistema saudável
        </div>
      </div>
    </div>
  );
}

function StatusPill({ published }: { published: boolean }) {
  return published ? (
    <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">Publicado</span>
  ) : (
    <span className="text-[11px] px-2 py-1 rounded-full bg-amber-50 text-amber-600">Rascunho</span>
  );
}

function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function trendLabel(pct: number) {
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}% vs mês anterior`;
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  return `${d}d`;
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
