---
title: "Jenkins Pipeline (Jenkinsfile)"
en: "Jenkins Declarative Pipeline · Jenkinsfile"
summary: "빌드·테스트·이미지 빌드·배포 과정을 Jenkinsfile(Groovy DSL)로 코드화한 선언형 파이프라인. pipeline → agent → environment·options → stages → steps → post"
importance: 3
order: 7
tags:
  - Jenkins
  - CI/CD
  - Pipeline as Code
keypoints:
  - "Pipeline as Code: Jenkinsfile을 Git에 두고 from SCM으로 실행"
  - "withCredentials로 비밀값을 블록 안에서만 환경변수로 주입"
  - "sh 작은따옴표는 셸이, 큰따옴표는 Groovy가 먼저 ${변수}를 치환"
qa:
  - q: "Jenkinsfile 선언형 파이프라인의 구조는?"
    a: "최상위 pipeline 블록 안에 실행 노드를 정하는 agent, 환경변수 environment, 타임아웃·동시 실행 금지 같은 options를 두고, stages 아래 stage별로 실제 작업인 steps(sh, echo, git, checkout 등)를 적는다. post 블록의 always, success, failure로 결과에 따라 알림이나 정리 작업을 한다. environment는 pipeline 최상위에 두면 전체, stage 안에 두면 그 stage에서만 유효하다."
  - q: "Jenkins에서 비밀번호나 토큰은 어떻게 다루나?"
    a: "Jenkins Credentials에 Username with password 등으로 등록하고 Jenkinsfile에서는 credentialsId로만 참조한다. withCredentials 블록이 그 값을 블록 안에서만 환경변수로 바인딩하고 로그에서는 마스킹되며, 블록 밖에서는 쓰지 않는다. 수업에서는 JCasC(jenkins.yaml)로 GitHub PAT(skala-github-id)와 Harbor 자격증명(skala-image-registry-id)을 서버 기동 시 미리 등록했다."
  - q: "Jenkins와 Tekton을 비교하면?"
    a: "Jenkins는 컨트롤러가 항상 떠 있는 Master-Agent 구조에 1,800개 이상의 플러그인과 풍부한 레퍼런스가 있어 레거시부터 클라우드 네이티브까지 폭넓게 쓰이고, JCasC로 설정을 코드화해 눈송이 서버 문제를 줄인다. Tekton은 Task·Pipeline을 쿠버네티스 CRD로 선언하고 필요할 때만 Pod로 실행되는 무상태 구조라 K8s에 최적화되어 있지만 YAML이 복잡하고 진입 장벽이 높다."
related:
  - devops-cicd
  - jenkins-build-trigger
  - gitops
  - ci-image-build-tools
source: "Day2(10/13) 슬라이드 p.146–203 (04.jenkins jenkinsfile/01.basic, 02.local/01.local-cicd)"
---

```flow
Clone Repository :: git으로 소스 가져오기
Build with Maven :: mvn clean package -DskipTests → target/*.jar
Compute Image Meta :: 버전 + 커밋 해시로 이미지 태그 계산
Image Build & Push :: BuildKit·Buildah·Kaniko로 Harbor에 push
Deploy / GitOps update :: kubectl 배포 또는 gitops 브랜치 매니페스트 갱신
```

```groovy
// Jenkinsfile-CICD-docker 의 뼈대를 요약한 예
pipeline {
  agent any
  environment {
    GIT_URL = 'https://github.com/<계정>/myfirst-api-server.git'
    IMAGE = 'skala-registry.skala-ai.com/class-0/skala-webserver:1.0'
    DOCKER_CREDENTIAL_ID = 'skala-image-registry-id'   // Harbor 자격증명 ID
  }
  options {
    timeout(time: 10, unit: 'MINUTES')
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '5'))
  }
  stages {
    stage('Clone Repository') { steps { git branch: 'main', url: "${GIT_URL}", credentialsId: 'skala-github-id' } }
    stage('Build with Maven') { steps { sh 'mvn clean package -DskipTests' } }
    stage('Image Build & Push') {
      steps {
        withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDENTIAL_ID,
                         usernameVariable: 'REG_USER', passwordVariable: 'REG_PASS')]) {
          sh 'echo "$REG_PASS" | docker login skala-registry.skala-ai.com -u "$REG_USER" --password-stdin'
          sh 'docker build -t $IMAGE . && docker push $IMAGE'
        }
      }
    }
  }
  post {
    success { echo 'Success!' }
    failure { echo 'Failed!' }
    always  { cleanWs() }
  }
}
```

> [!warn] 따옴표 해석 차이
> `sh 'echo ${APP_NAME}'`은 리눅스 셸이 환경변수를 치환, `sh "echo ${APP_NAME}"`은 Groovy가 먼저 값을 넣어 셸에 전달, `echo '$APP_NAME'`은 치환 없이 문자 그대로 출력. 비밀값은 Groovy 문자열 보간에 넣지 않고 작은따옴표로 셸에 맡기는 편이 안전함.

> [!tip] 스크립트 등록 두 방식
> Pipeline script(Jenkins UI에 직접 붙여 넣기)는 스크립트 검증용, Pipeline script from SCM(Git 저장소의 Jenkinsfile 경로 지정)은 검증된 파이프라인 운영용. 후자라야 파이프라인 변경도 Git 이력으로 남음.
