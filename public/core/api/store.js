const {ipcMain: ipc} = require('electron')
const fs = require('fs')
const path = require('path')
const dataUri = require('datauri')
const jimp = require('jimp')
const CryptoJS = require('crypto-js')
const kebabCase = require('lodash.kebabcase')

const {migrate} = require('../utils/migrate')
const {getOrCreatePath} = require('../utils/get-or-create-path')
const {generateAssetFiles} = require('../utils/generate-asset-files')
const {cleanContent} = require('../utils/clean-content')
const {requestJson, requestData} = require('../utils/request')

const
  requestHeaderMoiki = {
    'Host': 'moiki.fr',
    'Referer': 'https://moiki.fr/',
  },
  requestHeaderSound = {
    'Host': 'cdn.freesound.org'
  },

  checkSoundUrl = soundUrl => {
    const
      urlCheck = 'https://freesound.org/data/',
      urlReplace = 'https://cdn.freesound.org/'
    if (soundUrl.substring(0, urlCheck.length) !== urlCheck) {
      return soundUrl;
    }
    return urlReplace + soundUrl.substring(urlCheck.length)
  },

  downloadStory = async (event, slug) => {
    try {
      const stringJson = CryptoJS.AES.decrypt(
          Buffer.from(await requestJson(['htt', 'ps://', 'moi', 'ki.', 'fr/a', 'pi/s', 'oci', 'al-', 'clu', 'b/pl', 'ay/', slug].join(''), requestHeaderMoiki), 'base64')
            .toString('utf-8'),
          slug
        ).toString(CryptoJS.enc.Utf8),
        dataRaw = JSON.parse(stringJson),
        data = migrate(JSON.parse(stringJson)),
        folderName = kebabCase(data.meta.name) + '-' + new Date().getTime(),
        folderPath = getOrCreatePath(folderName)

      // generate cover
      const
        coverLocalPath = 'cover.png',
        coverFilePath = path.join(folderPath, coverLocalPath)

      if (data.meta.image) {
        const image = await jimp.read(data.meta.image)
        await image.writeAsync(coverFilePath)
        dataRaw.meta.imageLocal = coverLocalPath
        data.meta.imageLocal = coverLocalPath
      }

      // copy sounds
      if (data.sounds.length > 0) {
        const
          soundLocalPath = 'sound',
          soundPath = getOrCreatePath(folderName, soundLocalPath)
        for (let i = 0; i < data.sounds.length; ++i) {
          const
            sound = data.sounds[i],
            soundRaw = dataRaw.sounds[i],
            soundUrl = checkSoundUrl(sound.sound.previews['preview-hq-mp3']),
            fileName = path.basename(soundUrl)

          try {
            const soundData = await requestData(soundUrl, requestHeaderSound)
            fs.writeFileSync(path.join(soundPath, fileName), soundData)
            sound.sound.localFile = path.join(soundLocalPath, fileName)
            soundRaw.sound.localFile = sound.sound.localFile
          } catch (e) {
            console.error('Unable to download ' + soundUrl + '.')
          }
        }
      }

      // copy images
      if (data.images.length > 0) {
        const
          imgContentPath = getOrCreatePath(folderName, 'raw-images', 'content'),
          imgContentLocalPath = path.join('images', 'content')
        for (let i = 0; i < data.images.length; ++i) {
          const
            img = data.images[i],
            imgRaw = dataRaw.images[i],
            fileName = path.basename(img.url)

          const image = await jimp.read(img.url)
          await image.writeAsync(path.join(imgContentPath, fileName))
          img.urlLocal = path.join(imgContentLocalPath, fileName)
          imgRaw.urlLocal = img.urlLocal
        }
      }

      // generate visual assets
      await generateAssetFiles(data, folderName)

      // store rawData
      fs.writeFileSync(path.join(folderPath, 'raw-data.json'), JSON.stringify(dataRaw))

      const sequences = data.sequences.map(seq => ({
        ...seq,
        content: cleanContent(seq.content),
        choices: seq.choices ? seq.choices.map(ch => ({
          ...ch,
          content: cleanContent(ch.content)
        })) : []
      }))
      let nodes = [{
        id: '_root',
        content: 'Moiki présente : ' + data.meta.name
      }]
      sequences.forEach(seq => {
        if (seq.content) {
          nodes.push({id: seq.id, content: seq.content})
        }
        if (seq.choices && seq.choices.length > 0) {
          seq.choices.forEach((ch, idx) => {
            if (ch.content) {
              nodes.push({id: seq.id + '_chx-' + idx, content: ch.content})
            }
          })
        }
      })

      for (let {label, desc} of data.assets) {
        nodes.push({id: kebabCase(label) + '_obj', content: desc})
      }

      data.projectInfo = {
        folderName,
        creationDate: new Date(),
        title: data.meta.name,
        numNodes: nodes.length,
        numIcons: data.assets.length
      }

      const project = {...data, nodes, sequences, originalSequences: data.sequences}

      const projectFilePath = path.join(folderPath, 'project.json')
      if (data.meta.image) {
        project.cover = await dataUri(coverFilePath)
      }
      fs.writeFileSync(projectFilePath, JSON.stringify(project, null, 4))

      event.sender.send('IPC_REDUX_MESSAGE', 'project-created', null, project)
    } catch (e) {
      console.log('error !')
      console.log(e.message)
      event.sender.send('IPC_REDUX_MESSAGE', 'project-created', e)
    }
  }

const init = () => {
  ipc.on('download-story', downloadStory)
}

module.exports = {
  init
}
