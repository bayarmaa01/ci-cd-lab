pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-south-1'
        IMAGE_REPO = 'ci-cd-lab'
        DOCKERFILE_PATH = 'Dockerfile' 
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'ls -la'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    if (!fileExists(env.DOCKERFILE_PATH)) {
                        error "❌ Dockerfile not found at ${env.DOCKERFILE_PATH}"
                    }
                }
                sh "docker build -t ${IMAGE_REPO}:dev-${BUILD_NUMBER} -f ${DOCKERFILE_PATH} ."
            }
        }

        stage('Login to ECR') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-creds'
                ]]) {
                    sh """
                        aws ecr get-login-password --region ${AWS_REGION} \
                        | docker login --username AWS --password-stdin \
                        $(aws ecr describe-repositories --repository-names ${IMAGE_REPO} --region ${AWS_REGION} --query 'repositories[0].repositoryUri' --output text | cut -d'/' -f1)
                    """
                }
            }
        }

        stage('Tag & Push Image') {
            steps {
                script {
                    def ECR_URI = sh(
                        script: "aws ecr describe-repositories --repository-names ${IMAGE_REPO} --region ${AWS_REGION} --query 'repositories[0].repositoryUri' --output text",
                        returnStdout: true
                    ).trim()
                    sh """
                        docker tag ${IMAGE_REPO}:dev-${BUILD_NUMBER} ${ECR_URI}:dev-${BUILD_NUMBER}
                        docker push ${ECR_URI}:dev-${BUILD_NUMBER}
                    """
                }
            }
        }
    }
}
