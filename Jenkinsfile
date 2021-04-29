pipeline {
  agent any
  stages {
    stage('build') {
      steps {
        sh './gradlew -v'
        sh './gradlew assemble'
      }
    }
  }
}
