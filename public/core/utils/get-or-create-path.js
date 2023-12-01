const {PROJECT_PATH} = require('../constants')
const path = require('path')
const fs = require('fs')

const getOrCreatePath = (...pathParts) => {
  const folder = path.join(PROJECT_PATH, ...pathParts)
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, {recursive: true})
  }
  return folder
}

module.exports = {getOrCreatePath}
