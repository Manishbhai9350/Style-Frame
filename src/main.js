import './style.css'
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader'
import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertex.glsl'
import { TextureLoader } from 'three';
import { LoadTexture } from './utils';
import GUI from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Mesh } from 'three';
import { BoxGeometry } from 'three';
import { MeshBasicMaterial } from 'three';
import gsap from 'gsap';
import { Group } from 'three';
import { Vector2 } from 'three';

const {PI} = Math

const canvas = document.querySelector('canvas')

const lil = new GUI()

canvas.width = innerWidth;
canvas.height = innerHeight;

const scene = new THREE.Scene()

const renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:true})

const camera = new THREE.OrthographicCamera(-1,1,1,-1)
// const camera = new THREE.PerspectiveCamera(45,innerWidth/innerHeight,0,1000)

const controls = new OrbitControls(camera,canvas)

camera.position.set(7,7,7)
camera.lookAt(0,0,0)



const Manager = new THREE.LoadingManager();
const Draco = new DRACOLoader(Manager)
const GLB = new GLTFLoader(Manager)
const Texture = new TextureLoader(Manager)

Draco.setDecoderPath('/draco/')
Draco.setDecoderConfig({type: 'wasm'})
GLB.setDRACOLoader(Draco)

const Raycaster = new THREE.Raycaster()



const Images = 5
const Planes = new Group()
scene.add(Planes)

for(let i = 1; i <= Images; i++){
  const texture = LoadTexture(`/images/${i}.jpg`,Texture)
  // const material = new THREE.MeshBasicMaterial({
  //   // color:0x111111,
  //   map:texture,
  //   opacity:.4
  // })
  const material = new THREE.ShaderMaterial({
    fragmentShader,
    vertexShader,
    uniforms:{
      uTime:{value:0},
      uTexture:{value:texture},
      uResolution:{value:3/1000}
    }
  })
  
  // lil.add(material.uniforms.uResolution,'value').min(0).max(1).name(`Plane - ${i}`)
  
  const Plane = new THREE.Mesh(
    new THREE.PlaneGeometry(.7,.9),
    material
  )

  Plane.name = 'image-mesh' + i
  Plane.targetResolution = 3/1000

  Planes.add(Plane)
  Plane.position.z = (i - Images / 2) * .3
  
}



function Animate(){

  Planes.children.forEach(child => {
    if(!child.userData.targetResolution) return;
    // child.material.uniforms.uResolution.value += (child.userData.targetResolution - child.material.uniforms.uResolution.value) * .1
    // console.log(child.userData.targetResolution)
  })


  controls.update()
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

const mouse = new Vector2()
function mouseMove(e){
  const x = e.clientX / innerWidth;
  const y = e.clientY / innerHeight;

  const nx = x * 2 - 1;
  const ny = -(y * 2 - 1);

  mouse.set(nx,ny)

  Raycaster.setFromCamera(mouse,camera)
  const intersect = Raycaster.intersectObjects(Planes.children)?.[0]?.object?.name || ''

  Planes.children.forEach(child => {
    if(child.name == intersect) {
      // child.userData.targetResolution = 3/1000
      gsap.to(child.material.uniforms.uResolution,{
        value:1,
        ease:'power4.out'
      })
    } else {
      gsap.to(child.material.uniforms.uResolution,{
        value:3/1000,
        ease:'power4.in'
      })
    }
  })


  gsap.to(Planes.rotation,{
    y:(2 - x * 1.5) * .3,
  })
  gsap.to(camera.position,{
    y:7 - (1-y) * 6
  })
}

window.addEventListener('mousemove',mouseMove)

window.addEventListener('resize',resize)
