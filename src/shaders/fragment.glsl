
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uResolution;


void main(){
    // vec2 muv = vUv;
    vec2 muv = floor(vUv * uResolution) / uResolution;
    vec4 color = texture2D(uTexture,muv);

    // gl_FragColor = vec4(1.0, .1, .1, 1.0);
    gl_FragColor = color;
}