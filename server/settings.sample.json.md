## Help File for settings.json

This is the help file of the current settings.json

Please sync the content of this one if you add or remove something from the
existing `settings.sample.json` (Since settings.json is not in the repo)

```json
{
  //Debug settings
  "DEBUG": {
    "resetLocal": false, //reset local database everytime you start the app
    "seedData": "", // your local data company config file in /private
    "visitorsFirebaseURL": "", // Firebase path for visitors actions. Logging is disabled if empty.
    "deliveringMessagesFirebaseURL": "https://<YOUR_APP>.firebaseio.com/delivering_messages"
  },
  //API key setup, only the firebase is a must
  "aws": {
    "accessKeyId": "",
    "secretAccessKey": "",
    "s3bucket": ""
  },
  "firebase": {
      "config": "https://looppulse-config.firebaseio.com/" //common share configs
  },
  //App settings
  "removeFromFirebase": false, //remove the beacon event/messages from firebase or not
  "accounts": { //account settings
    "forbidClientAccountCreation": true, //avoid client side skip the registration process
    "admin" :{ //admin account setup
      "login": "hello@looppulse.com", //login email
      "passphrase": null, //default password. if set it in null it will auto generate one or send user a link for making password
      "showInfoAfterCreation": false, //show password after account created. not suggested
      "mailInfoAfterCreation": true //email user the login info after account created.
    }
  },
  //Client side app setting (Only this part will send to client side)
  "public": {

  },
  //System finetuning setting
  "performance": {
  }
}
```
