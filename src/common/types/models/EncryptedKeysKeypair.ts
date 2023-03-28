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
 * @interface EncryptedKeysKeypair
 */
export interface EncryptedKeysKeypair {
    /**
     * 
     * @type {any}
     * @memberof EncryptedKeysKeypair
     */
    publicKey: any | null;
    /**
     * 
     * @type {any}
     * @memberof EncryptedKeysKeypair
     */
    privateKey: any | null;
}

/**
 * Check if a given object implements the EncryptedKeysKeypair interface.
 */
export function instanceOfEncryptedKeysKeypair(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "publicKey" in value;
    isInstance = isInstance && "privateKey" in value;

    return isInstance;
}

export function EncryptedKeysKeypairFromJSON(json: any): EncryptedKeysKeypair {
    return EncryptedKeysKeypairFromJSONTyped(json, false);
}

export function EncryptedKeysKeypairFromJSONTyped(json: any, ignoreDiscriminator: boolean): EncryptedKeysKeypair {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'publicKey': json['publicKey'],
        'privateKey': json['privateKey'],
    };
}

export function EncryptedKeysKeypairToJSON(value?: EncryptedKeysKeypair | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'publicKey': value.publicKey,
        'privateKey': value.privateKey,
    };
}

