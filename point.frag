precision mediump float;
uniform float u_pointSize;
uniform float u_pixelRatio;
uniform float u_pointColor;
varying vec3 v_color;
varying float v_opacity;
varying vec2 v_position;

float distanceField(vec2 currentPoint, vec2 position) {
  vec2 dist = currentPoint - position;
  return 1.0 - smoothstep(u_pointSize - (u_pointSize * 0.5),
                          u_pointSize + (u_pointSize * 0.5), dot(dist, dist));
}

void main(void) {
  vec2 v_currentPoint = gl_FragCoord.xy / u_pixelRatio;
  vec3 color = vec3(fract(floor(u_pointColor / 256.0 / 256.0) / 256.0),
                 fract(floor(u_pointColor / 256.0) / 256.0), fract(u_pointColor / 256.0));
  gl_FragColor = vec4(color, 1.0) * v_opacity;
  gl_FragColor *= distanceField(v_currentPoint, v_position);
}
