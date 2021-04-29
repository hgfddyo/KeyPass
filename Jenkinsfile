pipeline {
  agent any
  stages {
    stage('build') {
      steps {
        sh './gradlew -v'
        sh './gradlew assemble'
        archiveArtifacts artifacts: 'spring/build/libs/*.jar', fingerprint: true
      }
    }
  }
}
