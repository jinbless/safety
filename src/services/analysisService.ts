/**
 * 분석 로직 서비스
 * 7단계 프로세스를 통한 위험요소 분석
 */

import {
  loadSafetyData,
  find위험요소IdsByNames,
  find유해위험요인항목IdsByRiskIds,
  get유해위험요인항목Names,
  find대책sByConditions,
  find대책sByConditionsWithIndustry,
  find업종IdsByNames,
  findFullMatchingDataWithIndustry,
  type SafetyData,
  type MasterItem,
  type FullAnalysisResult
} from '../utils/dataLoader';
import {
  analyzeRiskElements,
  filterRelevantHazardItems,
  analyzeIndustryType,
  analyzeAccidentType
} from './openai';

interface AccidentType {
  id: number;
  name: string;
  description: string;
  examples: string[];
  frequency: string;
}

export interface AnalysisResult {
  // 산업재해 유형 (새로 추가)
  accidentTypes: AccidentType[];

  // 선택된 업종들 (unique)
  selectedIndustries: string[];

  // 선택된 위험요소들 (unique)
  selectedRiskElements: string[];

  // 관련된 유해위험요인항목들 (unique)
  relevantHazardItems: string[];

  // 추천 대책들 (unique)
  recommendedActions: MasterItem[];

  // 완전 매칭 데이터 (업종 + 위험요소 + 유해위험항목 + 대책이 모두 일치하는 세트)
  fullMatchingData: FullAnalysisResult[];

  // 업종 매칭 여부
  isIndustryMatched: boolean;

  // 디버깅용 정보
  debug?: {
    step0_gptIndustries: string[];
    step0_industryIds: number[];
    step1_gptRisks: string[];
    step2_riskIds: number[];
    step3_allHazardItemIds: number[];
    step3_allHazardItemNames: string[];
    step4_filteredHazardItems: string[];
    step5_actionIds: number[];
  };
}

/**
 * 메인 분석 함수: 8단계 프로세스 실행 (업종 추가)
 */
export async function analyzeWorkSafety(
  imageBase64: string | null,
  workDescription: string,
  industryDescription: string,
  enableDebug = false
): Promise<AnalysisResult> {
  try {
    // 산업재해 유형 분석만 수행
    console.log('🔍 산업재해 유형 분석 중...');
    const accidentTypes = await analyzeAccidentType(imageBase64, workDescription);
    console.log('식별된 산업재해 유형:', accidentTypes.map(t => t.name));

    if (accidentTypes.length === 0) {
      throw new Error('산업재해 유형을 식별할 수 없습니다. 작업 내용을 다시 확인해주세요.');
    }

    // 결과 반환 (산업재해 유형만)
    const result: AnalysisResult = {
      accidentTypes: accidentTypes,
      selectedIndustries: [],
      selectedRiskElements: [],
      relevantHazardItems: [],
      recommendedActions: [],
      fullMatchingData: [],
      isIndustryMatched: false
    };

    return result;
  } catch (error) {
    console.error('분석 오류:', error);
    throw error;
  }
}
