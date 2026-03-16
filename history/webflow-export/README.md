# Webflow 커스텀 코드 삽입 가이드

헤더와 푸터를 제외한 메인 콘텐츠 영역을 Webflow에 삽입하는 방법입니다.

---

## 파일 구성

```
webflow-export/
├── head-code.html    # CSS + 외부 리소스
├── body-html.html    # HTML 본문
└── footer-code.html  # JavaScript
```

---

## Webflow 삽입 방법

### 1. Head Code
**위치:** Project Settings > Custom Code > Head Code

`head-code.html` 내용 전체를 붙여넣기

### 2. Body HTML
**위치:** 페이지 에디터 > Embed 컴포넌트

`body-html.html` 내용 전체를 붙여넣기

### 3. Footer Code
**위치:** Project Settings > Custom Code > Footer Code

`footer-code.html` 내용 전체를 붙여넣기

---

## 주요 특징

- `.ng-wrapper` 클래스로 스타일 스코핑 (Webflow 스타일 충돌 방지)
- 모든 섹션 ID에 `ng-` 접두사 (`#ng-hero`, `#ng-apply` 등)
- 캐러셀, 스크롤 애니메이션, 반응형 모두 포함

---

## 외부 리소스

자동으로 로드되는 CDN:
- **Pretendard 폰트**
- **Phosphor Icons**

모든 이미지는 `api.mindthos.com` 외부 URL 사용

---

## 테스트 체크리스트

- [ ] 모든 섹션 정상 표시
- [ ] 캐러셀 자동 슬라이드
- [ ] 스크롤 reveal 애니메이션
- [ ] 모바일 반응형
- [ ] CTA 버튼 링크 작동
- [ ] YouTube 동영상 재생
