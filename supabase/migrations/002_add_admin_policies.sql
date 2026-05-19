-- ============================================================
-- 002: Admin 전체 접근 정책 추가
-- 이전 001 실행 후 추가로 실행
-- ============================================================

-- Helper: admin 여부 확인 함수
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- users
CREATE POLICY users_admin_all ON public.users
    FOR ALL USING (public.is_admin());

-- projects
CREATE POLICY projects_admin_all ON public.projects
    FOR ALL USING (public.is_admin());

-- interview_sessions
CREATE POLICY sessions_admin_all ON public.interview_sessions
    FOR ALL USING (public.is_admin());

-- payments
CREATE POLICY payments_admin_all ON public.payments
    FOR ALL USING (public.is_admin());

-- token_usage
CREATE POLICY token_admin_all ON public.token_usage
    FOR ALL USING (public.is_admin());

-- announcements: 이미 announce_admin_all이 있으면 스킵됨
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'announcements' AND policyname = 'announce_admin_all'
    ) THEN
        EXECUTE 'CREATE POLICY announce_admin_all ON public.announcements
            FOR ALL USING (public.is_admin())';
    END IF;
END $$;
