# Laravel Serbia Meetup — Speaker Notes (per slide)

Companion to `docs/meetup-script.md` (the full script). One block per slide:
what is on the slide, what you say (condensed — full text in the script),
what happens on screen, and the time budget. Total: ~27 min.

---

## Slide 1 — Title: "Agent Orchestration with Laravel"
**On slide:** Title, subtitle "One conductor, thirteen players, and a framework
that speaks MCP", name, meetup.
**Say:** Intro — who you are (founder of CodingWisely), the product family,
and that agents changed how you work. Hook: "it was chaos at first."
**Action:** none.
**Time:** 2:00.

---

## Slide 2 — Who am I
**On slide:** CodingWisely (Laravel development agency), product family
(Taskavel, meetavel, postavel, wakeavel, voiceavel), "last year something
changed my workflow: AI agents".
**Say:** You build Laravel products with your team; the result of the agent
experiment is "an agent orchestra — and a story to tell."
**Action:** none.
**Time:** 1:00 (overlaps with slide 1 intro).

---

## Slide 3 — What is development today
**On slide:** Quote: "Development is the art of turning intent into verified
behavior." Conductor metaphor; "typing moved up the stack: intent · boundaries
· proof."
**Say:** The definition — code is no longer the product, behavior is. Conductor
never plays an instrument, yet the music is theirs. The keyboard is still ours
— we type judgment now.
**Action:** none.
**Time:** 2:00.

---

## Slide 4 — Why an orchestra at all?
**On slide:** Several products in parallel → same work every day. Uncontrolled
agents: guess instead of verifying, cost more, do things you didn't ask for.
Quote: "I don't need an agent that does everything — I need an orchestra with
roles."
**Say:** The problem you were solving; why structure was needed.
**Action:** none.
**Time:** 1:30.

---

## Slide 5 — The orchestra (diagram)
**On slide:** Org-chart diagram: LENKA at top, six boxes (Research, Build,
Quality, Escalation, Operations, Support) with named agents and what each
does.
**Say:** One primary agent (Lenka) + 13 specialized agents, one job each, least
power. Walk the boxes briefly — do not read every agent aloud; the table on
the next slide carries the detail.
**Action:** none (diagram only).
**Time:** 2:00.

---

## Slide 6 — Who plays what (roster table)
**On slide:** Table: Name | What it does | Called when | Model (Flash/Sol/Kimi).
**Say:** Explain the "called when" pattern with 2–3 examples (Tally after every
change, Surgeon only after 3 failed attempts, Mnemo at end of session). Point
out the model column: cost tied to the role, not to pride.
**Action:** none.
**Time:** 2:00.

---

## Slide 7 — Which model plays which instrument
**On slide:** Three rows: fast+cheap for everyday roles; strongest for
judgment (Themis, Surgeon, Pixel, Pilot, Iris); second opinion (Rival/Kimi).
Key line: "The design does not depend on the model."
**Say:** Model strategy; audience takeaway: pick your cheap model for everyday
work, your best model for Themis and Surgeon.
**Action:** none.
**Time:** 1:30.

---

## Slide 8 — Three design principles
**On slide:** Table: Model economy | Least privilege | Verification in the flow.
**Say:** The three pillars — cost per role; agents get nothing by default
(reviewer cannot edit, verifier cannot change); nobody says "done" without
proof, 3 failed attempts → escalation.
**Action:** none.
**Time:** 1:30.

---

## Slide 9 — Why Laravel
**On slide:** Official quote: "Laravel is a framework for building modern web
apps and AI agents." Predictable structure; Boost; your app becomes an MCP
server.
**Say:** Why Laravel is the best framework for this: predictable structure
(agents know where the controller goes), Boost gives the app a voice, MCP
lets it speak. USB-C metaphor.
**Action:** none.
**Time:** 2:00.

---

## Slide 10 — Boost and MCP details
**On slide:** Boost tools (search-docs, database-query, record-rule; 17,000+
docs filtered to your versions); MCP as open standard.
**Say:** Concrete examples of what Boost does; record-rule = "the project
learns how it is developed."
**Action:** none.
**Time:** 1:30.

---

## Slide 11 — The live demo (flow diagram)
**On slide:** Demo flow: Plan (Taskavel via MCP) → Spin up (laravel new) →
Build (orchestra) → Learn (Boost) → Speak (MCP server) → Remember (tasks +
handoff).
**Say:** One line: "Let's stop talking and build something."
**Action:** transition to terminal.
**Time:** 0:30.

---

## Slide 12 — LIVE DEMO
**On slide:** Keep this slide as a backdrop (or hide; terminal is the focus).
**Say (narrate while it happens):**
1. Plan in Taskavel — task-manager agent creates project, milestone, tasks
   via MCP; show clickable links (2:00).
2. `laravel new agentdemo` — fresh project (1:30).
3. "Build me a Products CRUD with tests" — explorer → implementer →
   verifier; narrate the delegation (6:00).
4. Boost: search-docs, make:action, record-rule (3:00).
5. App becomes an MCP server — server class + one tool, agent calls it
   (3:00).
6. Close the loop: tasks updated in Taskavel + handoff (1:30).
**Fallbacks (in the script):** Taskavel MCP down → skip plan/update, story
survives; laravel new stuck → prepared fallback project; agent misbehaves →
narrate it; running late → cut 4 or 5.
**Time:** 15:30 total.

---

## Slide 13 — Three things to take home
**On slide:** 1) Agents work best in an orchestra, not as lone heroes.
2) Laravel is already agentic-first. 3) Control is designed, not bought —
and it's portable.
**Say:** The three messages, slowly. This is the "what should they remember"
moment.
**Action:** none.
**Time:** 1:30.

---

## Slide 14 — Keep your editor — the orchestra follows you
**On slide:** Repo name (agent-orchestra), the pitch: 14 agents, the rules,
the generator; works in OpenCode, Claude Code, Cursor, Codex; one command
setup.
**Say:** The public repo — git clone + `node install.mjs`, Lenka greets you in
your editor. "Keep your editor — the orchestra follows you."
**Action:** show QR/link.
**Time:** 1:00.

---

## Slide 15 — Thank you
**On slide:** "Questions?" + start-here resources: Anthropic "Building
Effective Agents", modelcontextprotocol.io, laravel.com/docs/boost,
opencode.ai/docs/agents.
**Say:** Thank you; invite questions.
**Action:** Q&A.
**Time:** 1:00 + Q&A.

---

## Before you walk on stage
- Last look: the 6-beat map at the end of `docs/meetup-script.md`.
- Demo machine: verify Taskavel MCP token, fallback project ready, terminal
  projection tested, sound/projector checked.
- The honest story line: "my first autonomous run showed me where
  orchestration doesn't work — nobody reviewed the plan, nobody independently
  verified. That's why the system now has planning, an auditor, and a judge."