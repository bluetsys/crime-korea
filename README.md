# 한국 연도별 범죄율 지도 (2014-2023)

대한민국의 시도별 범죄율 데이터를 인터랙티브한 지도로 시각화한 웹 애플리케이션입니다.

## 🌟 주요 기능

### 📊 데이터 시각화
- **연도별 범죄율 표시**: 2014년부터 2023년까지의 시도별 범죄율 데이터
- **색상 코딩**: 범죄율 수준에 따른 직관적인 색상 표현
- **다양한 색상 스케일**: 9가지 색상 테마 지원 (빨간색, 파란색, 초록색, 주황색, 보라색, 비리디스, 플라즈마, 터보, 스펙트럼)

### 🗺️ 인터랙티브 지도
- **줌/팬 기능**: 마우스 휠과 드래그로 지도 확대/축소 및 이동
- **지역 클릭**: 특정 시도 클릭 시 해당 지역으로 자동 확대
- **툴팁**: 마우스 오버 시 지역별 상세 범죄율 정보 표시
- **시도명 표시**: 토글 가능한 지역명 레이블

### ⏯️ 시간 탐색
- **연도 슬라이더**: 2014-2023년 연도별 데이터 탐색
- **자동 재생**: 연도별 변화 추이를 자동으로 재생
- **처음으로 리셋**: 2014년으로 빠른 이동

### 📈 통계 정보
- **전국 평균**: 선택된 연도의 전국 평균 범죄율
- **증감률 표시**: 전년 대비 증감률과 방향 표시
- **현재 위치 좌표**: 지도 중심점과 줌 레벨 표시
- **범례**: 색상별 범죄율 구간 안내

## 🚀 사용법

### 기본 조작
1. **연도 선택**: 상단 좌측 패널의 슬라이더로 연도 변경
2. **자동 재생**: "재생" 버튼으로 연도별 변화 애니메이션 시청
3. **지도 탐색**: 
   - 마우스 휠: 확대/축소
   - 드래그: 지도 이동
   - 지역 클릭: 해당 지역 확대

### 고급 기능
- **색상 테마 변경**: 드롭다운에서 원하는 색상 스케일 선택
- **시도명 표시**: 체크박스로 지역명 표시/숨김 토글
- **키보드 단축키**:
  - `+/=`: 확대
  - `-`: 축소
  - `0`: 전체 보기
  - `스페이스바`: 재생/정지
  - `←/→`: 이전/다음 연도

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **데이터 시각화**: D3.js v7
- **지도 처리**: TopoJSON
- **스타일링**: 순수 CSS (반응형 디자인)

## 📊 데이터 출처

### 범죄율 데이터
- **출처**: [국가지표체계 - 시도별 범죄율](https://www.index.go.kr/unity/potal/indicator/IndexInfo.do?cdNo=2&clasCd=10&idxCd=F0226&upCd=10)
- **단위**: 인구 10만명당 발생 건수
- **기간**: 2014년 ~ 2023년

### 지도 데이터
- **출처**: [브이월드 - (센서스경계)시도경계](http://vworld.kr/dtmk/dtmk_ntads_s002.do?searchKeyword=&searchSvcCde=&searchOrganization=&searchBrmCode=&searchTagList=&searchFrm=&pageIndex=1&gidmCd=01&gidsCd=0102&sortType=00&svcCde=MK&dsId=30016&listPageIndex=1)
- **형식**: TopoJSON (원본: Shapefile)

## 🔧 데이터 처리 도구

- **GeoJSON 변환**: [QGIS](https://qgis.org/)
- **TopoJSON 변환**: [Mapshaper](https://mapshaper.org/)

## 📱 반응형 지원

- 데스크톱, 태블릿, 모바일 환경 모두 지원
- GitHub 리본의 모바일 최적화
- 터치 디바이스에서의 줌/팬 제스처 지원

## 🎨 UI/UX 특징

- **직관적인 인터페이스**: 사용하기 쉬운 컨트롤 패널
- **실시간 피드백**: 즉각적인 색상 변화와 애니메이션
- **정보 패널**: 우측 하단의 통계 및 좌표 정보
- **GitHub 연동**: 우측 상단 리본으로 소스코드 접근

## 🏃‍♂️ 로컬 실행

```bash
# 저장소 클론
git clone https://github.com/bluetsys/crime-korea.git

# 디렉토리 이동
cd crime-korea

# 웹 서버로 실행 (예: Live Server, Python SimpleHTTPServer 등)
# Python 3의 경우:
python -m http.server 8000

# 브라우저에서 http://localhost:8000 접속
```

## 🏃‍♂️ 사용자가 직접 SHP파일을 다운로드 해서 작업시

### mapshaper tool 설치
```
# npm이 설치 되어 있다는 가정
npm install -g mapshaper
```

### mapshaper tool로 todoJSON 파일 생성 방법
``` bash
# mapshaper [SHP파일경로] -simplify 5% -o format=topojson [topojson파일경로]
mapshaper BND_SIDO_PG.shp -simplify 1% -o format=topojson ../map.json

# 직접 생성시 javascript 부분을 수정 해아 합니다.
# index.html파일내 script에 drawMap함수(737라인) 수정
# const geojson = topojson.feature(mapData, mapData.objects.www);
# ->
# const geojson = topojson.feature(mapData, mapData.objects.[SHP파일경로(확장자제외)]);
# const geojson = topojson.feature(mapData, mapData.objects.BND_SIDO_PG);
```

### 직접 생성시
- **Mapshaper CLI 문서**: [Mapshaper](https://github.com/mbloch/mapshaper/wiki/Introduction-to-the-Command-Line-Tool)

## 📄 라이선스

이 프로젝트는 오픈소스이며, 교육 및 연구 목적으로 자유롭게 사용할 수 있습니다. 단 쿠팡 빼고 매출 규모 10조원 이상 기업에서 이용시 10억원의
이용료를 받을 수 있습니다.

---

**개발자**: [bluetsys](https://github.com/bluetsys)  
**프로젝트 URL**: https://github.com/bluetsys/crime-korea