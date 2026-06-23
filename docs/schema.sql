-- =============================================================================
-- 상품 AI 다크팩토리 — 데이터베이스 DDL 스크립트
-- =============================================================================
-- 대상 DBMS : PostgreSQL 15+ (Aurora PostgreSQL / Neon 호환)
-- 작성 기준 : docs/DATABASE_DESIGN.md
-- 식별자    : 상품설계ID(PDID) = 'PD-YYYYMMDD-HHmm'
-- 실행 순서 : 본 파일을 위에서 아래로 순차 실행 (FK 의존성 순 정렬됨)
-- =============================================================================

-- UUID 생성 함수(gen_random_uuid) 사용을 위한 확장
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 멱등 실행을 위해 기존 객체 제거 (개발 환경 전용 — 운영에서는 주석 처리 권장)
DROP TABLE IF EXISTS interface_log              CASCADE;
DROP TABLE IF EXISTS external_interface         CASCADE;
DROP TABLE IF EXISTS calc_rule                  CASCADE;
DROP TABLE IF EXISTS calc_logic                 CASCADE;
DROP TABLE IF EXISTS model_point                CASCADE;
DROP TABLE IF EXISTS model_point_set            CASCADE;
DROP TABLE IF EXISTS conversion_rate            CASCADE;
DROP TABLE IF EXISTS conversion_rate_set        CASCADE;
DROP TABLE IF EXISTS coverage_model_param       CASCADE;
DROP TABLE IF EXISTS coverage_model             CASCADE;
DROP TABLE IF EXISTS assumption_rate            CASCADE;
DROP TABLE IF EXISTS assumption_set             CASCADE;
DROP TABLE IF EXISTS prediction_aggregation     CASCADE;
DROP TABLE IF EXISTS vnb_prediction             CASCADE;
DROP TABLE IF EXISTS model_performance_log       CASCADE;
DROP TABLE IF EXISTS model_shap_importance       CASCADE;
DROP TABLE IF EXISTS prediction_model            CASCADE;
DROP TABLE IF EXISTS training_dataset            CASCADE;
DROP TABLE IF EXISTS training_variable_group     CASCADE;
DROP TABLE IF EXISTS regulatory_document         CASCADE;
DROP TABLE IF EXISTS submitted_simulation        CASCADE;
DROP TABLE IF EXISTS vnb_simulation              CASCADE;
DROP TABLE IF EXISTS profitability_issue         CASCADE;
DROP TABLE IF EXISTS coverage_block              CASCADE;
DROP TABLE IF EXISTS product                     CASCADE;
DROP TABLE IF EXISTS product_category            CASCADE;
DROP TABLE IF EXISTS app_user                    CASCADE;


-- =============================================================================
-- 3.1 공통 코드 / 기준 테이블
-- =============================================================================

-- 사용자 (예약어 회피를 위해 app_user 사용)
CREATE TABLE app_user (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    display_name  VARCHAR(100) NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
COMMENT ON TABLE  app_user              IS '사용자';
COMMENT ON COLUMN app_user.display_name IS '표시 이름 (예: 상품개발팀)';

-- 상품 카테고리
CREATE TABLE product_category (
    id    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code  VARCHAR(40) NOT NULL UNIQUE,
    name  VARCHAR(40) NOT NULL
);
COMMENT ON TABLE  product_category      IS '상품 카테고리';
COMMENT ON COLUMN product_category.name IS '헬스케어보장 / 종신보험 / 연금저축보험 / 기타';


-- =============================================================================
-- 3.2 상품 설계 도메인
-- =============================================================================

-- 상품 (설계/보유 통합)
CREATE TABLE product (
    id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    pdid                 VARCHAR(20)  UNIQUE,
    name                 VARCHAR(120) NOT NULL,
    description          TEXT,
    category_id          UUID         REFERENCES product_category(id),
    owner_id             UUID         REFERENCES app_user(id),
    source_product_id    UUID         REFERENCES product(id),
    is_existing          BOOLEAN      NOT NULL DEFAULT false,
    product_type         VARCHAR(60),
    target_age_group     VARCHAR(20),
    estimated_vnb        BIGINT,
    profitability_status VARCHAR(10)  CHECK (profitability_status IN ('high','medium','low')),
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ,
    CONSTRAINT chk_product_pdid_format
        CHECK (pdid IS NULL OR pdid ~ '^PD-[0-9]{8}-[0-9]{4}$')
);
COMMENT ON TABLE  product                    IS '상품 (설계/보유 통합)';
COMMENT ON COLUMN product.pdid               IS '상품설계ID, PD-YYYYMMDD-HHmm';
COMMENT ON COLUMN product.source_product_id  IS '개선안 원본 상품 (self-reference)';
COMMENT ON COLUMN product.is_existing        IS 'true=보유상품, false=신규설계';

CREATE INDEX idx_product_owner    ON product(owner_id);
CREATE INDEX idx_product_category ON product(category_id);
CREATE INDEX idx_product_source   ON product(source_product_id);

-- 담보 블록
CREATE TABLE coverage_block (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID         NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    type            VARCHAR(10)  NOT NULL CHECK (type IN ('main','rider','waiver')),
    name            VARCHAR(120) NOT NULL,
    coverage_amount BIGINT,
    age_min         SMALLINT,
    age_max         SMALLINT,
    display_order   SMALLINT
);
COMMENT ON TABLE  coverage_block      IS '담보 블록';
COMMENT ON COLUMN coverage_block.type IS 'main=주계약 / rider=특약 / waiver=납입면제';

CREATE INDEX idx_coverage_product ON coverage_block(product_id);


-- =============================================================================
-- 3.3 수익성 분석 도메인
-- =============================================================================

-- 수익성 이슈 / 개선 권고
CREATE TABLE profitability_issue (
    id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id         UUID         NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    factor             VARCHAR(40)  NOT NULL,
    severity           VARCHAR(10)  CHECK (severity IN ('high','medium','low')),
    description        TEXT,
    impact             NUMERIC(10,2),
    recommendation     TEXT,
    is_recommendation  BOOLEAN      NOT NULL DEFAULT false,
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT now()
);
COMMENT ON TABLE  profitability_issue                   IS '수익성 이슈 / 개선 권고';
COMMENT ON COLUMN profitability_issue.factor            IS '위험률/사업비/해지율/할인율 등';
COMMENT ON COLUMN profitability_issue.impact            IS 'VNB 영향도 (억원)';
COMMENT ON COLUMN profitability_issue.is_recommendation IS 'true=개선안에 전달된 권고';

CREATE INDEX idx_issue_product ON profitability_issue(product_id);

-- VNB 시뮬레이션 이력
CREATE TABLE vnb_simulation (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id    UUID         NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    simulation_id VARCHAR(40)  NOT NULL,
    scenario_type VARCHAR(20)  CHECK (scenario_type IN ('base','conservative','aggressive','custom')),
    risk_rate     NUMERIC(6,3),
    expense       NUMERIC(6,3),
    lapse_rate    NUMERIC(6,3),
    discount_rate NUMERIC(6,3),
    premium       BIGINT,
    vnb           NUMERIC(14,2),
    margin_rate   NUMERIC(6,3),
    is_baseline   BOOLEAN      DEFAULT false,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
COMMENT ON TABLE  vnb_simulation             IS 'VNB 시뮬레이션 이력';
COMMENT ON COLUMN vnb_simulation.is_baseline IS 'Original 기준값 여부';

CREATE INDEX idx_sim_product ON vnb_simulation(product_id);
CREATE INDEX idx_sim_created ON vnb_simulation(created_at);

-- 확정 제출 시뮬레이션
CREATE TABLE submitted_simulation (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id    UUID         NOT NULL UNIQUE REFERENCES product(id) ON DELETE CASCADE,
    simulation_id VARCHAR(40)  NOT NULL,
    risk_rate     NUMERIC(6,3),
    expense       NUMERIC(6,3),
    lapse_rate    NUMERIC(6,3),
    discount_rate NUMERIC(6,3),
    premium       BIGINT,
    vnb           NUMERIC(14,2),
    margin_rate   NUMERIC(6,3),
    submitted_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
COMMENT ON TABLE  submitted_simulation IS '확정 제출 시뮬레이션 (상품당 1건)';


-- =============================================================================
-- 3.4 규제 문서 도메인
-- =============================================================================

CREATE TABLE regulatory_document (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id    UUID         NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    document_type VARCHAR(40)  NOT NULL,
    version       VARCHAR(10)  DEFAULT 'v1.0',
    status        VARCHAR(20)  CHECK (status IN
                      ('pending','generating','draft','review_needed','calculated','passed','submitted')),
    ai_generated  BOOLEAN      NOT NULL DEFAULT true,
    content       JSONB,
    progress      SMALLINT     DEFAULT 0,
    submitted     BOOLEAN      DEFAULT false,
    generated_at  TIMESTAMPTZ,
    submitted_at  TIMESTAMPTZ,
    CONSTRAINT uq_doc_product_type_version UNIQUE (product_id, document_type, version)
);
COMMENT ON TABLE  regulatory_document               IS '자동 생성 규제 문서';
COMMENT ON COLUMN regulatory_document.document_type IS '사업방법서/보험약관/상품설명서/보험료율 산출서/계리검증 보고서';

CREATE INDEX idx_doc_product ON regulatory_document(product_id);
CREATE INDEX idx_doc_type    ON regulatory_document(document_type);


-- =============================================================================
-- 3.5 VNB Assistant — ML 파이프라인 도메인
-- =============================================================================

-- 학습용 설명변수 그룹
CREATE TABLE training_variable_group (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    category       VARCHAR(40) NOT NULL,
    variable_count INTEGER     NOT NULL,
    fields         TEXT,
    sync_type      VARCHAR(10) CHECK (sync_type IN ('정기배치','실시간')),
    status         VARCHAR(10) CHECK (status IN ('active','syncing','error')),
    last_synced_at TIMESTAMPTZ
);
COMMENT ON TABLE  training_variable_group          IS '학습용 설명변수 그룹';
COMMENT ON COLUMN training_variable_group.category IS 'VNB결산정보/계약가입속성/상품정보/환산정보/최적가정/최소보험료';

-- 학습용 데이터셋
CREATE TABLE training_dataset (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(120) NOT NULL,
    source       VARCHAR(40),
    row_count    BIGINT,
    period_month VARCHAR(10),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
COMMENT ON TABLE  training_dataset        IS '학습용 데이터셋';
COMMENT ON COLUMN training_dataset.source IS '생성 출처 (예: VNB산출 엑셀)';

-- 예측 모델
CREATE TABLE prediction_model (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    model_code          VARCHAR(40)  NOT NULL UNIQUE,
    name                VARCHAR(120) NOT NULL,
    training_dataset_id UUID         REFERENCES training_dataset(id),
    unit                VARCHAR(20)  CHECK (unit IN ('증번단위','보종단위')),
    algorithm           VARCHAR(40),
    accuracy            NUMERIC(5,2),
    r2                  NUMERIC(5,3),
    hyperparameters     JSONB,
    preprocessing       JSONB,
    status              VARCHAR(20)  CHECK (status IN ('운영중','재학습중','검증중','폐기')),
    last_trained_at     DATE
);
COMMENT ON TABLE  prediction_model                 IS '예측 모델';
COMMENT ON COLUMN prediction_model.model_code      IS '모델 코드 (예: M-CANCER-001)';
COMMENT ON COLUMN prediction_model.hyperparameters IS '하이퍼파라미터 (재현용)';
COMMENT ON COLUMN prediction_model.preprocessing   IS '전처리 로직 메타 (재현용)';

CREATE INDEX idx_model_status ON prediction_model(status);

-- SHAP 변수 중요도
CREATE TABLE model_shap_importance (
    id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id  UUID        NOT NULL REFERENCES prediction_model(id) ON DELETE CASCADE,
    variable  VARCHAR(40) NOT NULL,
    impact    NUMERIC(5,3)
);
COMMENT ON TABLE model_shap_importance IS 'SHAP 변수 중요도';

CREATE INDEX idx_shap_model ON model_shap_importance(model_id);

-- 모델 성능 모니터링
CREATE TABLE model_performance_log (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id          UUID         NOT NULL REFERENCES prediction_model(id) ON DELETE CASCADE,
    measured_at       DATE         NOT NULL,
    rmse              NUMERIC(8,3),
    mape              NUMERIC(6,3),
    r2                NUMERIC(5,3),
    retrain_triggered BOOLEAN      DEFAULT false
);
COMMENT ON TABLE  model_performance_log                   IS '모델 성능 모니터링';
COMMENT ON COLUMN model_performance_log.retrain_triggered IS '재학습 트리거 발생 여부';

CREATE INDEX idx_perf_model_date ON model_performance_log(model_id, measured_at);

-- 예측 결과 저장 (예측결과저장DB)
CREATE TABLE vnb_prediction (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_code VARCHAR(40)  NOT NULL,
    model_id        UUID         NOT NULL REFERENCES prediction_model(id),
    product_id      UUID         REFERENCES product(id),
    product_label   VARCHAR(120),
    channel         VARCHAR(20),
    gender          VARCHAR(4),
    age             SMALLINT,
    coverage_amount BIGINT,
    mp_count        INTEGER,
    predicted_vnb   NUMERIC(14,2),
    predicted_ape   NUMERIC(14,2),
    margin_rate     NUMERIC(6,3),
    predicted_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    -- 보종/MIX 단위 예측(product_id NULL)인 경우 product_label 필수
    CONSTRAINT chk_pred_label_required
        CHECK (product_id IS NOT NULL OR product_label IS NOT NULL)
);
COMMENT ON TABLE  vnb_prediction                 IS '예측 결과 저장 (예측결과저장DB)';
COMMENT ON COLUMN vnb_prediction.prediction_code IS '예측 표시 코드 (예: PRED-0612-001)';
COMMENT ON COLUMN vnb_prediction.mp_count        IS 'MP DB 건수';

CREATE INDEX idx_pred_model   ON vnb_prediction(model_id);
CREATE INDEX idx_pred_product ON vnb_prediction(product_id);
CREATE INDEX idx_pred_channel ON vnb_prediction(channel);

-- 예측 집계 결과
CREATE TABLE prediction_aggregation (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregation_unit VARCHAR(20)  CHECK (aggregation_unit IN ('증번','보종','상품','MIX','채널')),
    unit_key         VARCHAR(60)  NOT NULL,
    forecast_vnb     NUMERIC(14,2),
    settlement_vnb   NUMERIC(14,2),
    period           VARCHAR(20),
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);
COMMENT ON TABLE  prediction_aggregation                IS '예측 집계 결과';
COMMENT ON COLUMN prediction_aggregation.settlement_vnb IS '결산 VNB (비교 기준)';

CREATE INDEX idx_agg_unit ON prediction_aggregation(aggregation_unit, unit_key);


-- =============================================================================
-- 3.6 기초율·산출기반 도메인 (Actuarial Basis)
--     PV/VNB 산출에 필요한 모든 구성 DB.
--     모든 기준 테이블은 version + effective_from/to 로 시점 재현 가능,
--     source_system 으로 내부 계약/결산 시스템 연계 출처 식별.
-- =============================================================================

-- 기초율 집합 (위험률/이율/사업비/해지율 DB)
CREATE TABLE assumption_set (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    assumption_type VARCHAR(20)  NOT NULL CHECK (assumption_type IN ('risk','interest','expense','lapse')),
    name            VARCHAR(120) NOT NULL,
    version         VARCHAR(20)  NOT NULL,
    effective_from  DATE         NOT NULL,
    effective_to    DATE,
    source_system   VARCHAR(40),
    status          VARCHAR(10)  CHECK (status IN ('active','draft','archived')),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT uq_assumption_type_version UNIQUE (assumption_type, version)
);
COMMENT ON TABLE  assumption_set                 IS '기초율 집합 (위험률/이율/사업비/해지율 DB)';
COMMENT ON COLUMN assumption_set.assumption_type IS 'risk=위험률 / interest=이율 / expense=사업비 / lapse=해지율';
COMMENT ON COLUMN assumption_set.source_system   IS '연계 출처 시스템 (계리/결산)';

CREATE INDEX idx_assumption_eff ON assumption_set(assumption_type, effective_from, effective_to);

-- 기초율 세부 율값
CREATE TABLE assumption_rate (
    id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    assumption_set_id UUID          NOT NULL REFERENCES assumption_set(id) ON DELETE CASCADE,
    key_code          VARCHAR(60)   NOT NULL,
    gender            VARCHAR(4),
    age               SMALLINT,
    duration          SMALLINT,
    rate_value        NUMERIC(12,8) NOT NULL
);
COMMENT ON TABLE  assumption_rate          IS '기초율 세부 율값 (성별/연령/경과기간별)';
COMMENT ON COLUMN assumption_rate.key_code IS '율 키 (성별-연령-경과기간 조합 코드)';
COMMENT ON COLUMN assumption_rate.duration IS '경과기간(년)';

CREATE INDEX idx_arate_set ON assumption_rate(assumption_set_id);
CREATE INDEX idx_arate_key ON assumption_rate(assumption_set_id, key_code);

-- 담보모델링 DB
CREATE TABLE coverage_model (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    coverage_code     VARCHAR(40)  NOT NULL,
    name              VARCHAR(120) NOT NULL,
    version           VARCHAR(20)  NOT NULL,
    effective_from    DATE         NOT NULL,
    effective_to      DATE,
    benefit_structure JSONB,
    source_system     VARCHAR(40),
    CONSTRAINT uq_coverage_code_version UNIQUE (coverage_code, version)
);
COMMENT ON TABLE  coverage_model                   IS '담보모델링 DB';
COMMENT ON COLUMN coverage_model.benefit_structure IS '급부 구조 정의 (JSON)';

CREATE INDEX idx_covmodel_code ON coverage_model(coverage_code);

-- 담보모델 파라미터
CREATE TABLE coverage_model_param (
    id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    coverage_model_id UUID          NOT NULL REFERENCES coverage_model(id) ON DELETE CASCADE,
    param_code        VARCHAR(60)   NOT NULL,
    param_value       NUMERIC(16,6),
    unit              VARCHAR(20)
);
COMMENT ON TABLE coverage_model_param IS '담보모델 산출 파라미터';

CREATE INDEX idx_covparam_model ON coverage_model_param(coverage_model_id);

-- 환산율 집합 (환산율 DB)
CREATE TABLE conversion_rate_set (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(120) NOT NULL,
    version        VARCHAR(20)  NOT NULL UNIQUE,
    effective_from DATE         NOT NULL,
    effective_to   DATE,
    source_system  VARCHAR(40)
);
COMMENT ON TABLE conversion_rate_set IS '환산율 집합 (환산율 DB)';

-- 환산율 세부값
CREATE TABLE conversion_rate (
    id                     UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    conversion_rate_set_id UUID         NOT NULL REFERENCES conversion_rate_set(id) ON DELETE CASCADE,
    product_type           VARCHAR(60),
    payment_term           VARCHAR(20),
    channel                VARCHAR(20),
    rate_value             NUMERIC(8,5) NOT NULL
);
COMMENT ON TABLE conversion_rate IS '환산율 세부값 (상품유형/납입기간/채널별)';

CREATE INDEX idx_convrate_set ON conversion_rate(conversion_rate_set_id);

-- 모델포인트 집합 (MP DB)
CREATE TABLE model_point_set (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(120) NOT NULL,
    product_id    UUID         REFERENCES product(id) ON DELETE SET NULL,
    origin        VARCHAR(20)  NOT NULL CHECK (origin IN ('generated','settlement','policy')),
    source_system VARCHAR(40),
    period_yyyymm VARCHAR(10),
    row_count     BIGINT,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    -- 과거 결산/계약 정보 적재 시 출처/시점 필수
    CONSTRAINT chk_mpset_origin_source
        CHECK (origin = 'generated' OR (source_system IS NOT NULL AND period_yyyymm IS NOT NULL))
);
COMMENT ON TABLE  model_point_set        IS '모델포인트 집합 (MP DB)';
COMMENT ON COLUMN model_point_set.origin IS 'generated=가입가능범위 전개 / settlement=결산적재 / policy=계약적재';

CREATE INDEX idx_mpset_product ON model_point_set(product_id);
CREATE INDEX idx_mpset_origin  ON model_point_set(origin);

-- 모델포인트 (계약가입조건). 데이터량이 크므로 set 기준 파티셔닝 권장.
CREATE TABLE model_point (
    id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    model_point_set_id UUID         NOT NULL REFERENCES model_point_set(id) ON DELETE CASCADE,
    channel            VARCHAR(20),
    gender             VARCHAR(4),
    issue_age          SMALLINT,
    payment_term       VARCHAR(20),
    coverage_term      VARCHAR(20),
    coverage_amount    BIGINT,
    premium            NUMERIC(14,2),
    policy_count       INTEGER      DEFAULT 1
);
COMMENT ON TABLE  model_point              IS '모델포인트 (계약가입조건)';
COMMENT ON COLUMN model_point.policy_count IS '계약 건수 (결산 적재 시 집계 단위)';

CREATE INDEX idx_mp_set     ON model_point(model_point_set_id);
CREATE INDEX idx_mp_channel ON model_point(model_point_set_id, channel);

-- 산출 로직 (로직별 DB화: 기간 및 코드정의)
CREATE TABLE calc_logic (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    logic_code     VARCHAR(40)  NOT NULL,
    name           VARCHAR(120) NOT NULL,
    version        VARCHAR(20)  NOT NULL,
    effective_from DATE         NOT NULL,
    effective_to   DATE,
    description    TEXT,
    CONSTRAINT uq_calclogic_code_version UNIQUE (logic_code, version)
);
COMMENT ON TABLE  calc_logic            IS '산출 로직 (로직별 DB화: 기간 및 코드정의)';
COMMENT ON COLUMN calc_logic.logic_code IS '로직 코드 (예: PV-CASHFLOW)';

CREATE INDEX idx_calclogic_code ON calc_logic(logic_code);

-- 산출 룰 (룰 DB화)
CREATE TABLE calc_rule (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    calc_logic_id UUID        NOT NULL REFERENCES calc_logic(id) ON DELETE CASCADE,
    rule_code     VARCHAR(60) NOT NULL,
    expression    TEXT        NOT NULL,
    apply_order   SMALLINT,
    enabled       BOOLEAN     DEFAULT true
);
COMMENT ON TABLE  calc_rule            IS '산출 룰 (룰 DB화)';
COMMENT ON COLUMN calc_rule.expression IS '룰 수식/표현';

CREATE INDEX idx_calcrule_logic ON calc_rule(calc_logic_id);

-- 외부 시스템 연계 정의 (계약/결산 시스템)
CREATE TABLE external_interface (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    interface_code VARCHAR(40)  NOT NULL UNIQUE,
    name           VARCHAR(120) NOT NULL,
    source_system  VARCHAR(40)  NOT NULL,
    direction      VARCHAR(10)  CHECK (direction IN ('inbound','outbound')),
    sync_type      VARCHAR(10)  CHECK (sync_type IN ('정기배치','실시간')),
    schedule       VARCHAR(60),
    target_table   VARCHAR(60),
    enabled        BOOLEAN      DEFAULT true
);
COMMENT ON TABLE  external_interface               IS '외부 시스템 연계 정의 (계약/결산 시스템)';
COMMENT ON COLUMN external_interface.source_system IS '연계 대상 시스템 (계약/결산)';
COMMENT ON COLUMN external_interface.schedule      IS '배치 스케줄 (cron 등)';

-- 연계 실행 로그
CREATE TABLE interface_log (
    id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    external_interface_id UUID        NOT NULL REFERENCES external_interface(id) ON DELETE CASCADE,
    started_at            TIMESTAMPTZ NOT NULL,
    finished_at           TIMESTAMPTZ,
    status                VARCHAR(10) CHECK (status IN ('success','failed','running')),
    row_count             BIGINT,
    message               TEXT
);
COMMENT ON TABLE interface_log IS '연계 실행 로그 (정합성/재처리 추적)';

CREATE INDEX idx_iflog_if ON interface_log(external_interface_id, started_at);

-- 시뮬레이션의 기초율/산출로직 버전 추적 (과거 시점 재현용, 선택적 연결)
-- 기준 테이블이 생성된 후 FK 컬럼을 추가한다.
ALTER TABLE vnb_simulation
    ADD COLUMN IF NOT EXISTS assumption_set_id UUID REFERENCES assumption_set(id),
    ADD COLUMN IF NOT EXISTS calc_logic_id     UUID REFERENCES calc_logic(id);
COMMENT ON COLUMN vnb_simulation.assumption_set_id IS '적용 기초율 집합 (시점 재현용)';
COMMENT ON COLUMN vnb_simulation.calc_logic_id     IS '적용 산출 로직 버전 (시점 재현용)';

CREATE INDEX IF NOT EXISTS idx_sim_assumption ON vnb_simulation(assumption_set_id);
CREATE INDEX IF NOT EXISTS idx_sim_calclogic  ON vnb_simulation(calc_logic_id);


-- =============================================================================
-- 4. 비즈니스 규칙 — 트리거
-- =============================================================================

-- 4.5 재학습 트리거: model_performance_log.retrain_triggered = true 가 되면
--     해당 prediction_model.status 를 '재학습중' 으로 전이
CREATE OR REPLACE FUNCTION fn_trigger_model_retrain()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.retrain_triggered IS TRUE THEN
        UPDATE prediction_model
           SET status = '재학습중'
         WHERE id = NEW.model_id
           AND status <> '폐기';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_model_retrain
    AFTER INSERT OR UPDATE OF retrain_triggered ON model_performance_log
    FOR EACH ROW
    EXECUTE FUNCTION fn_trigger_model_retrain();

-- 4.x product.updated_at 자동 갱신
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_product_updated_at
    BEFORE UPDATE ON product
    FOR EACH ROW
    EXECUTE FUNCTION fn_set_updated_at();

-- =============================================================================
-- DDL 끝
-- =============================================================================
