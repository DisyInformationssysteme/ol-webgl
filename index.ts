import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import {data} from './30k-points-with-time.js';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import VectorSource from 'ol/source/Vector';
import WebGLVectorLayerRenderer from 'ol/renderer/webgl/VectorLayer';
import Layer from 'ol/layer/Layer';
import PointVert from './point.vert';
import PointFrag from './point.frag';
import ArrowVert from './arrow.vert';
import ArrowFrag from './arrow.frag';
import {packColor} from 'ol/renderer/webgl/shaders';
import {asArray} from 'ol/color.js';

let pointSize = 5;

/*
 * Points use options.point.vertex/fragmentShader
 * LineStrings use options.stroke.vertex/fragmentShader
 */
class MyLayer extends Layer {
    createRenderer(): WebGLVectorLayerRenderer {
        return new WebGLVectorLayerRenderer(
            this,
            {
                point: {
                    vertexShader: PointVert,
                    fragmentShader: PointFrag,
                    attributes: {
                        opacity: function(feature: Feature) {
                            return feature.get('opacity');
                        },
                        color: function() {
                            return packColor(asArray('#05f234'));
                        },
                    },
                },
                stroke: {
                    vertexShader: ArrowVert,
                    fragmentShader: ArrowFrag,
                    attributes: {
                        opacity: function(feature: Feature) {
                            return feature.get('opacity');
                        },
                        color: function() {
                            return packColor(asArray('#ea05f2'));
                        },
                    },
                },
                uniforms: {
                    'u_pointSize': function() { return pointSize; },
                }
            },
        );
    }
}

const features = createFeatures();
const layer = new MyLayer({source: new VectorSource({features})});
const map = new Map({
    layers: [
        new TileLayer({
            source: new OSM(),
        }),
        layer,
    ],
    target: document.getElementById('map')!,
    view: new View({
        // view a nice part of the timeline
        center: [1588138.6115797842, 5773917.459455677],
        zoom: 15.355,
    }),
});

globalThis.map = map;

map.render();
createControls();

function createFeatures(): Feature[] {
    const numsPerFeature = 3;
    const features = [];
    for (let i = 0; i < data.length; i += numsPerFeature) {
        const point = new Feature({
            geometry: new Point([data[i], data[i+1]]),
            time: data[i+2],
        });
        if (i > 0) {
            const lastPoint: Feature<Point> = features[features.length - 1] as Feature<Point>;
            const arrow: Feature = new Feature({
                geometry: new LineString([
                    lastPoint.getGeometry()!.getCoordinates(),
                    point.getGeometry()!.getCoordinates()
                ]),
                time: data[i+2],
                opacity: 0, // start invisible
            });
            features.push(arrow);
        }
        features.push(point);
    }
    return features;
}

function createControls() {
    const container = document.getElementById('controls')!;
    const earliest = data[2];
    const latest = data[data.length - 1];
    container.innerHTML = `
        <label for="time">Time</label>
        <input id="time" type="range" min="${earliest}" max="${latest}"></input>
        <label for="pointSize">Point Size</label>
        <input id="pointSize" type="range" min="5" max="50" value="5"></input>
    `;
    const time = document.getElementById('time')!;
    time.addEventListener('input', (e) => onTime(parseInt((e.target as HTMLInputElement).value)));
    const pointSize = document.getElementById('pointSize')!;
    pointSize.addEventListener('input', (e) => onPointSize(parseInt((e.target as HTMLInputElement).value)));
}

function onPointSize(size: number) {
    pointSize = size;
    map.render();
}

function onTime(time: number) {
    // TODO save last visible index, determine feature that changed visibility, only adapt those
    const idx = searchClosest(features, time);
    for (let i = 0; i < features.length; i++) {
        features[i].set('opacity', i <= idx ? 1 : 0);
    }
}

// index of latest visible el by time
function searchClosest (features: Feature[], time: number) {
  let low = 0;
  let mid = 0;
  let result = -1;
  let high = features.length - 1;
  while (low <= high) {
    mid = Math.floor((low + high) / 2);
    const featureTime = features[mid].get('time');
    if (featureTime === time) {
      return mid;
    }
    if (featureTime < time) {
      result = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return result;
}
