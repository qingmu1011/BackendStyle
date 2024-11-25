import { Map } from 'ol'

import Feature from "ol/Feature";
import { Point } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {
    Text,
    Icon,
    Fill,
    Stroke,
    Style,
    Circle
} from "ol/style";
import { linear } from 'ol/easing';
import DragPan from 'ol/interaction/DragPan.js';

export default class MapPointControl {
    map: Map;
    layer: VectorLayer;
    constructor(map: Map) {
        this.map = map;
        // 禁用除了平移外的所有交互
        this.map.getInteractions().forEach(interaction => {
            // if (!(interaction instanceof DragPan)) {
                
            // }
            interaction.setActive(false);
        });
        this.init();
    }

    init() {
        this.layer = new VectorLayer({
            source: new VectorSource({
                features: []
            }),
            style: new Style({
                image: new Circle({
                    fill: new Fill({
                        color: '#fff',
                    }),
                    stroke: new Stroke({
                        color: '#37d5e8',
                        width: 5
                    }),
                    radius: 8,
                }),
            }),
            zIndex: 1001
        });
        this.map.addLayer(this.layer);
    }
    refresh(long: number, lat: number,) {
        if (this.layer && this.layer.getSource()) {
            this.clear();
            const feature = new Feature({
                geometry: new Point([long, lat]),
            })
            this.layer.getSource().addFeature(feature);
            this.fitToLayer()
        };
    }
    fitToLayer() {
        this.map.getView().fit(this.layer.getSource().getExtent(), {
            maxZoom: 12,
            duration: 200,
            easing: linear
        });
    }

    clear() {
        this.layer && this.layer.getSource().clear();
    }
    destory() {
        this.clear();
        this.map && this.map.removeLayer(this.layer);
    }
}