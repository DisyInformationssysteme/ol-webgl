precision mediump float;
uniform mat4 u_projectionMatrix;
uniform mat4 u_offsetScaleMatrix;
uniform float u_pointSize;
attribute vec2 a_position;
attribute float a_index;
attribute float a_color;
attribute float a_opacity;
varying vec2 v_texCoord;
varying vec3 v_color;
varying float v_opacity;

void main(void) {
  mat4 offsetMatrix = u_offsetScaleMatrix;
  float offsetX = a_index == 0.0 || a_index == 3.0 ? -u_pointSize / 2.0 : u_pointSize / 2.0;
  float offsetY = a_index == 0.0 || a_index == 1.0 ? -u_pointSize / 2.0 : u_pointSize / 2.0;
  vec4 offsets = offsetMatrix * vec4(offsetX, offsetY, 0.0, 0.0);
  gl_Position = u_projectionMatrix * vec4(a_position, 0.0, 1.0) + offsets;
  float u = a_index == 0.0 || a_index == 3.0 ? 0.0 : 1.0;
  float v = a_index == 0.0 || a_index == 1.0 ? 0.0 : 1.0;
  v_texCoord = vec2(u, v);
  v_color = vec3(fract(floor(a_color / 256.0 / 256.0) / 256.0),
                 fract(floor(a_color / 256.0) / 256.0), fract(a_color / 256.0));
  v_opacity = a_opacity;
}
