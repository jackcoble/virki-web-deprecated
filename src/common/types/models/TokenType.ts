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
 * @interface TokenType
 */
export interface TokenType {
}

/**
 * Check if a given object implements the TokenType interface.
 */
export function instanceOfTokenType(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function TokenTypeFromJSON(json: any): TokenType {
    return TokenTypeFromJSONTyped(json, false);
}

export function TokenTypeFromJSONTyped(json: any, ignoreDiscriminator: boolean): TokenType {
    return json;
}

export function TokenTypeToJSON(value?: TokenType | null): any {
    return value;
}

