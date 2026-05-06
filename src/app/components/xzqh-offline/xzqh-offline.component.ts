import { Component, OnInit } from '@angular/core';
import View, { ViewOptions } from 'ol/View';
import { OlMapService } from 'src/app/service/ol-map-service';
import { Feature, Map } from 'ol';
import gx from '../../../assets/gx.json';
import gxbj from '../../../assets/gxbj.json';
import sc from '../../../assets/sc.json';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import MultiPolygon from 'ol/geom/MultiPolygon';
import { getVectorContext } from 'ol/render';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import GeoJSON from 'ol/format/GeoJSON';
import Stroke from 'ol/style/Stroke';
import LineString from 'ol/geom/LineString';
import { fromExtent } from 'ol/geom/Polygon';

@Component({
  selector: 'app-xzqh-offline',
  templateUrl: './xzqh-offline.component.html',
  styleUrls: ['./xzqh-offline.component.scss']
})
export class XzqhOfflineComponent implements OnInit {

  constructor() { }
  map: Map;
  mapInstance: OlMapService = null;

  ngOnInit(): void {
  }
  ngAfterViewInit() {
    this.initMap();
  }
  initMap() {
    // 创建一个地图
    const map = new Map({
      controls: [],
      target: 'map-container',
      layers: [
        // 这里创建TileLayer图层
        new TileLayer({
          // 加载离线的地图瓦片资源
          source: new XYZ({
            tileUrlFunction(tileCoord) {
              const z = tileCoord[0];
              const x = tileCoord[1];
              const y = tileCoord[2];
              // 这里就是部署在nginx服务的请求资源地址
              return `http://127.0.0.1:4500/offline-map/light/${z}/${x}/${y}.png`;
            },
            // 设置本地离线瓦片所在路径
            // tileLoadFunction(imageTile, src) {
            //   // 使用滤镜 将白色修改为深色
            //   const img = new Image();
            //   // 设置图片不从缓存取，从缓存取可能会出现跨域，导致加载失败
            //   img.setAttribute('crossOrigin', 'anonymous');
            //   // eslint-disable-next-line func-names
            //   img.onload = function () {
            //     const canvas = document.createElement('canvas');
            //     const w = img.width;
            //     const h = img.height;
            //     canvas.width = w;
            //     canvas.height = h;
            //     const context = canvas.getContext('2d');
            //     context.filter = 'grayscale(98%) sepia(51%) invert(100%) saturate(350%)';
            //     context.drawImage(img, 0, 0, w, h, 0, 0, w, h);
            //     // @ts-ignore
            //     imageTile.getImage().src = canvas.toDataURL('image/png');
            //   };
            //   img.src = src;
            //   img.onerror = () => {
            //     // @ts-ignore
            //     imageTile.getImage().src = '';
            //   };
            // },
          }),
        }),
      ],
      view: new View({
        center: [108.316492, 22.818136],
        zoom: 7,
        projection: 'EPSG:4326'
      }),
    });
    // 创建FeatureLayer图层
    // const featureAreaLayer = FeatureLayer.getInstance().getLayer();
    // const featureAreaLayer = new TileLayer({
    //   source: new XYZ({
    //     url: 'http://114.215.146.210:25003/v3/tile?x={x}&y={y}&z={z}',
    //     crossOrigin: 'anonymous'
    //   })
    // });
    const featureAreaLayer = new VectorLayer({
      source: new VectorSource(),
      // map: this.map,
      // style: highlightStyle
    });
    // 用边界数据绘制反遮罩 start
    const dataForMart = new GeoJSON().readFeatures(gxbj.features[0])[0];
    // @ts-ignore
    const coords = dataForMart.getGeometry().getCoordinates();
    const polygonRing = fromExtent([100, 0, 150, 90]);
    coords.forEach((coord) => {
      const linearRing = new LineString(coord);
      // @ts-ignore
      polygonRing.appendLinearRing(linearRing);
    });
    // 创建反遮罩 Feature
    const maxFeature = new Feature({
      geometry: polygonRing,
    });
    maxFeature.setId(12);
    maxFeature.setStyle(
      new Style({
        stroke: new Stroke({
          color: '#15bdd8',
          width: 2,
        }),
        fill: new Fill({
          color: '#00003c',
        }),
      }),
    );
    // 将此Feature 添加到featureAreaLayer 图层中
    featureAreaLayer.getSource().addFeature(maxFeature);
    // 反遮罩 end

    // 画行政区域 start (不需要反遮罩，只想绘制行政边界的需求)
    // geoMax2.features.forEach((item) => {
    //   const areaFeature = new Feature({
    //     geometry: new Polygon(item.geometry.coordinates),
    //   });
    //   areaFeature.setStyle(
    //     new Style({
    //       stroke: new Stroke({
    //         width: 2,
    //         color: 'rgba(0,214,249,1)',
    //       }),
    //       text: new Text({
    //         font: '18px bold',
    //         text: item.properties.FNAME,
    //         textAlign: 'center',
    //         offsetY: 0,
    //         fill: new Fill({
    //           color: 'rgba(208,245,255)',
    //         }),
    //         stroke: new Stroke({
    //           width: 2,
    //           color: 'rgba(92,127,161)',
    //         }),
    //       }),
    //     }),
    //   );
    //   featureAreaLayer.getSource().addFeature(areaFeature);
    // });
    // 画行政区域 start

    // 将此图层添加到地图中
    map.addLayer(featureAreaLayer);

  }

}
