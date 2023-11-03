import * as THREE from 'three'

const canvas = document.querySelector('canvas.webgl')

const scene = new THREE.Scene()

const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const mesh = new THREE.Mesh(geometry, material)

mesh.position.x  = .7
mesh.position.y = -.6
mesh.position.z = 1

mesh.scale.x = 2
mesh.scale.y = .5
mesh.scale.z = .5

mesh.rotation.y = Math.PI    

scene.add(mesh)

const axesHelper = new THREE.AxesHelper()
scene.add(axesHelper)

const sizes = {
    width: 800,
    height: 600
}

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
// camera.position.x = 1
// camera.position.y = 1
camera.position.z = 3
scene.add(camera)

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)

