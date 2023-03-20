precision mediump float;
uniform mat4 u_projectionMatrix;
uniform mat4 u_offsetScaleMatrix;
uniform float u_currentTimeMin;
uniform float u_currentTimeMax;
uniform vec2 u_sizePx;
uniform float u_pointSize;
attribute vec2 a_position;
attribute float a_index;
attribute float a_color;
attribute float a_opacity;
// WebGL does not support int/uint attributes...
attribute float a_time;
varying vec2 v_texCoord;
varying vec3 v_color;
varying float v_opacity;
varying vec2 v_position;

vec2 worldToPx(vec2 worldPos) {
  vec4 screenPos = u_projectionMatrix * vec4(worldPos, 0.0, 1.0);
  return (0.5 * screenPos.xy + 0.5) * u_sizePx;
}

void main(void) {
  mat4 offsetMatrix = u_offsetScaleMatrix;
  float offsetX =
      a_index == 0.0 || a_index == 3.0 ? -u_pointSize / 2.0 : u_pointSize / 2.0;
  float offsetY =
      a_index == 0.0 || a_index == 1.0 ? -u_pointSize / 2.0 : u_pointSize / 2.0;
  float visibilityOffset = a_time < u_currentTimeMin || a_time > u_currentTimeMax ? 0.0 : 1.0;
  offsetX *= visibilityOffset;
  offsetY *= visibilityOffset;
  vec4 offsets = offsetMatrix * vec4(offsetX, offsetY, 0.0, 0.0);
  gl_Position = u_projectionMatrix * vec4(a_position, 0.0, 1.0) + offsets;
  float u = a_index == 0.0 || a_index == 3.0 ? 0.0 : 1.0;
  float v = a_index == 0.0 || a_index == 1.0 ? 0.0 : 1.0;
  v_texCoord = vec2(u, v);
  v_color = vec3(fract(floor(a_color / 256.0 / 256.0) / 256.0),
                 fract(floor(a_color / 256.0) / 256.0), fract(a_color / 256.0));
  v_opacity = 1.0;
  v_position = worldToPx(a_position);
}
