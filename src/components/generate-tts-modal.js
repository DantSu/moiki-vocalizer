import React, { useState, Fragment } from 'react'
import { selectors as settingsSelectors } from 'core/reducers/settings'
import { connect } from 'react-redux'
import SpeechSynthesisRecorder from 'libs/speech-synthesis-recorder'
import { Button, Modal, Select, Divider, Loader, Radio, Icon } from 'semantic-ui-react'
import moment from 'moment'
import { stat } from 'fs'

const GenerateTtsModal = (props) => {
  const {
    defaultVoice,
    listVoices,
    onClose,
    onValidate,
    onOpenOptions,
    stats
  } = props
  
  const [voice, setVoice] = useState(defaultVoice)
  const [safeRec, setSafeRec] = useState(true)

  const changeVoice = (newVoice) => {
    setVoice(listVoices.find(({value}) => value === newVoice).raw)
  }

  const testVoice = () => {
    new SpeechSynthesisRecorder({
      text: voice.testSentence || 'Je suis une voix de synthèse', 
      utteranceOptions: {
        ...voice.data,
        volume: 2
      }
    }).start()
  }

  const duration = voice ? moment.duration((stats.estimatedTime / voice.data.rate) + (stats.numNodes / 2), 's') : 0
  if (duration) {
    console.log('devrait durer: : ', moment.utc(duration.as('milliseconds')).format('mm:ss'))
  }
  return (
    <Modal
      size="tiny"
      open={true}
      closeOnDimmerClick={false}
    >
      <Modal.Header style={{ background: '#4c77ac', color: '#fff' }}>
        Synthèse vocale
      </Modal.Header>
      <Modal.Content>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <p>L'enregistrement de la synthèse vocale se fait en <b>temps réel</b> et utilise le micro.</p>
          <p>Une fois l'enregistrement lancé, les séquences seront lues les unes après les autres. Veillez à faire cela dans une pièce calme, et à <b>désactiver la mise en veille</b> le temps de l'opération.</p>
          <Divider />
          { voice ? (
            <Fragment>
              <div style={{ display: 'flex', flexDirection: 'column', margin: '.6em 0' }}>
                <span style={{ marginBottom: 5 }}>Voix</span>
                <div style={{ display: 'flex', justifyContent:'center', alignItems: 'center' }}>
                  <Button icon='plus' onClick={onOpenOptions} />
                  <Select fluid value={voice.id} onChange={(_, opt) => changeVoice(opt.value)} options={listVoices} style={{ flexGrow: 1, width: 'auto', marginRight: 5 }} />
                  <Button primary circular size="small" icon="play" onClick={() => testVoice()} />
                </div>
              </div>
              <Divider />
              <Radio
                style={{ display: 'flex', margin: 'auto' }}
                toggle
                label='Ne pas écraser les enregistrements existants'
                checked={safeRec}
                onChange={() => setSafeRec(!safeRec)}
              />
            </Fragment>
          ) : (
            <Fragment>
			  <p>Avant toute chose, commencez par ajouter une voix dans vos préférences</p>
			  <Button onClick={onOpenOptions}>
				<Icon name='plus' /> Ajouter une voix
			  </Button>
			</Fragment>
          )}
          
        </div>
      </Modal.Content>
      <Modal.Actions style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          id='modal-cancel-button'
          onClick={ onClose }
          disabled={ false }
        >Annuler</Button>
        <Button
          id='modal-validate-button'
          onClick={ () => onValidate(voice.data) }
          disabled={ !voice }
          primary
        >
          <div>Commencer</div>
          { duration > 0 && (<em style={{ fontWeight: 'normal' }}>temps estimé: {duration.humanize()}</em>)}
        </Button>
      </Modal.Actions>
    </Modal>
  )
}


const mapStateToProps = (state) => ({
  voices: state.settings.speech.voices,
  listVoices: state.settings.speech.voices && state.settings.speech.voices.map(x => ({
    key: x.id,
    text: x.label,
    value: x.id,
    raw: x
  })),
  defaultVoice: settingsSelectors.getDefaultVoice(state)
})

export default connect(mapStateToProps)(GenerateTtsModal)
