import { IDOMElementMetrics } from "../api/common";
import { IShowURL } from './defs';
import { ActionType } from '../constants/actions';
import { Plan } from '../api/contracts/pbpl/planregister';

/**
 * Pushes the given URL to the preview
 *
 * @export
 * @param {string} url
 * @returns
 */
export function showURL(selectedURL:string): IShowURL {
    return {
        type: ActionType.PBPL_SHOW_URL,
        payload: selectedURL
    };
}