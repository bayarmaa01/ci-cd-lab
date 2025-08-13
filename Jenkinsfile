pipeline {
    agent any
    environment {
        AWS_REGION = 'ap-south-1'
        ECR_REPO = '123456789012.dkr.ecr.ap-south-1.amazonaws.com/ci-cd-lab'
    }
    stages {
        stage('Checkout') {
            steps { checkout scm }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("${ECR_REPO}:dev-${BUILD_NUMBER}")
                }
            }
        }
        stage('Login to ECR') {
            steps {
                sh '''
                    aws ecr get-login-password --region $AWS_REGION \
                    | docker login --username AWS --password-stdin $ECR_REPO
                '''
            }
        }
        stage('Push to ECR') {
            steps {
                sh '''
                    docker tag ${ECR_REPO}:dev-${BUILD_NUMBER} ${ECR_REPO}:dev-${BUILD_NUMBER}
                    docker push ${ECR_REPO}:dev-${BUILD_NUMBER}
                '''
            }
        }
    }
}
