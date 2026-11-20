import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AppFrame, ConfirmDialog, EmptyState, FilterChip, PersonAvatar, Segmented, StatusBadge } from "@/components/coach-ui";
import { Button, Field, Header, Input, Select, Textarea } from "@/components/kit";
import { newId } from "@/lib/format";
import { AGE_GROUPS, SPORTS, type RosterMember, type Team } from "@/lib/models";
import { US_STATES } from "@/lib/format";
import { useCoach } from "@/lib/store";

export function TeamsScreen() {
  const { data } = useCoach();
  const navigate = useNavigate();
  const [showArchived, setShowArchived] = useState(false);
  const teams = data.teams.filter((team) => team.archived === showArchived);

  return (
    <AppFrame>
      <div className="px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="type-title text-foreground">Teams</h1>
          <Button type="button" onClick={() => navigate({ to: "/teams/new" })}>New</Button>
        </div>
        <Segmented
          value="teams"
          options={[{ id: "teams", label: "My teams" }, { id: "needs", label: "Roster needs" }]}
          onChange={(id) => { if (id === "needs") navigate({ to: "/needs" }); }}
        />
        <div className="mt-4 flex gap-2">
          <FilterChip selected={!showArchived} onClick={() => setShowArchived(false)}>Active</FilterChip>
          <FilterChip selected={showArchived} onClick={() => setShowArchived(true)}>Archived</FilterChip>
        </div>
        <div className="mt-4 space-y-3">
          {teams.length === 0 && <EmptyState title={showArchived ? "No archived teams" : "No teams yet"} body="Create a team to track its roster and open spots." action={<Button onClick={() => navigate({ to: "/teams/new" })}>Create team</Button>} />}
          {teams.map((team) => {
            const filled = data.roster.filter((member) => member.teamId === team.id).length;
            return (
              <Link key={team.id} to="/teams/$teamId" params={{ teamId: team.id }} className="block rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <PersonAvatar name={team.name} src={team.logoUrl} size={48} />
                  <div className="min-w-0 flex-1">
                    <p className="type-sub text-foreground">{team.name}</p>
                    <p className="type-small text-muted-foreground">{team.sport} · {team.ageGroup} · {team.city}, {team.state}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="type-small text-muted-foreground">{filled} of {team.capacity} roster spots</span>
                  <StatusBadge status={team.archived ? "Closed" : "Open"} />
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary" style={{ width: `${Math.min(100, (filled / team.capacity) * 100)}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AppFrame>
  );
}

export function TeamFormScreen({ teamId }: { teamId?: string }) {
  const { data, saveTeam } = useCoach();
  const navigate = useNavigate();
  const existing = data.teams.find((team) => team.id === teamId);
  const [form, setForm] = useState<Team>(
    existing ?? {
      id: newId("team"),
      name: "",
      sport: "Baseball",
      ageGroup: "14U",
      gender: "Boys",
      level: "Travel",
      season: "",
      city: "",
      state: "TX",
      practice: "",
      description: "",
      league: "",
      capacity: 12,
      archived: false,
    },
  );
  function save(event: FormEvent) {
    event.preventDefault();
    saveTeam({ ...form, name: form.name.trim(), city: form.city.trim() });
    toast.success(existing ? "Team updated" : "Team created");
    navigate({ to: "/teams/$teamId", params: { teamId: form.id } });
  }

  return (
    <AppFrame>
      <Header title={existing ? "Edit team" : "Create team"} fallbackTo="/teams" />
      <form className="px-5 pb-8" onSubmit={save}>
        <LogoField value={form.logoUrl} onChange={(logoUrl) => setForm({ ...form, logoUrl })} />
        <Field label="Team name"><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
        <Field label="Sport">
          <Select value={form.sport} onChange={(event) => setForm({ ...form, sport: event.target.value })}>
            {SPORTS.map((sport) => <option key={sport}>{sport}</option>)}
          </Select>
        </Field>
        <Field label="Age group">
          <Select value={form.ageGroup} onChange={(event) => setForm({ ...form, ageGroup: event.target.value })}>
            {AGE_GROUPS.map((group) => <option key={group}>{group}</option>)}
          </Select>
        </Field>
        <Field label="Gender">
          <Select value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })}>
            {["Boys", "Girls", "Coed"].map((item) => <option key={item}>{item}</option>)}
          </Select>
        </Field>
        <Field label="Level / division"><Input value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value })} /></Field>
        <Field label="Season"><Input value={form.season} onChange={(event) => setForm({ ...form, season: event.target.value })} placeholder="Fall 2026" /></Field>
        <Field label="City"><Input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></Field>
        <Field label="State">
          <Select value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })}>
            {US_STATES.map((state) => <option key={state}>{state}</option>)}
          </Select>
        </Field>
        <Field label="Practice schedule"><Input value={form.practice} onChange={(event) => setForm({ ...form, practice: event.target.value })} /></Field>
        <Field label="Roster capacity"><Input inputMode="numeric" value={String(form.capacity)} onChange={(event) => setForm({ ...form, capacity: Number(event.target.value) || 0 })} /></Field>
        <Field label="League or circuit" hint="Leave blank if the client has not named a circuit.">
          <Input value={form.league} onChange={(event) => setForm({ ...form, league: event.target.value })} />
        </Field>
        <Field label="Description"><Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field>
        <Button type="submit" full>{existing ? "Save changes" : "Create team"}</Button>
      </form>
    </AppFrame>
  );
}

function LogoField({ value, onChange }: { value?: string; onChange: (value?: string) => void }) {
  return (
    <label className="mb-4 flex items-center gap-3">
      <PersonAvatar name="Team" src={value} size={56} />
      <span>
        <span className="block text-sm font-semibold text-foreground">Team photo</span>
        <input
          type="file"
          accept="image/*"
          className="mt-1 text-sm"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            if (file.size > 2_000_000) {
              toast.error("Use an image under 2 MB.");
              return;
            }
            const reader = new FileReader();
            reader.onload = () => onChange(String(reader.result));
            reader.readAsDataURL(file);
          }}
        />
      </span>
    </label>
  );
}

export function TeamDetailScreen({ teamId }: { teamId: string }) {
  const { data, archiveTeam } = useCoach();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const team = data.teams.find((item) => item.id === teamId);
  const roster = data.roster.filter((member) => member.teamId === teamId);
  const needs = data.needs.filter((need) => need.teamId === teamId);
  if (!team) {
    return (
      <AppFrame>
        <Header title="Team" fallbackTo="/teams" />
        <div className="px-5"><EmptyState title="Team not found" body="It may have been removed from this device." /></div>
      </AppFrame>
    );
  }
  return (
    <AppFrame>
      <Header title={team.name} subtitle={`${team.city}, ${team.state}`} fallbackTo="/teams" right={<Button variant="ghost" onClick={() => navigate({ to: "/teams/$teamId/edit", params: { teamId } })}>Edit</Button>} />
      <div className="px-5 pb-8">
        <div className="flex items-center gap-3">
          <PersonAvatar name={team.name} src={team.logoUrl} size={64} />
          <div>
            <p className="type-small text-muted-foreground">{team.sport} · {team.gender} · {team.ageGroup}</p>
            <p className="type-small text-muted-foreground">{team.level} · {team.season}</p>
          </div>
        </div>
        <p className="mt-4 type-body text-foreground">{team.description}</p>
        <dl className="mt-4 space-y-2 type-small text-muted-foreground">
          <div>Practice · {team.practice || "Not set"}</div>
          <div>League · {team.league || "Not provided"}</div>
          <div>Roster · {roster.length} of {team.capacity}</div>
        </dl>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => navigate({ to: "/teams/$teamId/roster", params: { teamId } })}>Roster</Button>
          <Button variant="outline" onClick={() => navigate({ to: "/teams/$teamId/preview", params: { teamId } })}>Athlete view</Button>
        </div>
        <h2 className="type-section mt-8 text-foreground">Openings</h2>
        <div className="mt-3 space-y-2">
          {needs.map((need) => (
            <Link key={need.id} to="/needs/$needId" params={{ needId: need.id }} className="flex items-center justify-between rounded-2xl bg-card px-4 py-3">
              <span className="type-sub text-foreground">{need.positions.join(", ")}</span>
              <StatusBadge status={need.status} />
            </Link>
          ))}
          {needs.length === 0 && <p className="type-small text-muted-foreground">No roster needs for this team.</p>}
        </div>
        {!team.archived && (
          <div className="mt-8">
            <Button variant="danger" full onClick={() => setConfirm(true)}>Archive team</Button>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={confirm}
        title="Archive this team?"
        body="The team leaves the active list. Roster records stay on this device."
        confirmLabel="Archive"
        danger
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          archiveTeam(team.id);
          toast("Team archived");
          navigate({ to: "/teams" });
        }}
      />
    </AppFrame>
  );
}

export function RosterScreen({ teamId }: { teamId: string }) {
  const { data, saveRosterMember, removeRosterMember } = useCoach();
  const team = data.teams.find((item) => item.id === teamId);
  const roster = data.roster.filter((member) => member.teamId === teamId);
  const [editing, setEditing] = useState<RosterMember | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);

  function startAdd() {
    setEditing({
      id: newId("roster"),
      teamId,
      name: "",
      position: "",
      jersey: "",
      ageGroup: team?.ageGroup ?? "14U",
      guardianName: "",
    });
  }

  function save(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;
    saveRosterMember(editing);
    toast.success("Roster updated");
    setEditing(null);
  }

  return (
    <AppFrame>
      <Header title="Roster" subtitle={team?.name} fallbackTo="/teams" />
      <div className="px-5 pb-8">
        <p className="type-small text-muted-foreground">{roster.length} of {team?.capacity ?? 0} spots filled. Names stay on this device.</p>
        <div className="mt-4">
          <Button onClick={startAdd}>Add athlete</Button>
        </div>
        <div className="mt-4 space-y-2">
          {roster.length === 0 && <EmptyState title="Roster is empty" body="Add athletes who are already on this team." />}
          {roster.map((member) => (
            <article key={member.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="type-sub text-foreground">{member.name}</p>
                  <p className="type-small text-muted-foreground">{member.position} · #{member.jersey || "—"} · {member.ageGroup}</p>
                  <p className="type-small text-dim">Guardian · {member.guardianName || "Not set"}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" onClick={() => setEditing(member)}>Edit</Button>
                <Button variant="ghost" onClick={() => setRemoveId(member.id)}>Remove</Button>
              </div>
            </article>
          ))}
        </div>
        {editing && (
          <form className="mt-6 rounded-2xl border border-border bg-card p-4" onSubmit={save}>
            <h2 className="type-section mb-3 text-foreground">{roster.some((item) => item.id === editing.id) ? "Edit roster spot" : "Add to roster"}</h2>
            <Field label="Name"><Input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} /></Field>
            <Field label="Position"><Input value={editing.position} onChange={(event) => setEditing({ ...editing, position: event.target.value })} /></Field>
            <Field label="Jersey"><Input value={editing.jersey} onChange={(event) => setEditing({ ...editing, jersey: event.target.value })} /></Field>
            <Field label="Age group">
              <Select value={editing.ageGroup} onChange={(event) => setEditing({ ...editing, ageGroup: event.target.value })}>
                {AGE_GROUPS.map((group) => <option key={group}>{group}</option>)}
              </Select>
            </Field>
            <Field label="Guardian first name"><Input value={editing.guardianName} onChange={(event) => setEditing({ ...editing, guardianName: event.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" type="button" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        )}
      </div>
      <ConfirmDialog
        open={Boolean(removeId)}
        title="Remove from roster?"
        body="This only updates the roster stored on this device."
        confirmLabel="Remove"
        danger
        onClose={() => setRemoveId(null)}
        onConfirm={() => {
          if (removeId) removeRosterMember(removeId);
          setRemoveId(null);
          toast("Removed from roster");
        }}
      />
    </AppFrame>
  );
}

export function TeamPreviewScreen({ teamId }: { teamId: string }) {
  const { data } = useCoach();
  const team = data.teams.find((item) => item.id === teamId);
  const needs = data.needs.filter((need) => need.teamId === teamId && need.status === "Open");
  return (
    <AppFrame>
      <Header title="Athlete view" subtitle="What a family can see" fallbackTo="/teams" />
      <div className="px-5 pb-8">
        {!team ? <EmptyState title="Team not found" body="This preview is unavailable." /> : (
          <article className="rounded-3xl border border-border bg-card p-5">
            <p className="type-caption text-dim">Team profile</p>
            <h2 className="type-title mt-2 text-foreground">{team.name}</h2>
            <p className="mt-2 type-body text-muted-foreground">{team.description}</p>
            <p className="mt-3 type-small text-foreground">{team.sport} · {team.ageGroup} · {team.gender}</p>
            <p className="type-small text-muted-foreground">{team.city}, {team.state} · {team.season}</p>
            <p className="mt-2 type-small text-muted-foreground">Practice · {team.practice || "Ask the coach"}</p>
            <h3 className="type-section mt-6 text-foreground">Open spots</h3>
            <ul className="mt-2 space-y-2">
              {needs.map((need) => (
                <li key={need.id} className="rounded-xl bg-muted px-3 py-3 type-small text-foreground">
                  {need.positions.join(", ")} · {need.spots} {need.spots === 1 ? "spot" : "spots"}
                </li>
              ))}
              {needs.length === 0 && <li className="type-small text-muted-foreground">No open spots posted.</li>}
            </ul>
            <p className="mt-4 type-helper text-dim">Private notes, guardian names, and jersey edits are not in this view.</p>
          </article>
        )}
      </div>
    </AppFrame>
  );
}
