precision mediump float;
varying vec3 v_color;
varying float v_opacity;

void main(void) { gl_FragColor = vec4(v_color, 1.0) * v_opacity; }
