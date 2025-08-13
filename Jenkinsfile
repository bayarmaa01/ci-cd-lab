pipeline {
    agent any
    environment {
        AWS_CREDS = credentials('aws-creds')
        AWS_REGION = 'ap-south-1'
        REPO_NAME = 'ci-cd-lab'
        PROD_TAG = 'prod-${BUILD_NUMBER}'
        EC2_USER = 'ubuntu'
        EC2_HOST = 'EC2_PUBLIC_IP'
        PEM_FILE = '/path/to/key.pem'
    }
    stages {
        stage('Login to ECR') {
            steps {
                sh '''
                aws configure set aws_access_key_id ${AWS_CREDS_USR}
                aws configure set aws_secret_access_key ${AWS_CREDS_PSW}
                aws ecr get-login-password --region ${AWS_REGION} | \
                docker login --username AWS --password-stdin \
                $(aws sts get-caller-identity --query Account --output text).dkr.ecr.${AWS_REGION}.amazonaws.com
                '''
            }
        }
        stage('Deploy to EC2') {
            steps {
                script {
                    ACCOUNT_ID = sh(script: "aws sts get-caller-identity --query Account --output text", returnStdout: true).trim()
                    IMAGE_URI = "${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${REPO_NAME}:${PROD_TAG}"
                    sh '''
                        ssh -o StrictHostKeyChecking=no -i ${PEM_FILE} ${EC2_USER}@${EC2_HOST} \
                        "docker pull ${IMAGE_URI} && docker run -d -p 80:80 ${IMAGE_URI}"
                    '''
                }
            }
        }
        stage('Health Check') {
            steps {
                sh "curl -f http://${EC2_HOST} || exit 1"
            }
        }
    }
}
