import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Shield, Lock, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/router/routes";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";

const schema = z.object({
  name:       z.string().optional(),
  email:      z.string().min(1, "Email is required").email("Invalid email address"),
  password:   z.string().min(1, "Password is required"),
  confirmPassword: z.string().optional(),
  rememberMe: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

const DEMO_ACCOUNTS = [
  { role: "Admin",      email: "admin@sakshi.gov.in",      password: "SAKSHI@Demo2026", color: "bg-navy-100 text-navy-700 border-navy-200" },
  { role: "Police",     email: "officer@sakshi.gov.in",    password: "SAKSHI@Demo2026", color: "bg-royal-100 text-royal-700 border-royal-200" },
  { role: "Hospital",   email: "doctor@sakshi.gov.in",     password: "SAKSHI@Demo2026", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { role: "FSL",        email: "fsl@sakshi.gov.in",        password: "SAKSHI@Demo2026", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { role: "CWC",        email: "cwc@sakshi.gov.in",        password: "SAKSHI@Demo2026", color: "bg-pink-100 text-pink-700 border-pink-200" },
  { role: "Supervisor", email: "supervisor@sakshi.gov.in", password: "SAKSHI@Demo2026", color: "bg-amber-100 text-amber-700 border-amber-200" },
];

const DASHBOARD_BY_ROLE: Record<string, string> = {
  police: ROUTES.POLICE_DASHBOARD,
  hospital: ROUTES.HOSPITAL_DASHBOARD,
  fsl: ROUTES.FSL_DASHBOARD,
  cwc: ROUTES.CWC_DASHBOARD,
  supervisor: ROUTES.SUPERVISOR_DASHBOARD,
  admin: ROUTES.SUPERVISOR_DASHBOARD,
};

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [success, setSuccess] = useState(false);
  const { login } = useAuth();
  const navigate   = useNavigate();
  const isRegister  = useLocation().pathname === ROUTES.REGISTER;

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoginError("");

    try {
      if (isRegister && (!data.name || data.name.trim().length < 2)) {
        setLoginError("Name must be at least 2 characters.");
        return;
      }
      if (isRegister && data.password !== data.confirmPassword) {
        setLoginError("Passwords do not match.");
        return;
      }

      const response = isRegister
        ? await authService.register({ name: data.name!.trim(), email: data.email, password: data.password })
        : await authService.login({ email: data.email, password: data.password });
      if (!response.success || !response.data) {
        setLoginError(response.message || (isRegister ? "Unable to register right now." : "Unable to sign in right now."));
        return;
      }

      const { user, tokens } = response.data;
      login(user, tokens.accessToken);
      setSuccess(true);
      window.setTimeout(() => navigate(DASHBOARD_BY_ROLE[user.role] ?? ROUTES.DASHBOARD), 800);
    } catch (error: unknown) {
      const message = error && typeof error === "object" && "message" in error && typeof (error as { message?: unknown }).message === "string"
        ? (error as { message: string }).message
        : (isRegister ? "Unable to register right now." : "Unable to sign in right now.");
      setLoginError(message);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between bg-navy-900 p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-0 h-96 w-96 rounded-full bg-royal-600/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />
        </div>
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-royal-500 text-white font-bold text-lg shadow-lg">S</div>
          <div><p className="text-lg font-bold text-white">SAKSHI</p><p className="text-xs text-white/40">Intelligence Platform</p></div>
        </div>
        <div className="relative space-y-6">
          <h1 className="text-4xl font-extrabold text-white leading-tight">Secure access to<br /><span className="text-royal-400">POCSO</span><br />investigations</h1>
          <p className="text-white/50 leading-relaxed max-w-sm">Every login is logged and monitored. Unauthorised access to POCSO case data is a criminal offence under the IT Act 2000.</p>
          <div className="space-y-3 pt-2">
            {[
              "End-to-end encrypted sessions",
              "Role-based access control",
              "Traceable audit logging",
              "POCSO Act 2012 compliant",
            ].map(item => (
              <div key={item} className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-sm text-white/60">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-white/25">Ministry of Women & Child Development · Government of India</p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-800 text-white font-bold">S</div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">SAKSHI</p>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{isRegister ? "Create an account" : "Welcome back"}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{isRegister ? "Register for the SAKSHI prototype" : "Sign in to access your dashboard"}</p>
          </div>

          {!isRegister && <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Demo Accounts (click to fill)</p>
            <div className="flex flex-wrap gap-2">
              {DEMO_ACCOUNTS.map(a => (
                <button key={a.role} type="button" onClick={() => { setValue("email", a.email); setValue("password", a.password); }}
                  className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-all hover:opacity-80", a.color)}>
                  {a.role}
                </button>
              ))}
            </div>
          </div>}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {loginError && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 p-3">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">{loginError}</p>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 p-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <p className="text-sm text-emerald-600 dark:text-emerald-400">{isRegister ? "Registration successful! Redirecting…" : "Login successful! Redirecting…"}</p>
              </div>
            )}

            {isRegister && <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
              <input {...register("name")} type="text" autoComplete="name" className="w-full h-10 rounded-lg border px-4 text-sm bg-white dark:bg-slate-900 dark:text-white border-slate-200 dark:border-slate-700" />
            </div>}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input {...register("email")} type="email" placeholder="officer@sakshi.gov.in" autoComplete="email"
                  className={cn("w-full h-10 rounded-lg border pl-9 pr-4 text-sm bg-white dark:bg-slate-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent",
                    errors.email ? "border-red-400" : "border-slate-200 dark:border-slate-700")} />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                {!isRegister && <Link to={ROUTES.FORGOT_PASSWORD} className="text-xs text-royal-600 hover:underline">Forgot password?</Link>}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input {...register("password")} type={showPass ? "text" : "password"} placeholder="••••••••" autoComplete="current-password"
                  className={cn("w-full h-10 rounded-lg border pl-9 pr-10 text-sm bg-white dark:bg-slate-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent",
                    errors.password ? "border-red-400" : "border-slate-200 dark:border-slate-700")} />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {isRegister && <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
              <input {...register("confirmPassword")} type="password" autoComplete="new-password" className="w-full h-10 rounded-lg border px-4 text-sm bg-white dark:bg-slate-900 dark:text-white border-slate-200 dark:border-slate-700" />
            </div>}

            <div className="flex items-center gap-2">
              <input {...register("rememberMe")} id="remember" type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-royal-600" />
              <label htmlFor="remember" className="text-sm text-slate-600 dark:text-slate-400 select-none">Remember me for 30 days</label>
            </div>

            <button type="submit" disabled={isSubmitting || success}
              className="relative w-full h-11 rounded-xl bg-navy-800 hover:bg-navy-700 active:scale-[0.99] text-white text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-navy-800/25 flex items-center justify-center gap-2">
              {isSubmitting ? (
                <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Signing in…</>
              ) : success ? (
                <><CheckCircle2 className="h-4 w-4" /> Redirecting…</>
              ) : (
                <><Shield className="h-4 w-4" /> {isRegister ? "Create Account" : "Sign In Securely"}</>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            {isRegister ? <>Already registered? <Link to={ROUTES.LOGIN} className="text-royal-600 hover:underline">Sign in</Link></> : <>Need an account? <Link to={ROUTES.REGISTER} className="text-royal-600 hover:underline">Register</Link></>}
          </p>

          <p className="text-center text-xs text-slate-400">
            By signing in you agree to SAKSHI's security policy.<br />
            Unauthorised access is monitored and prosecuted.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
