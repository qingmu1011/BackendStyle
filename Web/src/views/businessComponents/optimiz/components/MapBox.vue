<template>
  <div v-show="tdtTk">
    <div class="w-full h-400px" id="mapDiv"></div>
    <!-- <div class="text-center mt-10px opacity-30" v-if="!tdtTk">
      地图未加载,请设置天地图密钥
    </div> -->
  </div>
</template>
<script lang="ts" setup>
import {
  ref,
  defineOptions,
  defineProps,
  onMounted,
  watchEffect,
  toRefs,
  getCurrentInstance,
} from "vue";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import MapPointControl from "./MapPointControl.ts";

defineOptions({
  name: "MapBox",
});

const props = defineProps({
  longitude: {
    type: Number || undefined,
  },
  latitude: {
    type: Number || undefined,
  },
});

const { longitude, latitude } = toRefs(props);
const map = ref<Map>();
let layer = ref<MapPointControl>();
const config = getCurrentInstance()?.appContext.config.globalProperties.$config;
/** 天地图秘钥 */
const tdtTk = ref(config.VITE_TDT_TK);

watchEffect(() => {
  if (layer.value) {
    if (longitude.value && latitude.value) {
      layer.value.refresh(
        parseFloat(longitude.value),
        parseFloat(latitude.value)
      );
    } else {
      layer.value.clear();
    }
  }
});

onMounted(() => {
  if (tdtTk.value) {
    initMap();
  }
});

function initMap() {
  map.value = new Map({
    target: "mapDiv",
    view: new View({
      projection: "EPSG:4326",
      center: [104.02, 30.67],
      zoom: 10,
      maxZoom: 18,
      minZoom: 1,
    }),
    layers: [],
  }) as Map;
  createTdtImg(map.value);
  createTdtCva(map.value);
  layer.value = new MapPointControl(map.value);
}

/**
 * @des 创建天地图影像图层
 * @param {*} map Map实例
 */
const createTdtImg = (_map: Map) => {
  if (!_map) {
    return;
  }
  const _layer = new TileLayer({
    source: new XYZ({
      urls: createUrls(
        `http://t$idx.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=$tdtTk`
      ),
    }),
    zIndex: 0,
    properties: { title: "天地图影像" },
  });
  _map.addLayer(_layer);
};

/**
 * @des 创建天地图注记图层
 * @param {*} map Map实例
 */
const createTdtCva = (_map: Map) => {
  if (!_map) {
    return;
  }
  const _layer = new TileLayer({
    source: new XYZ({
      urls: createUrls(
        `http://t$idx.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=$tdtTk`
      ),
    }),
    zIndex: 99,
    properties: { title: "天地图注记" },
  });
  _map.addLayer(_layer);
};

function createUrls(url: string) {
  const idxs = [0, 1, 2, 3, 4, 5, 6];
  return idxs.map((c: string) =>
    url.replace("$idx", c).replace("$tdtTk", tdtTk.value)
  );
}
</script>
