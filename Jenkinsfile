pipeline {
    agent any
    
    environment {
        AWS_CREDENTIALS = credentials('aws-creds')
        AWS_REGION = "ap-south-1"
        ECR_REPO = "ci-cd-lab"
        IMAGE_TAG = "latest"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/bayarmaa01/ci-cd-lab.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t ${ECR_REPO}:${IMAGE_TAG} ."
                }
            }
        }

        stage('Login to ECR') {
            steps {
                script {
                    sh '''
                        aws configure set aws_access_key_id ${AWS_CREDENTIALS_USR}
                        aws configure set aws_secret_access_key ${AWS_CREDENTIALS_PSW}
                        aws configure set default.region ${AWS_REGION}
                        aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.${AWS_REGION}.amazonaws.com
                    '''
                }
            }
        }

        stage('Tag & Push Image') {
            steps {
                script {
                    ACCOUNT_ID = sh(script: "aws sts get-caller-identity --query Account --output text", returnStdout: true).trim()
                    IMAGE_URI = "${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}"
                    sh '''
                        docker tag ${ECR_REPO}:${IMAGE_TAG} ${IMAGE_URI}
                        docker push ${IMAGE_URI}
                    '''
                }
            }
        }
    }
}
