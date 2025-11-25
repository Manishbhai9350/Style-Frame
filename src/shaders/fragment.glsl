
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uResolution;


void main(){
    // vec2 muv = vUv;
    float res = 1000. * uResolution;
    vec2 muv = floor(vUv * res) / res;
    vec4 color = texture2D(uTexture,vUv);
    color.rgba *= .5 + (uResolution) * .5;

    // gl_FragColor = vec4(1.0, .1, .1, 1.0);
    gl_FragColor = color;
}