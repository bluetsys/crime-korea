// 전역 변수
let mapData;
let crimeData = {};
let sidoMapping = {};
let currentYear = 2014;
let currentColorScheme = 'blues';
let colorScale;
let g;
let isPlaying = false;
let playInterval;

// SVG 설정
const width = 800;
const height = 600;

// 기본 위치 설정 (중심 X: 296.01, 중심 Y: 195.98, 줌 레벨: 0.76)
const defaultTransform = d3.zoomIdentity
    .translate(width / 2 - 296.01 * 0.76, height / 2 - 195.98 * 0.76)
    .scale(0.76);

// SVG 요소 생성
const svg = d3.select("#map")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("background-color", "#ffffff");

// 그룹 요소 생성 (줌/팬을 위한)
g = svg.append("g");

// 줌 행동 정의
const zoom = d3.zoom()
    .scaleExtent([0.5, 10])
    .on("zoom", (event) => {
        g.attr("transform", event.transform);
        updateCoordinates(event.transform);
    });

svg.call(zoom);

// 좌표 업데이트 함수
function updateCoordinates(transform) {
    const scale = transform.k;
    const translateX = transform.x;
    const translateY = transform.y;

    const centerScreenX = width / 2;
    const centerScreenY = height / 2;

    const centerX = (centerScreenX - translateX) / scale;
    const centerY = (centerScreenY - translateY) / scale;

    _$('#centerX').text(centerX.toFixed(2));
    _$('#centerY').text(centerY.toFixed(2));
    _$('#zoomLevel').text(scale.toFixed(2));
}

// 툴팁 요소
const tooltip = d3.select("#tooltip");

// 시도명 매핑 (CSV 컬럼명 -> 표준 시도명)
const csvToSidoMapping = {
    '서울': '서울특별시',
    '부산': '부산광역시',
    '대구': '대구광역시',
    '인천': '인천광역시',
    '광주': '광주광역시',
    '대전': '대전광역시',
    '울산': '울산광역시',
    '세종': '세종특별자치시',
    '경기': '경기도',
    '강원': '강원특별자치도',
    '충북': '충청북도',
    '충남': '충청남도',
    '전북': '전북특별자치도',
    '전남': '전라남도',
    '경북': '경상북도',
    '경남': '경상남도',
    '제주': '제주특별자치도'
};

// CSV 데이터 파싱 함수
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');

    // 첫 번째 줄에서 헤더 추출 (따옴표 제거)
    const headerLine = lines[0];
    const headers = [];
    let currentHeader = '';
    let inQuotes = false;

    for (let i = 0; i < headerLine.length; i++) {
        const char = headerLine[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            headers.push(currentHeader.trim());
            currentHeader = '';
        } else {
            currentHeader += char;
        }
    }
    headers.push(currentHeader.trim()); // 마지막 헤더 추가

    const result = {};

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const values = [];
        let currentValue = '';
        let inQuotes = false;

        // 따옴표를 고려한 CSV 파싱
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(currentValue.trim());
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        values.push(currentValue.trim()); // 마지막 값 추가

        const year = parseInt(values[0]);

        if (!result[year]) {
            result[year] = {};
        }

        // 각 시도별 데이터 저장 (전국 제외)
        for (let j = 2; j < headers.length; j++) {
            const csvSidoName = headers[j];
            const standardSidoName = csvToSidoMapping[csvSidoName] || csvSidoName;
            // 따옴표와 쉼표 제거 후 숫자로 변환
            const cleanValue = values[j].replace(/"/g, '').replace(/,/g, '');
            const crimeRate = parseFloat(cleanValue) || 0;
            result[year][standardSidoName] = crimeRate;
        }

        // 전국 평균도 저장
        const cleanNationalValue = values[1].replace(/"/g, '').replace(/,/g, '');
        result[year]['전국'] = parseFloat(cleanNationalValue) || 0;
    }

    return result;
}

// 색상 스케일 함수 반환
function getColorInterpolator(scheme) {
    switch (scheme) {
        case 'blues': return d3.interpolateBlues;
        case 'reds': return d3.interpolateReds;
        case 'greens': return d3.interpolateGreens;
        case 'oranges': return d3.interpolateOranges;
        case 'purples': return d3.interpolatePurples;
        case 'viridis': return d3.interpolateViridis;
        case 'plasma': return d3.interpolatePlasma;
        case 'turbo': return d3.interpolateTurbo;
        case 'spectral': return d3.interpolateSpectral;
        default: return d3.interpolateBlues;
    }
}

// 범죄율 색상 스케일 생성
function createColorScale() {
    // 전체 연도의 모든 데이터에서 최대값 찾기
    let allValues = [];
    Object.values(crimeData).forEach(yearData => {
        Object.entries(yearData).forEach(([sido, rate]) => {
            if (sido !== '전국') {
                allValues.push(rate);
            }
        });
    });

    const maxValue = Math.max(...allValues);
    const minValue = Math.min(...allValues);

    const colorInterpolator = getColorInterpolator(currentColorScheme);
    return d3.scaleSequential(colorInterpolator).domain([minValue, maxValue]);
}

// 시도별 범죄율 반환
function getCrimeRate(sidoName) {
    const yearData = crimeData[currentYear] || {};
    return yearData[sidoName] || 0;
}

// 색상 스케일 변경 함수
function updateColorScheme() {
    currentColorScheme = _$('#colorScheme').val();
    colorScale = createColorScale();
    updateMapColors();
    updateLegend();
}

// 연도 업데이트
function updateYear(year) {
    currentYear = parseInt(year);
    _$('#yearDisplay').text(`${currentYear}년`);
    _$('#yearSlider').val(currentYear);
    updateMapColors();
    updateNationalInfo();
}

// 지도 색상 업데이트
function updateMapColors() {
    g.selectAll(".province")
        .transition()
        .duration(300)
        .attr("fill", d => {
            const rate = getCrimeRate(d.properties.SIDO_NM);
            return colorScale(rate);
        });
}

// 재생/정지 토글
function togglePlay() {
    const playBtn = _$('#playBtn');

    if (isPlaying) {
        // 정지
        clearInterval(playInterval);
        isPlaying = false;
        playBtn.text('재생');
    } else {
        // 재생
        isPlaying = true;
        playBtn.text('정지');

        playInterval = setInterval(() => {
            if (currentYear >= 2023) {
                currentYear = 2014;
            } else {
                currentYear++;
            }
            updateYear(currentYear);
        }, 1000); // 1초마다 연도 변경
    }
}

// 처음으로 리셋
function resetToStart() {
    if (isPlaying) {
        togglePlay();
    }
    updateYear(2014);
}

// 전국 정보 업데이트
function updateNationalInfo() {
    const nationalAvg = crimeData[currentYear]['전국'];
    _$('#nationalAverage').text(`${nationalAvg.toFixed(1)}건`);

    // 전년 대비 증감 표시
    if (currentYear > 2014) {
        const prevAvg = crimeData[currentYear - 1]['전국'];
        const change = nationalAvg - prevAvg;
        const changePercent = ((change / prevAvg) * 100).toFixed(1);
        const direction = change > 0 ? '↗' : change < 0 ? '↘' : '→';
        const color = change > 0 ? 'red' : change < 0 ? 'blue' : 'gray';

        _$('#trendDirection').html(
            `<span style="color: ${color}">${direction} ${Math.abs(changePercent)}%</span>`
        );
    } else {
        _$('#trendDirection').text('기준년도');
    }
}

// 범례 업데이트
function updateLegend() {
    const legendContent = _$('#legendContent');

    // 전체 연도 데이터에서 범위 계산
    let allValues = [];
    Object.values(crimeData).forEach(yearData => {
        Object.entries(yearData).forEach(([sido, rate]) => {
            if (sido !== '전국') {
                allValues.push(rate);
            }
        });
    });

    const maxValue = Math.max(...allValues);
    const minValue = Math.min(...allValues);

    const steps = 6;
    let legendHTML = '';

    for (let i = 0; i < steps; i++) {
        const value = minValue + (maxValue - minValue) / (steps - 1) * i;
        const color = colorScale(value);
        const displayValue = value.toFixed(0);

        legendHTML += `
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: ${color}"></div>
                        <span>${displayValue}건</span>
                    </div>
                `;
    }

    // 색상 스케일 정보 추가
    const schemeNames = {
        'blues': '파란색',
        'reds': '빨간색',
        'greens': '초록색',
        'oranges': '주황색',
        'purples': '보라색',
        'viridis': '비리디스',
        'plasma': '플라즈마',
        'turbo': '터보',
        'spectral': '스펙트럼'
    };

    legendHTML += `<div style="margin-top: 8px; font-size: 10px; color: #666; border-top: 1px solid #eee; padding-top: 5px;">
                색상: ${schemeNames[currentColorScheme] || currentColorScheme}
            </div>`;

    legendContent.html(legendHTML);
}

// 데이터 로드 함수들
async function loadAllData() {
    try {
        // 지도 데이터 로드
        mapData = await d3.json("map.json");
        console.log("지도 데이터 로드 완료");

        // 범죄율 데이터 로드
        const csvText = await d3.text("crime.csv");
        crimeData = parseCSV(csvText);
        console.log("범죄율 데이터 로드 완료:", crimeData);

        // 초기 색상 스케일 설정
        colorScale = createColorScale();

        // 지도 그리기
        drawMap();

        // 범례 및 정보 초기화
        updateLegend();
        updateNationalInfo();

    } catch (error) {
        console.error("데이터 로드 실패:", error);
        alert("데이터를 불러오는데 실패했습니다: " + error.message);
    }
}

// 지도 그리기 함수
function drawMap() {
    console.log("지도 그리기 시작");

    // TopoJSON을 GeoJSON으로 변환
    const geojson = topojson.feature(mapData, mapData.objects.BND_SIDO_PG);
    console.log("GeoJSON 변환 완료:", geojson);

    // 좌표 경계 계산
    let bounds = [[Infinity, Infinity], [-Infinity, -Infinity]];

    geojson.features.forEach(feature => {
        if (feature.geometry.type === "Polygon") {
            feature.geometry.coordinates.forEach(ring => {
                ring.forEach(coord => {
                    if (coord[0] < bounds[0][0]) bounds[0][0] = coord[0];
                    if (coord[1] < bounds[0][1]) bounds[0][1] = coord[1];
                    if (coord[0] > bounds[1][0]) bounds[1][0] = coord[0];
                    if (coord[1] > bounds[1][1]) bounds[1][1] = coord[1];
                });
            });
        } else if (feature.geometry.type === "MultiPolygon") {
            feature.geometry.coordinates.forEach(polygon => {
                polygon.forEach(ring => {
                    ring.forEach(coord => {
                        if (coord[0] < bounds[0][0]) bounds[0][0] = coord[0];
                        if (coord[1] < bounds[0][1]) bounds[0][1] = coord[1];
                        if (coord[0] > bounds[1][0]) bounds[1][0] = coord[0];
                        if (coord[1] > bounds[1][1]) bounds[1][1] = coord[1];
                    });
                });
            });
        }
    });

    console.log("좌표 경계:", bounds);

    // 스케일과 오프셋 계산
    const dataWidth = bounds[1][0] - bounds[0][0];
    const dataHeight = bounds[1][1] - bounds[0][1];
    const scale = Math.min(width / dataWidth, height / dataHeight);
    const offsetX = (width - dataWidth * scale) / 2 - bounds[0][0] * scale;
    const offsetY = (height + dataHeight * scale) / 2 - bounds[0][1] * scale;

    // 투영법 설정
    const projection = d3.geoTransform({
        point: function (x, y) {
            this.stream.point(
                x * scale + offsetX,
                offsetY - y * scale
            );
        }
    });

    // 경로 생성기
    const path = d3.geoPath().projection(projection);

    // 지역(시도) 그리기
    g.selectAll(".province")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("class", "province")
        .attr("d", path)
        .attr("fill", d => {
            const rate = getCrimeRate(d.properties.SIDO_NM);
            return colorScale(rate);
        })
        .on("mouseover", function (event, d) {
            const crimeRate = getCrimeRate(d.properties.SIDO_NM);

            tooltip
                .style("opacity", 1)
                .html(`
                            <strong>${d.properties.SIDO_NM}</strong><br>
                            ${currentYear}년 범죄율: <strong>${crimeRate.toFixed(1)}건</strong><br>
                            <small>(인구 10만명당)</small>
                        `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mousemove", function (event) {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function () {
            tooltip.style("opacity", 0);
        })
        .on("click", function (event, d) {
            const [[x0, y0], [x1, y1]] = path.bounds(d);
            const dx = x1 - x0;
            const dy = y1 - y0;
            const x = (x0 + x1) / 2;
            const y = (y0 + y1) / 2;
            const scale = Math.min(8, 0.9 / Math.max(dx / width, dy / height));
            const translate = [width / 2 - scale * x, height / 2 - scale * y];

            svg.transition()
                .duration(750)
                .call(
                    zoom.transform,
                    d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
                );
        });

    // 시도명 레이블 추가
    g.selectAll(".province-label")
        .data(geojson.features)
        .enter()
        .append("text")
        .attr("class", "province-label")
        .attr("x", d => {
            const centroid = path.centroid(d);
            const name = d.properties.SIDO_NM;

            // 경기도는 특별히 위치 조정
            if (name === '경기도') {
                return centroid[0] + 15;
            }
            return centroid[0];
        })
        .attr("y", d => {
            const centroid = path.centroid(d);
            const name = d.properties.SIDO_NM;

            // 경기도는 특별히 위치 조정
            if (name === '경기도') {
                return centroid[1] + 25;
            }
            return centroid[1];
        })
        .text(d => {
            // 시도명을 적절한 줄임말로 표시
            const name = d.properties.SIDO_NM;
            const nameMapping = {
                '서울특별시': '서울',
                '부산광역시': '부산',
                '대구광역시': '대구',
                '인천광역시': '인천',
                '광주광역시': '광주',
                '대전광역시': '대전',
                '울산광역시': '울산',
                '세종특별자치시': '세종',
                '경기도': '경기',
                '강원특별자치도': '강원',
                '충청북도': '충북',
                '충청남도': '충남',
                '전북특별자치도': '전북',
                '전라남도': '전남',
                '경상북도': '경북',
                '경상남도': '경남',
                '제주특별자치도': '제주'
            };
            return nameMapping[name] || name;
        })
        .style("display", "block");

    // 초기 좌표 표시 및 기본 위치 적용
    svg.call(zoom.transform, defaultTransform);
    updateCoordinates(defaultTransform);
}

// 레이블 표시/숨기기 토글
function toggleLabels() {
    const showLabels = _$('#showLabels').first.checked;
    g.selectAll(".province-label")
        .style("display", showLabels ? "block" : "none");
}

// 컨트롤 함수들
function resetZoom() {
    svg.transition()
        .duration(750)
        .call(zoom.transform, defaultTransform);
}

function zoomIn() {
    svg.transition()
        .duration(300)
        .call(zoom.scaleBy, 1.5);
}

function zoomOut() {
    svg.transition()
        .duration(300)
        .call(zoom.scaleBy, 1 / 1.5);
}

// 키보드 단축키
d3.select("body").on("keydown", function (event) {
    switch (event.key) {
        case "+":
        case "=":
            zoomIn();
            break;
        case "-":
            zoomOut();
            break;
        case "0":
            resetZoom();
            break;
        case " ":
            event.preventDefault();
            togglePlay();
            break;
        case "ArrowLeft":
            if (currentYear > 2014) {
                updateYear(currentYear - 1);
            }
            break;
        case "ArrowRight":
            if (currentYear < 2023) {
                updateYear(currentYear + 1);
            }
            break;
    }
});

// 페이지 로드 시 모든 데이터 로드
loadAllData();