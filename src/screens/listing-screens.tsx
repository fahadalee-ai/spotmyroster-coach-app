import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AppFrame, ConfirmDialog, EmptyState, FilterChip, StatusBadge } from "@/components/coach-ui";
import { Button, Field, Header, Input, Select, Textarea } from "@/components/kit";
import { newId, shortDate, timeLabel } from "@/lib/format";
import { SPORTS, type Listing, type ListingKind } from "@/lib/models";
import { useCoach } from "@/lib/store";

const POSITIONS = ["Pitcher", "Catcher", "First base", "Second base", "Shortstop", "Third base", "Outfield", "Utility"];

const KIND_LABEL: Record<ListingKind, string> = {
  tryout: "Tryout",
  roster: "Full-time roster",
  sub: "Sub opportunity",
};

function blankListing(kind: ListingKind, teamId = ""): Listing {
  return {
    id: newId("list"),
    kind,
    title: "",
    teamId,
    sport: "Baseball",
    status: "Active",
    boostedUntil: null,
    date: "",
    time: "",
    endTime: "",
    address: "",
    city: "",
    state: "",
    positions: [],
    description: "",
    feeNote: "",
    mediaName: "",
    spots: 1,
    ageGroup: "14U",
  };
}

export function ListingsScreen() {
  const { data } = useCoach();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"All" | "Active" | "Paused">("All");
  const listings = data.listings.filter((item) => filter === "All" || item.status === filter);

  return (
    <AppFrame>
      <Header
        title="Listings"
        subtitle="Tryouts, roster openings, and sub opportunities"
        fallbackTo="/home"
        right={<Button variant="ghost" onClick={() => navigate({ to: "/listings/post" })}>Post</Button>}
      />
      <div className="px-5 pb-8">
        <div className="mb-4 flex gap-2">
          {(["All", "Active", "Paused"] as const).map((item) => (
            <FilterChip key={item} selected={filter === item} onClick={() => setFilter(item)}>{item}</FilterChip>
          ))}
        </div>
        {listings.length === 0 && (
          <EmptyState
            title="No listings"
            body="Post a tryout, a full-time roster opening, or a sub opportunity."
            action={<Button onClick={() => navigate({ to: "/listings/post" })}>Post opportunity</Button>}
          />
        )}
        <div className="space-y-3">
          {listings.map((listing) => {
            const team = data.teams.find((item) => item.id === listing.teamId);
            return (
              <Link key={listing.id} to="/listings/$listingId" params={{ listingId: listing.id }} className="block rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <StatusBadge status={listing.status} />
                  {listing.boostedUntil && <StatusBadge status="Boosted" />}
                </div>
                <p className="type-sub mt-3 text-foreground">{listing.title || KIND_LABEL[listing.kind]}</p>
                <p className="type-small text-muted-foreground">{KIND_LABEL[listing.kind]} · {team?.name ?? "No team"}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </AppFrame>
  );
}

export function PostOpportunityScreen() {
  const navigate = useNavigate();
  const choices = [
    { to: "/listings/tryout" as const, title: "Tryout", body: "Date, location, positions, description, and a flyer families can find." },
    { to: "/listings/roster" as const, title: "Full-time roster", body: "Find athletes for a full-time roster spot." },
    { to: "/listings/sub" as const, title: "Sub opportunity", body: "Fill an immediate roster position. Removed 24 hours after the event." },
  ];
  return (
    <AppFrame>
      <Header title="Post opportunity" subtitle="Choose what families should see" fallbackTo="/listings" />
      <div className="space-y-3 px-5 pb-8">
        {choices.map((choice) => (
          <button key={choice.title} type="button" onClick={() => navigate({ to: choice.to })} className="block w-full rounded-2xl border border-border bg-card p-4 text-left">
            <p className="type-sub text-foreground">{choice.title}</p>
            <p className="mt-1 type-small text-muted-foreground">{choice.body}</p>
          </button>
        ))}
      </div>
    </AppFrame>
  );
}

export function ListingDetailScreen({ listingId }: { listingId: string }) {
  const { data, setListingStatus, removeListing } = useCoach();
  const navigate = useNavigate();
  const listing = data.listings.find((item) => item.id === listingId);
  const team = data.teams.find((item) => item.id === listing?.teamId);
  const [confirm, setConfirm] = useState(false);
  if (!listing) {
    return (
      <AppFrame>
        <Header title="Listing" fallbackTo="/listings" />
        <div className="px-5"><EmptyState title="Listing not found" body="It may have been deleted." /></div>
      </AppFrame>
    );
  }
  return (
    <AppFrame>
      <Header title={listing.title || KIND_LABEL[listing.kind]} subtitle={team?.name} fallbackTo="/listings" right={<Button variant="ghost" onClick={() => navigate({ to: "/listings/$listingId/edit", params: { listingId } })}>Edit</Button>} />
      <div className="space-y-4 px-5 pb-8">
        <div className="flex gap-2">
          <StatusBadge status={listing.status} />
          <StatusBadge status={KIND_LABEL[listing.kind]} />
          {listing.boostedUntil && <StatusBadge status="Boosted" />}
        </div>
        <p className="type-body text-muted-foreground">{listing.description}</p>
        <dl className="space-y-2 type-small text-foreground">
          {listing.date && <div>Date · {shortDate(listing.date)} {listing.time && timeLabel(listing.time)}</div>}
          {(listing.address || listing.city) && <div>Location · {[listing.address, listing.city, listing.state].filter(Boolean).join(", ")}</div>}
          {listing.positions.length > 0 && <div>Positions · {listing.positions.join(", ")}</div>}
          {listing.feeNote && <div>Approximate team fees · {listing.feeNote}</div>}
          {listing.boostedUntil && <div>Featured until {shortDate(listing.boostedUntil)}</div>}
        </dl>
        <Button full onClick={() => navigate({ to: "/listings/$listingId/preview", params: { listingId } })}>Preview</Button>
        <Button variant="outline" full onClick={() => navigate({ to: "/listings/$listingId/boost", params: { listingId } })}>Boost listing</Button>
        <Button variant="outline" full onClick={() => setListingStatus(listing.id, listing.status === "Paused" ? "Active" : "Paused")}>
          {listing.status === "Paused" ? "Resume listing" : "Pause listing"}
        </Button>
        <Button variant="danger" full onClick={() => setConfirm(true)}>Delete listing</Button>
      </div>
      <ConfirmDialog
        open={confirm}
        title="Delete this listing?"
        body="Parents will no longer be able to find it or send an inquiry."
        confirmLabel="Delete"
        danger
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          removeListing(listing.id);
          toast("Listing deleted");
          navigate({ to: "/listings" });
        }}
      />
    </AppFrame>
  );
}

export function ListingPreviewScreen({ listingId }: { listingId: string }) {
  const { data } = useCoach();
  const listing = data.listings.find((item) => item.id === listingId);
  const team = data.teams.find((item) => item.id === listing?.teamId);
  if (!listing) return null;
  return (
    <AppFrame>
      <Header title="Preview" subtitle="What families see" fallbackTo="/listings" />
      <article className="mx-5 rounded-3xl border border-border bg-card p-5">
        <p className="type-caption text-primary">{KIND_LABEL[listing.kind]}</p>
        <h2 className="type-title mt-2 text-foreground">{listing.title}</h2>
        <p className="mt-1 type-small text-muted-foreground">{team?.name} · {listing.sport} · {listing.ageGroup}</p>
        {listing.date && <p className="mt-4 type-body text-foreground">{shortDate(listing.date)} · {timeLabel(listing.time)}{listing.endTime ? `–${timeLabel(listing.endTime)}` : ""}</p>}
        {(listing.address || listing.city) && <p className="mt-2 type-small text-muted-foreground">{[listing.address, listing.city, listing.state].filter(Boolean).join(", ")}</p>}
        {listing.positions.length > 0 && <p className="mt-4 type-small text-foreground">Positions needed · {listing.positions.join(", ")}</p>}
        {listing.feeNote && <p className="mt-2 type-small text-foreground">Approximate team fees · {listing.feeNote}</p>}
        <p className="mt-4 type-body text-muted-foreground">{listing.description}</p>
        {listing.mediaName && <p className="mt-3 type-small text-foreground">Flyer · {listing.mediaName}</p>}
        {listing.kind === "sub" && <p className="mt-4 type-helper text-dim">This sub opportunity is removed 24 hours after the event.</p>}
        {listing.boostedUntil && <p className="mt-4 type-small text-foreground">Featured higher in athlete and parent searches for 30 days.</p>}
      </article>
    </AppFrame>
  );
}

export function BoostListingScreen({ listingId }: { listingId: string }) {
  const { data, boostListing } = useCoach();
  const navigate = useNavigate();
  const listing = data.listings.find((item) => item.id === listingId);
  const free = data.planId === "unlimited" || data.boostsRemaining > 0;
  if (!listing) return null;
  function apply(paid: boolean) {
    boostListing(listingId, paid);
    toast(paid ? "Listing boosted for $10" : "Free boost applied");
    navigate({ to: "/listings/$listingId", params: { listingId } });
  }
  return (
    <AppFrame>
      <Header title="Boost this listing" subtitle="Featured for 30 days" fallbackTo="/listings" />
      <div className="px-5 pb-8">
        <p className="type-body text-muted-foreground">
          {listing.title} is featured higher in athlete and parent searches. Boost duration is 30 days.
        </p>
        {data.planId === "premium" && (
          <p className="mt-3 type-small text-foreground">
            You have {data.boostsRemaining} complimentary {data.boostsRemaining === 1 ? "boost" : "boosts"} remaining with Coach Premium.
          </p>
        )}
        {data.planId === "unlimited" && <p className="mt-3 type-small text-foreground">Coach Premium Unlimited includes unlimited featured listing boosts.</p>}
        <div className="mt-6 space-y-3">
          {free && <Button full onClick={() => apply(false)}>{data.planId === "unlimited" ? "Use included boost" : "Use free boost"}</Button>}
          <Button variant={free ? "outline" : "primary"} full onClick={() => apply(true)}>Boost this listing $10</Button>
        </div>
      </div>
    </AppFrame>
  );
}

function PositionPicker({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {POSITIONS.map((position) => {
        const selected = value.includes(position);
        return (
          <button
            key={position}
            type="button"
            aria-pressed={selected}
            className={`min-h-10 rounded-full px-3 text-sm font-semibold ${selected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
            onClick={() => onChange(selected ? value.filter((item) => item !== position) : [...value, position])}
          >
            {position}
          </button>
        );
      })}
    </div>
  );
}

function TeamFields({ listing, onChange }: { listing: Listing; onChange: (next: Listing) => void }) {
  const { data } = useCoach();
  return (
    <>
      <Field label="Title"><Input value={listing.title} onChange={(event) => onChange({ ...listing, title: event.target.value })} /></Field>
      <Field label="Team">
        <Select value={listing.teamId} onChange={(event) => onChange({ ...listing, teamId: event.target.value })}>
          <option value="">Select a team</option>
          {data.teams.filter((team) => !team.archived).map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
        </Select>
      </Field>
      <Field label="Sport">
        <Select value={listing.sport} onChange={(event) => onChange({ ...listing, sport: event.target.value })}>
          {SPORTS.map((sport) => <option key={sport}>{sport}</option>)}
        </Select>
      </Field>
    </>
  );
}

export function TryoutWizardScreen({ listingId }: { listingId?: string }) {
  const { data, saveListing } = useCoach();
  const navigate = useNavigate();
  const existing = data.listings.find((item) => item.id === listingId);
  const [step, setStep] = useState(0);
  const [listing, setListing] = useState<Listing>(existing ?? blankListing("tryout", data.teams[0]?.id ?? ""));
  const steps = ["Basic information", "Date and time", "Location", "Positions needed", "Description", "Upload media", "Preview"];

  function publish() {
    saveListing({ ...listing, kind: "tryout", status: listing.status || "Active" });
    toast("Tryout posted");
    navigate({ to: "/listings/$listingId", params: { listingId: listing.id } });
  }

  return (
    <AppFrame>
      <Header
        title={steps[step]}
        subtitle={`Tryout · step ${step + 1} of ${steps.length}`}
        fallbackTo="/listings"
        back
      />
      <form
        className="px-5 pb-8"
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          if (step < steps.length - 1) setStep((value) => value + 1);
          else publish();
        }}
      >
        {step === 0 && (
          <>
            <TeamFields listing={listing} onChange={setListing} />
            <Field label="Age group"><Input value={listing.ageGroup} onChange={(event) => setListing({ ...listing, ageGroup: event.target.value })} /></Field>
            <Field label="Spots"><Input inputMode="numeric" value={String(listing.spots)} onChange={(event) => setListing({ ...listing, spots: Number(event.target.value) || 0 })} /></Field>
          </>
        )}
        {step === 1 && (
          <>
            <Field label="Date"><Input type="date" value={listing.date} onChange={(event) => setListing({ ...listing, date: event.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start"><Input type="time" value={listing.time} onChange={(event) => setListing({ ...listing, time: event.target.value })} /></Field>
              <Field label="End"><Input type="time" value={listing.endTime} onChange={(event) => setListing({ ...listing, endTime: event.target.value })} /></Field>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <Field label="Address"><Input value={listing.address} onChange={(event) => setListing({ ...listing, address: event.target.value })} /></Field>
            <Field label="City"><Input value={listing.city} onChange={(event) => setListing({ ...listing, city: event.target.value })} /></Field>
            <Field label="State"><Input value={listing.state} onChange={(event) => setListing({ ...listing, state: event.target.value.toUpperCase() })} /></Field>
          </>
        )}
        {step === 3 && (
          <>
            <p className="type-label mb-2 text-muted-foreground">Positions needed</p>
            <PositionPicker value={listing.positions} onChange={(positions) => setListing({ ...listing, positions })} />
          </>
        )}
        {step === 4 && (
          <>
            <Field label="Description"><Textarea value={listing.description} onChange={(event) => setListing({ ...listing, description: event.target.value })} /></Field>
            <Field label="Approximate team fees" hint="Example from the coach design: $2,000-$2,500 per season.">
              <Input value={listing.feeNote} onChange={(event) => setListing({ ...listing, feeNote: event.target.value })} placeholder="$2,000-$2,500 per season" />
            </Field>
          </>
        )}
        {step === 5 && (
          <Field label="Flyer" hint="Add a flyer so athletes and families can learn about the tryout.">
            <input
              type="file"
              accept="image/*,.pdf"
              className="block w-full text-sm text-foreground"
              onChange={(event) => setListing({ ...listing, mediaName: event.target.files?.[0]?.name ?? "" })}
            />
            {listing.mediaName && <span className="mt-2 block type-small text-muted-foreground">{listing.mediaName}</span>}
          </Field>
        )}
        {step === 6 && (
          <div className="mb-4 rounded-2xl border border-border bg-card p-4">
            <p className="type-sub text-foreground">{listing.title || "Untitled tryout"}</p>
            <p className="mt-2 type-small text-muted-foreground">{listing.date && shortDate(listing.date)} {listing.city}</p>
            <p className="mt-2 type-small text-foreground">{listing.positions.join(", ")}</p>
            <p className="mt-2 type-body text-muted-foreground">{listing.description}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}>Back</Button>
          <Button type="submit">{step === steps.length - 1 ? "Publish" : "Continue"}</Button>
        </div>
      </form>
    </AppFrame>
  );
}

export function RosterListingScreen({ listingId }: { listingId?: string }) {
  const { data, saveListing } = useCoach();
  const navigate = useNavigate();
  const existing = data.listings.find((item) => item.id === listingId);
  const [listing, setListing] = useState<Listing>(existing ?? blankListing("roster", data.teams[0]?.id ?? ""));
  return (
    <AppFrame>
      <Header title="Full-time roster" subtitle="Find athletes for a roster spot" fallbackTo="/listings" />
      <form className="px-5 pb-8" onSubmit={(event) => { event.preventDefault(); saveListing({ ...listing, kind: "roster" }); toast("Roster opening posted"); navigate({ to: "/listings/$listingId", params: { listingId: listing.id } }); }}>
        <TeamFields listing={listing} onChange={setListing} />
        <Field label="Age group"><Input value={listing.ageGroup} onChange={(event) => setListing({ ...listing, ageGroup: event.target.value })} /></Field>
        <Field label="Spots"><Input inputMode="numeric" value={String(listing.spots)} onChange={(event) => setListing({ ...listing, spots: Number(event.target.value) || 0 })} /></Field>
        <p className="type-label mb-2 text-muted-foreground">Positions</p>
        <PositionPicker value={listing.positions} onChange={(positions) => setListing({ ...listing, positions })} />
        <Field label="City"><Input value={listing.city} onChange={(event) => setListing({ ...listing, city: event.target.value })} /></Field>
        <Field label="State"><Input value={listing.state} onChange={(event) => setListing({ ...listing, state: event.target.value.toUpperCase() })} /></Field>
        <Field label="Description"><Textarea value={listing.description} onChange={(event) => setListing({ ...listing, description: event.target.value })} /></Field>
        <Button type="submit" full>Publish</Button>
      </form>
    </AppFrame>
  );
}

export function SubListingScreen({ listingId }: { listingId?: string }) {
  const { data, saveListing } = useCoach();
  const navigate = useNavigate();
  const existing = data.listings.find((item) => item.id === listingId);
  const [listing, setListing] = useState<Listing>(existing ?? blankListing("sub", data.teams[0]?.id ?? ""));
  return (
    <AppFrame>
      <Header title="Sub opportunity" subtitle="Removed 24 hours after the event" fallbackTo="/listings" />
      <form className="px-5 pb-8" onSubmit={(event) => { event.preventDefault(); saveListing({ ...listing, kind: "sub" }); toast("Sub opportunity posted"); navigate({ to: "/listings/$listingId", params: { listingId: listing.id } }); }}>
        <TeamFields listing={listing} onChange={setListing} />
        <Field label="Event date"><Input type="date" value={listing.date} onChange={(event) => setListing({ ...listing, date: event.target.value })} /></Field>
        <Field label="Start"><Input type="time" value={listing.time} onChange={(event) => setListing({ ...listing, time: event.target.value })} /></Field>
        <p className="type-label mb-2 text-muted-foreground">Position needed</p>
        <PositionPicker value={listing.positions} onChange={(positions) => setListing({ ...listing, positions })} />
        <Field label="City"><Input value={listing.city} onChange={(event) => setListing({ ...listing, city: event.target.value })} /></Field>
        <Field label="Description"><Textarea value={listing.description} onChange={(event) => setListing({ ...listing, description: event.target.value })} /></Field>
        <p className="mb-4 type-helper text-dim">This sub opportunity is removed from the site 24 hours after the event.</p>
        <Button type="submit" full>Publish</Button>
      </form>
    </AppFrame>
  );
}

export function EditListingScreen({ listingId }: { listingId: string }) {
  const { data } = useCoach();
  const listing = data.listings.find((item) => item.id === listingId);
  if (!listing) return null;
  if (listing.kind === "tryout") return <TryoutWizardScreen listingId={listingId} />;
  if (listing.kind === "sub") return <SubListingScreen listingId={listingId} />;
  return <RosterListingScreen listingId={listingId} />;
}
