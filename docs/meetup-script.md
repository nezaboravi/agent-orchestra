# Laravel Meetup — THE SCRIPT (25–30 min, English)

How to use this:
- Each section has a time stamp, the **spoken text** (say it in your own words —
  this is the skeleton, make it sound like you), and **[DEMO]** notes (what happens
  on screen while you speak).
- Learn it in blocks: first memorize the 6-beat map, then one section at a time.
- Total ≈ 2,800 words spoken + live demo actions ≈ 27 min with room to breathe.

---

## THE MAP (memorize this — 6 beats)

1. Opening — who I am, what we build, what today is about
2. Theory: what development is today (the definition)
3. Theory: the orchestra (problem → agents → 3 principles)
4. Theory: why Laravel (Boost, MCP — agentic-first)
5. Demo: plan in Taskavel → laravel new → build → Boost → MCP → close the loop
6. Close: 3 messages, public repo, resources, thank you

---

## 1. OPENING (0:00–2:00)

> Spoken:

"Hey everyone. Thanks for having me.

Quick introduction: my name is Vladimir, and I'm the founder of CodingWisely —
a Laravel development agency. Together with my team we build web applications,
SaaS platforms, and a small family of our own products: a task manager, an
analytics platform, AI-native scheduling, voice apps. All Laravel.

And over the last year, something changed in the way I work. I started using AI
agents — and not just for autocomplete. Real agents that read my code, write my
code, run my tests. And the honest truth is: it was chaos at first. Agents doing
things I didn't ask for. Costing more than I expected. Guessing instead of
verifying.

So I did what any engineer does when something is chaotic: I added structure.
I built an *orchestra*. One conductor, specialized players, and rules for how
they work together.

Today I want to show you two things. First, the theory — how this orchestra is
designed, and why I believe Laravel is the best framework in the world for this.
And second, the practice — a live demo, where I spin up a brand new Laravel
project right here, and the orchestra builds something real, in front of you.

Let's start with a question I think about a lot."

---

## 2. THEORY: WHAT DEVELOPMENT IS TODAY (2:00–4:00)

> Spoken:

"What is development today? What is our job — now that machines can write code?

Here's my definition: **development is the art of turning intent into verified
behavior.**

Code is no longer the product. Behavior is. Anyone can generate a thousand lines
of code in an afternoon. The hard part is knowing what to build, what to forbid,
and how to prove it works.

I like to think about it like an orchestra. A conductor never plays an instrument.
Yet the music is theirs. That's us now. We don't write every note anymore — we
write the score: the architecture, the rules, the tests. The agents play the
instruments. We own the music — and when a note is wrong, it's our ear that
catches it.

So where did all our typing go? It didn't disappear. It moved up the stack.
We no longer type every line of code. We type **intent, boundaries, and proof**.
The keyboard is still ours — we just type judgment now.

And that's exactly why I built the orchestra — because judgment needs structure.
Let me show you what I mean."

---

## 3. THEORY: THE ORCHESTRA (4:00–8:30)

> Spoken:

"Here's the problem I was solving. I build several products at the same time. And
every day brings the same kinds of work: exploring the codebase, writing CRUD,
writing tests, debugging, reviewing. Do it by hand and you lose hours switching
context and repeating the same mistakes.

Agents solve that — but only if you control them. An uncontrolled agent is
expensive, it guesses, it does things you didn't ask for.

So I built a hierarchy. **[DEMO: show the architecture diagram — one node labeled
"Orchestrator (Lenka)" in the center, 13 nodes around it.]**

At the center is one primary agent — I call her Lenka, yes, my agents have names —
and around her, thirteen specialized agents. Each one has a name, a title, one
job, and the least possible power to do it.

Let me walk you through the roster. **[DEMO: show the roster — the diagram]**

For *understanding the code*: **Atlas**, the Cartographer — read-only, it maps
the codebase before anything is touched. And **Sage**, the Librarian — when an
agent needs documentation or has to check a package version.

For *building*: **Forge**, the Builder — makes changes and writes tests alongside
them. And **Detective**, the Investigator — because when a test fails, finding the
root cause is a different skill than building.

For *quality*: **Tally**, the Auditor — runs the tests and linters, and cannot
edit code. **Pixel**, the Inspector — actually opens the browser, desktop and
mobile, and looks at the UI. And **Themis**, the Judge — an independent review,
reads everything, changes nothing.

For *the hard cases*: **Surgeon**, the Escalator — and here's the discipline:
it is only called after three objectively failed attempts, with a structured
report. No guessing forever.

For *operations*: **Pilot**, the Operator — dashboards, DNS, email providers.
And **Steward**, the Planner — talks to my own product, Taskavel, to plan and
track the work.

And two smaller ones: **Iris**, the Eye, reads images and PDFs when the main
model can't see them. And **Mnemo**, the Scribe — saves the state of every
session, so the project is never forgotten. I'll show you why that matters at
the end.

And there's **Rival**, the Challenger — a second opinion from a different model,
only when I explicitly ask for it.

Now — what model plays which instrument? The everyday work — mapping, building,
verifying, planning — is played by a fast, cheap model. The judgment work — the
Judge, the Escalator, the Inspector — by the strongest model I have. And Rival
is a third model, opt-in. The important thing: **the design doesn't depend on
the model.** You plug in whatever models you have — the roles, the rules and the
permissions stay the same.

Now, three design principles make this work. **[DEMO: show the three pillars]**

**First: model economy.** I don't use one model for everything. A cheap, fast
model does the everyday work — exploration, implementation, verification. An
expensive, top model is reserved for what it's worth: reviews, deep debugging,
browser work. Cost is tied to the role, not to pride.

**Second: least privilege.** A subagent has nothing until you explicitly give it a
tool. The reviewer cannot edit. The verifier cannot change code. And certain
commands — force pushes, deleting things, resetting databases — are denied
everywhere. Agents work *with* you, not *instead* of you.

**Third: verification is built into the flow.** Nobody says 'done' without proof.
Implementer writes, verifier proves, reviewer checks. And after three failed
attempts, the system stops guessing and escalates.

This is the orchestra. Now — why Laravel?"

---

## 4. THEORY: WHY LARAVEL (8:30–10:30)

> Spoken:

"This is the part I'm most excited about, because I believe Laravel is the best
framework in the world for agentic development. And Laravel agrees — their own
docs now say, and I quote: *'Laravel is a framework for building modern web apps
and AI agents.'*

Two things make this true.

**First: Laravel Boost.** **[DEMO: show Boost docs page or terminal output]**

Boost is an MCP server that gives agents tools *for your application*. Not generic
tools — tools that understand *your* code. It knows your PHP version, your
database schema, your routes, your logs. When an agent needs documentation, it
doesn't guess — it searches a database of seventeen thousand Laravel docs,
filtered to the exact versions you have installed. And when an agent learns
something about your project — a convention, a trap — it can record it as a rule,
so every future agent inherits it. The project literally learns how it is
developed.

**Second: your application itself can become an MCP server.** And MCP — the Model
Context Protocol — is the open standard for connecting AI to systems. Think of it
as the USB-C port for AI applications. Your Laravel app can expose its own tools
and its own rules to any agent that connects.

And in the demo, you'll see both of these live. So let's stop talking and build
something."

---

## 5. THE DEMO (10:30–26:00)

### 5.1 Plan in Taskavel (10:30–12:30)

> Spoken:

"Every build starts with a plan. And my plan lives in my own product — Taskavel.

Watch this. I'm going to ask the orchestra to create a project for our live demo,
with a milestone and tasks. The task manager agent will do it through the Taskavel
API — exposed over MCP. My product is talking to my agents."

**[DEMO: type the request — "Create a Taskavel project 'Meetup Live Demo' with a
milestone 'Agentic CRUD' and tasks: scaffold, model + migration, controller +
routes, views, tests, MCP tool. Link them to the milestone." — let task-manager
agent run; pause while it works; show the clickable task links that appear]**

"Look at that — project, milestone, six tasks, created by an agent, through MCP,
in my own product. Those links are real — you can open them.

Now let's build the thing the plan describes."

### 5.2 Spin up the project (12:30–14:00)

> Spoken:

"Fresh Laravel project. Nothing special — plain `laravel new`. Watch."

**[DEMO: run `laravel new agentdemo` (or fallback project). While it installs:
keep talking]**

"While this installs — notice what just happened. One command, and the whole
scaffold is here: routing, migrations, testing, authentication. This is why
Laravel is perfect for agents — the structure is *predictable*. An agent always
knows where the controller goes. No guesswork.

And here's the important part — I'm opening this project inside my orchestra.
The agents, the rules, the tools — they're all already here. Watch what happens
when I give it a task."

### 5.3 Natural language → orchestra builds (14:00–20:00)

> Spoken:

"I'm going to ask for a Products CRUD with tests. Plain English. Watch how the
orchestra reacts."

**[DEMO: type — "Build me a Products CRUD with tests, follow the project
conventions." Let it run. Narrate each step as it happens:]**

"Notice what it did first — it didn't start typing. It sent the explorer in first,
to look at the project conventions. Read-only. No changes. It's checking: how do
we write code in *this* project?

Now the implementer is working — and here's the thing I want you to see: it's
writing tests *alongside* the code, not as an afterthought.

And there — the verifier, running the tests independently. It can't edit code.
It can only prove. This is the difference between 'trust me' and 'here's the
proof'.

Look at that — tests passing, Pint clean, the CRUD works. And the whole time,
I wrote exactly one sentence."

### 5.4 Laravel Boost in action (20:00–23:00)

> Spoken:

"Let me show you the Laravel-specific magic — Boost. These are the moments that
made me a believer."

**[DEMO (pick 2-3, keep it tight):**
- `search-docs`: ask the agent to check the docs for the installed Laravel
  version before a change — show it returns version-specific results.
- `make:action`: ask it to create an Action class — it follows the project's
  Action pattern convention.
- `record-rule`: ask the agent to record something it learned as a project rule —
  show the `.ai/rules` file appear in the repo.]

"First — when an agent needs to know how Laravel works, it doesn't guess and it
doesn't web-search. It asks Boost, and Boost answers with the documentation for
the exact version in this project. Version-specific. No outdated syntax.

Second — the project's conventions are enforced by the project itself. It created
an Action class the way *this* codebase does it.

And this one is my favorite — **record rule**. The agent just learned something
about this project and committed it as a rule. From now on, every agent that
touches this project inherits it. The project learns as it's built. That's not a
feature you see in many stacks."

### 5.5 The app becomes an MCP server (23:00–25:00)

> Spoken:

"Now the finale. I said earlier your app can become an MCP server itself. Let's
prove it — right here, in this fresh project. We're going to expose a small tool
to agents. And it takes just a few lines."

**[DEMO: create the minimal MCP server live (server class with #[Name],
#[Version], #[Instructions], one read-only tool — e.g. returns products count).
Then show the agent calling it and using the answer.]**

"There it is. A Laravel application that speaks MCP — agents can call its tools,
follow its instructions. A few dozen lines in `app/Mcp/`. No separate service.
No infrastructure. That's your product talking to the AI world — through your
tools, under your rules."

### 5.6 Close the loop (25:00–26:00)

> Spoken:

"Remember the plan we made in Taskavel at the start? Let's close the loop."

**[DEMO: ask the task manager agent to mark the completed tasks done in Taskavel —
scaffold, model, tests; leave MCP tool open. Show the tasks updating.]**

"The plan is now reality — built, tested, and verified. And one last thing:
I'm closing this session with a handoff. The project remembers everything we did
and exactly what's next. Tomorrow, I open this project and continue where I left
off. The orchestra doesn't forget.

That's the full loop: plan, build, verify, remember. And I typed maybe ten
sentences."

---

## 6. CLOSE (26:00–28:00)

> Spoken:

"So — three things I hope you take with you.

**First: agents work best in an orchestra, not as lone heroes.** Roles,
permissions, verification — that's what turns a toy demo into something you can
trust with real work.

**Second: Laravel is already agentic-first.** Boost gives your application a
voice. MCP lets it speak. Your app isn't just code anymore — it's a participant.

**Third: control is designed, not bought.** Model economy, least privilege,
verification in the flow — all of this is configurable, and all of it is portable.

And because I believe this should be a starting point, not a talk — everything
you saw today is open source. **[DEMO: show the repo link]** You'll find the
full orchestra there: the agents, the rules, the generator that ports them to
your editor — OpenCode, Claude Code, Cursor, Codex. One command, and the
orchestra follows you. Keep your editor, keep your workflow — the structure comes
with you.

There's also a list of learning resources in the repo — the canonical reads on
agentic engineering and orchestration, from Anthropic's 'Building Effective
Agents' to the MCP specification itself.

Thank you. I'll take questions."

---

## QUICK RECOVERY NOTES (if something goes wrong on stage)

- **Taskavel MCP fails** → skip 5.1 and the task updates in 5.6. Say: "My task
  manager is offline — network, probably — but you've seen the pattern. Moving on."
  Story survives.
- **`laravel new` fails / too slow** → use the pre-made fallback project with the
  same name. Say: "Networks love to fail on stage — luckily I prepared." No one
  cares about the command, they care about the flow.
- **Agent does something unexpected** → don't fight it. Narrate it: "Look —
  this is exactly why we have reviewers." Never fake a success; the audience
  respects honesty more than polish.
- **Running out of time** → skip 5.4 (Boost) partially or 5.5 (MCP server).
  Keep 5.1, 5.3 and 5.6 — they are the story.
- **Too much time left** → expand 5.3 (build) with the reviewer step and talk
  through each delegation decision out loud.

---

## THE MAP AGAIN (last thing you look at before walking on stage)

1. Opening — who I am (2 min)
2. Development today — the definition (2 min)
3. The orchestra — roles + 3 principles (4.5 min)
4. Why Laravel — Boost + MCP (2 min)
5. Demo — Taskavel plan → laravel new → CRUD → Boost → MCP → close loop (15.5 min)
6. Close — 3 messages + repo + resources (2 min)