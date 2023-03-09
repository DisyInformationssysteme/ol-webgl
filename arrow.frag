precision mediump float;
uniform float u_pixelRatio;
varying vec2 v_segmentStart;
varying vec2 v_segmentEnd;
varying float v_angleStart;
varying float v_angleEnd;
varying vec3 v_color;
varying float v_opacity;
varying float v_width;

float segmentDistanceField(vec2 point, vec2 start, vec2 end, float radius) {
  vec2 startToPoint = point - start;
  vec2 startToEnd = end - start;
  float ratio = clamp(
      dot(startToPoint, startToEnd) / dot(startToEnd, startToEnd), 0.0, 1.0);
  float dist = length(startToPoint - ratio * startToEnd);
  return 1.0 - smoothstep(radius - 1.0, radius, dist);
}

void main(void) {
  vec2 v_currentPoint = gl_FragCoord.xy / u_pixelRatio;
  gl_FragColor = vec4(v_color, 1.0) * v_opacity;
  gl_FragColor *= segmentDistanceField(v_currentPoint, v_segmentStart,
                                       v_segmentEnd, v_width);
}
