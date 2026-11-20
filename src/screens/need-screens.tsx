import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AppFrame, EmptyState, FilterChip, Segmented, StatusBadge } from "@/components/coach-ui";
import { Button, Field, Header, Input, Select, Textarea } from "@/components/kit";
import { newId, shortDate } from "@/lib/format";
import { AGE_GROUPS, type NeedStatus, type RosterNeed } from "@/lib/models";
import { US_STATES } from "@/lib/format";
import { useCoach } from "@/lib/store";

const FILTERS: Array<NeedStatus | "All"> = ["All", "Open", "Filled", "Closed"];

export function NeedsScreen() {
  const { data } = useCoach();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const needs = data.needs.filter((need) => filter === "All" || need.status === filter);

  return (
    <AppFrame>
      <div className="px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="type-title text-foreground">Roster needs</h1>
          <Button onClick={() => navigate({ to: "/needs/new" })}>Post</Button>
        </div>
        <Segmented
          value="needs"
          options={[{ id: "teams", label: "My teams" }, { id: "needs", label: "Roster needs" }]}
          onChange={(id) => { if (id === "teams") navigate({ to: "/teams" }); }}
        />
        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map((item) => (
            <FilterChip key={item} selected={filter === item} onClick={() => setFilter(item)}>{item}</FilterChip>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {needs.length === 0 && <EmptyState title="No openings" body="Post a roster need when a spot is actually open." />}
          {needs.map((need) => {
            const team = data.teams.find((item) => item.id === need.teamId);
            const applicants = data.applications.filter((item) => item.needId === need.id).length;
            return (
              <Link key={need.id} to="/needs/$needId" params={{ needId: need.id }} className="block rounded-2xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="type-sub text-foreground">{need.positions.join(", ")}</p>
                    <p className="type-small text-muted-foreground">{team?.name} · {need.spots} {need.spots === 1 ? "spot" : "spots"}</p>
                  </div>
                  <StatusBadge status={need.status} />
                </div>
                <p className="mt-2 type-small text-dim">{need.city}, {need.state} · Due {shortDate(need.deadline)} · {applicants} inquiries</p>
              </Link>
            );
          })}
        </div>
      </div>
    </AppFrame>
  );
}

export function NeedFormScreen({ needId }: { needId?: string }) {
  const { data, saveNeed } = useCoach();
  const navigate = useNavigate();
  const existing = data.needs.find((need) => need.id === needId);
  const [form, setForm] = useState<RosterNeed>(
    existing ?? {
      id: newId("need"),
      teamId: data.teams.find((team) => !team.archived)?.id ?? "",
      positions: [],
      spots: 1,
      ageGroup: "14U",
      skill: "Travel",
      city: "",
      state: "TX",
      deadline: "",
      requirements: "",
      description: "",
      status: "Open",
    },
  );
  const [position, setPosition] = useState("");
  const [error, setError] = useState("");

  function save(event: FormEvent) {
    event.preventDefault();
    const positions = form.positions.length ? form.positions : position.trim() ? [position.trim()] : [];
    if (!form.teamId || positions.length === 0 || !form.deadline) {
      setError("Choose a team, a position, and a deadline.");
      return;
    }
    saveNeed({ ...form, positions, city: form.city.trim() });
    toast.success(existing ? "Opening updated" : "Opening posted");
    navigate({ to: "/needs/$needId", params: { needId: form.id } });
  }

  return (
    <AppFrame>
      <Header title={existing ? "Edit opening" : "Post a roster need"} fallbackTo="/needs" />
      <form className="px-5 pb-8" onSubmit={save}>
        <Field label="Team">
          <Select value={form.teamId} onChange={(event) => setForm({ ...form, teamId: event.target.value })}>
            <option value="">Select a team</option>
            {data.teams.filter((team) => !team.archived).map((team) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Add a position">
          <div className="flex gap-2">
            <Input value={position} onChange={(event) => setPosition(event.target.value)} placeholder="Shortstop" />
            <Button type="button" variant="outline" onClick={() => {
              if (!position.trim()) return;
              setForm({ ...form, positions: [...form.positions, position.trim()] });
              setPosition("");
            }}>Add</Button>
          </div>
        </Field>
        <div className="mb-4 flex flex-wrap gap-2">
          {form.positions.map((item) => (
            <button type="button" key={item} className="min-h-10 rounded-full bg-muted px-3 text-sm text-foreground" onClick={() => setForm({ ...form, positions: form.positions.filter((positionName) => positionName !== item) })}>
              {item} · remove
            </button>
          ))}
        </div>
        <Field label="Number of spots"><Input inputMode="numeric" value={String(form.spots)} onChange={(event) => setForm({ ...form, spots: Number(event.target.value) || 0 })} /></Field>
        <Field label="Age group">
          <Select value={form.ageGroup} onChange={(event) => setForm({ ...form, ageGroup: event.target.value })}>
            {AGE_GROUPS.map((group) => <option key={group}>{group}</option>)}
          </Select>
        </Field>
        <Field label="Skill level">
          <Select value={form.skill} onChange={(event) => setForm({ ...form, skill: event.target.value })}>
            {["Developing", "Travel", "Elite travel"].map((skill) => <option key={skill}>{skill}</option>)}
          </Select>
        </Field>
        <Field label="City"><Input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></Field>
        <Field label="State">
          <Select value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })}>
            {US_STATES.map((state) => <option key={state}>{state}</option>)}
          </Select>
        </Field>
        <Field label="Deadline"><Input type="date" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} /></Field>
        <Field label="Requirements"><Textarea value={form.requirements} onChange={(event) => setForm({ ...form, requirements: event.target.value })} /></Field>
        <Field label="Description"><Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field>
        {error && <p className="mb-3 type-helper text-danger">{error}</p>}
        <Button type="submit" full>Save opening</Button>
      </form>
    </AppFrame>
  );
}

export function NeedDetailScreen({ needId }: { needId: string }) {
  const { data, setNeedStatus } = useCoach();
  const navigate = useNavigate();
  const need = data.needs.find((item) => item.id === needId);
  const team = data.teams.find((item) => item.id === need?.teamId);
  const applicants = data.applications.filter((item) => item.needId === needId);
  const [preview, setPreview] = useState(false);

  if (!need) {
    return (
      <AppFrame>
        <Header title="Opening" fallbackTo="/needs" />
        <div className="px-5"><EmptyState title="Opening not found" body="It is not on this device." /></div>
      </AppFrame>
    );
  }

  return (
    <AppFrame>
      <Header title={need.positions.join(", ")} subtitle={team?.name} fallbackTo="/needs" right={<Button variant="ghost" onClick={() => navigate({ to: "/needs/$needId/edit", params: { needId } })}>Edit</Button>} />
      <div className="px-5 pb-8">
        <StatusBadge status={need.status} />
        <p className="mt-4 type-body text-foreground">{need.description}</p>
        <p className="mt-3 type-small text-muted-foreground">{need.spots} spots · {need.ageGroup} · {need.skill}</p>
        <p className="type-small text-muted-foreground">{need.city}, {need.state} · Deadline {shortDate(need.deadline)}</p>
        <p className="mt-3 type-small text-foreground">{need.requirements}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setPreview((value) => !value)}>{preview ? "Hide preview" : "Athlete preview"}</Button>
          {need.status === "Open" && <Button variant="outline" onClick={() => { setNeedStatus(need.id, "Filled"); toast("Marked filled"); }}>Mark filled</Button>}
          {need.status !== "Closed" && <Button variant="ghost" onClick={() => { setNeedStatus(need.id, "Closed"); toast("Opening closed"); }}>Close</Button>}
          {need.status !== "Open" && <Button variant="outline" onClick={() => { setNeedStatus(need.id, "Open"); toast("Opening reopened"); }}>Reopen</Button>}
        </div>
        {preview && (
          <article className="mt-4 rounded-2xl bg-muted p-4">
            <p className="type-caption text-dim">Visible to families</p>
            <p className="type-sub mt-2 text-foreground">{team?.name} needs {need.positions.join(" / ")}</p>
            <p className="mt-1 type-small text-foreground">{need.description}</p>
            <p className="mt-2 type-small text-muted-foreground">{need.city}, {need.state} · {need.ageGroup}</p>
          </article>
        )}
        <h2 className="type-section mt-8 text-foreground">Inquiries</h2>
        <div className="mt-3 space-y-2">
          {applicants.length === 0 && <p className="type-small text-muted-foreground">No inquiries yet.</p>}
          {applicants.map((application) => {
            const athlete = data.athletes.find((item) => item.id === application.athleteId);
            return (
              <Link key={application.id} to="/recruit/applications/$applicationId" params={{ applicationId: application.id }} className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
                <span>
                  <span className="block type-sub text-foreground">{athlete?.displayName}</span>
                  <span className="type-small text-muted-foreground">{shortDate(application.submittedAt)}</span>
                </span>
                <StatusBadge status={application.stage} />
              </Link>
            );
          })}
        </div>
      </div>
    </AppFrame>
  );
}
