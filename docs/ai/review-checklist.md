# Post-Run Review Checklist (After Every Codex Run)

## A) Validate Output Structure
- [ ] Response matches the selected mode’s required section order.
- [ ] Findings are split into confirmed issues vs assumptions.
- [ ] Severity labels are present for defects and risks.
- [ ] Recommendations are prioritized and actionable.
- [ ] Validation plan includes explicit commands or checks.

## B) Run Tests and Static Checks
- [ ] Unit tests covering touched logic pass.
- [ ] Integration or end-to-end tests for affected flows pass.
- [ ] Linting/format/type checks pass for changed files.
- [ ] No new warnings are introduced without justification.
- [ ] Test evidence is captured for PR review.

## C) Check for Duplication
- [ ] New logic does not duplicate existing utilities.
- [ ] Similar branches/functions are compared for drift risk.
- [ ] Proposed abstractions reduce net complexity.
- [ ] Shared helper extraction preserves call-site clarity.
- [ ] Regression tests cover previously duplicated paths.

## D) Verify CSS/JS Wiring
- [ ] Selectors, class names, and IDs match across markup/styles/scripts.
- [ ] Event handlers bind correctly and fire in expected lifecycle phase.
- [ ] State updates are reflected in UI without race conditions.
- [ ] No orphaned styles, dead selectors, or unreachable handlers remain.
- [ ] Load order and hydration behavior are safe in target environment.

## E) Check UX/UI Consistency
- [ ] Spacing, typography, color usage, and component patterns align with design system.
- [ ] Error messaging is clear, actionable, and consistently placed.
- [ ] Focus states and interactive affordances are visible.
- [ ] Responsive behavior is validated for target breakpoints.
- [ ] Accessibility basics (contrast, labels, keyboard path) are verified.

## F) Edge Case Validation
- [ ] Null/undefined/empty input states are handled safely.
- [ ] Boundary values and large payload cases are tested.
- [ ] Network failure, timeout, and retry behavior are validated.
- [ ] Partial data and stale state scenarios are covered.
- [ ] Rollback or fallback behavior is defined for critical failures.
