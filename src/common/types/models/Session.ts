/* tslint:disable */
/* eslint-disable */
/**
 * Virki API
 * REST API for the Virki 2FA service.
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface Session
 */
export interface Session {
    /**
     * 
     * @type {any}
     * @memberof Session
     */
    id: any | null;
    /**
     * 
     * @type {any}
     * @memberof Session
     */
    created: any | null;
    /**
     * 
     * @type {any}
     * @memberof Session
     */
    lastUsed: any | null;
    /**
     * 
     * @type {any}
     * @memberof Session
     */
    ipAddress: any | null;
    /**
     * 
     * @type {any}
     * @memberof Session
     */
    device: any | null;
    /**
     * 
     * @type {any}
     * @memberof Session
     */
    currentDevice: any | null;
    /**
     * 
     * @type {any}
     * @memberof Session
     */
    operatingSystem: any | null;
}

/**
 * Check if a given object implements the Session interface.
 */
export function instanceOfSession(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "id" in value;
    isInstance = isInstance && "created" in value;
    isInstance = isInstance && "lastUsed" in value;
    isInstance = isInstance && "ipAddress" in value;
    isInstance = isInstance && "device" in value;
    isInstance = isInstance && "currentDevice" in value;
    isInstance = isInstance && "operatingSystem" in value;

    return isInstance;
}

export function SessionFromJSON(json: any): Session {
    return SessionFromJSONTyped(json, false);
}

export function SessionFromJSONTyped(json: any, ignoreDiscriminator: boolean): Session {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'created': json['created'],
        'lastUsed': json['lastUsed'],
        'ipAddress': json['ipAddress'],
        'device': json['device'],
        'currentDevice': json['currentDevice'],
        'operatingSystem': json['operatingSystem'],
    };
}

export function SessionToJSON(value?: Session | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'created': value.created,
        'lastUsed': value.lastUsed,
        'ipAddress': value.ipAddress,
        'device': value.device,
        'currentDevice': value.currentDevice,
        'operatingSystem': value.operatingSystem,
    };
}

