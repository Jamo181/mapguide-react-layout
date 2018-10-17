import { IPBPLReducerState } from "../api/common";
import { ActionType } from '../constants/actions';
import { ViewerAction } from '../actions/defs';

export const PBPL_INITIAL_STATE:IPBPLReducerState = {
    selectedURL:""
};

export function pbplReducer(state = PBPL_INITIAL_STATE, action: ViewerAction) {
    switch (action.type) {
        case ActionType.PBPL_SHOW_URL:
            {
                const { payload } = action;
                return { ...state, ...{ selectedURL: payload } };
            }
    }
    return state;
}