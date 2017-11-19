import React from 'react'
import {
  TheThemeStyle,
  TheMain,
  TheSpin,
  TheButton,
  TheCondition,
  TheToastGroup,
  TheInfo,
  TheToast
} from 'the-components'
import asleep from 'asleep'
import Crop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import './App.css'
import {getExtension} from './helpers'

// https://github.com/electron/electron/issues/9920
const {nativeImage} = window.require('electron')
const fs = window.require('fs')

class App extends React.Component {
  constructor (props) {
    super(props)
    const s = this
    s.state = {
      busy: false,
      photoBusy: false,
      crop: {},
      image: null,
      toasts: {
        info: [],
        error: []
      },
      showSaveButton: false
    }
    s.save = s.save.bind(s)
    s.handleChangeCrop = s.handleChangeCrop.bind(s)
  }

  render () {
    const s = this
    const {
      src,
      dest
    } = s.props
    const {
      busy,
      photoBusy,
      crop,
      image,
      toasts,
      showSaveButton
    } = s.state
    return (
      <div className='App'>
        <TheThemeStyle options={{dominantColor: 'rgb(47, 50, 60)'}} />
        <TheMain className='App-body'>
          <TheInfo
            className='App-info'
            data={{
              input: src,
              output: dest
            }}
          />
          <TheSpin enabled={busy} cover size='xx-large' theme='A' />
          <div className='App-image'>
            <TheSpin enabled={photoBusy} cover size='xx-large' theme='A' />
            {
              image &&
              <div title='Select cropping area'>
                <Crop
                  src={image && image.dataUrl}
                  onChange={s.handleChangeCrop}
                  crop={crop}
                  minWidth={1}
                  minHeight={1}
                  onComplete={() => s.setState({showSaveButton: true})}
                />
              </div>
            }
            <TheCondition if={showSaveButton}>
              {/* 選択範囲の右下に出る */}
              <TheButton
                className='App-save-button'
                style={s.getButtonPostion(crop)}
                onClick={s.save}
                title='Save cropped image'
                >
                Save
              </TheButton>
            </TheCondition>
          </div>
        </TheMain>

        <TheToastGroup>
          <TheToast.Info onUpdate={(({info}) => s.updateToast({info}))} messages={toasts.info} clearAfter={2000} />
          <TheToast.Error onUpdate={({error}) => s.updateToast({error})} messages={toasts.error} clearAfter={2000} />
        </TheToastGroup>
      </div>
    )
  }

  componentDidMount () {
    const s = this
    const {src} = s.props
    // Load image
    s.setState({busy: true})
    try {
      const image = nativeImage.createFromPath(src)
      const dataUrl = image.toDataURL()
      const size = image.getSize()
      s.setState({
        image: {
          dataUrl,
          size,
          native: image
        }
      })
    } catch (e) {
      console.error(e)
      s.updateToast({error: 'Error'})
    } finally {
      s.setState({busy: false})
    }
  }

  async save () {
    const s = this
    s.setState({photoBusy: true})
    const {dest} = s.props
    const {crop, image} = s.state
    const rect = s.realRect(crop)
    const {native} = image
    const cropped = native.crop(rect)
    const ext = getExtension(dest)
    const imageBuf = ext.isPNG ? cropped.toPNG() : (ext.isJPEG ? cropped.toJPEG(100) : null)
    if (!imageBuf) {
      // main.js で阻止する
      s.updateToast({error: ['Invalid extension']})
      return
    }
    const png = cropped.toPNG()
    try {
      fs.writeFileSync(dest, png)
      await asleep(500)
      s.updateToast({info: ['Saved']})
    } catch (e) {
      console.error(e)
      s.updateToast({error: ['Error']})
    } finally {
      s.setState({photoBusy: false})
    }
  }

  realRect (crop) {
    const s = this
    const {width: w, height: h} = s.state.image.size
    const rect = {
      x: Math.floor(w * crop.x / 100),
      y: Math.floor(h * crop.y / 100),
      width: Math.floor(w * crop.width / 100),
      height: Math.floor(h * crop.height / 100)
    }
    return rect
  }

  getButtonPostion (crop) {
    return {top: `${crop.y + crop.height}%`, left: `${crop.x + crop.width}%`}
  }

  updateToast (values) {
    const s = this
    s.setState({toasts: Object.assign({}, s.state.toasts, values)})
  }

  handleChangeCrop (crop) {
    const s = this
    s.setState({crop, showSaveButton: false})
  }
}

export default App
