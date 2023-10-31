import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Experience from './main.js'

export default class Camera {
  constructor() 
  {
    this.experience = new Experience()

    this.setInstance()
    this.setOrbitControls()
  }

  setInstance()
  {
    this.instance = new THREE.PerspectiveCamera(35, this.experience.sizes.width / this.experience.sizes.height, .1, 100)
    this.instance.position.set(9, 7, 11)
    this.experience.scene.add(this.instance)
  }

  setOrbitControls() 
  {
    this.controls = new OrbitControls(this.instance, this.experience.canvas)
    this.controls.enableDamping = true
  }
  
  resize()
  {
    this.instance.aspect = this.experience.sizes.width / this.experience.sizes.height
    this.instance.updateProjectionMatrix()
  }

  update()
  {
    this.controls.update()
  }
}