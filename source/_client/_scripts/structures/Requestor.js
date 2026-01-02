/**
 * Date: 2nd January, 2026
 * 
 * This is the `Requestor` class borrowed from Khaylemsoft's TechSingularity
 * 
 * The point is to update all scripts that use this to prefer asynchronous functions
 * to solve the issues with old requests-making app, `RequestConnector` that started
 * failing upon prevalent and intensive use.
 */

class Requestor
{
    constructor(debugMode=false){
        this.shouldDebug = debugMode;
    }

    /**
     * 
     * @param {*} url 
     * @param {*} params 
     * @param {*} responseType: Can be either 'json' or 'text'
     * @returns 
     */
    async SendGet(url, responseType='json', params={})
    {
        let param = new URLSearchParams(params).toString();
        url = Object.entries(params).length > 0 ? `${url}?${param}` : url;

        //  Normalize response type
        responseType = responseType.toLowerCase();

        try
        {
            const response = await fetch(url);
            if (!response.ok) { throw new Error('Network response was not ok'); }

            const normResponse = responseType == 'json' ? await response.json() : responseType == 'text' ? await response.text() : response;
    
            return normResponse;
        }
        catch (error) { console.error(error.message); }
    }

    /**
     *  requestObjectType can either be json ('application/json'), html or form submissions with no file uploads
     *   ('application/x-www-form-urlencoded') or 'text/html',
     *  or for form data submissions with a lot of different-typed objects (Content-Type: multipart/form-data)
     *  responseType can be either 'text' or 'json'
     * 
     *  'text/javascript' is more up to date than 'application/javascript'
     */
    async SendPost(url, requestObjectType='json', responseType='json', params={})
    {
        let rqParams = new URLSearchParams(params).toString();
        
        let rqHeaders = new Headers();
        let rqobjtype = requestObjectType.toLowerCase();

        switch (rqobjtype)
        {
            case 'json':
                rqobjtype = 'application/json';
                rqParams = JSON.stringify(params)
                break;
            case 'html':
                rqobjtype = 'text/html';
                break;
            case 'pure-form':
                rqobjtype = 'application/x-www-form-urlencoded'; break;
            case 'multi':
                rqobjtype = 'multipart/form-data'; break;
        };

        rqHeaders.append('Content-Type', rqobjtype);

        if (this.shouldDebug) { console.log("rqParams: ", rqParams); }

        try
        {
            const response = await fetch(url, {
                method: "POST",
                headers: rqHeaders,
                body: rqParams
            });
    
            if (!response.ok) { throw new Error('Network response was not ok'); }
    
            const normResponse = responseType == 'json' ? await response.json() : responseType == 'text' ? await response.text() : response;
    
            return normResponse;
        }
        catch (error) { console.error(error.message); }
    }
}

export {Requestor};