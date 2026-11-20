export const SPORTS = ["Baseball", "Softball", "Basketball", "Soccer", "Volleyball", "Lacrosse", "Football"] as const;

export const AGE_GROUPS = ["10U", "12U", "14U", "16U", "18U"] as const;

export const COACH_LEVELS = ["Youth travel", "Club", "High school", "College"] as const;

export const PIPELINE = ["New", "Shortlisted", "Invited", "Tryout", "Offered", "Accepted", "Declined"] as const;

export type PipelineStage = (typeof PIPELINE)[number];

export type NeedStatus = "Open" | "Filled" | "Closed";

export type NoticeCategory = "Applications" | "Messages" | "Events" | "Roster" | "System";

export type NotifPrefs = Record<NoticeCategory, boolean>;

export type PrivacyPrefs = {
  showEmail: boolean;
  showPhone: boolean;
  guardianRequired: boolean;
};

export type Coach = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  photoUrl?: string;
  sports: string[];
  level: string;
  years: number;
  organization: string;
  city: string;
  state: string;
  certifications: string[];
  bio: string;
  contactPreference: "email" | "phone" | "in-app";
  socials: { label: string; url: string }[];
  profileComplete: boolean;
  emailVerified: boolean;
  language: "en" | "es";
  theme: "dark" | "light";
  textScale: "small" | "default" | "large";
  notifPrefs: NotifPrefs;
  privacy: PrivacyPrefs;
};

export type Team = {
  id: string;
  name: string;
  sport: string;
  ageGroup: string;
  gender: string;
  level: string;
  season: string;
  city: string;
  state: string;
  practice: string;
  description: string;
  league: string;
  logoUrl?: string;
  capacity: number;
  archived: boolean;
};

export type RosterMember = {
  id: string;
  teamId: string;
  name: string;
  position: string;
  jersey: string;
  ageGroup: string;
  guardianName: string;
};

export type RosterNeed = {
  id: string;
  teamId: string;
  positions: string[];
  spots: number;
  ageGroup: string;
  skill: string;
  city: string;
  state: string;
  deadline: string;
  requirements: string;
  description: string;
  status: NeedStatus;
};

export type Athlete = {
  id: string;
  displayName: string;
  sport: string;
  positions: string[];
  ageGroup: string;
  gradYear: number;
  city: string;
  state: string;
  miles: number;
  skill: string;
  availability: string;
  bio: string;
  stats: { label: string; value: string }[];
  achievements: string[];
  pastTeams: string[];
  guardianName: string;
  saved: boolean;
  note: string;
};

export type Application = {
  id: string;
  athleteId: string;
  needId: string;
  stage: PipelineStage;
  message: string;
  note: string;
  submittedAt: string;
};

export type EventRsvp = {
  id: string;
  name: string;
  role: string;
  status: "Going" | "Waitlist" | "Not going";
};

export type SportEvent = {
  id: string;
  title: string;
  type: "Tryout" | "Showcase" | "Practice" | "Tournament";
  date: string;
  time: string;
  endTime: string;
  address: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  teamId: string;
  ageGroup: string;
  capacity: number;
  deadline: string;
  description: string;
  status: "Scheduled" | "Cancelled";
  rsvps: EventRsvp[];
};

export type Lesson = {
  id: string;
  title: string;
  minutes: number;
  summary: string;
  body: string;
  complete: boolean;
};

export type Chapter = {
  title: string;
  lessons: Lesson[];
};

export type CourseReview = {
  id: string;
  author: string;
  rating: number;
  body: string;
};

export type Course = {
  id: string;
  title: string;
  category: string;
  level: string;
  instructor: string;
  description: string;
  cover: string;
  chapters: Chapter[];
  enrolled: boolean;
  myRating: number | null;
  myReview: string;
  reviews: CourseReview[];
};

export type ChatAttachment = {
  name: string;
  kind: "image" | "file";
  url?: string;
};

export type ChatMessage = {
  id: string;
  from: "me" | "them";
  text: string;
  at: string;
  status: "sent" | "delivered" | "read";
  attachment?: ChatAttachment;
};

export type Conversation = {
  id: string;
  athleteId: string;
  participantName: string;
  participantRole: string;
  athleteLabel: string;
  unread: number;
  blocked: boolean;
  reported: boolean;
  messages: ChatMessage[];
};

export type Notice = {
  id: string;
  category: NoticeCategory;
  title: string;
  body: string;
  at: string;
  read: boolean;
  href?: string;
};

export type ReportRecord = {
  id: string;
  conversationId: string;
  reason: string;
  at: string;
};

export type PendingAuth = {
  email: string;
  purpose: "verify" | "reset";
  verified: boolean;
} | null;

export type SetupDraft = {
  firstName: string;
  lastName: string;
  photoUrl?: string;
  sports: string[];
  level: string;
  years: string;
  organization: string;
  city: string;
  state: string;
  bio: string;
  contactPreference: Coach["contactPreference"];
  socialLabel: string;
  socialUrl: string;
  certifications: string;
};

export type AppData = {
  onboarded: boolean;
  users: Coach[];
  sessionUserId: string | null;
  pendingAuth: PendingAuth;
  setupDraft: SetupDraft | null;
  teams: Team[];
  roster: RosterMember[];
  needs: RosterNeed[];
  athletes: Athlete[];
  applications: Application[];
  events: SportEvent[];
  courses: Course[];
  conversations: Conversation[];
  notifications: Notice[];
  recentSearches: string[];
  reports: ReportRecord[];
};

export const NOTICE_CATEGORIES: NoticeCategory[] = ["Applications", "Messages", "Events", "Roster", "System"];

export function defaultNotifPrefs(): NotifPrefs {
  return { Applications: true, Messages: true, Events: true, Roster: true, System: true };
}

export function defaultPrivacy(): PrivacyPrefs {
  return { showEmail: false, showPhone: false, guardianRequired: true };
}
