
import { DEBUG, LOG, OK, WARNING } from "../../_shared/log/log";
import { getProjectData, getWikiData } from "./wiki/wiki";

LOG(OK, 'API is running...more!!!');

const projects = [
    {
        project: 'muensterwiki',
        url: 'https://muensterwiki.de',
        projectUrl: 'https://muensterwiki.de/index.php',
        apiUrl: 'https://muensterwiki.de/api.php'
    },
    {
        project: 'Münster4You',
        url: 'https://portal.hey-muenster.de',
        projectUrl: 'https://portal.hey-muenster.de/wiki',
        apiUrl: 'https://portal.hey-muenster.de/w/api.php'
    }
];

// getWikiData(projects);
getProjectData(projects);


