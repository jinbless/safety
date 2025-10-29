import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { DashboardTab } from './components/DashboardTab';
import { CommunityTab } from './components/CommunityTab';
import { NoticeTab } from './components/NoticeTab';
import { Shield, MessageSquare, Bell } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-blue-900 text-base sm:text-xl">산업재해 예방 안전관리</h1>
              <p className="text-slate-600 text-xs sm:text-sm hidden sm:block">AI 기반 위험요소 분석 시스템</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 py-4 sm:px-6 lg:px-8 pb-20 sm:pb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">위험요소 분석</span>
              <span className="sm:hidden">분석</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <MessageSquare className="w-4 h-4" />
              게시판
            </TabsTrigger>
            <TabsTrigger value="notice" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Bell className="w-4 h-4" />
              공지사항
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab />
          </TabsContent>

          <TabsContent value="community">
            <CommunityTab />
          </TabsContent>

          <TabsContent value="notice">
            <NoticeTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
