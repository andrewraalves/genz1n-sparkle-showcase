import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { settingsQuery, getSetting } from "@/lib/site-queries";
import { Instagram, Linkedin, Github, Palette, Mail, Phone, MapPin } from "lucide-react";

export function SiteFooter() {
  const { data } = useQuery(settingsQuery);
  const contact = getSetting(data, "contact_info", {
    email: "ola@genz1n.com",
    phone: "",
    address: "",
    hours: "",
  } as { email: string; phone: string; address: string; hours: string });
  const social = getSetting(data, "social", {
    instagram: "#",
    linkedin: "#",
    behance: "#",
    github: "#",
  } as { instagram: string; linkedin: string; behance: string; github: string });
  const footer = getSetting(data, "footer", {
    tagline: "Esculpindo o futuro digital.",
    copyright: "© 2024 GenZ1n Studio",
  } as { tagline: string; copyright: string });

  return (
    <footer className="relative mt-32 border-t border-border">
      <div className="absolute inset-0 -z-10 opacity-40 pointer-events-none">
        <div className="blob w-[380px] h-[380px] left-[10%] top-10 bg-[#003CFF]" />
        <div className="blob w-[420px] h-[420px] right-[5%] bottom-0 bg-[#B800FF]" style={{ animationDelay: "-6s" }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 font-display font-black text-xl">
            <span className="inline-block w-8 h-8 rounded-md gradient-brand" />
            <span className="text-gradient-brand">GenZ1n</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">{footer.tagline}</p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-accent font-semibold mb-4">
            Navegação
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-accent transition-colors">Início</Link></li>
            <li><Link to="/projetos" className="hover:text-accent transition-colors">Projetos</Link></li>
            <li><Link to="/trabalhe-conosco" className="hover:text-accent transition-colors">Vagas</Link></li>
            <li><Link to="/contato" className="hover:text-accent transition-colors">Contato</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-accent font-semibold mb-4">
            Contato
          </h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {contact.address && (
              <li className="flex gap-2"><MapPin size={16} className="mt-0.5 text-accent" /><span>{contact.address}</span></li>
            )}
            {contact.email && (
              <li className="flex gap-2"><Mail size={16} className="mt-0.5 text-accent" /><a href={`mailto:${contact.email}`} className="hover:text-foreground">{contact.email}</a></li>
            )}
            {contact.phone && (
              <li className="flex gap-2"><Phone size={16} className="mt-0.5 text-accent" /><span>{contact.phone}</span></li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-accent font-semibold mb-4">
            Redes Sociais
          </h4>
          <div className="flex gap-3">
            {social.instagram && <SocialIcon href={social.instagram} label="Instagram"><Instagram size={18} /></SocialIcon>}
            {social.linkedin && <SocialIcon href={social.linkedin} label="LinkedIn"><Linkedin size={18} /></SocialIcon>}
            {social.behance && <SocialIcon href={social.behance} label="Behance"><Palette size={18} /></SocialIcon>}
            {social.github && <SocialIcon href={social.github} label="GitHub"><Github size={18} /></SocialIcon>}
          </div>
        </div>
      </div>

      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        {footer.copyright} — Todos os direitos reservados.
      </div>
    </footer>
  );
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-foreground hover:text-accent hover:border-accent transition-all"
    >
      {children}
    </a>
  );
}
