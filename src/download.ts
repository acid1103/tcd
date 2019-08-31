/**
 * Retrieves all the comments and metadata of a given video from the twitch api.
 * @param videoId The id of the video whose comments to get
 * @param clientId The twitch client id
 * @param update A function which is called for every page of comments downloaded
 * @returns A Promise which resolves to an object containing an array of comments and metadata on the video which the
 * comments are on
 */
export async function getTwitchComments(videoId: string, clientId: string, update?: () => void) {
    // get the comments and video data, package them into an object, then return that object
    const data = await Promise.all([getComments(videoId, clientId, update), getVideoData(videoId, clientId)]);
    return {
        comments: data[0],
        video: data[1],
    };
}

/**
 * Asynchronously retrieves all the comments of a given video from the twitch api. This api endpoint is undocumented, as
 * is the contents of the json returned by the endpoint
 * @param videoId The id of the video whose comments to get
 * @param clientId The twitch client id
 * @param update A function which is called for every page of comments downloaded
 * @returns A Promise which resolves to an array of comment objects
 */
export async function getComments(videoId: string, clientId: string, update: () => void) {
    let comments = new Array<any>();
    let cursor = "";

    // the comments endpoint is paginated, so we loop until we run out of pages
    do {
        const reqUrl =
            `https://api.twitch.tv/v5/videos/${videoId}/comments?client_id=${clientId}&cursor=${escape(cursor)}`;
        const req = await sendGetRequest(reqUrl);
        const json = JSON.parse(req.response);
        if (json.error) { throw json; }
        if (json.comments) {
            comments = comments.concat(json.comments);
            update();
        } else {
            // tslint:disable-next-line: no-console
            console.error(`Comment request returned no comments! Url: ${reqUrl}`);
        }
        cursor = json._next;
    } while (cursor);

    return comments;
}

/**
 * Asynchronously retrieves the data of a given video from the twitch api
 * @param videoId The id of the video whose data to get
 * @param clientId The twitch client id
 * @returns The parsed JSON data retrieved from the twitch api
 * @see https://dev.twitch.tv/docs/v5/reference/videos/#get-video
 */
export async function getVideoData(videoId: string, clientId: string) {
    const url = `https://api.twitch.tv/kraken/videos/${videoId}?client_id=${clientId}`;

    const req = await sendGetRequest(url);
    const json = JSON.parse(req.response);
    if (json.error) { throw json; }

    return json;
}

/**
 * Sends a get request to the given url with the given headers
 * @param url The url to send the get request
 * @param headers An object whose properties represent the headers to apply to the request
 * @returns A Promise that resolves after the request loads, or rejects when an error occurs.
 */
export function sendGetRequest(url: string, headers?: IHeaders) {
    const req = new XMLHttpRequest();
    req.open("GET", url, true);

    if (headers) {
        for (const entry of Object.entries(headers)) {
            req.setRequestHeader(entry[0], entry[1]);
        }
    }

    const promise = new Promise<XMLHttpRequest>((resolve, reject) => {
        req.onload = () => resolve(req);
        req.onerror = reject;
        req.onabort = reject;
        req.ontimeout = reject;
    });

    req.send();

    return promise;
}

// tslint:disable-next-line: interface-name
export interface IHeaders { [key: string]: string; }
