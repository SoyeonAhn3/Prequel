import { useEffect, useRef, useState } from 'react'
import { Plus, MoreVertical, Pin, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuthContext } from '../contexts/AuthContext'
import Tag from '../components/common/Tag'
import AnnouncementModal from '../components/notices/AnnouncementModal'
import {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../lib/announcements'
import type { Announcement, AnnouncementInput, AnnouncementType } from '../lib/announcements'

type FilterTab = 'all' | AnnouncementType

function formatDate(iso: string) {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const PAGE_SIZE = 10

// 페이지 수가 많아지면 현재 페이지 주변 + 처음/끝만 보여주고 나머지는 … 으로 생략.
function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) pages.push('...')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 1) pages.push('...')
  pages.push(total)
  return pages
}

export default function NoticesPage() {
  const { user } = useAuthContext()
  const isAdmin = user?.role === 'admin'

  const [list, setList] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [adminMode, setAdminMode] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const showControls = isAdmin && adminMode

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setList(await listAnnouncements())
    } catch (e) {
      setError(e instanceof Error ? e.message : '공지사항을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // 탭이나 검색어가 바뀌면 1페이지로 되돌린다.
  useEffect(() => {
    setPage(1)
  }, [activeTab, search])

  const q = search.trim().toLowerCase()
  const searched = q
    ? list.filter(
        (a) => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q),
      )
    : list
  // 탭 카운트는 현재 검색 결과 기준 (검색어 없으면 전체 기준).
  const counts = {
    all: searched.length,
    notice: searched.filter((a) => a.type === 'notice').length,
    patch: searched.filter((a) => a.type === 'patch').length,
  }
  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: '전체', count: counts.all },
    { key: 'notice', label: '공지', count: counts.notice },
    { key: 'patch', label: '패치내역', count: counts.patch },
  ]
  // 목록은 이미 API에서 pinned desc → created_at desc 로 정렬돼 있어 고정 공지가 항상 위.
  const filtered = activeTab === 'all' ? searched : searched.filter((a) => a.type === activeTab)

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }
  function openEdit(a: Announcement) {
    setEditing(a)
    setModalOpen(true)
    setMenuOpenId(null)
  }

  async function handleSubmit(input: AnnouncementInput) {
    if (editing) {
      await updateAnnouncement(editing.id, input)
    } else {
      await createAnnouncement(input)
    }
    setModalOpen(false)
    setEditing(null)
    await load()
  }

  async function handleTogglePin(a: Announcement) {
    setMenuOpenId(null)
    await updateAnnouncement(a.id, { pinned: !a.pinned })
    await load()
  }

  async function handleDelete(a: Announcement) {
    setMenuOpenId(null)
    if (!window.confirm(`"${a.title}" 공지를 삭제할까요?`)) return
    await deleteAnnouncement(a.id)
    await load()
  }

  return (
    <div className="max-w-[760px] mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[11px] text-text-subtle font-mono tracking-[0.12em] mb-1.5">NEWS &amp; UPDATES</p>
          <h2 className="text-[26px] font-bold tracking-tight">공지사항</h2>
        </div>
        {showControls && (
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-deep transition-colors"
          >
            <Plus size={14} strokeWidth={2.5} />
            새 공지 작성
          </button>
        )}
      </div>

      {/* Filter + admin toggle */}
      <div className="flex items-center gap-2 mb-3.5">
        <div className="flex gap-1 p-0.5 bg-surface-alt rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setMenuOpenId(null) }}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-surface text-text shadow-sm font-semibold'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              {tab.label}
              <span className="text-[10.5px] text-text-subtle font-mono">{tab.count}</span>
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-lg w-[200px]">
          <Search size={14} className="text-text-muted shrink-0" />
          <input
            type="text"
            placeholder="공지 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-text placeholder:text-text-muted outline-none w-full"
          />
        </div>
        {isAdmin && (
          <button
            onClick={() => { setAdminMode(!adminMode); setMenuOpenId(null) }}
            className="flex items-center gap-2 text-xs text-text-muted cursor-pointer"
          >
            <span
              className={`relative w-8 h-[18px] rounded-full transition-colors ${
                adminMode ? 'bg-accent' : 'bg-border-strong'
              }`}
            >
              <span
                className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all ${
                  adminMode ? 'left-[15px]' : 'left-0.5'
                }`}
              />
            </span>
            <span className={adminMode ? 'text-accent-deep font-semibold' : ''}>관리자 모드</span>
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <p className="text-sm text-text-muted">공지사항을 불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <p className="text-sm text-red">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <p className="text-sm text-text-muted">{q ? '검색 결과가 없습니다.' : '표시할 공지사항이 없습니다.'}</p>
        </div>
      ) : (
        <>
        <div className="flex flex-col gap-3">
          {pageItems.map((a) => (
            <div key={a.id} className="bg-surface border border-border rounded-2xl px-6 py-5">
              {/* Meta row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {a.pinned && <Pin size={13} className="text-text-subtle" />}
                  {a.type === 'notice' ? (
                    <Tag tone="accent">공지</Tag>
                  ) : (
                    <Tag tone="green">패치{a.version ? ` ${a.version}` : ''}</Tag>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-subtle font-mono">{formatDate(a.created_at)}</span>
                  {showControls && (
                    <div ref={menuOpenId === a.id ? menuRef : undefined} className="relative flex">
                      <button
                        onClick={() => setMenuOpenId(menuOpenId === a.id ? null : a.id)}
                        className="text-text-subtle hover:text-text cursor-pointer p-1 -mr-1"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {menuOpenId === a.id && (
                        <div className="absolute right-0 top-8 z-10 w-32 bg-surface border border-border rounded-lg shadow-lg py-1">
                          <button
                            onClick={() => openEdit(a)}
                            className="w-full text-left px-3 py-1.5 text-sm text-text hover:bg-bg transition-colors cursor-pointer"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleTogglePin(a)}
                            className="w-full text-left px-3 py-1.5 text-sm text-text hover:bg-bg transition-colors cursor-pointer"
                          >
                            {a.pinned ? '고정 해제' : '상단 고정'}
                          </button>
                          <button
                            onClick={() => handleDelete(a)}
                            className="w-full text-left px-3 py-1.5 text-sm text-red hover:bg-bg transition-colors cursor-pointer"
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Title + body */}
              <h3 className="text-[15px] font-bold text-text mt-3">{a.title}</h3>
              <p className="text-[13.5px] text-text-muted mt-1.5 whitespace-pre-line line-clamp-2">
                {a.content}
              </p>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 mt-6">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {getPageNumbers(currentPage, totalPages).map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-text-subtle text-xs">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    p === currentPage
                      ? 'bg-accent text-white'
                      : 'text-text-muted hover:bg-surface-alt'
                  }`}
                >
                  {p}
                </button>
              ),
            )}
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
        </>
      )}

      {modalOpen && (
        <AnnouncementModal
          editing={editing}
          onClose={() => { setModalOpen(false); setEditing(null) }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
