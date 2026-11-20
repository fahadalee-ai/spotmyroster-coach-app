import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppFrame, ConfirmDialog, EmptyState, GuardianNote, PersonAvatar, Sheet } from "@/components/coach-ui";
import { Button, Header, Input } from "@/components/kit";
import { shortDate } from "@/lib/format";
import { useCoach } from "@/lib/store";

export function ChatListScreen() {
  const { data } = useCoach();
  const [query, setQuery] = useState("");
  const conversations = data.conversations.filter((conversation) => {
    const haystack = `${conversation.participantName} ${conversation.athleteLabel}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <AppFrame>
      <div className="px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <h1 className="type-title text-foreground">Messages</h1>
        <p className="mt-1 type-small text-muted-foreground">Threads are with a parent or guardian. This preview is not live chat.</p>
        <div className="mt-4">
          <Input aria-label="Search messages" placeholder="Search guardians" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <div className="mt-4 space-y-2">
          {conversations.length === 0 && <EmptyState title="No conversations" body="Message a guardian from an athlete profile to start a thread on this device." />}
          {conversations.map((conversation) => {
            const last = conversation.messages[conversation.messages.length - 1];
            return (
              <Link key={conversation.id} to="/chat/$conversationId" params={{ conversationId: conversation.id }} className="flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3">
                <PersonAvatar name={conversation.participantName} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="type-sub text-foreground">{conversation.participantName}</span>
                    {conversation.unread > 0 && <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">{conversation.unread}</span>}
                  </span>
                  <span className="block truncate type-small text-muted-foreground">{conversation.blocked ? "Blocked" : last?.text ?? "No messages yet"}</span>
                  <span className="type-caption text-dim">{conversation.athleteLabel}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </AppFrame>
  );
}

export function ChatDetailScreen({ conversationId }: { conversationId: string }) {
  const { data, sendMessage, markConversationRead, blockConversation, unblockConversation, reportConversation } = useCoach();
  const conversation = data.conversations.find((item) => item.id === conversationId);
  const [text, setText] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [reason, setReason] = useState("Concern about this conversation");

  useEffect(() => {
    if (conversation && conversation.unread > 0) markConversationRead(conversation.id);
  }, [conversation, markConversationRead]);

  if (!conversation) {
    return <AppFrame hideTabs><Header title="Chat" fallbackTo="/chat" /><div className="px-5"><EmptyState title="Conversation not found" body="It may have been removed on this device." /></div></AppFrame>;
  }

  return (
    <AppFrame hideTabs>
      <Header
        title={conversation.participantName}
        subtitle={conversation.participantRole}
        fallbackTo="/chat"
        right={<button type="button" className="min-h-11 px-2 text-sm font-semibold text-foreground" onClick={() => setReportOpen(true)}>Safety</button>}
      />
      <div className="space-y-3 px-5 pb-28">
        <GuardianNote />
        <p className="type-small text-muted-foreground">About {conversation.athleteLabel}</p>
        <Link to="/recruit/athletes/$athleteId" params={{ athleteId: conversation.athleteId }} className="inline-flex min-h-11 items-center text-sm font-semibold text-foreground underline">
          Athlete profile
        </Link>
        {conversation.messages.length === 0 && <EmptyState title="No messages yet" body="Write the first note to the guardian. It stays on this device." />}
        {conversation.messages.map((message) => (
          <div key={message.id} className={message.from === "me" ? "ml-10" : "mr-10"}>
            <div className={message.from === "me" ? "rounded-2xl rounded-br-md bg-primary px-3 py-2 text-primary-foreground" : "rounded-2xl rounded-bl-md bg-card px-3 py-2 text-foreground"}>
              {message.attachment?.kind === "image" && message.attachment.url && (
                <img src={message.attachment.url} alt="" className="mb-2 max-h-40 rounded-xl object-cover" />
              )}
              {message.attachment?.kind === "file" && <p className="type-small font-semibold">File · {message.attachment.name}</p>}
              {message.text && <p className="type-body">{message.text}</p>}
            </div>
            <p className={`mt-1 type-caption text-dim ${message.from === "me" ? "text-right" : ""}`}>
              {shortDate(message.at)} · {message.status}
            </p>
          </div>
        ))}
        {conversation.reported && <p className="type-small text-muted-foreground">A report is saved on this device. No safety team is connected.</p>}
      </div>
      {conversation.blocked ? (
        <div className="fixed bottom-0 left-1/2 w-full max-w-[480px] -translate-x-1/2 border-t border-border bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <p className="type-small text-muted-foreground">You blocked this guardian.</p>
          <Button className="mt-2" variant="outline" onClick={() => unblockConversation(conversation.id)}>Unblock</Button>
        </div>
      ) : (
        <form
          className="fixed bottom-0 left-1/2 flex w-full max-w-[480px] -translate-x-1/2 gap-2 border-t border-border bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage(conversation.id, text.trim());
            setText("");
          }}
        >
          <label className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-card text-xs font-semibold text-foreground">
            File
            <input
              type="file"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (file.type.startsWith("image/")) {
                  const url = URL.createObjectURL(file);
                  sendMessage(conversation.id, text.trim(), { name: file.name, kind: "image", url });
                } else {
                  sendMessage(conversation.id, file.name, { name: file.name, kind: "file" });
                }
                setText("");
              }}
            />
          </label>
          <Input aria-label="Message" value={text} onChange={(event) => setText(event.target.value)} placeholder="Message the guardian" />
          <Button type="submit">Send</Button>
        </form>
      )}
      <Sheet open={reportOpen} title="Safety" onClose={() => setReportOpen(false)}>
        <p className="type-small text-muted-foreground">Report or block this guardian. The action is stored on this device only.</p>
        <div className="mt-4 flex flex-col gap-2">
          {["Concern about this conversation", "Asked to move off the app", "Something else"].map((item) => (
            <button key={item} type="button" className={`min-h-11 rounded-xl px-3 text-left text-sm font-semibold ${reason === item ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`} onClick={() => setReason(item)}>
              {item}
            </button>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => { setReportOpen(false); setBlockOpen(true); }}>Block</Button>
          <Button onClick={() => { reportConversation(conversation.id, reason); setReportOpen(false); toast("Report saved on this device"); }}>Report</Button>
        </div>
      </Sheet>
      <ConfirmDialog
        open={blockOpen}
        title={`Block ${conversation.participantName}?`}
        body="You will not be able to send messages in this thread until you unblock them."
        confirmLabel="Block"
        danger
        onClose={() => setBlockOpen(false)}
        onConfirm={() => {
          blockConversation(conversation.id);
          setBlockOpen(false);
          toast("Guardian blocked on this device");
        }}
      />
    </AppFrame>
  );
}
