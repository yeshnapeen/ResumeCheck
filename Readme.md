# Welcome to my test application

## Azure deployment process

I created two Azure App Service applications
- The backend, python 3.11 app deployed through vscode Azure extension
- The frontend, deployed through Github Actions due to the free tier allowing it

Changes and manual steps
- Add the FrontEndUrl to the Application Settings for the backend
- Change the build output on the react app Github ations yml to dist due to using vite instead of create react app