import * as THREE from 'three'
import Experience from '../main'

export default class Fox {

  constructor() {
    this.experience = new Experience()
    this.setModel()
    this.setAnimation()
  }

  setModel() {
    this.model = this.experience.resources.items.foxModel.scene
    this.model.scale.set(.02, .02, .02)
    this.experience.scene.add(this.model)

    if (this.experience.debug.active) {
      this.debugFolder = this.experience.debug.ui.addFolder('fox')
    }

    this.model.traverse( child => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
      }
    })
  } 

  setAnimation() {
    this.animation = {}
    this.animation.mixer = new THREE.AnimationMixer(this.model)
    this.animation.actions = {}
    this.animation.actions.idle = this.animation.mixer.clipAction(this.experience.resources.items.foxModel.animations[0])
    this.animation.actions.walk = this.animation.mixer.clipAction(this.experience.resources.items.foxModel.animations[1])
    this.animation.actions.run = this.animation.mixer.clipAction(this.experience.resources.items.foxModel.animations[2])

    this.animation.actions.current = this.animation.actions.idle
    this.animation.actions.current.play()

    this.animation.play = name => {
      this.animation.actions[name].reset()
      this.animation.actions[name].play()
      this.animation.actions[name].crossFadeFrom(this.animation.actions.current, 1)
      this.animation.actions.current = this.animation.actions[name]
    }

    if (this.experience.debug.active) {
      const debugObject = {
        playIdle: () => this.animation.play('idle'),
        playWalk: () => this.animation.play('walk'),
        playRun: () => this.animation.play('run'),
      }
      this.debugFolder.add(debugObject, 'playIdle')
      this.debugFolder.add(debugObject, 'playWalk')
      this.debugFolder.add(debugObject, 'playRun')
    }
  }

  update() {
    this.animation.mixer.update(this.experience.time.delta * .001)
  }
}