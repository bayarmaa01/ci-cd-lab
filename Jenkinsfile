pipeline {
    agent any

    environment {
        AWS_REGION     = 'ap-south-1'
        AWS_ACCOUNT_ID = '010990749281'
        IMAGE_NAME     = 'ci-cd-lab'
        PROD_TAG       = 'prod-${BUILD_NUMBER}'
        EC2_USER       = 'ubuntu'
        EC2_HOST       = 'ec2-xx-xxx-xxx-xx.ap-south-1.compute.amazonaws.com' // change to your EC2 public DNS
        APP_PORT       = '8080'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Login to ECR') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-creds']]) {
                    sh """
                        aws ecr get-login-password --region $AWS_REGION \
                        | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                    """
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent(['ec2-key']) { // ec2-key must be configured in Jenkins Credentials
                    sh """
                        ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} '
                        docker pull ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${IMAGE_NAME}:${PROD_TAG} &&
                        docker stop ${IMAGE_NAME} || true &&
                        docker rm ${IMAGE_NAME} || true &&
                        docker run -d --name ${IMAGE_NAME} -p ${APP_PORT}:${APP_PORT} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${IMAGE_NAME}:${PROD_TAG}
                        '
                    """
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    def status = sh(script: "curl -s -o /dev/null -w '%{http_code}' http://${EC2_HOST}:${APP_PORT}", returnStdout: true).trim()
                    if (status != '200') {
                        error "Health check failed. HTTP Status: ${status}"
                    } else {
                        echo "Health check passed. HTTP Status: ${status}"
                    }
                }
            }
        }
    }
}
