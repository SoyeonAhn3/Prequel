-- ============================================================
-- 012: 인터뷰 1회 + 설계·평가 세트 1회 단계별 원자 과금 (BL-023)
-- ============================================================

-- 인터뷰와 설계·평가 세트는 서로 독립적으로 한 번씩만 차감한다.
ALTER TABLE public.projects
    ADD COLUMN IF NOT EXISTS interview_credit_charged_at TIMESTAMPTZ;

-- 이미 인터뷰를 시작한 기존 프로젝트는 재접속 시 새로 차감하지 않는다.
-- 사용자의 credits_used는 소급 증가시키지 않고 최초 세션 시각만 도장으로 백필한다.
UPDATE public.projects AS project
   SET interview_credit_charged_at = existing.first_session_created_at
  FROM (
        SELECT project_id, MIN(created_at) AS first_session_created_at
          FROM public.interview_sessions
         GROUP BY project_id
       ) AS existing
 WHERE project.id = existing.project_id
   AND project.interview_credit_charged_at IS NULL;


-- 인터뷰 최초 진입과 사용자 사용량 증가를 하나의 트랜잭션에서 처리한다.
CREATE OR REPLACE FUNCTION public.start_interview_atomic(
    p_project_id UUID,
    p_user_id UUID,
    p_bypass_limit BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    v_project public.projects%ROWTYPE;
    v_user public.users%ROWTYPE;
    v_credit_limit INTEGER;
BEGIN
    -- 모든 단계별 과금 함수는 프로젝트→사용자 순서로 잠근다.
    SELECT project.*
      INTO v_project
      FROM public.projects AS project
     WHERE project.id = p_project_id
       AND project.user_id = p_user_id
       AND project.deleted_at IS NULL
     FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION USING
            ERRCODE = 'P0002',
            MESSAGE = 'PROJECT_NOT_FOUND';
    END IF;

    -- 인터뷰 단계가 아닌 프로젝트에서 새 세션/비용이 발생하지 않게 한다.
    IF v_project.status <> 'in_progress' THEN
        RAISE EXCEPTION USING
            ERRCODE = 'P0001',
            MESSAGE = format('INVALID_PROJECT_STATE:%s', v_project.status);
    END IF;

    -- 같은 프로젝트의 새로고침·재접속·재시도는 성공하되 다시 차감하지 않는다.
    IF v_project.interview_credit_charged_at IS NOT NULL THEN
        RETURN jsonb_build_object(
            'project', to_jsonb(v_project),
            'charged', FALSE
        );
    END IF;

    SELECT app_user.*
      INTO v_user
      FROM public.users AS app_user
     WHERE app_user.id = p_user_id
     FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION USING
            ERRCODE = 'P0002',
            MESSAGE = 'USER_NOT_FOUND';
    END IF;

    v_credit_limit := CASE
        WHEN p_bypass_limit OR v_user.role = 'admin' THEN NULL
        WHEN v_user.plan = 'basic' THEN 10
        WHEN v_user.plan = 'pro' THEN 30
        ELSE 2
    END;

    IF v_credit_limit IS NOT NULL
       AND v_user.credits_used >= v_credit_limit THEN
        RAISE EXCEPTION USING
            ERRCODE = 'P0001',
            MESSAGE = format('CREDIT_LIMIT_EXCEEDED:%s', v_credit_limit);
    END IF;

    UPDATE public.users
       SET credits_used = credits_used + 1
     WHERE id = p_user_id;

    UPDATE public.projects
       SET interview_credit_charged_at = NOW()
     WHERE id = p_project_id
     RETURNING * INTO v_project;

    RETURN jsonb_build_object(
        'project', to_jsonb(v_project),
        'charged', TRUE
    );
END;
$$;


-- 011의 설계 결정을 단계별 정책에 맞게 교체한다.
-- design: 설계·평가 세트 최초 진입 1회 차감
-- skip: 설계·평가를 모두 건너뛰고 인터뷰 문서 결과로 종료
CREATE OR REPLACE FUNCTION public.set_design_decision_atomic(
    p_project_id UUID,
    p_user_id UUID,
    p_decision TEXT,
    p_bypass_limit BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    v_project public.projects%ROWTYPE;
    v_user public.users%ROWTYPE;
    v_credit_limit INTEGER;
    v_charged BOOLEAN := FALSE;
BEGIN
    IF p_decision NOT IN ('design', 'skip') THEN
        RAISE EXCEPTION USING
            ERRCODE = '22023',
            MESSAGE = 'INVALID_DESIGN_DECISION';
    END IF;

    SELECT project.*
      INTO v_project
      FROM public.projects AS project
     WHERE project.id = p_project_id
       AND project.user_id = p_user_id
       AND project.deleted_at IS NULL
     FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION USING
            ERRCODE = 'P0002',
            MESSAGE = 'PROJECT_NOT_FOUND';
    END IF;

    -- 완료 프로젝트는 재요청으로 상태가 뒤로 돌아가거나 다시 차감되지 않는다.
    IF v_project.status = 'completed' THEN
        RETURN jsonb_build_object(
            'project', to_jsonb(v_project),
            'charged', FALSE
        );
    END IF;

    -- 화면 경로를 우회해 인터뷰 전에 설계/종료 결정을 내릴 수 없게 한다.
    IF NOT EXISTS (
        SELECT 1
          FROM public.interview_sessions AS interview
         WHERE interview.project_id = p_project_id
           AND interview.status = 'completed'
    ) THEN
        RAISE EXCEPTION USING
            ERRCODE = 'P0001',
            MESSAGE = 'INTERVIEW_NOT_COMPLETED';
    END IF;

    IF p_decision = 'skip' THEN
        UPDATE public.projects
           SET status = 'completed'
         WHERE id = p_project_id
         RETURNING * INTO v_project;

        RETURN jsonb_build_object(
            'project', to_jsonb(v_project),
            'charged', FALSE
        );
    END IF;

    IF v_project.credit_charged_at IS NULL THEN
        SELECT app_user.*
          INTO v_user
          FROM public.users AS app_user
         WHERE app_user.id = p_user_id
         FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION USING
                ERRCODE = 'P0002',
                MESSAGE = 'USER_NOT_FOUND';
        END IF;

        v_credit_limit := CASE
            WHEN p_bypass_limit OR v_user.role = 'admin' THEN NULL
            WHEN v_user.plan = 'basic' THEN 10
            WHEN v_user.plan = 'pro' THEN 30
            ELSE 2
        END;

        IF v_credit_limit IS NOT NULL
           AND v_user.credits_used >= v_credit_limit THEN
            RAISE EXCEPTION USING
                ERRCODE = 'P0001',
                MESSAGE = format('CREDIT_LIMIT_EXCEEDED:%s', v_credit_limit);
        END IF;

        UPDATE public.users
           SET credits_used = credits_used + 1
         WHERE id = p_user_id;

        UPDATE public.projects
           SET status = 'designing',
               credit_charged_at = NOW()
         WHERE id = p_project_id
         RETURNING * INTO v_project;

        v_charged := TRUE;
    ELSE
        UPDATE public.projects
           SET status = 'designing'
         WHERE id = p_project_id
         RETURNING * INTO v_project;
    END IF;

    RETURN jsonb_build_object(
        'project', to_jsonb(v_project),
        'charged', v_charged
    );
END;
$$;


-- 과금 RPC는 service_role을 사용하는 백엔드에서만 호출한다.
REVOKE ALL ON FUNCTION public.start_interview_atomic(UUID, UUID, BOOLEAN)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.start_interview_atomic(UUID, UUID, BOOLEAN)
    TO service_role;

REVOKE ALL ON FUNCTION public.set_design_decision_atomic(UUID, UUID, TEXT, BOOLEAN)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_design_decision_atomic(UUID, UUID, TEXT, BOOLEAN)
    TO service_role;


-- 프론트엔드는 인증만 Supabase 클라이언트를 사용하고 모든 업무 데이터 쓰기는
-- 백엔드 API(service_role)를 거친다. 003의 광범위한 테이블 쓰기 권한을 유지하면
-- 브라우저에서 credits_used·프로젝트 상태·차감 도장·세션을 직접 위조할 수 있다.
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public
    FROM anon, authenticated;

-- 이후 추가되는 public 테이블에도 브라우저 직접 쓰기 권한을 자동 부여하지 않는다.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    REVOKE INSERT, UPDATE, DELETE ON TABLES FROM anon, authenticated;
