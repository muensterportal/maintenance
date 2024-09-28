import { command } from "../../../_shared/cmd/cmd";
import { writeFileSync } from "../../../_shared/fs/fs";
import { getHTTPStatus, getHttpStatus } from "../../../_shared/http/http";
import { ERROR, LOG, OK, WARNING } from "../../../_shared/log/log";

const isProduction = process.env.NODE_ENV === 'production';
const MAX = isProduction ? 200 : 2;

var convert = require('xml-js');


export const getPageByTitle = (title: string, apiUrl: string) => {
    //https://muensterwiki.de/api.php?action=query&titles=1945&prop=info&inprop=url&format=json
    const url = `${apiUrl}?action=query&titles=${encodeURI(title)}&prop=info&inprop=url&format=json`;
    const data = command(`curl -s -X GET -H "Content-type: application/json"  -H "Accept: application/json"  "${url}"`);
    const json = JSON.parse(data);
    if(json.query.pages){
        // const pageID = Object.values(json.query.pages)[0];
        const dataX: any = Object.values(json.query.pages)[0];
        const id = dataX.pageid;
        if(id && id !== -1){
            return { id: id, data: { ...dataX } };
        } else {
            return {id: -1, data: {}};
        }
        // return page;
    } else {
        return {id: -1, data: {}};
    }
    // return -1
}

const convertXMLToJSON = (xml: string) => {
    var xmlData = convert.xml2json(xml, {
        compact: true,
        space: 4
    });
    return xmlData;
}

export const getUrlsFromSitemap = (sitemap: string[]) => {
    const allUrls = [];
    for(const url of sitemap){
        const data = command(`curl -s -X GET -H "Content-type: application/json"  -H "Accept: application/json"  "${url}"`);
        // console.log(data);
        const json = convertXMLToJSON(data);
        const json2 = JSON.parse(json);
        const urls = json2.urlset.url;
        for(const url of urls){
            allUrls.push(url);
        }
    }
    return allUrls
}

export const getProjectData = (projects: any) => {
    const dataAll: any = {};
    for(const project of projects){
        if(project.type == 'wiki'){
            const dataGeneral = command(`curl -X GET -H "Content-type: application/json"  -H "Accept: application/json"  "${project.apiUrl}?action=query&meta=siteinfo&format=json&siprop=general"`);
            const jsonGeneral = JSON.parse(dataGeneral);
            const data = getWikiData(project.projectUrl, project.apiUrl);
            dataAll[`${project.project}`] = {
                url: project.url,
                projects: { ...data.data },
                num: data.num,
                logoUrl: jsonGeneral.query.general.logo
            }
        } else {
            const urls = getUrlsFromSitemap(project.sitemap);
            
            const projects: any = {};
            for(const url of urls){
                const httpStatus = getHTTPStatus(url.loc._text);
                const statusCode = parseInt(httpStatus.status, 10);
                const status = statusCode >= 400 ? 'error' : statusCode >= 300 && statusCode < 400 ? 'warning' : 'ok';
                const statusCSS = statusCode >= 400 ? 'bg-danger' : statusCode >= 300 && statusCode < 400 ? 'bg-warning' : 'bg-success';
                projects[`${url.loc._text}`] = { lastModified: url.lastmod._text, url: url.loc._text, httpStatus: httpStatus.status, status: status, statusCSS: statusCSS };
            }
            dataAll[`${project.project}`] = {
                url: project.url,
                projects: { ...projects },
                num: urls.length,
                logoUrl: project.logoUrl
            }
        }
    }
    writeFileSync('src/_data/projects.json', JSON.stringify(dataAll));
    writeFileSync('src/_data/projects2.json', JSON.stringify(dataAll, null, 2));
}

export const getWikiData = (projectUrl: string, apiUrl: string) => {
    // https://muensterwiki.de/api.php?action=query&list=allpages&aplimit=500&format=json&apfrom=1978

    let next: string = '';
    let num: number = 0;
    const listToCheck: string[] = [];
    for(let i = 0; i < MAX; i++){
        const url = next  ? `${apiUrl}?action=query&list=allpages&aplimit=500&format=json&apfrom=${next}` : i == 0 ? `${apiUrl}?action=query&list=allpages&aplimit=500&format=json` : '';
        const data = command(`curl -s -X GET -H "Content-type: application/json"  -H "Accept: application/json"  "${url}"`);

        const json = JSON.parse(data);
        // console.log(json.query.allpages.length)
        num = num + json.query.allpages.length;
        for(const item of json.query.allpages){
            listToCheck.push({ title: item.title, id: item.pageid });
        }
        // console.log(json)
        if(json.continue){
            next = json.continue.apcontinue;
            // console.log(next);
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
        const id = (item.id).toString();
        if(j > MAX){
            break;
        }
        // const url = `https://muensterwiki.de/api.php?action=query&pageids=${item.id}&prop=revisions&rvlimit=max&rvprop=ids|timestamp|user|comment|content&format=json`;


        const url = `${projectUrl}/?curid=${id}`;
        // const url = `${projectUrl}/index.php/?curid=${id}`;

        // https://muensterwiki.de/api.php?action=query&pageids=3352&&prop=revisions&rvlimit=max&rvprop=ids|timestamp|user|comment|content&format=json
        // https://muensterwiki.de/index.php?curid=5611

        const httpStatus = getHTTPStatus(`${url}`);
        const details: any = {
            httpStatus: httpStatus.status,
            lastModified: httpStatus.lastModified,
            revisions: []
        }

        const url2 = `${apiUrl}?action=query&pageids=${id}&prop=info|revisions|categories|links|extlinks&inprop=url&rvlimit=max&rvprop=ids|timestamp|user|comment|content|url&format=json`;
        const data = command(`curl -s -X GET -H "Content-type: application/json"  -H "Accept: application/json"  "${url2}"`);
        const json2 = JSON.parse(data);
        const pageData = json2.query.pages[`${id}`];
        // console.log(url2)
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
            
            details['revisions'].push({ 
                user: revision.user, timestamp: revision.timestamp, 
                // comment: revision.comment, 
                revid: revision.revid });
        }
        details['extlinks'] = [];
        details['warnings'] = [];
        details['errors'] = [];
        if(pageData.extlinks){
            for(const link of pageData.extlinks){
                const key = Object.keys(link)[0];
                const url = encodeURI(link[key]);
                const httpStatus = getHTTPStatus(`${url}`);
                const status: number = parseInt(httpStatus.status, 10);
                if(status >= 400){
                    details['errors'].push(`page ${link[key]} not found with status ${httpStatus.status}`);
                } else if(status >= 300 && status < 400) {

                    details['warnings'].push(`redirect: ${httpStatus.status} for ${link[key]}`);
                }  else if(status >= 200 && status < 300) {
                    // tbd
                } else {
                    details['errors'].push(`page ${link[key]} not found with status ${httpStatus.status}`);
                }

                details['extlinks'].push({ url: link[key], httpStatus: httpStatus.status, lastModified: httpStatus.lastModified });
            }
        // console.log(url2);
        // console.log(pageData)
        }
        details['links'] = [];

        if(pageData.links){
            for(const link of pageData.links){
                const key = Object.keys(link)[0];
                const page = getPageByTitle(link.title, apiUrl);
                if(page){

                    if(page.id === -1){
                        details['links'].push({ title: link.title, id: -1, });
                        details['errors'].push(`page not found by title "${link.title}"`);
                        LOG(WARNING, `page not found: ${link.title}`);
                    } else {
                        details['links'].push({ title: link.title, id: page.id, url: page.data.fullurl });
                    }
                } else {
                    details['errors'].push(`page not found by title "${link.title}"`);
                    LOG(ERROR, `no page data: ${link.title}`);
                }
            }
        }

        details['categories'] = pageData.categories ? [...pageData.categories] : [];
        // details['links'] = pageData.links ? [...pageData.links] : [];

        details['start'] = firstYear;
        details['end'] = currentYear;
        details['years'] = {...years};
        details['title'] = item.title;
        details['id'] = item.id;
        details['urlID'] = url;
        details['url'] = pageData.fullurl;
        details['status'] = details.errors.length > 0 ? 'error' : details.warnings.length > 0 ? 'warning' : 'ok';
        details['statusCSS'] = details.errors.length > 0 ? 'bg-danger' : details.warnings.length > 0 ? 'bg-warning' : 'bg-success';

        details['showIssues'] = details.errors.length > 0 || details.warnings.length > 0 ? true : false;
        if(!dataAll[`${id}`]){
            dataAll[`${id}`] = { ...details};
        }
        j++;
        LOG(OK, `[${j} / ${num}] - ${details.url}`);
    }

    // const data = command('curl -X GET -H "Content-type: application/json"  -H "Accept: application/json"  "https://portal.hey-muenster.de/w/api.php?action=query&list=allpages&aplimit=500&format=json"');
    return { data: { ...dataAll}, num: num };
 };