import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, Brain, GitBranch, BarChart3, ArrowRight, CheckCircle2,
  Building2, FlaskConical, Users, Globe, Lock, ChevronRight, Star,
  Zap, Eye, FileText, Phone,
} from "lucide-react";
import { ROUTES } from "@/router/routes";

// ─── Data ─────────────────────────────────────────────────────────────────────
const features = [
  {
    icon: Brain,
    color: "bg-royal-50 dark:bg-royal-950/40 text-royal-600",
    title: "AI Procedural Engine",
    desc: "Step-by-step AI guidance through POCSO investigation procedures, reducing human error and ensuring compliance with every legal requirement.",
  },
  {
    icon: GitBranch,
    color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600",
    title: "Dynamic Case Timeline",
    desc: "Real-time chronological tracking of every investigation step with traceable audit history and automatic deadline alerts.",
  },
  {
    icon: Shield,
    color: "bg-amber-50 dark:bg-amber-950/40 text-amber-600",
    title: "Multi-Agency Coordination",
    desc: "Seamlessly connects Police, Hospitals, FSL, CWC, and Supervisors in one secure platform with role-based access control.",
  },
  {
    icon: BarChart3,
    color: "bg-navy-50 dark:bg-navy-950/40 text-navy-600",
    title: "Analytics & Compliance",
    desc: "Supervisor dashboards with SLA tracking, bottleneck detection, and automated POCSO compliance reporting across jurisdictions.",
  },
  {
    icon: Eye,
    color: "bg-purple-50 dark:bg-purple-950/40 text-purple-600",
    title: "Victim-Centric Design",
    desc: "Privacy-first architecture ensures sensitive case information is protected while keeping all stakeholders informed as needed.",
  },
  {
    icon: Zap,
    color: "bg-rose-50 dark:bg-rose-950/40 text-rose-600",
    title: "Instant Alerts",
    desc: "Smart notification system for deadline breaches, pending actions, and critical case updates across all agencies.",
  },
];

const stakeholders = [
  { icon: Shield,      label: "Police",    desc: "FIR, investigation management" },
  { icon: Building2,   label: "Hospital",  desc: "Medical examination, evidence" },
  { icon: FlaskConical,label: "FSL",       desc: "Forensic analysis, reports"    },
  { icon: Users,       label: "CWC",       desc: "Child welfare coordination"    },
  { icon: Eye,         label: "Supervisor",desc: "Oversight & compliance"        },
  { icon: Globe,       label: "Citizen",   desc: "Case status, support"          },
];

const techStack = [
  "React 18", "Node.js", "PostgreSQL", "Redis",
  "AWS", "TensorFlow", "OpenAI", "End-to-End Encryption",
];

const testimonials = [
  { name: "Synthetic police workflow", role: "Research prototype scenario", text: "A focused workspace for tracking procedural steps, assigned cases, and outstanding actions." },
  { name: "Synthetic medical workflow", role: "Research prototype scenario", text: "Shared case context helps participating agencies keep documentation and handoffs visible." },
  { name: "Synthetic oversight workflow", role: "Research prototype scenario", text: "Structured timelines and audit events make procedural accountability easier to review." },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function NavBar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-navy-900/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-royal-500 text-white font-bold text-base shadow-lg">S</div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">SAKSHI</p>
            <p className="text-2xs text-white/50 leading-tight">Intelligence Platform</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Features", "About", "Technology", "Contact"].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-white/70 hover:text-white transition-colors no-underline">
              {item}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link to={ROUTES.CITIZEN_PORTAL}
            className="hidden sm:inline-flex items-center text-sm text-white/70 hover:text-white transition-colors no-underline">
            Citizen Portal
          </Link>
          <Link to={ROUTES.LOGIN}
            className="inline-flex items-center gap-2 rounded-lg bg-royal-500 hover:bg-royal-600 px-4 py-2 text-sm font-semibold text-white transition-colors no-underline shadow-sm">
            <Lock className="h-3.5 w-3.5" /> Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      <NavBar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-navy-900">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-[700px] w-[700px] rounded-full bg-royal-600/20 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-emerald-600/15 blur-[100px]" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(hsl(217 91% 60% / 1) 1px, transparent 1px), linear-gradient(90deg, hsl(217 91% 60% / 1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32 pt-40">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left content */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/70 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Research Prototype · Synthetic Demonstration Environment
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-[1.08] tracking-tight">
                  AI-Powered<br />
                  <span className="text-royal-400">POCSO</span><br />
                  Investigation
                </h1>
                <p className="text-lg text-white/60 max-w-lg leading-relaxed">
                  SAKSHI connects Police, Hospitals, FSL, and CWC into one intelligent platform — 
                  ensuring every child protection investigation follows the right procedure, every time.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Link to={ROUTES.LOGIN}
                  className="inline-flex items-center gap-2.5 rounded-xl bg-royal-500 hover:bg-royal-400 px-8 py-3.5 text-sm font-bold text-white transition-all shadow-lg shadow-royal-500/30 no-underline">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#features"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-8 py-3.5 text-sm font-semibold text-white transition-all no-underline">
                  See Features
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-5 pt-2">
                {["Procedural Accountability", "Privacy-Preserving Design", "Synthetic Data", "Role-Aware Workflows"].map(tag => (
                  <div key={tag} className="flex items-center gap-1.5 text-xs text-white/50">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> {tag}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — Prototype scope */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 space-y-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Prototype Scope</p>
                <div className="space-y-3 text-sm text-white/70">
                  <p>Procedural case tracking</p>
                  <p>Multi-agency workflow visibility</p>
                  <p>Audit-ready activity history</p>
                  <p>Role-aware showcase navigation</p>
                </div>
                <div className="border-t border-white/10 pt-5 space-y-3">
                  {stakeholders.map(s => (
                    <div key={s.label} className="flex items-center gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10">
                        <s.icon className="h-3.5 w-3.5 text-white/70" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-white">{s.label}</span>
                        <span className="text-xs text-white/40 ml-2">{s.desc}</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-white/20" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16 space-y-3">
            <span className="inline-block rounded-full bg-royal-100 dark:bg-royal-950/50 px-3 py-1 text-xs font-semibold text-royal-600 dark:text-royal-400">Platform Features</span>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white">Everything you need for<br />POCSO investigations</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Built specifically for child protection cases with compliance, security, and efficiency at the core.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4 }}
                className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-6 space-y-4 cursor-default hover:shadow-lg hover:border-royal-200 dark:hover:border-royal-800 transition-all">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${f.color}`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────────────────── */}
      <section id="about" className="py-24 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
              <span className="inline-block rounded-full bg-emerald-100 dark:bg-emerald-950/50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">About SAKSHI</span>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white">Bridging the gap in child protection investigations</h2>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                SAKSHI was developed to address critical delays and procedural lapses in POCSO investigations 
                across India. By digitizing and AI-powering the entire investigation workflow, we ensure no 
                mandatory step is missed and no deadline is breached.
              </p>
              <div className="space-y-4">
                {[
                  "Supports structured procedural review",
                  "Surfaces pending steps and dependencies",
                  "Enables multi-agency workflow visibility",
                  "Keeps an audit-ready activity history",
                ].map(point => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">{point}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-4">
              {testimonials.map((t, i) => (
                <div key={i} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-5 space-y-3">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(s => <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{t.text}"</p>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TECHNOLOGY ───────────────────────────────────────────────────── */}
      <section id="technology" className="py-24 bg-navy-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-3">
            <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-royal-400">Technology Stack</span>
            <h2 className="text-4xl font-bold text-white">Enterprise-grade infrastructure</h2>
            <p className="text-white/50 max-w-2xl mx-auto">Built with battle-tested, government-grade technology ensuring 99.9% uptime and maximum security.</p>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((tech, i) => (
              <motion.span key={tech} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-default">
                {tech}
              </motion.span>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
            {[
              { icon: Lock,     title: "Bank-Level Encryption",  desc: "All data encrypted at rest and in transit using AES-256." },
              { icon: Shield,   title: "Role-Based Access",      desc: "Granular permissions ensure each user sees only what they need." },
              { icon: FileText, title: "Compliance Ready",       desc: "Automated audit logs and reports for judiciary and oversight bodies." },
            ].map(item => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-royal-500/20 text-royal-400">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-royal-600 to-navy-700 text-white text-center">
        <div className="mx-auto max-w-3xl px-4 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
            <h2 className="text-4xl font-bold">Ready to strengthen child protection?</h2>
            <p className="text-white/70 text-lg">Join law enforcement agencies across India using SAKSHI to ensure every POCSO case gets the attention it deserves.</p>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link to={ROUTES.LOGIN}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-navy-800 hover:bg-white/90 transition-all no-underline shadow-lg">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to={ROUTES.CITIZEN_PORTAL}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-8 py-3.5 text-sm font-semibold text-white transition-all no-underline">
              <Phone className="h-4 w-4" /> Citizen Portal
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer id="contact" className="bg-navy-950 border-t border-white/5 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-royal-500 text-white font-bold">S</div>
                <div>
                  <p className="text-sm font-bold text-white">SAKSHI</p>
                  <p className="text-xs text-white/40">AI-Powered POCSO Intelligence</p>
                </div>
              </div>
              <p className="text-xs text-white/40 max-w-xs leading-relaxed">
                Developed under the Ministry of Women & Child Development, Government of India.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Platform</p>
              {["Features", "Security", "Compliance", "API Docs"].map(l => (
                <p key={l} className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">{l}</p>
              ))}
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Support</p>
              {["Documentation", "Contact Us", "Helpline: 1098", "Emergency"].map(l => (
                <p key={l} className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">{l}</p>
              ))}
            </div>
          </div>
          <div className="mt-10 border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/30">© {new Date().getFullYear()} SAKSHI. Ministry of Women & Child Development · Government of India</p>
            <p className="text-xs text-white/30">Research prototype · Synthetic demonstration environment</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
