import { Link, useNavigate } from "@tanstack/react-router";
import { AppFrame, EmptyState, StatusBadge } from "@/components/coach-ui";
import { Button, Header, Row } from "@/components/kit";
import { shortDate } from "@/lib/format";
import { PLAN_COPY, type CoachPlanId } from "@/lib/models";
import { useCoach } from "@/lib/store";

export function CoachMenuScreen() {
  return (
    <AppFrame>
      <Header title="Coach" subtitle="Account and engagement" fallbackTo="/home" />
      <div className="space-y-6 px-5 pb-8">
        <section>
          <p className="type-label mb-2 text-muted-foreground">Account</p>
          <div className="overflow-hidden rounded-2xl border border-border">
            <Row to="/profile" label="Profile" />
            <Row to="/subscription" label="Subscription" />
            <Row to="/payments" label="Payment history" />
            <Row to="/alerts" label="Alerts" />
            <Row to="/profile/help" label="Help and support" />
          </div>
        </section>
        <section>
          <p className="type-label mb-2 text-muted-foreground">Engagement</p>
          <div className="overflow-hidden rounded-2xl border border-border">
            <Row to="/listings" label="Listings" />
            <Row to="/teams" label="My teams" />
            <Row to="/recruit/applications" label="Inquiries" />
            <Row to="/recruit" label="Saved athletes" />
            <Row to="/chat" label="Messages" />
            <Row to="/events/calendar" label="Calendar" />
          </div>
        </section>
      </div>
    </AppFrame>
  );
}

export function SubscriptionScreen() {
  const { data, setPlan } = useCoach();
  const navigate = useNavigate();
  const plans: CoachPlanId[] = ["premium", "unlimited"];
  return (
    <AppFrame>
      <Header title="Subscription" subtitle="Your Coach plan and listing boosts" fallbackTo="/coach" right={<Button variant="ghost" onClick={() => navigate({ to: "/subscription/manage" })}>Manage</Button>} />
      <div className="space-y-3 px-5 pb-8">
        {plans.map((id) => {
          const plan = PLAN_COPY[id];
          const current = data.planId === id;
          return (
            <article key={id} className="rounded-3xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="type-title text-foreground">{plan.name}</h2>
                {current && <StatusBadge status="Active" />}
              </div>
              <p className="mt-2 type-small text-muted-foreground">{plan.summary}</p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="type-small text-foreground">· {feature}</li>
                ))}
              </ul>
              {!current && <Button className="mt-4" full onClick={() => { setPlan(id); navigate({ to: "/subscription/manage" }); }}>Use {plan.name}</Button>}
            </article>
          );
        })}
        <p className="type-helper text-dim">A monthly price was not printed on the coach plans in the design file. The listing boost price shown there is $10.</p>
      </div>
    </AppFrame>
  );
}

export function ManageSubscriptionScreen() {
  const { data, resolveRenewal } = useCoach();
  const plan = PLAN_COPY[data.planId];
  return (
    <AppFrame>
      <Header title="Manage subscription" fallbackTo="/subscription" />
      <div className="px-5 pb-8">
        <p className="type-caption text-primary">Current plan</p>
        <h2 className="type-title mt-1 text-foreground">{plan.name}</h2>
        <p className="mt-2 type-body text-muted-foreground">{plan.summary}</p>
        <p className="mt-4 type-small text-foreground">
          {data.planId === "unlimited" ? "Unlimited featured listing boosts." : `${data.boostsRemaining} complimentary listing ${data.boostsRemaining === 1 ? "boost" : "boosts"} remaining.`}
        </p>
        {data.renewalFailed && (
          <div className="mt-4 rounded-2xl border border-border bg-card p-4">
            <p className="type-sub text-foreground">Coach Premium renewal failed</p>
            <p className="mt-1 type-small text-muted-foreground">Your Coach Premium renewal failed.</p>
            <Button className="mt-3" variant="outline" onClick={resolveRenewal}>Mark the renewal reviewed</Button>
          </div>
        )}
        <div className="mt-6 overflow-hidden rounded-2xl border border-border">
          <Row to="/subscription" label="Compare plans" />
          <Row to="/payments" label="Payment history" />
        </div>
      </div>
    </AppFrame>
  );
}

export function PaymentsScreen() {
  const { data } = useCoach();
  return (
    <AppFrame>
      <Header title="Payment history" fallbackTo="/subscription" />
      <div className="px-5 pb-8">
        {data.payments.length === 0 && <EmptyState title="No payments" body="Listing boosts appear here. A boost is $10, or free while a complimentary boost remains." />}
        <div className="overflow-hidden rounded-2xl border border-border">
          {data.payments.map((payment) => (
            <Link key={payment.id} to="/payments/$paymentId" params={{ paymentId: payment.id }} className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0">
              <span>
                <span className="block type-small font-semibold text-foreground">{payment.title}</span>
                <span className="type-helper text-muted-foreground">{shortDate(payment.at)}</span>
              </span>
              <span className="flex items-center gap-2">
                {payment.amount && <span className="type-small text-foreground">{payment.amount}</span>}
                <StatusBadge status={payment.status} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </AppFrame>
  );
}

export function ReceiptScreen({ paymentId }: { paymentId: string }) {
  const { data } = useCoach();
  const payment = data.payments.find((item) => item.id === paymentId);
  if (!payment) {
    return (
      <AppFrame>
        <Header title="Receipt" fallbackTo="/payments" />
        <div className="px-5"><EmptyState title="Receipt not found" body="This payment is not on this device." /></div>
      </AppFrame>
    );
  }
  return (
    <AppFrame>
      <Header title="Receipt" fallbackTo="/payments" />
      <article className="mx-5 rounded-3xl border border-border bg-card p-5">
        <StatusBadge status={payment.status} />
        <h2 className="type-title mt-4 text-foreground">{payment.title}</h2>
        {payment.amount && <p className="type-display mt-2 text-foreground">{payment.amount}</p>}
        <p className="mt-3 type-body text-muted-foreground">{payment.detail}</p>
        <p className="mt-4 type-small text-foreground">{shortDate(payment.at)}</p>
        <p className="mt-1 type-helper text-dim">SpotMyRoster coach account · stored on this device</p>
      </article>
    </AppFrame>
  );
}

export function AlertsScreen() {
  const { data } = useCoach();
  const alerts = data.notifications.filter((item) => item.category === "System");
  return (
    <AppFrame>
      <Header title="Alerts" fallbackTo="/coach" />
      <div className="space-y-3 px-5 pb-8">
        {data.renewalFailed && (
          <Link to="/subscription/manage" className="block rounded-2xl border border-border bg-card p-4">
            <p className="type-sub text-foreground">Coach Premium renewal failed</p>
            <p className="mt-1 type-small text-muted-foreground">Your Coach Premium renewal failed.</p>
          </Link>
        )}
        {alerts.map((alert) => (
          <Link key={alert.id} to={(alert.href || "/alerts") as "/"} className="block rounded-2xl border border-border bg-card p-4">
            <p className="type-sub text-foreground">{alert.title}</p>
            <p className="mt-1 type-small text-muted-foreground">{alert.body}</p>
          </Link>
        ))}
        {!data.renewalFailed && alerts.length === 0 && <EmptyState title="No alerts" body="Renewal and account alerts show up here." />}
      </div>
    </AppFrame>
  );
}
