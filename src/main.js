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
import gsap from 'gsap';
import { Group } from 'three';
import { projects } from './data.js'
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText)

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

const Title = document.querySelector('.projects .title')
const Description = document.querySelector('.projects .description')

const Titles = []
const Descriptions = []

function AddContent(){
  projects.forEach(({title,description},i) => {
    const h1 = document.createElement('h1')
    const p = document.createElement('p')
    h1.textContent = title
    p.textContent = description
    Titles.push[h1]
    Descriptions.push[p]
    Title.appendChild(h1)
    Description.appendChild(p)

    new SplitText(h1,{
      type:['words','lines'],
      mask:'lines',
      wordsClass:`heading-words-${i+1}`
    })
    new SplitText(p,{
      type:['words','lines'],
      mask:'lines',
      wordsClass:`para-words-${i+1}`
    })

    gsap.set([`.heading-words-${i+1}`,`.para-words-${i+1}`],{
      yPercent:100
    })


  })
}
AddContent()

let PreviousPlaneIdx = null;

function ShowContent(idx = 0){

  const TL = gsap.timeline()

  if(PreviousPlaneIdx !== null) {
    TL.to([`.heading-words-${PreviousPlaneIdx+1}`,`.para-words-${PreviousPlaneIdx+1}`],{yPercent:100})
  }
  
  TL.to([`.heading-words-${idx+1}`,`.para-words-${idx+1}`],{yPercent:0,stagger:.01})

}

function StartAnimation(){

  const Slide = (nth = 1) => {
    let currentPlaneIdx = nth - 1;

    if(PreviousPlaneIdx !== null) {
      gsap.to(Planes.children[PreviousPlaneIdx].position,{
        y:0
      })
      gsap.to(Planes.children[PreviousPlaneIdx].material.uniforms.uResolution,{
        value:0
      })
      gsap.to(indicators[PreviousPlaneIdx].querySelector('.line'),{
      transformOrigin:'right',
      scaleX:0,
      duration:.3
    })
    }

    ShowContent(nth - 1)

    PreviousPlaneIdx = nth - 1

    const TL = gsap.timeline()

    TL.to(Planes.children[nth - 1].position,{
      y:.3
    })
    TL.to(Planes.children[nth - 1].material.uniforms.uResolution,{
      value:1
    })


    gsap.to(indicators[nth - 1].querySelector('.line'),{
      transformOrigin:'left',
      scaleX:1,
      duration:5,
      ease:'none',
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



const nav = document.querySelector('nav')
const indicators = []
const Images = 5
const Planes = new Group()
scene.add(Planes)
const aspect = innerWidth / innerHeight
const scaling = innerWidth < 900 ? 1.5 : 1

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
    new THREE.PlaneGeometry(.7 * scaling,.4 * aspect * scaling),
    material
  )

  Plane.name = 'image-mesh' + i
  Plane.targetResolution = 3/1000

  Planes.add(Plane)
  Plane.position.z = (i - Images / 2) * .3
  
}



function Animate(){
  controls.update()
  renderer.render(scene,camera)
  requestAnimationFrame(Animate)
}

requestAnimationFrame(Animate)


function resize(){
  window.location.reload()
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
