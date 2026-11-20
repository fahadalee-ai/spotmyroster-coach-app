import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button, Field, Input, Select, Textarea } from "@/components/kit";
import { FilterChip, ProgressBar } from "@/components/coach-ui";
import { AGE_GROUPS, COACH_LEVELS, SPORTS, type SetupDraft } from "@/lib/models";
import { US_STATES } from "@/lib/format";
import { useCoach } from "@/lib/store";

const emptyDraft = (firstName = "", lastName = ""): SetupDraft => ({
  firstName,
  lastName,
  sports: [],
  level: COACH_LEVELS[0],
  years: "",
  organization: "",
  city: "",
  state: "TX",
  bio: "",
  contactPreference: "in-app",
  socialLabel: "",
  socialUrl: "",
  certifications: "",
});

export function SetupScreen() {
  const { ready, user, data, saveDraft, completeSetup } = useCoach();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<SetupDraft>(emptyDraft());

  useEffect(() => {
    if (!ready) return;
    if (!user) navigate({ to: "/login", replace: true });
    else if (user.profileComplete) navigate({ to: "/home", replace: true });
  }, [ready, user, navigate]);

  useEffect(() => {
    if (!user) return;
    setDraft(data.setupDraft ?? emptyDraft(user.firstName, user.lastName));
  }, [user, data.setupDraft]);

  function patch(partial: Partial<SetupDraft>) {
    setDraft((current) => {
      const next = { ...current, ...partial };
      saveDraft(next);
      return next;
    });
  }

  function readPhoto(file: File | undefined) {
    if (!file) return;
    if (file.size > 2_000_000) {
      toast.error("Use a photo under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => patch({ photoUrl: String(reader.result) });
    reader.readAsDataURL(file);
  }

  function next() {
    if (step < 3) setStep((value) => value + 1);
    else {
      completeSetup(draft);
      navigate({ to: "/auth-success", search: { next: "home", title: "Profile ready" } });
    }
  }

  if (!user) return null;

  return (
    <div className="min-h-dvh bg-background px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
      <p className="type-caption text-dim">Coach profile · step {step + 1} of 4</p>
      <h1 className="type-title mt-2 text-foreground">
        {["Your name", "What you coach", "Your club", "How families reach you"][step]}
      </h1>
      <div className="mt-4">
        <ProgressBar value={((step + 1) / 4) * 100} />
      </div>
      <p className="mt-3 type-small text-muted-foreground">Progress is saved on this device. You can leave and finish later.</p>

      <div className="mt-6">
        {step === 0 && (
          <>
            <label className="mb-4 flex items-center gap-4">
              {draft.photoUrl ? (
                <img src={draft.photoUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
                  {(draft.firstName[0] ?? "C").toUpperCase()}
                </span>
              )}
              <span>
                <span className="block text-sm font-semibold text-foreground">Profile photo</span>
                <input type="file" accept="image/*" className="mt-2 text-sm text-muted-foreground" onChange={(event) => readPhoto(event.target.files?.[0])} />
              </span>
            </label>
            <Field label="First name">
              <Input value={draft.firstName} onChange={(event) => patch({ firstName: event.target.value })} />
            </Field>
            <Field label="Last name">
              <Input value={draft.lastName} onChange={(event) => patch({ lastName: event.target.value })} />
            </Field>
          </>
        )}
        {step === 1 && (
          <>
            <p className="type-label mb-2 text-muted-foreground">Sports</p>
            <div className="mb-4 flex flex-wrap gap-2">
              {SPORTS.map((sport) => (
                <FilterChip
                  key={sport}
                  selected={draft.sports.includes(sport)}
                  onClick={() =>
                    patch({
                      sports: draft.sports.includes(sport)
                        ? draft.sports.filter((item) => item !== sport)
                        : [...draft.sports, sport],
                    })
                  }
                >
                  {sport}
                </FilterChip>
              ))}
            </div>
            <p className="mb-4 type-helper text-dim">Sample sport list — confirm the official list with SpotMyRoster.</p>
            <Field label="Coaching level">
              <Select value={draft.level} onChange={(event) => patch({ level: event.target.value })}>
                {COACH_LEVELS.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </Select>
            </Field>
            <Field label="Years coaching">
              <Input inputMode="numeric" value={draft.years} onChange={(event) => patch({ years: event.target.value })} />
            </Field>
            <p className="type-helper text-dim">Sample levels, including age groups such as {AGE_GROUPS[2]}, are placeholders.</p>
          </>
        )}
        {step === 2 && (
          <>
            <Field label="Organization or club">
              <Input value={draft.organization} onChange={(event) => patch({ organization: event.target.value })} />
            </Field>
            <Field label="City">
              <Input value={draft.city} onChange={(event) => patch({ city: event.target.value })} />
            </Field>
            <Field label="State">
              <Select value={draft.state} onChange={(event) => patch({ state: event.target.value })}>
                {US_STATES.map((state) => (
                  <option key={state}>{state}</option>
                ))}
              </Select>
            </Field>
          </>
        )}
        {step === 3 && (
          <>
            <Field label="Bio" hint="Families see this on your coach profile.">
              <Textarea value={draft.bio} onChange={(event) => patch({ bio: event.target.value })} />
            </Field>
            <Field label="Preferred contact">
              <Select value={draft.contactPreference} onChange={(event) => patch({ contactPreference: event.target.value as SetupDraft["contactPreference"] })}>
                <option value="in-app">In-app messages</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
              </Select>
            </Field>
            <Field label="Certification notes" hint="Comma-separated. Do not invent credentials you do not hold.">
              <Input value={draft.certifications} onChange={(event) => patch({ certifications: event.target.value })} placeholder="Sample entry" />
            </Field>
            <Field label="Social or club link label">
              <Input value={draft.socialLabel} onChange={(event) => patch({ socialLabel: event.target.value })} />
            </Field>
            <Field label="Link">
              <Input type="url" value={draft.socialUrl} onChange={(event) => patch({ socialUrl: event.target.value })} placeholder="https://" />
            </Field>
          </>
        )}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-3">
        <Button variant="outline" type="button" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}>
          Back
        </Button>
        <Button type="button" onClick={next}>{step === 3 ? "Finish" : "Continue"}</Button>
      </div>
    </div>
  );
}
