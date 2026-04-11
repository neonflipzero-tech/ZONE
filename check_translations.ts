
import { MISSION_TRANSLATIONS } from './src/utils/missionTranslations';
import fs from 'fs';

const storeContent = fs.readFileSync('./src/store.tsx', 'utf8');
const pathMissionsMatch = storeContent.match(/const PATH_MISSIONS: Record<PathType, Record<MissionType, string\[\]>> = ({[\s\S]+?});/);

if (pathMissionsMatch) {
    const pathMissionsStr = pathMissionsMatch[1];
    // This is a bit hacky but should work for extracting strings
    const strings = pathMissionsStr.match(/"([^"]+)"/g).map(s => s.slice(1, -1));
    
    const missing = strings.filter(s => !MISSION_TRANSLATIONS[s]);
    const uniqueMissing = [...new Set(missing)];
    
    console.log("Missing translations:");
    uniqueMissing.forEach(s => console.log(`"${s}"`));
} else {
    console.log("Could not find PATH_MISSIONS");
}
