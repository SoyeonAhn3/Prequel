from pydantic import BaseModel, Field


class DesignGenerateRequest(BaseModel):
    project_id: str
    template_index: int | None = None


class RequirementItem(BaseModel):
    id: str = ""
    category: str = ""
    text: str = ""
    priority: str = "must"
    acceptance_criteria: str = ""
    status: str = "pending"


class RequirementUpdateRequest(BaseModel):
    text: str | None = None
    priority: str | None = Field(default=None, pattern="^(must|should|could)$")
    status: str | None = Field(default=None, pattern="^(accepted|edited|rejected|pending)$")


class ArchComponentItem(BaseModel):
    name: str = ""
    description: str = ""
    technology: str = ""
    role: str = ""


class ArchitectureData(BaseModel):
    components: list[ArchComponentItem] = []
    tech_stack: dict[str, str] = {}
    mermaid_code: str = ""
    integration_notes: str = ""


class DataFieldItem(BaseModel):
    name: str = ""
    type: str = ""
    description: str = ""
    constraints: str = ""


class DataEntityItem(BaseModel):
    name: str = ""
    description: str = ""
    fields: list[DataFieldItem] = []


class DataModelData(BaseModel):
    entities: list[DataEntityItem] = []
    mermaid_code: str = ""
    relationships: list[str] = []


class ArchTemplateItem(BaseModel):
    title: str = ""
    badge: str = ""
    desc: str = ""


class AiWorkflowInput(BaseModel):
    name: str = ""
    description: str = ""


class AiWorkflowOutput(BaseModel):
    name: str = ""
    description: str = ""
    format: str = ""


class AiWorkflowFallback(BaseModel):
    condition: str = ""
    action: str = ""


class AiWorkflowData(BaseModel):
    summary: str = ""
    model: str = "Claude"
    model_version: str = "sonnet"
    task: str = "AI 처리"
    inputs: list[AiWorkflowInput] = []
    outputs: list[AiWorkflowOutput] = []
    fallbacks: list[AiWorkflowFallback] = []
    monitoring: list[str] = []


class DesignSessionOut(BaseModel):
    id: str
    project_id: str
    current_step: str = "requirements"
    requirements: list[RequirementItem] | None = None
    architecture: ArchitectureData | None = None
    data_model: DataModelData | None = None
    ai_workflow: AiWorkflowData | None = None
    arch_templates: list[ArchTemplateItem] | None = None
    status: str = "in_progress"
