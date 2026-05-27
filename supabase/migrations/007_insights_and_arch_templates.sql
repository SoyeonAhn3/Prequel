-- ============================================================
-- 007: Add _insights to interview_sessions, arch_templates to design_sessions
-- ============================================================

-- interview_sessions: store accumulated insights per session
ALTER TABLE public.interview_sessions
    ADD COLUMN IF NOT EXISTS _insights JSONB DEFAULT '[]'::jsonb;

-- design_sessions: store AI-generated architecture template options
ALTER TABLE public.design_sessions
    ADD COLUMN IF NOT EXISTS arch_templates JSONB;
