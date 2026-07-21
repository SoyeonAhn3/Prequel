-- ============================================================
-- 011: 설계 결정 + 크레딧 차감 원자화 (BACKLOG BL-022)
-- ============================================================

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

    IF v_project.status = 'completed' THEN
        RETURN jsonb_build_object(
            'project', to_jsonb(v_project),
            'charged', FALSE
        );
    END IF;

    IF p_decision = 'skip' THEN
        UPDATE public.projects
           SET status = 'evaluating'
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

-- 이 RPC는 service_role을 사용하는 백엔드에서만 호출한다.
REVOKE ALL ON FUNCTION public.set_design_decision_atomic(UUID, UUID, TEXT, BOOLEAN)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_design_decision_atomic(UUID, UUID, TEXT, BOOLEAN)
    TO service_role;
