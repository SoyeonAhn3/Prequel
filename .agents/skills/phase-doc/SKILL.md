---
name: phase-doc
description: >-
  Create or update evidence-based bilingual Phase documentation under Phase/, keep English and Korean sections synchronized, reflect new Phase files in README.md and README_ko.md, and optionally record compatible dev-log entries. Use when the user asks to create, update, complete, review, or document a Phase, says "Phase 문서 업데이트해줘", "Phase N 상세 기록해줘", "개발 내용 문서화해줘", or "Phase 완료 기록해줘", or when implemented repository changes must be reflected in Phase documentation.
---

# Phase Documentation

Maintain the repository's Phase documents from verifiable implementation evidence. Preserve existing detail and edit only the sections affected by the requested work.

## 1. Resolve the target and scope

1. Locate the Git repository root and use it for all paths.
2. Identify the requested Phase number from the prompt, changed files, roadmap, or existing `Phase/PhaseN_*.md` documents.
3. If multiple Phase documents are materially affected, update each one or ask the user only when the intended scope cannot be inferred safely.
4. Classify each operation as one of:
   - new document;
   - completed-item addition;
   - design or implementation change;
   - status-only change;
   - full evidence review.

## 2. Gather repository evidence

Read the existing target document before editing it. Inspect only the sources needed to substantiate the update:

- `Phase/PhaseN_*.md` for current wording, structure, status, and history;
- `README.md` and `README_ko.md` for the roadmap and project-structure tree;
- relevant files under `backend/`, `frontend/`, `supabase/migrations/`, `scripts/`, tests, and project-local skills;
- `git diff`, `git status`, and relevant recent commits when the update concerns current work;
- issue, backlog, test, deployment, or external-operation evidence supplied by the user.

Record exact paths and real class, function, endpoint, component, migration, and test names. Distinguish clearly among implemented, locally verified, externally applied, planned, and blocked work. Never claim deployment, database application, production verification, or test success without direct evidence.

## 3. Create a new Phase document

When no matching Phase document exists:

1. Read `references/phase-template.md` completely.
2. Derive the English Phase name from the repository roadmap or user request.
3. Create `Phase/PhaseN_[EnglishPascalCase].md`; never use a Korean filename.
4. Write the English section first and the equivalent Korean section second, separated by two Markdown horizontal rules as shown in the template.
5. Add the new filename and accurate status to the Phase tree in both `README.md` and `README_ko.md` when those trees exist.

Create `Phase/` only after confirming the repository root and target Phase.

## 4. Update an existing document

Use patch-based, localized edits. Do not replace the entire document merely to add a status, deliverable, implementation note, design decision, or history row.

Update the English and Korean sections in the same operation with equivalent factual scope:

- status and completion date;
- deliverable rows and completion markers;
- implementation details and exact file references;
- design decisions and reasons;
- prerequisites, dependencies, and completion criteria;
- change-log rows.

Preserve the document's established vocabulary and layout unless normalization is requested. Keep historical change-log rows in place and append the newest entry at the bottom. Do not remove planned items simply because they are not implemented.

Use these status meanings for new content:

| Status | Meaning |
|---|---|
| `✅ Completed` / `✅ 완료` | Every stated completion criterion is satisfied and evidenced. |
| `🚧 In Progress` / `🚧 진행 중` | Some work is implemented or verified and material work remains. |
| `🔲 Not Started` / `🔲 미시작` | No implementation evidence exists. |
| `⏸ On Hold` / `⏸ 보류` | Work is intentionally paused. |

## 5. Validate documentation integrity

Before finishing:

1. Review the final diff for unrelated rewrites or lost detail.
2. Confirm the English and Korean sections describe the same status, deliverables, implementation, decisions, and change history.
3. Verify newly cited local paths exist; mark intentionally future paths as planned rather than implemented.
4. Confirm new filenames use `PhaseN_EnglishPascalCase.md` and do not collide with another Phase document.
5. Keep the `README.md` and `README_ko.md` Phase trees synchronized when either tree changes.
6. Run relevant tests or checks only when a status claim depends on them; report unverified claims explicitly.

## 6. Record a compatible dev-log entry

After the document write succeeds, look for the first available schema at:

1. `.agents/skills/dev-log/references/schema.md`
2. `.claude/skills/dev-log/references/schema.md`
3. `.codex/skills/dev-log/references/schema.md`

If found, read it before appending one `CHANGE` entry to its prescribed local-date JSONL file. Use `module: "PhaseDoc"`, summarize the Phase and operation in `message`, and include `before`, `after`, and `reason` in `data`. Reuse the conversation's session ID and never log credentials, tokens, personal data, or secret values. Ensure the log path is ignored when the schema requires it.

If no compatible schema exists, skip logging and report that fact. If logging fails, preserve the completed documentation change and report the warning separately.

## 7. Report the result

Report:

- target Phase document;
- operation type;
- concise summary of synchronized English/Korean changes;
- evidence or verification performed;
- README synchronization status;
- dev-log result;
- any remaining planned or unverified work.
