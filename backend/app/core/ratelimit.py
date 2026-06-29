from slowapi import Limiter
from slowapi.util import get_remote_address

# IP 기준 레이트 리밋.
# - dev 우회 시 모든 요청이 동일 유저로 처리되므로 사용자 기준 대신 IP 기준이 적합.
# - 전역 기본 60/분. 비싼 AI 호출(인터뷰 등)은 라우트 데코레이터로 더 강하게 덮어쓴다.
# - 주의: 리버스 프록시 뒤에서는 get_remote_address가 프록시 IP를 볼 수 있음
#   (운영 배포 시 X-Forwarded-For 처리 검토 필요).
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])
