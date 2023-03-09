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

class MyLayer extends Layer {
    createRenderer(): WebGLVectorLayerRenderer {
        return new WebGLVectorLayerRenderer(this, { });
    }
}

const map = new Map({
    layers: [
        new TileLayer({
            source: new OSM(),
        }),
        new MyLayer({
            source: new VectorSource({
                features: createFeatures(),
            }),
        }),
    ],
    target: document.getElementById('map')!,
    view: new View({
        center: [1588138.6115797842, 5773917.459455677],
        zoom: 15.355,
    }),
});

globalThis.map = map;

map.render();

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
            });
            features.push(arrow);
        }
        features.push(point);
    }
    return features;
}
