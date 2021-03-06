import * as _ from 'lodash';
import {reducer as toastrReducer} from 'react-redux-toastr'
import {combineReducers, Reducer} from 'redux';
import {
    Actions, default as ActionType
} from '../actions';
import {AppState} from '../states/AppState';
import {ConfigState} from '../states/ConfigState';
import Order from '../constants/Order';
import TaskSortField from '../constants/TaskSortField';
import CardAppearance from '../constants/CardAppearance';
import RootState from '../states/index';
import DayAppearance from "../constants/DayAppearance";


const INITIAL_APP_STATE: AppState = {
    tasksById: {},
    projects: [],
    labels: [],
    isSyncing: true,
};

export const INITIAL_CONFIG_STATE: ConfigState = {
    common: {
        todoistToken: '',
        minutesToUsePerDay: 240,
        estimatedLabels: {
            dict: {},
            yaml: ''
        },
        minutesToUsePerSpecificDays: {
            dict: {},
            yaml: ''
        },
        iconsByProject: {
            dict: {},
            yaml: ''
        },
        colorsByTaskNameRegexp: {
            dict: {},
            yaml: ''
        },
    },
    ui: {
        cardAppearance: CardAppearance.DETAIL,
        isIceboxVisible: false,
        taskSortField: TaskSortField.PROJECT_NAME,
        taskOrder: Order.ASC,
        numberOfCardsPerRow: 5,
        numberOfCards: 30,
        dayAppearance: DayAppearance.WEEKDAY,
    }
};

export const INITIAL_ROOT_STATE: RootState = {
    app: INITIAL_APP_STATE,
    config: INITIAL_CONFIG_STATE,
};

const appState = (state: AppState = INITIAL_APP_STATE, action: Actions): AppState => {
    switch (action.type) {
        case ActionType.SYNC:
            return Object.assign({}, state, {isSyncing: true});
        case ActionType.SUCCESS_SYNC:
            return Object.assign({}, state, {
                tasksById: action.payload.tasksById,
                projects: action.payload.projects,
                labels: action.payload.labels,
                isSyncing: false,
                error: null,
            });
        case ActionType.ERROR_SYNC:
            return Object.assign({}, state, {
                error: action.error,
                isSyncing: false,
            });
        case ActionType.UPDATE_TASKS:
            return Object.assign({}, state, {
                tasksById: Object.assign({}, state.tasksById,
                    _(action.payload)
                        .map(x => Object.assign({}, state.tasksById[x.id], {dueDate: x.dueDate}))
                        .keyBy(x => x.id)
                        .value()
                )
            });
        case ActionType.SUCCESS_UPDATE_TASKS:
            return Object.assign({}, state, {
                tasksById: action.payload,
                isSyncing: false,
                error: null,
            });
        case ActionType.ERROR_UPDATE_TASKS:
            return Object.assign({}, state, {
                error: action.error,
            });
        default:
            return state;
    }
};

const configState = (state: ConfigState = INITIAL_CONFIG_STATE, action: Actions): ConfigState => {
    switch (action.type) {
        case ActionType.UPDATE_COMMON_CONFIG:
            return Object.assign({}, state, {common: action.payload});
        case ActionType.UPDATE_UI_CONFIG:
            return Object.assign({}, state, {ui: action.payload});
        default:
            return state;
    }
};

export default combineReducers({
    app: appState as Reducer<any>,
    config: configState as Reducer<any>,
    toastr: toastrReducer,
});
