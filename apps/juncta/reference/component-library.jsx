import { useState } from "react";

const COLORS = {
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

const tabs = ["Palette & Type", "Components", "Chat"];

// ─── Shared ───

const SectionLabel = ({ num, title }) => (
  <div
    style={{
      fontFamily: "'Geist Mono', monospace",
      fontSize: 11,
      color: COLORS.textLight,
      marginBottom: 8,
      letterSpacing: 0.5,
    }}
  >
    {num} — {title}
  </div>
);

const Spec = ({ children }) => (
  <span
    style={{
      fontFamily: "'Geist Mono', monospace",
      fontSize: 10,
      color: COLORS.textLight,
    }}
  >
    {children}
  </span>
);

const EntityRef = ({ children }) => (
  <span
    style={{
      fontFamily: "'Inter', sans-serif",
      fontWeight: 700,
      color: COLORS.accent,
    }}
  >
    {children}
  </span>
);

// ─── Page 1: Palette & Typography ───

const swatches = [
  { color: COLORS.slateDark, name: "Slate Dark", hex: "#2C3038", usage: "Primary text, headings" },
  { color: COLORS.accent, name: "Burnt Orange", hex: "#C94A1E", usage: "Bold accent, alerts, CTAs" },
  { color: COLORS.stone, name: "Stone", hex: "#8B8A85", usage: "Tertiary text, breadcrumbs" },
  { color: COLORS.sage, name: "Sage", hex: "#A8AFA4", usage: "Decorative, muted fills" },
  { color: COLORS.warmStone, name: "Warm Stone", hex: "#C9C5BC", usage: "Borders, dividers, dashes" },
  { color: COLORS.sand, name: "Sand", hex: "#E8E5DF", usage: "User bubbles, light fills" },
  { color: COLORS.cream, name: "Cream", hex: "#F4F3F0", usage: "Chat bg, panel bg" },
  { color: COLORS.nearWhite, name: "Near White", hex: "#FAFAF8", usage: "Pending block fills" },
];

const textColors = [
  { color: COLORS.textDark, name: "Text Dark", hex: "#2C3038", usage: "Headings, body, primary" },
  { color: COLORS.textMid, name: "Text Mid", hex: "#6B6E75", usage: "Descriptions, secondary" },
  { color: COLORS.textLight, name: "Text Light", hex: "#9B9DA3", usage: "Labels, timestamps, specs" },
];

const PalettePage = () => (
  <div style={{ display: "flex", gap: 60 }}>
    {/* Left: Colours */}
    <div style={{ flex: "0 0 420px" }}>
      <SectionLabel num="01" title="BRAND PALETTE" />
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: COLORS.textMid, marginBottom: 20 }}>
        Neutral base with Burnt Orange as the core brand accent.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
        {swatches.map((s) => (
          <div key={s.hex}>
            <div
              style={{
                width: "100%",
                aspectRatio: "1",
                backgroundColor: s.color,
                border: ["#E8E5DF", "#F4F3F0", "#FAFAF8"].includes(s.hex) ? `1px solid ${COLORS.warmStone}` : "none",
                marginBottom: 6,
              }}
            />
            <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 11, color: COLORS.textDark }}>{s.name}</div>
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: COLORS.textLight }}>{s.hex}</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: COLORS.textMid, marginTop: 2 }}>{s.usage}</div>
          </div>
        ))}
      </div>

      <SectionLabel num="02" title="TEXT COLOURS" />
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
        {textColors.map((t) => (
          <div key={t.hex} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 28, backgroundColor: t.color, flexShrink: 0 }} />
            <div>
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12, color: COLORS.textDark }}>{t.name}</span>
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: COLORS.textLight, marginLeft: 8 }}>
                {t.hex} — {t.usage}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>

    {/* Right: Typography */}
    <div style={{ flex: 1 }}>
      <SectionLabel num="03" title="TYPOGRAPHY" />
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 36, color: COLORS.slateDark, lineHeight: 1.1 }}>
          Inter Bold
        </div>
        <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: COLORS.textLight, marginTop: 4 }}>
          Headings & wordmark
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: COLORS.textMid, marginTop: 6, lineHeight: 1.5 }}>
          Clean neo-grotesque. Same family as body text.<br />
          Unified type system — the blocks are the identity.
        </p>
      </div>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 22, color: COLORS.slateDark }}>
          Inter Regular
        </div>
        <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: COLORS.textLight, marginTop: 4 }}>
          Body text & UI labels
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: COLORS.textMid, marginTop: 6, lineHeight: 1.5 }}>
          Readable at all sizes, neutral, professional.<br />
          Doesn't compete with the block language.
        </p>
      </div>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 20, color: COLORS.slateDark }}>
          Geist Mono
        </div>
        <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: COLORS.textLight, marginTop: 4 }}>
          Data, codes & system text
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: COLORS.textMid, marginTop: 6, lineHeight: 1.5 }}>
          Contemporary monospace by Vercel.<br />
          Timestamps, IDs, section labels.
        </p>
      </div>

      <SectionLabel num="04" title="TYPE SCALE" />
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          { font: "'Inter', sans-serif", weight: 700, size: 32, sample: "Page title", spec: "32pt Bold" },
          { font: "'Inter', sans-serif", weight: 700, size: 20, sample: "Section heading", spec: "20pt Bold" },
          { font: "'Inter', sans-serif", weight: 700, size: 14, sample: "Component label", spec: "14pt Bold" },
          { font: "'Inter', sans-serif", weight: 400, size: 13, sample: "Body text — readable at all sizes", spec: "13pt Regular" },
          { font: "'Inter', sans-serif", weight: 400, size: 12, sample: "Chat message text and inline entity refs", spec: "12pt Regular" },
          { font: "'Geist Mono', monospace", weight: 400, size: 11, sample: "breadcrumb › path › labels", spec: "11pt Mono" },
          { font: "'Geist Mono', monospace", weight: 400, size: 10, sample: "14:32 · status · ID-4092", spec: "10pt Mono" },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <span style={{ fontFamily: s.font, fontWeight: s.weight, fontSize: s.size, color: COLORS.slateDark }}>{s.sample}</span>
            <Spec>{s.spec}</Spec>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Page 2: Components ───

const Block = ({ title, subtitle, spec, strokeColor, strokeStyle, fill, textColor, progress }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
      <div
        style={{
          width: 180,
          height: 64,
          backgroundColor: fill || COLORS.white,
          border: strokeStyle === "dashed"
            ? `1px dashed ${strokeColor}`
            : `2px solid ${strokeColor}`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "8px 10px",
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 11, color: textColor || COLORS.textDark }}>{title}</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: textColor || COLORS.textMid, marginTop: 2 }}>{subtitle}</div>
        </div>
        {progress !== undefined && (
          <div style={{ height: 4, backgroundColor: COLORS.sand, width: "100%" }}>
            <div style={{ height: 4, backgroundColor: progress.color, width: progress.pct }} />
          </div>
        )}
      </div>
      <Spec>{spec}</Spec>
    </div>
  </div>
);

const ComponentsPage = () => (
  <div style={{ display: "flex", gap: 60 }}>
    {/* Left column */}
    <div style={{ flex: "0 0 360px" }}>
      <SectionLabel num="05" title="BLOCKS" />
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: COLORS.textMid, marginBottom: 16 }}>
        Square corners only. No rounded rects on blocks.
      </p>

      <Block title="Active Block" subtitle="Solid border, white fill" spec="stroke: Slate Mid 2px" strokeColor={COLORS.slateMid} fill={COLORS.white} progress={{ color: COLORS.accent, pct: "85%" }} />
      <Block title="Accent Block" subtitle="Burnt Orange border" spec="stroke: Burnt Orange 2px" strokeColor={COLORS.accent} fill={COLORS.white} progress={{ color: COLORS.accent, pct: "100%" }} />
      <Block title="Planned Block" subtitle="Dashed border, muted" spec="stroke: Warm Stone 1px dashed" strokeColor={COLORS.warmStone} strokeStyle="dashed" fill={COLORS.nearWhite} textColor={COLORS.textLight} progress={{ color: COLORS.sand, pct: "100%" }} />
      <Block title="Panel / Container" subtitle="Cream fill, sand border" spec="fill: Cream, stroke: Sand 1px" strokeColor={COLORS.sand} fill={COLORS.cream} />

      <div style={{ marginTop: 24 }}>
        <SectionLabel num="06" title="LINES & CONNECTIONS" />
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 140, display: "flex", alignItems: "center" }}>
              <div style={{ flex: 1, height: 2, backgroundColor: COLORS.slateMid }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: COLORS.slateMid, margin: "-3px -4px" }} />
              <div style={{ flex: 1, height: 2, backgroundColor: COLORS.slateMid }} />
            </div>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: COLORS.textMid }}>Solid — active connection</div>
              <Spec>Slate Mid, 2px</Spec>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 140, height: 0, borderTop: `1px dashed ${COLORS.warmStone}` }} />
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: COLORS.textMid }}>Dashed — planned / pending</div>
              <Spec>Warm Stone, 1px dashed</Spec>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 140, height: 0, borderTop: `1px solid ${COLORS.sand}` }} />
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: COLORS.textMid }}>Divider — section separator</div>
              <Spec>Sand, 1px</Spec>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 140, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: COLORS.slateDark }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: COLORS.slateMid }} />
              <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: COLORS.warmStone }} />
            </div>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: COLORS.textMid }}>Nodes — junction / endpoint</div>
              <Spec>Circle, no stroke, sized by importance</Spec>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Right column */}
    <div style={{ flex: 1 }}>
      <SectionLabel num="07" title="ENTITY REFERENCES" />
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: COLORS.textMid, marginBottom: 12 }}>
        Tinted bold text inline. Colour = Burnt Orange.
      </p>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: COLORS.textDark, lineHeight: 2.2, marginBottom: 4 }}>
        The <EntityRef>Heads of Terms Review</EntityRef> is due in 3 days.<br />
        James updated <EntityRef>Draft Lease Terms</EntityRef> yesterday.<br />
        Created <EntityRef>Review Break Clause</EntityRef> and assigned to you.
      </div>
      <div style={{ marginBottom: 28 }}><Spec>Inter Bold 14pt | Colour: Burnt Orange | Tappable</Spec></div>

      <SectionLabel num="08" title="CHAT BUBBLES" />
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: COLORS.textMid, marginBottom: 12 }}>
        Only rounded element. border-radius 12px.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ backgroundColor: COLORS.cream, borderRadius: 12, padding: "10px 14px", minWidth: 260 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12, color: COLORS.slateMid }}>juncta</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: COLORS.textDark, marginTop: 4 }}>AI response — cream fill, left-aligned</div>
          </div>
          <Spec>fill: Cream</Spec>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ backgroundColor: COLORS.sand, borderRadius: 12, padding: "10px 14px", minWidth: 260 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: COLORS.textDark }}>User message — sand fill, right-aligned</div>
          </div>
          <Spec>fill: Sand</Spec>
        </div>
      </div>
      <div style={{ marginBottom: 28 }} />

      <SectionLabel num="09" title="PILLS & STATUS" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
        {[
          { label: "CONNECTED", bg: COLORS.accent, fg: COLORS.white, desc: "Active — Burnt Orange fill" },
          { label: "PENDING", bg: COLORS.sand, fg: COLORS.textMid, desc: "Inactive — sand fill" },
          { label: "COMPLETE", bg: COLORS.slateDark, fg: COLORS.white, desc: "Done — slate dark" },
        ].map((p) => (
          <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                backgroundColor: p.bg,
                color: p.fg,
                borderRadius: 100,
                padding: "3px 12px",
                fontFamily: "'Geist Mono', monospace",
                fontSize: 10,
                letterSpacing: 0.5,
                minWidth: 90,
                textAlign: "center",
              }}
            >
              {p.label}
            </div>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: COLORS.textMid }}>{p.desc}</span>
          </div>
        ))}
      </div>

      <SectionLabel num="10" title="PROGRESS BARS" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
        {[
          { pct: 85, color: COLORS.accent, label: "85%" },
          { pct: 60, color: COLORS.slateMid, label: "60%" },
          { pct: 0, color: COLORS.sand, label: "0%" },
        ].map((b) => (
          <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 200, height: 6, backgroundColor: COLORS.sand }}>
              {b.pct > 0 && <div style={{ height: 6, backgroundColor: b.color, width: `${b.pct}%` }} />}
            </div>
            <Spec>{b.label}</Spec>
          </div>
        ))}
        <Spec>Track: Sand | Fill: Burnt Orange or Slate Dark | Height: 4-6px</Spec>
      </div>

      <SectionLabel num="11" title="INPUT FIELD" />
      <div
        style={{
          border: `1px solid ${COLORS.warmStone}`,
          borderRadius: 100,
          backgroundColor: COLORS.cream,
          padding: "10px 16px",
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          color: COLORS.textLight,
          maxWidth: 340,
          marginBottom: 6,
        }}
      >
        Ask Juncta about this scope...
      </div>
      <div style={{ marginBottom: 28 }}><Spec>Pill shape, cream fill, warm stone border 1px</Spec></div>

      <SectionLabel num="12" title="QUOTE" />
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 6, maxWidth: 400 }}>
        <div style={{ width: 2, height: 20, backgroundColor: COLORS.warmStone, flexShrink: 0, marginRight: 10 }} />
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: COLORS.textMid, fontStyle: "italic" }}>
          "Solicitor reviewed. Minor amendments on break clause."
        </div>
      </div>
      <div style={{ marginBottom: 28 }}><Spec>Left bar: Warm Stone 2px | Text: Text Mid, italic</Spec></div>

      <SectionLabel num="13" title="CONTEXT BAR" />
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, marginBottom: 6 }}>
        <span style={{ color: COLORS.stone }}>Saxonvale Programme</span>
        <span style={{ fontFamily: "'Geist Mono', monospace", color: COLORS.warmStone, margin: "0 6px" }}>›</span>
        <span style={{ color: COLORS.stone }}>Property & Legal</span>
        <span style={{ fontFamily: "'Geist Mono', monospace", color: COLORS.warmStone, margin: "0 6px" }}>›</span>
        <span style={{ fontWeight: 700, color: COLORS.textDark }}>Lease Negotiation</span>
        <span style={{ color: COLORS.textLight, marginLeft: 20 }}>Sarah Chen (owner)</span>
      </div>
      <div style={{ borderBottom: `1px solid ${COLORS.sand}`, maxWidth: 500, marginBottom: 6 }} />
      <Spec>Ancestors: Stone | Current: Bold, Text Dark | Sep: ›</Spec>
    </div>
  </div>
);

// ─── Page 3: Chat ───

const ChatPage = () => (
  <div style={{ display: "flex", gap: 40 }}>
    <div
      style={{
        width: 480,
        backgroundColor: COLORS.cream,
        borderRadius: 16,
        padding: 0,
        overflow: "hidden",
        flexShrink: 0,
        backgroundImage: `linear-gradient(${COLORS.warmStone}18 1px, transparent 1px), linear-gradient(90deg, ${COLORS.warmStone}18 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
      }}
    >
      {/* Context bar */}
      <div style={{ padding: "12px 20px", borderBottom: `1px solid ${COLORS.sand}` }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12 }}>
          <span style={{ color: COLORS.stone }}>Saxonvale Programme</span>
          <span style={{ fontFamily: "'Geist Mono', monospace", color: COLORS.warmStone, margin: "0 5px" }}>›</span>
          <span style={{ color: COLORS.stone }}>Property & Legal</span>
          <span style={{ fontFamily: "'Geist Mono', monospace", color: COLORS.warmStone, margin: "0 5px" }}>›</span>
          <span style={{ fontWeight: 700, color: COLORS.textDark }}>Lease Negotiation</span>
          <span style={{ color: COLORS.textLight, float: "right", fontSize: 11 }}>Sarah Chen (owner)</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Juncta 1 */}
        <div style={{ maxWidth: "78%" }}>
          <div style={{ backgroundColor: COLORS.cream, borderRadius: 12, padding: "10px 14px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12, color: COLORS.slateMid }}>juncta</span>
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: COLORS.stone }}>2 min ago</span>
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: COLORS.textDark, lineHeight: 1.8 }}>
              The <EntityRef>Heads of Terms Review</EntityRef> is due in 3 days.
              <br />
              James submitted an update on <EntityRef>Draft Lease Terms</EntityRef>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 0, margin: "8px 0", paddingLeft: 2 }}>
              <div style={{ width: 2, height: 16, backgroundColor: COLORS.warmStone, marginRight: 8, flexShrink: 0 }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: COLORS.textMid, fontStyle: "italic" }}>
                "Solicitor reviewed. Minor amendments on break clause."
              </span>
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13, color: COLORS.textDark, marginTop: 4 }}>
              Approve this update?
            </div>
          </div>
        </div>

        {/* User */}
        <div style={{ maxWidth: "60%", alignSelf: "flex-end" }}>
          <div style={{ backgroundColor: COLORS.sand, borderRadius: 12, padding: "10px 14px" }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: COLORS.textDark }}>
              Yes, approve it. And flag the break clause for my review.
            </div>
          </div>
        </div>

        {/* Juncta 2 */}
        <div style={{ maxWidth: "78%" }}>
          <div style={{ backgroundColor: COLORS.cream, borderRadius: 12, padding: "10px 14px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12, color: COLORS.slateMid }}>juncta</span>
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: COLORS.stone }}>just now</span>
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: COLORS.textDark, lineHeight: 1.8 }}>
              Done. <EntityRef>Draft Lease Terms</EntityRef> updated to 85%.
              <br />
              Created <EntityRef>Review Break Clause</EntityRef> and assigned to you.
            </div>
          </div>
        </div>
      </div>

      {/* Input */}
      <div style={{ padding: "12px 20px" }}>
        <div
          style={{
            border: `1px solid ${COLORS.warmStone}`,
            borderRadius: 100,
            backgroundColor: COLORS.cream,
            padding: "10px 16px",
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            color: COLORS.textLight,
          }}
        >
          Ask Juncta about this scope...
        </div>
      </div>
    </div>

    {/* Annotations */}
    <div style={{ flex: 1, fontFamily: "'Inter', sans-serif" }}>
      {[
        { heading: "Context bar", lines: ["Persistent scope at top.", "Breadcrumb hierarchy.", "Shows governance owner."] },
        { heading: "Entity references", lines: ["Tinted bold text inline.", "Tappable — expands detail.", "Colour: Burnt Orange."] },
        { heading: "Proposals", lines: ["Contributor updates as proposals.", "Owner approves in conversation.", "Juncta acts immediately."] },
        { heading: "Chat styling", lines: ["Background: cream + subtle grid.", "Juncta: cream bubbles (left).", "User: sand bubbles (right).", "Input: pill at bottom."] },
      ].map((section) => (
        <div key={section.heading} style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: COLORS.textDark, marginBottom: 4 }}>{section.heading}</div>
          {section.lines.map((ln) => (
            <div key={ln} style={{ fontSize: 11, color: COLORS.textMid, lineHeight: 1.6 }}>{ln}</div>
          ))}
        </div>
      ))}

      <div style={{ marginTop: 16 }}>
        <SectionLabel num="14" title="GOVERNANCE" />
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
          {[
            { role: "Owner", desc: "Changes plan, approves, delegates." },
            { role: "Delegate", desc: "Full authority within sub-scope." },
            { role: "Reader", desc: "Queries only, no changes." },
            { role: "Contributor", desc: "Updates enter as proposals." },
          ].map((r) => (
            <div key={r.role} style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
              <span style={{ fontWeight: 700, fontSize: 12, color: COLORS.textDark, minWidth: 80 }}>{r.role}</span>
              <span style={{ fontSize: 11, color: COLORS.textMid }}>{r.desc}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <Spec>Authority flows through containers. Contribution flows through entities.</Spec>
        </div>
      </div>
    </div>
  </div>
);

// ─── Main ───

export default function JunctaComponentLibrary() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ backgroundColor: COLORS.white, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "20px 32px", borderBottom: `1px solid ${COLORS.sand}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: 16, color: COLORS.textMid, letterSpacing: 1 }}>JUNCTA</span>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: COLORS.textLight, marginLeft: 16 }}>
              Component Library v1 — March 2026
            </span>
          </div>
          <div style={{ display: "flex", gap: 0 }}>
            {tabs.map((t, i) => (
              <button
                key={t}
                onClick={() => setActiveTab(i)}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  fontWeight: activeTab === i ? 700 : 400,
                  color: activeTab === i ? COLORS.textDark : COLORS.textLight,
                  backgroundColor: activeTab === i ? COLORS.sand : "transparent",
                  border: "none",
                  borderRadius: 100,
                  padding: "6px 16px",
                  cursor: "pointer",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "32px 32px" }}>
        {activeTab === 0 && <PalettePage />}
        {activeTab === 1 && <ComponentsPage />}
        {activeTab === 2 && <ChatPage />}
      </div>
    </div>
  );
}
