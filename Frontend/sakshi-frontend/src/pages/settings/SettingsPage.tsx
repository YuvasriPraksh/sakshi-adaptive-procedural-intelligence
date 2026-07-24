import { useState } from "react";
import { motion } from "framer-motion";
import {
  Palette, Globe, Bell, User, Shield, Key,
  Sun, Moon, Monitor, ChevronRight, Check, Save,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTheme }        from "@/hooks/useTheme";
import { cn }              from "@/lib/utils";
import { useNotifications } from "@/context/NotificationContext";

const TABS = [
  { id:"appearance",     label:"Appearance",     icon:Palette },
  { id:"language",       label:"Language",       icon:Globe   },
  { id:"notifications",  label:"Notifications",  icon:Bell    },
  { id:"account",        label:"Account",        icon:User    },
  { id:"security",       label:"Security",       icon:Shield  },
  { id:"api",            label:"API Keys",       icon:Key     },
] as const;
type TabId = typeof TABS[number]["id"];

function SectionCard({ title, description, children }: { title:string; description?:string; children:React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="border-b border-border pb-3">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function SettingRow({ label, description, children }: { label:string; description?:string; children:React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }: { value:boolean; onChange:(v:boolean)=>void }) {
  return (
    <button onClick={() => onChange(!value)} role="switch" aria-checked={value}
      className={cn("relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer",
        value ? "bg-[hsl(var(--primary))]" : "bg-muted")}>
      <span className={cn("inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform", value ? "translate-x-4" : "translate-x-0")} />
    </button>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("appearance");
  const { theme, setTheme }       = useTheme();
  const { toast }                 = useNotifications();
  const [saved, setSaved]         = useState(false);

  // Settings state
  const [lang,       setLang]      = useState("en");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [timezone,   setTimezone]  = useState("Asia/Kolkata");
  const [notifPrefs, setNotifPrefs] = useState({
    caseAssigned:    true, workflowUpdated: true, highRisk:   true,
    deadline:        true, aiRecommendation:true, general:    false,
    emailAlerts:     false, smsAlerts:       false,
  });

  const handleSave = async () => {
    setSaved(true);
    toast({ title:"Settings saved", message:"Your preferences have been updated.", variant:"success" });
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 max-w-5xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your account preferences and application settings.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          {/* Sidebar tabs */}
          <div className="lg:w-48 shrink-0">
            <nav className="rounded-xl border border-border bg-card overflow-hidden">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={cn("flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-b border-border last:border-0",
                    activeTab === tab.id
                      ? "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                  <tab.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{tab.label}</span>
                  {activeTab === tab.id && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-4">
            <motion.div key={activeTab} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.2 }}>
              {/* ── Appearance ── */}
              {activeTab === "appearance" && (
                <SectionCard title="Appearance" description="Customize the visual theme and display preferences.">
                  <SettingRow label="Theme" description="Choose your preferred color scheme.">
                    <div className="flex items-center gap-2">
                      {([["light","Light",Sun],["dark","Dark",Moon],["system","Auto",Monitor]] as const).map(([val,lbl,Ico]) => (
                        <button key={val} onClick={() => setTheme(val)}
                          className={cn("flex flex-col items-center gap-1 rounded-xl border p-3 w-20 transition-all",
                            theme===val ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10" : "border-border hover:bg-muted")}>
                          <Ico className={cn("h-5 w-5", theme===val ? "text-[hsl(var(--primary))]" : "text-muted-foreground")} />
                          <span className={cn("text-2xs font-medium", theme===val ? "text-[hsl(var(--primary))]" : "text-muted-foreground")}>{lbl}</span>
                          {theme===val && <Check className="h-3 w-3 text-[hsl(var(--primary))]" />}
                        </button>
                      ))}
                    </div>
                  </SettingRow>
                  <SettingRow label="Compact Mode" description="Reduce spacing for more information density.">
                    <Toggle value={false} onChange={() => {}} />
                  </SettingRow>
                  <SettingRow label="Sidebar Collapsed" description="Start with sidebar in collapsed state.">
                    <Toggle value={false} onChange={() => {}} />
                  </SettingRow>
                </SectionCard>
              )}

              {/* ── Language ── */}
              {activeTab === "language" && (
                <SectionCard title="Language & Region" description="Set your language, date format, and timezone.">
                  {[
                    { label:"Interface Language", desc:"Select your preferred display language.",
                      el:<select value={lang} onChange={e => setLang(e.target.value)} className="h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] dark:bg-slate-900 dark:text-white">
                        {[["en","English"],["hi","हिन्दी (Hindi)"],["mr","मराठी (Marathi)"],["ta","தமிழ் (Tamil)"],["te","తెలుగు (Telugu)"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                      </select> },
                    { label:"Date Format",        desc:"Choose how dates are displayed throughout the system.",
                      el:<select value={dateFormat} onChange={e => setDateFormat(e.target.value)} className="h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] dark:bg-slate-900 dark:text-white">
                        {["DD/MM/YYYY","MM/DD/YYYY","YYYY-MM-DD"].map(v => <option key={v} value={v}>{v}</option>)}
                      </select> },
                    { label:"Timezone",           desc:"Select your local timezone for accurate timestamps.",
                      el:<select value={timezone}  onChange={e => setTimezone(e.target.value)}  className="h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] dark:bg-slate-900 dark:text-white">
                        {["Asia/Kolkata","Asia/Mumbai","Asia/Delhi","UTC"].map(v => <option key={v} value={v}>{v}</option>)}
                      </select> },
                  ].map(r => <SettingRow key={r.label} label={r.label} description={r.desc}>{r.el}</SettingRow>)}
                </SectionCard>
              )}

              {/* ── Notifications ── */}
              {activeTab === "notifications" && (
                <div className="space-y-4">
                  <SectionCard title="In-App Notifications" description="Choose which events trigger in-app notifications.">
                    {([
                      ["caseAssigned",    "Case Assigned",     "Notify when a new case is assigned to you"],
                      ["workflowUpdated", "Workflow Updated",  "Notify when a case workflow stage is updated"],
                      ["highRisk",        "High Risk Alerts",  "Notify when AI detects high-risk conditions"],
                      ["deadline",        "Deadline Reminders","Notify 48/24 hours before deadline breach"],
                      ["aiRecommendation","AI Recommendations","Notify when AI generates new recommendations"],
                      ["general",         "General Updates",   "System announcements and platform updates"],
                    ] as const).map(([key, label, desc]) => (
                      <SettingRow key={key} label={label} description={desc}>
                        <Toggle value={notifPrefs[key]} onChange={v => setNotifPrefs(p => ({...p, [key]:v}))} />
                      </SettingRow>
                    ))}
                  </SectionCard>
                  <SectionCard title="External Notifications" description="Configure email and SMS alert preferences.">
                    <SettingRow label="Email Alerts" description="Receive critical case updates via email.">
                      <Toggle value={notifPrefs.emailAlerts} onChange={v => setNotifPrefs(p => ({...p, emailAlerts:v}))} />
                    </SettingRow>
                    <SettingRow label="SMS Alerts" description="Receive deadline breach alerts via SMS.">
                      <Toggle value={notifPrefs.smsAlerts} onChange={v => setNotifPrefs(p => ({...p, smsAlerts:v}))} />
                    </SettingRow>
                  </SectionCard>
                </div>
              )}

              {/* ── Account ── */}
              {activeTab === "account" && (
                <div className="space-y-4">
                  <SectionCard title="Account Information">
                    {[
                      { label:"Full Name",         placeholder:"Your full name" },
                      { label:"Official Email",     placeholder:"officer@gov.in" },
                      { label:"Designation",        placeholder:"Sub-Inspector" },
                      { label:"Badge / Employee ID",placeholder:"DL-2341" },
                      { label:"Phone Number",       placeholder:"+91 98765 43210" },
                    ].map(f => (
                      <div key={f.label} className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-foreground">{f.label}</label>
                        <input placeholder={f.placeholder}
                          className="h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] dark:bg-slate-900 dark:text-white" />
                      </div>
                    ))}
                  </SectionCard>
                  <div className="p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 space-y-2">
                    <p className="text-sm font-semibold text-red-700 dark:text-red-400">Danger Zone</p>
                    <p className="text-xs text-muted-foreground">Account deactivation is irreversible. Contact your system administrator.</p>
                    <button className="rounded-lg border border-red-300 dark:border-red-800 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors">
                      Request Account Deactivation
                    </button>
                  </div>
                </div>
              )}

              {/* ── Security ── */}
              {activeTab === "security" && (
                <div className="space-y-4">
                  <SectionCard title="Change Password" description="Use a strong password to protect your account.">
                    {["Current Password","New Password","Confirm New Password"].map(label => (
                      <div key={label} className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-foreground">{label}</label>
                        <input type="password" placeholder="••••••••"
                          className="h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] dark:bg-slate-900 dark:text-white" />
                      </div>
                    ))}
                  </SectionCard>
                  <SectionCard title="Two-Factor Authentication" description="Add an extra layer of security to your account.">
                    <SettingRow label="Enable 2FA" description="Require OTP verification on every login.">
                      <Toggle value={true} onChange={() => {}} />
                    </SettingRow>
                    <SettingRow label="Authentication App" description="Use Google Authenticator or similar.">
                      <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors">Configure</button>
                    </SettingRow>
                  </SectionCard>
                  <SectionCard title="Active Sessions">
                    {[
                      { device:"Windows PC — Chrome",    location:"South Delhi",    time:"Now",         current:true  },
                      { device:"iPhone 14 — Safari",    location:"South Delhi",    time:"2 hours ago", current:false },
                      { device:"MacBook Pro — Firefox", location:"South Delhi",    time:"1 day ago",   current:false },
                    ].map((s,i) => (
                      <div key={i} className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-foreground flex items-center gap-2">
                            {s.device} {s.current && <span className="text-2xs rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 px-1.5 py-0.5 font-semibold">Current</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">{s.location} · {s.time}</p>
                        </div>
                        {!s.current && <button className="text-xs text-red-500 hover:underline">Revoke</button>}
                      </div>
                    ))}
                  </SectionCard>
                </div>
              )}

              {/* ── API Keys ── */}
              {activeTab === "api" && (
                <SectionCard title="API Keys" description="Manage API keys for backend integration. Keep these confidential.">
                  <div className="space-y-3">
                    {[
                      { label:"Production API Key",   value:"sk-prod-•••••••••••••••••••••abc123", active:true  },
                      { label:"Staging API Key",      value:"sk-stg-•••••••••••••••••••••def456",  active:true  },
                      { label:"Development API Key",  value:"sk-dev-•••••••••••••••••••••ghi789",  active:false },
                    ].map(k => (
                      <div key={k.label} className="rounded-lg border border-border p-3.5 flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground">{k.label}</p>
                          <p className="text-xs font-mono text-muted-foreground mt-0.5 truncate">{k.value}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={cn("text-2xs rounded-full px-2 py-0.5 font-medium", k.active ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-muted text-muted-foreground")}>
                            {k.active ? "Active" : "Inactive"}
                          </span>
                          <button className="text-xs text-[hsl(var(--primary))] hover:underline">Rotate</button>
                          <button className="text-xs text-red-500 hover:underline">Revoke</button>
                        </div>
                      </div>
                    ))}
                    <button className="w-full rounded-lg border border-dashed border-border py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                      + Generate New API Key
                    </button>
                  </div>
                </SectionCard>
              )}
            </motion.div>

            {/* Save button */}
            {["appearance","language","notifications","account","security"].includes(activeTab) && (
              <div className="flex justify-end">
                <button onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 px-6 py-2.5 text-sm font-bold text-white transition-all shadow-sm">
                  {saved ? <><Check className="h-4 w-4" /> Saved!</> : <><Save className="h-4 w-4" /> Save Changes</>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
