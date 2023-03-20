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

enum TimeBounds {
    Min,
    Max,
}

let _pointSize = 5;
let _time = {
    [TimeBounds.Min]: 0,
    [TimeBounds.Max]: 0,
};
let _arrowSize = 5;
let _pointColor = packColor(asArray('#05f234'));
let _arrowHeadColor = packColor(asArray('#ffffff'));
let _arrowStemColor = packColor(asArray('#0008fc'));


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
                        time: function(feature: Feature) {
                            return feature.get('time');
                        },
                    },
                },
                stroke: {
                    vertexShader: ArrowVert,
                    fragmentShader: ArrowFrag,
                    attributes: {
                        time: function(feature: Feature) {
                            return feature.get('time');
                        },
                        isArrow: function(feature: Feature) {
                            // WebGL does not do boolean attributes, we use a float instead
                            return feature.get('isArrow') ? 1.0 : 0.0;
                        }
                    },
                },
                uniforms: {
                    'u_pointSize': function() { return _pointSize; },
                    'u_pointColor': function() { return _pointColor; },
                    'u_currentTimeMax': function() { return _time[TimeBounds.Max]; },
                    'u_currentTimeMin': function() { return _time[TimeBounds.Min]; },
                    'u_arrowSize': function() { return _arrowSize; },
                    'u_arrowHeadColor': function() { return _arrowHeadColor; },
                    'u_arrowStemColor': function() { return _arrowStemColor; },
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
                isArrow: !!(i % 2),
            });
            features.push(arrow);
        }
        features.push(point);
    }
    return features;
}

function createControls() {
    const container = document.getElementById('controls')!;
    _time[TimeBounds.Min] = data[2];
    _time[TimeBounds.Max] = data[data.length-1];
    const earliest = _time[TimeBounds.Min];
    const latest = _time[TimeBounds.Max];
    container.innerHTML = `
        <label for="timeMin">Time Min</label>
        <input id="timeMin" type="range" min="${earliest}" max="${latest}" value="${earliest}"></input>
        <label for="timeMax">Time Max</label>
        <input id="timeMax" type="range" min="${earliest}" max="${latest}" value="${latest}"></input>
        <label for="pointSize">Point Size</label>
        <input id="pointSize" type="range" min="5" max="50" value="5"></input>
    `;
    const timeMin = document.getElementById('timeMin')!;
    timeMin.addEventListener('input', (e) => onTime(parseInt((e.target as HTMLInputElement).value), TimeBounds.Min));
    const timeMax = document.getElementById('timeMax')!;
    timeMax.addEventListener('input', (e) => onTime(parseInt((e.target as HTMLInputElement).value), TimeBounds.Max));
    const pointSize = document.getElementById('pointSize')!;
    pointSize.addEventListener('input', (e) => onPointSize(parseInt((e.target as HTMLInputElement).value)));
}

function onPointSize(size: number) {
    _pointSize = size;
    map.render();
}

function onTime(time: number, minMax: TimeBounds) {
    _time[minMax] = time;
    map.render();
}

