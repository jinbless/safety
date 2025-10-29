# 산업재해 예방 안전관리 앱 설정 가이드

## 1. OpenAI API 키 설정

### API 키 발급
1. [OpenAI Platform](https://platform.openai.com)에 로그인
2. API Keys 메뉴로 이동
3. "Create new secret key" 클릭
4. API 키 복사 (한 번만 표시됨)

### 환경 변수 설정
1. 프로젝트 루트의 `.env` 파일 열기
2. API 키 설정:
```env
VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
```

**⚠️ 중요**: `.env` 파일은 절대 Git에 커밋하지 마세요!

## 2. 의존성 설치

```bash
npm install
```

새로 추가된 패키지:
- `openai`: OpenAI API 클라이언트

## 3. 앱 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 4. 분석 프로세스

### 7단계 AI 분석 프로세스

1. **GPT 위험요소 분석**
   - 사진 또는 작업내용 분석
   - 38개 위험요소 중 최대 5개 선택

2. **위험요소 ID 매칭**
   - `master_위험요소.json`에서 ID 찾기

3. **유해위험요인항목 조회**
   - `relationships.json`으로 관련 항목 찾기
   - 중복 제거하여 unique 리스트 생성

4. **GPT 필터링**
   - 유해위험요인항목 리스트를 GPT에 전송
   - 작업과 관련 있는 항목만 선택

5. **대책 찾기**
   - 위험요소 + 유해위험요인항목 AND 조건
   - `master_대책.json`에서 매칭되는 대책 찾기

6. **전체 데이터 수집**
   - `relationships.json`으로 완전 매칭 데이터 찾기
   - 업종, 작업공정, 위험요인 정보 포함

7. **결과 표시**
   - 조치방법 탭에 결과 표시
   - 권장 안전 조치사항 리스트
   - 상세 위험 분석 정보

## 5. 사용 방법

### 기본 사용
1. **위험요소 분석** 탭으로 이동
2. 작업 현장 사진 업로드 (선택사항)
3. 작업 내용 또는 질문 입력
4. "위험요소 분석" 버튼 클릭
5. 결과 확인 (조치방법 탭)

### 결과 해석
- **식별된 위험요소**: GPT가 선택한 위험 요소
- **권장 안전 조치사항**: 적용 가능한 대책 리스트
- **상세 위험 분석 정보**: 업종, 작업공정, 위험요인 등 상세 정보

## 6. 데이터 구조

### JSON 파일 위치
- `/output/master_*.json`: 마스터 데이터 (업종, 위험요소 등)
- `/output/relationships.json`: 관계 데이터 (32,214건)
- `/output/metadata.json`: 메타데이터

### 데이터 통계
- 업종: 298개
- 작업공정: 2,453개
- 위험요인: 6개
- 위험요소: 38개
- 유해위험요인항목: 4,245개
- 대책: 1,479개

## 7. 문제 해결

### API 키 오류
```
Error: 위험요소 분석에 실패했습니다. API 키를 확인해주세요.
```
→ `.env` 파일의 `VITE_OPENAI_API_KEY` 확인

### 데이터 로드 오류
```
Error: 안전 데이터를 불러오는 데 실패했습니다.
```
→ `/output` 폴더의 JSON 파일들이 있는지 확인

### 분석 결과 없음
- 더 구체적인 작업 내용 입력
- 사진 추가 업로드
- 다른 표현으로 재시도

## 8. 개발자 모드

디버깅 정보를 보려면 브라우저 콘솔 확인:
```javascript
// analysisService.ts에서 debug: true 설정됨
console.log(result.debug);
```

출력 정보:
- step1_gptRisks: GPT가 선택한 위험요소
- step2_riskIds: 위험요소 ID 리스트
- step3_allHazardItemIds: 모든 유해위험요인항목 ID
- step4_filteredHazardItems: 필터링된 항목
- step5_actionIds: 대책 ID 리스트

## 9. 보안 주의사항

⚠️ **클라이언트 사이드 API 호출**
- 현재 브라우저에서 직접 OpenAI API 호출 (`dangerouslyAllowBrowser: true`)
- 프로덕션 환경에서는 백엔드 서버에서 호출하는 것을 권장
- API 키 노출 위험 최소화

### 프로덕션 배포 시 권장사항
1. 백엔드 API 서버 구축 (Node.js, Python 등)
2. 클라이언트 → 백엔드 → OpenAI 구조로 변경
3. API 키는 서버 환경변수에만 저장
4. Rate limiting 및 비용 모니터링 구현

## 10. 비용 관리

### OpenAI API 사용량
- GPT-4.1 모델 사용
- 분석 1회당 약 2번의 API 호출
- 예상 비용: 분석당 $0.01-0.05

### 비용 절감 팁
- 짧고 명확한 질문 작성
- 불필요한 분석 반복 방지
- 이미지 크기 최적화 (리사이징)
