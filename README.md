looppulse.web.manage
====================

Set up environment.

1. Set up two Firebase apps from https://www.firebase.com/account/
  a. one for storing company configuration like locations and beacon installtions.
  b. one for storing beacon events.

2. Configure initial beacon installation  
  a. Configure `server/configuration.json` in https://github.com/clionelabs/looppulse.web.configurator  
  b. In `looppulse.web.configurator`, run `meteor --settings server/configuration.json`

3. Start the dashboard  
  a. Configure `server/settings.json` in `https://github.com/clionelabs/looppulse.web.manage` to point to the two Firebase apps created in Step 1.  
  b. In `looppulse.web.manage`, run `meteor --settings server/settings.json`

4. Configure beacon events  
  a. Configure `server/simulation.json` in https://github.com/clionelabs/looppulse.web.simulator. Please ensure to match the beacon described in `looppulse.web.configurator/server/configuration.json`  
  b. In `looppulse.web.simulatr`, run `meteor --settings server/simulation.json`


## Deployment

1. Launch AWS EC2 instance, e.g. ami-12356d40
  a. Associate it to Elastic IP.
  b. Open port 22 for the machine do deployment.

2. Install [Meteor Up](https://github.com/arunoda/meteor-up) command line tool `npm install -g mup`.

3. Configuration deployment settings `mup.json` by referring to `mup.json.sample`.
  a. Download and put SSH key in `pem`, e.g. `~/.ssh/id_rsa`
  b. Ensure key file permission, `chmod 600 ~/.ssh/id_rsa`
  c. Update `host` as Elastic IP

4. Prepare Meteor settings `settings.json`,
  a. Symlink the settings by `ln -s server/settings.json settings.json` or copy settings.json to repository root
  b. Update the settings if necessary for the deployment

5. Run deploy command.
  a. Run `mup setup` to setup the server
  b. Reboot server
  c. Run `mup deploy` to deploy code to server


## Documentation

1. Install jsdoc: `npm install -g jsdoc`

2. Generate documentation: `jsdoc -c jsdoc.json`

3. Open `out/index.html` in browser
