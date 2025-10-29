import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Bell, Pin, ChevronRight } from 'lucide-react';
import { Separator } from './ui/separator';

interface Notice {
  id: number;
  title: string;
  content: string;
  date: string;
  isPinned: boolean;
  isNew: boolean;
  category: string;
}

export function NoticeTab() {
  const notices: Notice[] = [
    {
      id: 1,
      title: '2024년 하반기 안전보건교육 일정 안내',
      content: '전 직원 대상 안전보건교육이 11월 5일부터 진행됩니다. 각 부서별로 지정된 일정을 확인하시고 반드시 참석해 주시기 바랍니다.',
      date: '2024.10.29',
      isPinned: true,
      isNew: true,
      category: '교육'
    },
    {
      id: 2,
      title: '산업안전보건법 개정사항 공지',
      content: '2024년 10월 1일부터 개정된 산업안전보건법이 시행됩니다. 주요 변경사항은 첨부파일을 참고해 주세요.',
      date: '2024.10.25',
      isPinned: true,
      isNew: false,
      category: '법규'
    },
    {
      id: 3,
      title: '겨울철 미끄럼 사고 예방 안내',
      content: '겨울철 빙판길 미끄럼 사고를 예방하기 위해 미끄럼방지 매트와 제설장비를 각 현장에 배치하였습니다.',
      date: '2024.10.20',
      isPinned: false,
      isNew: false,
      category: '안전'
    },
    {
      id: 4,
      title: '안전장비 정기점검 실시 안내',
      content: '11월 중 전 현장의 안전장비(안전대, 안전모, 보호구 등) 정기점검을 실시합니다. 불량 장비는 즉시 교체 예정입니다.',
      date: '2024.10.18',
      isPinned: false,
      isNew: false,
      category: '점검'
    },
    {
      id: 5,
      title: '위험성 평가 제도 안내',
      content: '사업장 내 유해·위험요인을 파악하고 위험성을 평가하여 감소대책을 수립·시행하는 위험성평가 제도에 대해 안내드립니다.',
      date: '2024.10.15',
      isPinned: false,
      isNew: false,
      category: '제도'
    },
    {
      id: 6,
      title: '화재 대피 훈련 실시 결과',
      content: '10월 10일 실시된 화재 대피 훈련이 성공적으로 완료되었습니다. 전 직원의 적극적인 참여에 감사드립니다.',
      date: '2024.10.12',
      isPinned: false,
      isNew: false,
      category: '훈련'
    }
  ];

  const pinnedNotices = notices.filter(n => n.isPinned);
  const regularNotices = notices.filter(n => !n.isPinned);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <Card className="p-3 sm:p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          <p className="text-blue-900 text-sm sm:text-base">
            중요한 안전 관련 공지사항을 확인하세요
          </p>
        </div>
      </Card>

      {/* Pinned Notices */}
      {pinnedNotices.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Pin className="w-4 h-4 text-slate-600" />
            <h2 className="text-slate-900">고정 공지</h2>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {pinnedNotices.map((notice) => (
              <Card key={notice.id} className="p-3 sm:p-4 border-2 border-blue-200 bg-blue-50/50">
                <div className="flex items-start gap-3">
                  <Pin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-slate-900 flex-1">{notice.title}</h3>
                      {notice.isNew && (
                        <Badge className="bg-red-600 text-white">NEW</Badge>
                      )}
                      <Badge variant="outline">{notice.category}</Badge>
                    </div>
                    <p className="text-slate-600 mb-2 line-clamp-2">{notice.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">{notice.date}</span>
                      <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                        자세히 보기
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Regular Notices */}
      <div>
        <h2 className="text-slate-900 mb-3">전체 공지사항</h2>
        <div className="space-y-2">
          {regularNotices.map((notice) => (
            <Card key={notice.id} className="p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-slate-900">{notice.title}</h3>
                    <Badge variant="outline" className="flex-shrink-0">
                      {notice.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2 line-clamp-1">
                    {notice.content}
                  </p>
                  <span className="text-sm text-slate-500">{notice.date}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
