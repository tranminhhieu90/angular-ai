import { AfterViewInit, Component, computed, HostListener, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

type DemoTab = 'teleprompter' | 'dictation' | 'voice';

interface Counter {
  value: number;
  target: number;
  suffix: string;
  label: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  readonly scrolled = signal(false);
  readonly activeTab = signal<DemoTab>('teleprompter');
  readonly tabs: ReadonlyArray<{ id: DemoTab; label: string }> = [
    { id: 'teleprompter', label: '📖 Máy nhắc chữ' },
    { id: 'dictation', label: '🎵 Nghe chính tả' },
    { id: 'voice', label: '🎤 Phát âm' },
  ];

  readonly counters = signal<Counter[]>([
    { value: 0, target: 12000, suffix: '+', label: '🧒 Bé đang học' },
    { value: 0, target: 98, suffix: '%', label: '😊 Phụ huynh hài lòng' },
    { value: 0, target: 50, suffix: '+', label: '📚 Bài học mẫu' },
  ]);

  readonly features = [
    {
      eyebrow: '📖 READ',
      title: 'Máy nhắc chữ thông minh',
      description:
        'Dán truyện, bài đọc hay slide yêu thích — Wapple giúp luyện đọc trôi chảy theo nhịp, phù hợp cả bé nhỏ lẫn người lớn ôn thi hay thuyết trình.',
      color: '#ff9f43',
      iconPath: 'M5 3l14 9-14 9V3z',
    },
    {
      eyebrow: '🎵 LISTEN',
      title: 'Nghe và viết chính tả',
      description:
        'Nghe câu tiếng Anh rồi viết lại — Wapple chấm điểm tức thì và chỉ đúng chỗ cần luyện thêm, vui như chơi game cho bé!',
      color: '#06b6d4',
      iconPath:
        'M3 18v-6a9 9 0 0118 0v6M3 18a2 2 0 01-2-2v-1a2 2 0 012-2h1m16 0a2 2 0 012 2v1a2 2 0 01-2 2h-1',
    },
    {
      eyebrow: '🎤 SPEAK',
      title: 'Chấm điểm phát âm AI',
      description:
        'Nói to — AI chấm điểm ngay! Xem từng từ phát âm đúng hay chưa, luyện đến khi tự tin như người bản ngữ.',
      color: '#a78bfa',
      iconPath:
        'M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4m-4 0h8',
    },
  ];

  readonly steps = [
    {
      number: '01',
      title: '📥 Chọn nội dung yêu thích',
      description:
        'Truyện tranh, bài hát, video hay tài liệu công việc — chỉ cần dán vào là bắt đầu luyện tập!',
    },
    {
      number: '02',
      title: '🎯 Chọn cách luyện tập',
      description:
        'Đọc theo máy nhắc chữ, nghe rồi viết chính tả, hoặc luyện phát âm cùng AI — tự chọn theo sở thích!',
    },
    {
      number: '03',
      title: '🏆 Nhận điểm và tiến bộ mỗi ngày',
      description:
        'Xem điểm số, huy hiệu và chuỗi ngày học để giữ động lực — học vui như chơi game mỗi ngày!',
    },
  ];

  readonly progressCards = [
    { label: '🎯 Độ chính xác', value: '94%', color: '#06b6d4', width: '94%' },
    { label: '⚡ Tốc độ đọc', value: '142 wpm', color: '#ff9f43', width: '78%' },
    { label: '🌟 Phát âm', value: 'A+', color: '#a78bfa', width: '88%' },
  ];

  readonly weeklyActivity = [
    { label: 'T2', height: 32 },
    { label: 'T3', height: 55 },
    { label: 'T4', height: 42 },
    { label: 'T5', height: 76 },
    { label: 'T6', height: 61 },
    { label: 'T7', height: 92 },
    { label: 'CN', height: 70 },
  ];

  readonly testimonials = [
    {
      quote:
        'Con gái mình trước không chịu học tiếng Anh, nhưng giờ tự ngồi luyện phát âm mỗi tối!',
      name: 'Chị Nguyễn Minh Anh',
      role: 'Mẹ của bé Hà, 9 tuổi',
      initials: 'MA',
    },
    {
      quote:
        'Bé nhà tôi thích nhất phần nghe chính tả vì được tự chọn bài yêu thích.',
      name: 'Anh Trần Quốc Bảo',
      role: 'Bố của bé Minh, 8 tuổi',
      initials: 'QB',
    },
    {
      quote:
        'Học sinh của tôi tiến bộ rõ rệt sau 1 tháng. Các em thích nhất được nhìn thấy điểm số cải thiện sau mỗi buổi luyện tập!',
      name: 'Cô Lê Thu Hà',
      role: 'Giáo viên tiếng Anh tiểu học',
      initials: 'TH',
    },
  ];

  readonly benefits = ['🚫 Không quảng cáo', '💳 Không cần thẻ tín dụng', '👨‍👩‍👧 Cả nhà cùng học'];
  readonly stars = [1, 2, 3, 4, 5];
  readonly waveHeights = [4, 8, 6, 11, 7, 13, 5, 10, 7, 5, 12, 8];
  readonly voiceWaveHeights = [7, 12, 5, 15, 9, 13, 6, 11, 8, 16, 5, 12, 9, 14, 7];

  readonly teleText = signal(
    'The cat sat on the mat. The dog ran in the park. I love learning English every day!',
  );
  readonly teleWords = computed(() => this.teleText().trim().split(/\s+/).filter(Boolean));
  readonly telePosition = signal(0);
  readonly teleRunning = signal(false);

  readonly sentences = [
    'I like to play with my friends after school.',
    'The sun is bright and the sky is blue today.',
    'Learning English is fun and easy with Wapple!',
  ];
  readonly dictationIndex = signal(0);
  readonly dictationAnswer = signal('');
  readonly dictationScore = signal<number | null>(null);
  readonly dictationPlaying = signal(false);

  readonly voiceTarget = 'Hello my name is Alex and I love learning English every day';
  readonly voiceRecording = signal(false);
  readonly voiceTranscript = signal('');
  readonly voiceScore = signal<number | null>(null);
  readonly voiceWords = computed(() => {
    const transcript = this.voiceTranscript();
    if (!transcript) return [];

    const targetWords = this.voiceTarget.split(' ');
    const spokenWords = transcript.split(' ');

    return targetWords.map((targetWord, index) => ({
      word: spokenWords[index] || '-',
      correct: (spokenWords[index] || '').toLowerCase() === targetWord.toLowerCase(),
    }));
  });

  private teleprompterTimer: ReturnType<typeof setInterval> | null = null;
  private dictationTimer: ReturnType<typeof setTimeout> | null = null;
  private voiceTimer: ReturnType<typeof setTimeout> | null = null;
  private counterTimers: Array<ReturnType<typeof setInterval>> = [];
  private statsObserver: IntersectionObserver | null = null;
  private countersAnimated = false;
  private readonly numberFormatter = new Intl.NumberFormat('vi-VN');

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.scrolled.set(window.scrollY > 16);
  }

  ngAfterViewInit(): void {
    const statsElement = document.querySelector<HTMLElement>('#home-stats');

    if (!statsElement || typeof IntersectionObserver === 'undefined') {
      this.animateCounters();
      return;
    }

    this.statsObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          this.animateCounters();
          this.statsObserver?.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    this.statsObserver.observe(statsElement);
  }

  setActiveTab(tab: DemoTab): void {
    if (this.activeTab() === 'teleprompter' && tab !== 'teleprompter') {
      this.stopTeleprompter();
    }
    if (this.activeTab() === 'dictation' && tab !== 'dictation') {
      if (this.dictationTimer) {
        clearTimeout(this.dictationTimer);
        this.dictationTimer = null;
      }
      this.dictationPlaying.set(false);
    }
    if (this.activeTab() === 'voice' && tab !== 'voice') {
      if (this.voiceTimer) {
        clearTimeout(this.voiceTimer);
        this.voiceTimer = null;
      }
      this.voiceRecording.set(false);
    }
    this.activeTab.set(tab);
  }

  formatCounter(value: number): string {
    return this.numberFormatter.format(value);
  }

  updateTeleText(event: Event): void {
    this.stopTeleprompter();
    this.telePosition.set(0);
    this.teleText.set((event.target as HTMLTextAreaElement).value);
  }

  toggleTeleprompter(): void {
    if (this.teleRunning()) {
      this.stopTeleprompter();
      return;
    }
    if (!this.teleWords().length) return;

    this.telePosition.set(0);
    this.teleRunning.set(true);
    this.teleprompterTimer = setInterval(() => {
      const nextPosition = this.telePosition() + 1;
      if (nextPosition >= this.teleWords().length) {
        this.stopTeleprompter();
        this.telePosition.set(0);
        return;
      }
      this.telePosition.set(nextPosition);
    }, 520);
  }

  selectSentence(index: number): void {
    this.dictationIndex.set(index);
    this.dictationAnswer.set('');
    this.dictationScore.set(null);
  }

  updateDictationAnswer(event: Event): void {
    this.dictationAnswer.set((event.target as HTMLTextAreaElement).value);
    this.dictationScore.set(null);
  }

  playDictation(): void {
    if (this.dictationTimer) clearTimeout(this.dictationTimer);
    this.dictationPlaying.set(true);
    this.dictationTimer = setTimeout(() => {
      this.dictationPlaying.set(false);
      this.dictationTimer = null;
    }, 2200);
  }

  scoreDictation(): void {
    const targetWords = this.normalizeSentence(this.sentences[this.dictationIndex()]);
    const answerWords = this.normalizeSentence(this.dictationAnswer());
    const correctWords = targetWords.filter((word, index) => answerWords[index] === word).length;
    this.dictationScore.set(Math.round((correctWords / targetWords.length) * 100));
  }

  getDictationFeedback(score: number): string {
    if (score >= 80) return '🎉 Xuất sắc! Nghe rất tốt!';
    if (score >= 50) return '👍 Rất gần rồi! Thử thêm lần nữa nhé!';
    return '🎵 Nghe lại rồi thử tiếp nhé!';
  }

  toggleVoiceRecording(): void {
    if (this.voiceRecording()) {
      if (this.voiceTimer) clearTimeout(this.voiceTimer);
      this.finishVoiceDemo();
      return;
    }
    this.voiceTranscript.set('');
    this.voiceScore.set(null);
    this.voiceRecording.set(true);
    this.voiceTimer = setTimeout(() => this.finishVoiceDemo(), 3000);
  }

  getVoiceFeedback(score: number): string {
    if (score >= 90) return '🌟 Phát âm hoàn hảo! Giỏi lắm!';
    if (score >= 70) return '👏 Rất tốt! Tiếp tục nhé!';
    return '💪 Luyện thêm một chút nữa là được rồi!';
  }

  ngOnDestroy(): void {
    this.stopTeleprompter();
    if (this.dictationTimer) clearTimeout(this.dictationTimer);
    if (this.voiceTimer) clearTimeout(this.voiceTimer);
    this.counterTimers.forEach((timer) => clearInterval(timer));
    this.statsObserver?.disconnect();
  }

  private stopTeleprompter(): void {
    this.teleRunning.set(false);
    if (this.teleprompterTimer) {
      clearInterval(this.teleprompterTimer);
      this.teleprompterTimer = null;
    }
  }

  private finishVoiceDemo(): void {
    const sample = 'Hello my name is Alex and I love lerning Englis every day';
    const targetWords = this.voiceTarget.toLowerCase().split(' ');
    const spokenWords = sample.toLowerCase().split(' ');
    const correctWords = targetWords.filter((word, index) => spokenWords[index] === word).length;

    this.voiceRecording.set(false);
    this.voiceTranscript.set(sample);
    this.voiceScore.set(Math.round((correctWords / targetWords.length) * 100));
    this.voiceTimer = null;
  }

  private normalizeSentence(value: string): string[] {
    return value
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }

  private animateCounters(): void {
    if (this.countersAnimated) return;
    this.countersAnimated = true;

    this.counters().forEach((counter, counterIndex) => {
      const step = Math.ceil(counter.target / 48);
      const timer = setInterval(() => {
        this.counters.update((items) =>
          items.map((item, itemIndex) =>
            itemIndex === counterIndex
              ? { ...item, value: Math.min(item.value + step, item.target) }
              : item,
          ),
        );
        if (this.counters()[counterIndex].value >= counter.target) clearInterval(timer);
      }, 28);
      this.counterTimers.push(timer);
    });
  }
}
