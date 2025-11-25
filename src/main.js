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
lil.destroy()

canvas.width = innerWidth;
canvas.height = innerHeight;

const scene = new THREE.Scene()

const renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:true})

const camera = new THREE.OrthographicCamera(-1,1,1,-1)
// const camera = new THREE.PerspectiveCamera(45,innerWidth/innerHeight,0,1000)

const controls = new OrbitControls(camera,canvas)

camera.position.set(7,7,7)
camera.lookAt(0,0,0)

let PreviousPlaneIdx = null;
function StartAnimation(){

  const Slide = (nth = 1) => {
    let currentPlaneIdx = nth - 1;

    if(PreviousPlaneIdx !== null) {
      console.log(PreviousPlaneIdx)
      gsap.to(Planes.children[PreviousPlaneIdx].position,{
        y:0
      })
      gsap.to(Planes.children[PreviousPlaneIdx].material.uniforms.uResolution,{
        value:0
      })
      gsap.to(indicators[PreviousPlaneIdx].querySelector('.line'),{
      scaleX:0,
      duration:.3
    })
    }
    PreviousPlaneIdx = nth - 1

    const TL = gsap.timeline()

    TL.to(Planes.children[nth - 1].position,{
      y:.3
    })
    TL.to(Planes.children[nth - 1].material.uniforms.uResolution,{
      value:1
    })

    gsap.to(indicators[nth - 1].querySelector('.line'),{
      scaleX:1,
      duration:5,
      onComplete(){
        PreviousPlaneIdx = currentPlaneIdx
        currentPlaneIdx++;
        currentPlaneIdx %= Images
        Slide(currentPlaneIdx + 1)
      }
    })
  }

  Slide(1)
}


const Manager = new THREE.LoadingManager(StartAnimation);
const Draco = new DRACOLoader(Manager)
const GLB = new GLTFLoader(Manager)
const Texture = new TextureLoader(Manager)

Draco.setDecoderPath('/draco/')
Draco.setDecoderConfig({type: 'wasm'})
GLB.setDRACOLoader(Draco)

const Raycaster = new THREE.Raycaster()


const nav = document.querySelector('nav')
const indicators = []
const Images = 5
const Planes = new Group()
scene.add(Planes)

for(let i = 1; i <= Images; i++){
  const texture = LoadTexture(`/images/${i}.jpg`,Texture)
  

  const indicator = document.createElement('div')
  const line = document.createElement('div')
  line.classList.add('line')
  indicator.classList.add('indicator')
  indicator.appendChild(line)
  indicators.push(indicator)
  nav.appendChild(indicator)

  gsap.set(line,{scaleX:0})

  const material = new THREE.ShaderMaterial({
    fragmentShader,
    vertexShader,
    uniforms:{
      uTime:{value:0},
      uTexture:{value:texture},
      uResolution:{value:0}
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

function mouseMove(e){
  const x = e.clientX / innerWidth;
  const y = e.clientY / innerHeight;

  gsap.to(Planes.rotation,{
    y:(2 - x * 1.5) * .3,
  })
  gsap.to(camera.position,{
    y:7 - (1-y) * 6
  })
}

window.addEventListener('mousemove',mouseMove)

window.addEventListener('resize',resize)
