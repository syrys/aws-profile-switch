# AWS Default Profile Switcher

Simply helps you to switch default configured aws profile for aws CLI. 

### Prerequisites
Simply install aws CLI ([instructions](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)), add/configure any profiles you want directly with aws cli ([instructions](https://docs.aws.amazon.com/cli/v1/userguide/cli-configure-files.html)), then install this package AWS Default Profile Switcher.

### Install / Usage

Install globally:
```shell
npm install -g awsdps
```

Usage:
```shell
awsdps
```
This should list all the configured AWS cli profiles (should also state which profile is currently default), then select the profile you wish to make default and press enter. This should replace the default profile with the profile you selected.


### How it works
The package simply reads and modifies the `~/.aws/credentials` file. AWS CLI will setup profiles in this file, and this package will simply look at profiles that are already configured and copy the selected profile credentials as the `default` profile/credentials.

### Limitations
Currently only supports Unix (tested only on Mac, but should be fine on Linux too). Can update to work on Windows if there is interest.

### Dev
Download and setup the repository first.

To run globally:
```shell
> npm i
> npm run build && npm i -g .
> awsdps
```

to run locally:
```shell
> npm i
> npm start
```