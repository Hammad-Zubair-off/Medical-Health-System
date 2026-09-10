import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useAuth } from "../../../../core/context/AuthContext";
import type { ChatMessageDoc, ChatThreadDoc } from "../../../../core/schemas/chat.schema";
import type { ChatSenderRole } from "../../../../core/types/chat.types";
import {
  ensureThreadForAppointment,
  getChatThread,
  listAllThreads,
  markThreadRead,
  sendMessage,
  subscribeMyThreads,
  subscribeThreadMessages,
} from "../../../../core/services/firestore/chat.service";
import { getAppointmentById } from "../../../../core/services/firestore/appointments.service";
import StartVideoCallButton from "../application-modules/application/calls/components/StartVideoCallButton";
import { toDate } from "../../../../core/utils/firestore.utils";
import { formatDate } from "../../../../core/utils/display.utils";
import {
  all_routes,
  appointmentConsultationsPath,
} from "../../../routes/all_routes";

export type ChatAudience = "admin" | "doctor" | "patient";

type AppointmentChatProps = {
  audience: ChatAudience;
  /** Base path without trailing slash, e.g. `/doctor/messages` */
  basePath: string;
};

function formatMsgTime(
  value: Date | { toDate: () => Date } | null | undefined
): string {
  const date = toDate(value as Date | null | undefined);
  if (!date) return "";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function threadTitle(thread: ChatThreadDoc, audience: ChatAudience): string {
  if (audience === "doctor") return thread.patientName || "Patient";
  if (audience === "patient") return thread.doctorName || "Doctor";
  return `${thread.patientName || "Patient"} · ${thread.doctorName || "Doctor"}`;
}

const AppointmentChat = ({ audience, basePath }: AppointmentChatProps) => {
  const { appointmentId: routeAppointmentId } = useParams<{
    appointmentId?: string;
  }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [threads, setThreads] = useState<ChatThreadDoc[]>([]);
  const [messages, setMessages] = useState<ChatMessageDoc[]>([]);
  const [activeThread, setActiveThread] = useState<ChatThreadDoc | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVideoAppointment, setIsVideoAppointment] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const canCompose = audience === "doctor" || audience === "patient";
  const senderRole: ChatSenderRole | null =
    role === "doctor" || role === "patient" ? role : null;

  const refreshThreads = useCallback(async () => {
    if (!user?.uid) return;
    if (audience === "admin") {
      setListLoading(true);
      setError(null);
      try {
        setThreads(await listAllThreads(50));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load conversations"
        );
      } finally {
        setListLoading(false);
      }
    }
  }, [audience, user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    if (audience === "admin") {
      void refreshThreads();
      return;
    }
    setListLoading(true);
    setError(null);
    const unsub = subscribeMyThreads(
      user.uid,
      (list) => {
        setThreads(list);
        setListLoading(false);
      },
      (err) => {
        setError(err.message || "Failed to load conversations");
        setListLoading(false);
      }
    );
    return unsub;
  }, [audience, user?.uid, refreshThreads]);

  useEffect(() => {
    if (!routeAppointmentId || !user?.uid) {
      setActiveThread(null);
      setMessages([]);
      return;
    }

    let cancelled = false;
    let unsub: (() => void) | undefined;

    setMsgLoading(true);
    setError(null);

    void (async () => {
      try {
        let thread: ChatThreadDoc;
        if (audience === "admin") {
          const existing = await getChatThread(routeAppointmentId);
          if (!existing) throw new Error("Conversation not found");
          thread = existing;
        } else {
          thread = await ensureThreadForAppointment(
            routeAppointmentId,
            user.uid
          );
        }
        if (cancelled) return;
        setActiveThread(thread);
        if (audience === "admin") {
          await refreshThreads();
        }

        try {
          const appt = await getAppointmentById(routeAppointmentId);
          if (!cancelled) {
            setIsVideoAppointment(
              appt?.appointmentType === "video" || !!appt?.isVideoCall
            );
          }
        } catch {
          if (!cancelled) setIsVideoAppointment(false);
        }

        unsub = subscribeThreadMessages(
          routeAppointmentId,
          (msgs) => {
            if (!cancelled) {
              setMessages(msgs);
              setMsgLoading(false);
            }
          },
          (err) => {
            if (!cancelled) {
              setError(err.message);
              setMsgLoading(false);
            }
          }
        );

        if (canCompose) {
          void markThreadRead(routeAppointmentId, user.uid);
        }
      } catch (err) {
        if (!cancelled) {
          setActiveThread(null);
          setMessages([]);
          setError(
            err instanceof Error ? err.message : "Failed to open conversation"
          );
          setMsgLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [
    routeAppointmentId,
    user?.uid,
    audience,
    canCompose,
    refreshThreads,
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelect = (id: string) => {
    navigate(`${basePath}/${id}`);
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!routeAppointmentId || !user?.uid || !senderRole || !canCompose) return;
    const text = draft.trim();
    if (!text) return;
    setSending(true);
    setError(null);
    try {
      await sendMessage(routeAppointmentId, {
        text,
        senderUid: user.uid,
        senderRole,
      });
      setDraft("");
      await refreshThreads();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const emptyHint = useMemo(() => {
    if (audience === "admin") {
      return "No conversations yet. Threads appear when a doctor or patient starts chat from an appointment.";
    }
    return "No conversations yet. Open an appointment and tap Message to start chatting.";
  }, [audience]);

  return (
    <div className="page-wrapper">
      <div className="content content-two">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h4 className="fw-bold mb-0" data-testid="chat-page-title">
            Messages
          </h4>
          {audience === "admin" ? (
            <span className="badge badge-soft-secondary">Read only</span>
          ) : null}
        </div>

        {error ? (
          <div className="alert alert-danger" role="alert" data-testid="chat-error">
            {error}
          </div>
        ) : null}

        <div className="chat-wrapper border rounded bg-white" data-testid="appointment-chat">
          <div className="row g-0" style={{ minHeight: 480 }}>
            <div className="col-md-4 border-end">
              <div className="p-3 border-bottom">
                <h6 className="mb-0">Conversations</h6>
              </div>
              <div className="p-2" style={{ maxHeight: 520, overflowY: "auto" }}>
                {listLoading ? (
                  <p className="text-muted px-2 py-3 mb-0">Loading…</p>
                ) : threads.length === 0 ? (
                  <p className="text-muted px-2 py-3 mb-0" data-testid="chat-empty-list">
                    {emptyHint}
                  </p>
                ) : (
                  threads.map((t) => {
                    const active = t._id === routeAppointmentId;
                    let unread =
                      user?.uid && t.unreadByUid
                        ? t.unreadByUid[user.uid] ?? 0
                        : 0;
                    if (
                      unread <= 0 &&
                      user?.uid &&
                      (!t.unreadByUid ||
                        Object.keys(t.unreadByUid).length === 0) &&
                      t.lastMessage &&
                      t.lastSenderUid &&
                      t.lastSenderUid !== user.uid
                    ) {
                      unread = 1;
                    }
                    return (
                      <button
                        key={t._id}
                        type="button"
                        className={`btn w-100 text-start mb-1 d-flex flex-column align-items-stretch gap-1 ${
                          active ? "btn-soft-primary" : "btn-light"
                        }`}
                        style={{ whiteSpace: "normal", height: "auto" }}
                        data-testid={`chat-thread-${t._id}`}
                        onClick={() => handleSelect(t._id)}
                      >
                        <div className="d-flex align-items-center justify-content-between gap-2 w-100">
                          <span className="fw-semibold text-truncate">
                            {threadTitle(t, audience)}
                          </span>
                          {unread > 0 ? (
                            <span className="badge bg-danger rounded-pill flex-shrink-0">
                              {unread > 99 ? "99+" : unread}
                            </span>
                          ) : null}
                        </div>
                        <div className="fs-12 text-muted text-truncate w-100">
                          {t.lastMessage || "No messages yet"}
                        </div>
                        <div className="fs-12 text-muted w-100">
                          {formatDate(t.lastMessageAt)}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="col-md-8 d-flex flex-column">
              {!routeAppointmentId ? (
                <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4 text-muted">
                  Select a conversation
                </div>
              ) : (
                <>
                  <div className="p-3 border-bottom d-flex align-items-start justify-content-between gap-2">
                    <div>
                    <h6 className="mb-1" data-testid="chat-thread-header">
                      {activeThread
                        ? threadTitle(activeThread, audience)
                        : "Conversation"}
                    </h6>
                    <p className="mb-0 fs-13 text-muted">
                      Appointment{" "}
                      <code className="fs-12">{routeAppointmentId.slice(0, 8)}</code>
                      {canCompose ? (
                        <>
                          {" · "}
                          <Link
                            to={
                              audience === "doctor"
                                ? all_routes.doctorsappointmentdetails.replace(
                                    ":id",
                                    routeAppointmentId
                                  )
                                : all_routes.patientappointmentdetails.replace(
                                    ":id",
                                    routeAppointmentId
                                  )
                            }
                            className="link-primary"
                          >
                            View appointment
                          </Link>
                        </>
                      ) : (
                        <>
                          {" · "}
                          <Link
                            to={appointmentConsultationsPath(routeAppointmentId)}
                            className="link-primary"
                          >
                            View appointment
                          </Link>
                        </>
                      )}
                    </p>
                    </div>
                    {canCompose && activeThread ? (
                      <StartVideoCallButton
                        appointmentId={routeAppointmentId}
                        className="btn btn-outline-success btn-sm"
                        isVideoAppointment={isVideoAppointment}
                        hasPatientLogin={!!activeThread.patientUserId}
                      />
                    ) : null}
                  </div>

                  <div
                    className="flex-grow-1 p-3"
                    style={{ maxHeight: 400, overflowY: "auto" }}
                    data-testid="chat-message-list"
                  >
                    {msgLoading && messages.length === 0 ? (
                      <p className="text-muted">Loading messages…</p>
                    ) : messages.length === 0 ? (
                      <p className="text-muted mb-0">No messages yet. Say hello.</p>
                    ) : (
                      messages.map((m) => {
                        const mine = m.senderUid === user?.uid;
                        return (
                          <div
                            key={m._id}
                            className={`d-flex mb-2 ${mine ? "justify-content-end" : "justify-content-start"}`}
                            data-testid={`chat-msg-${m._id}`}
                          >
                            <div
                              className={`rounded px-3 py-2 ${
                                mine
                                  ? "bg-primary text-white"
                                  : "bg-light text-dark"
                              }`}
                              style={{ maxWidth: "75%" }}
                            >
                              <div className="fs-12 opacity-75 mb-1">
                                {m.senderRole}
                                {formatMsgTime(m.createdAt)
                                  ? ` · ${formatMsgTime(m.createdAt)}`
                                  : ""}
                              </div>
                              <div className="fs-14" style={{ whiteSpace: "pre-wrap" }}>
                                {m.text}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={bottomRef} />
                  </div>

                  {canCompose ? (
                    <form
                      className="p-3 border-top d-flex gap-2"
                      onSubmit={handleSend}
                      data-testid="chat-composer"
                    >
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Type a message…"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        maxLength={2000}
                        disabled={sending || !activeThread}
                        data-testid="chat-input"
                      />
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={sending || !draft.trim() || !activeThread}
                        data-testid="chat-send"
                      >
                        {sending ? "…" : "Send"}
                      </button>
                    </form>
                  ) : (
                    <div className="p-3 border-top text-muted fs-13">
                      Admin view is read-only.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentChat;
