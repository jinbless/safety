/**
 * OpenAI API 서비스
 * GPT를 활용한 위험요소 분석 및 유해위험요인항목 필터링
 */

import OpenAI from 'openai';
import { getAllRiskElements, loadSafetyData } from '../utils/dataLoader';

interface AccidentType {
  id: number;
  name: string;
  description: string;
  examples: string[];
  frequency: string;
}

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // 클라이언트 사이드에서 사용
});

/**
 * 1단계: 사진 또는 작업내용을 분석하여 위험요소 최대 5개 추출
 */
export async function analyzeRiskElements(
  imageBase64: string | null,
  workDescription: string
): Promise<string[]> {
  try {
    const riskElements = getAllRiskElements();
    const riskElementsString = riskElements.join('|');

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `당신은 산업안전 전문가입니다. 작업 현장의 사진 또는 작업 내용 설명을 분석하여 가장 위험해 보이는 요소를 식별합니다.

다음 38개 위험요소 중에서 가장 위험해 보이는 요소를 최대 2개 선택하세요:
${riskElementsString}

**중요**: 반드시 위의 38개 항목 중에서만 선택하고, 정확한 이름을 사용하세요.
응답은 반드시 JSON 형식으로만 제공하고, 선택한 위험요소들을 배열로 반환하세요.

응답 형식:
{
  "riskElements": ["위험요소1", "위험요소2"]
}`
      }
    ];

    // 이미지가 있는 경우
    if (imageBase64) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: `다음 작업 현장 사진을 분석하여 가장 위험해 보이는 요소를 최대 2개 선택해주세요.\n\n작업 내용: ${workDescription}`
          },
          {
            type: 'image_url',
            image_url: {
              url: imageBase64
            }
          }
        ]
      });
    } else {
      // 텍스트만 있는 경우
      messages.push({
        role: 'user',
        content: `다음 작업 내용을 분석하여 가장 위험해 보이는 요소를 최대 2개 선택해주세요.\n\n작업 내용: ${workDescription}`
      });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('GPT 응답이 비어있습니다.');
    }

    const parsed = JSON.parse(content);
    const selectedRisks = parsed.riskElements || [];

    // 유효성 검증: 선택된 위험요소가 실제 목록에 있는지 확인
    const validRisks = selectedRisks.filter((risk: string) =>
      riskElements.includes(risk)
    );

    return validRisks.slice(0, 2); // 최대 2개만 반환
  } catch (error) {
    console.error('위험요소 분석 오류:', error);
    throw new Error('위험요소 분석에 실패했습니다. API 키를 확인해주세요.');
  }
}

/**
 * 0단계: 자연어로 입력된 업종을 분석하여 가장 유사한 업종 최대 2개 추출
 */
export async function analyzeIndustryType(
  industryDescription: string
): Promise<string[]> {
  try {
    // 업종 데이터 로드
    const data = await loadSafetyData();
    const industries = data.업종.map(item => item.name);
    const industriesString = industries.join('\n');

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `당신은 산업 분류 전문가입니다. 사용자가 자연어로 설명하는 업종을 분석하여 가장 유사한 표준 업종을 찾습니다.

다음 298개 업종 목록에서 가장 유사한 업종을 최대 2개 선택하세요:
${industriesString}

**중요**:
- 반드시 위의 298개 업종 중에서만 선택하고, 정확한 이름을 사용하세요.
- 사용자의 설명과 가장 유사한 업종을 선택하세요.
- 예시: "식당에서 서빙한다" → "음식점업"
- 예시: "공사현장에서 노가다한다" → "건설업", "토목공사업"
- 예시: "사무실에서 컴퓨터로 일한다" → "사무관리업", "정보처리업"
- 응답은 반드시 JSON 형식으로만 제공하고, 선택한 업종들을 배열로 반환하세요.

응답 형식:
{
  "industries": ["업종1", "업종2"]
}`
      },
      {
        role: 'user',
        content: `다음 설명에 가장 유사한 업종을 최대 2개 선택해주세요.\n\n업종 설명: ${industryDescription}`
      }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('GPT 응답이 비어있습니다.');
    }

    const parsed = JSON.parse(content);
    const selectedIndustries = parsed.industries || [];

    // 유효성 검증: 선택된 업종이 실제 목록에 있는지 확인
    const validIndustries = selectedIndustries.filter((industry: string) =>
      industries.includes(industry)
    );

    return validIndustries.slice(0, 2); // 최대 2개만 반환
  } catch (error) {
    console.error('업종 분석 오류:', error);
    throw new Error('업종 분석에 실패했습니다.');
  }
}

/**
 * 4단계: 유해위험요인항목을 GPT에게 보내서 관련성 있는 것만 필터링
 */
export async function filterRelevantHazardItems(
  imageBase64: string | null,
  workDescription: string,
  selectedRisks: string[],
  hazardItems: string[]
): Promise<string[]> {
  try {
    const risksString = selectedRisks.join(', ');
    const hazardItemsString = hazardItems.join('\n- ');

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `당신은 산업안전 전문가입니다. 작업 현장의 사진 또는 작업 내용 설명과 관련이 있는 유해위험요인항목만 선택합니다.

**중요**:
- 이미 식별된 위험요소: ${risksString}
- 아래 제공되는 유해위험요인항목들은 위의 위험요소와 실제로 연결되어 있는 항목들입니다.
- 이 항목들 중에서 작업 현장 사진이나 작업 내용과 직접적으로 관련이 있는 항목들만 선택하세요.
- 관련성이 낮거나 불분명한 항목은 제외하세요.

응답은 반드시 JSON 형식으로만 제공하고, 선택한 항목들을 배열로 반환하세요.

응답 형식:
{
  "relevantItems": ["항목1", "항목2", ...]
}`
      }
    ];

    // 이미지가 있는 경우
    if (imageBase64) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: `다음 작업 현장 사진과 작업 내용을 보고, 아래 유해위험요인항목 중에서 관련이 있는 것들을 모두 선택해주세요.\n\n작업 내용: ${workDescription}\n\n유해위험요인항목:\n- ${hazardItemsString}`
          },
          {
            type: 'image_url',
            image_url: {
              url: imageBase64
            }
          }
        ]
      });
    } else {
      // 텍스트만 있는 경우
      messages.push({
        role: 'user',
        content: `다음 작업 내용을 보고, 아래 유해위험요인항목 중에서 관련이 있는 것들을 모두 선택해주세요.\n\n작업 내용: ${workDescription}\n\n유해위험요인항목:\n- ${hazardItemsString}`
      });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('GPT 응답이 비어있습니다.');
    }

    const parsed = JSON.parse(content);
    const selectedItems = parsed.relevantItems || [];

    // 유효성 검증: 선택된 항목이 실제 목록에 있는지 확인
    const validItems = selectedItems.filter((item: string) =>
      hazardItems.includes(item)
    );

    return validItems;
  } catch (error) {
    console.error('유해위험요인항목 필터링 오류:', error);
    throw new Error('유해위험요인항목 필터링에 실패했습니다.');
  }
}

/**
 * 산업재해 유형 분석: 작업 내용을 분석하여 해당하는 산재 유형 식별
 */
export async function analyzeAccidentType(
  imageBase64: string | null,
  workDescription: string
): Promise<AccidentType[]> {
  try {
    // 산업재해 유형 데이터 로드
    const response = await fetch('/output/산업재해_유형.json');
    const accidentTypes: AccidentType[] = await response.json();

    // 20개 산재 유형 목록 문자열 생성
    const typesString = accidentTypes
      .map(t => `${t.id}. ${t.name}: ${t.description} (예: ${t.examples.join(', ')})`)
      .join('\n');

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `당신은 산업안전 전문가입니다. 작업 현장의 사진 또는 작업 내용 설명을 분석하여 발생 가능한 산업재해 유형을 식별합니다.

다음 20개 산업재해 유형 중에서 해당 작업과 관련된 유형을 최대 3개 선택하세요:

${typesString}

**중요**:
- 반드시 위의 20개 유형 중에서만 선택하세요.
- 발생 가능성이 높은 순서대로 최대 3개를 선택하세요.
- 각 유형의 ID와 이름을 정확히 사용하세요.
- 응답은 반드시 JSON 형식으로만 제공하세요.

JSON 응답 형식:
{
  "accidentTypes": [
    {"id": 1, "name": "떨어짐 (추락)"},
    {"id": 2, "name": "넘어짐 (전도)"}
  ]
}`
      }
    ];

    // 이미지가 있는 경우
    if (imageBase64) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: imageBase64
            }
          },
          {
            type: 'text',
            text: `다음 작업 현장 사진과 작업 내용을 분석하여 발생 가능한 산업재해 유형을 최대 3개 선택해주세요.\n\n작업 내용: ${workDescription}`
          }
        ]
      });
    } else {
      // 텍스트만 있는 경우
      messages.push({
        role: 'user',
        content: `다음 작업 내용을 분석하여 발생 가능한 산업재해 유형을 최대 3개 선택해주세요.\n\n작업 내용: ${workDescription}`
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('GPT 응답이 비어있습니다.');
    }

    const parsed = JSON.parse(content);
    const selectedTypes = parsed.accidentTypes || [];

    // 유효성 검증 및 전체 정보 반환
    const validTypes: AccidentType[] = [];
    for (const selected of selectedTypes) {
      const fullType = accidentTypes.find(t => t.id === selected.id);
      if (fullType) {
        validTypes.push(fullType);
      }
    }

    return validTypes.slice(0, 3); // 최대 3개만 반환
  } catch (error) {
    console.error('산업재해 유형 분석 오류:', error);
    throw new Error('산업재해 유형 분석에 실패했습니다.');
  }
}
