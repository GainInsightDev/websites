import { useState, useEffect, useRef } from "react";

// ─── Design Tokens ───

const C = {
  slateDark: "#2C3038",
  slateMid: "#4A4F5C",
  stone: "#8B8A85",
  sage: "#A8AFA4",
  warmStone: "#C9C5BC",
  sand: "#E8E5DF",
  cream: "#F4F3F0",
  nearWhite: "#FAFAF8",
  white: "#FFFFFF",
  textDark: "#2C3038",
  textMid: "#6B6E75",
  textLight: "#9B9DA3",
  accent: "#C94A1E",
};

const f = {
  h: "'Inter', sans-serif",
  b: "'Inter', sans-serif",
  m: "'Geist Mono', monospace",
};

const EntityRef = ({ children }) => (
  <span style={{ fontFamily: f.h, fontWeight: 700, color: C.accent }}>{children}</span>
);

// ─── Interlock Logo ───
const Logo = ({ size = 24, color = C.accent }) => {
  const s = size;
  const block = s * 0.42;
  const notch = block * 0.3;
  const gap = s * 0.05;
  const w = block * 2 + gap;
  return (
    <svg width={w} height={block} viewBox={`0 0 ${w} ${block}`} style={{ display: "block" }}>
      {/* Left block with right notch */}
      <path d={`M0,0 H${block} V${(block - notch) / 2} H${block - notch} V${(block + notch) / 2} H${block} V${block} H0 Z`} fill={color} />
      {/* Right block with left notch */}
      <path d={`M${block + gap},0 V${(block - notch) / 2} H${block + gap + notch} V0 H${w} V${block} H${block + gap + notch} V${(block + notch) / 2} H${block + gap} V${block} H${block + gap} Z`} fill={color} />
    </svg>
  );
};

// ─── HERO ───

const Hero = () => {
  const [typed, setTyped] = useState("");
  const txt = "Move the investor prep to Thursday and flag the break clause for my review.";
  const idx = useRef(0);
  useEffect(() => {
    const iv = setInterval(() => {
      if (idx.current < txt.length) { idx.current++; setTyped(txt.slice(0, idx.current)); }
      else clearInterval(iv);
    }, 35);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center",
      padding: "80px 64px", position: "relative", overflow: "hidden",
      backgroundImage: `linear-gradient(${C.warmStone}10 1px, transparent 1px), linear-gradient(90deg, ${C.warmStone}10 1px, transparent 1px)`,
      backgroundSize: "32px 32px",
    }}>
      {/* Nav */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "24px 64px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={28} color={C.accent} />
          <span style={{ fontFamily: f.m, fontSize: 14, color: C.textMid, letterSpacing: 2 }}>JUNCTA</span>
        </div>
        <div style={{ display: "flex", gap: 32, fontFamily: f.b, fontSize: 13, color: C.textMid }}>
          {["Vision", "Features", "How it works", "Early access"].map(i => <span key={i} style={{ cursor: "pointer" }}>{i}</span>)}
        </div>
      </div>

      <div style={{ maxWidth: 720, marginTop: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
          <Logo size={100} color={C.accent} />
          <div style={{ fontFamily: f.m, fontSize: 88, color: C.slateDark, letterSpacing: 6, lineHeight: 1 }}>JUNCTA</div>
        </div>
        <div style={{ fontFamily: f.m, fontSize: 11, color: C.accent, letterSpacing: 1, marginBottom: 20 }}>AI PROJECT MANAGEMENT</div>
        <h1 style={{ fontFamily: f.h, fontWeight: 700, fontSize: 40, lineHeight: 1.12, color: C.slateDark, margin: 0, marginBottom: 28 }}>
          You don't manage<br />projects <em style={{ fontStyle: "italic", color: C.accent }}>in</em> Juncta.<br />You manage them <em style={{ fontStyle: "italic", color: C.accent }}>with</em> it.
        </h1>
        <p style={{ fontFamily: f.b, fontSize: 18, lineHeight: 1.65, color: C.textMid, maxWidth: 560, margin: "0 0 40px" }}>
          An AI that takes on the cognitive work of planning, organising, and managing — so you can focus on judgment, relationships, and decisions.
        </p>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ fontFamily: f.h, fontWeight: 700, fontSize: 14, color: C.white, backgroundColor: C.slateDark, padding: "14px 32px", cursor: "pointer" }}>Request early access</div>
          <div style={{ fontFamily: f.h, fontSize: 14, color: C.textMid, padding: "14px 24px", border: `1px solid ${C.warmStone}`, cursor: "pointer" }}>Read the vision</div>
        </div>
      </div>

      {/* Chat preview */}
      <div style={{
        position: "absolute", right: 64, top: "50%", transform: "translateY(-50%)", width: 380,
        backgroundColor: C.cream, borderRadius: 16, overflow: "hidden",
        backgroundImage: `linear-gradient(${C.warmStone}18 1px, transparent 1px), linear-gradient(90deg, ${C.warmStone}18 1px, transparent 1px)`,
        backgroundSize: "24px 24px", boxShadow: `0 1px 3px ${C.warmStone}40`,
      }}>
        <div style={{ padding: "10px 16px", borderBottom: `1px solid ${C.sand}`, fontFamily: f.b, fontSize: 11 }}>
          <span style={{ color: C.stone }}>Programme</span>
          <span style={{ fontFamily: f.m, color: C.warmStone, margin: "0 5px" }}>›</span>
          <span style={{ color: C.stone }}>Property</span>
          <span style={{ fontFamily: f.m, color: C.warmStone, margin: "0 5px" }}>›</span>
          <span style={{ fontWeight: 700, color: C.textDark }}>Lease Negotiation</span>
        </div>
        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ maxWidth: "82%" }}>
            <div style={{ backgroundColor: C.cream, borderRadius: 12, padding: "10px 14px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                <span style={{ fontFamily: f.h, fontWeight: 700, fontSize: 11, color: C.slateMid }}>juncta</span>
                <span style={{ fontFamily: f.m, fontSize: 9, color: C.stone }}>2 min ago</span>
              </div>
              <div style={{ fontFamily: f.b, fontSize: 12, color: C.textDark, lineHeight: 1.7 }}>
                The <EntityRef>Heads of Terms</EntityRef> is due in 3 days. James updated <EntityRef>Draft Lease</EntityRef> — solicitor reviewed with minor amendments.
              </div>
              <div style={{ fontFamily: f.h, fontWeight: 700, fontSize: 12, color: C.textDark, marginTop: 6 }}>Approve this update?</div>
            </div>
          </div>
          <div style={{ maxWidth: "70%", alignSelf: "flex-end" }}>
            <div style={{ backgroundColor: C.sand, borderRadius: 12, padding: "10px 14px" }}>
              <div style={{ fontFamily: f.b, fontSize: 12, color: C.textDark, minHeight: 18 }}>
                {typed}<span style={{ display: "inline-block", width: 2, height: 14, backgroundColor: C.slateDark, marginLeft: 1, verticalAlign: "text-bottom", animation: "blink 1s step-end infinite" }} />
              </div>
            </div>
          </div>
          <div style={{ maxWidth: "82%" }}>
            <div style={{ backgroundColor: C.cream, borderRadius: 12, padding: "10px 14px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                <span style={{ fontFamily: f.h, fontWeight: 700, fontSize: 11, color: C.slateMid }}>juncta</span>
                <span style={{ fontFamily: f.m, fontSize: 9, color: C.stone }}>just now</span>
              </div>
              <div style={{ fontFamily: f.b, fontSize: 12, color: C.textDark, lineHeight: 1.7 }}>
                Done. <EntityRef>Draft Lease</EntityRef> updated to 85%. Created <EntityRef>Review Break Clause</EntityRef> and assigned to you.
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding: "10px 16px" }}>
          <div style={{ border: `1px solid ${C.warmStone}`, borderRadius: 100, backgroundColor: C.cream, padding: "9px 14px", fontFamily: f.b, fontSize: 12, color: C.textLight }}>
            Ask Juncta about this scope...
          </div>
        </div>
      </div>
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
};

// ─── THE SHIFT — big typographic statement ───

const TheShift = () => (
  <div style={{ padding: "120px 64px", backgroundColor: C.white, borderTop: `1px solid ${C.sand}` }}>
    <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", gap: 80, alignItems: "center" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: f.m, fontSize: 10, color: C.textLight, letterSpacing: 1, marginBottom: 20 }}>01 — THE SHIFT</div>
        <h2 style={{ fontFamily: f.h, fontWeight: 700, fontSize: 44, lineHeight: 1.08, color: C.slateDark, margin: 0, marginBottom: 24 }}>
          Not a tool<br />with AI features.
        </h2>
        <div style={{ fontFamily: f.h, fontWeight: 700, fontSize: 44, lineHeight: 1.08, color: C.accent, marginBottom: 32 }}>
          An AI that <em style={{ fontStyle: "italic" }}>is</em> the PM.
        </div>
        <p style={{ fontFamily: f.b, fontSize: 16, lineHeight: 1.75, color: C.textMid, maxWidth: 440 }}>
          Current tools are sophisticated databases. You fill fields, drag cards, configure rules. Any intelligence about what the data means comes from you. Juncta takes on the thinking itself.
        </p>
      </div>

      {/* Contrasting blocks */}
      <div style={{ width: 340, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ border: `1px dashed ${C.warmStone}`, padding: 24, backgroundColor: C.nearWhite }}>
          <div style={{ fontFamily: f.m, fontSize: 9, color: C.textLight, letterSpacing: 0.5, marginBottom: 10 }}>BEFORE</div>
          <div style={{ fontFamily: f.b, fontSize: 13, color: C.stone, lineHeight: 1.6, textDecoration: "line-through", textDecorationColor: C.warmStone }}>
            Create task → assign → set due date → add dependencies → update status → generate report → chase team → repeat
          </div>
        </div>
        <div style={{ border: `2px solid ${C.accent}`, padding: 24, backgroundColor: C.white }}>
          <div style={{ fontFamily: f.m, fontSize: 9, color: C.accent, letterSpacing: 0.5, marginBottom: 10 }}>AFTER</div>
          <div style={{ fontFamily: f.b, fontSize: 14, color: C.textDark, lineHeight: 1.7 }}>
            "The API deadline moved to Thursday."
          </div>
          <div style={{ fontFamily: f.b, fontSize: 13, color: C.textMid, lineHeight: 1.6, marginTop: 8, fontStyle: "italic" }}>
            Juncta updates dependencies, shifts testing, flags the milestone risk, and asks if you want to tell the team.
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── CONVERSATION — immersive chat-forward section ───

const ConversationSection = () => {
  const messages = [
    { from: "user", text: "Sarah's moved to another project. Dev is taking over backend." },
    { from: "juncta", text: <>Got it. I've updated <EntityRef>Backend Lead</EntityRef> from Sarah to Dev. He's got 3 open items from her — want me to reassign those too?</> },
    { from: "user", text: "Yes. And check if anything she owned is due this week." },
    { from: "juncta", text: <><EntityRef>API Auth Review</EntityRef> is due Thursday — that was Sarah's. I've moved it to Dev and flagged the tight turnaround. Everything else has runway.</> },
    { from: "user", text: "Perfect. Send Dev a summary of what he's picking up." },
    { from: "juncta", text: <>Draft ready. Three items, context from Sarah's last updates, and the Thursday deadline highlighted. Want to review before I send?</> },
  ];

  return (
    <div style={{ padding: "120px 0", backgroundColor: C.cream, backgroundImage: `linear-gradient(${C.warmStone}0C 1px, transparent 1px), linear-gradient(90deg, ${C.warmStone}0C 1px, transparent 1px)`, backgroundSize: "32px 32px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 64px" }}>
        <div style={{ display: "flex", gap: 80, alignItems: "flex-start" }}>
          {/* Left: messaging */}
          <div style={{ flex: "0 0 340px" }}>
            <div style={{ fontFamily: f.m, fontSize: 10, color: C.textLight, letterSpacing: 1, marginBottom: 20 }}>02 — TALK, DON'T TYPE</div>
            <h2 style={{ fontFamily: f.h, fontWeight: 700, fontSize: 36, lineHeight: 1.12, color: C.slateDark, margin: 0, marginBottom: 16 }}>
              Just say what's happening.
            </h2>
            <p style={{ fontFamily: f.b, fontSize: 15, lineHeight: 1.7, color: C.textMid, marginBottom: 28 }}>
              No forms. No fields. No cards to drag. You talk about what's going on and Juncta builds structured understanding from your words. In text, voice, Slack, WhatsApp, or on a call.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["App", "Slack", "WhatsApp", "Voice", "Email", "Meetings"].map(ch => (
                <div key={ch} style={{ fontFamily: f.m, fontSize: 10, letterSpacing: 0.5, padding: "5px 14px", borderRadius: 100, backgroundColor: C.sand, color: C.textMid }}>
                  {ch}
                </div>
              ))}
            </div>
          </div>

          {/* Right: live conversation */}
          <div style={{ flex: 1, backgroundColor: C.white, borderRadius: 16, padding: "20px 24px", boxShadow: `0 1px 3px ${C.warmStone}30` }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.from === "user" ? "flex-end" : "flex-start" }}>
                  {msg.from === "juncta" && (
                    <div style={{ fontFamily: f.h, fontWeight: 700, fontSize: 10, color: C.slateMid, marginBottom: 3, marginLeft: 14 }}>juncta</div>
                  )}
                  <div style={{
                    backgroundColor: msg.from === "user" ? C.sand : C.cream,
                    borderRadius: 12, padding: "10px 14px", maxWidth: "85%",
                    fontFamily: f.b, fontSize: 12.5, color: C.textDark, lineHeight: 1.65,
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── DEEP STRUCTURE — entity model visualisation ───

const DeepStructure = () => {
  const entities = [
    { name: "Lease Negotiation", type: "container", status: "active", children: ["Heads of Terms", "Draft Lease", "Break Clause Review"] },
    { name: "Site Acquisition", type: "container", status: "active", children: ["Planning Permission", "Survey", "Legal Pack"] },
  ];

  return (
    <div style={{ padding: "120px 64px", backgroundColor: C.white, borderTop: `1px solid ${C.sand}` }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ fontFamily: f.m, fontSize: 10, color: C.textLight, letterSpacing: 1, marginBottom: 20 }}>03 — DEEP STRUCTURE</div>
        <div style={{ display: "flex", gap: 80, alignItems: "flex-start" }}>
          {/* Left: entity tree */}
          <div style={{ flex: 1 }}>
            <div style={{ padding: 32, backgroundColor: C.nearWhite, border: `1px solid ${C.sand}` }}>
              <div style={{ fontFamily: f.m, fontSize: 9, color: C.textLight, letterSpacing: 0.5, marginBottom: 20 }}>ENTITY MODEL — live</div>
              {entities.map(e => (
                <div key={e.name} style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 10, height: 10, border: `2px solid ${C.slateMid}` }} />
                    <span style={{ fontFamily: f.h, fontWeight: 700, fontSize: 14, color: C.slateDark }}>{e.name}</span>
                    <span style={{ fontFamily: f.m, fontSize: 9, color: C.textLight, padding: "2px 8px", backgroundColor: C.sand, borderRadius: 100 }}>container</span>
                  </div>
                  <div style={{ marginLeft: 5, borderLeft: `1px solid ${C.warmStone}`, paddingLeft: 20 }}>
                    {e.children.map(ch => (
                      <div key={ch} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <div style={{ width: 16, height: 0, borderTop: `1px solid ${C.warmStone}` }} />
                        <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: C.accent }} />
                        <span style={{ fontFamily: f.b, fontSize: 12, color: C.textDark }}>{ch}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 16, padding: "10px 14px", borderTop: `1px solid ${C.sand}` }}>
                <div style={{ fontFamily: f.m, fontSize: 9, color: C.stone }}>
                  8 entities · 12 relationships · last updated 3 min ago
                </div>
              </div>
            </div>
          </div>

          {/* Right: explanation */}
          <div style={{ flex: "0 0 380px" }}>
            <h2 style={{ fontFamily: f.h, fontWeight: 700, fontSize: 36, lineHeight: 1.12, color: C.slateDark, margin: 0, marginBottom: 16 }}>
              A living model underneath every conversation.
            </h2>
            <p style={{ fontFamily: f.b, fontSize: 15, lineHeight: 1.7, color: C.textMid, marginBottom: 24 }}>
              Tasks, risks, decisions, dependencies, people — structured, versioned, and traceable. Juncta works in your vocabulary whether you say "work package" or "thing I need to do".
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                ["Adaptive depth", "Scales from a weekend project to a £400m programme without you changing anything."],
                ["Full audit trail", "Who changed what, when, in which conversation, and why."],
                ["Your words, its structure", "Juncta adopts your terminology — it never asks you to learn its."],
              ].map(([title, desc]) => (
                <div key={title}>
                  <div style={{ fontFamily: f.h, fontWeight: 700, fontSize: 13, color: C.slateDark, marginBottom: 3 }}>{title}</div>
                  <div style={{ fontFamily: f.b, fontSize: 12, color: C.textMid, lineHeight: 1.6 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── CASCADE — dark, dramatic impact computation ───

const Cascade = () => {
  const [step, setStep] = useState(0);
  const steps = [
    { label: "Deadline moved", detail: "API integration: Tue → Thu", color: C.accent },
    { label: "Testing compressed", detail: "Now starts Friday — 2 day window", color: C.accent },
    { label: "Beta milestone at risk", detail: "Achievable only if both land on time", color: "#C9A84C" },
    { label: "3 downstream tasks shifted", detail: "Dependencies automatically updated", color: C.stone },
    { label: "Decision surfaced", detail: "Accept risk or request extension?", color: C.accent },
  ];

  useEffect(() => {
    const iv = setInterval(() => setStep(s => (s + 1) % (steps.length + 2)), 1200);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ padding: "120px 64px", backgroundColor: C.slateDark }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ fontFamily: f.m, fontSize: 10, color: C.accent, letterSpacing: 1, marginBottom: 20 }}>04 — CAUSE AND EFFECT</div>
        <div style={{ display: "flex", gap: 80, alignItems: "flex-start" }}>
          <div style={{ flex: "0 0 400px" }}>
            <h2 style={{ fontFamily: f.h, fontWeight: 700, fontSize: 40, lineHeight: 1.08, color: C.nearWhite, margin: 0, marginBottom: 16 }}>
              One thing changes.<br />Juncta shows you<br />everything it affects.
            </h2>
            <p style={{ fontFamily: f.b, fontSize: 15, lineHeight: 1.7, color: C.stone, marginBottom: 32 }}>
              Not notifications. Computation. Juncta walks the dependency graph, checks resource availability, and tells you what matters — which milestones are threatened, which decisions need revisiting, and what to do about it.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
              <div style={{ width: 3, height: 36, backgroundColor: C.accent, flexShrink: 0, marginRight: 14 }} />
              <div style={{ fontFamily: f.b, fontSize: 14, fontStyle: "italic", color: C.warmStone, lineHeight: 1.5 }}>
                This is the capability that makes Juncta worth relying on for real decisions.
              </div>
            </div>
          </div>

          {/* Animated cascade */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {steps.map((s, i) => {
                const visible = i < step;
                const active = i === step - 1;
                return (
                  <div key={i} style={{
                    display: "flex", gap: 12, alignItems: "center",
                    padding: "14px 18px",
                    border: `1px solid ${visible ? (active ? s.color : C.slateMid) : C.slateMid + "40"}`,
                    backgroundColor: active ? `${s.color}12` : "transparent",
                    opacity: visible ? 1 : 0.2,
                    transition: "all 0.4s ease",
                    transform: visible ? "translateX(0)" : "translateX(12px)",
                  }}>
                    {/* Connector line */}
                    {i > 0 && (
                      <div style={{
                        position: "absolute", left: -1, top: -9, width: 1, height: 8,
                        backgroundColor: visible ? C.slateMid : "transparent",
                      }} />
                    )}
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      backgroundColor: visible ? s.color : C.slateMid,
                      flexShrink: 0, transition: "background-color 0.3s ease",
                    }} />
                    <div>
                      <div style={{ fontFamily: f.h, fontWeight: 700, fontSize: 13, color: visible ? C.nearWhite : C.slateMid, transition: "color 0.3s ease" }}>
                        {s.label}
                      </div>
                      <div style={{ fontFamily: f.b, fontSize: 11, color: visible ? C.stone : C.slateMid, transition: "color 0.3s ease" }}>
                        {s.detail}
                      </div>
                    </div>
                    {i === 0 && visible && (
                      <div style={{ marginLeft: "auto", fontFamily: f.m, fontSize: 9, color: C.accent, letterSpacing: 0.5 }}>TRIGGER</div>
                    )}
                    {i === steps.length - 1 && visible && (
                      <div style={{ marginLeft: "auto", fontFamily: f.m, fontSize: 9, color: C.accent, letterSpacing: 0.5 }}>ACTION</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── PROACTIVE — the "always watching" section ───

const Proactive = () => {
  const nudges = [
    { time: "08:00", channel: "slack", msg: "Morning. Three things on your radar today — the design milestone is Thursday, the budget review moved to 2pm, and you've got a clear block after lunch for the investor deck." },
    { time: "11:45", channel: "app", msg: "The client call ran 20 minutes over. Want me to push your 1pm to 1:30? Sarah's free then too." },
    { time: "16:20", channel: "whatsapp", msg: "Dev hasn't updated on the API since Monday. Want me to check in with him, or would you rather do it?" },
    { time: "fri 17:00", channel: "email", msg: "Week in review: 12 tasks completed, 3 moved to next week. The planning deadline is the one to watch. Full summary attached." },
  ];

  return (
    <div style={{ padding: "120px 64px", backgroundColor: C.cream, backgroundImage: `linear-gradient(${C.warmStone}0C 1px, transparent 1px), linear-gradient(90deg, ${C.warmStone}0C 1px, transparent 1px)`, backgroundSize: "32px 32px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ fontFamily: f.m, fontSize: 10, color: C.textLight, letterSpacing: 1, marginBottom: 20 }}>05 — ALWAYS PAYING ATTENTION</div>
        <h2 style={{ fontFamily: f.h, fontWeight: 700, fontSize: 36, lineHeight: 1.12, color: C.slateDark, margin: 0, marginBottom: 12 }}>
          It reaches out before you have to ask.
        </h2>
        <p style={{ fontFamily: f.b, fontSize: 15, color: C.textMid, marginBottom: 48, maxWidth: 560, lineHeight: 1.7 }}>
          Curious, not demanding. Attentive, not nagging. Juncta tracks your projects between conversations and reaches out when something warrants attention.
        </p>

        {/* Timeline of nudges */}
        <div style={{ position: "relative", paddingLeft: 40 }}>
          {/* Vertical line */}
          <div style={{ position: "absolute", left: 15, top: 8, bottom: 8, width: 1, backgroundColor: C.warmStone }} />

          {nudges.map((n, i) => (
            <div key={i} style={{ display: "flex", gap: 20, marginBottom: 28, position: "relative" }}>
              {/* Node */}
              <div style={{ position: "absolute", left: -29, top: 8, width: 10, height: 10, borderRadius: "50%", backgroundColor: C.white, border: `2px solid ${C.accent}` }} />
              {/* Time + channel */}
              <div style={{ width: 80, flexShrink: 0, paddingTop: 4 }}>
                <div style={{ fontFamily: f.m, fontSize: 11, color: C.slateDark }}>{n.time}</div>
                <div style={{ fontFamily: f.m, fontSize: 9, color: C.textLight, marginTop: 2 }}>{n.channel}</div>
              </div>
              {/* Message */}
              <div style={{
                flex: 1, backgroundColor: C.white, borderRadius: 12, padding: "14px 18px",
                fontFamily: f.b, fontSize: 13, color: C.textDark, lineHeight: 1.65,
                boxShadow: `0 1px 2px ${C.warmStone}20`,
              }}>
                {n.msg}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── ADAPTIVE DISPLAY — visual showcase ───

const AdaptiveDisplay = () => {
  const [view, setView] = useState(0);
  const views = [
    { label: "Status report", content: (
      <div style={{ padding: 24 }}>
        <div style={{ fontFamily: f.h, fontWeight: 700, fontSize: 16, color: C.slateDark, marginBottom: 16 }}>Project Status — Week 12</div>
        <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
          {[["On track", C.sage, 4], ["At risk", "#C9A84C", 2], ["Blocked", C.accent, 1]].map(([l, c, n]) => (
            <div key={l} style={{ flex: 1, padding: 14, backgroundColor: C.nearWhite }}>
              <div style={{ fontFamily: f.m, fontSize: 24, color: c, fontWeight: 700 }}>{n}</div>
              <div style={{ fontFamily: f.m, fontSize: 9, color: C.textLight, letterSpacing: 0.5 }}>{l.toUpperCase()}</div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: f.b, fontSize: 12, color: C.textMid, lineHeight: 1.7 }}>
          Key risk: Planning permission timeline has compressed by 2 weeks. Solicitor reviewing break clause — expect resolution by Thursday.
        </div>
      </div>
    )},
    { label: "Kanban", content: (
      <div style={{ padding: 24, display: "flex", gap: 12 }}>
        {[["To do", ["Survey brief", "Cost estimate"]], ["In progress", ["Draft lease", "Planning app"]], ["Done", ["Site visit", "Heads of Terms"]]].map(([col, items]) => (
          <div key={col} style={{ flex: 1 }}>
            <div style={{ fontFamily: f.m, fontSize: 9, color: C.textLight, letterSpacing: 0.5, marginBottom: 10 }}>{col.toUpperCase()}</div>
            {items.map(item => (
              <div key={item} style={{ padding: "10px 12px", backgroundColor: C.nearWhite, border: `1px solid ${C.sand}`, marginBottom: 6, fontFamily: f.b, fontSize: 11, color: C.textDark }}>
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>
    )},
    { label: "Timeline", content: (
      <div style={{ padding: 24 }}>
        <div style={{ fontFamily: f.m, fontSize: 9, color: C.textLight, letterSpacing: 0.5, marginBottom: 16 }}>MAR — APR 2026</div>
        {[
          { name: "Heads of Terms", w: "45%", left: "0%", color: C.slateDark },
          { name: "Draft Lease", w: "55%", left: "15%", color: C.accent },
          { name: "Planning Permission", w: "70%", left: "10%", color: C.sage },
          { name: "Site Survey", w: "25%", left: "40%", color: C.warmStone },
        ].map(bar => (
          <div key={bar.name} style={{ marginBottom: 10 }}>
            <div style={{ fontFamily: f.b, fontSize: 10, color: C.textMid, marginBottom: 3 }}>{bar.name}</div>
            <div style={{ position: "relative", height: 12, backgroundColor: C.nearWhite }}>
              <div style={{ position: "absolute", left: bar.left, width: bar.w, height: "100%", backgroundColor: bar.color, opacity: 0.7 }} />
            </div>
          </div>
        ))}
      </div>
    )},
  ];

  return (
    <div style={{ padding: "120px 64px", backgroundColor: C.white, borderTop: `1px solid ${C.sand}` }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ fontFamily: f.m, fontSize: 10, color: C.textLight, letterSpacing: 1, marginBottom: 20 }}>06 — ANY VIEW, ANY TIME</div>
        <div style={{ display: "flex", gap: 80, alignItems: "flex-start" }}>
          <div style={{ flex: "0 0 320px" }}>
            <h2 style={{ fontFamily: f.h, fontWeight: 700, fontSize: 36, lineHeight: 1.12, color: C.slateDark, margin: 0, marginBottom: 16 }}>
              Ask for a Gantt.<br />Get a Gantt.
            </h2>
            <p style={{ fontFamily: f.b, fontSize: 15, lineHeight: 1.7, color: C.textMid, marginBottom: 28 }}>
              Status reports, risk registers, Kanban boards, timelines, dashboards — generated from Juncta's understanding, not database queries. Every view is read-only. To change something, you talk.
            </p>
            <div style={{ fontFamily: f.b, fontSize: 13, color: C.textMid, lineHeight: 1.7 }}>
              Save formats as templates. Archive outputs as snapshots. Share anywhere — PDF, email, Slack — without friction.
            </div>
          </div>

          {/* Interactive view switcher */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 0, marginBottom: 0 }}>
              {views.map((v, i) => (
                <button key={v.label} onClick={() => setView(i)} style={{
                  fontFamily: f.m, fontSize: 10, letterSpacing: 0.5, padding: "10px 20px",
                  backgroundColor: view === i ? C.white : C.sand, border: `1px solid ${C.sand}`,
                  borderBottom: view === i ? "1px solid white" : `1px solid ${C.sand}`,
                  color: view === i ? C.slateDark : C.textLight, cursor: "pointer",
                }}>
                  {v.label.toUpperCase()}
                </button>
              ))}
            </div>
            <div style={{ border: `1px solid ${C.sand}`, borderTop: "none", backgroundColor: C.white, minHeight: 200 }}>
              {views[view].content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── MEMORY — the compounding moat ───

const Memory = () => (
  <div style={{ padding: "120px 64px", backgroundColor: C.slateDark }}>
    <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
      <div style={{ fontFamily: f.m, fontSize: 10, color: C.accent, letterSpacing: 1, marginBottom: 20 }}>07 — GETS SMARTER OVER TIME</div>
      <h2 style={{ fontFamily: f.h, fontWeight: 700, fontSize: 44, lineHeight: 1.1, color: C.nearWhite, margin: "0 auto 24px", maxWidth: 640 }}>
        After a month, Juncta knows things no new hire ever could.
      </h2>
      <p style={{ fontFamily: f.b, fontSize: 16, color: C.stone, lineHeight: 1.7, maxWidth: 520, margin: "0 auto 56px" }}>
        Every conversation, every project, every interaction makes it more valuable. Knowledge that accumulates and compounds.
      </p>

      {/* Timeline of growing knowledge */}
      <div style={{ display: "flex", gap: 0, justifyContent: "center" }}>
        {[
          { time: "Week 1", items: ["Your current project", "Key deadlines", "Team members"], height: 120 },
          { time: "Week 2", items: ["How you work", "Communication style", "Estimation patterns"], height: 180 },
          { time: "Week 4", items: ["Vendor relationships", "Approval processes", "Team dynamics"], height: 240 },
          { time: "Week 8", items: ["Organisational memory", "Cross-project patterns", "Institutional knowledge"], height: 300 },
        ].map((col, i) => (
          <div key={col.time} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "100%", height: col.height, backgroundColor: `${C.accent}${(12 + i * 8).toString(16)}`, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 12px 16px", borderLeft: i > 0 ? `1px solid ${C.slateMid}` : "none" }}>
              {col.items.map(item => (
                <div key={item} style={{ fontFamily: f.b, fontSize: 11, color: C.warmStone, lineHeight: 1.8 }}>{item}</div>
              ))}
            </div>
            <div style={{ fontFamily: f.m, fontSize: 10, color: C.stone, marginTop: 12, letterSpacing: 0.5 }}>{col.time}</div>
          </div>
        ))}
      </div>

    </div>
  </div>
);

// ─── TWO MODES ───

const TwoModes = () => (
  <div style={{ padding: "120px 64px", backgroundColor: C.white, borderTop: `1px solid ${C.sand}` }}>
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ fontFamily: f.m, fontSize: 10, color: C.textLight, letterSpacing: 1, marginBottom: 20 }}>08 — TWO MODES, ONE PRODUCT</div>
      <h2 style={{ fontFamily: f.h, fontWeight: 700, fontSize: 36, lineHeight: 1.12, color: C.slateDark, margin: 0, marginBottom: 48 }}>
        Personal planning partner.<br />Project manager.<br /><span style={{ color: C.textLight }}>Uniquely powerful together.</span>
      </h2>
      <div style={{ display: "flex", gap: 32 }}>
        <div style={{ flex: 1, padding: 28, border: `1px solid ${C.sand}`, backgroundColor: C.nearWhite }}>
          <div style={{ fontFamily: f.m, fontSize: 10, letterSpacing: 0.5, padding: "4px 14px", borderRadius: 100, backgroundColor: C.sand, color: C.textMid, display: "inline-block" }}>PERSONAL</div>
          <h3 style={{ fontFamily: f.h, fontWeight: 700, fontSize: 18, color: C.slateDark, margin: "16px 0 12px" }}>Plan your day with a thinking partner</h3>
          <div style={{ fontFamily: f.b, fontSize: 13, color: C.textMid, lineHeight: 1.7 }}>
            Juncta learns your energy patterns, recurring commitments, and tendency to defer certain tasks. Morning planning sessions, midday adjustments, end-of-day reflections — through conversation, not calendar dragging.
          </div>
        </div>
        <div style={{ flex: 1, padding: 28, border: `2px solid ${C.slateMid}` }}>
          <div style={{ fontFamily: f.m, fontSize: 10, letterSpacing: 0.5, padding: "4px 14px", borderRadius: 100, backgroundColor: C.accent, color: C.white, display: "inline-block" }}>PROJECT</div>
          <h3 style={{ fontFamily: f.h, fontWeight: 700, fontSize: 18, color: C.slateDark, margin: "16px 0 12px" }}>An AI that does the PM work</h3>
          <div style={{ fontFamily: f.b, fontSize: 13, color: C.textMid, lineHeight: 1.7 }}>
            Tasks, risks, decisions, dependencies — tracked and reasoned about. When something changes, Juncta computes the downstream impact. It chases actions, flags drift, and helps you navigate difficult conversations.
          </div>
        </div>
      </div>
      <div style={{ marginTop: 32, padding: 28, border: `2px solid ${C.accent}`, display: "flex", gap: 32, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: f.m, fontSize: 10, letterSpacing: 0.5, padding: "4px 14px", borderRadius: 100, backgroundColor: C.accent, color: C.white, display: "inline-block" }}>COMBINED</div>
          <div style={{ fontFamily: f.b, fontSize: 14, color: C.textDark, lineHeight: 1.7, marginTop: 12 }}>
            Project tasks flow into personal planning. Progress feeds back into project visibility. No manual status updates. No context switching.
          </div>
        </div>
        <div style={{ width: 220, flexShrink: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {[{ label: "Investor prep", pct: 60, from: "Saxonvale" }, { label: "Tax filing", pct: 0, from: "Personal" }, { label: "API review", pct: 85, from: "Product" }].map(t => (
            <div key={t.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontFamily: f.b, fontSize: 11, fontWeight: 700, color: C.textDark }}>{t.label}</span>
                <span style={{ fontFamily: f.m, fontSize: 9, color: C.textLight }}>{t.from}</span>
              </div>
              <div style={{ height: 4, backgroundColor: C.sand }}><div style={{ height: 4, backgroundColor: t.pct > 0 ? C.accent : C.sand, width: `${t.pct}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ─── RELATIONSHIP + QUOTE ───

const Relationship = () => (
  <div style={{ padding: "120px 64px", backgroundColor: C.cream, backgroundImage: `linear-gradient(${C.warmStone}0C 1px, transparent 1px), linear-gradient(90deg, ${C.warmStone}0C 1px, transparent 1px)`, backgroundSize: "32px 32px" }}>
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ fontFamily: f.m, fontSize: 10, color: C.textLight, letterSpacing: 1, marginBottom: 20 }}>09 — THE RELATIONSHIP</div>
      <h2 style={{ fontFamily: f.h, fontWeight: 700, fontSize: 36, lineHeight: 1.12, color: C.slateDark, margin: 0, marginBottom: 48 }}>
        An experienced peer who works for you.
      </h2>
      <div style={{ display: "flex", gap: 48, marginBottom: 56 }}>
        {[
          ["Experienced", "Genuine expertise. Pattern recognition. Methodology. When it thinks you're heading for trouble, it says so."],
          ["Peer", "You bring domain knowledge. Juncta brings methodology and memory. Real dialogue, not order-taking."],
          ["Works for you", "You're the client. When you've made a different call, Juncta commits to making your decision work."],
        ].map(([title, text]) => (
          <div key={title} style={{ flex: 1 }}>
            <div style={{ fontFamily: f.h, fontWeight: 700, fontSize: 16, color: C.slateDark, marginBottom: 10 }}>{title}</div>
            <div style={{ fontFamily: f.b, fontSize: 13, color: C.textMid, lineHeight: 1.7 }}>{text}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <div style={{ width: 3, minHeight: 40, backgroundColor: C.accent, flexShrink: 0, marginRight: 16, alignSelf: "stretch" }} />
        <div>
          <div style={{ fontFamily: f.b, fontSize: 22, fontStyle: "italic", color: C.slateDark, lineHeight: 1.45, marginBottom: 8 }}>
            It feels less like using software and more like having the best colleague you've ever worked with.
          </div>
          <div style={{ fontFamily: f.m, fontSize: 11, color: C.textLight }}>— Juncta Vision Document</div>
        </div>
      </div>
    </div>
  </div>
);

// ─── FOOTER ───

const Footer = () => (
  <div style={{ padding: "80px 64px", backgroundColor: C.slateDark, textAlign: "center" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 24 }}>
      <Logo size={48} color={C.accent} />
      <span style={{ fontFamily: f.m, fontSize: 32, color: C.nearWhite, letterSpacing: 4 }}>JUNCTA</span>
    </div>
    <div style={{ fontFamily: f.h, fontWeight: 700, fontSize: 24, color: C.warmStone, marginBottom: 12 }}>AI proposes. Humans decide.</div>
    <p style={{ fontFamily: f.b, fontSize: 15, color: C.stone, maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.6 }}>
      Juncta is in early development. If you're a PM, founder, or team lead who wants to manage projects through conversation — we'd like to hear from you.
    </p>
    <div style={{ display: "inline-block", fontFamily: f.h, fontWeight: 700, fontSize: 14, color: C.slateDark, backgroundColor: C.nearWhite, padding: "14px 36px", cursor: "pointer" }}>
      Request early access
    </div>
    <div style={{ marginTop: 64, paddingTop: 32, borderTop: `1px solid ${C.slateMid}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Logo size={20} color={C.stone} />
        <span style={{ fontFamily: f.m, fontSize: 12, color: C.stone, letterSpacing: 2 }}>JUNCTA</span>
      </div>
      <div style={{ fontFamily: f.m, fontSize: 10, color: C.stone }}>From Latin <em>jungere</em> — to join, to connect</div>
      <div style={{ fontFamily: f.m, fontSize: 10, color: C.stone }}>© 2026</div>
    </div>
  </div>
);

// ─── MAIN ───

export default function JunctaHeroSite() {
  return (
    <div style={{ backgroundColor: C.white, fontFamily: f.b }}>
      <Hero />
      <TheShift />
      <ConversationSection />
      <DeepStructure />
      <Cascade />
      <Proactive />
      <AdaptiveDisplay />
      <Memory />
      <TwoModes />
      <Relationship />
      <Footer />
    </div>
  );
}
