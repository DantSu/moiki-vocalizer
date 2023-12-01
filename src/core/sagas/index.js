import { all, fork } from 'redux-saga/effects'
import { appSaga } from './app'
import { projectsSaga } from './projects'
import { storySaga } from './story'
import { storeSaga } from './store'

function *mainSaga() {
  yield all([
    fork(appSaga),
    fork(projectsSaga),
    fork(storySaga),
    fork(storeSaga)
  ])
}

export default () => all([
  fork(mainSaga)
])
