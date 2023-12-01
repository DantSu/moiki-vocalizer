const datauri = require('datauri')
const jimp = require('jimp')
const path = require('path')
const fs = require('fs')

const sharp = require('sharp')
const kebabCase = require('lodash.kebabcase')
const {getOrCreatePath} = require('./get-or-create-path')

const generateAssetFiles = async (storyData, folderName) => {
  const svgFolder = getOrCreatePath(folderName, 'images', 'svg')
  const pngFolder = getOrCreatePath(folderName, 'images', 'png')
  const pngInvertFolder = getOrCreatePath(folderName, 'images', 'png-invert')

  for (let asset of storyData.assets) {
    try {
      const svgFilePath = path.join(svgFolder, kebabCase(asset.label) + '.svg')
      const svgString = decodeURIComponent(asset.icon.replace(/data:image\/svg\+xml,/g, ''))
      fs.writeFileSync(svgFilePath, svgString)
      const pngFilePath = path.join(pngFolder, kebabCase(asset.label) + '.png')
      const pngBuffer = await sharp(Buffer.from(svgString), {density: 450}).png().toBuffer()
      fs.writeFileSync(pngFilePath, pngBuffer)
      asset.pngIcon = await datauri(pngFilePath)
      const blackBg = new jimp(320, 240, 'black')
      const image = await jimp.read(pngBuffer)
      const pngInvertFilePath = path.join(pngInvertFolder, kebabCase(asset.label) + '.png')
      await blackBg.blit(image.contain(320, 240).invert(), 0, 0).writeAsync(pngInvertFilePath)
    } catch (e) {
      console.log(e.message)
    }
  }
}

module.exports = {generateAssetFiles}
