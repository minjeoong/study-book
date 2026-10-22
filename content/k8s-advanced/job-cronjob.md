---
title: "Job과 CronJob"
en: "Job · CronJob"
summary: "Job은 Pod를 실행해 정해진 작업을 성공적으로 끝까지 완료하도록 보장하고, CronJob은 스케줄마다 Job을 생성한다"
importance: 2
order: 8
tags:
  - Job
  - CronJob
  - 배치
keypoints:
  - "completions(성공 수)·parallelism(동시 수)·backoffLimit(재시도)"
  - "restartPolicy는 OnFailure(컨테이너 재시작) 또는 Never(새 Pod)"
  - "CronJob concurrencyPolicy: Allow·Forbid·Replace"
qa:
  - q: "Deployment와 Job의 차이는?"
    a: "Deployment는 항상 떠 있어야 하는 서비스를 위해 Pod가 종료되면 무조건 다시 띄운다(restartPolicy: Always). Job은 DB 마이그레이션, 배치 계산, 파일 변환, 백업처럼 한 번 실행하고 끝나는 작업용으로, completions만큼 성공하면 Completed로 끝나고 실패하면 backoffLimit까지 재시도한다. 그래서 Job의 restartPolicy는 OnFailure나 Never만 쓴다."
  - q: "CronJob의 concurrencyPolicy는?"
    a: "이전 Job이 아직 실행 중인데 다음 스케줄이 됐을 때의 처리 방식이다. Allow는 겹쳐서 새 Job을 실행하고, Forbid는 새 Job을 건너뛰며, Replace는 이전 Job을 종료하고 새 Job으로 바꾼다. 실행 시간이 주기보다 길어질 수 있는 배치는 Forbid로 중복 실행을 막고, startingDeadlineSeconds로 놓친 스케줄을 얼마나 늦게까지 실행할지 정한다."
related:
  - k8s-deploy/pod-basics
source: "Self Study 슬라이드 p.286–291 (job.yaml, cronjob 실습)"
---

```flow
CronJob :: schedule "*/3 * * * *" (Asia/Seoul)
Job 생성 :: 실행 시점마다 Job 하나 (기록이 Job으로 남음)
Pod 실행 :: parallelism만큼 동시에, completions만큼 성공할 때까지
실패 시 :: backoffLimit까지 재시도
정리 :: successful·failedJobsHistoryLimit만큼만 보관
```

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: sk000-current-time
spec:
  schedule: "*/3 * * * *"          # 분 시 일 월 요일
  timeZone: "Asia/Seoul"
  concurrencyPolicy: Forbid          # 이전 Job 실행 중이면 이번 회차 스킵
  successfulJobsHistoryLimit: 2
  failedJobsHistoryLimit: 1
  startingDeadlineSeconds: 30
  jobTemplate:
    spec:
      completions: 2
      parallelism: 1
      backoffLimit: 3
      template:
        spec:
          restartPolicy: Never       # Job 은 OnFailure 또는 Never
          containers:
            - name: print-time
              image: busybox
              command: ["sh", "-c", "echo Current Time: $(date +%Y-%m-%d_%H:%M:%S)"]
```

> [!tip] cron 표현식
> `*/5 * * * *` 5분마다, `0 * * * *` 매 정시, `0 */6 * * *` 6시간마다, `0 0 * * *` 매일 자정, `0 9 * * 1` 매주 월 9시, `0 9 * * 1-5` 평일 9시. `/`는 간격(step).
