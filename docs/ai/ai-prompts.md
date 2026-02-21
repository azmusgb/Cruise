# AI Prompt System: Engineering Analysis Library

## Purpose
This library provides standardized prompts for repeatable engineering analysis in Codex. It reduces prompt drift, enforces structured outputs, and creates consistent review quality across code critique, UX checks, wiring audits, modularization analysis, duplication detection, performance review, and architecture evolution planning.

## Ultra-Compact Master Prompt Switchboard
Use this switchboard as the entry prompt in Codex:

```text
You are running the AI Prompt System.
MODE: <one mode from the Supported Modes list>
GOAL: <what outcome is needed>
SCOPE: <files, modules, PR diff, or pasted snippets>
CONTEXT: <constraints, stack, conventions, known issues>
OUTPUT_FORMAT: <must match mode template>
STRICTNESS: <low|medium|high>
```

## Supported Modes
1. `ENGINEERING_REVIEW`
2. `CODE_CRITIQUE`
3. `UX_UI_ANALYSIS`
4. `CSS_JS_WIRING_AUDIT` (alias: `WIRING`)
5. `MODULARIZATION_ANALYSIS`
6. `DUPLICATION_DETECTION`
7. `PERFORMANCE_REVIEW`
8. `EVOLUTION_PLANNING`

---

## Mode Templates and Invocation Examples

### 1) Mode: `ENGINEERING_REVIEW`
**Purpose:** Perform broad technical review of implementation quality, correctness risks, maintainability, and test adequacy.

**Input Variables**
- `goal`: required outcome for the change
- `scope`: files, modules, diff, or pasted snippets
- `constraints`: architectural rules, deadlines, compatibility requirements
- `risk_profile`: low/medium/high

**Constraints**
- Use only provided context and explicitly mark assumptions.
- Separate confirmed issues from potential issues.
- Prioritize findings by impact and confidence.

**Expected Structured Output**
1. `Summary`
2. `Confirmed Findings` (severity + evidence)
3. `Potential Risks` (with assumptions)
4. `Recommended Fixes` (ordered)
5. `Validation Plan` (tests/checks)

**Example Usage**
A developer pastes two related files (`service/order.ts` and `controllers/order-controller.ts`) and asks Codex to run `ENGINEERING_REVIEW` with high strictness because a release is pending. Codex responds with a severity-ranked list: one confirmed null-handling bug in request parsing, one medium-risk coupling issue between controller and data layer, and a fix plan that includes schema validation and integration tests. The response ends with a concrete validation sequence (`unit`, `integration`, and regression checks) matching the requested output sections.

### 2) Mode: `CODE_CRITIQUE`
**Purpose:** Critique code style, readability, naming, error handling, and maintainability at function/class/module level.

**Input Variables**
- `scope`
- `style_rules`: local conventions or lint rules
- `maintainability_target`: short-term patch vs long-term ownership
- `review_depth`: quick/standard/deep

**Constraints**
- Do not rewrite entire files unless explicitly requested.
- Tie every critique point to a concrete code location.
- Include least-invasive fix options first.

**Expected Structured Output**
1. `Readability and Structure Findings`
2. `Naming and API Clarity Findings`
3. `Reliability/Error Handling Findings`
4. `Refactor Suggestions` (small, medium, large)
5. `Patch Sketch` (optional minimal diff snippets)

**Example Usage**
A developer shares two utility modules with repeated parsing logic and asks for `CODE_CRITIQUE` at deep review depth. Codex returns findings grouped by readability, naming, and reliability, references exact line-local issues from the pasted snippets, and proposes a small refactor set (extract parser helper, tighten types, add guard clauses) before any larger architectural rewrite.

### 3) Mode: `UX_UI_ANALYSIS`
**Purpose:** Evaluate user flows, visual consistency, interaction clarity, accessibility basics, and UX friction points.

**Input Variables**
- `scope`: component files, screenshots, design notes
- `target_user`: role/persona
- `task_flow`: key user actions
- `device_context`: desktop/mobile/responsive

**Constraints**
- Distinguish objective UI defects from subjective preferences.
- Flag accessibility issues with severity.
- Provide actionable UI changes tied to interaction outcomes.

**Expected Structured Output**
1. `Flow Evaluation`
2. `UI Consistency Findings`
3. `Accessibility Findings`
4. `Friction Points`
5. `Prioritized UX Fixes`

**Example Usage**
A developer provides `CheckoutForm.tsx` plus `checkout.css` and requests `UX_UI_ANALYSIS` for mobile shoppers. Codex identifies inconsistent spacing and button hierarchy, flags low-contrast helper text as an accessibility issue, maps each issue to checkout abandonment risk, and outputs prioritized fixes (layout spacing token alignment, contrast correction, and clearer error messaging).

### 4) Mode: `CSS_JS_WIRING_AUDIT`
**Purpose:** Verify front-end wiring integrity across markup, styles, selectors, event handlers, and runtime state dependencies.

**Input Variables**
- `scope`: HTML/JS/TS/CSS files or component bundles
- `runtime_context`: framework and build assumptions
- `events_to_verify`: click/input/load/custom
- `state_sources`: local state/store/server

**Constraints**
- Identify broken selector references and orphaned classes.
- Trace event wiring from trigger to handler effect.
- Highlight load-order and hydration hazards.

**Expected Structured Output**
1. `Wiring Map` (selector/event/state linkage)
2. `Broken or Risky Links`
3. `Load/Initialization Risks`
4. `Fix Recommendations`
5. `Post-fix Verification Steps`

**Example Usage**
A developer pastes `widget.js` and `widget.css` where interactive states fail intermittently. Codex runs `CSS_JS_WIRING_AUDIT`, produces a selector-to-handler map, identifies a mismatched class name causing no-op click handlers, and notes a DOM-ready timing issue. It then provides minimal fixes and a browser verification checklist to confirm behavior.

### 5) Mode: `MODULARIZATION_ANALYSIS`
**Purpose:** Assess module boundaries, dependency direction, cohesion, and opportunities to split or consolidate components.

**Input Variables**
- `scope`
- `architecture_goal`: feature modularity, domain layering, package extraction, etc.
- `dependency_constraints`: allowed/forbidden edges
- `change_frequency`: hotspots and churn context

**Constraints**
- Prefer incremental restructuring over disruptive rewrites.
- Identify dependency violations with explicit evidence.
- Include migration path and rollback-safe sequencing.

**Expected Structured Output**
1. `Current Boundary Assessment`
2. `Dependency Violations or Smells`
3. `Proposed Module Plan`
4. `Incremental Migration Steps`
5. `Risk and Rollback Considerations`

**Example Usage**
A developer shares a service directory and asks whether billing logic should be extracted from an API module. Codex returns a boundary assessment showing cross-domain leakage, recommends a staged extraction plan into a billing domain module, and provides an ordered migration sequence with compatibility shims to reduce deployment risk.

### 6) Mode: `DUPLICATION_DETECTION`
**Purpose:** Detect repeated logic, near-duplicate patterns, and copy-paste divergence risks.

**Input Variables**
- `scope`
- `duplication_threshold`: exact/near/semantic
- `refactor_limits`: allowed abstraction level
- `safety_requirements`: test coverage minimum

**Constraints**
- Distinguish intentional repetition from accidental duplication.
- Quantify duplication impact (maintenance/test burden).
- Recommend abstractions only when net complexity decreases.

**Expected Structured Output**
1. `Duplicate Clusters`
2. `Divergence Risk Analysis`
3. `Refactor Candidates`
4. `Suggested Shared Abstractions`
5. `Regression Test Focus`

**Example Usage**
A developer pastes two validation files and a formatter helper and requests semantic duplication detection. Codex identifies duplicated input-normalization branches with slight drift, estimates bug risk from divergence, and proposes a shared normalization utility with explicit regression tests for existing edge cases.

### 7) Mode: `PERFORMANCE_REVIEW`
**Purpose:** Analyze runtime cost, render/recompute overhead, I/O inefficiencies, and optimization opportunities.

**Input Variables**
- `scope`
- `runtime_target`: server/client/background
- `performance_budget`: latency, memory, bundle size, throughput
- `hot_paths`: known expensive code paths

**Constraints**
- Focus on measurable impact.
- Separate quick wins from deeper architectural optimizations.
- Provide instrumentation guidance before major rewrites.

**Expected Structured Output**
1. `Performance Risk Summary`
2. `Likely Bottlenecks`
3. `Measurement Plan`
4. `Optimization Options` (quick wins vs structural)
5. `Acceptance Criteria`

**Example Usage**
A developer supplies a data aggregation function and endpoint code after seeing latency spikes. Codex runs `PERFORMANCE_REVIEW`, flags repeated filtering passes and non-batched I/O as likely bottlenecks, defines a profiling plan, and proposes quick wins (single-pass reduction, memoization where safe) plus acceptance criteria tied to p95 latency.

### 8) Mode: `EVOLUTION_PLANNING`
**Purpose:** Build an actionable technical evolution roadmap for scaling, maintainability, and feature growth.

**Input Variables**
- `scope`
- `horizon`: near/mid/long term
- `business_drivers`: velocity, reliability, cost, compliance
- `constraints`: staffing, release cadence, backwards compatibility

**Constraints**
- Balance strategic improvements with delivery continuity.
- Map recommendations to milestones and risk controls.
- Include explicit tradeoffs and decision triggers.

**Expected Structured Output**
1. `Current State Snapshot`
2. `Target State`
3. `Roadmap by Milestone`
4. `Tradeoffs and Decision Gates`
5. `Operational Guardrails`

**Example Usage**
A developer provides a monorepo structure summary and asks for a 2-quarter evolution plan. Codex responds with a milestone roadmap: quarter one focuses on observability and boundary cleanup, quarter two on shared platform tooling and performance governance, with decision gates based on incident rate and delivery lead time.

## Standard Invocation Pattern
Use this reusable command text for any mode:

```text
Run AI Prompt System.
MODE: <MODE_NAME>
GOAL: <desired outcome>
SCOPE: <files/snippets/diff>
CONTEXT: <architecture, constraints, risk tolerance>
OUTPUT: Use exact structured format for the selected mode.
```
