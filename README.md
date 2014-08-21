looppulse.web.manage
====================

Set up environment.

0. `npm install -g meteorite` & `mrt install`

1. Set up two Firebase apps from https://www.firebase.com/account/
  1. one for storing company configuration like locations and beacon installtions.
  2. one for storing beacon events.

2. Configure initial beacon installation  
  1. Configure `server/configuration.json` in https://github.com/clionelabs/looppulse.web.configurator  
  2. In `looppulse.web.configurator`, run `meteor --settings server/configuration.json`

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


## Documentation

1. Install jsdoc: `npm install -g jsdoc`

2. Generate documentation: `jsdoc -c jsdoc.json`

3. Open `.out/index.html` in browser
