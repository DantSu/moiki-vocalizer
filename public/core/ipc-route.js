const setupApi = require('./api/setup')
const projectsApi = require('./api/projects')
const ffmpegApi = require('./api/ffmpeg')
const importApi = require('./api/import')
const exportApi = require('./api/export')
const storeApi = require('./api/store')

const initialize = () => {
  setupApi.init()
  projectsApi.init()
  ffmpegApi.init()
  importApi.init()
  exportApi.init()
  storeApi.init()
}

module.exports = {
  initialize
}
