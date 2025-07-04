import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export type AwsProfile = {
    profileName: string,
    firstLineIndex: number,
    lastLineIndex: number,
    config: {
        aws_access_key_id?: string;
        aws_secret_access_key?: string;
        [key: string]: string;
    }
};

export type AwsCredentials = {
    [profileName: string]: AwsProfile;
};

function getCredentialsFilePath(): string {
    return path.join(os.homedir(), '.aws', 'credentials');
}

function parseCredentialsFile(fileContent: string): AwsProfile[] {
    const lines = fileContent.split('\n');
    const credentials: AwsCredentials = {};
    let currentProfileName: string | null = null;

    lines.forEach((line, index) => {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
            currentProfileName = trimmedLine.substring(1, trimmedLine.length - 1);
            if (currentProfileName) {
                credentials[currentProfileName] = {
                    profileName: currentProfileName,
                    firstLineIndex: index,
                    lastLineIndex: index,
                    config: {}
                };
            }
        } else if (currentProfileName && trimmedLine.includes('=')) {
            const [key, value] = trimmedLine.split('=', 2).map(s => s.trim());
            if (key && value) {
                credentials[currentProfileName].lastLineIndex = index;
                credentials[currentProfileName].config[key] = value;
            }
        }
    })

    return Object.values(credentials);
}

export function listAwsProfiles(): AwsProfile[] {
    const credentialsFilePath = getCredentialsFilePath();
    console.log(`credentialsFilePath`, credentialsFilePath)
    try {
        const fileContent = fs.readFileSync(credentialsFilePath, 'utf-8');
        // console.log("fileContent", fileContent);
        const profiles = parseCredentialsFile(fileContent);
        return profiles;
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`AWS credentials file not found at ${credentialsFilePath}`);
            return [];
        }
        console.error('Error reading or parsing AWS credentials file:', error);
        return [];
    }
}

export function writeAwsProfiles(profiles: AwsProfile[]): void {
    const credentialsFilePath = getCredentialsFilePath();

    const lines = profiles.flatMap(p => {
        const configLines = Object.entries(p.config)
            .filter(([, value]) => value) // Filters out null, undefined, '' to align with parser
            .map(([key, value]) => `${key} = ${value}`);

        return [`[${p.profileName}]`, ...configLines, ''];
    });

    // Remove last empty line if there are any profiles
    if (lines.length > 0) {
        lines.pop();
    }

    const fileContent = lines.join('\n');

    try {
        // Add a final newline for POSIX compatibility, if content exists.
        fs.writeFileSync(credentialsFilePath, fileContent ? fileContent + '\n' : '', 'utf-8');
    } catch (error) {
        console.error(`Error writing AWS credentials file at ${credentialsFilePath}:`, error);
    }
}