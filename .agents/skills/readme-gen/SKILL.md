---
name: readme-gen
description: >-
  Analyze a software repository and create or regenerate synchronized English README.md and Korean README_ko.md files, selecting evidence-based sections and optionally producing docs/API.md when verified API routes exist. Use when the user asks to create, regenerate, rewrite, or draft project README documentation, says "README 만들어줘", "README 생성해줘", "README 작성해줘", "프로젝트 설명 만들어줘", or explicitly invokes $readme-gen. Do not use for a small localized edit to an otherwise current README unless the user explicitly invokes this skill.
---

# README Generator

Generate repository documentation from verified project evidence. Keep the English and Korean README files structurally and factually synchronized, and never invent features, commands, metrics, compatibility, or deployment status.

## 1. Establish scope and write authority

1. Locate the repository root and read applicable `AGENTS.md` instructions.
2. Determine whether the request is a new generation, full regeneration, or draft-only review.
3. Check for `README.md`, `README_ko.md`, and `docs/API.md` before drafting.
4. If any target already exists, read it completely and preserve valuable project-specific content. Do not overwrite it unless the user explicitly approved regeneration or confirms the proposed replacement scope.
5. Treat an explicit request such as "regenerate and overwrite both READMEs" as approval; do not ask redundantly.

For a small localized correction, edit only the affected sections or use a dedicated README-update workflow when available. Do not regenerate the entire document merely to change one fact.

## 2. Scan the repository safely

Use `rg --files` and targeted reads. Exclude generated, dependency, cache, VCS, secret, and bulky artifact paths such as `.git/`, `node_modules/`, `dist/`, `.venv/`, caches, build output, and backups unless directly relevant.

Inspect the evidence needed for the project:

- package and dependency manifests, lockfiles, and verified scripts;
- entry points, routers/controllers, configuration, schemas, and representative core modules;
- `.env.example` or equivalent templates for variable names only;
- tests, CI configuration, deployment files, licenses, contribution guides, screenshots, and documentation;
- Phase, roadmap, backlog, and release documents for status, clearly distinguishing implemented from planned work;
- `git status`, relevant diffs, and recent commits when documenting current changes.

Never read or reproduce secret values from `.env`, credential files, private keys, tokens, or connection strings. Document environment-variable names and purposes only from safe templates or code references.

## 3. Classify the project and select sections

Read `references/section-rules.md` before drafting. Assign all supported project tags, such as web, CLI, library, AI, automation, or data. Use the tags and repository evidence to choose baseline and conditional sections.

Include a conditional section only when evidence supports it. If a common section is omitted, record the reason in the draft summary rather than adding empty boilerplate.

When verified API routes exist:

1. Keep the README API coverage concise.
2. Propose `docs/API.md` for endpoint details unless the repository already has an authoritative API reference.
3. Derive methods, paths, authentication, request fields, and response examples from route code, schemas, tests, or generated specifications; do not invent examples.
4. Link the API document from both README files with localized labels.

## 4. Draft synchronized documents

Draft `README.md` in English and `README_ko.md` in Korean with the same section order and equivalent facts.

- Put `🌐 [한국어](./README_ko.md) | [English](./README.md)` at the top of both files.
- Keep commands, paths, identifiers, configuration keys, product names, and code blocks untranslated.
- Localize prose, table headings, status labels, and link descriptions.
- Build the table of contents from sections actually included.
- Use only installation, test, lint, build, and run commands verified in manifests, existing automation, or project instructions.
- Explain technology roles and selection reasons only when the rationale is evidenced; otherwise state the role without guessing.
- Mark planned, partial, unverified, deprecated, and out-of-scope work accurately.
- Prefer relative links and repository-local assets.
- Avoid promotional claims such as "innovative", "powerful", or "state-of-the-art" unless the user supplies approved marketing language.

Do not rename files containing spaces automatically. Report recommended renames and request approval because renaming can break links and references.

## 5. Present the draft scope before replacement

When approval is still required, present:

- files to create or replace;
- detected project types and primary stack;
- included sections;
- excluded sections with reasons;
- whether `docs/API.md` is proposed;
- important limitations or facts that remain unverified.

Wait for confirmation before replacing existing documentation. New files may be written immediately only when the user's request already authorizes creation and no existing file will be overwritten.

## 6. Write and validate

Use patch-based edits and keep unrelated documentation untouched. After writing:

1. Compare the English and Korean heading sequences and factual content.
2. Verify table-of-contents links, relative file links, image paths, and referenced local paths.
3. Check that documented commands exist in manifests or project instructions; run safe, relevant checks when practical.
4. Check that environment-variable values, credentials, private data, and machine-specific absolute paths were not included.
5. Confirm status and test claims match direct evidence.
6. Review `git diff --check`, the complete documentation diff, and the final file list.
7. If `docs/API.md` was created, verify every documented endpoint against code, schemas, tests, or an authoritative specification.

If only one language can be completed reliably, stop before writing and request the missing context rather than leaving the pair inconsistent.

## 7. Report the result

Report:

- created or regenerated files;
- detected project types and stack;
- included and excluded sections;
- validation performed;
- any existing documentation preserved;
- remaining unverified facts, limitations, or recommended follow-up work.

For a draft-only request, return the proposed content and scope without writing files.
