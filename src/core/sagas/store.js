import { send as ipcSend } from 'redux-electron-ipc'
import { all, fork, takeEvery, put, take, call, race } from 'redux-saga/effects'
import { types as storeTypes, messages as storeMessages } from 'core/reducers/store'
import { push as navigateTo } from 'connected-react-router'
import { requestJson } from '../../libs/request'
import { messages as storyMessages } from '../reducers/story'

const moikiStoriesCall = async (params) => {
  return await requestJson(
    [
      'htt', 'ps:', '//mo', 'iki', '.fr/', 'ap', 'i/soc', 'ial', '-cl', 'ub/l', 'ist?',
      'pa', 'ge=', params.page,
      '&chi', 'ldr', 'enO', 'nly=', params.childrenOnly,
      '&al', 'lLa', 'ngs=', params.allLangs,
      '&ki', 'nd=', params.kind,
      '&cat', 'ego', 'ry=', params.category,
      '&or', 'der=', params.order
    ].join(''),
    {
      'Host': 'moiki.fr',
      'Referer': 'https://moiki.fr/',
    }
  )
}

export function * storeListSaga (action) {
  try {
    const results = yield call(moikiStoriesCall, action.payload)
    yield put(storeMessages.listSuccess(results))
  } catch (e) {
    console.error(e)
    yield put(storeMessages.listError(e))
  }
}

export function * storeDownloadSaga (action) {
  try {
    yield put(ipcSend('download-story', action.payload))
    const {payload} = yield take('project-created')
    const [error, project] = payload
    if (error) {
      throw error
    }
    yield put(storyMessages.importSuccess(project))
    yield put(navigateTo('/story'))
  } catch (e) {
    console.error(e)
    yield put(storeMessages.downloadError(e))
  }
}

// -- watchers

export function * watchStoreList () {
  yield takeEvery([storeTypes.LIST], storeListSaga)
}

export function * watchStoreDownload () {
  yield takeEvery([storeTypes.DOWNLOAD], storeDownloadSaga)
}

// -- init

export function * storeSaga () {
  yield all([
    fork(watchStoreList),
    fork(watchStoreDownload),
  ])
}
