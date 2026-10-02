import { createFileRoute } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";
import {
  Activity, BatteryMedium, Bell, Camera, Check, ChevronDown, Clock3, Eye,
  HeartHandshake, Home, KeyRound, LoaderCircle, LocateFixed, LogOut, MapPin,
  Menu, MessageCircle, Mic, MonitorUp, Navigation, Plus, RefreshCw, Settings,
  ShieldCheck, Smartphone, UserRound, X, Zap,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import mapImage from "@/assets/family-map.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import type { Tables, Enums } from "@/integrations/supabase/types";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Ninho — Painel de segurança familiar" },
    { name: "description", content: "Gerencie dispositivos, localização e solicitações de proteção familiar com transparência." },
    { property: "og:title", content: "Ninho — Painel de segurança familiar" },
    { property: "og:description", content: "Segurança familiar com dados protegidos e consentimento explícito." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: FamilySafetyApp,
});

type Device = Tables<"devices">;
type Command = Tables<"device_commands">;
type Telemetry = Tables<"device_telemetry">;
type Profile = Tables<"profiles">;
type CommandType = Enums<"device_command_type">;
type View = "parent" | "child";

const sensitiveCommands: CommandType[] = ["capture_photo", "capture_screenshot", "record_screen", "record_audio"];
const commandLabels: Record<CommandType, string> = {
  get_location: "Atualizar localização", capture_photo: "Tirar foto", capture_screenshot: "Capturar tela",
  record_screen: "Gravar tela", record_audio: "Gravar áudio", send_message: "Enviar recado", play_alert: "Tocar alerta",
};
const commandIcons: Record<CommandType, typeof Camera> = {
  get_location: LocateFixed, capture_photo: Camera, capture_screenshot: Eye, record_screen: MonitorUp,
  record_audio: Mic, send_message: MessageCircle, play_alert: Zap,
};
const statusLabels = { pending: "Aguardando", processing: "Em execução", completed: "Concluído", denied: "Recusado", failed: "Falhou" } as const;

function FamilySafetyApp() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => { setUser(data.user); setCheckingSession(false); });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setCheckingSession(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  if (checkingSession) return <LoadingScreen />;
  if (!user) return <AuthScreen />;
  return <Dashboard user={user} />;
}

function LoadingScreen() {
  return <div className="grid min-h-screen place-items-center bg-background"><div className="flex items-center gap-3 font-display text-lg font-bold"><LoaderCircle className="animate-spin text-primary"/>Carregando o Ninho</div></div>;
}

function AuthScreen() {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
      setMessage(error?.message ?? "Enviamos um link de recuperação para o seu e-mail."); setBusy(false); return;
    }
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin, data: { display_name: name } } });
      if (!error && data.user) await supabase.from("profiles").upsert({ id: data.user.id, display_name: name });
      setMessage(error?.message ?? (data.session ? "Conta criada." : "Confira seu e-mail para confirmar a conta."));
      setBusy(false); return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    setBusy(false);
  }

  async function signInGoogle() {
    setBusy(true); setMessage("");
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) setMessage(result.error.message);
    setBusy(false);
  }

  return <main className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
    <section className="relative hidden overflow-hidden bg-foreground p-12 text-background lg:flex lg:flex-col lg:justify-between">
      <img src={mapImage} alt="Mapa do trajeto familiar" className="absolute inset-0 h-full w-full object-cover opacity-20"/>
      <div className="absolute inset-0 bg-foreground/80"/>
      <div className="relative flex items-center gap-3"><div className="grid size-11 place-items-center rounded-lg bg-primary text-primary-foreground"><HeartHandshake/></div><span className="font-display text-2xl font-bold">ninho</span></div>
      <div className="relative max-w-xl"><p className="text-sm font-bold uppercase text-primary">Família conectada</p><h1 className="mt-4 font-display text-5xl font-bold leading-tight">Cuidado presente, com respeito e transparência.</h1><p className="mt-5 max-w-lg text-lg text-background/75">Acompanhe dispositivos, localização e pedidos de proteção em um só lugar.</p></div>
      <div className="relative flex gap-6 text-sm text-background/70"><span className="flex items-center gap-2"><ShieldCheck size={18}/>Dados protegidos</span><span className="flex items-center gap-2"><Eye size={18}/>Ações visíveis</span></div>
    </section>
    <section className="flex items-center justify-center bg-background p-5 sm:p-10"><div className="w-full max-w-md">
      <div className="mb-9 flex items-center gap-3 lg:hidden"><div className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground"><HeartHandshake size={21}/></div><span className="font-display text-xl font-bold">ninho</span></div>
      <p className="text-sm font-bold text-primary">{mode === "signup" ? "Criar conta" : mode === "forgot" ? "Recuperar acesso" : "Área do responsável"}</p>
      <h2 className="mt-2 font-display text-3xl font-bold">{mode === "signup" ? "Comece a proteger sua família" : mode === "forgot" ? "Redefina sua senha" : "Bem-vindo de volta"}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{mode === "signup" ? "Seus dados ficam vinculados somente à sua conta." : "Entre para acessar seus dispositivos e registros."}</p>
      {mode !== "forgot" && <Button variant="outline" className="mt-7 h-11 w-full" onClick={signInGoogle} disabled={busy}><span className="text-base font-black">G</span>Continuar com Google</Button>}
      {mode !== "forgot" && <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border"/>ou use seu e-mail<span className="h-px flex-1 bg-border"/></div>}
      <form onSubmit={submit} className="space-y-4">
        {mode === "signup" && <div className="space-y-2"><Label htmlFor="name">Nome completo</Label><Input id="name" value={name} onChange={e=>setName(e.target.value)} required autoComplete="name"/></div>}
        <div className="space-y-2"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email"/></div>
        {mode !== "forgot" && <div className="space-y-2"><Label htmlFor="password">Senha</Label><Input id="password" type="password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} required autoComplete={mode === "signup" ? "new-password" : "current-password"}/></div>}
        {message && <p role="status" className="rounded-md bg-secondary p-3 text-sm text-secondary-foreground">{message}</p>}
        <Button className="h-11 w-full" type="submit" disabled={busy}>{busy && <LoaderCircle className="animate-spin"/>}{mode === "signup" ? "Criar conta" : mode === "forgot" ? "Enviar link" : "Entrar"}</Button>
      </form>
      <div className="mt-5 flex flex-wrap justify-between gap-3 text-sm">
        <Button variant="ghost" className="h-auto p-0 text-primary" onClick={()=>{setMessage("");setMode(mode === "signup" ? "signin" : "signup")}}>{mode === "signup" ? "Já tenho conta" : "Criar uma conta"}</Button>
        <Button variant="ghost" className="h-auto p-0 text-primary" onClick={()=>{setMessage("");setMode(mode === "forgot" ? "signin" : "forgot")}}>{mode === "forgot" ? "Voltar para entrar" : "Esqueci minha senha"}</Button>
      </div>
    </div></section>
  </main>;
}

function Dashboard({ user }: { user: User }) {
  const [view, setView] = useState<View>("parent");
  const [menuOpen, setMenuOpen] = useState(false);
  const [pairOpen, setPairOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [commands, setCommands] = useState<Command[]>([]);
  const [telemetry, setTelemetry] = useState<Telemetry[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    const [profileResult, deviceResult, commandResult, telemetryResult] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("devices").select("*").order("created_at"),
      supabase.from("device_commands").select("*").order("created_at", { ascending: false }).limit(30),
      supabase.from("device_telemetry").select("*").order("created_at", { ascending: false }).limit(30),
    ]);
    if (!profileResult.data) {
      const displayName = String(user.user_metadata?.["display_name"] ?? user.user_metadata?.["full_name"] ?? "");
      const { data } = await supabase.from("profiles").upsert({ id: user.id, display_name: displayName }).select().single();
      setProfile(data);
    } else setProfile(profileResult.data);
    setDevices(deviceResult.data ?? []); setCommands(commandResult.data ?? []); setTelemetry(telemetryResult.data ?? []);
    setSelectedId(current => current ?? deviceResult.data?.[0]?.id ?? null); setLoading(false);
  }, [user.id, user.user_metadata]);

  useEffect(() => { void loadData(); }, [loadData]);
  useEffect(() => {
    const channel = supabase.channel(`ninho-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "devices", filter: `owner_id=eq.${user.id}` }, () => void loadData())
      .on("postgres_changes", { event: "*", schema: "public", table: "device_commands", filter: `owner_id=eq.${user.id}` }, () => void loadData())
      .on("postgres_changes", { event: "*", schema: "public", table: "device_telemetry", filter: `owner_id=eq.${user.id}` }, () => void loadData()).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [loadData, user.id]);

  const device = devices.find(item => item.id === selectedId) ?? devices[0] ?? null;
  const deviceCommands = useMemo(() => commands.filter(item => item.device_id === device?.id), [commands, device?.id]);
  const deviceTelemetry = useMemo(() => telemetry.filter(item => item.device_id === device?.id), [telemetry, device?.id]);
  const latestLocation = deviceTelemetry.find(item => item.telemetry_type === "location");
  const profileName = profile?.display_name?.trim() || user.email?.split("@")[0] || "Responsável";

  const notify = (text: string) => { setNotice(text); window.setTimeout(() => setNotice(""), 2800); };
  async function sendCommand(type: CommandType) {
    if (!device) return;
    const needsConsent = sensitiveCommands.includes(type);
    const { error } = await supabase.from("device_commands").insert({ device_id: device.id, owner_id: user.id, command_type: type, consent_status: needsConsent ? "pending" : "not_required" });
    if (error) notify(`Não foi possível enviar: ${error.message}`); else notify(needsConsent ? "Solicitação enviada. Aguardando autorização no aparelho." : "Comando enviado ao aparelho.");
  }

  if (view === "child") return <ChildSimulator user={user} device={device} commands={deviceCommands} onBack={()=>setView("parent")} onRefresh={loadData}/>;

  return <div className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur"><div className="mx-auto flex h-18 max-w-[1500px] items-center justify-between px-4 sm:px-8">
      <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground"><HeartHandshake size={22}/></div><div><div className="font-display text-xl font-bold leading-none">ninho</div><div className="mt-1 text-[10px] font-bold uppercase text-muted-foreground">Família protegida</div></div></div>
      <nav className="hidden items-center gap-1 lg:flex">{[[Home,"Visão geral"],[MapPin,"Localização"],[Clock3,"Atividades"],[ShieldCheck,"Proteção"]].map(([Icon,label], index) => { const NavIcon = Icon as typeof Home; return <Button key={label as string} variant={index===0?"secondary":"ghost"} size="sm"><NavIcon size={16}/>{label as string}</Button>; })}</nav>
      <div className="flex items-center gap-2"><Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={()=>setView("child")} disabled={!device}><Smartphone size={16}/>Simular aparelho</Button><Button variant="ghost" size="icon" aria-label="Notificações"><Bell size={19}/></Button><Button variant="ghost" size="icon" aria-label="Abrir menu" onClick={()=>setMenuOpen(!menuOpen)}><Menu size={20}/></Button></div>
    </div></header>
    {menuOpen && <div className="fixed right-4 top-20 z-50 w-72 rounded-lg border border-border bg-popover p-3 shadow-xl"><div className="flex items-center gap-3 border-b border-border p-2"><div className="grid size-9 place-items-center rounded-full bg-secondary"><UserRound size={18}/></div><div className="min-w-0"><p className="truncate text-sm font-bold">{profileName}</p><p className="truncate text-xs text-muted-foreground">{user.email}</p></div></div><Button variant="ghost" className="mt-2 w-full justify-start" onClick={()=>{setProfileOpen(true);setMenuOpen(false)}}><Settings size={16}/>Meu perfil</Button><Button variant="ghost" className="w-full justify-start" onClick={()=>void supabase.auth.signOut()}><LogOut size={16}/>Sair</Button></div>}
    <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-8 sm:py-10">
      <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm font-semibold text-primary">Painel da família</p><h1 className="font-display text-3xl font-bold sm:text-4xl">Olá, {profileName.split(" ")[0]}.</h1><p className="mt-2 max-w-2xl text-muted-foreground">Acompanhe seus dispositivos e solicitações de proteção em tempo real.</p></div><Button onClick={()=>setPairOpen(true)}><Plus size={17}/>Adicionar dispositivo</Button></section>
      {loading ? <div className="grid min-h-80 place-items-center"><LoaderCircle className="animate-spin text-primary"/></div> : !device ? <EmptyDevices onAdd={()=>setPairOpen(true)}/> : <>
        <section className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-2">{devices.map(item=><Button key={item.id} size="sm" variant={item.id===device.id?"default":"outline"} onClick={()=>setSelectedId(item.id)}><Smartphone size={15}/>{item.child_name}</Button>)}</div><span className="text-xs text-muted-foreground">Código: <strong className="text-foreground">{device.pairing_code}</strong></span></section>
        <section className="mb-6 grid gap-4 md:grid-cols-3"><StatusCard icon={ShieldCheck} label="Status de proteção" value={device.paired_at?"Pareado":"Aguardando pareamento"} detail="Ações sensíveis exigem autorização" tone="green"/><StatusCard icon={MapPin} label="Localização atual" value={locationLabel(latestLocation)} detail={latestLocation?formatRelative(latestLocation.created_at):"Nenhum dado recebido"} tone="coral"/><StatusCard icon={BatteryMedium} label={device.name} value={device.battery_level == null?"Bateria indisponível":`${device.battery_level}% de bateria`} detail={device.connection_status==="online"?"Online agora":"Offline"} tone="gold"/></section>
        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"><div className="flex items-center justify-between p-5 sm:p-6"><div><h2 className="font-display text-xl font-bold">Onde está {device.child_name}</h2><p className="mt-1 text-sm text-muted-foreground">Última localização enviada pelo aparelho</p></div><Button variant="outline" size="sm" onClick={()=>void sendCommand("get_location")}><RefreshCw size={15}/>Solicitar</Button></div><div className="relative aspect-[16/9] min-h-72 overflow-hidden border-y border-border bg-muted"><img src={mapImage} alt="Mapa de localização do dispositivo" className="h-full w-full object-cover"/><div className="absolute bottom-4 left-4 rounded-lg border border-border bg-background/95 px-4 py-3 shadow-lg"><div className="flex items-center gap-2 text-sm font-bold"><Navigation size={16} className="text-primary"/>{locationLabel(latestLocation)}</div><p className="mt-1 text-xs text-muted-foreground">{latestLocation ? formatRelative(latestLocation.created_at) : "Solicite uma atualização"}</p></div></div><div className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0"><MiniStat label="Conexão" value={device.connection_status==="online"?"Online":"Offline"}/><MiniStat label="Plataforma" value={device.platform.toUpperCase()}/><MiniStat label="Registros" value={String(deviceTelemetry.length)}/></div></div>
          <div className="flex flex-col gap-6"><div className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6"><div className="mb-5"><h2 className="font-display text-xl font-bold">Ações remotas</h2><p className="mt-1 text-sm text-muted-foreground">Câmera, tela e áudio pedem autorização no aparelho.</p></div><div className="grid grid-cols-2 gap-3">{(["capture_photo","capture_screenshot","record_screen","record_audio","send_message","play_alert"] as CommandType[]).map(type=><ActionButton key={type} type={type} onClick={()=>void sendCommand(type)}/>)}</div></div>
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6"><h2 className="font-display text-xl font-bold">Fila de comandos</h2><p className="mt-1 text-sm text-muted-foreground">Atualizada em tempo real</p><div className="mt-4 space-y-3">{deviceCommands.length===0?<p className="py-6 text-center text-sm text-muted-foreground">Nenhum comando enviado.</p>:deviceCommands.slice(0,5).map(command=><CommandRow key={command.id} command={command}/>)}</div></div></div>
        </section>
        <section className="mt-6 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-display text-xl font-bold">Linha do tempo</h2><p className="mt-1 text-sm text-muted-foreground">Telemetria e respostas recentes</p></div><Button variant="ghost" size="sm">Ver tudo <ChevronDown size={15}/></Button></div><div className="grid gap-4 lg:grid-cols-3">{deviceTelemetry.length===0?<p className="text-sm text-muted-foreground">Os dados enviados pelo aparelho aparecerão aqui.</p>:deviceTelemetry.slice(0,3).map(item=><TelemetryItem key={item.id} item={item}/>)}</div></section>
      </>}
    </main>
    <PairDeviceDialog open={pairOpen} onOpenChange={setPairOpen} userId={user.id} onCreated={async id=>{setSelectedId(id);await loadData();}}/>
    <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} userId={user.id} profile={profile} onSaved={loadData}/>
    {notice && <div className="fixed bottom-5 left-1/2 z-50 flex max-w-[90vw] -translate-x-1/2 items-center gap-2 rounded-lg bg-foreground px-4 py-3 text-sm font-semibold text-background shadow-xl"><Check size={16}/>{notice}</div>}
  </div>;
}

function EmptyDevices({onAdd}:{onAdd:()=>void}) { return <section className="grid min-h-[430px] place-items-center border-y border-border py-16 text-center"><div className="max-w-md"><div className="mx-auto grid size-16 place-items-center rounded-full bg-secondary text-secondary-foreground"><Smartphone size={30}/></div><h2 className="mt-5 font-display text-2xl font-bold">Adicione o primeiro aparelho</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Crie um código de pareamento para conectar o aplicativo Android quando ele estiver pronto.</p><Button className="mt-6" onClick={onAdd}><Plus size={17}/>Adicionar dispositivo</Button></div></section>; }

function PairDeviceDialog({open,onOpenChange,userId,onCreated}:{open:boolean;onOpenChange:(open:boolean)=>void;userId:string;onCreated:(id:string)=>Promise<void>}) {
  const [name,setName]=useState(""); const [childName,setChildName]=useState(""); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  async function submit(event:FormEvent){event.preventDefault();setBusy(true);setError("");const {data, error:insertError}=await supabase.from("devices").insert({owner_id:userId,name,child_name:childName,platform:"android"}).select().single();setBusy(false);if(insertError||!data){setError(insertError?.message??"Não foi possível criar o dispositivo.");return;}setName("");setChildName("");onOpenChange(false);await onCreated(data.id);}
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>Adicionar dispositivo</DialogTitle><DialogDescription>Um código exclusivo será criado para o pareamento com o aplicativo Android.</DialogDescription></DialogHeader><form id="pair-form" onSubmit={submit} className="space-y-4"><div className="space-y-2"><Label htmlFor="child-name">Nome da criança</Label><Input id="child-name" value={childName} onChange={e=>setChildName(e.target.value)} required/></div><div className="space-y-2"><Label htmlFor="device-name">Nome do aparelho</Label><Input id="device-name" value={name} onChange={e=>setName(e.target.value)} placeholder="Ex.: Celular do Miguel" required/></div>{error&&<p className="text-sm text-destructive">{error}</p>}</form><DialogFooter><Button variant="outline" onClick={()=>onOpenChange(false)}>Cancelar</Button><Button type="submit" form="pair-form" disabled={busy}>{busy&&<LoaderCircle className="animate-spin"/>}Criar código</Button></DialogFooter></DialogContent></Dialog>;
}

function ProfileDialog({open,onOpenChange,userId,profile,onSaved}:{open:boolean;onOpenChange:(open:boolean)=>void;userId:string;profile:Profile|null;onSaved:()=>Promise<void>}) {
  const [name,setName]=useState(""); const [phone,setPhone]=useState(""); const [avatar,setAvatar]=useState<File|null>(null); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  useEffect(()=>{if(open){setName(profile?.display_name??"");setPhone(profile?.phone??"");}},[open,profile]);
  async function submit(event:FormEvent){event.preventDefault();setBusy(true);setError("");let avatarPath=profile?.avatar_path??null;if(avatar){const extension=avatar.name.split(".").pop()?.toLowerCase()||"jpg";const path=`${userId}/avatars/profile.${extension}`;const {error:uploadError}=await supabase.storage.from("device-media").upload(path,avatar,{upsert:true,contentType:avatar.type});if(uploadError){setError(uploadError.message);setBusy(false);return;}avatarPath=path;}const {error:saveError}=await supabase.from("profiles").upsert({id:userId,display_name:name,phone:phone||null,avatar_path:avatarPath,preferences:profile?.preferences??{}});setBusy(false);if(saveError){setError(saveError.message);return;}setAvatar(null);onOpenChange(false);await onSaved();}
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>Meu perfil</DialogTitle><DialogDescription>Mantenha seus dados de responsável atualizados.</DialogDescription></DialogHeader><form id="profile-form" onSubmit={submit} className="space-y-4"><div className="space-y-2"><Label htmlFor="profile-name">Nome completo</Label><Input id="profile-name" value={name} onChange={e=>setName(e.target.value)} required/></div><div className="space-y-2"><Label htmlFor="profile-phone">Telefone</Label><Input id="profile-phone" type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="(00) 00000-0000"/></div><div className="space-y-2"><Label htmlFor="profile-avatar">Foto do perfil</Label><Input id="profile-avatar" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setAvatar(e.target.files?.[0]??null)}/><p className="text-xs text-muted-foreground">A imagem fica protegida e vinculada à sua conta.</p></div>{error&&<p className="text-sm text-destructive">{error}</p>}</form><DialogFooter><Button variant="outline" onClick={()=>onOpenChange(false)}>Cancelar</Button><Button type="submit" form="profile-form" disabled={busy}>{busy&&<LoaderCircle className="animate-spin"/>}Salvar</Button></DialogFooter></DialogContent></Dialog>;
}

function ChildSimulator({user,device,commands,onBack,onRefresh}:{user:User;device:Device|null;commands:Command[];onBack:()=>void;onRefresh:()=>Promise<void>}) {
  const pending=commands.find(item=>item.status==="pending"); const [busy,setBusy]=useState(false);
  async function answer(command:Command,granted:boolean){setBusy(true);const now=new Date().toISOString();await supabase.from("command_consent_events").insert({command_id:command.id,device_id:command.device_id,owner_id:user.id,status:granted?"granted":"denied",details:{source:"web_simulator"}});await supabase.from("device_commands").update({status:granted?"completed":"denied",consent_status:sensitiveCommands.includes(command.command_type)?(granted?"granted":"denied"):"not_required",started_at:now,completed_at:now}).eq("id",command.id);if(granted&&command.command_type==="get_location")await supabase.from("device_telemetry").insert({device_id:command.device_id,owner_id:user.id,command_id:command.id,telemetry_type:"location",payload_data:{label:"Localização recebida",latitude:-23.5505,longitude:-46.6333}});await onRefresh();setBusy(false);}
  return <div className="flex min-h-screen items-center justify-center bg-child-shell p-4 sm:p-8"><div className="relative flex min-h-[760px] w-full max-w-sm flex-col overflow-hidden rounded-[2rem] border-[8px] border-foreground bg-background shadow-2xl"><div className="mx-auto mt-2 h-5 w-24 rounded-full bg-foreground"/><div className="flex items-center justify-between px-5 py-5"><div className="flex items-center gap-2"><div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"><HeartHandshake size={17}/></div><span className="font-display font-bold">ninho</span></div><div className="flex items-center gap-1 text-xs font-bold text-safe"><span className="size-2 rounded-full bg-safe"/>Proteção ativa</div></div><div className="flex flex-1 flex-col px-5 pb-6"><div className="rounded-lg bg-secondary p-5 text-center"><div className="mx-auto grid size-16 place-items-center rounded-full bg-safe/15 text-safe"><ShieldCheck size={32}/></div><h1 className="mt-3 font-display text-xl font-bold">Tudo certo, {device?.child_name??"por aqui"}</h1><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Câmera, tela e áudio só funcionam após sua autorização.</p></div><div className="my-6"><p className="mb-3 text-xs font-bold uppercase text-muted-foreground">Este aparelho</p><div className="space-y-3"><ChildRow icon={Smartphone} title={device?.name??"Nenhum aparelho"} detail={device?`Código ${device.pairing_code}`:"Volte e adicione um dispositivo"}/><ChildRow icon={Activity} title="Fila conectada" detail={`${commands.filter(c=>c.status==="pending").length} solicitação pendente`}/></div></div><div className="mt-auto rounded-lg border border-border bg-card p-4"><p className="text-sm font-bold">Modo de simulação</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Use esta tela até o projeto Android ser integrado.</p></div><Button variant="ghost" className="mt-4" onClick={onBack}>Voltar ao painel</Button></div>
    {pending&&<div className="absolute inset-0 z-20 flex items-end bg-overlay p-4"><div className="w-full rounded-xl bg-background p-5 shadow-2xl"><div className="flex items-start justify-between"><div className="grid size-12 place-items-center rounded-lg bg-primary/15 text-primary">{(() => {const Icon=commandIcons[pending.command_type];return <Icon/>;})()}</div><Button variant="ghost" size="icon" aria-label="Voltar" onClick={onBack}><X size={19}/></Button></div><h2 className="mt-4 font-display text-xl font-bold">Solicitação: {commandLabels[pending.command_type]}</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{sensitiveCommands.includes(pending.command_type)?"O responsável solicitou esta ação. Nada será capturado sem sua escolha.":"O responsável enviou este comando ao aparelho."}</p><div className="mt-5 grid grid-cols-2 gap-3"><Button variant="outline" disabled={busy} onClick={()=>void answer(pending,false)}>Recusar</Button><Button disabled={busy} onClick={()=>void answer(pending,true)}>{busy&&<LoaderCircle className="animate-spin"/>}Autorizar</Button></div></div></div>}
    </div></div>;
}

function CommandRow({command}:{command:Command}){const Icon=commandIcons[command.command_type];return <div className="flex items-center gap-3 rounded-md border border-border p-3"><div className="grid size-9 shrink-0 place-items-center rounded-md bg-secondary"><Icon size={16}/></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{commandLabels[command.command_type]}</p><p className="text-xs text-muted-foreground">{formatRelative(command.created_at)}</p></div><span className={`text-xs font-bold ${command.status==="completed"?"text-safe":command.status==="failed"||command.status==="denied"?"text-destructive":"text-primary"}`}>{statusLabels[command.status]}</span></div>}
function TelemetryItem({item}:{item:Telemetry}){const title:Record<Telemetry["telemetry_type"],string>={location:"Localização recebida",photo:"Foto recebida",screenshot:"Captura de tela recebida",screen_recording:"Gravação de tela recebida",audio_recording:"Áudio recebido",device_status:"Estado do aparelho"};return <div className="flex gap-3 border-l-2 border-primary/30 pl-4"><div className="mt-0.5 text-primary"><Activity size={18}/></div><div><p className="text-xs font-bold text-primary">{formatRelative(item.created_at)}</p><p className="mt-1 text-sm font-bold">{title[item.telemetry_type]}</p><p className="mt-1 text-xs text-muted-foreground">Registro protegido na conta do responsável.</p></div></div>}
function StatusCard({icon:Icon,label,value,detail,tone}:{icon:typeof Home;label:string;value:string;detail:string;tone:"green"|"coral"|"gold"}){const tones={green:"bg-safe/15 text-safe",coral:"bg-primary/15 text-primary",gold:"bg-warning/20 text-warning-foreground"};return <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-5 shadow-sm"><div className={`grid size-12 shrink-0 place-items-center rounded-lg ${tones[tone]}`}><Icon size={23}/></div><div className="min-w-0"><p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p><p className="mt-1 truncate font-display text-lg font-bold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div></div>}
function MiniStat({label,value}:{label:string;value:string}){return <div className="p-4 text-center"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-sm font-bold">{value}</p></div>}
function ActionButton({type,onClick}:{type:CommandType;onClick:()=>void}){const Icon=commandIcons[type];return <Button variant="secondary" className="h-20 flex-col" onClick={onClick}><Icon size={21}/><span className="text-xs sm:text-sm">{commandLabels[type]}</span></Button>}
function ChildRow({icon:Icon,title,detail}:{icon:typeof MapPin;title:string;detail:string}){return <div className="flex items-center gap-3 rounded-md border border-border p-3"><div className="grid size-9 place-items-center rounded-md bg-secondary text-secondary-foreground"><Icon size={17}/></div><div><p className="text-sm font-bold">{title}</p><p className="mt-0.5 text-xs text-muted-foreground">{detail}</p></div></div>}
function formatRelative(value:string){return new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}).format(new Date(value));}
function locationLabel(item:Telemetry|undefined){if(!item)return "Sem localização";const payload=item.payload_data;if(payload&&typeof payload==="object"&&!Array.isArray(payload)&&"label" in payload&&typeof payload["label"]==="string")return payload["label"];return "Localização recebida";}
