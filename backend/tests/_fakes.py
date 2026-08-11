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


class _RpcQuery:
    def __init__(self, handler, params):
        self._handler = handler
        self._params = params

    def execute(self):
        return _Result(self._handler(self._params))


class _Query:
    def __init__(self, store, name, counter):
        self._store = store
        self._name = name
        self._counter = counter
        self._op = "select"
        self._payload = None
        self._filters = []
        self._single = False

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

    def _rows(self):
        return self._store.setdefault(self._name, [])

    def _match(self, row):
        for item in self._filters:
            column = item[0]
            if len(item) == 3 and item[2] == "in":
                if row.get(column) not in item[1]:
                    return False
            elif row.get(column) != item[1]:
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
            data = [row for row in rows if self._match(row)]
            for row in data:
                row.update(self._payload)
        elif self._op == "delete":
            data = [row for row in rows if self._match(row)]
            for row in data:
                rows.remove(row)
        else:
            data = [row for row in rows if self._match(row)]

        if self._single:
            return _Result(data[0] if data else None)
        return _Result(data)


class _FakeAuthAdmin:
    """auth.admin 최소 구현 — 계정 파기(BL-005) 검증용."""

    def __init__(self):
        self.deleted_users = []
        self.error = None  # 테스트에서 삭제 실패를 주입할 때 사용

    def delete_user(self, user_id):
        if self.error is not None:
            raise self.error
        self.deleted_users.append(user_id)


class _FakeAuth:
    def __init__(self):
        self.admin = _FakeAuthAdmin()


class FakeSupabase:
    """테이블별 행 딕셔너리를 들고 있는 가짜 클라이언트."""

    def __init__(self, tables=None):
        self._store = {key: [dict(row) for row in rows] for key, rows in (tables or {}).items()}
        self._counter = itertools.count(1)
        self._rpc_handlers = {}
        self.rpc_calls = []
        self.auth = _FakeAuth()

    def table(self, name):
        return _Query(self._store, name, self._counter)

    def register_rpc(self, name, handler):
        self._rpc_handlers[name] = handler

    def rpc(self, name, params):
        self.rpc_calls.append((name, dict(params)))
        if name not in self._rpc_handlers:
            raise AssertionError(f"RPC handler not registered: {name}")
        return _RpcQuery(self._rpc_handlers[name], params)

    def rows(self, name):
        """테스트 단언용 — 현재 저장된 행 목록."""
        return self._store.get(name, [])
