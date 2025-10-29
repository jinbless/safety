import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { MessageSquare, ThumbsUp, Plus, Search } from 'lucide-react';
import { Separator } from './ui/separator';

interface Post {
  id: number;
  author: string;
  authorInitial: string;
  title: string;
  content: string;
  category: string;
  likes: number;
  comments: number;
  date: string;
}

export function CommunityTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: '안전관리자',
      authorInitial: '안',
      title: '밀폐공간 작업 시 환기 기준 문의',
      content: '밀폐공간에서 용접작업을 할 때 환기 기준이 궁금합니다. 보통 몇 분마다 환기를 해야 하나요?',
      category: '밀폐공간',
      likes: 12,
      comments: 5,
      date: '2024.10.28'
    },
    {
      id: 2,
      author: '현장소장',
      authorInitial: '현',
      title: '고소작업대 점검주기 관련',
      content: '고소작업대를 매일 사용하고 있는데, 법적으로 정해진 점검주기가 어떻게 되나요?',
      category: '고소작업',
      likes: 8,
      comments: 3,
      date: '2024.10.27'
    },
    {
      id: 3,
      author: '안전담당',
      authorInitial: '담',
      title: '화학물질 보관 시 주의사항 공유',
      content: '최근 화학물질 보관 관련 교육을 받았는데, 유용한 정보 공유드립니다. MSDS는 항상 현장에 비치해야 합니다.',
      category: '화학물질',
      likes: 15,
      comments: 7,
      date: '2024.10.26'
    }
  ]);

  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: '일반'
  });

  const handleCreatePost = () => {
    const post: Post = {
      id: posts.length + 1,
      author: '사용자',
      authorInitial: '사',
      title: newPost.title,
      content: newPost.content,
      category: newPost.category,
      likes: 0,
      comments: 0,
      date: new Date().toLocaleDateString('ko-KR').replace(/\. /g, '.').slice(0, -1)
    };
    setPosts([post, ...posts]);
    setNewPost({ title: '', content: '', category: '일반' });
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search and Create */}
      <Card className="p-3 sm:p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="게시글 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="text-sm sm:text-base px-3 sm:px-4">
                <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">글쓰기</span>
                <span className="sm:hidden">글쓰기</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle>새 게시글 작성</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>카테고리</Label>
                  <select
                    className="w-full mt-1 p-2 border rounded-md"
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  >
                    <option>일반</option>
                    <option>고소작업</option>
                    <option>밀폐공간</option>
                    <option>화학물질</option>
                    <option>전기작업</option>
                    <option>중장비</option>
                  </select>
                </div>
                <div>
                  <Label>제목</Label>
                  <Input
                    placeholder="제목을 입력하세요"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>내용</Label>
                  <Textarea
                    placeholder="내용을 입력하세요"
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    rows={6}
                    className="mt-1 resize-none"
                  />
                </div>
                <Button
                  onClick={handleCreatePost}
                  disabled={!newPost.title || !newPost.content}
                  className="w-full"
                >
                  게시글 등록
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* Posts List */}
      <div className="space-y-2 sm:space-y-3">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start gap-3">
              <Avatar>
                <AvatarFallback className="bg-blue-600 text-white">
                  {post.authorInitial}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-slate-900">{post.author}</span>
                  <span className="text-sm text-slate-400">·</span>
                  <span className="text-sm text-slate-500">{post.date}</span>
                  <Badge variant="outline" className="ml-auto">
                    {post.category}
                  </Badge>
                </div>
                <h3 className="text-slate-900 mb-2">{post.title}</h3>
                <p className="text-slate-600 mb-3 line-clamp-2">{post.content}</p>
                <Separator className="my-3" />
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments}</span>
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
