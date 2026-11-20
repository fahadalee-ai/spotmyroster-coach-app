import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppFrame, EmptyState, FilterChip, GuardianNote, PersonAvatar, Segmented, Sheet, StatusBadge } from "@/components/coach-ui";
import { Button, Field, Header, Input, Select, Textarea } from "@/components/kit";
import { shortDate } from "@/lib/format";
import { AGE_GROUPS, PIPELINE, SPORTS, type PipelineStage } from "@/lib/models";
import { useCoach } from "@/lib/store";

export function RecruitScreen() {
  const { data, toggleSavedAthlete } = useCoach();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All");
  const [age, setAge] = useState("All");
  const [skill, setSkill] = useState("All");
  const [savedOnly, setSavedOnly] = useState(false);
  const [sort, setSort] = useState("distance");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const athletes = useMemo(() => {
    const list = data.athletes.filter((athlete) => {
      const haystack = `${athlete.displayName} ${athlete.positions.join(" ")} ${athlete.city} ${athlete.sport}`.toLowerCase();
      if (query && !haystack.includes(query.toLowerCase())) return false;
      if (sport !== "All" && athlete.sport !== sport) return false;
      if (age !== "All" && athlete.ageGroup !== age) return false;
      if (skill !== "All" && athlete.skill !== skill) return false;
      if (savedOnly && !athlete.saved) return false;
      return true;
    });
    return list.sort((a, b) => {
      if (sort === "name") return a.displayName.localeCompare(b.displayName);
      if (sort === "year") return a.gradYear - b.gradYear;
      return a.miles - b.miles;
    });
  }, [data.athletes, query, sport, age, skill, savedOnly, sort]);

  return (
    <AppFrame>
      <div className="px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <h1 className="type-title text-foreground">Find athletes</h1>
        <p className="mt-1 type-small text-muted-foreground">Profiles use a first name and last initial. Contact goes through a guardian.</p>
        <div className="mt-4">
          <Segmented
            value="discover"
            options={[{ id: "discover", label: "Discover" }, { id: "pipeline", label: "Pipeline" }]}
            onChange={(id) => { if (id === "pipeline") navigate({ to: "/recruit/applications" }); }}
          />
        </div>
        <div className="mt-4">
          <Input placeholder="Search name, position, city" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search athletes" />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          <FilterChip selected={savedOnly} onClick={() => setSavedOnly((value) => !value)}>Saved</FilterChip>
          <FilterChip onClick={() => setFiltersOpen(true)}>Filters</FilterChip>
          <FilterChip selected={sort === "distance"} onClick={() => setSort("distance")}>Nearest</FilterChip>
          <FilterChip selected={sort === "name"} onClick={() => setSort("name")}>Name</FilterChip>
          <FilterChip selected={sort === "year"} onClick={() => setSort("year")}>Grad year</FilterChip>
        </div>
        <div className="mt-4 space-y-3">
          {athletes.length === 0 && (
            <EmptyState title="No athletes match" body="Clear a filter or try another sport and age group." action={<Button onClick={() => { setQuery(""); setSport("All"); setAge("All"); setSkill("All"); setSavedOnly(false); }}>Clear filters</Button>} />
          )}
          {athletes.map((athlete) => (
            <article key={athlete.id} className="rounded-2xl border border-border bg-card p-4">
              <Link to="/recruit/athletes/$athleteId" params={{ athleteId: athlete.id }} className="flex items-center gap-3">
                <PersonAvatar name={athlete.displayName} />
                <span className="min-w-0 flex-1">
                  <span className="block type-sub text-foreground">{athlete.displayName}</span>
                  <span className="type-small text-muted-foreground">{athlete.positions.join(" / ")} · {athlete.ageGroup} · {athlete.city}, {athlete.state}</span>
                </span>
              </Link>
              <div className="mt-3 flex items-center justify-between">
                <span className="type-small text-dim">{athlete.miles} mi · Class of {athlete.gradYear}</span>
                <Button variant={athlete.saved ? "outline" : "primary"} onClick={() => toggleSavedAthlete(athlete.id)}>
                  {athlete.saved ? "Saved" : "Save"}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
      <Sheet open={filtersOpen} title="Filters" onClose={() => setFiltersOpen(false)}>
        <Field label="Sport">
          <Select value={sport} onChange={(event) => setSport(event.target.value)}>
            <option>All</option>
            {SPORTS.map((item) => <option key={item}>{item}</option>)}
          </Select>
        </Field>
        <Field label="Age group">
          <Select value={age} onChange={(event) => setAge(event.target.value)}>
            <option>All</option>
            {AGE_GROUPS.map((item) => <option key={item}>{item}</option>)}
          </Select>
        </Field>
        <Field label="Skill">
          <Select value={skill} onChange={(event) => setSkill(event.target.value)}>
            {["All", "Developing", "Travel", "Elite travel"].map((item) => <option key={item}>{item}</option>)}
          </Select>
        </Field>
        <Button full onClick={() => setFiltersOpen(false)}>Show results</Button>
      </Sheet>
    </AppFrame>
  );
}

export function AthleteScreen({ athleteId }: { athleteId: string }) {
  const { data, toggleSavedAthlete, setAthleteNote, openConversation, setApplication } = useCoach();
  const navigate = useNavigate();
  const athlete = data.athletes.find((item) => item.id === athleteId);
  const [note, setNote] = useState(athlete?.note ?? "");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [eventId, setEventId] = useState(data.events[0]?.id ?? "");
  if (!athlete) {
    return <AppFrame><Header title="Athlete" fallbackTo="/recruit" /><div className="px-5"><EmptyState title="Profile unavailable" body="This athlete is not in the sample directory." /></div></AppFrame>;
  }
  const related = data.applications.find((item) => item.athleteId === athlete.id);

  return (
    <AppFrame>
      <Header title={athlete.displayName} subtitle={`${athlete.city}, ${athlete.state}`} fallbackTo="/recruit" />
      <div className="space-y-4 px-5 pb-8">
        <div className="flex items-center gap-3">
          <PersonAvatar name={athlete.displayName} size={56} />
          <div>
            <p className="type-sub text-foreground">{athlete.sport} · {athlete.positions.join(", ")}</p>
            <p className="type-small text-muted-foreground">{athlete.ageGroup} · Class of {athlete.gradYear} · {athlete.miles} mi</p>
          </div>
        </div>
        <GuardianNote />
        <p className="type-body text-foreground">{athlete.bio}</p>
        <p className="type-small text-muted-foreground">Availability · {athlete.availability}</p>
        <p className="type-small text-muted-foreground">Skill · {athlete.skill}</p>
        <h2 className="type-section text-foreground">Sample stats</h2>
        <ul className="space-y-2">
          {athlete.stats.map((stat) => (
            <li key={stat.label} className="flex justify-between rounded-xl bg-card px-3 py-3 type-small">
              <span className="text-muted-foreground">{stat.label}</span>
              <span className="font-semibold text-foreground">{stat.value}</span>
            </li>
          ))}
        </ul>
        <h2 className="type-section text-foreground">Achievements</h2>
        <ul className="list-disc space-y-1 pl-5 type-small text-foreground">
          {athlete.achievements.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <h2 className="type-section text-foreground">Past teams</h2>
        <p className="type-small text-foreground">{athlete.pastTeams.join(", ")}</p>
        <p className="type-small text-muted-foreground">Guardian · {athlete.guardianName}</p>
        <Field label="Private note" hint="Only you can see this. It is stored on this device.">
          <Textarea value={note} onChange={(event) => setNote(event.target.value)} />
        </Field>
        <Button variant="outline" onClick={() => { setAthleteNote(athlete.id, note); toast("Note saved"); }}>Save note</Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => toggleSavedAthlete(athlete.id)}>{athlete.saved ? "Unsave" : "Shortlist"}</Button>
          <Button variant="outline" onClick={() => setInviteOpen(true)}>Invite</Button>
          <Button onClick={() => navigate({ to: "/chat/$conversationId", params: { conversationId: openConversation(athlete.id) } })}>Message guardian</Button>
          {related && <Button variant="ghost" onClick={() => navigate({ to: "/recruit/applications/$applicationId", params: { applicationId: related.id } })}>Open inquiry</Button>}
        </div>
      </div>
      <Sheet open={inviteOpen} title="Invite to an event" onClose={() => setInviteOpen(false)}>
        <Field label="Event">
          <Select value={eventId} onChange={(event) => setEventId(event.target.value)}>
            {data.events.filter((event) => event.status === "Scheduled").map((event) => (
              <option key={event.id} value={event.id}>{event.title}</option>
            ))}
          </Select>
        </Field>
        <Button full onClick={() => {
          if (related) setApplication(related.id, { stage: "Invited" });
          toast.success("Invite marked on the pipeline");
          setInviteOpen(false);
          navigate({ to: "/events/$eventId", params: { eventId } });
        }}>Send invite</Button>
      </Sheet>
    </AppFrame>
  );
}

export function ApplicationsScreen() {
  const { data } = useCoach();
  const navigate = useNavigate();
  const [stage, setStage] = useState<PipelineStage | "All">("All");
  const items = data.applications.filter((item) => stage === "All" || item.stage === stage);
  return (
    <AppFrame>
      <div className="px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <h1 className="type-title text-foreground">Pipeline</h1>
        <div className="mt-4">
          <Segmented
            value="pipeline"
            options={[{ id: "discover", label: "Discover" }, { id: "pipeline", label: "Pipeline" }]}
            onChange={(id) => { if (id === "discover") navigate({ to: "/recruit" }); }}
          />
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
          <FilterChip selected={stage === "All"} onClick={() => setStage("All")}>All</FilterChip>
          {PIPELINE.map((item) => (
            <FilterChip key={item} selected={stage === item} onClick={() => setStage(item)}>
              {item} {data.applications.filter((application) => application.stage === item).length}
            </FilterChip>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {items.length === 0 && <EmptyState title="Nothing in this stage" body="New family inquiries will show up here." />}
          {items.map((application) => {
            const athlete = data.athletes.find((item) => item.id === application.athleteId);
            const need = data.needs.find((item) => item.id === application.needId);
            return (
              <Link key={application.id} to="/recruit/applications/$applicationId" params={{ applicationId: application.id }} className="block rounded-2xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="type-sub text-foreground">{athlete?.displayName}</p>
                    <p className="type-small text-muted-foreground">{need?.positions.join(", ")} · {shortDate(application.submittedAt)}</p>
                  </div>
                  <StatusBadge status={application.stage} />
                </div>
                <p className="mt-2 line-clamp-2 type-small text-muted-foreground">{application.message}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </AppFrame>
  );
}

export function ApplicationDetailScreen({ applicationId }: { applicationId: string }) {
  const { data, setApplication, openConversation, saveRosterMember } = useCoach();
  const navigate = useNavigate();
  const application = data.applications.find((item) => item.id === applicationId);
  const athlete = data.athletes.find((item) => item.id === application?.athleteId);
  const need = data.needs.find((item) => item.id === application?.needId);
  const [note, setNote] = useState(application?.note ?? "");
  if (!application || !athlete) {
    return <AppFrame><Header title="Inquiry" fallbackTo="/recruit/applications" /><div className="px-5"><EmptyState title="Inquiry not found" body="It is not stored on this device." /></div></AppFrame>;
  }

  const inquiryId = application.id;
  function move(stage: PipelineStage) {
    setApplication(inquiryId, { stage });
    toast.success(`Moved to ${stage}`);
  }

  return (
    <AppFrame>
      <Header title={athlete.displayName} subtitle={need?.positions.join(", ")} fallbackTo="/recruit/applications" />
      <div className="space-y-4 px-5 pb-10">
        <StatusBadge status={application.stage} />
        <p className="type-body text-foreground">{application.message}</p>
        <p className="type-small text-dim">Received {shortDate(application.submittedAt)} · Guardian {athlete.guardianName}</p>
        <GuardianNote />
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => move("Shortlisted")}>Shortlist</Button>
          <Button variant="outline" onClick={() => move("Invited")}>Invite</Button>
          <Button variant="outline" onClick={() => move("Tryout")}>Tryout</Button>
          <Button variant="outline" onClick={() => move("Offered")}>Offer</Button>
          <Button onClick={() => move("Accepted")}>Accept</Button>
          <Button variant="danger" onClick={() => move("Declined")}>Decline</Button>
        </div>
        <Button variant="outline" full onClick={() => navigate({ to: "/chat/$conversationId", params: { conversationId: openConversation(athlete.id) } })}>Message guardian</Button>
        <Button variant="ghost" full onClick={() => navigate({ to: "/recruit/athletes/$athleteId", params: { athleteId: athlete.id } })}>Athlete profile</Button>
        {application.stage === "Accepted" && need && (
          <Button full onClick={() => {
            saveRosterMember({
              id: `roster-${athlete.id}`,
              teamId: need.teamId,
              name: athlete.displayName,
              position: need.positions[0] ?? "",
              jersey: "",
              ageGroup: athlete.ageGroup,
              guardianName: athlete.guardianName,
            });
            toast.success("Added to the team roster");
            navigate({ to: "/teams/$teamId/roster", params: { teamId: need.teamId } });
          }}>Add to roster</Button>
        )}
        <Field label="Private note">
          <Textarea value={note} onChange={(event) => setNote(event.target.value)} />
        </Field>
        <Button variant="outline" onClick={() => { setApplication(application.id, { note }); toast("Note saved"); }}>Save note</Button>
      </div>
    </AppFrame>
  );
}
