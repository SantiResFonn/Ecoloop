pipeline {
  agent {
    kubernetes {
      label 'jenkins-agent'
      yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug
    command: ["/busybox/cat"]
    tty: true
    volumeMounts:
    - name: docker-config
      mountPath: /kaniko/.docker
  - name: kubectl
    image: bitnami/kubectl:latest
    command: ["cat"]
    tty: true
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

    stage('Update K8s Image Tags') {
      steps {
        sh """
          sed -i "s|${BACKEND_IMAGE}:.*|${BACKEND_IMAGE}:${IMAGE_TAG}|g" k8s/backend/deployment.yaml
          sed -i "s|${FRONTEND_IMAGE}:.*|${FRONTEND_IMAGE}:${IMAGE_TAG}|g" k8s/frontend/deployment.yaml
        """
        sh """
          git config user.email 'jenkins@ecoloop.com'
          git config user.name 'Jenkins'
          git add k8s/backend/deployment.yaml k8s/frontend/deployment.yaml
          git commit -m "ci: update images to build #${IMAGE_TAG}" || echo "No changes to commit"
          git push origin master
        """
      }
    }

  }

  post {
    success {
      echo "✅ Pipeline exitoso — imágenes ${IMAGE_TAG} publicadas en Docker Hub"
    }
    failure {
      echo "❌ Pipeline fallido — revisar logs"
    }
  }
}
