import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { projectsQuery, settingsQuery, getSetting } from "@/lib/site-queries";
import heroVideo from "../../public/video-bg.mp4";
import { ArrowRight, ArrowLeft, Sparkles, Zap, Rocket } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GenZ1n Tech — Estúdio de design digital" },
      { name: "description", content: "Portfólio, serviços e experiências digitais criadas com um novo padrão de excelência." },
      { property: "og:title", content: "GenZ1n Tech" },
      { property: "og:description", content: "Estúdio digital criando o futuro das marcas." },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: projects } = useQuery(projectsQuery);
  const { data: settings } = useQuery(settingsQuery);
  const hero = getSetting(settings, "hero", {
    title: "GENZ1N",
    subtitle: "Portfólio de Design 2024",
    description: "Esculpindo o futuro digital através de experiências cinematográficas e interfaces líquidas.",
    cta_label: "Explorar Projetos",
    cta_href: "/projetos",
  } as { title: string; subtitle: string; description: string; cta_label: string; cta_href: string });

  const allProjects = projects ?? [];
  const PAGE_SIZE = 4;
  const pages = useMemo(() => {
    const out: typeof allProjects[] = [];
    for (let i = 0; i < allProjects.length; i += PAGE_SIZE) {
      out.push(allProjects.slice(i, i + PAGE_SIZE));
    }
    return out.length ? out : [[]];
  }, [allProjects]);
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const totalPages = pages.length;

  useEffect(() => {
    if (totalPages <= 1 || paused) return;
    const id = setInterval(() => setPage((p) => (p + 1) % totalPages), 5000);
    return () => clearInterval(id);
  }, [totalPages, paused]);

  useEffect(() => {
    if (page >= totalPages) setPage(0);
  }, [page, totalPages]);

  const current = pages[page] ?? [];

  return (
    <main>
      {/* HERO with video */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden -mt-16 pt-16">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="blob w-[500px] h-[500px] left-[-100px] top-[10%] bg-[#003CFF]" />
          <div className="blob w-[600px] h-[600px] right-[-150px] bottom-[-100px] bg-[#B800FF]" style={{ animationDelay: "-7s" }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center px-6 py-24">
          <p className="text-accent font-mono text-xs tracking-[0.4em] uppercase mb-4 animate-fade-up">
            {hero.subtitle}
          </p>
          <h1 className="font-display font-black leading-[0.9] text-[clamp(3.5rem,14vw,11rem)] tracking-tighter animate-fade-up">
            <span className="bg-gradient-to-r from-[#FEFEED] via-[#9CC7DB] to-[#B800FF] bg-clip-text text-transparent drop-shadow-[0_4px_45px_rgba(184,0,255,0.35)]">
              {hero.title}  
            </span>
          </h1>
          <p className="mt-6 mx-auto max-w-xl text-base md:text-lg text-foreground/80 animate-fade-up">
            {hero.description}
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center animate-fade-up">
            <Link
              to={hero.cta_href.startsWith("/") ? (hero.cta_href as "/projetos") : "/projetos"}
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#003CFF] text-white font-semibold text-sm uppercase tracking-widest shadow-[0_0_40px_rgba(0,60,255,0.5)] hover:scale-[1.02] transition-transform"
            >
              {hero.cta_label}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/contato"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full glass-panel text-foreground font-semibold text-sm uppercase tracking-widest hover:border-accent transition-colors"
            >
              Falar com a gente
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES / HIGHLIGHTS */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Sparkles,
              title: "Design Cinematográfico",
              body: "Interfaces com atmosfera, movimento e narrativa visual.",
              iconBg: "bg-[#001167]",
            },
            {
              icon: Zap,
              title: "Produto Digital",
              body: "Do zero ao produto entregue, com iterações rápidas.",
              iconBg: "bg-[#B800FF]",
            },
            {
              icon: Rocket,
              title: "Marcas do Futuro",
              body: "Identidade e sistemas visuais para marcas nativas digitais.",
              iconBg: "bg-[#9CC7DB]",
            },
          ].map(({ icon: Icon, title, body, iconBg }) => (
            <div key={title} className="glass-panel rounded-2xl p-8 hover:border-accent transition-colors">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${iconBg}`}>
                <Icon size={22} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-16">
          <div>
            <p className="text-accent font-mono text-xs tracking-[0.3em] uppercase mb-3">Selecionados</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Projetos em destaque</h2>
          </div>
          <Link to="/projetos" className="text-sm text-accent hover:underline hidden md:block">
            Ver todos →
          </Link>
        </div>

        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${page * 100}%)` }}
            >
              {pages.map((group, gi) => (
                <div key={gi} className="w-full flex-shrink-0 grid grid-cols-12 gap-6">
                  {group.map((p, i) => (
                    <article
                      key={p.id}
                      className={`col-span-12 ${i % 2 === 0 ? "md:col-span-7" : "md:col-span-5"} group`}
                    >
                      <a href={p.project_url || "#"} target="_blank" rel="noreferrer" className="block">
                        <div className="relative overflow-hidden rounded-2xl aspect-[16/10] bg-surface">
                          {p.image_url && (
                            <img
                              src={p.image_url}
                              alt={p.title}
                              loading="lazy"
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 opacity-80 group-hover:opacity-100 transition-all duration-700"
                            />
                          )}
                          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="px-3 py-1.5 rounded-full gradient-brand text-white text-xs font-semibold flex items-center gap-1">
                              Ver <ArrowRight size={12} />
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-semibold">{p.title}</h3>
                            <p className="text-sm text-muted-foreground">{p.category}</p>
                          </div>
                          <span className="text-xs font-mono text-accent mt-1">{p.year}</span>
                        </div>
                      </a>
                    </article>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {totalPages > 1 && (
            <>
              <button
                type="button"
                aria-label="Anterior"
                onClick={() => setPage((p) => (p - 1 + totalPages) % totalPages)}
                className="absolute -left-2 md:-left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass-panel flex items-center justify-center hover:border-accent hover:bg-accent/10 transition-colors z-10"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                type="button"
                aria-label="Próximo"
                onClick={() => setPage((p) => (p + 1) % totalPages)}
                className="absolute -right-2 md:-right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass-panel flex items-center justify-center hover:border-accent hover:bg-accent/10 transition-colors z-10"
              >
                <ArrowRight size={18} />
              </button>

              <div className="flex justify-center gap-2 mt-8">
                {pages.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Ir para página ${i + 1}`}
                    onClick={() => setPage(i)}
                    className={`h-1.5 rounded-full transition-all ${i === page ? "w-8 bg-accent" : "w-2 bg-foreground/30"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        {/* current used for a11y announce */}
        <span className="sr-only" aria-live="polite">Página {page + 1} de {totalPages}</span>
        <span className="hidden">{current.length}</span>
      </section>
    </main>
  );
}
