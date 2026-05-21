import { useState } from 'react'
import {
  CircleHelp,
  Pause,
  ChevronDown,
  Clock,
  FileText,
  Sun,
  ChevronsRight,
  RotateCcw,
  Send,
  Lightbulb,
} from 'lucide-react'
import AiMark from './AiMark'
import type { ChatMessage, CurrentQuestion, InterviewStats } from './types'

interface ChatCenterProps {
  messages: ChatMessage[]
  currentQuestion: CurrentQuestion
  stats: InterviewStats
}

export default function ChatCenter({ messages, currentQuestion, stats }: ChatCenterProps) {
  const [input, setInput] = useState(
    '사내 도서관 시스템에서 직접 가져올 예정이에요. 정확도는 처음에는 클릭률(CTR)로',
  )
  const [showExample, setShowExample] = useState(true)

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-bg">
      {/* Top bar */}
      <div className="px-7 py-2.5 border-b border-border bg-surface flex items-center gap-2.5 shrink-0">
        <span className="text-[11px] text-text-subtle font-mono" style={{ letterSpacing: 0.4 }}>
          {currentQuestion.stepLabel}
        </span>
        <span className="text-[12.5px] text-text font-semibold">{currentQuestion.stepTitle}</span>
        <span className="text-xs text-text-subtle">›</span>
        <span className="text-xs text-text-muted">{currentQuestion.questionNumber}번째 질문</span>
        <div className="flex-1" />
        <button className="w-7 h-7 rounded-lg bg-transparent text-text-muted flex items-center justify-center cursor-pointer hover:text-text transition-colors border-none">
          <CircleHelp size={14} />
        </button>
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-text-muted bg-transparent border border-border rounded-lg hover:bg-surface-alt transition-colors cursor-pointer">
          <Pause size={12} />
          일시정지
        </button>
      </div>

      {/* Chat area — scrollable */}
      <div className="flex-1 overflow-auto px-7 pt-[22px]">
        <div className="max-w-[760px] mx-auto">
          {/* History (dimmed) */}
          <div className="opacity-55 mb-1">
            <div className="text-[10.5px] text-text-subtle font-mono mb-2.5 flex items-center gap-2" style={{ letterSpacing: 0.4 }}>
              <span>이전 대화</span>
              <span className="flex-1 h-px bg-border" />
              <span className="text-accent cursor-pointer font-semibold">모두 보기 (4)</span>
            </div>

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 items-start mb-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {msg.role === 'ai' ? (
                  <AiMark size={26} />
                ) : (
                  <div className="w-[26px] h-[26px] rounded-full bg-surface-alt text-text flex items-center justify-center shrink-0 text-[11px] font-semibold">
                    서
                  </div>
                )}
                <div className="max-w-[480px]">
                  <div
                    className={`rounded-[10px] px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-accent text-white'
                        : 'bg-surface text-text border border-border'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div
                    className={`text-[10.5px] text-text-subtle mt-1 font-mono ${
                      msg.role === 'user' ? 'text-right' : 'pl-1'
                    }`}
                  >
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Current question */}
          <div className="mt-3.5 mb-[18px]">
            <div className="text-[10.5px] text-accent font-bold font-mono mb-2.5 flex items-center gap-2" style={{ letterSpacing: 0.5 }}>
              <span
                className="w-1.5 h-1.5 rounded-full bg-accent"
                style={{ boxShadow: '0 0 0 4px var(--color-accent-soft)' }}
              />
              지금 답변할 질문 · QUESTION {String(currentQuestion.questionNumber).padStart(2, '0')}
              <span className="flex-1" />
              <span className="text-text-subtle font-medium">{currentQuestion.time}</span>
            </div>

            <div
              className="bg-surface rounded-[14px] overflow-hidden"
              style={{
                border: '1.5px solid var(--color-accent)',
                boxShadow: '0 1px 0 rgba(0,0,0,.02), 0 10px 28px -14px color-mix(in srgb, var(--color-accent) 40%, transparent)',
              }}
            >
              {/* Topic strip */}
              <div
                className="px-6 py-3 bg-accent-soft flex items-center gap-2"
                style={{ borderBottom: '1px solid color-mix(in srgb, var(--color-accent) 10%, transparent)' }}
              >
                <span className="text-[10.5px] font-mono text-accent-deep font-bold" style={{ letterSpacing: 0.4 }}>
                  주제
                </span>
                {currentQuestion.topics.map((topic) => (
                  <span
                    key={topic}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-surface rounded-full text-[11.5px] font-semibold text-accent"
                  >
                    {topic}
                  </span>
                ))}
                <div className="flex-1" />
                <span className="text-[11px] text-accent-deep opacity-70">{currentQuestion.importance}</span>
              </div>

              {/* Question body */}
              <div className="px-6 py-[22px] flex gap-3.5 items-start">
                <AiMark size={36} />
                <div className="flex-1">
                  <div className="text-base font-semibold leading-relaxed text-text" style={{ letterSpacing: -0.15 }}>
                    {currentQuestion.text.split(currentQuestion.highlightText).map((part, i, arr) => (
                      <span key={i}>
                        {part}
                        {i < arr.length - 1 && (
                          <strong className="text-accent">{currentQuestion.highlightText}</strong>
                        )}
                      </span>
                    ))}
                  </div>

                  {/* Example answers (collapsible) */}
                  <div className="mt-3.5 px-3 py-2.5 bg-surface-alt rounded-[9px] border border-border">
                    <button
                      onClick={() => setShowExample(!showExample)}
                      className="flex items-center gap-1.5 text-[11.5px] font-semibold text-text-muted cursor-pointer w-full bg-transparent border-none p-0 text-left"
                    >
                      <Lightbulb size={12} />
                      예시 답변 보기
                      <div className="flex-1" />
                      <ChevronDown size={11} className={`transition-transform ${showExample ? 'rotate-180' : ''}`} />
                    </button>
                    {showExample && (
                      <div className="mt-2 pt-2 border-t border-dashed border-border text-xs text-text-muted leading-relaxed">
                        {currentQuestion.exampleAnswers.map((ex, i) => (
                          <div key={i} className={i < currentQuestion.exampleAnswers.length - 1 ? 'mb-1.5' : ''}>
                            • <span className="text-text">{ex.label}</span>: {ex.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Meta info */}
                  <div className="flex items-center gap-3.5 mt-3 text-[11px] text-text-subtle">
                    <span className="flex items-center gap-1.5">
                      <Clock size={11} />
                      {currentQuestion.avgTime}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FileText size={11} />
                      답변 → {currentQuestion.insightCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick action chips */}
              <div className="flex gap-2 px-6 py-3.5 border-t border-border">
                <button
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold bg-accent text-white rounded-full cursor-pointer border-none"
                  style={{ boxShadow: '0 2px 8px -2px color-mix(in srgb, var(--color-accent) 50%, transparent)' }}
                >
                  <Sun size={14} />
                  AI 추천받기
                </button>
                <button className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium bg-surface text-text border border-border-strong rounded-full cursor-pointer">
                  <ChevronsRight size={13} />
                  건너뛰기
                </button>
                <button className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium bg-surface text-text border border-border-strong rounded-full cursor-pointer">
                  <RotateCcw size={13} />
                  다시 질문해줘
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input area + stats bar */}
      <div className="px-7 pb-[18px] bg-bg shrink-0">
        <div className="max-w-[760px] mx-auto">
          {/* Input box */}
          <div
            className="bg-surface rounded-[14px] px-4 pt-3.5 pb-2.5"
            style={{
              border: '1.5px solid var(--color-accent)',
              boxShadow: '0 0 0 4px var(--color-accent-soft), 0 2px 12px -4px rgba(28,31,38,.08)',
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={2}
              className="w-full text-sm text-text leading-relaxed font-sans resize-none bg-transparent outline-none"
              placeholder="답변을 입력하세요..."
            />
            <div className="flex items-center gap-3 mt-1 pt-2 border-t border-border">
              <div className="flex items-center gap-1.5 text-[11px] text-text-subtle">
                <kbd className="font-mono text-[10px] px-1.5 py-0.5 bg-surface-alt rounded border border-border text-text-muted">
                  Enter
                </kbd>
                전송
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-text-subtle">
                <kbd className="font-mono text-[10px] px-1.5 py-0.5 bg-surface-alt rounded border border-border text-text-muted">
                  Shift
                </kbd>
                <span>+</span>
                <kbd className="font-mono text-[10px] px-1.5 py-0.5 bg-surface-alt rounded border border-border text-text-muted">
                  Enter
                </kbd>
                줄바꿈
              </div>
              <div className="flex-1" />
              <span className="text-[11px] text-text-subtle font-mono">{input.length} / 500</span>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white text-xs font-semibold rounded-lg border-none cursor-pointer hover:bg-accent-deep transition-colors">
                <Send size={12} />
                전송
              </button>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-[18px] mt-2.5 px-1 text-[11px] text-text-subtle">
            <span className="flex items-center gap-1.5">
              <Clock size={11} />
              진행 시간 <span className="text-text font-semibold font-mono">{stats.elapsedTime}</span>
            </span>
            <span className="w-[3px] h-[3px] bg-border-strong rounded-full" />
            <span>
              답변 <span className="text-text font-semibold font-mono">{stats.answerCount}개</span>
            </span>
            <span className="w-[3px] h-[3px] bg-border-strong rounded-full" />
            <span>
              평균 답변 시간 <span className="text-text font-semibold font-mono">{stats.avgAnswerTime}</span>
            </span>
            <div className="flex-1" />
            <span className="flex items-center gap-1 text-green">
              <span className="w-[5px] h-[5px] rounded-full bg-green" />
              순조롭게 진행 중
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
