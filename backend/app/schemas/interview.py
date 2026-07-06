from pydantic import BaseModel, Field


class InterviewStartRequest(BaseModel):
    project_id: str


class InterviewAnswerRequest(BaseModel):
    session_id: str
    answer: str = Field(max_length=2000)
    answer_id: str | None = None  # 멱등성 키(BL-007). 없으면 기존처럼 동작(하위호환).


class InterviewPauseRequest(BaseModel):
    session_id: str


class InterviewResumeRequest(BaseModel):
    session_id: str


class InsightItem(BaseModel):
    label: str
    value: str
    is_new: bool = False
    pending: bool = False


class ExampleAnswer(BaseModel):
    label: str
    text: str


class StepItem(BaseModel):
    title: str
    status: str  # done | active | pending
    summary: str | None = None
    question_index: int | None = None
    question_total: int | None = None


class MessageItem(BaseModel):
    role: str  # ai | user
    text: str
    time: str | None = None


class InterviewResponse(BaseModel):
    session_id: str
    status: str
    current_step: int
    total_steps: int
    step_title: str
    question: str | None = None
    topics: list[str] = []
    importance: str | None = None
    example_answers: list[ExampleAnswer] = []
    insights: list[InsightItem] = []
    steps: list[StepItem] = []
    messages: list[MessageItem] = []
    phase: int = 1
    total_phases: int = 3
    phase_label: str = "기획 인터뷰"
    answer_count: int = 0


class InterviewStatusResponse(BaseModel):
    session_id: str
    project_id: str
    status: str
    current_step: int
    total_steps: int
    step_title: str
    phase: int = 1
    total_phases: int = 3
    answer_count: int = 0
    token_used: int = 0
