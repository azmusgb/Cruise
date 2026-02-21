# Workflow Guide: Executing the AI Prompt System in Codex (ChatGPT GitHub Integration)

## 1) Scope the Task Before Prompting
1. Define the exact objective in one sentence (e.g., “find CSS/JS wiring faults in checkout widget”).
2. Select the minimum file set needed to answer that objective.
3. State technical boundaries: framework version, lint rules, architecture constraints, and non-goals.
4. Choose one prompt mode from `docs/ai/ai-prompts.md`.
5. Set strictness (`low`, `medium`, `high`) based on release risk.

## 2) Prepare Context with Partial Files
1. Paste only the relevant snippets or diff hunks when full files are unnecessary.
2. Include file names and line ranges for each snippet.
3. Preserve imports, type definitions, and adjacent logic that affect behavior.
4. Include failing test output or logs when debugging.
5. Explicitly mark omitted sections with `...` so the model does not infer missing logic as absent.

## 3) Invoke Codex with a Mode-Structured Prompt
1. Start with the switchboard format:
   - `MODE`
   - `GOAL`
   - `SCOPE`
   - `CONTEXT`
   - `OUTPUT_FORMAT`
   - `STRICTNESS`
2. Require “confirmed vs assumed” separation for technical findings.
3. Require severity tagging for defects (`critical`, `high`, `medium`, `low`).
4. Require output in the selected mode’s exact section order.

## 4) Request Patch-Style Output
1. Ask for minimal diffs before full-file rewrites.
2. Prefer patch format that is directly applicable in Git workflows.
3. Ask Codex to justify each patch chunk with one sentence.
4. Keep patch scope single-purpose; split large changes into sequenced patches.
5. If confidence is low, request diagnostic instrumentation patch first.

## 5) Apply and Validate Changes
1. Apply suggested patch in a branch.
2. Run unit, integration, and lint checks relevant to touched files.
3. Re-run the same mode with updated context if failures persist.
4. Confirm that fixes did not expand scope unintentionally.
5. Capture command outputs in PR notes for auditability.

## 6) Commit and Review
1. Create focused commits by concern (bugfix, refactor, tests).
2. Use commit messages that include intent + subsystem.
3. In PR description, include:
   - objective
   - selected mode
   - risk level
   - validation evidence
4. Request human review for architectural or security-impacting changes.
5. Merge only after checklist completion (`review-checklist.md` and `pre-ship-checklist.md`).

## 7) Version-Control the Prompt Library
1. Treat prompts as code under `docs/ai/`.
2. Update prompts via PRs with rationale and before/after examples.
3. Track prompt changes with semantic intent:
   - `prompt:clarity`
   - `prompt:safety`
   - `prompt:coverage`
4. Maintain changelog notes for mode contract changes.
5. Require at least one reviewer for prompt contract edits.

## Prompt Engineering Best Practices
The following practices align with recognized prompt engineering guidance and are adapted for engineering workflows in GitHub-integrated Codex usage.

### A) Iterative Prompting
1. Start with a narrow, testable objective.
2. Evaluate output quality against required structure.
3. Tighten constraints (scope, format, severity, assumptions).
4. Re-run with only necessary added context.
5. Preserve successful prompt patterns as reusable templates.

### B) Test-First Prompting
1. Ask Codex to define expected behavior and edge cases first.
2. Request failing tests or test cases before implementation patches.
3. Apply fixes after test expectations are explicit.
4. Require post-fix validation commands and expected outcomes.
5. Reject patch output that lacks a verification plan.

### C) Patch-Oriented Collaboration
1. Prefer unified diff or minimal-change patch output.
2. Request rationale per hunk to simplify review.
3. Avoid mixed-purpose patches (logic + style + reformat).
4. Keep risky changes behind explicit feature flags when possible.
5. Confirm reversibility and rollback steps.

### D) Context Scoping Discipline
1. Provide only files that affect the decision.
2. Include local conventions and constraints up front.
3. Label uncertain assumptions as uncertain.
4. Supply runtime evidence (logs/metrics) for performance or production bugs.
5. When context is large, summarize architecture first, then attach only critical snippets.

## Operational Template
Use this execution template during real work:

```text
MODE: <selected mode>
GOAL: <single measurable objective>
SCOPE: <files, snippets, diff>
CONTEXT: <stack, constraints, incidents, conventions>
REQUEST:
1) Produce structured analysis in mode format.
2) Provide minimal patch diff.
3) Provide verification commands and expected pass criteria.
STRICTNESS: <low|medium|high>
```
