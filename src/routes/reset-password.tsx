import { createFileRoute, Link } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { Check, HeartHandshake, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Redefinir senha — Ninho" },
    { name: "description", content: "Crie uma nova senha para sua conta Ninho." },
    { property: "og:title", content: "Redefinir senha — Ninho" },
    { property: "og:description", content: "Recupere com segurança o acesso à sua conta Ninho." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ]}),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    const recovery = new URLSearchParams(window.location.hash.slice(1)).get("type") === "recovery";
    void supabase.auth.getSession().then(({ data }) => setReady(recovery || Boolean(data.session)));
  }, []);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false); if (error) setMessage(error.message); else setDone(true);
  }
  return <main className="grid min-h-screen place-items-center bg-background p-5"><div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8"><div className="mb-7 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground"><HeartHandshake size={21}/></div><span className="font-display text-xl font-bold">ninho</span></div>{done?<div className="text-center"><div className="mx-auto grid size-14 place-items-center rounded-full bg-safe/15 text-safe"><Check/></div><h1 className="mt-4 font-display text-2xl font-bold">Senha atualizada</h1><p className="mt-2 text-sm text-muted-foreground">Você já pode entrar com sua nova senha.</p><Button asChild className="mt-6 w-full"><Link to="/">Ir para o Ninho</Link></Button></div>:<><h1 className="font-display text-2xl font-bold">Crie uma nova senha</h1><p className="mt-2 text-sm text-muted-foreground">Use pelo menos 8 caracteres.</p>{!ready?<p className="mt-5 rounded-md bg-secondary p-3 text-sm">Abra esta página pelo link enviado ao seu e-mail.</p>:<form onSubmit={submit} className="mt-6 space-y-4"><div className="space-y-2"><Label htmlFor="new-password">Nova senha</Label><Input id="new-password" type="password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="new-password"/></div>{message&&<p className="text-sm text-destructive">{message}</p>}<Button className="w-full" type="submit" disabled={busy}>{busy&&<LoaderCircle className="animate-spin"/>}Atualizar senha</Button></form>}</>}</div></main>;
}
