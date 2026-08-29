import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  Loader2,
  Moon,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sun,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const statusLabels: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  in_progress: "In progress",
  completed: "Completed",
  closed: "Closed",
};

const statusStyles: Record<string, string> = {
  new: "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-200",
  contacted: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-200",
  in_progress: "bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-200",
  completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200",
  closed: "bg-muted text-muted-foreground",
};

type Ticket = {
  id: number;
  ticketCode: string;
  productName: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  company: string | null;
  message: string | null;
  status: "new" | "contacted" | "in_progress" | "completed" | "closed";
  followUpNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function ThemeButton() {
  const { theme, toggleTheme } = useTheme();
  return <Button type="button" variant="outline" size="icon" onClick={toggleTheme} aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"} className="h-9 w-9 rounded-full">{theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}</Button>;
}

function StatusBadge({ status }: { status: string }) {
  return <Badge className={`rounded-full border-0 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${statusStyles[status] ?? statusStyles.closed}`}>{statusLabels[status] ?? status}</Badge>;
}

function initials(name: string) {
  return name.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase();
}

export default function Admin() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: tickets, isLoading, isError, refetch } = trpc.adminTickets.list.useQuery(undefined, { enabled: user?.role === "admin" });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [status, setStatus] = useState<Ticket["status"]>("new");
  const [notes, setNotes] = useState("");
  const updateTicket = trpc.adminTickets.update.useMutation();
  const ticketList = (tickets ?? []) as Ticket[];
  const selectedTicket = useMemo(() => ticketList.find(ticket => ticket.id === selectedId) ?? ticketList[0], [ticketList, selectedId]);

  useEffect(() => {
    if (!loading && user && user.role !== "admin") setLocation("/");
  }, [loading, user, setLocation]);

  useEffect(() => {
    if (selectedTicket) {
      setSelectedId(selectedTicket.id);
      setStatus(selectedTicket.status);
      setNotes(selectedTicket.followUpNotes ?? "");
    }
  }, [selectedTicket]);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>;
  if (!user) return <div className="flex min-h-screen items-center justify-center p-6"><div className="max-w-md text-center"><ShieldCheck className="mx-auto h-10 w-10 text-primary" /><h1 className="display-font mt-5 text-3xl font-bold">Admin access is private.</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Sign in with an admin account to open the support desk.</p><Button onClick={() => startLogin()} className="mt-7 rounded-xl bg-foreground text-background">Sign in</Button></div></div>;
  if (user.role !== "admin") return null;

  const newCount = ticketList.filter(ticket => ticket.status === "new").length;
  const activeCount = ticketList.filter(ticket => ticket.status === "contacted" || ticket.status === "in_progress").length;
  const completedCount = ticketList.filter(ticket => ticket.status === "completed" || ticket.status === "closed").length;

  const saveTicket = () => {
    if (!selectedTicket) return;
    updateTicket.mutate({ ticketId: selectedTicket.id, status, followUpNotes: notes.trim() || null }, {
      onSuccess: () => {
        toast.success("Ticket updated", { description: `${selectedTicket.ticketCode} is now ${statusLabels[status].toLowerCase()}.` });
        void refetch();
      },
      onError: error => toast.error("Could not update ticket", { description: error.message }),
    });
  };

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-2rem)] bg-background">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-7 flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-start">
            <div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-primary"><ClipboardList className="h-3.5 w-3.5" /> operations / support desk</div><h1 className="display-font mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Purchase requests</h1><p className="mt-2 text-sm text-muted-foreground">A clear queue for turning interest into a useful human follow-up.</p></div>
            <div className="flex items-center gap-2"><Link href="/"><Button variant="outline" size="sm" className="rounded-full"><ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Storefront</Button></Link><ThemeButton /><Button type="button" onClick={() => void refetch()} variant="outline" size="icon" className="h-9 w-9 rounded-full" aria-label="Refresh tickets"><RefreshCw className="h-4 w-4" /></Button></div>
          </div>

          <div className="mb-7 grid gap-3 sm:grid-cols-3">
            {[{ label: "Needs first touch", value: newCount, icon: ClipboardList, tone: "text-orange-600 bg-orange-100 dark:bg-orange-950/50" }, { label: "In motion", value: activeCount, icon: RefreshCw, tone: "text-violet-600 bg-violet-100 dark:bg-violet-950/50" }, { label: "Resolved", value: completedCount, icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950/50" }].map(stat => <div key={stat.label} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4"><div><p className="text-xs font-semibold text-muted-foreground">{stat.label}</p><p className="display-font mt-1 text-2xl font-bold">{stat.value}</p></div><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.tone}`}><stat.icon className="h-4 w-4" /></div></div>)}
          </div>

          {isLoading ? <div className="rounded-2xl border border-border bg-card p-12 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" /></div> : isError ? <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center text-sm text-destructive">We couldn&apos;t load the support queue. Try refreshing.</div> : <div className="grid gap-5 xl:grid-cols-[minmax(300px,0.78fr)_minmax(420px,1.22fr)]">
            <section className="min-w-0 rounded-2xl border border-border bg-card p-3 sm:p-4">
              <div className="flex items-center justify-between px-2 pb-3"><div><h2 className="font-bold">Incoming queue</h2><p className="mt-1 text-xs text-muted-foreground">{ticketList.length} total requests</p></div><span className="h-2 w-2 rounded-full bg-emerald-500" title="Queue is live" /></div>
              <div className="space-y-2">
                {ticketList.length === 0 ? <div className="rounded-xl border border-dashed border-border p-8 text-center"><ClipboardList className="mx-auto h-6 w-6 text-muted-foreground" /><p className="mt-3 text-sm font-semibold">No purchase requests yet</p><p className="mt-1 text-xs text-muted-foreground">New customer tickets will appear here.</p></div> : ticketList.map(ticket => <button key={ticket.id} type="button" onClick={() => setSelectedId(ticket.id)} className={`w-full rounded-xl border p-3 text-left transition-colors ${selectedTicket?.id === ticket.id ? "border-primary/50 bg-primary/5" : "border-transparent hover:border-border hover:bg-muted/50"}`}><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-foreground text-xs font-bold text-background">{initials(ticket.customerName)}</span><div className="min-w-0"><p className="truncate text-sm font-bold">{ticket.customerName}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{ticket.productName ?? "Subscription"} · {ticket.ticketCode}</p></div></div><StatusBadge status={ticket.status} /></div><div className="mt-3 flex items-center justify-between text-[10px] font-semibold text-muted-foreground"><span>{ticket.company || "Independent"}</span><span>{new Date(ticket.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span></div></button>)}
              </div>
            </section>

            <section className="min-w-0 rounded-2xl border border-border bg-card p-5 sm:p-7">
              {!selectedTicket ? <div className="flex min-h-[360px] flex-col items-center justify-center text-center"><UserRound className="h-8 w-8 text-muted-foreground" /><h2 className="mt-4 font-bold">Select a ticket</h2><p className="mt-1 text-sm text-muted-foreground">Choose a request from the queue to review the details.</p></div> : <>
                <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{selectedTicket.ticketCode}</span><StatusBadge status={selectedTicket.status} /></div><h2 className="display-font mt-3 text-2xl font-bold tracking-tight">{selectedTicket.productName ?? "Subscription request"}</h2><p className="mt-1 text-sm text-muted-foreground">Received {new Date(selectedTicket.createdAt).toLocaleString()}</p></div><div className="flex items-center gap-2"><a href={`tel:${selectedTicket.customerPhone}`}><Button size="sm" className="rounded-xl bg-foreground text-background hover:bg-foreground/90"><Phone className="mr-1.5 h-3.5 w-3.5" /> Call customer</Button></a><a href={`mailto:${selectedTicket.customerEmail}`}><Button size="icon" variant="outline" className="h-9 w-9 rounded-xl" aria-label="Email customer"><ExternalLink className="h-4 w-4" /></Button></a></div></div>
                <div className="grid gap-5 py-6 sm:grid-cols-2"><div className="rounded-2xl bg-muted/45 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Customer</p><p className="mt-3 font-bold">{selectedTicket.customerName}</p><a href={`mailto:${selectedTicket.customerEmail}`} className="mt-1 block truncate text-sm text-primary hover:underline">{selectedTicket.customerEmail}</a><a href={`tel:${selectedTicket.customerPhone}`} className="mt-1 block text-sm text-primary hover:underline">{selectedTicket.customerPhone}</a></div><div className="rounded-2xl bg-muted/45 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Context</p><p className="mt-3 text-sm font-semibold">{selectedTicket.company || "No company provided"}</p><p className="mt-1 text-sm leading-5 text-muted-foreground">{selectedTicket.message || "No additional message was provided."}</p></div></div>
                <Separator />
                <div className="space-y-5 pt-6"><div className="grid gap-4 sm:grid-cols-[0.8fr_1.2fr] sm:items-end"><div className="space-y-2"><label htmlFor="status" className="text-sm font-semibold">Ticket status</label><Select value={status} onValueChange={value => setStatus(value as Ticket["status"])}><SelectTrigger id="status" className="rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="new">New</SelectItem><SelectItem value="contacted">Contacted</SelectItem><SelectItem value="in_progress">In progress</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent></Select></div><div className="rounded-xl border border-primary/15 bg-primary/5 p-3 text-xs leading-5 text-muted-foreground"><span className="font-bold text-foreground">Next best action:</span> call {selectedTicket.customerName.split(" ")[0]} and confirm which workspace they want to activate.</div></div><div className="space-y-2"><label htmlFor="notes" className="text-sm font-semibold">Follow-up notes</label><Textarea id="notes" value={notes} onChange={event => setNotes(event.target.value)} placeholder="Log call outcome, owner, next step, or activation details…" className="min-h-28 resize-y rounded-xl" /></div><div className="flex justify-end"><Button type="button" onClick={saveTicket} disabled={updateTicket.isPending} className="rounded-xl bg-foreground text-background hover:bg-foreground/90">{updateTicket.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}Save ticket update</Button></div></div>
              </>}
            </section>
          </div>}
        </div>
      </div>
    </DashboardLayout>
  );
}
