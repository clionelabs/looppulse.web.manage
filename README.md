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
