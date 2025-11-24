import './style.css'
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader'
import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertex.glsl'
import { TextureLoader } from 'three';
import { LoadTexture } from './utils';
import GUI from 'lil-gui';

const {PI} = Math

const canvas = document.querySelector('canvas')

const lil = new GUI()

canvas.width = innerWidth;
canvas.height = innerHeight;

const scene = new THREE.Scene()

const renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:true})

// const camera = new THREE.OrthographicCamera(-1,1,1,-1)
const camera = new THREE.PerspectiveCamera(45,innerWidth/innerHeight,0,1000)

camera.position.set(2,2,2)
camera.lookAt(0,0,0)





const Manager = new THREE.LoadingManager();
const Draco = new DRACOLoader(Manager)
const GLB = new GLTFLoader(Manager)
const Texture = new TextureLoader(Manager)

Draco.setDecoderPath('/draco/')
Draco.setDecoderConfig({type: 'wasm'})
GLB.setDRACOLoader(Draco)



const Images = 5
const Planes = []

for(let i = 1; i <= Images; i++){
  const texture = LoadTexture(`/images/${i}.jpg`,Texture)
  const material = new THREE.ShaderMaterial({
    fragmentShader,
    vertexShader,
    transparent:true,
    opacity:.3,
    uniforms:{
      uTime:{value:0},
      uTexture:{value:texture},
      uResolution:{value:5}
    }
  })
  
  lil.add(material.uniforms.uResolution,'value').min(5).max(1000).name(`Plane - ${i}`)
  
  const Plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1,1,1),
    material
  )

  Planes.push(Plane)
  Plane.position.z = (i - Images / 2) * .3
  scene.add(Plane)
  
}




function Animate(){
  renderer.render(scene,camera)
  requestAnimationFrame(Animate)
}

requestAnimationFrame(Animate)


function resize(){
  camera.aspect = innerWidth/innerHeight
  camera.updateProjectionMatrix()
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  renderer.setSize(innerWidth,innerHeight)
}

window.addEventListener('resize',resize)
