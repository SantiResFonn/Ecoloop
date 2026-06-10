
pipeline {
  agent {
    label 'jenkins-agent'
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
        sh '''
          apt-get update -qq && apt-get install -y -qq nodejs npm
          cd EcoLoop_Backend
          npm install
          npx prisma generate
          npm test -- --reporter=verbose
        '''
      }
      post {
        failure {
          error '❌ Pruebas unitarias fallidas — abortando pipeline'
        }
      }
    }
 
    // ─── CREAR config.json PARA KANIKO ───────────────────────
    stage('Setup Docker Auth') {
      steps {
        sh '''
          mkdir -p /tmp/kaniko-config
          AUTH=$(echo -n "santiagorestrefon:99112809380sF." | base64)
          echo '{"auths":{"https://index.docker.io/v1/":{"auth":"'$AUTH'"}}}' > /tmp/kaniko-config/config.json
          echo "Config creado:"
          cat /tmp/kaniko-config/config.json
        '''
      }
    }
 
    // ─── BUILD & PUSH BACKEND ─────────────────────────────────
    stage('Build & Push Backend') {
      steps {
        sh """
          mkdir -p /tmp/kaniko-dir/.docker
          cp /tmp/kaniko-config/config.json /tmp/kaniko-dir/.docker/config.json
          export KANIKO_DIR=/tmp/kaniko-dir
          /kaniko/executor \
            --context=\${WORKSPACE}/EcoLoop_Backend \
            --dockerfile=\${WORKSPACE}/EcoLoop_Backend/Dockerfile \
            --destination=${BACKEND_IMAGE}:${IMAGE_TAG} \
            --destination=${BACKEND_IMAGE}:latest \
            --cache=false
        """
      }
    }
 
    // ─── BUILD & PUSH FRONTEND ────────────────────────────────
    stage('Build & Push Frontend') {
      steps {
        sh """
          export KANIKO_DIR=/tmp/kaniko-dir
          /kaniko/executor \
            --context=\${WORKSPACE}/EcoLoop_Frontend \
            --dockerfile=\${WORKSPACE}/EcoLoop_Frontend/Dockerfile \
            --build-arg NEXT_PUBLIC_API_URL=http://ecoloop-backend:3001 \
            --destination=${FRONTEND_IMAGE}:${IMAGE_TAG} \
            --destination=${FRONTEND_IMAGE}:latest \
            --cache=false
        """
      }
    }
 
    // ─── ACTUALIZAR TAG EN MANIFESTS ──────────────────────────
    stage('Update K8s Manifests') {
      steps {
        sh """
          sed -i "s|${BACKEND_IMAGE}:.*|${BACKEND_IMAGE}:${IMAGE_TAG}|g" k8s/backend/deployment.yaml
          sed -i "s|${FRONTEND_IMAGE}:.*|${FRONTEND_IMAGE}:${IMAGE_TAG}|g" k8s/frontend/deployment.yaml
          git config user.email 'jenkins@ecoloop.com'
          git config user.name 'Jenkins'
          git add k8s/backend/deployment.yaml k8s/frontend/deployment.yaml
          git commit -m "ci: update images to build #${IMAGE_TAG}" || echo "Sin cambios"
          git push origin master
        """
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
