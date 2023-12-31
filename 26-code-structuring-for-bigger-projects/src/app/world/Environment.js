import * as THREE from 'three'
import Experience from '../main'

export default class Environment {
  constructor() {
    this.experience = new Experience()

    if (this.experience.debug.active) {
      this.debugFolder = this.experience.debug.ui.addFolder('environment')
    }

    this.setSunLight()
    this.setEnvironmentMap()
  }

  setSunLight() {
    this.sunLight = new THREE.DirectionalLight(0xffffff, 4)
    this.sunLight.castShadow = true
    this.sunLight.shadow.camera.far = 15
    this.sunLight.shadow.mapSize.set(1024, 1024)
    this.sunLight.shadow.normalBias = 0.05
    this.sunLight.position.set(3, 3, -2.25)
    this.experience.scene.add(this.sunLight)
  }

  setEnvironmentMap() {
    this.environmentMap = {}
    this.environmentMap.intensity = .4 
    this.environmentMap.texture = this.experience.resources.items.environmentMapTexture
    this.environmentMap.texture.colorSpace = THREE.SRGBColorSpace
    this.experience.scene.environment = this.environmentMap.texture

    this.environmentMap.updateMaterials = () => {
      this.experience.scene.traverse( child => {
        if( child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial ) {
          child.material.envMap = this.environmentMap.texture
          child.material.envMapIntensity = this.environmentMap.intensity
          child.material.needsUpdate = true
        }
      })
    }
    this.environmentMap.updateMaterials()

    if (this.experience.debug.active) {
      this.debugFolder
        .add(this.environmentMap, 'intensity', 0, 4, .001).onChange(this.environmentMap.updateMaterials)
    }
  }
}