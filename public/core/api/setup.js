const {systemPreferences} = require('electron')
const {ipcMain: ipc} = require('electron')
const {FFMPEG_BIN_PATH} = require('../constants')
const ffbinaries = require('ffbinaries')
const ffmpeg = require('./ffmpeg')
const isDev = require('electron-is-dev')
const path = require('path')
const fs = require('fs')

const download = (event) => {
  console.log('FFMPEG: Downloading binaries')
  try {
    ffbinaries.downloadFiles(
      ['ffmpeg', 'ffprobe'],
      {
        quiet: !isDev,
        destination: FFMPEG_BIN_PATH,
        tickerFn: (tick) => {
          console.log('FFMPEG: Downloading binary:'+ tick.binaryName + '(' + tick.progress + '%)')
          event.sender.send('IPC_REDUX_MESSAGE', 'ffmpeg-download-progress', tick.progress)
        }
      },
      (error, data) => {
        ffmpeg.setBinariesPaths()
        if(error) {
          console.error(error)
          event.sender.send('IPC_REDUX_MESSAGE', 'ffmpeg-ready', error)
        } else {
          console.log('FFMPEG: Binary downloaded')
          event.sender.send('IPC_REDUX_MESSAGE', 'ffmpeg-ready', null)
        }
      }
    )
  } catch (e) {
    event.sender.send('IPC_REDUX_MESSAGE', 'ffmpeg-ready', e)
    console.log('FFMPEG: Error downloading binary')
  }
}

const enableMicrophone = (event) => {
  console.log('microphone status: ' + systemPreferences.getMediaAccessStatus('microphone'))
  systemPreferences.askForMediaAccess('microphone').then((isAllowed) => {
    if (isAllowed) {
      event.sender.send('IPC_REDUX_MESSAGE', 'microphone-ready')
    } else {
      event.sender.send('IPC_REDUX_MESSAGE', 'microphone-cancel')
    }
  })
}

const setup = (event) => {
  // allow to remove ffmpeg from cache
  // ffbinaries.clearCache()
  console.log(FFMPEG_BIN_PATH)
  const hasFfmpeg = fs.existsSync(path.join(FFMPEG_BIN_PATH, 'ffmpeg')) || fs.existsSync(path.join(FFMPEG_BIN_PATH, 'ffmpeg.exe'))
  const hasFfprobe = fs.existsSync(path.join(FFMPEG_BIN_PATH, 'ffprobe')) || fs.existsSync(path.join(FFMPEG_BIN_PATH, 'ffprobe.exe'))
  event.sender.send('IPC_REDUX_MESSAGE', 'app-setup-response', {
    microphoneReady: systemPreferences.getMediaAccessStatus('microphone') === 'granted',
    ffmpegReady: hasFfmpeg && hasFfprobe
  })
}

const init = () => {
  ipc.on('app-setup', setup)
  ipc.on('app-enable-microphone', enableMicrophone)
  ipc.on('ffmpeg-download', download)
}

module.exports = {
  init
}
