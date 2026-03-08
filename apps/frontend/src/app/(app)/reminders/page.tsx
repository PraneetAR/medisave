"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight, Clock, Loader2 } from "lucide-react";
import { remindersApi } from "@/services/api";
import { Reminder, DosageUnit } from "@/types";
import toast from "react-hot-toast";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatTime = (h: number, m: number) =>
  `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

const emptyForm = {
  medicineName: "", dosage: "", unit: "tablet" as DosageUnit,
  hour: "08", minute: "00", frequency: "daily",
  activeDays: [0, 1, 2, 3, 4, 5, 6], notes: "",
};

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(emptyForm);

  const load = async () => {
    try {
      const { data } = await remindersApi.getAll();
      setReminders(data.data ?? []);
    } catch { toast.error("Failed to load reminders"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.medicineName || !form.dosage) {
      toast.error("Medicine name and dosage are required"); return;
    }
    setSaving(true);
    try {
      await remindersApi.create({
        medicineName: form.medicineName,
        dosage: Number(form.dosage),
        unit: form.unit,
        times: [{ hour: Number(form.hour), minute: Number(form.minute) }],
        frequency: form.frequency,
        activeDays: form.activeDays,
        notes: form.notes,
      });
      toast.success("Reminder created!");
      setShowForm(false);
      setForm(emptyForm);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to create");
    } finally { setSaving(false); }
  };

  const handleToggle = async (id: string) => {
    try {
      const { data } = await remindersApi.toggle(id);
      setReminders((prev) =>
        prev.map((r) => (r._id === id ? data.data : r))
      );
      toast.success(data.data.isActive ? "Reminder enabled" : "Reminder paused");
    } catch { toast.error("Failed to toggle"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this reminder?")) return;
    try {
      await remindersApi.delete(id);
      setReminders((prev) => prev.filter((r) => r._id !== id));
      toast.success("Reminder deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const toggleDay = (day: number) => {
    setForm((f) => ({
      ...f,
      activeDays: f.activeDays.includes(day)
        ? f.activeDays.filter((d) => d !== day)
        : [...f.activeDays, day],
    }));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-800"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Reminders
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {reminders.length} reminder{reminders.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Reminder
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="card mb-6 border-[#3b5bdb]/20">
          <h2 className="font-semibold text-slate-800 mb-5"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            New Reminder
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Medicine Name *
              </label>
              <input className="input-field" placeholder="e.g. Paracetamol"
                value={form.medicineName}
                onChange={(e) => setForm({ ...form, medicineName: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Dosage *</label>
                <input className="input-field" type="number" placeholder="500"
                  value={form.dosage}
                  onChange={(e) => setForm({ ...form, dosage: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit</label>
                <select className="input-field" value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value as DosageUnit })}>
                  {["mg", "ml", "tablet", "capsule", "drop"].map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Hour</label>
                <input className="input-field" type="number" min="0" max="23" placeholder="08"
                  value={form.hour}
                  onChange={(e) => setForm({ ...form, hour: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Minute</label>
                <input className="input-field" type="number" min="0" max="59" placeholder="00"
                  value={form.minute}
                  onChange={(e) => setForm({ ...form, minute: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
              <input className="input-field" placeholder="e.g. Take after food"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>

          {/* Active Days */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Active Days</label>
            <div className="flex gap-2 flex-wrap">
              {DAYS.map((day, i) => (
                <button key={day} onClick={() => toggleDay(i)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                  style={{
                    backgroundColor: form.activeDays.includes(i) ? "#3b5bdb" : "#f1f5f9",
                    color: form.activeDays.includes(i) ? "white" : "#64748b",
                  }}>
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button onClick={handleCreate} disabled={saving}
              className="btn-primary flex items-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving..." : "Save Reminder"}
            </button>
            <button onClick={() => { setShowForm(false); setForm(emptyForm); }}
              className="btn-ghost">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reminders List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : reminders.length === 0 ? (
        <div className="card text-center py-16">
          <span className="text-5xl mb-4 block">💊</span>
          <h3 className="font-semibold text-slate-800 mb-1">No reminders yet</h3>
          <p className="text-slate-500 text-sm">Click &quot;Add Reminder&quot; to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((r) => (
            <div key={r._id}
              className="card flex items-center gap-4 py-4"
              style={{ opacity: r.isActive ? 1 : 0.6 }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: r.isActive ? "#3b5bdb18" : "#f1f5f9" }}>
                <span className="text-xl">💊</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-medium text-slate-800 text-sm">{r.medicineName}</p>
                  <span className={r.isActive ? "badge-green" : "badge-red"}>
                    {r.isActive ? "Active" : "Paused"}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {r.dosage} {r.unit}
                  {r.notes && ` · ${r.notes}`}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-400">
                    {r.times.map((t) => formatTime(t.hour, t.minute)).join(", ")}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleToggle(r._id)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  title={r.isActive ? "Pause" : "Enable"}>
                  {r.isActive
                    ? <ToggleRight className="w-5 h-5" style={{ color: "#22c55e" }} />
                    : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                </button>
                <button onClick={() => handleDelete(r._id)}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors text-slate-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
