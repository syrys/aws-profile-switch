#!/usr/bin/env node

import {listAwsProfiles, writeAwsProfiles} from "./services";
import prompts = require("prompts");

(async function main() {
    const profiles = listAwsProfiles();

    if (profiles.length > 0) {

        const defaultProfile = Object.values(profiles).find(i => i.profileName?.trim()?.toLowerCase() === "default")
        const profilesExcludingDefault = profiles.filter(i => i !== defaultProfile)

        // profilesExcludingDefault.forEach(profileData => {
        //     const isDefaultProfile = defaultProfile && defaultProfile.config?.aws_access_key_id && defaultProfile.config?.aws_secret_access_key &&
        //         profileData.config?.aws_secret_access_key === defaultProfile.config?.aws_secret_access_key &&
        //         profileData.config?.aws_access_key_id === defaultProfile.config?.aws_access_key_id;
        //
        //     console.log(`- ${profileData.profileName}${isDefaultProfile? " [DEFAULT]": ""}`);
        // });

        const selectedProfileResponse = await prompts({
            type: 'select',
            name: 'value',
            message: 'Default AWS Profile',
            choices: profilesExcludingDefault
                .filter(i => i.config?.aws_access_key_id && i.config?.aws_secret_access_key)
                .map(profileData => {
                    const isDefaultProfile = defaultProfile && defaultProfile.config?.aws_access_key_id && defaultProfile.config?.aws_secret_access_key &&
                        profileData.config?.aws_secret_access_key === defaultProfile.config?.aws_secret_access_key &&
                        profileData.config?.aws_access_key_id === defaultProfile.config?.aws_access_key_id;

                    return {
                        title: `${profileData.profileName}${isDefaultProfile? " [DEFAULT]": ""}`,
                        value: profileData.profileName
                    }
            }),
            initial: 1
        });
        if(!selectedProfileResponse.value){
            console.error("Invalid value, try again");
            return;
        }
        const selectedProfile = profilesExcludingDefault.find(i => i.profileName === selectedProfileResponse.value);
        if(!selectedProfile){
            console.error("Invalid value, try again");
            return;
        }

        console.log(`Making profile default: ${selectedProfile.profileName}`)

        writeAwsProfiles([{
            ...selectedProfile,
            profileName: "default",
        }, ...profilesExcludingDefault])

        console.log(`Profile ${selectedProfile.profileName} should now be the default profile - try run a cli command to check "aws iam get-user"`)

    } else {
        console.log("No AWS profiles found.");
    }
})();
