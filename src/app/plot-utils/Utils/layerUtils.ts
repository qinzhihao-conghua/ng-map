/**
 * Created by FDD on 2017/5/1.
 * @desc 矢量图层操作工具类
 */
import {
  Style as $Style,
  Stroke as $Stroke,
  Fill as $Fill,
  Circle as $Circle
} from 'ol/style'

import {
  Group as $Group,
  Vector as $VectorLayer
} from 'ol/layer'

import { Vector as $VectorSource } from 'ol/source'
import { Map } from 'ol';
import BaseLayer from 'ol/layer/Base';

/** 创建矢量图层参数接口 */
interface CreateVectorLayerParams {
  create?: boolean;
  selectable?: boolean;
}

/**
 * 根据图层名称获取图层
 * @param map 地图对象
 * @param layerName 图层名称
 * @returns 矢量图层对象
 */
const getLayerByLayerName = function (map: Map, layerName: string): $VectorLayer<any> | undefined {
  try {
    let targetLayer: $VectorLayer<any> | undefined = undefined;
    if (map) {
      const layers = map.getLayers().getArray();
      targetLayer = getLayerInternal(layers, 'layerName', layerName);
    }
    return targetLayer;
  } catch (e) {
    console.log(e);
    return undefined;
  }
};

/**
 * 递归查找图层
 * @param layers 图层数组
 * @param key 查找的键
 * @param value 查找的值
 * @returns 找到的图层
 */
const getLayerInternal = function (layers: BaseLayer[], key: string, value: string): $VectorLayer<any> | undefined {
  let _target: $VectorLayer<any> | undefined = undefined;
  if (layers.length > 0) {
    layers.every(layer => {
      if (layer instanceof $Group) {
        const layers = layer.getLayers().getArray();
        _target = getLayerInternal(layers, key, value);
        if (_target) {
          return false;
        } else {
          return true;
        }
      } else if (layer.get(key) === value) {
        _target = layer as $VectorLayer<any>;
        return false;
      } else {
        return true;
      }
    });
  }
  return _target;
};

/**
 * 创建矢量图层
 * @param map 地图对象
 * @param layerName 图层名称
 * @param params 创建参数
 * @returns 创建的矢量图层
 */
const createVectorLayer = function (map: Map, layerName: string, params: CreateVectorLayerParams = {}): $VectorLayer<any> | undefined {
  try {
    if (map) {
      let vectorLayer: $VectorLayer<any> | undefined = getLayerByLayerName(map, layerName);
      if (!(vectorLayer instanceof $VectorLayer)) {
        vectorLayer = undefined;
      }
      if (!vectorLayer) {
        if (params && params.create) {
          vectorLayer = new $VectorLayer({
            source: new $VectorSource({
              wrapX: false
            }),
            style: new $Style({
              fill: new $Fill({
                color: 'rgba(67, 110, 238, 0.4)'
              }),
              stroke: new $Stroke({
                color: '#4781d9',
                width: 2
              }),
              image: new $Circle({
                radius: 7,
                fill: new $Fill({
                  color: '#ffcc33'
                })
              })
            })
          });
        }
      }
      if (map && vectorLayer) {
        if (params && params.hasOwnProperty('selectable')) {
          vectorLayer.set('selectable', params.selectable);
        }
        const _vectorLayer = getLayerByLayerName(map, layerName);
        if (!_vectorLayer || !(_vectorLayer instanceof $VectorLayer)) {
          map.addLayer(vectorLayer);
        }
      }
      return vectorLayer;
    }
  } catch (e) {
    console.log(e);
    return undefined;
  }
  return undefined;
};

export {
  createVectorLayer,
  getLayerByLayerName
};
