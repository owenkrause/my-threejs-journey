import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import * as CANNON from 'cannon-es'

THREE.ColorManagement.enabled = false

/**
 * Debug
 */
const gui = new GUI()
const debugObject = {
    createSphere: () => createSphere(
        Math.random() * .5, 
        { 
            x: (Math.random() - .5) * 5, 
            y: 3, 
            z: (Math.random() - .5) * 5
        }
    ),
    createBox: () => createBox(
        Math.random(), Math.random(), Math.random(),
        { 
            x: (Math.random() - .5) * 5, 
            y: 3, 
            z: (Math.random() - .5) * 5
        }
    ),
    reset: () => {
        for( const object of objectsToUpdate ) {
            object.body.removeEventListener('collide', playHitSound)
            world.removeBody(object)
            scene.remove(object.mesh)
        }
        objectsToUpdate.splice(0, objectsToUpdate.length)
    }
}
gui.add(debugObject, 'createSphere')
gui.add(debugObject, 'createBox')
gui.add(debugObject, 'reset')

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const hitSound = new Audio('/sounds/hit.mp3')
const playHitSound = collision => {
    const impactStrength = collision.contact.getImpactVelocityAlongNormal()
    if( impactStrength > .5 ) {
        hitSound.currentTime = 0
        hitSound.volume = impactStrength / (impactStrength + 1)
        hitSound.play()
    }
}

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png'
])

const world = new CANNON.World()
world.gravity.set(0, -9.82, 0)
world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true

const defaultMaterial = new CANNON.Material('concrete')
const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: .1,
        restitution: .7
    }
)
world.addContactMaterial(defaultContactMaterial)
world.defaultContactMaterial = defaultContactMaterial


const floorBody = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Plane(),
})
floorBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(-1, 0, 0),
    Math.PI / 2
)

world.addBody(floorBody)


/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(- 3, 3, 3)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


const objectsToUpdate = []

const sphereGeometry = new THREE.SphereGeometry(1, 20, 20)
const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: .3,
    roughness: .4,
    envMap: environmentMapTexture
})

const createSphere = (radius, position) => {
    const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
    mesh.scale.set(radius, radius, radius)
    mesh.castShadow = true
    mesh.position.copy(position)
    scene.add(mesh)

    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 0, 0),
        shape: new CANNON.Sphere(radius),
        material: defaultMaterial
    })
    body.position.copy(position)
    body.addEventListener('collide', playHitSound)
    world.addBody(body)

    objectsToUpdate.push({
        mesh: mesh,
        body: body
    })
}

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const boxMaterial = new THREE.MeshStandardMaterial({
    metalness: .3,
    roughness: .4,
    envMap: environmentMapTexture
})

const createBox = (width, height, length, position) => {
    const mesh = new THREE.Mesh(boxGeometry, boxMaterial)
    mesh.scale.set(width, height, length)
    mesh.castShadow = true
    mesh.position.copy(position)
    scene.add(mesh)

    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 0, 0),
        shape: new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, length / 2)),
        material: defaultMaterial
    })

    body.position.copy(position)
    body.addEventListener('collide', playHitSound)
    world.addBody(body)

    objectsToUpdate.push({
        mesh: mesh,
        body: body
    })
}

createSphere(0.5, { x: 0, y: 3, z: 0 })
createBox(.5, .5, .5, { x: 0, y: 2, z: 0 })
/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime

    world.step(1 / 60, deltaTime, 3)

    for(const object of objectsToUpdate) {
        object.mesh.position.copy(object.body.position)
        object.mesh.quaternion.copy(object.body.quaternion)
    }
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()