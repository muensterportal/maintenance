
import { DEBUG, LOG, OK, WARNING } from "../../_shared/log/log";
import { getProjectData, getWikiData } from "./wiki/wiki";

LOG(OK, 'API is running...more!!!');

const projects = [
    {
        project: 'muensterwiki',
        url: 'https://muensterwiki.de',
        projectUrl: 'https://muensterwiki.de/index.php',
        apiUrl: 'https://muensterwiki.de/api.php',
        type: 'wiki'
    },
    {
        project: 'Münster4You',
        url: 'https://portal.hey-muenster.de',
        projectUrl: 'https://portal.hey-muenster.de/wiki',
        apiUrl: 'https://portal.hey-muenster.de/w/api.php',
        type: 'wiki'
    },
    {
        project: "Starthilfte Münster",
        url: 'https://www.starthilfe-muenster.de',
        sitemap: [ 
            'https://www.starthilfe-muenster.de/page-sitemap.xml',
            'https://www.starthilfe-muenster.de/post-sitemap.xml'
        ],
        logoUrl: 'https://www.starthilfe-muenster.de/wp-content/uploads/2018/12/starthilfe_muenster_logo2_130.png'
    }
];

// getWikiData(projects);
getProjectData(projects);


