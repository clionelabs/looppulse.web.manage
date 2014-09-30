looppulse.web.manage
====================

Set up environment.

0. `npm install -g meteorite` & `mrt install`

1. Set up two Firebase apps from https://www.firebase.com/account/
  1. one for storing company configuration like locations and beacon installtions.
  2. one for storing beacon events.

2. Configure initial beacon installation  
  Two ways:

  1.  Configure `server/configuration.json` in https://github.com/clionelabs/looppulse.web.configurator  
  2.  In `looppulse.web.configurator`, run `meteor --settings server/configuration.json`  
  
  Alternatively,

  1.  mkdir private/  
  2.  cp looppulse.web.configurator/private/megabox.json private/local.json  

3. Start the dashboard  
  1. Configure `server/settings.json` in `https://github.com/clionelabs/looppulse.web.manage` to point to the two Firebase apps created in Step 1.  
  2. In `looppulse.web.manage`, run `meteor --settings server/settings.json`

4. Configure beacon events  
  1. Configure `server/simulation.json` in https://github.com/clionelabs/looppulse.web.simulator. Please ensure to match the beacon described in `looppulse.web.configurator/server/configuration.json`  
  2. In `looppulse.web.simulatr`, run `meteor --settings server/simulation.json`


## Deployment

1. Launch AWS EC2 instance, e.g. ami-12356d40
  1. Associate it to Elastic IP.
  2. Open port 22 for the machine do deployment.

2. Install [Meteor Up](https://github.com/arunoda/meteor-up) command line tool `npm install -g mup`.

3. Configuration deployment settings `mup.json` by referring to `mup.json.sample`.
  1. Download and put SSH key in `pem`, e.g. `~/.ssh/id_rsa`
  2. Ensure key file permission, `chmod 600 ~/.ssh/id_rsa`
  3. Update `host` as Elastic IP

4. Prepare Meteor settings `settings.json`,
  1. Symlink the settings by `ln -s server/settings.json settings.json` or copy settings.json to repository root
  2. Update the settings if necessary for the deployment

5. Run deploy command.
  1. Run `mup setup` to setup the server
  2. Reboot server
  3. Run `mup deploy` to deploy code to server

## Remote Debugging

1. View Log
  1. ssh -i keys/jenkins.pem ubuntu@beta.looppulse.com
  2. sudo less /var/log/upstart/looppulse_manage.log
  3. sudo tail -f /var/log/upstart/looppulse_manage.log

2. Access Mongo console
  1. ssh -i keys/jenkins.pem ubuntu@beta.looppulse.com
  2. mongo looppulse_manage

3. SSH tunnel for Jenkins
  1. ssh -v -i keys/dev.pem -L 8080:localhost:8080 ubuntu@jenkins.looppulse.com
  2. open http://localhost:8080

4. Dropping database
  1. In mongo shell/console, `db.dropDatabase()`

5. Force restart
  1. `sudo service looppulse_manage restart` or simply trigger build in jenkins


## Local Debugging

1. Create test account
  1. Access the users database in mongo. (There should be an account with eamil admin@example.com.)
  2. Enter `admin@example.com` in the [forget password link](http://localhost:3000/forgot-password)
  3. Check console log and get the password reset link in password recovery email.


## Firbase Security

Go to `Manage App` -> `Security Rules` in Firebase, set the rules as following,

```
{
    "rules": {
        ".read": false,
        ".write": false
    }
}
```

Copy `Manage App` -> `Secrets` to corresponding configuration files, here are list of files may need to be updated,

- looppulse.web.configurator/private/megabox.json:system.firebase.rootSecret
- looppulse.web.configurator/server/configuration.sample.json:firebase.rootSecret
- looppulse.web.manage/server/settings.sample.json:firebase.configSecret
- looppulse.web.simulator/server/settings.continuous.live.sample.json:firebase.configSecret
- looppulse.web.simulator/server/settings.continuous.debug.sample.json:firebase.rootSecret
- looppulse.web.simulator/server/settings.fixed.debug.sample.json:firebase.rootSecret

Firebase generated token will be expired in certain period of time, clients observing Firebase should re-authendicate themselves to retrive new valid token. `Manage App` -> `Login & Auth` could see `Session Length` for how long a token should be valid.

## Documentation

1. Install jsdoc: `npm install -g jsdoc`

2. Generate documentation: `jsdoc -c jsdoc.json`

3. Open `.out/index.html` in browser
