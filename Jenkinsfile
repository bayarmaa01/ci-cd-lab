pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-south-1'
        IMAGE_REPO = 'ci-cd-lab'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'ls -la'
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

        stage('Deploy to EC2') {
            steps {
                sshagent(['ec2-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@<EC2_PUBLIC_IP> \\
                        'docker pull $(aws ecr describe-repositories --repository-names ${IMAGE_REPO} --region ${AWS_REGION} --query "repositories[0].repositoryUri" --output text):prod-${BUILD_NUMBER} && \\
                         docker stop app || true && docker rm app || true && \\
                         docker run -d --name app -p 80:80 $(aws ecr describe-repositories --repository-names ${IMAGE_REPO} --region ${AWS_REGION} --query "repositories[0].repositoryUri" --output text):prod-${BUILD_NUMBER}'
                    """
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    def status = sh(
                        script: "curl -s -o /dev/null -w '%{http_code}' http://<EC2_PUBLIC_IP>",
                        returnStdout: true
                    ).trim()
                    if (status != "200") {
                        error "❌ Health check failed! Got HTTP ${status}"
                    }
                }
            }
        }
    }
}
