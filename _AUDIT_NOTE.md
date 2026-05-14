# Audit Apply Notes — AIDaycareOperationsPlatform

Source: `/Users/erolakarsu/projects/_AUDIT/reports/batch_02.md` (lines 947-997).

## Original audit recommendations

### Existing AI features (audit listed 9; actual is 17+)
ai.js: milestone-assessment, compliance-check, parent-response,
ratio-optimization, incident-analysis, nutrition-analysis, developmental-report,
schedule-optimization, activity-suggestions.
aiFeatures.js: allergy-conflict-check, emergency-drill-recommend,
sibling-classroom-coord, tuition-subsidy-calc, results.
aiNew.js: behavioral-tracking, staff-schedule-optimizer,
developmental-predictor, parent-engagement-report.

### Audit gaps
The audit notes "no major" missing AI counterparts — alignment is good.

### Missing non-AI features
- Photo/video sharing with parents (privacy-compliant).
- Mobile app for parents.
- Health/immunization records integration.
- State-specific compliance validation.

### Custom feature suggestions
- Predictive child development flagging.
- Parent engagement prediction.
- Staff burnout prediction.
- Curriculum personalization.
- Nutrition optimization.

## Implemented in this pass

None. The project has 17+ AI endpoints, exceeding the >15 threshold and
already covering audit gaps. Backlog-only.

## Backlog (prioritized)

### Mechanical, low-risk
1. `/api/ai/staff-burnout-predictor` — given staff workload + incident
   history, output a burnout score.
2. `/api/ai/state-compliance-check` — variant of compliance-check
   parameterized by US state.

### Needs product decision
- Photo/video privacy model (parental consent flow, storage tier).
- Mobile push channel design.

### Needs credentials / external SDK
- State immunization registries.
- Push notification provider (FCM/APNs).

### Too risky / large refactor
- Mobile app (frontend constraint).

## Apply pass 3 (frontend)

LEFT-AS-IS. FE already wired: `client/src/pages/AIFeatures.js` covers `allergy-conflict-check`, `emergency-drill-recommend`, `sibling-classroom-coord`, `tuition-subsidy-calc`, plus paginated AI run history. Additional AI consumption is present in `Activities.js`, `Assessments.js`, `Compliance.js`, `Communications.js`, `StaffScheduling.js`, `Incidents.js`, `Meals.js`, `Ratios.js`, `Milestones.js`. Auth uses `Authorization: Bearer ${localStorage.token}` consistently. No changes made (idempotence).

## Apply pass 4 (mechanical backlog)

IDEMPOTENT. Mechanical backlog items already shipped:
- `POST /api/ai/staff-burnout-predictor` — `server/routes/aiNew.js` lines 273-327, `requireKey` 503 guard, `aiRateLimiter`, schedule + incident context.
- `POST /api/ai/state-compliance-check` — `server/routes/aiNew.js` lines 329-357, 503-on-no-key, requires `state`.

FE present in `client/src/pages/AIFeatures.js` (burnout form line 187, state-compliance form line 217), Bearer JWT, 503 handled by shared `callApi` error path. No new endpoints, no new FE pages, no new deps.
