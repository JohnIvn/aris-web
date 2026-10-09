import { useState } from "react";
import { BRAND } from "@/config/navigation";
import { useResource } from "@/hooks/useResource";
import {
  Card,
  PageTitle,
  GhostButton,
  Badge,
  Tabs,
  Modal,
  Avatar,
  initialsColor,
  StatCard,
  StatGrid,
} from "@/components/ui";

/* ─── Types ────────────────────────────────────────────────────────────────── */

type TranscriptLine = {
  /** Timestamp of the spoken line, e.g. "1:03 PM" */
  t: string;
  who: string;
  text: string;
};

type ActionItem = { owner: string; task: string; due: string };

type MeetingSummary = {
  id: string;
  title: string;
  course: string;
  date: string;
  time: string;
  duration: string;
  participants: string[];
  words: string;
  status: "Summarized";
  overview: string;
  keyPoints: string[];
  decisions: string[];
  actions: ActionItem[];
  transcript: TranscriptLine[];
};

/* ─── Sample data ──────────────────────────────────────────────────────────── */

const demoMeetings: MeetingSummary[] = [
  {
    id: "m01",
    title: "INFORMATION MANAGEMENT — Week 4 Consultation",
    course: "CC 105 · BSIT 2B",
    date: "September 12, 2026",
    time: "1:00 PM – 2:05 PM",
    duration: "1h 05m",
    participants: ["Mark Luis S. Garrote", "BSIT 2B (12 students)"],
    words: "3,480 words",
    status: "Summarized",
    overview:
      "A make-up consultation for CC 105 covering the quiz results on aggregate functions and the group-by activity. Most of the session addressed the difference between WHERE and HAVING, the correct clause ordering, and how to structure the database output for the next AR submission.",
    keyPoints: [
      "12 of 18 students submitted the group-by activity; average score was 78.",
      "The recurring error was filtering grouped rows with WHERE instead of HAVING.",
      "Clause order was re-taught: FROM → WHERE → GROUP BY → HAVING → ORDER BY.",
      "Null handling in SUM and AVG was clarified, including the use of COALESCE.",
      "The September 11 session was suspended due to a typhoon and will be made up on September 19.",
    ],
    decisions: [
      "A second quiz on aggregate functions will be given on September 19, 2026.",
      "The group-by activity will be reopened for the six students who did not submit, with no late penalty.",
      "The revised module on joins will move to Week 5.",
    ],
    actions: [
      {
        owner: "Prof. Garrote",
        task: "Upload the annotated SQL reviewer and quiz key to G-Class.",
        due: "Sep 15, 2026",
      },
      {
        owner: "Class representative",
        task: "Collect the six pending group-by activities.",
        due: "Sep 18, 2026",
      },
      {
        owner: "Prof. Garrote",
        task: "File the AR for the September 12 make-up session.",
        due: "Sep 20, 2026",
      },
    ],
    transcript: [
      {
        t: "1:00 PM",
        who: "Prof. Garrote",
        text: "Good afternoon everyone. Since we lost the September 11 meeting to the typhoon, we will use this hour to go over the quiz on aggregate functions and then answer your questions on the group-by activity.",
      },
      {
        t: "1:01 PM",
        who: "Prof. Garrote",
        text: "Twelve of you submitted the activity. The average score was 78. The single most common mistake was writing WHERE after GROUP BY instead of HAVING.",
      },
      {
        t: "1:02 PM",
        who: "J. Dela Peña",
        text: "Sir, so when do we use WHERE and when do we use HAVING?",
      },
      {
        t: "1:03 PM",
        who: "Prof. Garrote",
        text: "WHERE filters the rows before they are grouped, HAVING filters the groups after the aggregation. Memorize the order: FROM, WHERE, GROUP BY, HAVING, ORDER BY.",
      },
      {
        t: "1:06 PM",
        who: "Prof. Garrote",
        text: "Let me share my screen. Here the total salary per department uses GROUP BY department, and then HAVING SUM(salary) is greater than one hundred thousand.",
      },
      {
        t: "1:09 PM",
        who: "R. Bautista",
        text: "What happens to the NULL values when we use SUM or AVG?",
      },
      {
        t: "1:10 PM",
        who: "Prof. Garrote",
        text: "Aggregate functions ignore NULL. If a row has no value it is simply skipped, so the count changes. Use COALESCE to convert NULL into zero when you need it counted.",
      },
      {
        t: "1:14 PM",
        who: "Prof. Garrote",
        text: "We will have a short second quiz on September 19 covering everything from today. Sample items will be posted tomorrow.",
      },
      {
        t: "1:18 PM",
        who: "M. Dela Cruz",
        text: "Sir, for the students who were not able to submit the activity because of the suspension, is there a penalty?",
      },
      {
        t: "1:19 PM",
        who: "Prof. Garrote",
        text: "No penalty. I will reopen the activity tonight and the six of you can still submit until September 18.",
      },
      {
        t: "1:22 PM",
        who: "Prof. Garrote",
        text: "Remember that these outputs are what I attach to the Accomplishment Report, so keep a copy of your submissions for your own records as well.",
      },
      {
        t: "2:03 PM",
        who: "Prof. Garrote",
        text: "That covers everything for today. I will upload the reviewer and the quiz key to G-Class by Monday. Thank you, and see you on the nineteenth.",
      },
    ],
  },
  {
    id: "m02",
    title: "Curriculum Alignment Meeting — College of Engineering",
    course: "BSIT / BSCS Program Council",
    date: "September 10, 2026",
    time: "9:00 AM – 10:15 AM",
    duration: "1h 15m",
    participants: [
      "Dr. Nestor Villar",
      "Prof. Grace Lim",
      "Dean Ramos",
      "6 faculty",
    ],
    words: "4,120 words",
    status: "Summarized",
    overview:
      "A program council meeting to reconcile the delivered topics with the approved curriculum for the first term. The council reviewed the alignment report lifted from the AR submissions and agreed on adjustments for the remaining weeks.",
    keyPoints: [
      "Six of the thirty-four reviewed AR topics were flagged as not aligned with the approved syllabus.",
      "Web Development was two weeks ahead: CSS Flexbox was delivered before the CSS fundamentals module.",
      "Data Structures covered pointers in Week 2, which is scheduled for Week 5 in the curriculum.",
      "Business Communication and Marketing Principles were fully aligned.",
      "The alignment score for the college currently stands at 82 percent.",
    ],
    decisions: [
      "Approved: move the pointers topic to Week 5 and insert a basic arrays module in Week 2.",
      "Approved: the CSS fundamentals session will be delivered on September 17 as a catch-up topic.",
      "Faculty flagged with misaligned topics will be scheduled for a coaching session before the next cycle.",
    ],
    actions: [
      {
        owner: "Prof. Grace Lim",
        task: "Submit the revised topic sequence for Web Development.",
        due: "Sep 16, 2026",
      },
      {
        owner: "Dr. Nestor Villar",
        task: "Coordinate the coaching schedule with the two flagged faculty members.",
        due: "Sep 22, 2026",
      },
      {
        owner: "Dean Ramos",
        task: "Endorse the amended syllabus to the curriculum committee for notation.",
        due: "Sep 30, 2026",
      },
    ],
    transcript: [
      {
        t: "9:00 AM",
        who: "Dean Ramos",
        text: "Good morning. Let us begin with the alignment report. This is lifted from the AR submissions for September Cycle 1, so it reflects what was actually delivered in the classroom.",
      },
      {
        t: "9:03 AM",
        who: "Dr. Villar",
        text: "Out of thirty-four reviewed topics, six were flagged as not aligned. Business Communication and Marketing Principles are clean, both at one hundred percent.",
      },
      {
        t: "9:06 AM",
        who: "Prof. Grace Lim",
        text: "On our side, the Web Development class is two weeks ahead. Flexbox was already delivered even though the curriculum still places CSS fundamentals on that week.",
      },
      {
        t: "9:09 AM",
        who: "Dr. Villar",
        text: "Data Structures is the other one. Arrays and pointers were discussed in Week 2, but the syllabus schedules pointers for Week 5.",
      },
      {
        t: "9:12 AM",
        who: "Dean Ramos",
        text: "Is the pacing realistic, or did the schedule simply allow it? If the class can absorb it, we may adjust the syllabus instead of forcing the class backward.",
      },
      {
        t: "9:15 AM",
        who: "Prof. Grace Lim",
        text: "The students handled it well, but the assessment results show gaps on memory management. I would rather move the topic and reinforce arrays first.",
      },
      {
        t: "9:19 AM",
        who: "Dean Ramos",
        text: "Noted. Then we approve the adjustment: pointers move to Week 5 and a basic arrays module takes Week 2. Please send the revised topic sequence for notation.",
      },
      {
        t: "9:26 AM",
        who: "Prof. Grace Lim",
        text: "For the CSS gap, I can deliver a catch-up session on September 17 so the class is back on the syllabus by Week 5.",
      },
      {
        t: "9:31 AM",
        who: "Dean Ramos",
        text: "Approved. Record it as a catch-up topic in the next AR so the alignment report reflects it.",
      },
      {
        t: "9:38 AM",
        who: "Dr. Villar",
        text: "The two flagged faculty members for the pointers topic will need a coaching session before the next cycle. I will coordinate the schedule.",
      },
      {
        t: "9:44 AM",
        who: "Dean Ramos",
        text: "Thank you. The college alignment score is at eighty-two percent. If we close the six flagged topics, we should reach ninety by the second term.",
      },
      {
        t: "10:12 AM",
        who: "Dean Ramos",
        text: "Nothing further. Minutes will be circulated today and the amended syllabus goes to the committee for notation. Meeting adjourned.",
      },
    ],
  },
];

function durationInHours(duration: string) {
  const hours = Number(duration.match(/(\d+)h/)?.[1] ?? 0);
  const minutes = Number(duration.match(/(\d+)m/)?.[1] ?? 0);
  return hours + minutes / 60;
}

/* ─── Detail modal ─────────────────────────────────────────────────────────── */

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p
        className="text-[10.5px] font-bold uppercase tracking-widest"
        style={{ color: "#8fa394" }}
      >
        {label}
      </p>
      <p className="text-[13px] mt-1 font-medium" style={{ color: "#111c14" }}>
        {value}
      </p>
    </div>
  );
}

function SummaryView({ m }: { m: MeetingSummary }) {
  return (
    <div className="space-y-3.5">
      <div
        className="rounded-2xl border p-4"
        style={{ borderColor: "#eef1ef" }}
      >
        <p className="text-[12px] font-bold mb-2" style={{ color: "#111c14" }}>
          Overview
        </p>
        <p className="text-[13px] leading-relaxed" style={{ color: "#5a6b5e" }}>
          {m.overview}
        </p>
      </div>

      <div
        className="rounded-2xl border p-4"
        style={{ borderColor: "#eef1ef" }}
      >
        <p
          className="text-[12px] font-bold mb-2.5"
          style={{ color: "#111c14" }}
        >
          Key Points
        </p>
        <ul className="space-y-2">
          {m.keyPoints.map((k) => (
            <li key={k} className="flex gap-2.5">
              <span
                className="w-1.5 h-1.5 rounded-full mt-[7px] flex-shrink-0"
                style={{ background: BRAND }}
              />
              <span
                className="text-[13px] leading-relaxed"
                style={{ color: "#5a6b5e" }}
              >
                {k}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div
        className="rounded-2xl border p-4"
        style={{ borderColor: "#eef1ef" }}
      >
        <p
          className="text-[12px] font-bold mb-2.5"
          style={{ color: "#111c14" }}
        >
          Decisions
        </p>
        <ul className="space-y-2">
          {m.decisions.map((d) => (
            <li key={d} className="flex gap-2.5">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke={BRAND}
                strokeWidth="2.4"
                className="w-3.5 h-3.5 mt-[3px] flex-shrink-0"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
              <span
                className="text-[13px] leading-relaxed"
                style={{ color: "#5a6b5e" }}
              >
                {d}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div
        className="rounded-2xl border overflow-hidden"
        style={{ borderColor: "#eef1ef" }}
      >
        <div
          className="px-4 py-2.5 border-b"
          style={{ background: "#fafbfa", borderColor: "#eef1ef" }}
        >
          <p className="text-[12px] font-bold" style={{ color: "#111c14" }}>
            Action Items
          </p>
        </div>
        {m.actions.map((a) => (
          <div
            key={a.task}
            className="grid grid-cols-[1.1fr_2.4fr_0.9fr] gap-3 items-center px-4 py-3 border-t"
            style={{ borderColor: "#f2f4f2" }}
          >
            <span
              className="text-[12.5px] font-semibold"
              style={{ color: "#111c14" }}
            >
              {a.owner}
            </span>
            <span className="text-[12.5px]" style={{ color: "#5a6b5e" }}>
              {a.task}
            </span>
            <span
              className="text-[12px] text-right tabular-nums"
              style={{ color: "#8fa394" }}
            >
              {a.due}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TranscriptView({ m }: { m: MeetingSummary }) {
  return (
    <div className="space-y-3">
      <div
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[12px]"
        style={{ background: "#f0f7f2", color: "#2f7043" }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="w-4 h-4 flex-shrink-0"
        >
          <path d="M12 15a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3z" />
          <path d="M19 11a7 7 0 01-14 0M12 18v4M8 22h8" />
        </svg>
        Auto-transcribed from the Google Meet recording · {m.duration} ·{" "}
        {m.words}
      </div>
      {m.transcript.map((l, i) => (
        <div key={i} className="flex gap-3">
          <span
            className="text-[11px] tabular-nums pt-0.5 w-14 flex-shrink-0"
            style={{ color: "#b6c3ba" }}
          >
            {l.t}
          </span>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold" style={{ color: BRAND }}>
              {l.who}
            </p>
            <p
              className="text-[12.5px] leading-relaxed mt-0.5"
              style={{ color: "#3d4a41" }}
            >
              {l.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────────── */

export default function ProfSummaries() {
  const { data: meetings } = useResource("/professor/meeting-summaries", demoMeetings)
  const [open, setOpen] = useState<{
    id: string;
    tab: "Summary" | "Full Transcript";
  } | null>(null);

  const active = meetings.find((m) => m.id === open?.id) ?? null;

  return (
    <div className="pb-2">
      <PageTitle
        title="Meeting Summaries"
        subtitle="Google Meet recordings are transcribed automatically, then summarized for you."
        action={
          <GhostButton>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="w-4 h-4"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Export
          </GhostButton>
        }
      />

      <StatGrid className="mb-4">
        {[
          ["Recordings", String(meetings.length)],
          ["Transcribed", String(meetings.length)],
          ["Summarized", String(meetings.filter((meeting) => meeting.status === "Summarized").length)],
          ["Hours Recorded", meetings.reduce((hours, meeting) => hours + durationInHours(meeting.duration), 0).toFixed(1)],
        ].map(([l, v]) => (
          <StatCard key={l} label={l} value={v} />
        ))}
      </StatGrid>

      <div className="space-y-3">
        {meetings.map((m, i) => (
          <Card key={m.id} className="transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <Avatar initials="GM" color={initialsColor(i)} size={38} />
                <div className="min-w-0">
                  <p
                    className="text-[14px] font-bold tracking-tight truncate"
                    style={{ color: "#111c14" }}
                  >
                    {m.title}
                  </p>
                  <p
                    className="text-[12px] mt-0.5"
                    style={{ color: "#8fa394" }}
                  >
                    {m.course} · {m.date} · {m.time} · {m.duration}
                  </p>
                </div>
              </div>
              <Badge tone="green" dot>
                {m.status}
              </Badge>
            </div>

            <p
              className="text-[12.5px] leading-relaxed mt-3 line-clamp-2"
              style={{ color: "#5a6b5e" }}
            >
              {m.overview}
            </p>

            <div className="flex items-center justify-between gap-3 mt-3">
              <div className="flex items-center gap-2 text-[11.5px]">
                <span
                  className="px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: "#f0f2f0", color: "#5a6b5e" }}
                >
                  {m.words}
                </span>
                <span style={{ color: "#b6c3ba" }}>
                  {m.participants.length} participants
                </span>
              </div>
              <div className="flex gap-2">
                <GhostButton
                  onClick={() => setOpen({ id: m.id, tab: "Full Transcript" })}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="w-3.5 h-3.5"
                  >
                    <path d="M12 15a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3z" />
                    <path d="M19 11a7 7 0 01-14 0" />
                  </svg>
                  Full transcript
                </GhostButton>
                <button
                  onClick={() => setOpen({ id: m.id, tab: "Summary" })}
                  className="flex items-center gap-2 h-9 px-4 rounded-xl text-[13px] font-semibold text-white transition-transform active:scale-[0.99]"
                  style={{ background: BRAND }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="w-3.5 h-3.5"
                  >
                    <path d="M4 6h16M4 11h16M4 16h9" />
                  </svg>
                  Summary
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={!!active}
        onClose={() => setOpen(null)}
        title={active ? active.title : "Meeting Summary"}
        size="lg"
        align="left"
        actions={<GhostButton onClick={() => setOpen(null)}>Close</GhostButton>}
      >
        {active && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-4 gap-4">
              <InfoField label="Date" value={active.date} />
              <InfoField label="Time" value={active.time} />
              <InfoField label="Duration" value={active.duration} />
              <InfoField label="Transcript" value={active.words} />
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <Badge tone="green" dot>
                {active.status}
              </Badge>
              <span className="text-[12px]" style={{ color: "#8fa394" }}>
                Participants: {active.participants.join(" · ")}
              </span>
            </div>

            <Tabs
              tabs={["Summary", "Full Transcript"]}
              value={open?.tab ?? "Summary"}
              onChange={(t) =>
                setOpen({
                  id: active.id,
                  tab: t as "Summary" | "Full Transcript",
                })
              }
            />

            <div className="pt-1">
              {open?.tab === "Full Transcript" ? (
                <TranscriptView m={active} />
              ) : (
                <SummaryView m={active} />
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
