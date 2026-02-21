# Pre-Ship Release Readiness Checklist (Pre-Merge)

## 1) Defensive Null Checks
- [ ] External inputs are validated at boundaries.
- [ ] Null/undefined access paths are guarded.
- [ ] Parsing and coercion failures return safe outcomes.
- [ ] Error paths preserve observability (logs/telemetry).
- [ ] Critical code paths avoid silent failure.

## 2) Keyboard Accessibility
- [ ] All interactive elements are reachable via keyboard.
- [ ] Focus order is logical and uninterrupted.
- [ ] Visible focus indicators are present and compliant.
- [ ] Keyboard activation works for custom controls.
- [ ] Escape/close and modal trap behaviors are correct.

## 3) State Ownership Verification
- [ ] Source of truth for each state domain is explicit.
- [ ] Derived state is not redundantly persisted.
- [ ] Cross-component state flow is documented and predictable.
- [ ] State mutation points are minimal and controlled.
- [ ] Cleanup logic prevents stale subscriptions or leaks.

## 4) Load Order Safety
- [ ] Initialization order is deterministic across environments.
- [ ] Event binding occurs after required nodes/resources are available.
- [ ] Async dependencies handle slow or failed loads safely.
- [ ] Hydration/bootstrap sequence avoids double-binding.
- [ ] Feature flags and config are loaded before dependent execution.

## 5) Performance Baseline Tests
- [ ] Baseline metrics are recorded (latency, memory, render cost, bundle impact).
- [ ] Regressions are evaluated against agreed performance budgets.
- [ ] Hot paths are instrumented or profiled.
- [ ] Expensive loops/re-renders are measured after changes.
- [ ] Pre-merge report includes before/after performance evidence.
