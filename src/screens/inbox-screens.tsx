import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { AppFrame, EmptyState, ErrorState, FilterChip, PullToRefresh } from "@/components/coach-ui";
import { Button, Header, Input } from "@/components/kit";
import { shortDate } from "@/lib/format";
import type { NoticeCategory } from "@/lib/models";
import { useCoach } from "@/lib/store";

const CATEGORIES: Array<NoticeCategory | "All"> = ["All", "Applications", "Messages", "Events", "Roster", "System"];

export function NotificationsScreen() {
  const { data, user, markNotificationRead, markAllRead, clearNotifications, storageError } = useCoach();
  const navigate = useNavigate();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [refreshing, setRefreshing] = useState(false);
  const items = data.notifications.filter((item) => {
    if (!user?.notifPrefs[item.category]) return false;
    return category === "All" || item.category === category;
  });

  if (storageError) {
    return (
      <AppFrame>
        <Header title="Notifications" fallbackTo="/home" />
        <div className="px-5">
          <ErrorState title="Saved data is blocked" body="This browser did not allow SpotMyRoster to store notifications on the device." onRetry={() => window.location.reload()} />
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame>
      <Header title="Notifications" fallbackTo="/home" />
      <PullToRefresh onRefresh={async () => { setRefreshing(true); await new Promise((resolve) => setTimeout(resolve, 400)); setRefreshing(false); }}>
        <div className="px-5 pb-8">
          <div className="mb-3 flex gap-2 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((item) => (
              <FilterChip key={item} selected={category === item} onClick={() => setCategory(item)}>{item}</FilterChip>
            ))}
          </div>
          <div className="mb-4 flex gap-2">
            <Button variant="outline" onClick={markAllRead}>Mark all read</Button>
            <Button variant="ghost" onClick={clearNotifications}>Clear all</Button>
          </div>
          {refreshing && <p className="type-small text-dim">Refreshing…</p>}
          {items.length === 0 && <EmptyState title="You're caught up" body="Muted categories stay hidden. Change that in notification settings." />}
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`w-full rounded-2xl border px-4 py-3 text-left ${item.read ? "border-border bg-card" : "border-primary bg-card"}`}
                  onClick={() => {
                    markNotificationRead(item.id);
                    if (item.href) navigate({ to: item.href as "/" });
                  }}
                >
                  <span className="type-caption text-dim">{item.category} · {shortDate(item.at)}</span>
                  <span className="mt-1 block type-sub text-foreground">{item.title}</span>
                  <span className="mt-1 block type-small text-muted-foreground">{item.body}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </PullToRefresh>
    </AppFrame>
  );
}

export function SearchScreen() {
  const { data, addRecentSearch, clearRecentSearches } = useCoach();
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("All");
  const [sort, setSort] = useState("name");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { athletes: [], teams: [], events: [], courses: [] };
    const athletes = data.athletes.filter((athlete) => `${athlete.displayName} ${athlete.sport} ${athlete.positions.join(" ")} ${athlete.city}`.toLowerCase().includes(q));
    const teams = data.teams.filter((team) => `${team.name} ${team.sport} ${team.city}`.toLowerCase().includes(q));
    const events = data.events.filter((event) => `${event.title} ${event.city} ${event.type}`.toLowerCase().includes(q));
    const courses = data.courses.filter((course) => `${course.title} ${course.category}`.toLowerCase().includes(q));
    if (sort === "recent") events.sort((a, b) => b.date.localeCompare(a.date));
    else {
      athletes.sort((a, b) => a.displayName.localeCompare(b.displayName));
      teams.sort((a, b) => a.name.localeCompare(b.name));
    }
    return { athletes, teams, events, courses };
  }, [data, query, sort]);

  const suggestions = ["14U shortstop", "Dallas tryout", "Practice planning", "Softball catcher"];
  const total = results.athletes.length + results.teams.length + results.events.length + results.courses.length;

  return (
    <AppFrame>
      <Header title="Search" fallbackTo="/home" />
      <div className="px-5 pb-8">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            addRecentSearch(query);
          }}
        >
          <Input aria-label="Search" placeholder="Athletes, teams, events, courses" value={query} onChange={(event) => setQuery(event.target.value)} />
        </form>
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {["All", "Athletes", "Teams", "Events", "Courses"].map((item) => (
            <FilterChip key={item} selected={group === item} onClick={() => setGroup(item)}>{item}</FilterChip>
          ))}
          <FilterChip selected={sort === "name"} onClick={() => setSort("name")}>Name</FilterChip>
          <FilterChip selected={sort === "recent"} onClick={() => setSort("recent")}>Newest events</FilterChip>
        </div>
        {!query.trim() && (
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="type-section text-foreground">Recent</h2>
              {data.recentSearches.length > 0 && <button type="button" className="min-h-11 text-sm font-semibold text-foreground" onClick={clearRecentSearches}>Clear</button>}
            </div>
            <div className="flex flex-wrap gap-2">
              {data.recentSearches.map((item) => (
                <FilterChip key={item} onClick={() => setQuery(item)}>{item}</FilterChip>
              ))}
            </div>
            <h2 className="type-section mt-6 text-foreground">Suggested</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {suggestions.map((item) => (
                <FilterChip key={item} onClick={() => { setQuery(item); addRecentSearch(item); }}>{item}</FilterChip>
              ))}
            </div>
          </div>
        )}
        {query.trim() && total === 0 && <div className="mt-6"><EmptyState title="No results" body="Try a position, a city, or a course title." /></div>}
        {query.trim() && (group === "All" || group === "Athletes") && results.athletes.length > 0 && (
          <Group title="Athletes">
            {results.athletes.map((athlete) => (
              <Link key={athlete.id} to="/recruit/athletes/$athleteId" params={{ athleteId: athlete.id }} className="block py-3 type-sub text-foreground">{athlete.displayName} · {athlete.positions[0]}</Link>
            ))}
          </Group>
        )}
        {query.trim() && (group === "All" || group === "Teams") && results.teams.length > 0 && (
          <Group title="Teams">
            {results.teams.map((team) => (
              <Link key={team.id} to="/teams/$teamId" params={{ teamId: team.id }} className="block py-3 type-sub text-foreground">{team.name}</Link>
            ))}
          </Group>
        )}
        {query.trim() && (group === "All" || group === "Events") && results.events.length > 0 && (
          <Group title="Events">
            {results.events.map((event) => (
              <Link key={event.id} to="/events/$eventId" params={{ eventId: event.id }} className="block py-3 type-sub text-foreground">{event.title}</Link>
            ))}
          </Group>
        )}
        {query.trim() && (group === "All" || group === "Courses") && results.courses.length > 0 && (
          <Group title="Courses">
            {results.courses.map((course) => (
              <Link key={course.id} to="/learn/courses/$courseId" params={{ courseId: course.id }} className="block py-3 type-sub text-foreground">{course.title}</Link>
            ))}
          </Group>
        )}
      </div>
    </AppFrame>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="type-section text-foreground">{title}</h2>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}
