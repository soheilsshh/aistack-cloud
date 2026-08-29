import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Compass,
  Headphones,
  Layers3,
  LifeBuoy,
  Loader2,
  LogIn,
  Moon,
  Network,
  Phone,
  Plus,
  Sparkles,
  Sun,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

type Product = {
  id?: number;
  slug: string;
  name: string;
  eyebrow: string;
  description: string;
  features: string;
  priceCents: number;
  billingPeriod: string;
  accent: string;
  featured: number;
};

type FormState = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  company: string;
  message: string;
};

const initialForm: FormState = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  company: "",
  message: "",
};

const accentStyles: Record<string, { tint: string; icon: string; line: string }> = {
  blue: { tint: "bg-sky-50 dark:bg-sky-950/35", icon: "bg-sky-100 text-sky-700 dark:bg-sky-900/70 dark:text-sky-200", line: "bg-sky-400" },
  violet: { tint: "bg-violet-50 dark:bg-violet-950/35", icon: "bg-violet-100 text-violet-700 dark:bg-violet-900/70 dark:text-violet-200", line: "bg-violet-400" },
  orange: { tint: "bg-orange-50 dark:bg-orange-950/35", icon: "bg-orange-100 text-orange-700 dark:bg-orange-900/70 dark:text-orange-200", line: "bg-orange-400" },
};

function BrandMark() {
  return (
    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-foreground text-background shadow-sm" aria-hidden="true">
      <span className="absolute left-[8px] top-[9px] h-1.5 w-1.5 rounded-full bg-background" />
      <span className="absolute right-[8px] top-[9px] h-1.5 w-1.5 rounded-full bg-background" />
      <span className="absolute bottom-[8px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-background" />
      <span className="absolute left-[11px] top-[12px] h-3 w-3 rotate-45 border-b border-r border-background/60" />
    </span>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
      className="h-9 w-9 rounded-full bg-background/70"
    >
      {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  );
}

function WorkflowPreview() {
  return (
    <div className="relative mx-auto h-[360px] w-full max-w-[520px] overflow-hidden rounded-[2rem] border border-border/80 bg-card/80 p-5 paper-grid soft-shadow sm:h-[420px]">
      <div className="absolute left-5 top-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
        <Workflow className="h-3.5 w-3.5 text-primary" />
        subscription flow / live
      </div>
      <div className="absolute inset-x-5 top-16 bottom-5 rounded-[1.4rem] border border-border/80 bg-background/65" />
      <div className="node-line left-[27%] top-[45%] w-[24%] rotate-[14deg]" />
      <div className="node-line left-[51%] top-[46%] w-[24%] rotate-[-14deg]" />
      <div className="node-line left-[35%] top-[65%] w-[18%] rotate-[-22deg]" />
      <div className="node-line left-[58%] top-[65%] w-[16%] rotate-[22deg]" />
      <div className="absolute left-[9%] top-[32%] flex h-16 w-16 flex-col items-center justify-center rounded-2xl border border-border bg-card node-shadow float-slow">
        <Sparkles className="h-5 w-5 text-violet-600" />
        <span className="mt-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">intent</span>
      </div>
      <div className="absolute left-[44%] top-[34%] flex h-[76px] w-[76px] flex-col items-center justify-center rounded-2xl border-2 border-primary/50 bg-card selection-ring">
        <Layers3 className="h-6 w-6 text-primary" />
        <span className="mt-1 text-[9px] font-bold uppercase tracking-wider text-primary">choose</span>
      </div>
      <div className="absolute right-[8%] top-[31%] flex h-16 w-16 flex-col items-center justify-center rounded-2xl border border-border bg-card node-shadow">
        <Phone className="h-5 w-5 text-orange-600" />
        <span className="mt-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">follow-up</span>
      </div>
      <div className="absolute left-[18%] bottom-[18%] flex h-14 w-14 flex-col items-center justify-center rounded-2xl border border-border bg-card node-shadow">
        <CircleDot className="h-5 w-5 text-sky-600" />
        <span className="mt-1 text-[8px] font-bold uppercase tracking-wider text-muted-foreground">ticket</span>
      </div>
      <div className="absolute right-[17%] bottom-[17%] flex h-14 w-14 flex-col items-center justify-center rounded-2xl border border-border bg-card node-shadow">
        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        <span className="mt-1 text-[8px] font-bold uppercase tracking-wider text-muted-foreground">ready</span>
      </div>
      <div className="absolute bottom-5 left-7 right-7 flex items-center justify-between border-t border-border/80 pt-3 text-[10px] font-semibold text-muted-foreground">
        <span>05 nodes</span>
        <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> all systems go</span>
      </div>
    </div>
  );
}

function ProductCard({ product, onSelect }: { product: Product; onSelect: (product: Product) => void }) {
  const accent = accentStyles[product.accent] ?? accentStyles.violet;
  const features = product.features.split("|").filter(Boolean);
  return (
    <article className={`group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-xl ${product.featured ? "selection-ring" : ""}`}>
      {product.featured ? <div className="absolute right-5 top-5"><Badge className="rounded-full bg-foreground px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-background">Most chosen</Badge></div> : null}
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accent.icon}`}><Zap className="h-5 w-5" /></div>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{product.eyebrow}</span>
      </div>
      <h3 className="display-font mt-7 text-2xl font-bold tracking-tight">{product.name}</h3>
      <p className="mt-3 min-h-[72px] text-sm leading-6 text-muted-foreground">{product.description}</p>
      <div className={`mt-6 rounded-2xl p-4 ${accent.tint}`}>
        <div className="flex items-end gap-2">
          <span className="display-font text-4xl font-bold tracking-tight">${(product.priceCents / 100).toFixed(0)}</span>
          <span className="mb-1.5 text-xs font-semibold text-muted-foreground">/ {product.billingPeriod}</span>
        </div>
      </div>
      <div className="my-6 h-px bg-border" />
      <ul className="space-y-3 text-sm">
        {features.map(feature => <li key={feature} className="flex items-start gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><span>{feature}</span></li>)}
      </ul>
      <Button onClick={() => onSelect(product)} className="mt-8 h-11 w-full justify-between rounded-xl bg-foreground px-4 text-background hover:bg-foreground/90">
        Request {product.name}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Button>
    </article>
  );
}

function PurchaseDialog({ product, open, onOpenChange }: { product: Product | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user, isAuthenticated } = useAuth();
  const [form, setForm] = useState<FormState>(initialForm);
  const request = trpc.tickets.createPurchaseRequest.useMutation();

  useEffect(() => {
    setForm(current => ({
      ...current,
      customerName: current.customerName || user?.name || "",
      customerEmail: current.customerEmail || user?.email || "",
    }));
  }, [user]);

  useEffect(() => {
    if (!open) setForm({ ...initialForm, customerName: user?.name || "", customerEmail: user?.email || "" });
  }, [open, user]);

  const update = (key: keyof FormState, value: string) => setForm(current => ({ ...current, [key]: value }));

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!product) return;
    if (!isAuthenticated) {
      startLogin();
      return;
    }
    request.mutate({ productSlug: product.slug, ...form, company: form.company || undefined, message: form.message || undefined }, {
      onSuccess: result => {
        toast.success(`Request received${result?.ticketCode ? ` · ${result.ticketCode}` : ""}`, { description: "An AIStack specialist will follow up with you shortly." });
        onOpenChange(false);
      },
      onError: error => toast.error("We couldn't submit that request", { description: error.message }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[1.5rem] sm:max-w-[560px]">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary"><CircleDot className="h-3.5 w-3.5" /> new purchase request</div>
          <DialogTitle className="display-font text-2xl">Let&apos;s get {product?.name} moving.</DialogTitle>
          <DialogDescription>Share the best way to reach you. This creates a private support ticket for our team to follow up.</DialogDescription>
        </DialogHeader>
        {!isAuthenticated ? (
          <div className="my-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm leading-6">
            Please sign in before submitting your request so we can keep your ticket connected to your account.
            <Button type="button" onClick={() => startLogin()} variant="link" className="h-auto px-1 font-semibold">Sign in <LogIn className="ml-1 h-3.5 w-3.5" /></Button>
          </div>
        ) : null}
        <form onSubmit={submit} className="space-y-5">
          <div className="rounded-2xl border border-border bg-muted/35 p-4">
            <div className="flex items-center justify-between gap-4"><span className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Selected lane</span><span className="display-font font-bold">{product?.name ?? "—"}</span></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="customerName">Full name</Label><Input id="customerName" required value={form.customerName} onChange={event => update("customerName", event.target.value)} placeholder="Ada Lovelace" /></div>
            <div className="space-y-2"><Label htmlFor="customerEmail">Work email</Label><Input id="customerEmail" type="email" required value={form.customerEmail} onChange={event => update("customerEmail", event.target.value)} placeholder="ada@company.com" /></div>
            <div className="space-y-2"><Label htmlFor="customerPhone">Phone number</Label><Input id="customerPhone" type="tel" required value={form.customerPhone} onChange={event => update("customerPhone", event.target.value)} placeholder="+1 555 000 0000" /></div>
            <div className="space-y-2"><Label htmlFor="company">Company <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="company" value={form.company} onChange={event => update("company", event.target.value)} placeholder="Acme Studio" /></div>
          </div>
          <div className="space-y-2"><Label htmlFor="message">What are you hoping to build? <span className="font-normal text-muted-foreground">(optional)</span></Label><Textarea id="message" value={form.message} onChange={event => update("message", event.target.value)} placeholder="A little context helps us make the first call useful." className="min-h-24 resize-y" /></div>
          <DialogFooter className="gap-2 sm:justify-between">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!isAuthenticated || request.isPending} className="rounded-xl bg-foreground text-background hover:bg-foreground/90">
              {request.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
              {request.isPending ? "Creating ticket…" : "Create support ticket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { data: products, isLoading, isError } = trpc.products.list.useQuery();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <header className="nav-blur sticky top-0 z-40 border-b border-border/70">
        <div className="container flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
          <a href="#top" className="flex items-center gap-3" aria-label="AIStack Cloud home"><BrandMark /><span className="display-font text-sm font-bold tracking-tight">AIStack <span className="text-primary">Cloud</span></span></a>
          <nav aria-label="Primary navigation" className="order-3 flex w-full items-center gap-4 text-xs font-semibold text-muted-foreground sm:order-none sm:w-auto sm:gap-6">
            <a href="#plans" className="transition-colors hover:text-foreground">Plans</a>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">How it works</a>
            <a href="#support" className="transition-colors hover:text-foreground">Support</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user?.role === "admin" ? <Link href="/admin"><Button variant="outline" size="sm" className="hidden rounded-full sm:inline-flex">Admin desk</Button></Link> : null}
            {isAuthenticated ? <span className="hidden max-w-[120px] truncate text-xs font-semibold text-muted-foreground md:inline">Hi, {user?.name?.split(" ")[0] || "there"}</span> : <Button onClick={() => startLogin()} variant="outline" size="sm" className="rounded-full"><LogIn className="mr-1.5 h-3.5 w-3.5" />Sign in</Button>}
          </div>
        </div>
      </header>

      <main id="top">
        <section className="relative isolate overflow-hidden border-b border-border/70">
          <div className="absolute inset-0 workflow-grid opacity-60" />
          <div className="absolute -right-36 top-8 h-80 w-80 rounded-full bg-violet-300/20 blur-3xl dark:bg-violet-900/20" />
          <div className="container relative grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-8 lg:py-24">
            <div className="max-w-2xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-card/75 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.19em] text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> a calmer way to scale with AI</div>
              <h1 className="display-font max-w-xl text-5xl font-bold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">Your next <span className="text-primary">unfair advantage</span> is a few nodes away.</h1>
              <p className="mt-7 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">Choose the AI subscription that fits your ambition. We pair powerful access with a human follow-up, so you can move from curious to capable without the maze.</p>
              <div className="mt-9 flex flex-wrap items-center gap-3"><a href="#plans"><Button size="lg" className="h-12 rounded-xl bg-foreground px-5 text-background hover:bg-foreground/90">Explore subscriptions <ArrowRight className="ml-2 h-4 w-4" /></Button></a><a href="#how-it-works" className="group inline-flex items-center gap-2 px-2 text-sm font-bold">See how it works <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></a></div>
              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-border/70 pt-5 text-xs font-semibold text-muted-foreground"><span className="flex items-center gap-2"><LifeBuoy className="h-4 w-4 text-primary" /> Human support included</span><span className="flex items-center gap-2"><Network className="h-4 w-4 text-primary" /> Built to connect</span></div>
            </div>
            <WorkflowPreview />
          </div>
        </section>

        <section id="plans" className="container py-20 sm:py-24">
          <div className="flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[0.23em] text-primary">01 / choose your lane</p><h2 className="display-font mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Simple plans. Serious leverage.</h2></div><p className="max-w-sm text-sm leading-6 text-muted-foreground">Every plan starts with a conversation. Tell us where you want to go, and we&apos;ll help you pick the right runway.</p></div>
          {isLoading ? <div className="grid gap-5 pt-10 md:grid-cols-3"><div className="h-[460px] animate-pulse rounded-[1.5rem] bg-muted" /><div className="h-[460px] animate-pulse rounded-[1.5rem] bg-muted" /><div className="h-[460px] animate-pulse rounded-[1.5rem] bg-muted" /></div> : isError ? <div className="pt-10 text-sm text-destructive">We couldn&apos;t load the subscription catalog. Please refresh and try again.</div> : <div className="grid gap-5 pt-10 md:grid-cols-3">{(products as Product[] | undefined)?.map(product => <ProductCard key={product.slug} product={product} onSelect={setSelectedProduct} />)}</div>}
        </section>

        <section id="how-it-works" className="border-y border-border/70 bg-secondary/45">
          <div className="container grid gap-12 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-center sm:py-24">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.23em] text-primary">02 / the handoff</p><h2 className="display-font mt-3 max-w-md text-3xl font-bold tracking-tight sm:text-4xl">A workflow that ends in a human conversation.</h2><p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">No opaque checkout maze. You submit a request, it lands in a private support queue, and a specialist follows up with the context they need.</p><a href="#plans" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-primary">Find your plan <ArrowRight className="h-4 w-4" /></a></div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[{ n: "01", icon: Compass, title: "Choose", copy: "Select the subscription that matches your current build stage." }, { n: "02", icon: Plus, title: "Request", copy: "Share a few details and create a trackable support ticket." }, { n: "03", icon: Headphones, title: "Connect", copy: "Our team follows up by phone or email to make it real." }].map(step => <div key={step.n} className="rounded-2xl border border-border bg-card p-5 node-shadow"><div className="flex items-center justify-between"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><step.icon className="h-4 w-4" /></div><span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground">{step.n}</span></div><h3 className="mt-8 font-bold">{step.title}</h3><p className="mt-2 text-xs leading-5 text-muted-foreground">{step.copy}</p></div>)}
            </div>
          </div>
        </section>

        <section id="support" className="container py-16 sm:py-20"><div className="relative overflow-hidden rounded-[1.75rem] bg-foreground px-6 py-10 text-background sm:px-10 sm:py-12"><div className="absolute right-8 top-8 opacity-20"><Workflow className="h-28 w-28" /></div><p className="relative text-[10px] font-bold uppercase tracking-[0.23em] text-background/60">03 / keep the loop open</p><div className="relative mt-4 flex flex-col justify-between gap-8 sm:flex-row sm:items-end"><div><h2 className="display-font max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">Not sure where to start?</h2><p className="mt-3 max-w-lg text-sm leading-6 text-background/70">Send a request anyway. We&apos;ll help map your next best step before you commit to a subscription.</p></div><a href="#plans"><Button variant="secondary" className="h-11 shrink-0 rounded-xl">Talk to a specialist <ArrowRight className="ml-2 h-4 w-4" /></Button></a></div></div></section>
      </main>

      <footer className="border-t border-border/70"><div className="container flex flex-col justify-between gap-4 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center"><div className="flex items-center gap-2 font-semibold text-foreground"><BrandMark /><span>AIStack Cloud</span></div><span>AI subscriptions, connected with care.</span></div></footer>
      <PurchaseDialog product={selectedProduct} open={Boolean(selectedProduct)} onOpenChange={open => { if (!open) setSelectedProduct(null); }} />
    </div>
  );
}
