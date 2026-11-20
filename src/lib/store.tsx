import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import type {
  AppData,
  Application,
  Athlete,
  Coach,
  Conversation,
  Course,
  PipelineStage,
  RosterMember,
  RosterNeed,
  SetupDraft,
  SportEvent,
  Team,
} from "./models";
import { createSeed, SAMPLE_OTP } from "./sample-data";
import { newId } from "./format";
import { clearStorage, readStorage, writeStorage } from "./storage";

export const STORAGE_KEY = "smr-coach-v1";

type Action =
  | { type: "hydrate"; data: AppData }
  | { type: "replace"; data: AppData }
  | { type: "patch"; patch: Partial<AppData> }
  | { type: "set-users"; users: Coach[] }
  | { type: "update-user"; id: string; patch: Partial<Coach> };

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case "hydrate":
    case "replace":
      return action.data;
    case "patch":
      return { ...state, ...action.patch };
    case "set-users":
      return { ...state, users: action.users };
    case "update-user":
      return {
        ...state,
        users: state.users.map((user) => (user.id === action.id ? { ...user, ...action.patch } : user)),
      };
    default:
      return state;
  }
}

function blankCoach(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}): Coach {
  return {
    id: newId("coach"),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    password: input.password,
    sports: [],
    level: "",
    years: 0,
    organization: "",
    city: "",
    state: "",
    certifications: [],
    bio: "",
    contactPreference: "in-app",
    socials: [],
    profileComplete: false,
    emailVerified: false,
    language: "en",
    theme: "dark",
    textScale: "default",
    notifPrefs: { Applications: true, Messages: true, Events: true, Roster: true, System: true },
    privacy: { showEmail: false, showPhone: false, guardianRequired: true },
  };
}

type CoachApi = {
  ready: boolean;
  storageError: boolean;
  data: AppData;
  user: Coach | null;
  markOnboarded: () => void;
  login: (email: string, password: string) => { ok: true; user: Coach } | { ok: false; reason: "invalid" };
  register: (input: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => { ok: true; email: string } | { ok: false; reason: "exists" };
  requestOtp: (email: string, purpose: "verify" | "reset") => { ok: true } | { ok: false; reason: "missing" };
  verifyOtp: (code: string) => { ok: true; purpose: "verify" | "reset"; email: string } | { ok: false };
  resetPassword: (password: string) => boolean;
  saveDraft: (draft: SetupDraft) => void;
  completeSetup: (draft: SetupDraft) => void;
  logout: () => void;
  updateProfile: (patch: Partial<Coach>) => void;
  changePassword: (current: string, next: string) => boolean;
  deleteAccount: () => void;
  setTheme: (theme: Coach["theme"]) => void;
  setLanguage: (language: Coach["language"]) => void;
  setTextScale: (textScale: Coach["textScale"]) => void;
  toggleNotif: (key: keyof Coach["notifPrefs"]) => void;
  updatePrivacy: (patch: Partial<Coach["privacy"]>) => void;
  saveTeam: (team: Team) => void;
  archiveTeam: (id: string) => void;
  saveRosterMember: (member: RosterMember) => void;
  removeRosterMember: (id: string) => void;
  saveNeed: (need: RosterNeed) => void;
  setNeedStatus: (id: string, status: RosterNeed["status"]) => void;
  toggleSavedAthlete: (id: string) => void;
  setAthleteNote: (id: string, note: string) => void;
  setApplication: (id: string, patch: Partial<Application>) => void;
  saveEvent: (event: SportEvent) => void;
  setEventStatus: (id: string, status: SportEvent["status"]) => void;
  setRsvp: (eventId: string, rsvpId: string, status: SportEvent["rsvps"][number]["status"]) => void;
  enroll: (courseId: string) => void;
  completeLesson: (courseId: string, lessonId: string) => void;
  rateCourse: (courseId: string, rating: number, review: string) => void;
  sendMessage: (conversationId: string, text: string, attachment?: Conversation["messages"][number]["attachment"]) => void;
  markConversationRead: (conversationId: string) => void;
  openConversation: (athleteId: string) => string;
  blockConversation: (conversationId: string) => void;
  unblockConversation: (conversationId: string) => void;
  reportConversation: (conversationId: string, reason: string) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
  resetSample: () => void;
};

const Ctx = createContext<CoachApi | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, undefined, createSeed);
  const [ready, setReady] = useReducer((value: boolean) => value || true, false);
  const [storageError, setStorageError] = useReducer((value: boolean) => value || true, false);
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    const raw = readStorage(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as AppData;
        if (parsed?.users && parsed.teams) dispatch({ type: "hydrate", data: parsed });
      } catch {
        setStorageError();
      }
    }
    setReady();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const ok = writeStorage(STORAGE_KEY, JSON.stringify(data));
    if (!ok) setStorageError();
  }, [data, ready]);

  const user = data.users.find((item) => item.id === data.sessionUserId) ?? null;

  useEffect(() => {
    if (!ready) return;
    const theme = user?.theme ?? "dark";
    const language = user?.language ?? "en";
    const scale = user?.textScale ?? "default";
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = language === "es" ? "es" : "en";
    document.documentElement.style.fontSize = scale === "large" ? "18px" : scale === "small" ? "15px" : "16px";
  }, [ready, user?.theme, user?.language, user?.textScale]);

  const api = useMemo<CoachApi>(() => {
    const current = () => dataRef.current;
    const patchUser = (id: string, patch: Partial<Coach>) => dispatch({ type: "update-user", id, patch });

    return {
      ready,
      storageError,
      data,
      user,
      markOnboarded: () => dispatch({ type: "patch", patch: { onboarded: true } }),
      login: (email, password) => {
        const found = current().users.find((item) => item.email === email.trim().toLowerCase());
        if (!found || found.password !== password) return { ok: false, reason: "invalid" };
        dispatch({ type: "patch", patch: { sessionUserId: found.id, onboarded: true } });
        return { ok: true, user: found };
      },
      register: (input) => {
        const email = input.email.trim().toLowerCase();
        if (current().users.some((item) => item.email === email)) return { ok: false, reason: "exists" };
        const created = blankCoach({ ...input, email });
        dispatch({
          type: "patch",
          patch: {
            users: [...current().users, created],
            pendingAuth: { email, purpose: "verify", verified: false },
            onboarded: true,
          },
        });
        return { ok: true, email };
      },
      requestOtp: (email, purpose) => {
        const found = current().users.find((item) => item.email === email.trim().toLowerCase());
        if (!found) return { ok: false, reason: "missing" };
        dispatch({
          type: "patch",
          patch: { pendingAuth: { email: found.email, purpose, verified: false } },
        });
        return { ok: true };
      },
      verifyOtp: (code) => {
        const pending = current().pendingAuth;
        if (!pending || code.trim() !== SAMPLE_OTP) return { ok: false };
        const found = current().users.find((item) => item.email === pending.email);
        if (!found) return { ok: false };
        if (pending.purpose === "verify") {
          patchUser(found.id, { emailVerified: true });
          dispatch({
            type: "patch",
            patch: {
              sessionUserId: found.id,
              pendingAuth: { ...pending, verified: true },
            },
          });
        } else {
          dispatch({ type: "patch", patch: { pendingAuth: { ...pending, verified: true } } });
        }
        return { ok: true, purpose: pending.purpose, email: pending.email };
      },
      resetPassword: (password) => {
        const pending = current().pendingAuth;
        if (!pending?.verified || pending.purpose !== "reset") return false;
        const found = current().users.find((item) => item.email === pending.email);
        if (!found) return false;
        patchUser(found.id, { password });
        dispatch({ type: "patch", patch: { pendingAuth: null } });
        return true;
      },
      saveDraft: (draft) => dispatch({ type: "patch", patch: { setupDraft: draft } }),
      completeSetup: (draft) => {
        const id = current().sessionUserId;
        if (!id) return;
        const socials = draft.socialUrl.trim()
          ? [{ label: draft.socialLabel.trim() || "Link", url: draft.socialUrl.trim() }]
          : [];
        patchUser(id, {
          firstName: draft.firstName.trim(),
          lastName: draft.lastName.trim(),
          photoUrl: draft.photoUrl,
          sports: draft.sports,
          level: draft.level,
          years: Number(draft.years) || 0,
          organization: draft.organization.trim(),
          city: draft.city.trim(),
          state: draft.state,
          bio: draft.bio.trim(),
          contactPreference: draft.contactPreference,
          socials,
          certifications: draft.certifications
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          profileComplete: true,
          emailVerified: true,
        });
        dispatch({ type: "patch", patch: { setupDraft: null, pendingAuth: null } });
      },
      logout: () => dispatch({ type: "patch", patch: { sessionUserId: null } }),
      updateProfile: (patch) => {
        const id = current().sessionUserId;
        if (id) patchUser(id, patch);
      },
      changePassword: (currentPassword, next) => {
        const active = current().users.find((item) => item.id === current().sessionUserId);
        if (!active || active.password !== currentPassword) return false;
        patchUser(active.id, { password: next });
        return true;
      },
      deleteAccount: () => {
        const id = current().sessionUserId;
        dispatch({
          type: "patch",
          patch: {
            users: current().users.filter((item) => item.id !== id),
            sessionUserId: null,
            setupDraft: null,
            pendingAuth: null,
          },
        });
      },
      setTheme: (theme) => {
        const id = current().sessionUserId;
        if (id) patchUser(id, { theme });
      },
      setLanguage: (language) => {
        const id = current().sessionUserId;
        if (id) patchUser(id, { language });
      },
      setTextScale: (textScale) => {
        const id = current().sessionUserId;
        if (id) patchUser(id, { textScale });
      },
      toggleNotif: (key) => {
        const active = current().users.find((item) => item.id === current().sessionUserId);
        if (!active) return;
        patchUser(active.id, { notifPrefs: { ...active.notifPrefs, [key]: !active.notifPrefs[key] } });
      },
      updatePrivacy: (patch) => {
        const active = current().users.find((item) => item.id === current().sessionUserId);
        if (!active) return;
        patchUser(active.id, { privacy: { ...active.privacy, ...patch } });
      },
      saveTeam: (team) => {
        const teams = current().teams.some((item) => item.id === team.id)
          ? current().teams.map((item) => (item.id === team.id ? team : item))
          : [team, ...current().teams];
        dispatch({ type: "patch", patch: { teams } });
      },
      archiveTeam: (id) => {
        dispatch({
          type: "patch",
          patch: { teams: current().teams.map((item) => (item.id === id ? { ...item, archived: true } : item)) },
        });
      },
      saveRosterMember: (member) => {
        const roster = current().roster.some((item) => item.id === member.id)
          ? current().roster.map((item) => (item.id === member.id ? member : item))
          : [...current().roster, member];
        dispatch({ type: "patch", patch: { roster } });
      },
      removeRosterMember: (id) => {
        dispatch({ type: "patch", patch: { roster: current().roster.filter((item) => item.id !== id) } });
      },
      saveNeed: (need) => {
        const needs = current().needs.some((item) => item.id === need.id)
          ? current().needs.map((item) => (item.id === need.id ? need : item))
          : [need, ...current().needs];
        dispatch({ type: "patch", patch: { needs } });
      },
      setNeedStatus: (id, status) => {
        dispatch({
          type: "patch",
          patch: { needs: current().needs.map((item) => (item.id === id ? { ...item, status } : item)) },
        });
      },
      toggleSavedAthlete: (id) => {
        dispatch({
          type: "patch",
          patch: {
            athletes: current().athletes.map((item) => (item.id === id ? { ...item, saved: !item.saved } : item)),
          },
        });
      },
      setAthleteNote: (id, note) => {
        dispatch({
          type: "patch",
          patch: { athletes: current().athletes.map((item) => (item.id === id ? { ...item, note } : item)) },
        });
      },
      setApplication: (id, patch) => {
        dispatch({
          type: "patch",
          patch: {
            applications: current().applications.map((item) => (item.id === id ? { ...item, ...patch } : item)),
          },
        });
      },
      saveEvent: (event) => {
        const events = current().events.some((item) => item.id === event.id)
          ? current().events.map((item) => (item.id === event.id ? event : item))
          : [event, ...current().events];
        dispatch({ type: "patch", patch: { events } });
      },
      setEventStatus: (id, status) => {
        dispatch({
          type: "patch",
          patch: { events: current().events.map((item) => (item.id === id ? { ...item, status } : item)) },
        });
      },
      setRsvp: (eventId, rsvpId, status) => {
        dispatch({
          type: "patch",
          patch: {
            events: current().events.map((event) =>
              event.id === eventId
                ? { ...event, rsvps: event.rsvps.map((rsvp) => (rsvp.id === rsvpId ? { ...rsvp, status } : rsvp)) }
                : event,
            ),
          },
        });
      },
      enroll: (courseId) => {
        dispatch({
          type: "patch",
          patch: {
            courses: current().courses.map((course) => (course.id === courseId ? { ...course, enrolled: true } : course)),
          },
        });
      },
      completeLesson: (courseId, lessonId) => {
        dispatch({
          type: "patch",
          patch: {
            courses: current().courses.map((course) =>
              course.id === courseId ? markLesson(course, lessonId) : course,
            ),
          },
        });
      },
      rateCourse: (courseId, rating, review) => {
        dispatch({
          type: "patch",
          patch: {
            courses: current().courses.map((course) =>
              course.id === courseId ? { ...course, myRating: rating, myReview: review } : course,
            ),
          },
        });
      },
      sendMessage: (conversationId, text, attachment) => {
        const message = {
          id: newId("msg"),
          from: "me" as const,
          text,
          at: new Date().toISOString(),
          status: "sent" as const,
          attachment,
        };
        dispatch({
          type: "patch",
          patch: {
            conversations: current().conversations.map((conversation) =>
              conversation.id === conversationId
                ? { ...conversation, messages: [...conversation.messages, message] }
                : conversation,
            ),
          },
        });
      },
      markConversationRead: (conversationId) => {
        dispatch({
          type: "patch",
          patch: {
            conversations: current().conversations.map((conversation) =>
              conversation.id === conversationId ? { ...conversation, unread: 0 } : conversation,
            ),
          },
        });
      },
      openConversation: (athleteId) => {
        const existing = current().conversations.find((item) => item.athleteId === athleteId && !item.blocked);
        if (existing) return existing.id;
        const athlete = current().athletes.find((item) => item.id === athleteId);
        const id = newId("chat");
        const conversation: Conversation = {
          id,
          athleteId,
          participantName: athlete?.guardianName ?? "Guardian",
          participantRole: "Parent or guardian",
          athleteLabel: athlete ? `${athlete.displayName} · ${athlete.ageGroup} · ${athlete.positions[0] ?? athlete.sport}` : "Athlete",
          unread: 0,
          blocked: false,
          reported: false,
          messages: [],
        };
        dispatch({ type: "patch", patch: { conversations: [conversation, ...current().conversations] } });
        return id;
      },
      blockConversation: (conversationId) => {
        dispatch({
          type: "patch",
          patch: {
            conversations: current().conversations.map((item) =>
              item.id === conversationId ? { ...item, blocked: true } : item,
            ),
          },
        });
      },
      unblockConversation: (conversationId) => {
        dispatch({
          type: "patch",
          patch: {
            conversations: current().conversations.map((item) =>
              item.id === conversationId ? { ...item, blocked: false } : item,
            ),
          },
        });
      },
      reportConversation: (conversationId, reason) => {
        dispatch({
          type: "patch",
          patch: {
            reports: [{ id: newId("report"), conversationId, reason, at: new Date().toISOString() }, ...current().reports],
            conversations: current().conversations.map((item) =>
              item.id === conversationId ? { ...item, reported: true } : item,
            ),
          },
        });
      },
      markNotificationRead: (id) => {
        dispatch({
          type: "patch",
          patch: {
            notifications: current().notifications.map((item) => (item.id === id ? { ...item, read: true } : item)),
          },
        });
      },
      markAllRead: () => {
        dispatch({
          type: "patch",
          patch: { notifications: current().notifications.map((item) => ({ ...item, read: true })) },
        });
      },
      clearNotifications: () => dispatch({ type: "patch", patch: { notifications: [] } }),
      addRecentSearch: (term) => {
        const clean = term.trim();
        if (!clean) return;
        const recent = [clean, ...current().recentSearches.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
        dispatch({ type: "patch", patch: { recentSearches: recent } });
      },
      clearRecentSearches: () => dispatch({ type: "patch", patch: { recentSearches: [] } }),
      resetSample: () => {
        clearStorage(STORAGE_KEY);
        dispatch({ type: "replace", data: createSeed() });
      },
    };
  }, [data, ready, storageError, user]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

function markLesson(course: Course, lessonId: string): Course {
  return {
    ...course,
    enrolled: true,
    chapters: course.chapters.map((chapter) => ({
      ...chapter,
      lessons: chapter.lessons.map((lesson) => (lesson.id === lessonId ? { ...lesson, complete: true } : lesson)),
    })),
  };
}

export function useCoach() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCoach must be used inside AppProvider");
  return ctx;
}

export function courseProgress(course: Course) {
  const lessons = course.chapters.flatMap((chapter) => chapter.lessons);
  if (!lessons.length) return 0;
  return Math.round((lessons.filter((lesson) => lesson.complete).length / lessons.length) * 100);
}

export function lessonById(course: Course, lessonId: string) {
  for (const chapter of course.chapters) {
    const lesson = chapter.lessons.find((item) => item.id === lessonId);
    if (lesson) return { chapter, lesson };
  }
  return null;
}

export type { Athlete, PipelineStage };
