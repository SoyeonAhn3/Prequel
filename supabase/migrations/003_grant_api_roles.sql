-- ============================================================
-- 003: API 역할에 테이블 접근 권한 부여
-- "Automatically expose new tables" 비활성화 시 필요
-- ============================================================

-- anon: 비로그인 사용자 (announcements 조회 등)
-- authenticated: 로그인 사용자 (일반 CRUD)
-- service_role: 백엔드 서버 (전체 접근)

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public
    TO anon, authenticated, service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public
    TO anon, authenticated, service_role;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public
    TO anon, authenticated, service_role;

-- 향후 새 테이블에도 자동 적용
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;
