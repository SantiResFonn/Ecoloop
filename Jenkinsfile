pipeline {
  agent {
    kubernetes {
      label 'jenkins-agent'
      yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: jnlp
    image: santiagorestrefon/jenkins-jnlp-kaniko
    imagePullPolicy: Always
    volumeMounts:
    - name: docker-config
      mountPath: /kaniko/.docker
  - name: node
    image: node:22-alpine
    command: ["cat"]
    tty: true
  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug
    command: ["/busybox/cat"]
    tty: true
    volumeMounts:
    - name: docker-config
      mountPath: /kaniko/.docker
  volumes:
  - name: docker-config
    secret:
      secretName: regcred
"""
    }
  }

  environment {
    DOCKERHUB_USER = 'santiagorestrefon'
    BACKEND_IMAGE  = "${DOCKERHUB_USER}/ecoloop-backend"
    FRONTEND_IMAGE = "${DOCKERHUB_USER}/ecoloop-frontend"
    IMAGE_TAG      = "${BUILD_NUMBER}"
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    // ─── PRUEBAS UNITARIAS ────────────────────────────────────
    stage('Unit Tests') {
      steps {
        container('node') {
          dir('EcoLoop_Backend') {
            sh 'npm install'
            sh 'npx prisma generate'
            sh 'npm test -- --reporter=verbose --reporter=junit --outputFile=test-results.xml'
          }
        }
      }
      post {
        always {
          junit testResults: 'EcoLoop_Backend/test-results.xml',
                allowEmptyResults: true
        }
        failure {
          error '❌ Pruebas unitarias fallidas — abortando pipeline'
        }
      }
    }

    // ─── BUILD & PUSH BACKEND ─────────────────────────────────
    stage('Build & Push Backend') {
      steps {
        container('kaniko') {
          sh """
            /kaniko/executor \
              --context=dir://EcoLoop_Backend \
              --dockerfile=EcoLoop_Backend/Dockerfile \
              --destination=${BACKEND_IMAGE}:${IMAGE_TAG} \
              --destination=${BACKEND_IMAGE}:latest \
              --cache=true
          """
        }
      }
    }

    // ─── BUILD & PUSH FRONTEND ────────────────────────────────
    stage('Build & Push Frontend') {
      steps {
        container('kaniko') {
          sh """
            /kaniko/executor \
              --context=dir://EcoLoop_Frontend \
              --dockerfile=EcoLoop_Frontend/Dockerfile \
              --build-arg NEXT_PUBLIC_API_URL=http://ecoloop-backend:3001 \
              --destination=${FRONTEND_IMAGE}:${IMAGE_TAG} \
              --destination=${FRONTEND_IMAGE}:latest \
              --cache=true
          """
        }
      }
    }

    // ─── ACTUALIZAR TAG EN MANIFESTS (GitOps para ArgoCD) ─────
    stage('Update K8s Manifests') {
      steps {
        container('node') {
          sh """
            sed -i "s|${BACKEND_IMAGE}:.*|${BACKEND_IMAGE}:${IMAGE_TAG}|g" k8s/backend/deployment.yaml
            sed -i "s|${FRONTEND_IMAGE}:.*|${FRONTEND_IMAGE}:${IMAGE_TAG}|g" k8s/frontend/deployment.yaml
          """
          sh """
            git config user.email 'jenkins@ecoloop.com'
            git config user.name 'Jenkins'
            git add k8s/backend/deployment.yaml k8s/frontend/deployment.yaml
            git commit -m "ci: update images to build #${IMAGE_TAG}" || echo "Sin cambios"
            git push origin master
          """
        }
      }
    }

  }

  post {
    success {
      echo "✅ Pipeline exitoso — build #${IMAGE_TAG} en Docker Hub"
    }
    failure {
      echo "❌ Pipeline fallido — revisar los logs"
    }
  }
}
