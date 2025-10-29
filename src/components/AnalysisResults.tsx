import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  FileText,
  DollarSign,
  AlertCircle,
  Video,
  CheckCircle,
  XCircle,
  Download,
  ZoomIn,
  ExternalLink,
  BookOpen,
  Scale,
  Building2
} from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from './ui/drawer';
import { ScrollArea } from './ui/scroll-area';

import type { AnalysisResult } from '../services/analysisService';

interface AnalysisResultsProps {
  query: string;
  hasImage: boolean;
  analysisResult: AnalysisResult;
}

interface Leaflet {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  fullImageUrl: string;
  items: string[];
  detailedSteps: {
    step: number;
    title: string;
    content: string;
  }[];
  downloadUrl: string;
}

interface Penalty {
  id: number;
  violation: string;
  penalty: string;
  law: string;
  lawArticle: string;
  fullText: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  applicableSituations: string[];
  exemptions: string[];
}

interface AccidentCase {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
  detailedDescription: string;
  injuries: string;
  cause: string;
  preventionMeasures: string[];
  imageUrls: string[];
}

interface VideoData {
  id: number;
  title: string;
  duration: string;
  thumbnail: string;
  description: string;
  youtubeId: string;
  uploadDate: string;
  viewCount: string;
}

interface AccidentVideoData {
  id: number;
  name: string;
  videos: string[];
  videoCount: number;
}

interface VideoWithType {
  url: string;
  typeName: string;
  index: number;
}

interface RealAccidentCase {
  id: number;
  title: string;
  industry: string;
  description: string;
  accidentType: string;
  accidentTypeId: number;
  originalType: string;
}

export function AnalysisResults({ query, hasImage, analysisResult }: AnalysisResultsProps) {
  const [selectedLeaflet, setSelectedLeaflet] = useState<Leaflet | null>(null);
  const [selectedPenalty, setSelectedPenalty] = useState<Penalty | null>(null);
  const [selectedCase, setSelectedCase] = useState<AccidentCase | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [accidentVideos, setAccidentVideos] = useState<AccidentVideoData[]>([]);
  const [relevantVideos, setRelevantVideos] = useState<VideoWithType[]>([]);
  const [allAccidentCases, setAllAccidentCases] = useState<RealAccidentCase[]>([]);
  const [filteredCases, setFilteredCases] = useState<RealAccidentCase[]>([]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load accident videos from JSON
  useEffect(() => {
    fetch('/output/사고영상.json')
      .then(res => res.json())
      .then((data: AccidentVideoData[]) => {
        setAccidentVideos(data);
      })
      .catch(err => console.error('사고영상 로드 실패:', err));
  }, []);

  // Load accident cases from JSON
  useEffect(() => {
    fetch('/output/사고사례.json')
      .then(res => res.json())
      .then((data: RealAccidentCase[]) => {
        setAllAccidentCases(data);
      })
      .catch(err => console.error('사고사례 로드 실패:', err));
  }, []);

  // Fisher-Yates shuffle algorithm for true random selection
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Filter and randomize videos based on identified accident types
  useEffect(() => {
    if (analysisResult.accidentTypes.length > 0 && accidentVideos.length > 0) {
      const selectedVideos: VideoWithType[] = [];

      // For each identified accident type, get up to 2 random videos
      analysisResult.accidentTypes.forEach(accidentType => {
        const matchingVideoData = accidentVideos.find(v => v.id === accidentType.id);

        if (matchingVideoData && matchingVideoData.videos.length > 0) {
          // Use Fisher-Yates shuffle for true random selection
          const shuffled = shuffleArray(matchingVideoData.videos);
          // Select maximum 2 videos from the shuffled array
          const selected = shuffled.slice(0, Math.min(2, shuffled.length));

          // Add type information to each video
          selected.forEach((url, idx) => {
            selectedVideos.push({
              url: url,
              typeName: accidentType.name,
              index: idx + 1
            });
          });
        }
      });

      setRelevantVideos(selectedVideos);
    } else {
      setRelevantVideos([]);
    }
  }, [analysisResult.accidentTypes, accidentVideos]);

  // Filter accident cases based on identified accident types
  useEffect(() => {
    if (analysisResult.accidentTypes.length > 0 && allAccidentCases.length > 0) {
      const identifiedTypeIds = analysisResult.accidentTypes.map(t => t.id);

      // Filter cases that match any of the identified accident types
      const matchingCases = allAccidentCases.filter(c =>
        identifiedTypeIds.includes(c.accidentTypeId)
      );

      // Shuffle and select up to 6 cases
      const shuffled = shuffleArray(matchingCases);
      const selected = shuffled.slice(0, Math.min(6, shuffled.length));

      setFilteredCases(selected);
    } else {
      setFilteredCases([]);
    }
  }, [analysisResult.accidentTypes, allAccidentCases]);

  // Mock data - 실제로는 DB에서 가져온 데이터
  const mockLeaflets: Leaflet[] = [
    {
      id: 1,
      title: '고소작업 안전수칙',
      description: '추락방지를 위한 필수 안전조치',
      imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400',
      fullImageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200',
      items: ['안전대 착용', '작업발판 설치', '안전난간 설치', '작업구역 표시'],
      detailedSteps: [
        {
          step: 1,
          title: '작업 전 안전점검',
          content: '작업 시작 전 안전대, 안전모, 안전화 등 개인보호구의 이상 유무를 점검하고, 작업발판의 견고성을 확인합니다.'
        },
        {
          step: 2,
          title: '안전대 착용 및 체결',
          content: '안전대를 착용하고 작업 위치에서 이탈하지 않도록 안전줄을 견고한 구조물에 체결합니다. 충격흡수장치가 있는 안전대를 사용합니다.'
        },
        {
          step: 3,
          title: '작업구역 설정',
          content: '작업 구역 하부에는 출입금지 표지판을 설치하고, 낙하물 방지망을 설치하여 2차 사고를 예방합니다.'
        },
        {
          step: 4,
          title: '안전난간 설치',
          content: '작업발판 주변에 상부난간(90-120cm), 중간난간(45-60cm), 발끝막이판(10cm 이상)을 설치합니다.'
        }
      ],
      downloadUrl: '/downloads/leaflet-1.pdf'
    },
    {
      id: 2,
      title: '안전모 착용 기준',
      description: '머리 보호구 올바른 사용법',
      imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400',
      fullImageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200',
      items: ['턱끈 체결', '충격흡수재 점검', '유효기간 확인', '개인별 착용'],
      detailedSteps: [
        {
          step: 1,
          title: '안전모 선택',
          content: '작업 특성에 맞는 안전모를 선택합니다. ABS, PE, FRP 재질 중 적합한 것을 선택하고 KCS 인증 제품을 사용합니다.'
        },
        {
          step: 2,
          title: '착용 방법',
          content: '안전모를 머리에 수평으로 착용하고, 턱끈을 확실히 체결합니다. 헐렁하게 착용하면 충격 시 벗겨질 수 있습니다.'
        },
        {
          step: 3,
          title: '일상 점검',
          content: '매일 착용 전 충격흡수재, 착장체(머리띠), 턱끈의 손상 여부를 확인합니다.'
        }
      ],
      downloadUrl: '/downloads/leaflet-2.pdf'
    }
  ];

  const mockPenalties: Penalty[] = [
    {
      id: 1,
      violation: '안전대 미착용',
      penalty: '500만원 이하 과태료',
      law: '산업안전보건법 제68조',
      lawArticle: '제68조(안전조치)',
      fullText: '사업주는 근로자가 추락하거나 넘어질 위험이 있는 장소, 토사·구축물 등이 붕괴할 우려가 있는 장소, 물체가 떨어지거나 날아올 우려가 있는 장소 또는 천장·바닥 또는 벽이 무너질 우려가 있는 장소에는 안전난간, 울타리, 수직형 추락방망 또는 덮개 등의 방호 조치를 하여야 한다.',
      severity: 'high',
      applicableSituations: [
        '2m 이상 높이에서의 작업',
        '작업발판이 설치되지 않은 고소작업',
        '비계 위에서의 작업',
        '지붕 위에서의 작업'
      ],
      exemptions: [
        '안전난간이 설치된 작업발판에서 작업하는 경우',
        '추락방지망이 설치된 경우 (단, 추락 위험이 없는 높이)'
      ]
    },
    {
      id: 2,
      violation: '작업발판 미설치',
      penalty: '1,000만원 이하 과태료',
      law: '산업안전보건법 제167조',
      lawArticle: '제167조(벌칙)',
      fullText: '제68조를 위반하여 안전조치를 하지 아니한 자는 5년 이하의 징역 또는 5천만원 이하의 벌금에 처한다. 안전조치 의무 위반으로 근로자가 사망한 경우 7년 이하의 징역 또는 1억원 이하의 벌금에 처한다.',
      severity: 'critical',
      applicableSituations: [
        '비계 조립 시 작업발판 미설치',
        '작업발판의 폭이 40cm 미만인 경우',
        '작업발판 틈새가 3cm를 초과하는 경우',
        '작업발판 재료가 강도 기준 미달인 경우'
      ],
      exemptions: [
        '일시적인 경미한 작업(10분 이내)으로 추락위험이 없는 경우',
        '물리적으로 작업발판 설치가 불가능하고 대체 안전조치를 한 경우'
      ]
    },
    {
      id: 3,
      violation: '안전교육 미실시',
      penalty: '300만원 이하 과태료',
      law: '산업안전보건법 제32조',
      lawArticle: '제32조(근로자에 대한 안전보건교육)',
      fullText: '사업주는 소속 근로자에게 고용노동부령으로 정하는 바에 따라 정기적으로 안전보건교육을 하여야 한다. 신규채용 시 8시간, 작업내용 변경 시 2시간, 정기교육(관리감독자 연 16시간, 사무직 연 6시간, 기타 연 12시간) 이상 실시해야 한다.',
      severity: 'medium',
      applicableSituations: [
        '신규 채용 근로자 교육 미실시',
        '정기 안전보건교육 미실시',
        '작업내용 변경 시 교육 미실시',
        '특별교육 대상 작업 교육 미실시'
      ],
      exemptions: [
        '천재지변 등 불가피한 사유가 있는 경우',
        '교육 실시 후 증빙자료가 있는 경우'
      ]
    }
  ];

  const mockCases: AccidentCase[] = [
    {
      id: 1,
      title: '건설현장 추락사고',
      date: '2024.08.15',
      location: '서울 강남구 테헤란로 건설현장',
      description: '고소작업 중 안전대 미착용으로 인한 추락사고',
      detailedDescription: '피재자는 5층 건물 외벽 도장작업을 위해 곤도라 작업대에서 작업 중이었습니다. 작업 시작 30분 후, 곤도라 와이어 한쪽이 풀리면서 작업대가 기울었고, 안전대를 착용하지 않았던 피재자는 약 15m 아래로 추락하였습니다. 사고 직후 119 구조대가 출동하여 병원으로 이송하였으나 중상을 입었습니다.',
      injuries: '중상 1명 (척추골절, 입원 6개월)',
      cause: '안전대 미착용, 안전난간 미설치, 곤도라 점검 소홀',
      preventionMeasures: [
        '작업 전 안전대 착용 의무화 및 관리감독자 확인',
        '곤도라 작업 시작 전 안전점검 실시',
        '작업발판 주변 안전난간 설치',
        '근로자 안전교육 정기 실시',
        '추락방지망 설치'
      ],
      imageUrls: [
        'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600',
        'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600'
      ]
    },
    {
      id: 2,
      title: '작업발판 붕괴사고',
      date: '2024.06.22',
      location: '경기 수원시 영통구 공장',
      description: '작업발판 강도 부족으로 붕괴',
      detailedDescription: '공장 내부 천장 보수 작업을 위해 임시 작업발판을 설치하고 3명의 근로자가 동시에 작업 중이었습니다. 작업발판으로 사용한 목재가 하중을 견디지 못하고 부러지면서 2명의 근로자가 약 4m 아래로 추락하였습니다. 작업발판의 강도 계산이 이루어지지 않았고, 노후된 목재를 사용한 것이 원인으로 밝혀졌습니다.',
      injuries: '경상 2명 (타박상, 통원치료 2주)',
      cause: '작업발판 강도 미달, 안전점검 소홀, 노후 자재 사용',
      preventionMeasures: [
        '작업발판 설치 전 강도 계산 실시',
        '작업발판 재료의 품질 기준 준수',
        '정기적인 작업발판 안전점검',
        '최대 적재하중 표시 및 초과 금지',
        '작업발판 하부 안전망 설치'
      ],
      imageUrls: [
        'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=600',
        'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600'
      ]
    }
  ];

  const mockVideos: VideoData[] = [
    {
      id: 1,
      title: '고소작업 추락사고 CCTV',
      duration: '2:15',
      thumbnail: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400',
      description: '안전대 미착용으로 인한 추락사고 영상',
      youtubeId: 'dQw4w9WgXcQ', // 실제 유튜브 ID로 교체
      uploadDate: '2024.08.20',
      viewCount: '12,450'
    },
    {
      id: 2,
      title: '안전장비 미착용 사고',
      duration: '1:45',
      thumbnail: 'https://images.unsplash.com/photo-1581093458791-9d42e5d6d8e8?w=400',
      description: '안전모 미착용 낙하물 사고 재현',
      youtubeId: 'dQw4w9WgXcQ', // 실제 유튜브 ID로 교체
      uploadDate: '2024.07.15',
      viewCount: '8,320'
    },
    {
      id: 3,
      title: '작업발판 붕괴 실험 영상',
      duration: '3:20',
      thumbnail: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=400',
      description: '강도 미달 작업발판의 위험성 실험',
      youtubeId: 'dQw4w9WgXcQ', // 실제 유튜브 ID로 교체
      uploadDate: '2024.06.30',
      viewCount: '15,780'
    }
  ];

  // Extract YouTube video ID from URL
  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/shorts\/)([^?&]+)/,
      /(?:youtube\.com\/watch\?v=)([^&]+)/,
      /(?:youtu\.be\/)([^?&]+)/,
      /(?:youtube\.com\/embed\/)([^?&]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  };

  // Get thumbnail URL from YouTube video URL
  const getYouTubeThumbnail = (url: string): string => {
    const videoId = extractYouTubeId(url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    return 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'critical': return '매우높음';
      case 'high': return '높음';
      case 'medium': return '보통';
      default: return '낮음';
    }
  };

  return (
    <>
      <Card className="p-4 sm:p-6">
        <div className="flex items-start gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="bg-green-100 p-1.5 sm:p-2 rounded-lg">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-slate-900 mb-1 text-base sm:text-lg">분석 완료</h2>
            <p className="text-slate-600 text-sm sm:text-base">
              {hasImage && '이미지와 '}질문 내용을 분석하여 관련 안전정보를 찾았습니다.
            </p>
          </div>
        </div>

        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="videos" className="text-xs sm:text-sm flex-col sm:flex-row gap-0.5 sm:gap-1 py-2">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">사고영상</span>
              <span className="sm:hidden">영상</span>
            </TabsTrigger>
            <TabsTrigger value="cases" className="text-xs sm:text-sm flex-col sm:flex-row gap-0.5 sm:gap-1 py-2">
              <AlertCircle className="w-4 h-4" />
              <span className="hidden sm:inline">사고사례</span>
              <span className="sm:hidden">사례</span>
            </TabsTrigger>
            <TabsTrigger value="leaflets" className="text-xs sm:text-sm flex-col sm:flex-row gap-0.5 sm:gap-1 py-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">조치방법</span>
              <span className="sm:hidden">조치</span>
            </TabsTrigger>
            <TabsTrigger value="penalties" className="text-xs sm:text-sm flex-col sm:flex-row gap-0.5 sm:gap-1 py-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">벌금규정</span>
              <span className="sm:hidden">벌금</span>
            </TabsTrigger>
          </TabsList>

          {/* Leaflets Tab - 실제 분석 결과 표시 */}
          <TabsContent value="leaflets" className="mt-4 sm:mt-6">
            <div className="space-y-4">
              {/* 산업재해 유형 표시 */}
              {analysisResult.accidentTypes && analysisResult.accidentTypes.length > 0 && (
                <Card className="p-4 bg-red-50 border-red-200 border-2">
                  <h3 className="text-red-900 font-semibold mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    발생 가능한 산업재해 유형 ({analysisResult.accidentTypes.length}개)
                  </h3>
                  <div className="space-y-3">
                    {analysisResult.accidentTypes.map((type, idx) => (
                      <div key={type.id} className="bg-white p-3 rounded-lg border border-red-200">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-red-900 font-semibold mb-1">{type.name}</h4>
                            <p className="text-sm text-slate-700 mb-2">{type.description}</p>
                            {type.examples.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                <span className="text-xs text-slate-600">예:</span>
                                {type.examples.map((ex, i) => (
                                  <span key={i} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                    {ex}
                                  </span>
                                ))}
                              </div>
                            )}
                            {type.frequency && (
                              <p className="text-xs text-red-600 mt-2 font-medium">
                                📊 {type.frequency}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Penalties Tab */}
          <TabsContent value="penalties" className="mt-6">
            <div className="space-y-3">
              {mockPenalties.map((penalty) => (
                <Card 
                  key={penalty.id} 
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedPenalty(penalty)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-slate-900">{penalty.violation}</h3>
                        <Badge className={getSeverityColor(penalty.severity)}>
                          {getSeverityText(penalty.severity)}
                        </Badge>
                      </div>
                      <p className="text-slate-600 mb-1">
                        과태료: <span className="text-red-600">{penalty.penalty}</span>
                      </p>
                      <p className="text-sm text-slate-500 mb-2">
                        법적 근거: {penalty.law}
                      </p>
                      <Button variant="link" className="p-0 h-auto text-blue-600">
                        상세 법령 내용 보기 →
                      </Button>
                    </div>
                    <XCircle className={`w-8 h-8 flex-shrink-0 ${
                      penalty.severity === 'critical' ? 'text-red-600' :
                      penalty.severity === 'high' ? 'text-orange-600' :
                      'text-yellow-600'
                    }`} />
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Cases Tab */}
          <TabsContent value="cases" className="mt-6">
            {filteredCases.length > 0 ? (
              <div className="space-y-4">
                {filteredCases.map((case_) => (
                  <Card
                    key={case_.id}
                    className="p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-red-100 p-2 rounded-lg flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <h3 className="text-slate-900 font-semibold">{case_.title}</h3>
                          <Badge className="bg-red-100 text-red-800 border-red-300 whitespace-nowrap">
                            {case_.accidentType}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">
                          🏢 {case_.industry}
                        </p>
                        <p className="text-slate-700 whitespace-pre-wrap">{case_.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">
                  {analysisResult.accidentTypes.length > 0
                    ? '관련 사고사례를 불러오는 중...'
                    : '분석 결과가 없습니다. 먼저 작업 내용을 분석해주세요.'}
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="mt-6">
            {relevantVideos.length > 0 ? (
              <div className="space-y-4">
                {/* 상단 설명 문구 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    실제 사고 영상을 통해 위험성을 확인하세요
                  </p>
                </div>

                {/* 영상 목록 */}
                <div className="grid md:grid-cols-2 gap-4">
                  {relevantVideos.map((video, index) => {
                    const videoId = extractYouTubeId(video.url);
                    const thumbnail = getYouTubeThumbnail(video.url);

                    return (
                      <Card
                        key={index}
                        className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setSelectedVideo(video.url)}
                      >
                        <div className="relative">
                          <ImageWithFallback
                            src={thumbnail}
                            alt={`${video.typeName} 사고 영상`}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                            <div className="bg-white bg-opacity-90 rounded-full p-4">
                              <Video className="w-8 h-8 text-slate-900" />
                            </div>
                          </div>
                          <Badge className="absolute top-2 right-2 bg-red-600 text-white">
                            YouTube
                          </Badge>
                        </div>
                        <div className="p-4">
                          <h3 className="text-slate-900 mb-2 font-semibold">
                            {video.typeName} #{video.index}
                          </h3>
                          <Button variant="link" className="p-0 h-auto text-blue-600">
                            영상 보기 →
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Video className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">
                  {analysisResult.accidentTypes.length > 0
                    ? '관련 영상을 불러오는 중...'
                    : '분석 결과가 없습니다. 먼저 작업 내용을 분석해주세요.'}
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Leaflet Detail Modal */}
      <Dialog open={!!selectedLeaflet} onOpenChange={() => setSelectedLeaflet(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {selectedLeaflet?.title}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <div className="space-y-6 pr-4">
              <ImageWithFallback
                src={selectedLeaflet?.fullImageUrl || ''}
                alt={selectedLeaflet?.title || ''}
                className="w-full rounded-lg"
              />
              <div>
                <h3 className="text-slate-900 mb-2">개요</h3>
                <p className="text-slate-600">{selectedLeaflet?.description}</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-slate-900 mb-4">상세 안전조치 절차</h3>
                <div className="space-y-4">
                  {selectedLeaflet?.detailedSteps.map((step) => (
                    <div key={step.step} className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-slate-900 mb-1">{step.title}</h4>
                        <p className="text-sm text-slate-600">{step.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  리플릿 다운로드
                </Button>
                <Button variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  인쇄하기
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Penalty Detail Modal */}
      <Dialog open={!!selectedPenalty} onOpenChange={() => setSelectedPenalty(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5" />
              {selectedPenalty?.violation} - 벌금규정 상세
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <div className="space-y-6 pr-4">
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-900">위반 내용</span>
                </div>
                <p className="text-slate-900">{selectedPenalty?.violation}</p>
                <Badge className={`mt-2 ${getSeverityColor(selectedPenalty?.severity || 'low')}`}>
                  위험도: {getSeverityText(selectedPenalty?.severity || 'low')}
                </Badge>
              </div>

              <div>
                <h3 className="text-slate-900 mb-2 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-red-600" />
                  과태료 및 처벌
                </h3>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-red-600">{selectedPenalty?.penalty}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-slate-900 mb-2 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  법적 근거
                </h3>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-slate-900 mb-2">{selectedPenalty?.lawArticle}</p>
                  <p className="text-sm text-slate-700">{selectedPenalty?.fullText}</p>
                </div>
              </div>

              <div>
                <h3 className="text-slate-900 mb-2">적용 대상</h3>
                <ul className="space-y-2">
                  {selectedPenalty?.applicableSituations.map((situation, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{situation}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-slate-900 mb-2">적용 제외 사유</h3>
                <ul className="space-y-2">
                  {selectedPenalty?.exemptions.map((exemption, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{exemption}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Accident Case Detail Modal */}
      <Dialog open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              {selectedCase?.title}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <div className="space-y-6 pr-4">
              <div className="grid grid-cols-2 gap-2">
                {selectedCase?.imageUrls.map((url, idx) => (
                  <ImageWithFallback
                    key={idx}
                    src={url}
                    alt={`사고 현장 사진 ${idx + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">발생일시</p>
                  <p className="text-slate-900">{selectedCase?.date}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">발생장소</p>
                  <p className="text-slate-900">{selectedCase?.location}</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <h3 className="text-red-900 mb-2">피해 현황</h3>
                <p className="text-slate-900">{selectedCase?.injuries}</p>
              </div>

              <Separator />

              <div>
                <h3 className="text-slate-900 mb-2">사고 경위</h3>
                <p className="text-slate-700 leading-relaxed">{selectedCase?.detailedDescription}</p>
              </div>

              <div>
                <h3 className="text-slate-900 mb-2">사고 원인</h3>
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                  <p className="text-slate-900">{selectedCase?.cause}</p>
                </div>
              </div>

              <div>
                <h3 className="text-slate-900 mb-3">재발 방지 대책</h3>
                <ul className="space-y-2">
                  {selectedCase?.preventionMeasures.map((measure, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm">
                        {idx + 1}
                      </div>
                      <span className="text-slate-700">{measure}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Video Player Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-5xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              산업재해 영상
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
              {selectedVideo && extractYouTubeId(selectedVideo) && (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${extractYouTubeId(selectedVideo)}`}
                  title="산업재해 영상"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-slate-700">
                실제 산업 현장에서 발생한 사고 영상입니다. 유사한 상황에서 안전 수칙을 준수하여 사고를 예방하시기 바랍니다.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => selectedVideo && window.open(selectedVideo, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                YouTube에서 보기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
