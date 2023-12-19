import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

export default class MicrosoftTTS {
  constructor ({text = '', utteranceOptions = {}, recorderOptions = {}, dataType = ''}) {
    this.audioContext = new AudioContext()
    this.text = text
    this.utteranceOptions = utteranceOptions
    this.recorderOptions = recorderOptions
    this.dataType = dataType
  }

  cancel () {

  }

  start (text = '') {
    if (text) this.text = text
    if (this.text === '') throw new Error('no words to synthesize')

    const tts = new MsEdgeTTS()

    return new Promise((resolve, reject) => {
      tts.setMetadata(this.utteranceOptions.lang + '-' + this.utteranceOptions.voice, OUTPUT_FORMAT.WEBM_24KHZ_16BIT_MONO_OPUS, this.utteranceOptions.lang)
        .then(() => {
          const readable = tts.toStream(this.text)
          let data = []
          readable.on('data', d => data.push(d))
          readable.on('end', () => {
            const buffer = Buffer.concat(data)
            this.audioContext.decodeAudioData(
              new Uint8Array(buffer).buffer,
              audioBuffer => this.play(audioBuffer, resolve, buffer))
            readable.on('error', reject)
          })
        })
    })
  }

  play (audioBuffer, resolve, buffer) {
    const source = this.audioContext.createBufferSource()
    source.onended = () => {
      resolve({
        canceled: false,
        blob: () => Promise.resolve({
          tts: this,
          data: new Blob([buffer], {type: 'audio/webm; codecs=opus'})
        })
      })
    }
    source.buffer = audioBuffer
    source.connect(this.audioContext.destination)
    source.start(0)
  }
}
