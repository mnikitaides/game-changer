## REQUIREMENTS
- node 8+

## ENVIRONMENT
- set environment variable `GAME_CHANGER_USER` to the email address for the Game Changer account
- set environment variable `GAME_CHANGER_PASSWORD` to the password for the Game Changer account

## RUNNING
- `npm install`
- `npm run build`
- `npm start`

## DEPLOYMENT
Run the following commands to deploy to IBM Cloud.  Make sure to install the IBM Cloud CLI first https://console.bluemix.net/docs/cli/index.html#overview

```
bx login
bx target --cf
bx cf push
```

## NOTES
- this project was created with `create-react-app`
- then modified to run an express server, following https://dev.to/loujaybee/using-create-react-app-with-express
