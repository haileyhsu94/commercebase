# CommerceBase — Work In Progress

> 현재 작업 중 스냅샷. 세션 재개 시 여기 먼저 읽기.
> Last updated: 2026-04-21 (afternoon)

---

## 구현 완료 (이번 세션)

### Milestone A — Frontend ↔ Backend wiring ✅
- `frontend/src/lib/api/client.ts` — axios + Bearer token interceptor + 401 auto-redirect
- `frontend/src/lib/api/auth.ts`, `auth/campaigns.ts` — API 모듈
- `frontend/src/contexts/AuthContext.tsx` — 로그인 상태 + 토큰 부트스트랩
- `frontend/src/components/auth/ProtectedRoute.tsx` — 미인증 시 /login 리다이렉트
- `frontend/src/pages/auth/Login.tsx` — 이메일/패스워드 로그인 폼
- `frontend/src/hooks/api/useCampaigns.ts` — React Query 훅 (list/detail/create/launch/pause/resume/delete)
- `CampaignList.tsx`, `CampaignDetail.tsx`, `CampaignCreate.tsx` 모두 API 사용으로 전환
- `main.tsx` — QueryClientProvider + AuthProvider 래핑
- 데모 계정: `demo@commercebase.com / password` (cb:seed-advertiser 로 시드)

### Milestone C — CampaignExecution state machine ✅
- `backend/app/Models/CampaignExecution.php`
- 공통 상태: `pending_creation → creating → pending_review → active ⇄ paused → ended / failed`
- `transitionTo()` + `state_history` 배열에 전이 로그 append
- `markFailed(reason)` + `syncExternalStatus(external, config)` 헬퍼
- Resource에 `allocationWeight`, `currency`, `stateHistory`, timestamps 추가

### Milestone B — BudgetAllocator ✅
- `backend/config/budget_presets.php` — 5 goal × 5 channel 매트릭스. `enabled_channels=['open_web']`로 v1 제한 (주석에 다른 채널도 남김)
- `backend/app/Services/Budget/BudgetAllocator.php` — goal 매핑 + enabled 필터링 + 비율 재정규화
- `backend/app/Services/Campaign/CampaignService.php::launch()` — allocator 호출 → execution 생성 → `CreateChannelExecutionJob` dispatch. pause/resume도 execution 전파
- `backend/app/Jobs/Channels/CreateChannelExecutionJob.php` — registry에서 adapter 찾아 위임, 없으면 failed 처리
- `backend/app/Services/Channels/ChannelAdapterRegistry.php` — singleton, adapter 등록/조회
- `ChannelAdapterInterface` signature 변경: `createExecution(Campaign, float)` → `createExecution(CampaignExecution)` (이미 allocator가 생성한 것을 받음)

---

## 남은 작업

### 🔜 Milestone E — Reporting schema + Analytics APIs
프론트 `analytics-mock.ts` 기준으로 5개 대시보드 (Performance / Channels / Products / Regions / Audiences).

**Schema 제안:**
```
cb_performance_daily (채널 중립)
  - campaign_id, execution_id, channel, date
  - impressions, clicks, conversions, spend, revenue, currency

cb_performance_raw_{channel} (채널별 원본, viewability/frequency 등 채널 고유 지표)
```

**API endpoints 매핑:**
- `GET /api/v1/analytics/overview?range=7d`
- `GET /api/v1/analytics/channels?range=7d`
- `GET /api/v1/analytics/products?range=7d`
- `GET /api/v1/analytics/regions?range=7d`
- `GET /api/v1/analytics/audiences?range=7d`

ETL: `IngestDailyClicksStatsJob` (nightly) → raw 저장 → aggregate → performance_daily.

### ✅ Milestone D — DailyClicks 채널 어댑터 (확장성 설계)
**아키텍처:** `DailyClicksAdapter`가 `DailyClicksDriverInterface`에 위임 → driver 스왑 가능.

- `backend/app/Services/Channels/DailyClicks/`
  - `DailyClicksAdapter.php` — ChannelAdapterInterface 구현. 상태 전이 + 에러 처리 + external_status 매핑
  - `DailyClicksDriverInterface.php` — create/activate/pause/updateBudget/fetchStats 계약
  - `DailyClicksDriverFactory.php` — config 기반 driver 인스턴스화
  - `Driver/LogOnlyDriver.php` — dev 기본, no-op + 로그 (종단 테스트 통과)
  - `Driver/BrowserDriver.php` — Node 워커 subprocess 호출
  - `Driver/AdvApiDriver.php` — 기존 /adv/* HTTP API 스텁
  - `Driver/PartnerApiDriver.php` — Denis Partner API placeholder
- `backend/config/channels.php` — driver 선택 + 크리덴셜
- `.env`: `DAILYCLICKS_DRIVER=log_only` 기본. `browser` / `adv_api`로 전환

**Node 워커:** `dailyclicks-worker/`
- stdin JSON → action 라우팅 → stdout JSON
- Playwright 세션 관리, 로그인 쿠키 `.dailyclicks-session.json`
- Phase 0 scaffolding 완료. Phase 1: 실제 DOM 확인 후 selector 채우기 필요
- 설치: `npm install && npx playwright install chromium && npm run build`

**다른 채널 확장 방법:**
1. `app/Services/Channels/<Channel>/` 폴더에 Adapter + DriverInterface + Driver들 생성
2. `config/channels.php`에 채널 엔트리 추가
3. `AppServiceProvider::boot()`에 `registry->register()` 한 줄 추가

### 📝 DailyClicks 팀 협의 완료 (Denis)
- Bid strategy: Target CPA only (v1), Max Conversions/Target ROAS 다음
- Conversion: S2S postback from CommerceBase → DailyClicks (우리가 추적, 광고주 사이트에 DC 픽셀 안 심음)
- Goals: Sales/Leads/Traffic/App/Local Visits 매핑
- Defaults/optimizer: SSP/FC/day parting은 DC 쪽. CommerceBase는 budget + targeting + creatives만 제어
- 예산 daily 업데이트 API 필요 (Phase 2 대비 미리 예고)

---

## 실행 상태

```bash
# Backend
cd backend && php artisan serve --port=8000

# Frontend
cd frontend && npm run dev    # http://localhost:5173

# Demo advertiser
php artisan cb:seed-advertiser
# → demo@commercebase.com / password
```

---

## 다음 세션 복귀 체크리스트

1. 백엔드 서버 재기동 확인 (`curl localhost:8000/api/health`)
2. 프론트 로그인 동작 확인
3. E 또는 D 착수 — 사용자가 정한 순서대로
