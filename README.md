# Key-pass web application

## Installing the KeyPass web application

1. Move to the directory with the cloned project and enter the following command in the command line:  
   ./gradlew clean build jar

2. Then, in the compiled project, go to the /spring directory and copy keystore.p12 to a directory created separately somewhere.

3. Also create a folder in the created directory and name it avi.

4. The next step is to transfer the spring-0.0.1-SNAPSHOT.jar file from the /spring/build/libs/ directory to the directory you created.

You should end up with the following directory structure:

- /YourDirectory/
  - /avi
  - spring-0.0.1-SNAPSHOT.jar
  - keystore.p12

## Launching the KeyPass web application

1. Go to the directory created during the installation step and enter the following command in the command line:  
   java -jar spring-0.0.1-SNAPSHOT.jar

2. Then, in your browser, visit the following link:
   https://localhost:8343

Congratulations, you have launched the application.

## Launching the KeyPass web application as a Google Chrome extension

1. Go to the directory created during the installation step and enter the following command in the command line to run the backend part of the application:  
   java -jar spring-0.0.1-SNAPSHOT.jar

2. Follow this tutorial to add Google Chrome extension, your directory with extension /samen-key-pass/ui/dist:  
https://developer.chrome.com/docs/extensions/mv3/tut_debugging/

Congratulations, you have launched the application as a Google Chrome extension.

## Instructions for using the KeyPass web application

1. First you need to register in the application through the dialog.

2. To add a username and password to something:

   - In the contex field, enter what the username and password refer to

   - In the login field, enter your login

   - Generate the password with the generate button and save the password with the save button

3. To gain access to your data, log in to the application using your username and password and use the prompts to select the context and username, the password will be received automatically

4. Do not forget to log out of your account after you finish working with the application.
