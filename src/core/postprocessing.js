import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass }     from 'three/addons/postprocessing/RenderPass.js'
import { SSAOPass }       from 'three/addons/postprocessing/SSAOPass.js'
import { OutputPass }     from 'three/addons/postprocessing/OutputPass.js'
import { scene, camera }  from './scene.js'
import { renderer }       from './renderer.js'

// Occlusion ambiante : assombrit les coins et recoins pour donner du volume
export const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))

const ssaoPass = new SSAOPass(scene, camera, window.innerWidth, window.innerHeight)
ssaoPass.kernelRadius = 12
ssaoPass.minDistance  = 0.002
ssaoPass.maxDistance  = 0.08
composer.addPass(ssaoPass)
composer.addPass(new OutputPass())
