"""엔드포인트 테스트용 인메모리 가짜 Supabase 클라이언트.

엔드포인트가 실제로 쓰는 쿼리 빌더 부분집합만 지원한다:
select / insert / update / delete + eq / is_ / in_ / order / limit / single / maybe_single.
행을 테이블별로 보관하므로 update/delete 이후 select 가 앞선 쓰기를 반영한다
(기존 test_interview_endpoints 의 무상태 가짜와 달리 상태를 유지).
"""
import itertools

_DEFAULT_TS = "2026-01-01T00:00:00+00:00"


class _Result:
    def __init__(self, data):
        self.data = data


class _Query:
    def __init__(self, store, name, counter):
        self._store = store
        self._name = name
        self._counter = counter
        self._op = "select"
        self._payload = None
        self._filters = []   # (col, val) 또는 (col, values, "in")
        self._single = False

    # ── 빌더 ──────────────────────────────────────────────
    def select(self, *a, **k):
        self._op = "select"
        return self

    def insert(self, data, *a, **k):
        self._op, self._payload = "insert", data
        return self

    def update(self, data, *a, **k):
        self._op, self._payload = "update", data
        return self

    def delete(self, *a, **k):
        self._op = "delete"
        return self

    def eq(self, col, val):
        self._filters.append((col, val))
        return self

    def is_(self, col, val):
        # .is_("deleted_at", "null") → deleted_at IS NULL
        self._filters.append((col, None if val == "null" else val))
        return self

    def in_(self, col, vals):
        self._filters.append((col, list(vals), "in"))
        return self

    def order(self, *a, **k):
        return self

    def limit(self, *a, **k):
        return self

    def single(self):
        self._single = True
        return self

    def maybe_single(self):
        self._single = True
        return self

    # ── 실행 ──────────────────────────────────────────────
    def _rows(self):
        return self._store.setdefault(self._name, [])

    def _match(self, row):
        for f in self._filters:
            col = f[0]
            if len(f) == 3 and f[2] == "in":
                if row.get(col) not in f[1]:
                    return False
            elif row.get(col) != f[1]:
                return False
        return True

    def execute(self):
        rows = self._rows()
        if self._op == "insert":
            items = self._payload if isinstance(self._payload, list) else [self._payload]
            created = []
            for item in items:
                new = dict(item)
                new.setdefault("id", f"{self._name}-{next(self._counter)}")
                new.setdefault("created_at", _DEFAULT_TS)
                new.setdefault("updated_at", _DEFAULT_TS)
                rows.append(new)
                created.append(new)
            data = created
        elif self._op == "update":
            data = [r for r in rows if self._match(r)]
            for r in data:
                r.update(self._payload)
        elif self._op == "delete":
            data = [r for r in rows if self._match(r)]
            for r in data:
                rows.remove(r)
        else:  # select
            data = [r for r in rows if self._match(r)]

        if self._single:
            return _Result(data[0] if data else None)
        return _Result(data)


class FakeSupabase:
    """테이블별 행 딕셔너리를 들고 있는 가짜 클라이언트.

    tables: {"projects": [ {...}, ... ], "users": [...], ...}
    """

    def __init__(self, tables=None):
        self._store = {k: [dict(r) for r in v] for k, v in (tables or {}).items()}
        self._counter = itertools.count(1)

    def table(self, name):
        return _Query(self._store, name, self._counter)

    def rows(self, name):
        """테스트 단언용 — 현재 저장된 행 목록."""
        return self._store.get(name, [])
