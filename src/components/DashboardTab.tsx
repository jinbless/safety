import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Upload, Send, Loader2, AlertTriangle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Alert, AlertDescription } from './ui/alert';
import { AnalysisResults } from './AnalysisResults';
import { analyzeWorkSafety, type AnalysisResult } from '../services/analysisService';

export function DashboardTab() {
  const [query, setQuery] = useState('고소작업 시 안전조치사항이 궁금합니다');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // 실제 AI 분석 실행 (산업재해 유형만)
      const result = await analyzeWorkSafety(uploadedImage, query, '', true);
      setAnalysisResult(result);
      setShowResults(true);
    } catch (err: any) {
      console.error('분석 오류:', err);
      setError(err.message || '분석 중 오류가 발생했습니다.');
      setShowResults(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setQuery('');
    setUploadedImage(null);
    setShowResults(false);
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Input Section */}
      <Card className="p-4 sm:p-6">
        <h2 className="mb-3 sm:mb-4 text-slate-900 text-base sm:text-lg">산업재해 유형 분석</h2>

        <Alert className="mb-3 sm:mb-4 bg-blue-50 border-blue-200">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900 text-sm">
            작업 현장 사진이나 작업 내용을 입력하시면 AI가 발생 가능한 산업재해 유형을 분석합니다.
          </AlertDescription>
        </Alert>

        {/* Image Upload */}
        <div className="mb-3 sm:mb-4">
          <label className="block mb-2 text-slate-700 text-sm sm:text-base">현장 사진 업로드</label>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 sm:p-8 text-center hover:border-blue-400 transition-colors">
            {uploadedImage ? (
              <div className="relative">
                <ImageWithFallback 
                  src={uploadedImage} 
                  alt="업로드된 현장 사진" 
                  className="max-h-64 mx-auto rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-2"
                  onClick={() => setUploadedImage(null)}
                >
                  사진 제거
                </Button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Upload className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                <p className="text-slate-600">클릭하여 사진 업로드</p>
                <p className="text-sm text-slate-400 mt-1">
                  <span className="hidden sm:inline">JPG, PNG (최대 10MB)</span>
                  <span className="sm:hidden">📷 카메라 촬영 또는 갤러리 선택</span>
                </p>
              </label>
            )}
          </div>
        </div>

        {/* Text Query */}
        <div className="mb-3 sm:mb-4">
          <label className="block mb-2 text-slate-700 text-sm sm:text-base">작업 내용 또는 질문</label>
          <Textarea
            placeholder="예: 고소작업 시 안전조치사항이 궁금합니다&#10;예: 이 설비에서 어떤 위험요소가 있나요?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleAnalyze}
            disabled={(!query && !uploadedImage) || isAnalyzing}
            className="flex-1"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                분석 중...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                위험요소 분석
              </>
            )}
          </Button>
          {(query || uploadedImage) && (
            <Button variant="outline" onClick={handleReset}>
              초기화
            </Button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="mt-4 bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-900 text-sm">
              {error}
            </AlertDescription>
          </Alert>
        )}
      </Card>

      {/* Results Section */}
      {showResults && analysisResult && (
        <AnalysisResults
          query={query}
          hasImage={!!uploadedImage}
          analysisResult={analysisResult}
        />
      )}
    </div>
  );
}
