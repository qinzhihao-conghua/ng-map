import { Component, OnInit } from '@angular/core';
import View, { ViewOptions } from 'ol/View';
import { OlMapService } from '../../service/ol-map-service';
import { Map } from 'ol';
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

@Component({
  selector: 'app-xzqh',
  templateUrl: './xzqh.component.html',
  styleUrls: ['./xzqh.component.scss']
})
export class XzqhComponent implements OnInit {

  constructor() { }
  map: Map;
  mapInstance: OlMapService = null;

  ngOnInit(): void {
  }
  ngAfterViewInit() {
    this.initMap();
  }
  initMap() {
    // const viewOptions: ViewOptions = {
    //   // center: [121.471325, 31.231929],
    //   center: [108.316492, 22.818136],
    //   zoom: 12,
    //   maxZoom: 20,
    //   minZoom: 1,
    //   projection: 'EPSG:4326'
    // };
    // this.mapInstance = new OlMapService();
    // this.map = this.mapInstance.initMap('map-container', viewOptions);
    const dtc = new TileLayer({
      source: new XYZ({
        url: 'http://114.215.146.210:25003/v3/tile?x={x}&y={y}&z={z}',
        crossOrigin: 'anonymous'
      })
    });
    const zzc = new TileLayer({
      source: new XYZ({
        url: 'http://114.215.146.210:25003/v3/tile?x={x}&y={y}&z={z}',
        crossOrigin: 'anonymous'
      })
    });

    this.drawHandle(zzc);
    // this.renderHandle(zzc);

    this.map = new Map({
      target: 'map-container',
      layers: [
        // dtc, 
        zzc
      ],
      view: new View({
        center: [108.316492, 22.818136],
        zoom: 7,
        projection: 'EPSG:4326'
      })
    });

  }

  /**
   * 添加遮罩
   * @param ctx 地图渲染层的canvas渲染对象
   */
  addMask(ctx: CanvasRenderingContext2D) {
    let canvas = ctx.canvas;
    let onePageCanvas = document.createElement('canvas');
    onePageCanvas.setAttribute('width', String(canvas.width));
    onePageCanvas.setAttribute('height', String(canvas.height));
    // 遮罩层canvas
    let maskCanvasCtx = onePageCanvas.getContext('2d');
    maskCanvasCtx.rect(0, 0, canvas.width, canvas.height);
    maskCanvasCtx.fillStyle = "rgba(0,0,0,0.8)";
    // maskCanvasctx.fillStyle = "rgba(255,255,255,0.8)";
    maskCanvasCtx.fill();
    maskCanvasCtx.globalCompositeOperation = 'destination-out';
    maskCanvasCtx.beginPath();
    const tuxingshuliang = gxbj['features'][0]['geometry']['coordinates'].length;
    for (let j = 0; j < tuxingshuliang; j++) {
      let coords = gxbj['features'][0]['geometry']['coordinates'][j][0];
      for (let i = 0; i < coords.length; i++) {
        // 获取屏幕坐标
        let screenCoord = this.map.getPixelFromCoordinate(coords[i]);
        let x = screenCoord[0];
        let y = screenCoord[1];
        if (i === 0) {
          maskCanvasCtx.moveTo(x, y);
        } else {
          maskCanvasCtx.lineTo(x, y);
          maskCanvasCtx.lineTo(x, y);
        }
      }
    }
    maskCanvasCtx.closePath();
    maskCanvasCtx.fill();
    // createPattern() 方法用于创建图案，在指定的方向内重复指定的元素。元素可以是图片、视频，或者其他元素，方向可以是repeat、repeat-x、repeat-y和no-repeat
    let patten = ctx.createPattern(onePageCanvas, "no-repeat");
    ctx.fillStyle = patten;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  /**
   * canvas绘制的方式
   * @param layer 
   */
  drawHandle(layer) {
    layer.on('postrender', (event) => {
      const ctx = event.context;
      this.addMask(ctx);
    });
  }
  /**
   * 渲染方式
   * @param layer 
   */
  renderHandle(layer) {
    const geometry = new MultiPolygon(gxbj.features[0].geometry.coordinates);
    layer.on('prerender', event => {
      const ctx = event.context as CanvasRenderingContext2D;
      const vecCtx = getVectorContext(event);
      ctx.save();
      vecCtx.setStyle(new Style({
        fill: new Fill({
          // 图层预渲染阶段显示出了裁剪图形的颜色，最好设置为透明，不然会闪一下
          color: [255, 0, 0, 0]
        })
      }));
      vecCtx.drawGeometry(geometry);
      // vecCtx.drawFeature(gx.features[0],new Style({
      //   fill: new Fill({
      //     // 图层预渲染阶段显示出了裁剪图形的颜色，最好设置为透明，不然会闪一下
      //     color: [255, 0, 0, 0.8]
      //   })
      // }));
      ctx.clip();
    })
    layer.on('postrender', event => {
      const ctx = event.context as CanvasRenderingContext2D;
      ctx.restore();
    })
  }
}
