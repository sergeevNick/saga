import fetch from 'node-fetch';
import { RequestMethod } from '../../../enums/request-method.enum';
import { AnyDictionary, Dictionary } from '@eigenspace/common-types';

/**
 * Common properties to request.
 */
export interface CommonQueryProps {
    params?: AnyDictionary;
    options?: AnyDictionary;
    headers?: AnyDictionary;
    data?: AnyDictionary | string | number;
    antiCacheDisabled?: boolean
}

export class BaseDataService {
    private readonly baseUrl: string;

    constructor(baseUrl = '') {
        this.baseUrl = baseUrl;
    }

    get(url: string, props: CommonQueryProps): Promise<AnyDictionary> {
        return this.request(url, RequestMethod.GET, props);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    post(url: string, props: CommonQueryProps): Promise<any> {
        return this.request(url, RequestMethod.POST, props);
    }

    private async request(
        fragmentUrl: string,
        method: RequestMethod,
        props: CommonQueryProps
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<any> {
        const { data, params, options, antiCacheDisabled } = props;

        let url = this.processUrl(`${this.baseUrl}${fragmentUrl}`, params, options);

        // TODO: should find out what the problem with processing anti-cache request to get taxonomies
        if (!antiCacheDisabled) {
            // Anti-cache
            url += `${!url.includes('?') ? '?' : '&'}_=${Date.now()}`;
        }

        let body: string = data as string;
        let headers: Dictionary<string> = props.headers || {};

        if (data && typeof data === 'object') {
            const isForm = headers['Content-Type'] === 'application/x-www-form-urlencoded';
            body = isForm ? this.getFormBody(data) : JSON.stringify(data);
            headers = {
                ...headers,
                'Accept': 'application/json',
                'Content-Type': headers['Content-Type'] || 'application/json'
            };
        }

        const response = await fetch(url, { method, headers, body });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        // return response;
        return response.json();
    }

    private getFormBody(object: AnyDictionary = {}): string {
        return Object.keys(object)
            .map(key => `${key}=${object[key]}`)
            .join('&');
    }

    private processUrl(url: string, params: AnyDictionary = {}, options: AnyDictionary = {}): string {
        const sanitized = url.replace(/#([a-zA-Z]+)/g, this.processMatching(options))
            .replace(/:([a-zA-Z]+)/g, this.processMatching(params))
            .replace(/[a-zA-Z_]*?=&/g, '')
            .replace(/[?&]?[a-zA-Z_]*?=$/g, '');

        return decodeURIComponent(sanitized);
    }

    private processMatching(urlParams: AnyDictionary): any {
        return (_: string, paramKey: string): string => {
            const param = urlParams[paramKey];
            if (param == null) {
                return '';
            }

            if (typeof param !== 'string') {
                return param;
            }

            return encodeURIComponent(param);
        };
    }
}
