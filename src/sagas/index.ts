import {call, fork, put, take} from 'redux-saga/effects';
import * as actions from '../actions';
import SyncPayload from '../payloads/SyncPayload';
import TodoistSyncService from './TodoistSyncService';
import SyncService from './SyncService';

export function* sync() {
    const service: SyncService = new TodoistSyncService();

    try {
        const payload: SyncPayload = yield call(service.sync);
        yield put(actions.successSync(payload));
    } catch (e) {
        yield put(actions.errorSync(e));
    }
}

function* syncLoop() {
    while (true) {
        yield take(actions.SYNC);
        yield call(sync);
    }
}

export default function* () {
    yield fork(syncLoop);
    yield call(sync);
}
