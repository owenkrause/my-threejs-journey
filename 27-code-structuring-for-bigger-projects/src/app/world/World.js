import Experience from '../main.js'
import Environment from './Environment.js'
import Floor from './Floor.js'
import Fox from './Fox.js'

export default class World {
  constructor() {
    this.experience = new Experience()

    this.experience.resources.on('ready', () => {
      
      this.fox = new Fox()
      this.floor = new Floor()
      this.environment = new Environment()
    })
  }
  update() {
    if (this.fox) this.fox.update()
  }
}