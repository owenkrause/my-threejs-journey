import * as THREE from 'three'
import Experience from './main.js'

export default class Renderer {
  constructor()
  {
    this.experience = new Experience()

    this.setInstance()
  }

  setInstance()
  {
    this.instance = new THREE.WebGLRenderer({ canvas: this.experience.canvas, antialias: true })
    this.instance.physicallyCorrectLights = true
    this.instance.outputColorSpace = THREE.SRGBColorSpace
    this.instance.toneMapping = THREE.CineonToneMapping
    this.instance.toneMappingExposure = 1.75
    this.instance.shadowMap.enabled = true
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap
    this.instance.setClearColor('#211d20')
    this.instance.setSize(this.experience.sizes.width, this.experience.sizes.height)
    this.instance.setPixelRatio(this.experience.sizes.pixelRatio)
  }

  resize()
  {
    this.instance.setSize(this.experience.sizes.width, this.experience.sizes.height)
    this.instance.setPixelRatio(this.experience.sizes.pixelRatio)
  }

  update()
  {
    this.instance.render(this.experience.scene, this.experience.camera.instance)
  }
}