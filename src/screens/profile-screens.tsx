import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { Logo, AppFrame, ConfirmDialog, PersonAvatar } from "@/components/coach-ui";
import { LanguagePicker, type LanguageId } from "@/components/LanguagePicker";
import { Button, Field, Header, Input, Row, Select, Textarea } from "@/components/kit";
import { PasswordField } from "@/components/AuthShell";
import { US_STATES } from "@/lib/format";
import { NOTICE_CATEGORIES, SPORTS, type Coach } from "@/lib/models";
import { useCoach } from "@/lib/store";

function Frame({ title, children }: { title: string; children: ReactNode }) {
  const { ready, user } = useCoach();
  if (ready && user?.profileComplete) {
    return (
      <AppFrame>
        <Header title={title} fallbackTo="/profile" />
        <div className="px-5 pb-8">{children}</div>
      </AppFrame>
    );
  }
  return (
    <div className="min-h-dvh bg-background">
      <Header title={title} fallbackTo="/login" />
      <div className="px-5 pb-8">{children}</div>
    </div>
  );
}

export function ProfileScreen() {
  const { user, logout } = useCoach();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  if (!user) return null;
  const rows = [
    ["/profile/edit", "Edit profile"],
    ["/profile/password", "Change password"],
    ["/listings", "Listings"],
    ["/subscription", "Subscription"],
    ["/payments", "Payment history"],
    ["/alerts", "Alerts"],
    ["/coach", "Coach menu"],
    ["/profile/organization", "Organization"],
    ["/profile/certifications", "Certifications"],
    ["/profile/notifications", "Notifications"],
    ["/profile/language", "Language"],
    ["/profile/theme", "Theme and text size"],
    ["/profile/privacy", "Privacy"],
    ["/profile/blocked", "Blocked users"],
    ["/profile/terms", "Terms"],
    ["/profile/privacy-policy", "Privacy policy"],
    ["/profile/help", "Help and support"],
    ["/profile/about", "About"],
    ["/profile/delete", "Delete account"],
  ] as const;
  return (
    <AppFrame>
      <div className="px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-3">
          <PersonAvatar name={`${user.firstName} ${user.lastName}`} src={user.photoUrl} size={64} />
          <div>
            <h1 className="type-title text-foreground">{user.firstName} {user.lastName}</h1>
            <p className="type-small text-muted-foreground">{user.organization || "Add your club"}</p>
            <p className="type-small text-dim">{user.city}, {user.state}</p>
          </div>
        </div>
        <p className="mt-4 type-body text-foreground">{user.bio}</p>
        <div className="mt-6 overflow-hidden rounded-2xl border border-border">
          {rows.map(([to, label]) => (
            <Row key={to} to={to} label={label} />
          ))}
        </div>
        <div className="mt-6">
          <Button variant="danger" full onClick={() => setConfirm(true)}>Log out</Button>
        </div>
      </div>
      <ConfirmDialog
        open={confirm}
        title="Log out?"
        body="Your sample data stays on this device. You can sign in again with the same email."
        confirmLabel="Log out"
        danger
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          logout();
          navigate({ to: "/login" });
        }}
      />
    </AppFrame>
  );
}

export function EditProfileScreen() {
  const { user, updateProfile } = useCoach();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    phone: user?.phone ?? "",
    bio: user?.bio ?? "",
    contactPreference: user?.contactPreference ?? "in-app",
    sports: user?.sports ?? [],
    photoUrl: user?.photoUrl,
  });
  function save(event: FormEvent) {
    event.preventDefault();
    updateProfile({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      bio: form.bio.trim(),
      contactPreference: form.contactPreference,
      sports: form.sports,
      photoUrl: form.photoUrl,
    });
    toast.success("Profile saved");
    navigate({ to: "/profile" });
  }

  return (
    <AppFrame>
      <Header title="Edit profile" fallbackTo="/profile" />
      <form className="px-5 pb-8" onSubmit={save}>
        <label className="mb-4 block text-sm text-foreground">
          Photo
          <input type="file" accept="image/*" className="mt-2 block" onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => setForm((current) => ({ ...current, photoUrl: String(reader.result) }));
            reader.readAsDataURL(file);
          }} />
        </label>
        <Field label="First name"><Input value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} /></Field>
        <Field label="Last name"><Input value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} /></Field>
        <Field label="Email"><Input value={user?.email ?? ""} disabled /></Field>
        <Field label="Mobile"><Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></Field>
        <p className="type-label mb-2 text-muted-foreground">Sports</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {SPORTS.map((sport) => {
            const selected = form.sports.includes(sport);
            return (
              <button key={sport} type="button" aria-pressed={selected} className={`min-h-10 rounded-full px-3 text-sm font-semibold ${selected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`} onClick={() => setForm({ ...form, sports: selected ? form.sports.filter((item) => item !== sport) : [...form.sports, sport] })}>
                {sport}
              </button>
            );
          })}
        </div>
        <Field label="Bio"><Textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} /></Field>
        <Field label="Preferred contact">
          <Select value={form.contactPreference} onChange={(event) => setForm({ ...form, contactPreference: event.target.value as Coach["contactPreference"] })}>
            <option value="in-app">In-app messages</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
          </Select>
        </Field>
        <Button type="submit" full>Save</Button>
      </form>
    </AppFrame>
  );
}

export function PasswordScreen() {
  const { changePassword } = useCoach();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  function save(event: FormEvent) {
    event.preventDefault();
    changePassword(current, next);
    toast.success("Password changed");
    setCurrent(""); setNext(""); setConfirm("");
  }
  return (
    <AppFrame>
      <Header title="Change password" fallbackTo="/profile" />
      <form className="px-5" onSubmit={save}>
        <PasswordField label="Current password" value={current} onChange={(event) => setCurrent(event.target.value)} />
        <PasswordField label="New password" value={next} onChange={(event) => setNext(event.target.value)} />
        <PasswordField label="Confirm password" value={confirm} onChange={(event) => setConfirm(event.target.value)} />
        <Button type="submit" full>Update password</Button>
      </form>
    </AppFrame>
  );
}

export function OrganizationScreen() {
  const { user, updateProfile } = useCoach();
  const [organization, setOrganization] = useState(user?.organization ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [state, setState] = useState(user?.state ?? "TX");
  const [level, setLevel] = useState(user?.level ?? "");
  const [years, setYears] = useState(String(user?.years ?? ""));
  return (
    <AppFrame>
      <Header title="Organization" fallbackTo="/profile" />
      <form className="px-5" onSubmit={(event) => { event.preventDefault(); updateProfile({ organization, city, state, level, years: Number(years) || 0 }); toast.success("Club info saved"); }}>
        <Field label="Club or organization"><Input value={organization} onChange={(event) => setOrganization(event.target.value)} /></Field>
        <Field label="City"><Input value={city} onChange={(event) => setCity(event.target.value)} /></Field>
        <Field label="State">
          <Select value={state} onChange={(event) => setState(event.target.value)}>{US_STATES.map((item) => <option key={item}>{item}</option>)}</Select>
        </Field>
        <Field label="Coaching level"><Input value={level} onChange={(event) => setLevel(event.target.value)} /></Field>
        <Field label="Years coaching"><Input inputMode="numeric" value={years} onChange={(event) => setYears(event.target.value)} /></Field>
        <Button type="submit" full>Save</Button>
      </form>
    </AppFrame>
  );
}

export function CertificationsScreen() {
  const { user, updateProfile } = useCoach();
  const [items, setItems] = useState(user?.certifications ?? []);
  const [draft, setDraft] = useState("");
  return (
    <AppFrame>
      <Header title="Certifications" fallbackTo="/profile" />
      <div className="px-5">
        <p className="type-small text-muted-foreground">Add only credentials you actually hold. This list is sample storage, not a verification.</p>
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li key={item} className="flex items-center justify-between gap-3 rounded-xl bg-card px-3 py-3">
              <span className="type-small text-foreground">{item}</span>
              <button type="button" className="min-h-11 text-sm font-semibold text-foreground" onClick={() => setItems(items.filter((entry) => entry !== item))}>Remove</button>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex gap-2">
          <Input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Credential name" aria-label="Credential" />
          <Button type="button" onClick={() => { setItems([...items, draft.trim()]); setDraft(""); }}>Add</Button>
        </div>
        <div className="mt-4">
          <Button full onClick={() => { updateProfile({ certifications: items }); toast.success("Certifications saved"); }}>Save</Button>
        </div>
      </div>
    </AppFrame>
  );
}

export function NotificationSettingsScreen() {
  const { user, toggleNotif } = useCoach();
  if (!user) return null;
  return (
    <AppFrame>
      <Header title="Notifications" fallbackTo="/profile" />
      <div className="px-5">
        <p className="mb-3 type-small text-muted-foreground">Muted categories are hidden in the notification list. Push delivery is not connected.</p>
        {NOTICE_CATEGORIES.map((key) => (
          <label key={key} className="flex min-h-14 items-center justify-between border-b border-border">
            <span className="text-sm font-semibold text-foreground">{key}</span>
            <input type="checkbox" className="h-5 w-5" checked={user.notifPrefs[key]} onChange={() => toggleNotif(key)} />
          </label>
        ))}
      </div>
    </AppFrame>
  );
}

export function LanguageScreen() {
  const { user, setLanguage } = useCoach();
  if (!user) return null;
  return (
    <AppFrame>
      <Header title="Language" fallbackTo="/profile" />
      <div className="px-5">
        <LanguagePicker value={user.language} onChange={(id: LanguageId) => { setLanguage(id); toast.success(id === "es" ? "Idioma guardado" : "Language saved"); }} />
        <p className="mt-4 type-small text-muted-foreground">Tab labels follow this choice. Course and roster copy stays in English until translations are supplied.</p>
      </div>
    </AppFrame>
  );
}

export function ThemeScreen() {
  const { user, setTheme, setTextScale } = useCoach();
  if (!user) return null;
  return (
    <AppFrame>
      <Header title="Theme and text" fallbackTo="/profile" />
      <div className="space-y-4 px-5">
        <div className="grid grid-cols-2 gap-2">
          {(["dark", "light"] as const).map((theme) => (
            <button key={theme} type="button" aria-pressed={user.theme === theme} className={`min-h-14 rounded-xl font-semibold capitalize ${user.theme === theme ? "bg-primary text-primary-foreground" : "bg-card text-foreground"}`} onClick={() => setTheme(theme)}>
              {theme}
            </button>
          ))}
        </div>
        <p className="type-label text-muted-foreground">Text size</p>
        <div className="grid grid-cols-3 gap-2">
          {(["small", "default", "large"] as const).map((scale) => (
            <button key={scale} type="button" aria-pressed={user.textScale === scale} className={`min-h-12 rounded-xl text-sm font-semibold capitalize ${user.textScale === scale ? "bg-primary text-primary-foreground" : "bg-card text-foreground"}`} onClick={() => setTextScale(scale)}>
              {scale}
            </button>
          ))}
        </div>
      </div>
    </AppFrame>
  );
}

export function PrivacyScreen() {
  const { user, updatePrivacy } = useCoach();
  if (!user) return null;
  return (
    <AppFrame>
      <Header title="Privacy" fallbackTo="/profile" />
      <div className="space-y-4 px-5">
        <Toggle label="Show my email to families" checked={user.privacy.showEmail} onChange={() => updatePrivacy({ showEmail: !user.privacy.showEmail })} />
        <Toggle label="Show my phone to families" checked={user.privacy.showPhone} onChange={() => updatePrivacy({ showPhone: !user.privacy.showPhone })} />
        <Toggle label="Keep a guardian on athlete messages" checked={user.privacy.guardianRequired} onChange={() => updatePrivacy({ guardianRequired: true })} />
        <p className="type-small text-muted-foreground">
          Athlete phone numbers and street addresses are never shown in this coach app. Guardian-mediated messaging stays on even if you try to turn it off, until SpotMyRoster counsel confirms the age rules. COPPA and state privacy duties need a legal review before launch.
        </p>
        <div className="rounded-2xl bg-card p-4 type-small text-foreground">
          <p>Email visible to families: {user.privacy.showEmail ? user.email : "Hidden"}</p>
          <p className="mt-1">Phone visible to families: {user.privacy.showPhone ? user.phone : "Hidden"}</p>
        </div>
      </div>
    </AppFrame>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex min-h-14 items-center justify-between gap-3 rounded-xl bg-card px-3">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <input type="checkbox" className="h-5 w-5" checked={checked} onChange={onChange} />
    </label>
  );
}

export function BlockedScreen() {
  const { data, unblockConversation } = useCoach();
  const blocked = data.conversations.filter((conversation) => conversation.blocked);
  return (
    <AppFrame>
      <Header title="Blocked users" fallbackTo="/profile" />
      <div className="space-y-2 px-5">
        {blocked.length === 0 && <p className="type-small text-muted-foreground">No blocked guardians.</p>}
        {blocked.map((conversation) => (
          <div key={conversation.id} className="flex items-center justify-between rounded-xl bg-card px-3 py-3">
            <span>
              <span className="block type-sub text-foreground">{conversation.participantName}</span>
              <span className="type-small text-muted-foreground">{conversation.athleteLabel}</span>
            </span>
            <Button variant="outline" onClick={() => unblockConversation(conversation.id)}>Unblock</Button>
          </div>
        ))}
      </div>
    </AppFrame>
  );
}

export function TermsScreen() {
  return (
    <Frame title="Terms">
      <LegalCopy title="Terms and conditions" />
    </Frame>
  );
}

export function PrivacyPolicyScreen() {
  return (
    <Frame title="Privacy policy">
      <LegalCopy title="Privacy policy" />
    </Frame>
  );
}

function LegalCopy({ title }: { title: string }) {
  return (
    <article className="space-y-3">
      <h2 className="type-title text-foreground">{title}</h2>
      <p className="type-body text-foreground">
        SpotMyRoster has not provided the legal text for this screen. This is not a terms of use or a privacy policy.
      </p>
      <p className="type-body text-muted-foreground">
        Ask the client for the approved copy before release. Contact greg@spotmyroster.com or +1 220-246-7172.
      </p>
      <a className="inline-flex min-h-11 items-center font-semibold text-foreground underline" href="https://www.spotmyroster.com">spotmyroster.com</a>
    </article>
  );
}

export function HelpScreen() {
  return (
    <Frame title="Help">
      <p className="type-body text-foreground">Support hours are not published in the materials provided.</p>
      <div className="mt-4 space-y-3">
        <a className="block rounded-2xl bg-card px-4 py-4" href="mailto:greg@spotmyroster.com">
          <span className="type-caption text-dim">Email</span>
          <span className="block type-sub text-foreground">greg@spotmyroster.com</span>
        </a>
        <a className="block rounded-2xl bg-card px-4 py-4" href="tel:+12202467172">
          <span className="type-caption text-dim">Phone</span>
          <span className="block type-sub text-foreground">+1 220-246-7172</span>
        </a>
      </div>
    </Frame>
  );
}

export function AboutScreen() {
  const { resetSample } = useCoach();
  return (
    <Frame title="About">
      <Logo wide />
      <h2 className="type-title mt-4 text-foreground">SpotMyRoster</h2>
      <p className="mt-2 type-body text-muted-foreground">Coach preview for connecting travel coaches with families who need a roster spot.</p>
      <p className="mt-3 type-small text-foreground">Version 0.2 · Sample data on this device</p>
      <p className="mt-3 type-small text-muted-foreground">
        Headings are set in Tactic Sans when the font files are installed. This build is waiting on TacticSans-Regular.woff2 and TacticSans-Bold.woff2. Inter Tight is the temporary fallback.
      </p>
      <a className="mt-4 inline-flex min-h-11 items-center font-semibold text-foreground underline" href="https://www.spotmyroster.com">www.spotmyroster.com</a>
      <div className="mt-6">
        <Button variant="outline" onClick={() => { resetSample(); toast("Sample data reset"); window.location.assign(import.meta.env.BASE_URL || "/"); }}>Reset sample data</Button>
      </div>
      <p className="mt-6 type-small text-muted-foreground">
        Subscription and payment screens are not included. Pricing was not provided.
      </p>
    </Frame>
  );
}

export function DeleteAccountScreen() {
  const { deleteAccount } = useCoach();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  return (
    <AppFrame>
      <Header title="Delete account" fallbackTo="/profile" />
      <div className="px-5">
        <p className="type-body text-muted-foreground">This removes the coach login stored on this device. It does not contact SpotMyRoster servers.</p>
        <div className="mt-6">
          <Button variant="danger" full onClick={() => setOpen(true)}>Delete account</Button>
        </div>
      </div>
      <ConfirmDialog
        open={open}
        title="Delete this coach account?"
        body="You will need to register again to use the coach app on this device."
        confirmLabel="Delete"
        danger
        onClose={() => setOpen(false)}
        onConfirm={() => {
          deleteAccount();
          navigate({ to: "/login" });
        }}
      />
    </AppFrame>
  );
}

export function ProfileLinkRow() {
  return <Link to="/profile" className="sr-only">Profile</Link>;
}
