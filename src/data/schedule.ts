// SKALA 4기 교육 일정 — student.skala-ai.com/schedule 달력 기준 (2026-07-14 ~ 2026-11-04)
// 과목(course)은 달력에 처음 등장한 순서대로 나열한다.

export type TrackId = 'ai' | 'data' | 'dev' | 'infra' | 'etc'

export interface Track {
  id: TrackId
  name: string
}

export const TRACKS: Track[] = [
  { id: 'ai', name: 'AI · LLM' },
  { id: 'data', name: '데이터 분석' },
  { id: 'dev', name: '웹 · 백엔드' },
  { id: 'infra', name: '클라우드 · DevOps' },
  { id: 'etc', name: '프로젝트 · 특강' },
]

export type CourseKind = 'lecture' | 'project' | 'special'

export interface Course {
  id: string
  title: string
  track: TrackId
  kind: CourseKind
  days: string[] // YYYY-MM-DD, 수업이 있는 날
  instructors: string[]
  hours?: string // 기본 09:00~18:00 과 다를 때만
}

export const COURSES: Course[] = [
  { id: 'orientation-git', title: '입과 오리엔테이션 및 Git 이해/활용', track: 'dev', kind: 'lecture', days: ['2026-07-14'], instructors: ['정윤석', '한성훈'] },
  { id: 'prompt-context', title: 'Prompt 설계와 Context Engineering', track: 'ai', kind: 'lecture', days: ['2026-07-15'], instructors: ['박병선', '한성훈'] },
  { id: 'data-stats', title: '데이터 분석 개요 및 기초통계', track: 'data', kind: 'lecture', days: ['2026-07-16', '2026-07-20'], instructors: ['박병선', '한성훈'] },
  { id: 'llm-transformer', title: 'LLM과 Transformer 아키텍처', track: 'ai', kind: 'lecture', days: ['2026-07-21', '2026-07-22'], instructors: ['박병선', '한성훈'] },
  { id: 'web-basics', title: 'HTML, CSS, JavaScript', track: 'dev', kind: 'lecture', days: ['2026-07-23', '2026-07-24'], instructors: ['강병호', '김영희'] },
  { id: 'smart-data', title: '스마트 데이터 이해 및 활용', track: 'data', kind: 'lecture', days: ['2026-07-27', '2026-07-28', '2026-07-29', '2026-07-30'], instructors: ['백정열', '엄진영'] },
  { id: 'vue', title: 'Front-framework: Vue.js', track: 'dev', kind: 'lecture', days: ['2026-07-31', '2026-08-03', '2026-08-04', '2026-08-05'], instructors: ['강병호', '최찬영'] },
  { id: 'python-data', title: '데이터 분석을 위한 Python 이해', track: 'data', kind: 'lecture', days: ['2026-08-06', '2026-08-07'], instructors: ['백정열', '한성훈'] },
  { id: 'spring-rest', title: 'Java, SpringBoot, Rest API 구현', track: 'dev', kind: 'lecture', days: ['2026-08-10', '2026-08-11', '2026-08-12', '2026-08-13', '2026-08-14'], instructors: ['이용우', '김영희'] },
  { id: 'spring-ai', title: 'Spring AI', track: 'ai', kind: 'lecture', days: ['2026-08-18', '2026-08-19', '2026-08-20'], instructors: ['정윤석', '송영옥'] },
  { id: 'container', title: '컨테이너 이해 및 애플리케이션 컨테이너화', track: 'infra', kind: 'lecture', days: ['2026-08-21', '2026-08-24'], instructors: ['이용우', '송영옥'] },
  { id: 'special-career-1', title: '특강 (취업특강)', track: 'etc', kind: 'special', days: ['2026-08-25'], instructors: ['최헌영'] },
  { id: 'agile-msa', title: 'Agile 방법론 및 MSA 개발', track: 'dev', kind: 'lecture', days: ['2026-08-26', '2026-08-27'], instructors: ['임성열', '조홍근'] },
  { id: 'sllm-finetuning', title: 'sLLM 구현 및 Fine Tuning', track: 'ai', kind: 'lecture', days: ['2026-08-28', '2026-08-31'], instructors: ['임성열', '차가을'] },
  { id: 'ml-dl', title: '머신러닝 및 딥러닝 이해', track: 'ai', kind: 'lecture', days: ['2026-09-01', '2026-09-02', '2026-09-03'], instructors: ['배기주', '장경희'] },
  { id: 'special-domain-1', title: '특강 (도메인 특강, 프로젝트 현장 사례)', track: 'etc', kind: 'special', days: ['2026-09-04'], instructors: [] },
  { id: 'k8s-deploy', title: '쿠버네티스 이해 및 애플리케이션 배포', track: 'infra', kind: 'lecture', days: ['2026-09-07', '2026-09-08'], instructors: ['정윤석', '조재형'] },
  { id: 'langchain', title: '생성형 AI 서비스 개발의 이해/활용 (LangChain)', track: 'ai', kind: 'lecture', days: ['2026-09-09', '2026-09-10', '2026-09-11'], instructors: ['이미애', '김영희'] },
  { id: 'feature-engineering', title: '실전 Feature Engineering', track: 'data', kind: 'lecture', days: ['2026-09-14'], instructors: ['박병선'] },
  { id: 'web-mini-project', title: '웹 서비스 개발 mini-Project', track: 'etc', kind: 'project', days: ['2026-09-15', '2026-09-16', '2026-09-17'], instructors: ['백정열'] },
  { id: 'rag-pipeline', title: 'RAG Pipeline 설계 및 구축', track: 'ai', kind: 'lecture', days: ['2026-09-18', '2026-09-21', '2026-09-22'], instructors: ['배기주'] },
  { id: 'special-career-2', title: '특강 (취업특강)', track: 'etc', kind: 'special', days: ['2026-09-23'], instructors: ['최헌영'], hours: '09:00~13:00' },
  { id: 'model-dev', title: '모델 개발 및 최적화', track: 'ai', kind: 'lecture', days: ['2026-09-28', '2026-09-29'], instructors: ['이은호'] },
  { id: 'model-serving-aiops', title: '모델 서빙 및 AIOps 구성', track: 'infra', kind: 'lecture', days: ['2026-09-30', '2026-10-01', '2026-10-02'], instructors: ['임성열'] },
  { id: 'ai-agent', title: 'AI Agent 설계 및 구축', track: 'ai', kind: 'lecture', days: ['2026-10-06', '2026-10-07'], instructors: ['배기주', '장경희'] },
  { id: 'vector-db', title: 'Vector DB', track: 'ai', kind: 'lecture', days: ['2026-10-08'], instructors: ['백정열', '장경희'] },
  { id: 'devops', title: 'DevOps 이해 및 활용', track: 'infra', kind: 'lecture', days: ['2026-10-12', '2026-10-13'], instructors: ['이용우', '김성영'] },
  { id: 'k8s-advanced', title: '쿠버네티스 실무 심화', track: 'infra', kind: 'lecture', days: ['2026-10-14', '2026-10-16'], instructors: ['이용우', '이상희'] },
  { id: 'data-mini-project', title: '데이터 분석 mini-Project', track: 'etc', kind: 'project', days: ['2026-10-19', '2026-10-20'], instructors: ['박병선', '허진경'] },
  { id: 'agent-capstone-mcp', title: 'AI Agent Capstone (MCP)', track: 'ai', kind: 'project', days: ['2026-10-21', '2026-10-22', '2026-10-23'], instructors: ['배기주', '허진경'] },
  { id: 'ai-service-mini-project', title: 'AI 서비스 개발 Mini-project', track: 'etc', kind: 'project', days: ['2026-10-26', '2026-10-27', '2026-10-28'], instructors: ['배기주', '허진경'] },
  { id: 'ai-project-methodology', title: 'AI 프로젝트 방법론', track: 'etc', kind: 'lecture', days: ['2026-10-29'], instructors: ['백정열'], hours: '13:00~' },
  { id: 'special-domain-2', title: '특강 (도메인 특강)', track: 'etc', kind: 'special', days: ['2026-10-30'], instructors: [] },
  { id: 'team-project', title: '팀프로젝트', track: 'etc', kind: 'project', days: ['2026-11-02', '2026-11-03', '2026-11-04'], instructors: ['김경난'] },
]

export interface DayOff {
  date: string
  name: string
}

// 평일에 수업이 없는 날 (주말 공휴일은 달력 표시용으로만 둔다)
export const DAYS_OFF: DayOff[] = [
  { date: '2026-07-17', name: '공휴일 (제헌절)' },
  { date: '2026-08-15', name: '광복절' },
  { date: '2026-08-17', name: '대체공휴일' },
  { date: '2026-09-24', name: '추석연휴' },
  { date: '2026-09-25', name: '추석연휴' },
  { date: '2026-10-03', name: '개천절' },
  { date: '2026-10-05', name: '대체휴일 (개천절)' },
  { date: '2026-10-09', name: '한글날' },
  { date: '2026-10-15', name: '임시휴강 (SKCT)' },
]

export const PROGRAM = {
  name: 'SKALA 4기',
  start: '2026-07-14',
  // 달력에 공개된 마지막 날. 팀프로젝트는 이후로도 이어진다.
  lastKnown: '2026-11-04',
}
