precision mediump float;
uniform mat4 u_projectionMatrix;
uniform vec2 u_sizePx;
uniform float u_currentTimeMin;
uniform float u_currentTimeMax;
attribute vec2 a_segmentStart;
attribute vec2 a_segmentEnd;
attribute float a_parameters;
attribute float a_color;
attribute float a_opacity;
attribute float a_width;
// WebGL does not support int/uint attributes...
attribute float a_time;
varying vec2 v_segmentStart;
varying vec2 v_segmentEnd;
varying float v_angleStart;
varying float v_angleEnd;
varying vec3 v_color;
varying float v_opacity;
varying float v_width;

vec2 worldToPx(vec2 worldPos) {
  vec4 screenPos = u_projectionMatrix * vec4(worldPos, 0.0, 1.0);
  return (0.5 * screenPos.xy + 0.5) * u_sizePx;
}

vec4 pxToScreen(vec2 pxPos) {
  vec2 screenPos = pxPos * 4.0 / u_sizePx;
  return vec4(screenPos.xy, 0.0, 0.0);
}

vec2 getOffsetDirection(vec2 normalPx, vec2 tangentPx, float joinAngle) {
  if (cos(joinAngle) > 0.93)
    return normalPx - tangentPx;
  float halfAngle = joinAngle / 2.0;
  vec2 angleBisectorNormal =
      vec2(sin(halfAngle) * normalPx.x + cos(halfAngle) * normalPx.y,
           -cos(halfAngle) * normalPx.x + sin(halfAngle) * normalPx.y);
  float length = 1.0 / sin(halfAngle);
  return angleBisectorNormal * length;
}

void main(void) {
  float anglePrecision = 1500.0;
  float paramShift = 10000.0;
  v_angleStart = fract(a_parameters / paramShift) * paramShift / anglePrecision;
  v_angleEnd = fract(floor(a_parameters / paramShift + 0.5) / paramShift) *
               paramShift / anglePrecision;
  float vertexNumber = floor(a_parameters / paramShift / paramShift + 0.0001);
  vec2 tangentPx = worldToPx(a_segmentEnd) - worldToPx(a_segmentStart);
  tangentPx = normalize(tangentPx);
  vec2 normalPx = vec2(-tangentPx.y, tangentPx.x);
  float normalDir =
      vertexNumber < 0.5 || (vertexNumber > 1.5 && vertexNumber < 2.5) ? 1.0
                                                                       : -1.0;
  float tangentDir = vertexNumber < 1.5 ? 1.0 : -1.0;
  float angle = vertexNumber < 1.5 ? v_angleStart : v_angleEnd;
  vec2 offsetPx =
      getOffsetDirection(normalPx * normalDir, tangentDir * tangentPx, angle) *
      a_width * 0.5;
  vec2 visibilityOffset = a_time < u_currentTimeMin || a_time > u_currentTimeMax ? vec2(0.0, 0.0) : vec2(1.0, 1.0);
  offsetPx *= visibilityOffset;
  vec2 position = vertexNumber < 1.5 ? a_segmentStart : a_segmentEnd;
  gl_Position =
      u_projectionMatrix * vec4(position, 0.0, 1.0) + pxToScreen(offsetPx);
  v_segmentStart = worldToPx(a_segmentStart);
  v_segmentEnd = worldToPx(a_segmentEnd);
  v_color = vec3(fract(floor(a_color / 256.0 / 256.0) / 256.0),
                 fract(floor(a_color / 256.0) / 256.0), fract(a_color / 256.0));
  v_opacity = 1.0;
  v_width = a_width;
}
