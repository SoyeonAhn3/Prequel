-- ============================================================
-- 010: 프로젝트별 크레딧 결제 도장 (credit_charged_at)
-- BACKLOG BL-006 ③ — 설계(How) 재진입 시 중복 차감 방지.
-- 크레딧은 프로젝트가 설계에 처음 진입할 때 1회만 차감되며,
-- 이 컬럼이 채워진 뒤에는 재진입해도 검사·차감을 건너뛴다.
-- ============================================================

-- 1. 결제 도장 컬럼 추가 (NULL = 아직 미차감)
ALTER TABLE public.projects
    ADD COLUMN IF NOT EXISTS credit_charged_at TIMESTAMPTZ;

-- 2. 백필: 현재 '설계 중'인 기존 프로젝트는 이미 크레딧을 소진한 것으로 간주
--    (재진입 시 이중 차감되지 않도록). 'evaluating'(설계 스킵)은 미차감이라 제외,
--    'completed'는 design-decision API가 early-return 으로 이미 보호됨.
UPDATE public.projects
    SET credit_charged_at = updated_at
    WHERE credit_charged_at IS NULL AND status = 'designing';
