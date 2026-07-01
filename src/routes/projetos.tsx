import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { projectsQuery } from "@/lib/site-queries";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/projetos")({
  head: () => ({
    meta: [
      { title: "Projetos — GenZ1n Tech" },
      { name: "description", content: "Portfólio completo de projetos digitais criados pela GenZ1n." },
      { property: "og:title", content: "Projetos — GenZ1n Tech" },
      { property: "og:description", content: "Portfólio completo da GenZ1n." },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { data: projects, isLoading } = useQuery(projectsQuery);

  return (
    <main className="max-w-7xl mx-auto px-6 py-24">
      <header className="mb-16">
        <p className="text-accent font-mono text-xs tracking-[0.3em] uppercase mb-3">Portfólio</p>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">Nossos projetos</h1>
        <p className="mt-4 text-muted-foreground max-w-2xl">
          Uma seleção do trabalho recente. Passe o mouse para ver o projeto em cores; clique para acessar.
        </p>
      </header>

      {isLoading && <p className="text-muted-foreground">Carregando...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {(projects ?? []).map((p) => (
          <a
            key={p.id}
            href={p.project_url || "#"}
            target="_blank"
            rel="noreferrer"
            className="group block"
          >
            <div className="relative overflow-hidden rounded-2xl aspect-[4/5] bg-surface">
              {p.image_url && (
                <img
                  src={p.image_url}
                  alt={p.title}
                  loading="lazy"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
              )}
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full gradient-brand flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight size={16} className="text-white" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-background to-transparent">
                <h3 className="text-lg font-semibold">{p.title}</h3>
                <p className="text-xs text-muted-foreground">{p.category} · {p.year}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
