import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/AuthShell";
import { PasswordField } from "@/components/AuthShell";
import { Logo, SampleLine } from "@/components/coach-ui";
import { Button, Field, Input } from "@/components/kit";
import { asset } from "@/lib/utils";
import { isEmail, passwordIssue, phoneIssue } from "@/lib/format";
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
  const { ready, data, user } = useCoach();
  const onboarded = data.onboarded;
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      if (!onboarded) navigate({ to: "/onboarding", replace: true });
      else if (!user) navigate({ to: "/login", replace: true });
      else if (!user.emailVerified) navigate({ to: "/otp", search: { purpose: "verify", email: user.email }, replace: true });
      else if (!user.profileComplete) navigate({ to: "/setup", replace: true });
      else navigate({ to: "/home", replace: true });
    }, reduced ? 200 : 1300);
    return () => window.clearTimeout(timer);
  }, [ready, onboarded, user, navigate]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6">
      <div className="splash-in">
        <Logo wide />
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
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <Logo />
        <button type="button" onClick={finish} className="min-h-11 px-2 text-sm font-semibold text-foreground">
          Skip
        </button>
      </div>
      <img src={asset(slide.image)} alt="" className="mx-5 mt-4 h-56 rounded-3xl object-cover" />
      <div className="flex flex-1 flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6">
        <div className="mb-4 flex gap-2" aria-hidden>
          {slides.map((item, itemIndex) => (
            <span key={item.title} className={itemIndex === index ? "h-1.5 flex-1 rounded-full bg-primary" : "h-1.5 flex-1 rounded-full bg-muted"} />
          ))}
        </div>
        <p className="type-caption text-dim">Coach</p>
        <h1 className="type-display mt-2 text-foreground">{slide.title}</h1>
        <p className="mt-3 type-body-lg text-muted-foreground">{slide.body}</p>
        <div className="mt-auto pt-8">
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
  );
}

export function LoginScreen() {
  const { ready, user, login } = useCoach();
  const navigate = useNavigate();
  const [email, setEmail] = useState("coach@spotmyroster.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && user?.emailVerified && user.profileComplete) navigate({ to: "/home", replace: true });
  }, [ready, user, navigate]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!isEmail(email)) return setError("Enter the email on your coach account.");
    if (!password) return setError("Enter your password.");
    setLoading(true);
    window.setTimeout(() => {
      const result = login(email, password);
      setLoading(false);
      if (!result.ok) return setError("That email and password do not match a coach account.");
      setError("");
      if (!result.user.emailVerified) {
        navigate({ to: "/otp", search: { purpose: "verify", email: result.user.email } });
      } else if (!result.user.profileComplete) navigate({ to: "/setup" });
      else navigate({ to: "/home" });
    }, 400);
  }

  return (
    <AuthShell title="Coach sign in" subtitle="Use the coach account for your club. Athlete sign-in is a separate app." showBack={false}>
      <SampleLine />
      <form className="mt-5" onSubmit={submit} noValidate>
        <Field label="Email" error={error && !password ? error : undefined}>
          <Input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </Field>
        <PasswordField label="Password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} error={error && password ? error : undefined} />
        {error && password && email ? null : error ? <p className="mb-3 type-helper text-danger">{error}</p> : null}
        <Button type="submit" full loading={loading}>
          Sign in
        </Button>
      </form>
      <p className="mt-4 type-small text-muted-foreground">
        Sample coach: coach@spotmyroster.com · password Roster2026
      </p>
      <div className="mt-6 flex flex-col gap-3 type-small">
        <Link to="/forgot-password" className="font-semibold text-foreground underline">
          Forgot password
        </Link>
        <p className="text-muted-foreground">
          New coach?{" "}
          <Link to="/register" className="font-semibold text-foreground underline">
            Create an account
          </Link>
        </p>
        <p className="text-muted-foreground">
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!form.firstName.trim()) next.firstName = "Enter your first name.";
    if (!form.lastName.trim()) next.lastName = "Enter your last name.";
    if (!isEmail(form.email)) next.email = "Enter a valid email.";
    const phone = phoneIssue(form.phone);
    if (phone) next.phone = phone;
    const password = passwordIssue(form.password);
    if (password) next.password = password;
    if (form.password !== form.confirm) next.confirm = "Passwords do not match.";
    if (!agreed) next.agreed = "Agree to the Terms and Privacy Policy to create an account.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    window.setTimeout(() => {
      const result = register(form);
      setLoading(false);
      if (!result.ok) {
        setErrors({ email: "A coach account already uses that email." });
        return;
      }
      navigate({ to: "/verify-email", search: { email: result.email } });
    }, 400);
  }

  return (
    <AuthShell title="Create coach account" subtitle="This account is for coaches only.">
      <form onSubmit={submit} noValidate>
        <Field label="First name" error={errors.firstName}>
          <Input autoComplete="given-name" value={form.firstName} onChange={(event) => set("firstName", event.target.value)} />
        </Field>
        <Field label="Last name" error={errors.lastName}>
          <Input autoComplete="family-name" value={form.lastName} onChange={(event) => set("lastName", event.target.value)} />
        </Field>
        <Field label="Email" error={errors.email}>
          <Input type="email" autoComplete="email" value={form.email} onChange={(event) => set("email", event.target.value)} />
        </Field>
        <Field label="Mobile" error={errors.phone}>
          <Input type="tel" autoComplete="tel" value={form.phone} onChange={(event) => set("phone", event.target.value)} />
        </Field>
        <PasswordField label="Password" autoComplete="new-password" value={form.password} onChange={(event) => set("password", event.target.value)} error={errors.password} />
        <PasswordField label="Confirm password" autoComplete="new-password" value={form.confirm} onChange={(event) => set("confirm", event.target.value)} error={errors.confirm} />
        <label className="mb-4 flex items-start gap-3 type-small text-foreground">
          <input type="checkbox" className="mt-1 h-5 w-5" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
          <span>
            I agree to the <Link to="/profile/terms" className="underline">Terms</Link> and <Link to="/profile/privacy-policy" className="underline">Privacy Policy</Link>.
          </span>
        </label>
        {errors.agreed && <p className="mb-3 type-helper text-danger">{errors.agreed}</p>}
        <Button type="submit" full loading={loading}>Create account</Button>
      </form>
    </AuthShell>
  );
}

export function ForgotPasswordScreen() {
  const { requestOtp } = useCoach();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!isEmail(email)) return setError("Enter the email on your coach account.");
    const result = requestOtp(email, "reset");
    if (!result.ok) return setError("No coach account uses that email.");
    navigate({ to: "/otp", search: { purpose: "reset", email: email.trim().toLowerCase() } });
  }

  return (
    <AuthShell title="Reset password" subtitle="We will ask for a verification code next. No email is sent in this preview.">
      <form onSubmit={submit} noValidate>
        <Field label="Email" error={error}>
          <Input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </Field>
        <Button type="submit" full>Continue</Button>
      </form>
    </AuthShell>
  );
}

export function VerifyEmailScreen({ email }: { email: string }) {
  const navigate = useNavigate();
  return (
    <AuthShell title="Check your email" subtitle={`A verification step is ready for ${email || "your email"}. Nothing is sent from a server in this preview.`}>
      <p className="type-body text-muted-foreground">Use the sample code on the next screen to verify this coach account.</p>
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(index: number, value: string) {
    const clean = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    if (clean) {
      const input = document.getElementById(`otp-${index + 1}`) as HTMLInputElement | null;
      input?.focus();
    }
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const code = digits.join("");
    if (code.length < 6) return setError("Enter the 6-digit code.");
    setLoading(true);
    window.setTimeout(() => {
      const result = verifyOtp(code);
      setLoading(false);
      if (!result.ok) return setError("That code is not valid.");
      toast.success(result.purpose === "verify" ? "Email verified" : "Code accepted");
      if (result.purpose === "verify") navigate({ to: "/auth-success", search: { next: "setup", title: "Email verified" } });
      else navigate({ to: "/reset-password" });
    }, 350);
  }

  return (
    <AuthShell title="Enter the code" subtitle={`For ${email || "your coach email"}. ${purpose === "reset" ? "This resets your password." : "This verifies your email."}`}>
      <form onSubmit={submit}>
        <div className="mb-4 flex justify-between gap-2" role="group" aria-label="Verification code">
          {digits.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              aria-label={`Digit ${index + 1}`}
              value={digit}
              onChange={(event) => update(index, event.target.value)}
              className="h-14 w-full rounded-xl border border-border bg-card text-center text-xl font-semibold text-foreground"
            />
          ))}
        </div>
        {error && <p className="mb-3 type-helper text-danger">{error}</p>}
        <p className="mb-4 type-small text-muted-foreground">Sample code: {SAMPLE_OTP}. No message is sent.</p>
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
  const { data, resetPassword } = useCoach();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const issue = passwordIssue(password);
    if (issue) return setError(issue);
    if (password !== confirm) return setError("Passwords do not match.");
    if (!data.pendingAuth?.verified) return setError("Verify the code before choosing a new password.");
    const ok = resetPassword(password);
    if (!ok) return setError("The reset step expired. Request a new code.");
    navigate({ to: "/password-updated" });
  }

  return (
    <AuthShell title="Choose a new password" subtitle="Use at least 8 characters and one number.">
      <form onSubmit={submit} noValidate>
        <PasswordField label="New password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <PasswordField label="Confirm password" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} error={error} />
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
