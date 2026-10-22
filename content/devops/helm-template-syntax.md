---
title: "Helm 템플릿 문법"
en: "Helm Template (Go Template) Syntax"
summary: "Go 템플릿으로 values를 리소스 YAML에 끼워 넣는다. . 과 $ 컨텍스트, {{- -}} 공백 제어, 파이프라인 함수, if·with·range, define·include"
importance: 2
order: 6
tags:
  - Helm
  - Go Template
keypoints:
  - ". 은 현재 컨텍스트(range·with 안에서 바뀜), $ 는 최상위 컨텍스트"
  - "{{- 는 왼쪽, -}} 는 오른쪽 공백·줄바꿈 제거 (YAML 들여쓰기 주의)"
  - "toYaml | nindent, default·required, define → include 재사용"
qa:
  - q: "Helm 템플릿에서 . 과 $ 의 차이는?"
    a: "점(.)은 현재 컨텍스트로 처음엔 루트지만 range나 with 블록 안에서는 순회 중인 항목이나 지정한 객체로 바뀐다. 그래서 range 안에서 .Values를 쓰면 찾지 못하고, 최상위 컨텍스트를 가리키는 $를 써서 $.Values.global.name처럼 접근해야 한다."
  - q: "toYaml과 nindent는 왜 같이 쓰나?"
    a: "toYaml은 values의 Map이나 List를 YAML 문자열로 바꾸지만 들여쓰기가 없어서 그대로 넣으면 YAML 구조가 깨진다. nindent N은 앞에 줄바꿈을 넣고 모든 줄을 N칸 들여써 주므로 resources나 labels 블록을 정확한 위치에 끼울 수 있다. include 'mychart.labels' . | nindent 4가 라벨에 자주 쓰는 패턴이다."
related:
  - helm-chart
source: "Day1(10/12) 슬라이드 p.97–104, p.129–145 (03.helm/template-test 실습)"
---

```flow
values.yaml :: replicaCount, image, resources 같은 값
_helpers.tpl :: define으로 이름·라벨 템플릿 정의
templates/*.yaml :: .Values 참조 + include·if·with·range
helm template :: Go 템플릿 엔진이 렌더링 (--show-only로 파일 하나만)
최종 매니페스트 :: 들여쓰기·공백까지 맞아야 유효한 YAML
```

| 문법 | 의미 | 예 |
| --- | --- | --- |
| `.Values` · `.Release` · `.Chart` | values, 릴리스(Name·Namespace), Chart.yaml 정보 | `{{ .Release.Name }}-{{ .Chart.Name }}` |
| `$` | 최상위 컨텍스트 | `{{ $.Values.global.name }}` |
| `{{-` / `-}}` | 왼쪽 / 오른쪽 공백·줄바꿈 제거 | `{{- if .Values.test.enabled }}` |
| 파이프라인 | 앞 결과를 다음 함수 인자로 | `{{ .Values.name \| upper \| quote }}` |
| `default` / `required` | 기본값 / 없으면 렌더링 실패 | `{{ default 80 .Values.port }}` |
| `toYaml` + `nindent` | Map·List를 YAML로 + 줄바꿈 후 들여쓰기 | `{{- toYaml .Values.resources \| nindent 12 }}` |
| `if` / `with` / `range` | 조건, 값이 있으면 컨텍스트 전환, 반복 | `{{- range .Values.envs }}` |
| `define` / `include` | 재사용 템플릿 정의 / 호출 | `{{ include "mychart.fullname" . }}` |

```yaml
# templates/deployment.yaml 일부
metadata:
  name: {{ include "myfirst-chart.fullname" . }}
  labels:
    {{- include "myfirst-chart.labels" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  template:
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          resources:
            {{- with .Values.resources }}
            limits:
              cpu: {{ .limits.cpu }}
            {{- else }}
            limits:
              cpu: 50m
            {{- end }}
          env:
            {{- range .Values.envs }}
            - name: {{ .name }}
              value: {{ .value | quote }}
            {{- end }}
```

> [!tip] 렌더링부터 확인
> `helm template . --debug --show-only templates/if-else.yaml`처럼 템플릿 하나만 렌더링해 보면 공백 제어 실수(`name: myappnamespace: default`처럼 줄이 붙는 것)를 바로 잡을 수 있음.
