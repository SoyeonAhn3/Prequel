-- ============================================================
-- 005: Add description, current_step, total_steps to projects
-- Also make project_type nullable (type is detected by AI after creation)
-- ============================================================

ALTER TABLE public.projects
    ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS current_step INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_steps INTEGER NOT NULL DEFAULT 10;

ALTER TABLE public.projects
    ALTER COLUMN project_type DROP NOT NULL;
