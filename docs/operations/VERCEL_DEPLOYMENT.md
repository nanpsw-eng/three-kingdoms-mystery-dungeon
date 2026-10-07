# Vercel 배포 / 중단 복구

## 검증된 배포 대상

- Repository: `nanpsw-eng/three-kingdoms-mystery-dungeon`
- Team: `nanpsw-8495` (`team_1HfCVfi0noDdmzHMqGeazpO6`)
- Project name: `three-kingdoms-mystery-dungeon`
- Production branch: `main`
- Framework Preset: Other / `null`
- Root Directory: repository root (비워 둠)
- Install: `npm ci`
- Build: `npm test && npm run build:web`
- Output Directory: `site`
- Node.js: 22.x (기존 CI와 동일)
- 추가 환경변수, 서버, DB, 유료 서비스 활성화 불필요.

`vercel.json`에 설치·빌드·출력 설정을 고정한다. 브라우저 ES module과 에셋은 상대 경로를 쓰므로 별도 base URL 변경이나 전체 SPA rewrite가 필요하지 않다.

## 현재 차단 상태 — 2026-10-07 KST

Vercel 연결 도구로 위 팀의 프로젝트 생성을 시도했으나 `POST /v11/projects`에서 `403 forbidden: You don't have permission to create the project`가 반환됐다. 이름이 일치하는 기존 프로젝트도 없었다. 별도 인증된 CLI가 이 실행환경에 없어 CLI 대체 실행은 불가능했다. **프로젝트 생성 및 Vercel 배포는 완료되지 않았다.**

같은 요청을 반복하지 않는다. 권한이 해결되거나 사용자가 Vercel 대시보드에서 해당 저장소를 Import한 뒤, 팀/프로젝트/커밋을 다시 확인하고 배포 단계부터 재개한다. API 권한 원인은 이 응답만으로 확정할 수 없다.

## 대시보드에서 이어가기

1. 위 팀에서 Add New → Project → 해당 GitHub repository를 Import한다.
2. 루트와 Node.js 설정을 확인한다. `vercel.json`이 빌드 설정을 제공한다.
3. Deploy한다. 새 유료 서비스나 환경변수를 만들지 않는다.
4. 배포 상태 READY와 정확한 commit SHA를 확인한다.
5. 루트 화면, 군주/장수 선택, 원정 시작, 탐험→전투→탐험, 저장 후 새로고침, 초상화/폰트/토큰을 확인한다. 브라우저 console 및 network 오류를 확인한다.
6. 실제 production URL과 결과를 SESSION_HANDOFF에 기록한다.

새 Vercel 도메인은 GitHub Pages와 다른 origin이므로 localStorage 저장 데이터가 자동 이동하지 않는다. 기존 저장 데이터를 삭제하거나 포맷을 변경하지 않는다.

## 기존 Pages와 상태 구분

기존 deploy workflow 성공은 `site/`를 `gh-pages` 브랜치에 올렸다는 뜻이다. 2026-10-07 확인 시 예정 Pages URL은 HTTP 404였다. 서비스 활성화 원인은 미확인이다. 이를 실제 공개 서비스 완료로 기록하지 않는다.

## 복구

Vercel 문제가 나면 마지막 정상 배포로 되돌린다. 배포 설정을 제거하려면 이 변경 PR을 revert한다. 게임 규칙/저장 데이터 migration은 없다. 상세 근거: `docs/reports/RECOVERY_AND_VERCEL_20261007.md`.
