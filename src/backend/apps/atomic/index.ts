import { command } from "../../_shared/cmd/cmd";
import { getFileList, readFile, readFilesRecursively, writeFileSync } from "../../_shared/fs/fs"
import { ERROR, LOG, OK } from "../../_shared/log/log";


// icons: C:\Users\Robert Willemelis\.vscode\extensions\icons



const getNewFolderSettings = (settings: any, folderPath: string, typePath: string, iconPath: string) => {
    if(folderPath.includes(typePath)){
        const subFolder = folderPath.split('/')[folderPath.split('/').length - 1];
        
        if(!settings['material-icon-theme.folders.associations'][subFolder]){
            settings['material-icon-theme.folders.associations'][subFolder] = iconPath;
            LOG(OK, `Added ${subFolder} to settings`)
        }
    }
}

// read vscode settings file and get the value of the key
const vscodeSettings = readFile('.vscode/settings.json');
if(vscodeSettings){
    try {

        const settings = JSON.parse(vscodeSettings);
        
        // file list of src/frontend
        const folderList = readFilesRecursively('src/frontend').filter((folder: any) => folder.type === 'folder');
        for(const folder of folderList){
            if(folder.path.indexOf('src/frontend/components/') !== -1){
                getNewFolderSettings(settings, folder.path, 'src/frontend/components/atoms/', '../../../../icons/folder-atom');
                getNewFolderSettings(settings, folder.path, 'src/frontend/components/molecules/', '../../../../icons/folder-molecule');
                getNewFolderSettings(settings, folder.path, 'src/frontend/components/organisms/', '../../../../icons/folder-organism');
            } else if(folder.path.indexOf('src/frontend/pages/') !== -1){
                getNewFolderSettings(settings, folder.path, 'src/frontend/pages/', '../../../../icons/folder-page');
            } else if(folder.path.indexOf('src/frontend/templates/') !== -1){
                getNewFolderSettings(settings, folder.path, 'src/frontend/templates/', '../../../../icons/folder-template');
            }
        }
        writeFileSync('.vscode/settings.json', JSON.stringify(settings, null, 4));
        LOG(OK, 'Settings updated');
    } catch(e) {
        LOG(ERROR, `${e}`)
    }
}

