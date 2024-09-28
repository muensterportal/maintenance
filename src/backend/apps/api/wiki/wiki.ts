import { command } from "../../../_shared/cmd/cmd";
import { writeFileSync } from "../../../_shared/fs/fs";
import { getHTTPStatus, getHttpStatus } from "../../../_shared/http/http";
import { LOG, OK, WARNING } from "../../../_shared/log/log";

export const getProjectData = (projects: any) => {
    const dataAll: any = {};
    for(const project of projects){
        const dataGeneral = command(`curl -X GET -H "Content-type: application/json"  -H "Accept: application/json"  "${project.apiUrl}?action=query&meta=siteinfo&format=json&siprop=general"`);
        const jsonGeneral = JSON.parse(dataGeneral);
        const data = getWikiData(project.projectUrl, project.apiUrl);
        dataAll[`${project.project}`] = {
            url: project.url,
            projects: { ...data },
            logoUrl: jsonGeneral.query.general.logo
        }
    }
    writeFileSync('src/_data/projects.json', JSON.stringify(dataAll));
    writeFileSync('src/_data/projects2.json', JSON.stringify(dataAll, null, 2));
}

export const getWikiData = (projectUrl: string, apiUrl: string) => {
    // const httpStatus = getHttpStatus('https://muensterwiki.de/index.php/Hauptseite');
    // LOG(OK, httpStatus);

    // https://muensterwiki.de/api.php?action=query&list=allpages&aplimit=500&format=json&apfrom=1978

    let next: string = '';
    let num: number = 0;
    const listToCheck: string[] = [];
    for(let i = 0; i < 20; i++){
        const url = next  ? `${apiUrl}?action=query&list=allpages&aplimit=500&format=json&apfrom=${next}` : i == 0 ? `${apiUrl}?action=query&list=allpages&aplimit=500&format=json` : '';
        const data = command(`curl -X GET -H "Content-type: application/json"  -H "Accept: application/json"  "${url}"`);

        const json = JSON.parse(data);
        // console.log(json.query.allpages.length)
        num = num + json.query.allpages.length;
        for(const item of json.query.allpages){
            listToCheck.push({ title: item.title, id: item.pageid });
        }
        // console.log(json)
        if(json.continue){
            next = json.continue.apcontinue;
            console.log(next);
        } else {
            LOG(WARNING, 'no more data');
            break;

        }
    }

    LOG(OK, `number of items: ${num}`);

    const dataAll: any = {

    }

    let j = 0;
    for(const item of listToCheck){
        console.log(item)
        const id = (item.id).toString();
        if(j > 20){
            break;
        }
        // const url = `https://muensterwiki.de/api.php?action=query&pageids=${item.id}&prop=revisions&rvlimit=max&rvprop=ids|timestamp|user|comment|content&format=json`;


        const url = `${projectUrl}/?curid=${id}`;
        // const url = `${projectUrl}/index.php/?curid=${id}`;

        // https://muensterwiki.de/api.php?action=query&pageids=3352&&prop=revisions&rvlimit=max&rvprop=ids|timestamp|user|comment|content&format=json
        // https://muensterwiki.de/index.php?curid=5611

        // LOG(DEBUG, `checking ${url}`);
        const httpStatus = getHTTPStatus(`${url}`);
        console.log(url);
        console.log(JSON.stringify(httpStatus));
        const details: any = {
            httpStatus: httpStatus.status,
            lastModified: httpStatus.lastModified,
            revisions: []
        }

        const url2 = `${apiUrl}?action=query&pageids=${id}&prop=info|revisions&inprop=url&rvlimit=max&rvprop=ids|timestamp|user|comment|content|url&format=json`;
        const data = command(`curl -X GET -H "Content-type: application/json"  -H "Accept: application/json"  "${url2}"`);
        const json2 = JSON.parse(data);
        const pageData = json2.query.pages[`${id}`];
        console.log(url2)
        const years = {}
        const currentYear = new Date().getFullYear();
        const firstRevision = pageData.revisions.length - 1;
        const firstYear = parseInt(pageData.revisions[firstRevision].timestamp.substring(0, 4), 10);
        const lastYear = parseInt(pageData.revisions[0].timestamp.substring(0, 4), 10);
        for(const revision of pageData.revisions){
            const year = revision.timestamp.substring(0, 4);
            if(!years[`${year}`]){
                years[`${year}`] = 1;
            } else {
                years[`${year}`] = years[`${year}`] + 1;
            }
            
// console.log(json2.query.pages[`${id}`]);
            details['revisions'].push({ 
                user: revision.user, timestamp: revision.timestamp, 
                // comment: revision.comment, 
                revid: revision.revid });
        }
        details['start'] = firstYear;
        details['end'] = currentYear;
        details['years'] = {...years};
        details['title'] = item.title;
        details['id'] = item.id;
        details['urlID'] = url;
        details['url'] = pageData.fullurl;
        


        // details['revisions'] = [...json2.query.pages[`${item.id}`].revisions];
        // console.log(json2.query.pages[`${item.id}`].revisions);
        // console.log(details);

        if(!dataAll[`${id}`]){
            dataAll[`${id}`] = { ...details};
        }
        j++;
    }
    // console.log(dataAll);
    writeFileSync('src/_data/data.json', JSON.stringify(dataAll));
    writeFileSync('src/_data/data2.json', JSON.stringify(dataAll, null, 2));

    // const data = command('curl -X GET -H "Content-type: application/json"  -H "Accept: application/json"  "https://portal.hey-muenster.de/w/api.php?action=query&list=allpages&aplimit=500&format=json"');
    return dataAll;
 };