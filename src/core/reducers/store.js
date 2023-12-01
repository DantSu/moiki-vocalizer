export const types = {
  LIST: 'moiki-voc/store/LIST',
  LIST_SUCCESS: 'moiki-voc/store/LIST_SUCCESS',
  LIST_ERROR: 'moiki-voc/store/LIST_ERROR',
  DOWNLOAD: 'moiki-voc/store/DOWNLOAD',
  DOWNLOAD_SUCCESS: 'moiki-voc/store/DOWNLOAD_SUCCESS',
  DOWNLOAD_ERROR: 'moiki-voc/store/DOWNLOAD_ERROR',
}

const initialState = {
  pending: false,
  error: null,
  list: null,
  download: null
}

export default function storeReducer (state = initialState, action = {}) {
  switch (action.type) {
    case types.LIST:
      return {
        ...state,
        list: null,
        error: null,
        pending: true,
        download: null
      }
    case types.LIST_ERROR:
      return {
        ...state,
        error: action.payload,
        list: null,
        pending: false,
        download: null
      }
    case types.LIST_SUCCESS:
      return {
        ...state,
        list: action.payload,
        error: null,
        pending: false,
        download: null
      }
    case types.DOWNLOAD:
      return {
        ...state,
        error: null,
        pending: true,
        download: action.payload
      }
    case types.DOWNLOAD_SUCCESS:
      return {
        ...state,
        error: null,
        pending: false,
        download: null
      }
    case types.DOWNLOAD_ERROR:
      return {
        ...state,
        error: action.payload,
        pending: false,
        download: null
      }
    default:
      return state
  }
}

export const actions = {
  getList: (payload) => ({type: types.LIST, payload: payload}),
  download: (slug) => ({type: types.DOWNLOAD, payload: slug})
}

export const messages = {
  listError: (error) => ({type: types.LIST_ERROR, payload: error}),
  listSuccess: (data) => ({type: types.LIST_SUCCESS, payload: data}),
  downloadSuccess: () => ({type: types.DOWNLOAD_SUCCESS}),
  downloadError: (error) => ({type: types.DOWNLOAD_ERROR, payload: error}),
}

export const selectors = {
  listPending: (state) => state.store.pending,
  listError: (state) => state.store.error,
  list: (state) => state.store.list
}
