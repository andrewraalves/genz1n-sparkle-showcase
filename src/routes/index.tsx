import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";
import project4 from "@/assets/project-4.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GenZ1n — Portfólio de Design" },
      {
        name: "description",
        content:
          "GenZ1n: portfólio de design esculpindo o futuro digital através de experiências cinematográficas e interfaces líquidas.",
      },
      { property: "og:title", content: "GenZ1n — Portfólio de Design" },
      {
        property: "og:description",
        content:
          "Experiências cinematográficas e interfaces líquidas. Portfólio selecionado 2024.",
      },
    ],
  }),
  component: Index,
});

type Project = {
  number: string;
  title: string;
  category: string;
  image: string;
  alt: string;
  span: string;
  aspect: string;
  offset?: string;
};

const projects: Project[] = [
  {
    number: "01",
    title: "Cortex Digital",
    category: "E-commerce de Luxo",
    image: project1,
    alt: "Arquitetura futurística atmosférica ao luar",
    span: "md:col-span-8",
    aspect: "aspect-[16/10]",
  },
  {
    number: "02",
    title: "Aura OS",
    category: "Design de Interface",
    image: project2,
    alt: "Refração de luz em copo de vidro",
    span: "md:col-span-4 md:mt-24",
    aspect: "aspect-square",
  },
  {
    number: "03",
    title: "Vanguard",
    category: "Identidade Visual",
    image: project3,
    alt: "Escultura de obsidiana em iluminação de estúdio",
    span: "md:col-span-5 md:mt-12",
    aspect: "aspect-[4/5]",
  },
  {
    number: "04",
    title: "Stellar Core",
    category: "Web Experiencial",
    image: project4,
    alt: "Textura de metal líquido em fluxo cromado",
    span: "md:col-span-7 md:-mt-24",
    aspect: "aspect-[16/9]",
  },
];

function Index() {
  const heroRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const glow = glowRef.current;
    if (!hero || !glow) return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        glow.style.setProperty("--mx", `${x}px`);
        glow.style.setProperty("--my", `${y}px`);
      });
    };
    hero.addEventListener("pointermove", onMove);
    return () => {
      hero.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="bg-background text-foreground font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-nav border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#top" className="font-black tracking-tighter text-xl">
            G1.
          </a>
          <div className="flex gap-8 text-[11px] uppercase tracking-[0.2em] font-medium">
            <a href="#trabalhos" className="hover:text-accent transition-colors">
              Projetos
            </a>
            <a href="#sobre" className="hover:text-accent transition-colors">
              Sobre
            </a>
            <a href="#contato" className="hover:text-accent transition-colors">
              Contato
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        id="top"
        ref={heroRef}
        className="relative h-screen w-full overflow-hidden flex items-center justify-center"
      >
        {/* Tech grid (animated infinite drift) */}
        <div className="absolute inset-0 z-0 tech-grid pointer-events-none" />
        {/* Pulsing cells layer */}
        <div className="absolute inset-0 z-0 cells-layer pointer-events-none" />
        {/* Random flickering cells */}
        <div className="absolute inset-0 z-0 cells-flicker pointer-events-none" />
        {/* Vertical scan sweep */}
        <div className="absolute inset-x-0 top-0 z-0 scan-line pointer-events-none" />

        {/* Ambient mesh blobs */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/15 rounded-full blur-[120px] animate-mesh-1" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-indigo-500/10 rounded-full blur-[140px] animate-mesh-2" />
          <div className="absolute top-1/4 right-1/4 w-[40%] h-[40%] bg-accent/10 rounded-full blur-[100px] animate-mesh-3" />
        </div>

        {/* Cursor-following radial glow */}
        <div
          ref={glowRef}
          className="absolute inset-0 z-[1] cursor-glow"
        />
        <div className="absolute inset-0 z-[2] cursor-ring" />

        {/* Vignette */}
        <div className="absolute inset-0 z-[2] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_50%,hsl(230_15%_4%/0.9)_100%)]" />

        <div className="relative z-10 text-center px-6">
          <p className="text-accent font-mono text-xs tracking-[0.4em] uppercase mb-2 animate-hero-1">
            Portfólio de Design 2024
          </p>
          <h1 className="text-[clamp(4rem,15vw,12rem)] font-black tracking-tighter leading-none mb-6 animate-hero-2">
            GENZ1N
          </h1>
          <div className="max-w-md mx-auto">
            <p className="text-muted text-balance text-lg animate-hero-3">
              Esculpindo o futuro digital através de experiências cinematográficas
              e interfaces líquidas.
            </p>
          </div>
          <div className="mt-12 animate-hero-4">
            <a
              href="#trabalhos"
              className="inline-block px-8 py-4 bg-foreground text-background font-bold uppercase text-xs tracking-widest rounded-full hover:bg-accent transition-all"
            >
              Explorar Projetos
            </a>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-20 z-10">
          <div className="w-px h-12 bg-foreground" />
        </div>
      </section>

      {/* Portfolio */}
      <section id="trabalhos" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-24">
          <h2 className="text-5xl font-bold tracking-tight">
            Trabalhos
            <br />
            Selecionados
          </h2>
          <p className="font-mono text-xs text-muted mb-2">(01 — 04)</p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {projects.map((p) => (
            <article key={p.number} className={`col-span-12 ${p.span} group`}>
              <div
                className={`relative overflow-hidden ${p.aspect} bg-surface mb-6`}
              >
                <img
                  src={p.image}
                  alt={p.alt}
                  loading="lazy"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 opacity-70 group-hover:opacity-100"
                />
                <div className="absolute bottom-6 left-6">
                  <span className="text-xs font-mono text-accent">2024</span>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold">{p.title}</h3>
                  <p className="text-muted">{p.category}</p>
                </div>
                <p className="text-sm italic font-serif">{p.number}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contato" className="relative py-48 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto border-t border-border pt-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
            <div>
              <p className="text-accent font-mono text-sm tracking-widest uppercase mb-8">
                Disponível para Projetos
              </p>
              <h2 className="text-[clamp(3rem,8vw,6rem)] font-black tracking-tighter leading-[0.9] mb-12 uppercase">
                Vamos{" "}
                <span className="text-stroke italic font-serif">Conversar</span>
              </h2>
              <a
                href="mailto:ola@genz1n.com"
                className="text-3xl md:text-5xl font-light hover:text-accent transition-colors block border-b-2 border-transparent hover:border-accent w-fit pb-2"
              >
                ola@genz1n.com
              </a>
            </div>

            <div className="flex flex-col justify-end items-start md:items-end">
              <div className="flex gap-6">
                <a
                  href="#"
                  className="text-sm uppercase tracking-widest hover:text-accent transition-colors"
                >
                  Instagram
                </a>
                <a
                  href="#"
                  className="text-sm uppercase tracking-widest hover:text-accent transition-colors"
                >
                  Behance
                </a>
                <a
                  href="#"
                  className="text-sm uppercase tracking-widest hover:text-accent transition-colors"
                >
                  LinkedIn
                </a>
              </div>
              <p className="text-muted mt-8 text-xs font-mono uppercase tracking-tighter">
                © 2024 GenZ1n Studio — São Paulo, BR
              </p>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-20 -right-20 opacity-[0.03] select-none pointer-events-none">
          <span className="text-[40rem] font-black leading-none">G1</span>
        </div>
      </section>
    </div>
  );
}
