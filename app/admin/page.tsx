"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Users,
  GraduationCap,
  Baby,
  UserCheck,
  TrendingUp,
  Download,
  MessageSquare,
  QrCode,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  RotateCcw,
  Pencil,
  Trash2,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Registration {
  id: string;
  fullName: string;
  group: string;
  district: string;
  status: string;
  phone: string;
  gender: string;
  email?: string | null;
  createdAt: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const GROUP_OPTIONS = ["Youth", "Adult", "Campus", "Children"];
const DISTRICT_OPTIONS = [
  "Sefwi Asawinso", "Sefwi Bodi", "Sefwi Juaboso",
  "Sefwi Boako", "Sefwi Dwenase", "Sefwi Wiawso",
  "Mile 3", "Sefwi Nsawora",
];
const STATUS_OPTIONS = ["Member", "Visitor"];
const GENDER_OPTIONS = ["Male", "Female"];

const EMPTY_FORM = {
  fullName: "", group: "", district: "",
  status: "", gender: "", phone: "", email: "",
};

const PAGE_SIZE = 10;

// ─── Group card config ────────────────────────────────────────────────────────

const GROUP_CARDS = [
  { key: "youth",    label: "Youth",    Icon: Users,         bg: "bg-blue-100",   text: "text-blue-600"   },
  { key: "adult",    label: "Adults",   Icon: UserCheck,     bg: "bg-teal-100",   text: "text-teal-600"   },
  { key: "campus",   label: "Campus",   Icon: GraduationCap, bg: "bg-indigo-100", text: "text-indigo-600" },
  { key: "children", label: "Children", Icon: Baby,          bg: "bg-orange-100", text: "text-orange-500" },
  { key: "visitors", label: "Visitors", Icon: Users,         bg: "bg-violet-100", text: "text-violet-600" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

// ─── Edit Dialog ────────────────────────────────────────────────────────────

function EditDialog({
  registration,
  onSuccess,
}: {
  registration: Registration;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: registration.fullName,
    group: registration.group.charAt(0).toUpperCase() + registration.group.slice(1).toLowerCase(),
    district: registration.district,
    status: registration.status.charAt(0).toUpperCase() + registration.status.slice(1).toLowerCase(),
    gender: registration.gender.charAt(0).toUpperCase() + registration.gender.slice(1).toLowerCase(),
    phone: registration.phone.startsWith("+233")
      ? "0" + registration.phone.slice(4)
      : registration.phone,
    email: registration.email ?? "",
  });
  const [submitting, setSubmitting] = useState(false);

  const isValid =
    form.fullName.trim() && form.group && form.district &&
    form.status && form.gender && form.phone.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/register/${registration.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          group: form.group.toLowerCase(),
          status: form.status.toLowerCase(),
          gender: form.gender.toLowerCase(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`${form.fullName} updated successfully.`);
        setOpen(false);
        onSuccess();
      } else {
        toast.error(data.error ?? "Update failed. Please try again.");
      }
    } catch {
      toast.error("Network error. Check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost" size="icon"
          className="h-7 w-7 text-slate-400 hover:text-blue-600"
          aria-label="Edit"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Edit Registration</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 pt-2">
          <div className="grid gap-1.5">
            <Label htmlFor="edit-name">Full Name</Label>
            <Input id="edit-name" placeholder="e.g. Kwame Asante" value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })} autoComplete="off" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Group</Label>
              <Select value={form.group} onValueChange={(v) => setForm({ ...form, group: v })}>
                <SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger>
                <SelectContent>{GROUP_OPTIONS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>District</Label>
            <Select value={form.district} onValueChange={(v) => setForm({ ...form, district: v })}>
              <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
              <SelectContent>{DISTRICT_OPTIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
                <SelectContent>{GENDER_OPTIONS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input id="edit-phone" type="tel" placeholder="0244123456" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="off" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="edit-email">
              Email <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input id="edit-email" type="email" placeholder="email@example.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="off" />
          </div>
          <Button type="submit" disabled={!isValid || submitting}
            className="mt-1 bg-[#133358] hover:bg-[#0f2847] text-white">
            {submitting ? "Saving…" : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────

function DeleteDialog({
  registration,
  onSuccess,
}: {
  registration: Registration;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/register/${registration.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success(`${registration.fullName} deleted.`);
        setOpen(false);
        onSuccess();
      } else {
        toast.error(data.error ?? "Delete failed. Please try again.");
      }
    } catch {
      toast.error("Network error. Check your connection.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost" size="icon"
          className="h-7 w-7 text-slate-400 hover:text-red-600"
          aria-label="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Delete Registration</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-600 mt-1">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-800">{registration.fullName}</span>? This action
          cannot be undone.
        </p>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Register Dialog ──────────────────────────────────────────────────────────

function RegisterDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const isValid =
    form.fullName.trim() && form.group && form.district &&
    form.status && form.gender && form.phone.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          group: form.group.toLowerCase(),
          status: form.status.toLowerCase(),
          gender: form.gender.toLowerCase(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`${form.fullName} registered successfully.`);
        setForm(EMPTY_FORM);
        setOpen(false);
        onSuccess();
      } else {
        toast.error(data.error ?? "Registration failed. Please try again.");
      }
    } catch {
      toast.error("Network error. Check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 bg-[#133358] hover:bg-[#0f2847] text-white shadow-sm">
          <UserPlus className="h-4 w-4" />
          Register Person
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Register a Person</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 pt-2">
          <div className="grid gap-1.5">
            <Label htmlFor="dlg-name">Full Name</Label>
            <Input id="dlg-name" placeholder="e.g. Kwame Asante" value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })} autoComplete="off" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Group</Label>
              <Select value={form.group} onValueChange={(v) => setForm({ ...form, group: v })}>
                <SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger>
                <SelectContent>{GROUP_OPTIONS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>District</Label>
            <Select value={form.district} onValueChange={(v) => setForm({ ...form, district: v })}>
              <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
              <SelectContent>{DISTRICT_OPTIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
                <SelectContent>{GENDER_OPTIONS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="dlg-phone">Phone</Label>
              <Input id="dlg-phone" type="tel" placeholder="0244123456" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="off" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="dlg-email">
              Email <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input id="dlg-email" type="email" placeholder="email@example.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="off" />
          </div>
          <Button type="submit" disabled={!isValid || submitting}
            className="mt-1 bg-[#133358] hover:bg-[#0f2847] text-white">
            {submitting ? "Registering…" : "Register"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [allData, setAllData] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  const [groupFilter, setGroupFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Fetch all registrations once (client-side filtering for pagination accuracy)
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetch("/api/register", { signal: controller.signal })
      .then((r) => r.json())
      .then((json) => { if (json.success) setAllData(json.data); })
      .catch((err) => { if (err.name !== "AbortError") console.error(err); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [refreshKey]);

  // Stats (always from full dataset)
  const stats = useMemo(() => ({
    total:    allData.length,
    youth:    allData.filter((r) => r.group.toLowerCase() === "youth").length,
    adult:    allData.filter((r) => r.group.toLowerCase() === "adult").length,
    campus:   allData.filter((r) => r.group.toLowerCase() === "campus").length,
    children: allData.filter((r) => r.group.toLowerCase() === "children").length,
    visitors: allData.filter((r) => r.status.toLowerCase() === "visitor").length,
  }), [allData]);

  const groupCounts: Record<string, number> = {
    youth: stats.youth, adult: stats.adult,
    campus: stats.campus, children: stats.children, visitors: stats.visitors,
  };

  // Filtered results for the table
  const filtered = useMemo(() => {
    return allData.filter((r) => {
      if (groupFilter !== "all" && r.group.toLowerCase() !== groupFilter.toLowerCase()) return false;
      if (districtFilter !== "all" && r.district !== districtFilter) return false;
      if (statusFilter !== "all" && r.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!r.fullName.toLowerCase().includes(q) && !r.phone.includes(q)) return false;
      }
      return true;
    });
  }, [allData, groupFilter, districtFilter, statusFilter, search]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    return filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [filtered, page]);

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1); }, [groupFilter, districtFilter, statusFilter, search]);

  const hasFilters =
    groupFilter !== "all" || districtFilter !== "all" ||
    statusFilter !== "all" || search !== "";

  const resetFilters = () => {
    setGroupFilter("all");
    setDistrictFilter("all");
    setStatusFilter("all");
    setSearch("");
  };

  return (
    <div className="space-y-6">

      {/* ── Stats row ─────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

        {/* Total Attendance — dark hero card */}
        <div className="col-span-1 sm:col-span-1 rounded-2xl bg-[#133358] p-5 flex flex-col justify-between min-h-27.5 shadow-md">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300">
            Total Attendance
          </p>
          {loading ? (
            <Skeleton className="h-9 w-12 bg-white/20 mt-3" />
          ) : (
            <div className="mt-3">
              <p className="text-4xl font-extrabold leading-none text-white">{stats.total}</p>
              <div className="flex items-center gap-1 mt-1.5 text-emerald-400 text-[11px] font-semibold">
                <TrendingUp className="h-3 w-3" />
                <span>+12% from last year</span>
              </div>
            </div>
          )}
        </div>

        {/* Per-group cards */}
        {GROUP_CARDS.map(({ key, label, Icon, bg, text }) => (
          <div
            key={key}
            className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 flex flex-col justify-between min-h-27.5"
          >
            <div className={cn("h-9 w-9 rounded-full flex items-center justify-center", bg)}>
              <Icon className={cn("h-4 w-4", text)} />
            </div>
            {loading ? (
              <Skeleton className="h-7 w-10 mt-3" />
            ) : (
              <div className="mt-3">
                <p className="text-2xl font-bold text-slate-800">{groupCounts[key]}</p>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
              </div>
            )}
          </div>
        ))}
      </section>

      {/* ── All Registrations ──────────────────────────────────────────── */}
      <section className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">

        {/* Section header */}
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">All Registrations</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Managing current attendees for Deeper Life Retreat
            </p>
          </div>

           <div className="relative sm:ml-auto">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search name or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs w-full border-slate-200"
              autoComplete="off"
            />
          </div>
          {/* <RegisterDialog onSuccess={() => setRefreshKey((k) => k + 1)} /> */}
        </div>

        {/* Filters row */}
        <div className="px-5 py-3 border-b border-slate-100 flex  flex-row items-center gap-2">
          <Select value={groupFilter} onValueChange={setGroupFilter}>
            <SelectTrigger className="h-8 w-full text-xs border-slate-200">
              <SelectValue placeholder="All Groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              {GROUP_OPTIONS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={districtFilter} onValueChange={setDistrictFilter}>
            <SelectTrigger className="h-8 w-full text-xs border-slate-200">
              <SelectValue placeholder="All Districts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              {DISTRICT_OPTIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-full text-xs border-slate-200">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="ghost" size="sm"
              className="h-8 text-xs text-red-500 gap-1  px-2 hover:text-slate-800"
              onClick={resetFilters}
            >
              <RotateCcw className="h-3 w-3" />
              Reset Filters
            </Button>
          )}

         
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table className="min-w-150">
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                {["Name", "Group", "District", "Status", "Phone", "Date", "Action"].map((h) => (
                  <TableHead key={h} className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center text-slate-400">
                    <Users className="mx-auto mb-2 h-8 w-8 opacity-30" />
                    <p className="text-sm font-medium">No registrations found</p>
                    {hasFilters && (
                      <p className="text-xs mt-1 opacity-70">Try adjusting your filters.</p>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((reg) => {
                  const groupLower = reg.group.toLowerCase();
                  const groupCard = GROUP_CARDS.find(
                    (c) => c.key === groupLower || (c.key === "adult" && groupLower === "adult")
                  );
                  const isMember = reg.status.toLowerCase() === "member";

                  return (
                    <TableRow key={reg.id} className="hover:bg-slate-50/60">
                      {/* Name + avatar */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-[#133358] flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-white">
                              {getInitials(reg.fullName)}
                            </span>
                          </div>
                          <span className="font-medium text-slate-800 text-sm">{reg.fullName}</span>
                        </div>
                      </TableCell>

                      {/* Group */}
                      <TableCell>
                        {groupCard ? (
                          <span className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                            groupCard.bg, groupCard.text
                          )}>
                            {reg.group}
                          </span>
                        ) : (
                          <Badge variant="secondary">{reg.group}</Badge>
                        )}
                      </TableCell>

                      {/* District */}
                      <TableCell className="text-sm text-slate-600">{reg.district}</TableCell>

                      {/* Status */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "h-2 w-2 rounded-full shrink-0",
                            isMember ? "bg-emerald-500" : "bg-amber-400"
                          )} />
                          <span className={cn(
                            "text-xs font-medium",
                            isMember ? "text-emerald-700" : "text-amber-700"
                          )}>
                            {reg.status}
                          </span>
                        </div>
                      </TableCell>

                      {/* Phone */}
                      <TableCell className="font-mono text-xs text-slate-500">
                        {reg.phone}
                      </TableCell>

                      {/* Date */}
                      <TableCell className="text-xs text-slate-500">
                        {new Date(reg.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </TableCell>

                      {/* Action */}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <EditDialog
                            registration={reg}
                            onSuccess={() => setRefreshKey((k) => k + 1)}
                          />
                          <DeleteDialog
                            registration={reg}
                            onSuccess={() => setRefreshKey((k) => k + 1)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length} registrations
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost" size="icon"
                className="h-7 w-7 text-slate-500"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-slate-500 px-1">{page} / {totalPages}</span>
              <Button
                variant="ghost" size="icon"
                className="h-7 w-7 text-slate-500"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* ── Quick Actions ──────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5 text-left hover:shadow-md transition-shadow group"
          onClick={() => toast.info("Export feature coming soon.")}
        >
          <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
            <Download className="h-5 w-5 text-[#133358]" />
          </div>
          <p className="text-sm font-semibold text-slate-800">Export Report</p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Download complete registration data in CSV or PDF format.
          </p>
        </button>

        <button
          className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5 text-left hover:shadow-md transition-shadow group"
          onClick={() => toast.info("Broadcast SMS feature coming soon.")}
        >
          <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3 group-hover:bg-emerald-200 transition-colors">
            <MessageSquare className="h-5 w-5 text-emerald-700" />
          </div>
          <p className="text-sm font-semibold text-slate-800">Broadcast SMS</p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Send emergency or update messages to all attendees.
          </p>
        </button>

        <button
          className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5 text-left hover:shadow-md transition-shadow group"
          onClick={() => toast.info("Check-in scan feature coming soon.")}
        >
          <div className="h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center mb-3 group-hover:bg-rose-200 transition-colors">
            <QrCode className="h-5 w-5 text-rose-600" />
          </div>
          <p className="text-sm font-semibold text-slate-800">Check-in Scan</p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Enable mobile scanning for fast QR check-in at the gate.
          </p>
        </button>
      </section>

    </div>
  );
}
