import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  BatteryMedium,
  Bell,
  Camera,
  Check,
  ChevronDown,
  Clock3,
  Eye,
  HeartHandshake,
  Home,
  Laptop,
  MapPin,
  Menu,
  MessageCircle,
  Navigation,
  Plus,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import mapImage from "@/assets/family-map.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ninho — Segurança familiar com transparência" },
      { name: "description", content: "Acompanhe localização, uso e bem-estar digital da sua família com consentimento e clareza." },
      { property: "og:title", content: "Ninho — Segurança familiar com transparência" },
      { property: "og:description", content: "Um protótipo de controle parental transparente e acolhedor." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FamilySafetyApp,
});

type View = "parent" | "child";

const apps = [
  { name: "YouTube", time: "1h 12min", percent: 78, tone: "bg-activity-coral", icon: "YT" },
  { name: "Minecraft", time: "48min", percent: 54, tone: "bg-activity-green", icon: "MC" },
  { name: "WhatsApp", time: "31min", percent: 38, tone: "bg-activity-teal", icon: "WA" },
  { name: "Outros", time: "20min", percent: 24, tone: "bg-activity-gold", icon: "+" },
];

function FamilySafetyApp() {
  const [view, setView] = useState<View>("parent");
  const [menuOpen, setMenuOpen] = useState(false);
  const [consent, setConsent] = useState<"camera" | "screen" | null>(null);
  const [toast, setToast] = useState("");

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  if (view === "child") {
    return <ChildView onBack={() => setView("parent")} onConsent={setConsent} consent={consent} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-[1500px] items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"><HeartHandshake size={22} /></div>
            <div><div className="font-display text-xl font-bold leading-none">ninho</div><div className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Família protegida</div></div>
          </div>
          <nav className="hidden items-center gap-1 lg:flex">
            {[[Home,"Visão geral"],[MapPin,"Localização"],[Clock3,"Atividades"],[ShieldCheck,"Proteção"]].map(([Icon,label], index) => {
              const NavIcon = Icon as typeof Home;
              return <Button key={label as string} variant={index === 0 ? "secondary" : "ghost"} size="sm"><NavIcon size={16} />{label as string}</Button>;
            })}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => setView("child")}><Smartphone size={16} />Ver celular da criança</Button>
            <Button variant="ghost" size="icon" aria-label="Notificações"><Bell size={19} /></Button>
            <Button variant="ghost" size="icon" aria-label="Abrir menu" onClick={() => setMenuOpen(!menuOpen)}><Menu size={20} /></Button>
          </div>
        </div>
      </header>

      {menuOpen && <div className="fixed right-4 top-20 z-50 w-64 rounded-xl border border-border bg-popover p-3 shadow-xl"><div className="flex items-center gap-3 border-b border-border p-2"><div className="grid size-9 place-items-center rounded-full bg-secondary"><UserRound size={18}/></div><div><p className="text-sm font-bold">João Vitor</p><p className="text-xs text-muted-foreground">Responsável</p></div></div><Button variant="ghost" className="mt-2 w-full justify-start" onClick={() => setView("child")}><Smartphone size={16}/>Abrir visão da criança</Button></div>}

      <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-8 sm:py-10">
        <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="mb-2 text-sm font-semibold text-primary">Sexta-feira, 2 de outubro</p><h1 className="font-display text-3xl font-bold sm:text-4xl">Olá, João. Está tudo bem por aqui.</h1><p className="mt-2 max-w-2xl text-muted-foreground">Miguel chegou à escola e o celular está conectado. Veja os detalhes do dia.</p></div>
          <Button onClick={() => notify("Código 847 291 copiado para pareamento")}><Plus size={17}/>Adicionar dispositivo</Button>
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <StatusCard icon={ShieldCheck} label="Status de proteção" value="Protegido" detail="Todas as permissões ativas" tone="green" />
          <StatusCard icon={MapPin} label="Localização atual" value="Colégio Horizonte" detail="Atualizado há 2 min" tone="coral" />
          <StatusCard icon={BatteryMedium} label="Celular do Miguel" value="68% de bateria" detail="Online agora" tone="gold" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between p-5 sm:p-6"><div><h2 className="font-display text-xl font-bold">Onde está Miguel</h2><p className="mt-1 text-sm text-muted-foreground">Trajeto de hoje · casa para escola</p></div><Button variant="outline" size="sm" onClick={() => notify("Localização atualizada agora")}><RefreshCw size={15}/>Atualizar</Button></div>
            <div className="relative aspect-[16/9] min-h-72 overflow-hidden border-y border-border bg-muted"><img src={mapImage} alt="Mapa ilustrado mostrando o trajeto entre casa e escola" className="h-full w-full object-cover" width={1408} height={912}/><div className="absolute bottom-4 left-4 rounded-lg border border-border bg-background/95 px-4 py-3 shadow-lg backdrop-blur"><div className="flex items-center gap-2 text-sm font-bold"><Navigation size={16} className="text-primary"/>Chegou há 14 minutos</div><p className="mt-1 text-xs text-muted-foreground">Av. das Palmeiras, 220</p></div></div>
            <div className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0"><MiniStat label="Última atualização" value="12:07"/><MiniStat label="Precisão" value="8 metros"/><MiniStat label="Próxima rotina" value="Saída · 17:30"/></div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-display text-xl font-bold">Uso hoje</h2><p className="mt-1 text-sm text-muted-foreground">2h 51min de tela</p></div><div className="grid size-12 place-items-center rounded-full border-4 border-primary text-xs font-bold">71%</div></div><div className="space-y-4">{apps.map(app => <div key={app.name} className="grid grid-cols-[36px_1fr_auto] items-center gap-3"><div className="grid size-9 place-items-center rounded-lg bg-secondary text-[10px] font-black">{app.icon}</div><div><div className="mb-1.5 flex justify-between text-sm"><span className="font-semibold">{app.name}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${app.tone}`} style={{width:`${app.percent}%`}}/></div></div><span className="text-xs font-semibold text-muted-foreground">{app.time}</span></div>)}</div></div>
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6"><h2 className="font-display text-xl font-bold">Ações remotas</h2><p className="mt-1 text-sm text-muted-foreground">Miguel precisa aceitar no aparelho.</p><div className="mt-5 grid grid-cols-2 gap-3"><ActionButton icon={Camera} label="Pedir foto" onClick={() => {setConsent("camera"); setView("child");}}/><ActionButton icon={Eye} label="Ver tela" onClick={() => {setConsent("screen"); setView("child");}}/><ActionButton icon={MessageCircle} label="Enviar recado" onClick={() => notify("Recado enviado para Miguel")}/><ActionButton icon={Zap} label="Tocar alerta" onClick={() => notify("Alerta sonoro enviado")}/></div></div>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6"><div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="font-display text-xl font-bold">Linha do tempo</h2><p className="mt-1 text-sm text-muted-foreground">Acontecimentos recentes do dispositivo</p></div><Button variant="ghost" size="sm">Ver relatório completo <ChevronDown size={15}/></Button></div><div className="grid gap-4 lg:grid-cols-3"><TimelineItem icon={MapPin} time="11:53" title="Chegou ao Colégio Horizonte" text="Rotina Escola reconhecida automaticamente."/><TimelineItem icon={Smartphone} time="10:42" title="Limite do YouTube avisado" text="Miguel encerrou o aplicativo após o alerta."/><TimelineItem icon={ShieldCheck} time="08:04" title="Proteção verificada" text="Todas as permissões continuam ativas."/></div></section>
      </main>

      {toast && <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-foreground px-4 py-3 text-sm font-semibold text-background shadow-xl"><Check size={16}/>{toast}</div>}
    </div>
  );
}

function StatusCard({icon:Icon,label,value,detail,tone}:{icon:typeof Home;label:string;value:string;detail:string;tone:"green"|"coral"|"gold"}) {
  const tones = { green:"bg-safe/15 text-safe", coral:"bg-primary/15 text-primary", gold:"bg-warning/20 text-warning-foreground" };
  return <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm"><div className={`grid size-12 shrink-0 place-items-center rounded-xl ${tones[tone]}`}><Icon size={23}/></div><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</p><p className="mt-1 truncate font-display text-lg font-bold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div></div>;
}

function MiniStat({label,value}:{label:string;value:string}) { return <div className="p-4 text-center"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-sm font-bold">{value}</p></div>; }
function ActionButton({icon:Icon,label,onClick}:{icon:typeof Camera;label:string;onClick:()=>void}) { return <Button variant="secondary" className="h-20 flex-col" onClick={onClick}><Icon size={21}/><span>{label}</span></Button>; }
function TimelineItem({icon:Icon,time,title,text}:{icon:typeof MapPin;time:string;title:string;text:string}) { return <div className="flex gap-3 border-l-2 border-primary/30 pl-4"><div className="mt-0.5 text-primary"><Icon size={18}/></div><div><p className="text-xs font-bold text-primary">{time}</p><p className="mt-1 text-sm font-bold">{title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p></div></div>; }

function ChildView({onBack,onConsent,consent}:{onBack:()=>void;onConsent:(value:"camera"|"screen"|null)=>void;consent:"camera"|"screen"|null}) {
  const [shared, setShared] = useState(false);
  return <div className="flex min-h-screen items-center justify-center bg-child-shell p-4 sm:p-8"><div className="relative flex min-h-[760px] w-full max-w-sm flex-col overflow-hidden rounded-[2rem] border-[8px] border-foreground bg-background shadow-2xl"><div className="mx-auto mt-2 h-5 w-24 rounded-full bg-foreground"/><div className="flex items-center justify-between px-5 py-5"><div className="flex items-center gap-2"><div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"><HeartHandshake size={17}/></div><span className="font-display font-bold">ninho</span></div><div className="flex items-center gap-1 text-xs font-bold text-safe"><span className="size-2 rounded-full bg-safe"/>Proteção ativa</div></div><div className="flex flex-1 flex-col px-5 pb-6"><div className="rounded-xl bg-secondary p-5 text-center"><div className="mx-auto grid size-16 place-items-center rounded-full bg-safe/15 text-safe"><ShieldCheck size={32}/></div><h1 className="mt-3 font-display text-xl font-bold">Tudo certo, Miguel</h1><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Sua família sabe que você está seguro. O Ninho nunca usa câmera ou tela sem avisar.</p></div><div className="my-6"><p className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Seu dia</p><div className="space-y-3"><ChildRow icon={MapPin} title="Localização compartilhada" detail="Colégio Horizonte · agora"/><ChildRow icon={Clock3} title="Tempo de tela" detail="2h 51min hoje"/><ChildRow icon={BatteryMedium} title="Bateria" detail="68% · carregador não conectado"/></div></div><div className="mt-auto rounded-xl border border-border bg-card p-4"><div className="flex items-start gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 text-primary"><UserRound size={18}/></div><div><p className="text-sm font-bold">João, seu responsável</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Pode ver sua localização e seu tempo de uso. Você será avisado sempre que uma ação precisar de consentimento.</p></div></div></div><Button variant="ghost" className="mt-4" onClick={onBack}>Voltar ao painel do responsável</Button></div>{consent && <div className="absolute inset-0 z-20 flex items-end bg-overlay p-4"><div className="w-full rounded-2xl bg-background p-5 shadow-2xl"><div className="flex items-start justify-between"><div className="grid size-12 place-items-center rounded-xl bg-primary/15 text-primary">{consent === "camera" ? <Camera/> : <Eye/>}</div><Button variant="ghost" size="icon" aria-label="Fechar" onClick={() => onConsent(null)}><X size={19}/></Button></div><h2 className="mt-4 font-display text-xl font-bold">Seu responsável pediu para {consent === "camera" ? "tirar uma foto" : "compartilhar sua tela"}</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Nada será capturado sem sua escolha. O compartilhamento termina automaticamente em {consent === "camera" ? "uma foto" : "5 minutos"}.</p>{shared ? <div className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-safe/15 p-4 font-bold text-safe"><Check size={18}/>Permissão concedida</div> : <div className="mt-5 grid grid-cols-2 gap-3"><Button variant="outline" onClick={() => onConsent(null)}>Agora não</Button><Button onClick={() => setShared(true)}>Permitir</Button></div>}</div></div>}</div></div>;
}

function ChildRow({icon:Icon,title,detail}:{icon:typeof MapPin;title:string;detail:string}) { return <div className="flex items-center gap-3 rounded-lg border border-border p-3"><div className="grid size-9 place-items-center rounded-lg bg-secondary text-secondary-foreground"><Icon size={17}/></div><div><p className="text-sm font-bold">{title}</p><p className="mt-0.5 text-xs text-muted-foreground">{detail}</p></div></div>; }