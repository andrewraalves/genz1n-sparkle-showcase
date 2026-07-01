import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/", label: "Início" },
  { to: "/projetos", label: "Projetos" },
  { to: "/trabalhe-conosco", label: "Trabalhe Conosco" },
  { to: "/contato", label: "Contato" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setIsAuthed(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 glass-nav border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-black text-lg">
          <span className="inline-block w-7 h-7 rounded-md gradient-brand shadow-[0_0_20px_rgba(184,0,255,0.5)]" />
          <span className="text-gradient-brand">GenZ1n</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-[13px] font-medium">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-foreground/80 hover:text-foreground transition-colors"
              activeProps={{ className: "text-accent" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to={isAuthed ? "/admin" : "/auth"}
            className="px-4 py-2 rounded-full gradient-brand text-primary-foreground text-xs uppercase tracking-widest font-semibold shadow-[0_0_20px_rgba(0,60,255,0.35)] hover:opacity-90"
          >
            {isAuthed ? "Painel" : "Admin"}
          </Link>
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur">
          <div className="flex flex-col p-4 gap-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="py-2 text-foreground/85 hover:text-accent"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to={isAuthed ? "/admin" : "/auth"}
              onClick={() => setOpen(false)}
              className="mt-2 px-4 py-2 rounded-full gradient-brand text-primary-foreground text-xs uppercase tracking-widest text-center"
            >
              {isAuthed ? "Painel" : "Admin"}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
