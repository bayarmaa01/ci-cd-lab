pipeline {
    agent any

    environment {
        AWS_REGION     = 'ap-south-1'
        AWS_ACCOUNT_ID = '010990749281'
        IMAGE_NAME     = 'ci-cd-lab'
        PROD_TAG       = 'prod-${BUILD_NUMBER}'
        EC2_USER       = 'ubuntu'
        EC2_HOST       = 'ec2-52-66-213-12.ap-south-1.compute.amazonaws.com'
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
                sshagent(['ec2-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} '
                            aws ecr get-login-password --region ${AWS_REGION} \
                            | sudo docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com &&
                            sudo docker pull ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${IMAGE_NAME}:latest &&
                            sudo docker stop myapp || true &&
                            sudo docker rm myapp || true &&
                            sudo docker run -d --name myapp -p 8080:3000 ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${IMAGE_NAME}:latest
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
