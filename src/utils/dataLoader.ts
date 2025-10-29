/**
 * 데이터 로더 유틸리티
 * JSON 파일들을 로드하고 관계를 조회하는 역할
 */

export interface MasterItem {
  id: number;
  name: string;
  count: number;
}

export interface Relationship {
  row_id: number;
  업종_id: number;
  작업공정_id: number;
  위험요인_id: number;
  위험요소_id: number;
  유해위험요인항목_id: number;
  대책_id: number;
}

export interface SafetyData {
  위험요소: MasterItem[];
  유해위험요인항목: MasterItem[];
  대책: MasterItem[];
  업종: MasterItem[];
  작업공정: MasterItem[];
  위험요인: MasterItem[];
  relationships: Relationship[];
}

let cachedData: SafetyData | null = null;

/**
 * JSON 데이터 로드
 */
export async function loadSafetyData(): Promise<SafetyData> {
  if (cachedData) {
    return cachedData;
  }

  try {
    const [
      위험요소Response,
      유해위험요인항목Response,
      대책Response,
      업종Response,
      작업공정Response,
      위험요인Response,
      relationshipsResponse
    ] = await Promise.all([
      fetch('/output/master_위험요소.json'),
      fetch('/output/master_유해위험요인항목.json'),
      fetch('/output/master_대책.json'),
      fetch('/output/master_업종.json'),
      fetch('/output/master_작업공정.json'),
      fetch('/output/master_위험요인.json'),
      fetch('/output/relationships.json')
    ]);

    cachedData = {
      위험요소: await 위험요소Response.json(),
      유해위험요인항목: await 유해위험요인항목Response.json(),
      대책: await 대책Response.json(),
      업종: await 업종Response.json(),
      작업공정: await 작업공정Response.json(),
      위험요인: await 위험요인Response.json(),
      relationships: await relationshipsResponse.json()
    };

    return cachedData;
  } catch (error) {
    console.error('데이터 로드 실패:', error);
    throw new Error('안전 데이터를 불러오는 데 실패했습니다.');
  }
}

/**
 * 위험요소 이름으로 ID 찾기
 */
export function find위험요소IdsByNames(data: SafetyData, names: string[]): number[] {
  const ids: number[] = [];

  for (const name of names) {
    const item = data.위험요소.find(w => w.name === name);
    if (item) {
      ids.push(item.id);
    }
  }

  return ids;
}

/**
 * 위험요소 ID들로 관련된 유해위험요인항목 ID 찾기
 */
export function find유해위험요인항목IdsByRiskIds(
  data: SafetyData,
  riskIds: number[]
): number[] {
  const itemIds = new Set<number>();

  for (const relationship of data.relationships) {
    if (riskIds.includes(relationship.위험요소_id)) {
      itemIds.add(relationship.유해위험요인항목_id);
    }
  }

  return Array.from(itemIds);
}

/**
 * 유해위험요인항목 ID들로 이름 가져오기
 */
export function get유해위험요인항목Names(data: SafetyData, ids: number[]): string[] {
  return ids
    .map(id => data.유해위험요인항목.find(item => item.id === id)?.name)
    .filter((name): name is string => name !== undefined);
}

/**
 * 업종 이름으로 ID 찾기
 */
export function find업종IdsByNames(data: SafetyData, names: string[]): number[] {
  const ids: number[] = [];

  for (const name of names) {
    const item = data.업종.find(i => i.name === name);
    if (item) {
      ids.push(item.id);
    }
  }

  return ids;
}

/**
 * 위험요소 ID + 유해위험요인항목 ID로 대책 찾기
 */
export function find대책sByConditions(
  data: SafetyData,
  riskIds: number[],
  hazardItemIds: number[]
): MasterItem[] {
  const 대책Ids = new Set<number>();

  // AND 조건: 위험요소 ID와 유해위험요인항목 ID가 모두 일치하는 관계 찾기
  for (const relationship of data.relationships) {
    if (
      riskIds.includes(relationship.위험요소_id) &&
      hazardItemIds.includes(relationship.유해위험요인항목_id)
    ) {
      대책Ids.add(relationship.대책_id);
    }
  }

  return Array.from(대책Ids)
    .map(id => data.대책.find(item => item.id === id))
    .filter((item): item is MasterItem => item !== undefined);
}

/**
 * 위험요소 ID + 유해위험요인항목 ID + 업종 ID로 대책 찾기 (업종 필터링 포함)
 */
export function find대책sByConditionsWithIndustry(
  data: SafetyData,
  riskIds: number[],
  hazardItemIds: number[],
  industryIds: number[]
): MasterItem[] {
  const 대책Ids = new Set<number>();

  // AND 조건: 위험요소, 유해위험요인항목, 업종이 모두 일치하는 관계 찾기
  for (const relationship of data.relationships) {
    if (
      riskIds.includes(relationship.위험요소_id) &&
      hazardItemIds.includes(relationship.유해위험요인항목_id) &&
      industryIds.includes(relationship.업종_id)
    ) {
      대책Ids.add(relationship.대책_id);
    }
  }

  return Array.from(대책Ids)
    .map(id => data.대책.find(item => item.id === id))
    .filter((item): item is MasterItem => item !== undefined);
}

/**
 * 위험요소, 유해위험요인항목, 대책이 모두 일치하는 관계의 모든 데이터 찾기
 */
export interface FullAnalysisResult {
  위험요소: MasterItem;
  유해위험요인항목: MasterItem;
  대책: MasterItem;
  업종: MasterItem;
  작업공정: MasterItem;
  위험요인: MasterItem;
}

export function findFullMatchingData(
  data: SafetyData,
  riskIds: number[],
  hazardItemIds: number[],
  actionIds: number[]
): FullAnalysisResult[] {
  const results: FullAnalysisResult[] = [];

  for (const relationship of data.relationships) {
    // AND 조건: 모든 ID가 일치하는지 확인
    if (
      riskIds.includes(relationship.위험요소_id) &&
      hazardItemIds.includes(relationship.유해위험요인항목_id) &&
      actionIds.includes(relationship.대책_id)
    ) {
      const 위험요소 = data.위험요소.find(w => w.id === relationship.위험요소_id);
      const 유해위험요인항목 = data.유해위험요인항목.find(h => h.id === relationship.유해위험요인항목_id);
      const 대책 = data.대책.find(a => a.id === relationship.대책_id);
      const 업종 = data.업종.find(i => i.id === relationship.업종_id);
      const 작업공정 = data.작업공정.find(p => p.id === relationship.작업공정_id);
      const 위험요인 = data.위험요인.find(f => f.id === relationship.위험요인_id);

      if (위험요소 && 유해위험요인항목 && 대책 && 업종 && 작업공정 && 위험요인) {
        results.push({
          위험요소,
          유해위험요인항목,
          대책,
          업종,
          작업공정,
          위험요인
        });
      }
    }
  }

  return results;
}

/**
 * 업종 + 위험요소 + 유해위험요인항목 + 대책이 모두 일치하는 관계의 모든 데이터 찾기
 */
export function findFullMatchingDataWithIndustry(
  data: SafetyData,
  industryIds: number[],
  riskIds: number[],
  hazardItemIds: number[],
  actionIds: number[]
): FullAnalysisResult[] {
  const results: FullAnalysisResult[] = [];

  for (const relationship of data.relationships) {
    // AND 조건: 업종 + 위험요소 + 유해위험요인항목 + 대책이 모두 일치하는지 확인
    if (
      industryIds.includes(relationship.업종_id) &&
      riskIds.includes(relationship.위험요소_id) &&
      hazardItemIds.includes(relationship.유해위험요인항목_id) &&
      actionIds.includes(relationship.대책_id)
    ) {
      const 위험요소 = data.위험요소.find(w => w.id === relationship.위험요소_id);
      const 유해위험요인항목 = data.유해위험요인항목.find(h => h.id === relationship.유해위험요인항목_id);
      const 대책 = data.대책.find(a => a.id === relationship.대책_id);
      const 업종 = data.업종.find(i => i.id === relationship.업종_id);
      const 작업공정 = data.작업공정.find(p => p.id === relationship.작업공정_id);
      const 위험요인 = data.위험요인.find(f => f.id === relationship.위험요인_id);

      if (위험요소 && 유해위험요인항목 && 대책 && 업종 && 작업공정 && 위험요인) {
        results.push({
          위험요소,
          유해위험요인항목,
          대책,
          업종,
          작업공정,
          위험요인
        });
      }
    }
  }

  return results;
}

/**
 * 38개 위험요소 전체 목록 반환
 */
export function getAllRiskElements(): string[] {
  return [
    '가스',
    '감전(안전전압초과)',
    '고체(분진)',
    '공간 및 이동통로',
    '근로자 실수(휴먼에러)',
    '기계(설비) 의 낙하, 비래, 전복, 붕괴, 전도위험 부분',
    '기후 / 고온 / 한랭',
    '넘어짐(미끄러짐, 걸림, 헛디딤)',
    '동물',
    '반복작업',
    '반응성 물질',
    '방사선',
    '병원성 미생물, 바이러스에 의한 감염',
    '복사열 / 폭발과압',
    '불안정한 작업자세',
    '소음',
    '식물',
    '아크',
    '알러지 및 미생물',
    '액체 · 미스트',
    '에어로졸 · 흄',
    '위험한 표면(절단, 베임, 긁힘)',
    '작업(조작)도구',
    '작업시간',
    '저압 또는 고압상태',
    '정전기',
    '조명',
    '조직 안전문화',
    '주변 근로자',
    '중량물 취급작업',
    '증기',
    '진동',
    '질식위험·산소결핍',
    '추락위험 부분(개구부 등)',
    '충돌위험 부분',
    '협착위험 부분(감김,끼임)',
    '화상',
    '화재 / 폭발 위험'
  ];
}
