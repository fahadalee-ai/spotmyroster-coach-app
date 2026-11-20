import { Link, useNavigate } from "@tanstack/react-router";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, parseISO, startOfMonth, startOfWeek } from "date-fns";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AppFrame, ConfirmDialog, EmptyState, FilterChip, StatusBadge } from "@/components/coach-ui";
import { Button, Field, Header, Input, Select, Textarea } from "@/components/kit";
import { newId, shortDate, timeLabel } from "@/lib/format";
import { AGE_GROUPS, type SportEvent } from "@/lib/models";
import { useCoach } from "@/lib/store";

export function EventsScreen() {
  const { data } = useCoach();
  const navigate = useNavigate();
  const [when, setWhen] = useState<"Upcoming" | "Past">("Upcoming");
  const today = "2026-11-20";
  const events = data.events
    .filter((event) => (when === "Upcoming" ? event.date >= today : event.date < today))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <AppFrame>
      <Header title="Events" fallbackTo="/home" right={<Button variant="ghost" onClick={() => navigate({ to: "/events/calendar" })}>Calendar</Button>} />
      <div className="px-5 pb-8">
        <div className="mb-4 flex gap-2">
          <FilterChip selected={when === "Upcoming"} onClick={() => setWhen("Upcoming")}>Upcoming</FilterChip>
          <FilterChip selected={when === "Past"} onClick={() => setWhen("Past")}>Past</FilterChip>
        </div>
        <Button onClick={() => navigate({ to: "/events/new" })}>Create event</Button>
        <div className="mt-4 space-y-3">
          {events.length === 0 && <EmptyState title={`No ${when.toLowerCase()} events`} body="Create a tryout or practice when you have a date and address." />}
          {events.map((event) => (
            <Link key={event.id} to="/events/$eventId" params={{ eventId: event.id }} className="block rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="type-sub text-foreground">{event.title}</p>
                  <p className="type-small text-muted-foreground">{shortDate(event.date)} · {timeLabel(event.time)}</p>
                  <p className="type-small text-dim">{event.city}, {event.state}</p>
                </div>
                <StatusBadge status={event.status === "Cancelled" ? "Cancelled" : event.type} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppFrame>
  );
}

export function CalendarScreen() {
  const { data } = useCoach();
  const [cursor, setCursor] = useState(new Date(2026, 10, 20));
  const [selected, setSelected] = useState("2026-11-22");
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    return eachDayOfInterval({ start, end });
  }, [cursor]);
  const selectedEvents = data.events.filter((event) => event.date === selected);

  return (
    <AppFrame>
      <Header title="Calendar" fallbackTo="/events" />
      <div className="px-5 pb-8">
        <div className="mb-3 flex items-center justify-between">
          <button type="button" className="min-h-11 px-2 font-semibold text-foreground" onClick={() => setCursor(addMonths(cursor, -1))}>Prev</button>
          <h2 className="type-section text-foreground">{format(cursor, "MMMM yyyy")}</h2>
          <button type="button" className="min-h-11 px-2 font-semibold text-foreground" onClick={() => setCursor(addMonths(cursor, 1))}>Next</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center type-caption text-dim">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => <span key={`${day}${index}`}>{day}</span>)}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {days.map((day) => {
            const iso = format(day, "yyyy-MM-dd");
            const has = data.events.some((event) => event.date === iso);
            const isSelected = iso === selected;
            return (
              <button
                key={iso}
                type="button"
                onClick={() => setSelected(iso)}
                className={`min-h-11 rounded-xl text-sm ${isSelected ? "bg-primary font-semibold text-primary-foreground" : isSameMonth(day, cursor) ? "text-foreground" : "text-dim"}`}
              >
                {format(day, "d")}
                {has && <span className={`mx-auto mt-0.5 block h-1 w-1 rounded-full ${isSelected ? "bg-primary-foreground" : "bg-primary"}`} />}
              </button>
            );
          })}
        </div>
        <h2 className="type-section mt-6 text-foreground">{format(parseISO(selected), "MMM d")}</h2>
        <div className="mt-3 space-y-2">
          {selectedEvents.length === 0 && <p className="type-small text-muted-foreground">Nothing scheduled.</p>}
          {selectedEvents.map((event) => (
            <Link key={event.id} to="/events/$eventId" params={{ eventId: event.id }} className="block rounded-2xl bg-card px-4 py-3">
              <span className="type-sub text-foreground">{event.title}</span>
              <span className="block type-small text-muted-foreground">{timeLabel(event.time)} · {event.city}</span>
            </Link>
          ))}
        </div>
        <p className="mt-4 type-helper text-dim">Dots mark days that already have an event.</p>
      </div>
    </AppFrame>
  );
}

export function EventFormScreen({ eventId }: { eventId?: string }) {
  const { data, saveEvent } = useCoach();
  const navigate = useNavigate();
  const existing = data.events.find((event) => event.id === eventId);
  const [form, setForm] = useState<SportEvent>(
    existing ?? {
      id: newId("event"),
      title: "",
      type: "Tryout",
      date: "",
      time: "",
      endTime: "",
      address: "",
      city: "",
      state: "TX",
      lat: 32.78,
      lng: -96.8,
      teamId: data.teams[0]?.id ?? "",
      ageGroup: "14U",
      capacity: 20,
      deadline: "",
      description: "",
      status: "Scheduled",
      rsvps: [],
    },
  );
  const [error, setError] = useState("");

  function save(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim() || !form.date || !form.time || !form.address.trim() || !form.city.trim()) {
      setError("Title, date, time, address, and city are required.");
      return;
    }
    saveEvent({ ...form, title: form.title.trim(), address: form.address.trim(), city: form.city.trim() });
    toast.success(existing ? "Event updated" : "Event created");
    navigate({ to: "/events/$eventId", params: { eventId: form.id } });
  }

  return (
    <AppFrame>
      <Header title={existing ? "Edit event" : "Create event"} fallbackTo="/events" />
      <form className="px-5 pb-8" onSubmit={save}>
        <Field label="Title"><Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></Field>
        <Field label="Type">
          <Select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as SportEvent["type"] })}>
            {["Tryout", "Showcase", "Practice", "Tournament"].map((type) => <option key={type}>{type}</option>)}
          </Select>
        </Field>
        <Field label="Date"><Input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start"><Input type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} /></Field>
          <Field label="End"><Input type="time" value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} /></Field>
        </div>
        <Field label="Address"><Input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></Field>
        <Field label="City"><Input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></Field>
        <Field label="State"><Input value={form.state} maxLength={2} onChange={(event) => setForm({ ...form, state: event.target.value.toUpperCase() })} /></Field>
        <Field label="Team">
          <Select value={form.teamId} onChange={(event) => setForm({ ...form, teamId: event.target.value })}>
            {data.teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </Select>
        </Field>
        <Field label="Age group">
          <Select value={form.ageGroup} onChange={(event) => setForm({ ...form, ageGroup: event.target.value })}>
            {AGE_GROUPS.map((group) => <option key={group}>{group}</option>)}
          </Select>
        </Field>
        <Field label="Capacity"><Input inputMode="numeric" value={String(form.capacity)} onChange={(event) => setForm({ ...form, capacity: Number(event.target.value) || 0 })} /></Field>
        <Field label="Registration deadline"><Input type="date" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} /></Field>
        <Field label="Description" hint="Fees are omitted until SpotMyRoster provides them.">
          <Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </Field>
        {error && <p className="mb-3 type-helper text-danger">{error}</p>}
        <Button type="submit" full>Save event</Button>
      </form>
    </AppFrame>
  );
}

export function EventDetailScreen({ eventId }: { eventId: string }) {
  const { data, setEventStatus, setRsvp } = useCoach();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const event = data.events.find((item) => item.id === eventId);
  const team = data.teams.find((item) => item.id === event?.teamId);
  if (!event) {
    return <AppFrame><Header title="Event" fallbackTo="/events" /><div className="px-5"><EmptyState title="Event not found" body="It is not on this device." /></div></AppFrame>;
  }
  const going = event.rsvps.filter((rsvp) => rsvp.status === "Going").length;
  const map = `https://www.openstreetmap.org/export/embed.html?bbox=${event.lng - 0.03}%2C${event.lat - 0.02}%2C${event.lng + 0.03}%2C${event.lat + 0.02}&layer=mapnik&marker=${event.lat}%2C${event.lng}`;
  const mapsLink = `https://maps.apple.com/?q=${encodeURIComponent(`${event.address}, ${event.city}, ${event.state}`)}`;

  return (
    <AppFrame>
      <Header title={event.title} fallbackTo="/events" right={<Button variant="ghost" onClick={() => navigate({ to: "/events/$eventId/edit", params: { eventId } })}>Edit</Button>} />
      <div className="space-y-4 px-5 pb-8">
        <StatusBadge status={event.status === "Cancelled" ? "Cancelled" : event.type} />
        <p className="type-body text-foreground">{shortDate(event.date)} · {timeLabel(event.time)}–{timeLabel(event.endTime)}</p>
        <p className="type-small text-muted-foreground">{team?.name} · {event.ageGroup} · {going} going · capacity {event.capacity}</p>
        <p className="type-body text-foreground">{event.description}</p>
        <p className="type-small text-muted-foreground">Registration deadline {event.deadline ? shortDate(event.deadline) : "Not set"}</p>
        <div className="overflow-hidden rounded-2xl border border-border">
          <iframe title="Map" src={map} className="h-44 w-full" loading="lazy" />
        </div>
        <p className="type-small text-foreground">{event.address}, {event.city}, {event.state}</p>
        <a className="inline-flex min-h-11 items-center font-semibold text-foreground underline" href={mapsLink} target="_blank" rel="noreferrer">Open in Maps</a>
        <h2 className="type-section text-foreground">RSVPs</h2>
        {event.rsvps.length === 0 && <p className="type-small text-muted-foreground">No responses yet.</p>}
        <ul className="space-y-2">
          {event.rsvps.map((rsvp) => (
            <li key={rsvp.id} className="rounded-2xl bg-card p-3">
              <div className="flex items-center justify-between gap-2">
                <span>
                  <span className="block type-sub text-foreground">{rsvp.name}</span>
                  <span className="type-small text-muted-foreground">{rsvp.role}</span>
                </span>
                <StatusBadge status={rsvp.status} />
              </div>
              <div className="mt-2 flex gap-2">
                {(["Going", "Waitlist", "Not going"] as const).map((status) => (
                  <button key={status} type="button" className="min-h-10 rounded-lg bg-muted px-2 text-xs font-semibold text-foreground" onClick={() => setRsvp(event.id, rsvp.id, status)}>
                    {status}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
        <p className="type-helper text-dim">Check-in is not included. It was not confirmed in an accessible design file.</p>
        {event.status !== "Cancelled" && <Button variant="danger" full onClick={() => setConfirm(true)}>Cancel event</Button>}
      </div>
      <ConfirmDialog
        open={confirm}
        title="Cancel this event?"
        body="Families will see it as cancelled. This preview does not send a message."
        confirmLabel="Cancel event"
        danger
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          setEventStatus(event.id, "Cancelled");
          setConfirm(false);
          toast("Event cancelled");
        }}
      />
    </AppFrame>
  );
}
