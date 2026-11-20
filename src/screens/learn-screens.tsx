import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppFrame, EmptyState, FilterChip, ProgressBar, SectionHead, coverSrc } from "@/components/coach-ui";
import { Button, Field, Header, Input, Textarea } from "@/components/kit";
import { courseProgress, lessonById, useCoach } from "@/lib/store";

export function LearnScreen() {
  const { data } = useCoach();
  const navigate = useNavigate();
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const categories = ["All", ...new Set(data.courses.map((course) => course.category))];
  const courses = data.courses.filter((course) => {
    if (category !== "All" && course.category !== category) return false;
    if (query && !`${course.title} ${course.description}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });
  const active = data.courses.find((course) => course.enrolled && courseProgress(course) < 100);

  return (
    <AppFrame>
      <div className="px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <h1 className="type-title text-foreground">Learn</h1>
          <Button variant="ghost" onClick={() => navigate({ to: "/learn/my" })}>My courses</Button>
        </div>
        <div className="mt-4">
          <Input aria-label="Search courses" placeholder="Search courses" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((item) => (
            <FilterChip key={item} selected={category === item} onClick={() => setCategory(item)}>{item}</FilterChip>
          ))}
        </div>
        {active && (
          <>
            <SectionHead title="Continue" />
            <Link to="/learn/courses/$courseId" params={{ courseId: active.id }} className="block rounded-2xl border border-border bg-card p-4">
              <p className="type-sub text-foreground">{active.title}</p>
              <div className="mt-3"><ProgressBar value={courseProgress(active)} /></div>
              <p className="mt-2 type-small text-muted-foreground">{courseProgress(active)}% complete</p>
            </Link>
          </>
        )}
        <SectionHead title="Courses" />
        <div className="space-y-3">
          {courses.length === 0 && <EmptyState title="No courses" body="Try another category or clear the search." />}
          {courses.map((course) => (
            <Link key={course.id} to="/learn/courses/$courseId" params={{ courseId: course.id }} className="block overflow-hidden rounded-2xl border border-border bg-card">
              <img src={coverSrc(course.cover)} alt="" className="h-36 w-full object-cover" />
              <div className="p-4">
                <p className="type-caption text-dim">{course.category} · {course.level}</p>
                <p className="type-sub mt-1 text-foreground">{course.title}</p>
                <p className="mt-1 type-small text-muted-foreground">{course.instructor}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppFrame>
  );
}

export function MyCoursesScreen() {
  const { data } = useCoach();
  const enrolled = data.courses.filter((course) => course.enrolled);
  const done = enrolled.filter((course) => courseProgress(course) === 100);
  const current = enrolled.filter((course) => courseProgress(course) < 100);
  return (
    <AppFrame>
      <Header title="My courses" fallbackTo="/learn" />
      <div className="space-y-6 px-5 pb-8">
        <section>
          <h2 className="type-section text-foreground">In progress</h2>
          <div className="mt-3 space-y-2">
            {current.length === 0 && <p className="type-small text-muted-foreground">Nothing in progress.</p>}
            {current.map((course) => (
              <Link key={course.id} to="/learn/courses/$courseId" params={{ courseId: course.id }} className="block rounded-2xl bg-card p-4">
                <p className="type-sub text-foreground">{course.title}</p>
                <div className="mt-2"><ProgressBar value={courseProgress(course)} /></div>
              </Link>
            ))}
          </div>
        </section>
        <section>
          <h2 className="type-section text-foreground">Completed</h2>
          <div className="mt-3 space-y-2">
            {done.length === 0 && <p className="type-small text-muted-foreground">No completed courses yet.</p>}
            {done.map((course) => (
              <Link key={course.id} to="/learn/courses/$courseId" params={{ courseId: course.id }} className="block rounded-2xl bg-card p-4 type-sub text-foreground">
                {course.title}
              </Link>
            ))}
          </div>
          <p className="mt-3 type-helper text-dim">Certificates are not included with these sample courses.</p>
        </section>
      </div>
    </AppFrame>
  );
}

export function CourseScreen({ courseId }: { courseId: string }) {
  const { data, enroll, rateCourse } = useCoach();
  const navigate = useNavigate();
  const course = data.courses.find((item) => item.id === courseId);
  const [rating, setRating] = useState(course?.myRating ?? 0);
  const [review, setReview] = useState(course?.myReview ?? "");
  if (!course) {
    return <AppFrame><Header title="Course" fallbackTo="/learn" /><div className="px-5"><EmptyState title="Course not found" body="It is not in the sample catalog." /></div></AppFrame>;
  }
  const minutes = course.chapters.flatMap((chapter) => chapter.lessons).reduce((sum, lesson) => sum + lesson.minutes, 0);
  const nextLesson = course.chapters.flatMap((chapter) => chapter.lessons).find((lesson) => !lesson.complete);

  function download(title: string) {
    const blob = new Blob(
      [`${title}\n\nSample worksheet. Replace this file when SpotMyRoster supplies the real resource.\n`],
      { type: "text/plain" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/\s+/g, "-").toLowerCase()}-sample.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppFrame>
      <Header title="Course" fallbackTo="/learn" />
      <img src={coverSrc(course.cover)} alt="" className="h-48 w-full object-cover" />
      <div className="space-y-4 px-5 py-5">
        <p className="type-caption text-dim">{course.category} · {minutes} min · {course.level}</p>
        <h1 className="type-title text-foreground">{course.title}</h1>
        <p className="type-small text-muted-foreground">{course.instructor}</p>
        <p className="type-body text-foreground">{course.description}</p>
        <ProgressBar value={courseProgress(course)} />
        {!course.enrolled ? (
          <Button full onClick={() => { enroll(course.id); toast.success("Enrolled"); }}>Enroll</Button>
        ) : nextLesson ? (
          <Button full onClick={() => navigate({ to: "/learn/courses/$courseId/lessons/$lessonId", params: { courseId, lessonId: nextLesson.id } })}>Continue</Button>
        ) : (
          <p className="type-small text-foreground">You finished every lesson in this sample course.</p>
        )}
        <p className="type-helper text-dim">Payment is not part of this preview. No price is shown.</p>
        {course.chapters.map((chapter) => (
          <section key={chapter.title}>
            <h2 className="type-section text-foreground">{chapter.title}</h2>
            <ul className="mt-2 space-y-2">
              {chapter.lessons.map((lesson) => (
                <li key={lesson.id}>
                  <Link to="/learn/courses/$courseId/lessons/$lessonId" params={{ courseId, lessonId: lesson.id }} className="flex items-center justify-between rounded-2xl bg-card px-4 py-3">
                    <span>
                      <span className="block type-sub text-foreground">{lesson.title}</span>
                      <span className="type-small text-muted-foreground">{lesson.minutes} min</span>
                    </span>
                    <span className="type-caption text-dim">{lesson.complete ? "Done" : "Open"}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <Button variant="outline" onClick={() => download(course.title)}>Download sample worksheet</Button>
        <h2 className="type-section text-foreground">Reviews</h2>
        {course.reviews.map((item) => (
          <article key={item.id} className="rounded-2xl bg-card p-4">
            <p className="type-small font-semibold text-foreground">{item.author} · {item.rating}/5</p>
            <p className="mt-1 type-small text-muted-foreground">{item.body}</p>
          </article>
        ))}
        <Field label="Your rating">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button key={value} type="button" aria-label={`${value} stars`} className={`h-11 w-11 rounded-xl font-semibold ${rating >= value ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`} onClick={() => setRating(value)}>
                {value}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Your review">
          <Textarea value={review} onChange={(event) => setReview(event.target.value)} />
        </Field>
        <Button variant="outline" onClick={() => { rateCourse(course.id, rating, review); toast.success("Review saved on this device"); }}>Save review</Button>
        <p className="type-helper text-dim">A certificate of completion is not offered for this sample course.</p>
      </div>
    </AppFrame>
  );
}

export function LessonScreen({ courseId, lessonId }: { courseId: string; lessonId: string }) {
  const { data, completeLesson } = useCoach();
  const navigate = useNavigate();
  const course = data.courses.find((item) => item.id === courseId);
  const found = course ? lessonById(course, lessonId) : null;
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setProgress(100);
      setPlaying(false);
      return;
    }
    const timer = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 100) {
          setPlaying(false);
          return 100;
        }
        return value + 2;
      });
    }, 200);
    return () => window.clearInterval(timer);
  }, [playing]);

  if (!course || !found) {
    return <AppFrame hideTabs><Header title="Lesson" fallbackTo="/learn" /><div className="px-5"><EmptyState title="Lesson not found" body="Go back to the course." /></div></AppFrame>;
  }

  return (
    <AppFrame hideTabs>
      <Header title={found.lesson.title} subtitle={course.title} fallbackTo="/learn" />
      <div className="px-5 pb-8">
        <div className="overflow-hidden rounded-2xl bg-ink">
          <img src={coverSrc(course.cover)} alt="" className="h-48 w-full object-cover opacity-80" />
          <div className="p-4">
            <p className="type-small text-white/80">Sample player. No video file is attached.</p>
            <div className="mt-3"><ProgressBar value={progress} /></div>
            <div className="mt-3">
              <Button onClick={() => setPlaying((value) => !value)}>{playing ? "Pause" : "Play sample"}</Button>
            </div>
          </div>
        </div>
        <p className="mt-4 type-small text-muted-foreground">{found.chapter.title} · {found.lesson.minutes} min</p>
        <p className="mt-3 type-body text-foreground">{found.lesson.body}</p>
        <div className="mt-6">
          <Button
            full
            disabled={found.lesson.complete}
            onClick={() => {
              completeLesson(course.id, found.lesson.id);
              toast.success("Lesson marked complete");
              navigate({ to: "/learn/courses/$courseId", params: { courseId } });
            }}
          >
            {found.lesson.complete ? "Completed" : "Mark complete"}
          </Button>
        </div>
      </div>
    </AppFrame>
  );
}
