# AI Kickoff Program — Slate Blue UI

13개 화면의 React/JSX 프로토타입 (슬레이트 블루 팔레트).

## 파일 구조

```
slate/
├── screens.jsx            ← 디자인 시스템 (팔레트 P, Btn, Tag, Frame, Logo)
├── design-canvas.jsx      ← 캔버스 래퍼 (실제 앱에선 불필요, 삭제 가능)
│
├── screen-landing.jsx     ← 01 랜딩
├── screen-login.jsx       ← 02 로그인
├── screen-projects.jsx    ← 03 프로젝트 목록
├── screen-interview.jsx   ← 04 인터뷰 채팅
├── screen-result.jsx      ← 05-1 ~ 05-6 결과 뷰어 (6개 섹션 모두 포함)
├── screen-admin.jsx       ← 06 Admin
└── screen-misc.jsx        ← 07 가이드 + 08 공지사항
```

## 컴포넌트 export 목록

각 파일은 `window.XXX = ...` 형태로 전역 등록되어 있습니다. React 앱으로 옮길 땐 `export` 키워드로 바꿔주세요.

| 파일 | 내보내는 컴포넌트 |
|---|---|
| screen-landing.jsx | `ScreenLanding` |
| screen-login.jsx | `ScreenLogin` |
| screen-projects.jsx | `ScreenProjects` |
| screen-interview.jsx | `ScreenInterview` |
| screen-result.jsx | `ScreenResultProfile`, `ScreenResultArchitecture`, `ScreenResultData`, `ScreenResultEdgeCases`, `ScreenResultEvaluation`, `ScreenResultDefinitionOfDone` |
| screen-admin.jsx | `ScreenAdmin` |
| screen-misc.jsx | `ScreenGuide`, `ScreenAnnouncements` |

## 팔레트 (screens.jsx 상단)

```jsx
const P = {
  bg: '#f8f9fb',           // 페이지 배경
  surface: '#ffffff',       // 카드·표 배경
  surfaceAlt: '#eff1f5',    // 보조 영역
  border: '#e2e5eb',        // 기본 보더
  borderStrong: '#c8cdd6',  // 강조 보더
  text: '#1c1f26',          // 본문
  textMuted: '#5a6170',     // 설명
  textSubtle: '#8b93a3',    // 메타
  accent: '#4a6b8a',        // 메인 액센트 (슬레이트 블루)
  accentSoft: '#e6edf3',
  accentDeep: '#2f4a64',
  amber: '#c08a3e',         // 경고
  amberSoft: '#f1e4cd',
  green: '#4a8264',         // 성공
  greenSoft: '#e3ede7',
  red: '#a85648',           // 오류
  redSoft: '#efddd7',
};
```

## 라우트 매핑 (React Router 권장)

```
/                              → ScreenLanding
/login                         → ScreenLogin
/projects                      → ScreenProjects
/projects/:id/interview        → ScreenInterview
/projects/:id/result/profile        → ScreenResultProfile
/projects/:id/result/architecture   → ScreenResultArchitecture
/projects/:id/result/data           → ScreenResultData
/projects/:id/result/edge-cases     → ScreenResultEdgeCases
/projects/:id/result/evaluation     → ScreenResultEvaluation
/projects/:id/result/done           → ScreenResultDefinitionOfDone
/admin                         → ScreenAdmin
/guide                         → ScreenGuide
/announcements                 → ScreenAnnouncements
```

> `screen-result.jsx`의 `ResultShell`은 공통 레이아웃입니다. React Router의 `<Outlet>`으로 변환해서 6개 섹션을 자식 라우트로 두면 깔끔합니다.

## AI 코드 어시스턴트에게 줄 프롬프트 (참고)

> 첨부한 JSX 파일들은 **React 프로토타입**입니다. 각 `Screen*` 컴포넌트가 하나의 페이지에 해당합니다.
>
> 다음 조건으로 **실제 동작하는 React 앱**으로 변환해주세요:
> - **빌드**: Vite + TypeScript
> - **라우팅**: React Router v6 (위 라우트 매핑 참고)
> - **스타일**: 인라인 style 객체는 유지하되, `screens.jsx`의 `P` 팔레트를 `theme.ts`로 분리
> - **상태**: Zustand로 user / projects / current session 관리
> - **API**: `src/api/` 폴더에 함수만 만들고, mock 응답으로 시작
> - **하드코딩 데이터**(프로젝트 목록, 메시지 등)는 `src/mocks/` 폴더로 분리
> - `window.XXX` 전역 등록은 모두 `export` 로 변환
> - `screen-result.jsx`의 `ResultShell`은 `<Outlet>` 기반 레이아웃 라우트로

## 의존성

- React 18
- (선택) Pretendard 폰트 — 한국어 가독성용
- (선택) JetBrains Mono 폰트 — 메타데이터·숫자용

## 의도적으로 유지한 부분

- **Google·GitHub OAuth 버튼의 브랜드 색상** — 브랜드 식별성이 우선이라 팔레트와 무관하게 원본 색상 유지

## 화면별 특이사항

- **결과 뷰어 6개 섹션**은 동일한 `ResultShell`(좌측 TOC + 헤더)을 공유합니다. 본문만 다릅니다.
- **인터뷰 화면**은 좌측 진행률 패널 + 가운데 채팅 + 입력창 구조입니다.
- **Admin 대시보드**는 좌측 사이드바 + KPI 4개 + 토큰 사용 차트 + 사용자 표 구조입니다.
