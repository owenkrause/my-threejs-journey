import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import EventEmitter from './EventEmitter.js'

export default class Resources extends EventEmitter {
  
  constructor(sources) {
    super()
    this.sources = sources
    this.items = {}
    this.loaded = 0
    this.setLoaders()
    this.startLoading()
  }
  
  setLoaders() {
    this.loaders = {}
    this.loaders.gltfLoader = new GLTFLoader()
    this.loaders.textureLoader = new THREE.TextureLoader()
    this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader()
  }

  startLoading() {
    for(const source of this.sources) {
      switch(source.type) {
        case 'gltfModel':
          this.loaders.gltfLoader.load(source.path, file => {
            this.sourceLoaded(source, file)
          })
          break
        case 'texture':
          this.loaders.textureLoader.load(source.path, file => {
            this.sourceLoaded(source, file)
          })
          break
        case 'cubeTexture':
          this.loaders.cubeTextureLoader.load(source.path, file => {
            this.sourceLoaded(source, file)
          })
          break
      }
    }
  }

  sourceLoaded(source, file) {
    this.items[source.name] = file
    this.loaded++
    if (this.loaded === this.sources.length) this.trigger('ready')
  }
}