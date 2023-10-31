import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader'
import { EXRLoader } from 'three/addons/loaders/EXRLoader'
import { GroundProjectedSkybox } from 'three/addons/objects/GroundProjectedSkybox.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
const global = {
    envMapIntensity: 1
}


const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
const rgbeLoader = new RGBELoader()
const exrLoader = new EXRLoader()
const textureLoader = new THREE.TextureLoader()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const updateAllMaterials = () => {
    scene.traverse(child => {
        if(child.isMesh && child.material.isMeshStandardMaterial) {
            child.material.envMapIntensity = global.envMapIntensity
        }
    })
}

// const environmentMap = cubeTextureLoader.load([
//     '/environmentMaps/0/px.png',
//     '/environmentMaps/0/nx.png',
//     '/environmentMaps/0/py.png',
//     '/environmentMaps/0/ny.png',
//     '/environmentMaps/0/pz.png',
//     '/environmentMaps/0/nz.png',
// ])

// scene.environment = environmentMap
// scene.background = environmentMap

// rgbeLoader.load('/environmentMaps/blender2k.hdr', environmentMap => {
//         environmentMap.mapping = THREE.EquirectangularReflectionMapping
//         scene.environment = environmentMap
//         //scene.background = environmentMap
//     }
// )

// exrLoader.load('/environmentMaps/nvidiaCanvas-4k.exr', environmentMap => {
//     environmentMap.mapping = THREE.EquirectangularReflectionMapping
//     scene.environment = environmentMap
//     scene.background = environmentMap
// })

// const environmentMap = textureLoader.load('/environmentMaps/blockadesLabsSkybox/anime_art_style_japan_streets_with_cherry_blossom_.jpg')
// environmentMap.mapping = THREE.EquirectangularReflectionMapping
// environmentMap.colorSpace = THREE.SRGBColorSpace
// scene.background = environmentMap
// scene.environment = environmentMap

// rgbeLoader.load('/environmentMaps/2/2k.hdr', environmentMap => {
//     environmentMap.mapping = THREE.EquirectangularReflectionMapping
//     scene.environment = environmentMap

//     const skybox = new GroundProjectedSkybox(environmentMap)
//     skybox.scale.setScalar(50)
//     skybox.radius = 120
//     skybox.height = 11
//     scene.add(skybox)
//     gui.add(skybox, 'radius', 1, 200, .1)
//     gui.add(skybox, 'height', 1, 200, .1)
// })

const environmentMap = textureLoader.load('/environmentMaps/blockadesLabsSkybox/interior_views_cozy_wood_cabin_with_cauldron_and_p.jpg')
environmentMap.mapping = THREE.EquirectangularReflectionMapping
environmentMap.colorSpace = THREE.SRGBColorSpace
scene.background = environmentMap

const ringLight = new THREE.Mesh(
    new THREE.TorusGeometry(8, .5),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(10, 4, 2) })
)
ringLight.position.y = 3.5
ringLight.layers.enable(1)
scene.add(ringLight)

const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType })
scene.environment = cubeRenderTarget.texture
const cubeCamera = new THREE.CubeCamera(.1, 100, cubeRenderTarget)
cubeCamera.layers.set(1)

scene.backgroundBlurriness = 0
scene.backgroundIntensity = 1

gui.add(scene, 'backgroundBlurriness', 0, 1, .001)
gui.add(scene, 'backgroundIntensity', 0, 1, .001)
gui.add(global, 'envMapIntensity', 0, 10, .001).onChange(updateAllMaterials)

/**
 * Torus Knot
 */
const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
    new THREE.MeshStandardMaterial({ roughness: .3, metalness: 1, color: 0xaaaaaa })
)
torusKnot.position.y = 4
torusKnot.position.x = -4
scene.add(torusKnot)

gltfLoader.load(
    '/models/FlightHelmet/glTF/FlightHelmet.gltf',
    gltf => {
        gltf.scene.scale.set(10,10,10)
        scene.add(gltf.scene)
        updateAllMaterials()
    }

)

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
camera.position.set(4, 5, 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.y = 3.5
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () =>
{
    // Time
    const elapsedTime = clock.getElapsedTime()

    if (ringLight) {
        ringLight.rotation.x = Math.sin(elapsedTime) * 1.5
        cubeCamera.update(renderer, scene)
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()