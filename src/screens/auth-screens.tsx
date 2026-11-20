import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthShell, PasswordField } from "@/components/AuthShell";
import { Logo } from "@/components/coach-ui";
import { Button, Field, Input } from "@/components/kit";
import { asset } from "@/lib/utils";
import { SAMPLE_OTP } from "@/lib/sample-data";
import { useCoach } from "@/lib/store";

const slides = [
  {
    image: "/images/onboarding/onboarding-roster.jpg",
    title: "Fill the open spots",
    body: "Post the positions you still need and review families who are looking for a travel team.",
  },
  {
    image: "/images/onboarding/onboarding-teams.jpg",
    title: "Run the roster",
    body: "Keep each club, age group, and jersey list in one place through the season.",
  },
  {
    image: "/images/onboarding/onboarding-events.jpg",
    title: "Post tryouts and events",
    body: "Put a date on the calendar, share the address, and see who is coming.",
  },
  {
    image: "/images/onboarding/onboarding-learn.jpg",
    title: "Keep learning",
    body: "Short courses on roster decisions, practice weeks, and talking with families.",
  },
];

export function SplashScreen() {
  const { ready } = useCoach();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      navigate({ to: "/onboarding", replace: true });
    }, reduced ? 200 : 1300);
    return () => window.clearTimeout(timer);
  }, [ready, navigate]);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-8">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.22),transparent_58%)]" />
      <Logo wide className="splash-in relative" />
      <div className="absolute bottom-[max(2.5rem,env(safe-area-inset-bottom))] h-1 w-24 overflow-hidden rounded-full bg-muted">
        <span className="block h-full w-1/2 animate-pulse rounded-full bg-primary" />
      </div>
    </div>
  );
}

export function OnboardingScreen() {
  const { markOnboarded } = useCoach();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const slide = slides[index] ?? slides[0];

  function finish() {
    markOnboarded();
    navigate({ to: "/login" });
  }

  return (
    <div className="relative min-h-dvh bg-[#0F2027]">
      <img src={asset(slide.image)} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F2027] via-[#0F2027]/80 to-[#0F2027]/20" />
      <div className="relative flex min-h-dvh flex-col">
        <div className="flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))]">
          <Logo />
          <button type="button" onClick={finish} className="min-h-11 rounded-full bg-black/35 px-4 text-sm font-semibold text-white">
            Skip
          </button>
        </div>
        <div className="mt-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="mb-5 flex gap-2" aria-hidden>
            {slides.map((item, itemIndex) => (
              <span key={item.title} className={itemIndex === index ? "h-1.5 flex-1 rounded-full bg-primary" : "h-1.5 flex-1 rounded-full bg-white/30"} />
            ))}
          </div>
          <p className="type-caption text-primary">Coach</p>
          <h1 className="type-display mt-2 text-white">{slide.title}</h1>
          <p className="mt-3 type-body-lg text-white/80">{slide.body}</p>
          <div className="mt-8">
            {index < slides.length - 1 ? (
              <Button full onClick={() => setIndex((value) => value + 1)}>
                Next
              </Button>
            ) : (
              <Button full onClick={finish}>
                Get started
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoginScreen() {
  const { login } = useCoach();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(() => {
      const result = login(email, password);
      setLoading(false);
      if (!result.ok) return;
      if (!result.user.emailVerified) {
        navigate({ to: "/otp", search: { purpose: "verify", email: result.user.email } });
      } else if (!result.user.profileComplete) navigate({ to: "/setup" });
      else navigate({ to: "/home" });
    }, 280);
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your club. Athlete accounts use a separate app." showBack={false}>
      <form onSubmit={submit} noValidate>
        <Field label="Email">
          <Input type="email" autoComplete="email" inputMode="email" placeholder="you@club.com" value={email} onChange={(event) => setEmail(event.target.value)} />
        </Field>
        <PasswordField label="Password" autoComplete="current-password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <div className="mb-5 flex justify-end">
          <Link to="/forgot-password" className="type-small font-semibold text-foreground">
            Forgot password
          </Link>
        </div>
        <Button type="submit" full loading={loading}>
          Sign in
        </Button>
      </form>
      <button
        type="button"
        className="mt-4 min-h-11 w-full text-sm font-semibold text-muted-foreground"
        onClick={() => {
          setEmail("coach@spotmyroster.com");
          setPassword("Roster2026");
        }}
      >
        Use the sample coach
      </button>
      <div className="mt-6 border-t border-border pt-6">
        <Button variant="outline" full onClick={() => navigate({ to: "/register" })}>
          Create a coach account
        </Button>
        <p className="mt-4 text-center type-small text-muted-foreground">
          <Link to="/profile/terms" className="underline">Terms</Link>
          {" · "}
          <Link to="/profile/privacy-policy" className="underline">Privacy</Link>
        </p>
      </div>
    </AuthShell>
  );
}

export function RegisterScreen() {
  const { register } = useCoach();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", confirm: "" });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(() => {
      const result = register(form);
      setLoading(false);
      navigate({ to: "/verify-email", search: { email: result.ok ? result.email : form.email } });
    }, 280);
  }

  return (
    <AuthShell title="Create your account" subtitle="For coaches running a club. You can finish your profile after this.">
      <form onSubmit={submit} noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name">
            <Input autoComplete="given-name" placeholder="Alex" value={form.firstName} onChange={(event) => set("firstName", event.target.value)} />
          </Field>
          <Field label="Last name">
            <Input autoComplete="family-name" placeholder="Morgan" value={form.lastName} onChange={(event) => set("lastName", event.target.value)} />
          </Field>
        </div>
        <Field label="Email">
          <Input type="email" autoComplete="email" inputMode="email" placeholder="you@club.com" value={form.email} onChange={(event) => set("email", event.target.value)} />
        </Field>
        <Field label="Mobile">
          <Input type="tel" autoComplete="tel" inputMode="tel" placeholder="(555) 000-0000" value={form.phone} onChange={(event) => set("phone", event.target.value)} />
        </Field>
        <PasswordField label="Password" autoComplete="new-password" placeholder="Password" value={form.password} onChange={(event) => set("password", event.target.value)} />
        <PasswordField label="Confirm password" autoComplete="new-password" placeholder="Repeat password" value={form.confirm} onChange={(event) => set("confirm", event.target.value)} />
        <label className="mb-5 flex items-start gap-3 type-small text-foreground">
          <input type="checkbox" className="mt-0.5 h-5 w-5 accent-primary" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
          <span>
            I agree to the <Link to="/profile/terms" className="font-semibold underline">Terms</Link> and <Link to="/profile/privacy-policy" className="font-semibold underline">Privacy Policy</Link>.
          </span>
        </label>
        <Button type="submit" full loading={loading}>Create account</Button>
      </form>
      <p className="mt-5 text-center type-small text-muted-foreground">
        Already coaching here?{" "}
        <Link to="/login" className="font-semibold text-foreground">Sign in</Link>
      </p>
    </AuthShell>
  );
}

export function ForgotPasswordScreen() {
  const { requestOtp } = useCoach();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    requestOtp(email, "reset");
    navigate({ to: "/otp", search: { purpose: "reset", email: email.trim().toLowerCase() } });
  }

  return (
    <AuthShell title="Reset your password" subtitle="Enter the email on your coach account. This preview does not send a message.">
      <form onSubmit={submit} noValidate>
        <Field label="Email">
          <Input type="email" autoComplete="email" inputMode="email" placeholder="you@club.com" value={email} onChange={(event) => setEmail(event.target.value)} />
        </Field>
        <Button type="submit" full>Send code</Button>
      </form>
    </AuthShell>
  );
}

export function VerifyEmailScreen({ email }: { email: string }) {
  const navigate = useNavigate();
  return (
    <AuthShell title="Verify your email" subtitle={`The next step is ready for ${email || "your email"}. Nothing is sent in this preview.`}>
      <p className="type-body text-muted-foreground">Enter the sample code on the next screen to open your coach account.</p>
      <div className="mt-6">
        <Button full onClick={() => navigate({ to: "/otp", search: { purpose: "verify", email } })}>
          Enter code
        </Button>
      </div>
    </AuthShell>
  );
}

export function OtpScreen({ email, purpose }: { email: string; purpose: "verify" | "reset" }) {
  const { verifyOtp, requestOtp } = useCoach();
  const navigate = useNavigate();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  function update(index: number, value: string) {
    if (value.length > 1) {
      const next = [...digits];
      value.slice(0, 6 - index).split("").forEach((char, offset) => {
        next[index + offset] = char;
      });
      setDigits(next);
      document.getElementById(`otp-${Math.min(5, index + value.length)}`)?.focus();
      return;
    }
    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);
    if (value) document.getElementById(`otp-${index + 1}`)?.focus();
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const code = digits.join("");
    setLoading(true);
    window.setTimeout(() => {
      const result = verifyOtp(code);
      setLoading(false);
      if (!result.ok) return;
      toast.success(result.purpose === "verify" ? "Email verified" : "Code accepted");
      if (result.purpose === "verify") navigate({ to: "/auth-success", search: { next: "setup", title: "Email verified" } });
      else navigate({ to: "/reset-password" });
    }, 350);
  }

  return (
    <AuthShell title="Enter your code" subtitle={`${email || "Your coach email"}. ${purpose === "reset" ? "Then choose a new password." : "This confirms your email."}`}>
      <form onSubmit={submit}>
        <div className="mb-5 flex justify-between gap-2" role="group" aria-label="Verification code">
          {digits.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              aria-label={`Digit ${index + 1}`}
              value={digit}
              onChange={(event) => update(index, event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Backspace" && !digit && index > 0) {
                  document.getElementById(`otp-${index - 1}`)?.focus();
                }
              }}
              className="h-14 w-full rounded-2xl border border-border bg-card text-center text-xl font-semibold text-foreground outline-none focus:border-primary"
            />
          ))}
        </div>
        <p className="mb-5 type-small text-muted-foreground">Sample code {SAMPLE_OTP}. No message is sent.</p>
        <Button type="submit" full loading={loading}>Verify</Button>
      </form>
      <button
        type="button"
        className="mt-4 min-h-11 text-sm font-semibold text-foreground underline"
        onClick={() => {
          if (email) requestOtp(email, purpose);
          toast("Sample code is still 246717");
        }}
      >
        Resend code
      </button>
    </AuthShell>
  );
}

export function ResetPasswordScreen() {
  const { resetPassword } = useCoach();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    resetPassword(password);
    navigate({ to: "/password-updated" });
  }

  return (
    <AuthShell title="Choose a new password" subtitle="You’ll use this the next time you sign in.">
      <form onSubmit={submit} noValidate>
        <PasswordField label="New password" autoComplete="new-password" placeholder="New password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <PasswordField label="Confirm password" autoComplete="new-password" placeholder="Repeat password" value={confirm} onChange={(event) => setConfirm(event.target.value)} />
        <Button type="submit" full>Update password</Button>
      </form>
    </AuthShell>
  );
}

export function PasswordUpdatedScreen() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-dvh flex-col justify-center bg-background px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="splash-in mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">✓</div>
      <h1 className="type-display mt-6 text-foreground">Password updated</h1>
      <p className="mt-3 type-body text-muted-foreground">Sign in with the new password.</p>
      <div className="mt-8">
        <Button full onClick={() => navigate({ to: "/login" })}>Back to sign in</Button>
      </div>
    </div>
  );
}

export function AuthSuccessScreen({ title, next }: { title: string; next: "setup" | "home" }) {
  const navigate = useNavigate();
  useEffect(() => {
    const timer = window.setTimeout(() => navigate({ to: next === "home" ? "/home" : "/setup", replace: true }), 1100);
    return () => window.clearTimeout(timer);
  }, [navigate, next]);
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-center">
      <div className="splash-in flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">✓</div>
      <h1 className="type-display mt-6 text-foreground">{title}</h1>
      <p className="mt-2 type-body text-muted-foreground">{next === "setup" ? "Next, set up your coach profile." : "Opening your dashboard."}</p>
    </div>
  );
}
