import { isErrorResponse, serialize } from '../mapagent';
import { deArrayify } from './../deArrayify';
import { DEFAULT_LOCALE } from "../../i18n";
import { MgError } from '../../error';
import * as Common from "../../contracts/pbpl/planregister";

export class PBPLDBRequestBuilder {
    private locale: string;
    protected agentUri: string;
    constructor(agentUri: string, locale: string = DEFAULT_LOCALE) {
        this.agentUri = agentUri;
    }


    public async get<T>(url: string): Promise<T> {
        
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            } as any,
            method: "GET"
        });
        if (isErrorResponse(response)) {
            throw new MgError(response.statusText);
        } else {
            const json = await response.json();
            return json;
            //return deArrayify(json) as T;
        }
    }

    public async post<T>(url: string, data: any): Promise<T> {
        if (!data.format) {
            data.format = "application/json";
        }
        //const form = new FormData();
        //for (const key in data) {
        //    form.append(key.toUpperCase(), data[key]);
        //}
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            } as any,
            method: "POST",
            body: serialize(data) //form
        });
        if (isErrorResponse(response)) {
            
            throw new MgError(response.statusText);
        } else {
            const json = await response.json();
            return deArrayify(json) as T;
        }
    }

    private stringifyGetUrl(options: any): string {
        if (!options.version) {
             options.version = "1.0.0";
        }
        if (!options.locale) {
            options.locale = this.locale;
        }
        if (!options.format) {
            options.format = "application/json";
        }
        let url = this.agentUri;
        let bFirst = true;
        for (const key in options) {
            if (bFirst) {
                url += `?${key.toUpperCase()}=${options[key]}`;
                bFirst = false;
            } else {
                url += `&${key.toUpperCase()}=${options[key]}`;
            }
        }
        return url;
    }

    public getPlans<T extends Common.Plan>(args: Common.Plan): Promise<Common.Plan[]> {
        // if (args != null) {
            const p1 = { operation: "PLANS"};
            const url = this.stringifyGetUrl({ ...args, ...p1 });
            const json = this.get<Common.Plan[]>(url);
            //console.log(json);
            return json;
        // } else {
            // ToDo: possibl error reported here?
            // const url = this.stringifyGetUrl({ operation: "GETRESOURCE", resourceId: resourceId });
            // return this.get<T[]>(url);
        // }
    }
}