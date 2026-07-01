import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Acesso — GenZ1n" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu e-mail se necessário.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="blob w-[500px] h-[500px] left-[10%] top-[10%] bg-[#003CFF]" />
        <div className="blob w-[500px] h-[500px] right-[10%] bottom-[10%] bg-[#B800FF]" style={{ animationDelay: "-5s" }} />
      </div>

      <div className="w-full max-w-md glass-panel rounded-3xl p-8 relative">
        <div className="absolute top-0 left-0 right-0 h-1 gradient-brand rounded-t-3xl" />
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 font-display font-black text-2xl">
            <span className="inline-block w-9 h-9 rounded-lg gradient-brand" />
            <span className="text-gradient-brand">GenZ1n</span>
          </div>
          <h1 className="mt-6 text-2xl font-bold">
            {mode === "signin" ? "Acesso ao painel" : "Criar conta"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signin" ? "Entre com suas credenciais" : "Primeiro cadastro vira admin automaticamente"}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full bg-background/60 border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 w-full bg-background/60 border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full gradient-brand text-white font-semibold disabled:opacity-50"
          >
            {loading ? "Aguarde..." : mode === "signin" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-6 w-full text-sm text-muted-foreground hover:text-accent"
        >
          {mode === "signin" ? "Não tem conta? Criar" : "Já tem conta? Entrar"}
        </button>
      </div>
    </main>
  );
}
