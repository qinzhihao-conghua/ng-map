import { Injectable } from '@angular/core';
import { Map, MapBrowserEvent, Overlay, View } from 'ol';
import { defaults, MousePosition } from 'ol/control';
import { Coordinate } from 'ol/coordinate';
import { altKeyOnly, click, pointerMove } from 'ol/events/condition';
import Draw, { createBox, createRegularPolygon } from 'ol/interaction/Draw';
import Modify, { ModifyEvent } from 'ol/interaction/Modify';
import Select, { SelectEvent } from 'ol/interaction/Select';
import Snap from 'ol/interaction/Snap';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import Feature from 'ol/Feature';
import LineString from 'ol/geom/LineString';
import Polygon from 'ol/geom/Polygon';
import Point from 'ol/geom/Point';
import { getVectorContext } from 'ol/render';
import { easeOut } from 'ol/easing';
import { Circle as CircleGemo, Geometry } from 'ol/geom';
import { unByKey } from 'ol/Observable';
import { GeoJSON } from 'ol/format';
import { ProjectionLike, transform } from 'ol/proj';
import { ViewOptions } from 'ol/View';
import { Observable, Subject } from 'rxjs';
import { Icon, Text } from 'ol/style';
// import { Observable } from './observable';
import ImageLayer from 'ol/layer/Image';
import XYZ from 'ol/source/XYZ';
import TileWMS from 'ol/source/TileWMS';
import TileArcGISRest from 'ol/source/TileArcGISRest';
import WMTS from 'ol/source/WMTS';
import TileImage from 'ol/source/TileImage';

@Injectable()
export class MapService {

  constructor() { }

  private map: Map;
  /**
   * 地图底图，不同的厂商可能使用的地图图源不同，根据情况选择不同的类
   * new XYZ({url:'',projection:'EPSG:4326'})
   * new TileLayer({url:'',projection:'EPSG:4326'})
   * new TileWMS({url:'',projection:'EPSG:4326'})
   * new TileArcGISRest({url:'',projection:'EPSG:4326'})
   * new WMTS({url:'',projection:'EPSG:4326'})
   * new TileImage({url:'',projection:'EPSG:4326'})
   * new TileSuperMapRest({url:'',projection:'EPSG:4326'})
   */
  tileLayer = new TileLayer({
    source: new OSM({
      attributions: 'xxxx股份有限公司'
    })
  });
  /**
   * 矢量图层源，相关绘制操作在这个图层上进行
   */
  source = new VectorSource({ wrapX: false });
  /**
   * 矢量图层，基本的图形样式，默认点的样式是普通的小圆点
   * 如果要展示图标image的值改成new Icon({})
   */
  vector = new VectorLayer({
    source: this.source,
    style: new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.5)'
      }),
      stroke: new Stroke({
        color: '#ff0000',
        width: 2
      }),
      image: new CircleStyle({ // 作用于点标注
        radius: 7,
        fill: new Fill({
          color: '#03a9f4',
        })
      }),
      // image: new Icon({
      //   src: 'assets/location.jpg',
      //   scale: .08// 图片过大，缩小到合适的大小
      // })
      // text: new Text({
      //   text: '测试',
      //   scale: 2
      // })
    })
  });

  highlight: Select;
  deleteEventKey: any;
  layerForDelete: Select;
  layerForPopup: Select;
  // 修改
  modify = new Modify({ source: this.source });
  // 绘制对象
  draw: Draw;
  // 鼠标捕捉，用户修改
  snap: Snap;
  // 绘制类型
  typeDraw = 'None';
  // 水纹动画keys
  animateKeys = [];
  clickKey = [];

  /**
   * 初始化地图
   * @param targetId 地图容器id
   * @param ViewOptions 视图配至项，必须有坐标中心
   * @returns 返回初始化的地图，可用于对地图添加自定义
   * @description viewOption的内容参数参考
   * ViewOptions:{
   *     center: mapCenter,
   *     zoom: 12,
   *     maxZoom: 20,
   *     minZoom: 6,
   *     projection: 'EPSG:4326'
   * }
   */
  initMap(targetId: string, viewOption: ViewOptions): Map {
    this.map = new Map({
      target: targetId,
      controls: defaults().extend([
        new MousePosition({ projection: 'EPSG:4326' })
      ]),
      layers: [this.tileLayer, this.vector],
      view: new View(viewOption)
    });
    return this.map;
  }

  /**
   * 生成图层Layer
   * @param layerType 图层类型
   * @param sourceType 图源类型
   * @param sourceUrl 图源服务url
   * @returns Layer
   */
  private createMapLayer(layerType: string, sourceType: string, sourceUrl: string) {
    let layer = null;
    const source = this.createTileSource(sourceType, sourceUrl);
    switch (layerType) {
      case 'Image':
        layer = new ImageLayer({ source });
        break;
      case 'Tile':
        layer = new TileLayer({ source: source });
        break;
      default:
        console.error("[OpenlayersMap]:type of layer is undefined!");
    }
    return layer;
  }
  /**
   * 根据不同的图源类型构建对应的Layer source
   * @param sourceType 图源类型
   * @param sourceUrl 图源服务url
   * @returns 返回any防止ts报错
   */
  private createTileSource(sourceType: string, sourceUrl: string) {
    var source_options: any = { url: sourceUrl };
    var source: any = null;
    if (sourceType === 'XYZ') {
      source = new XYZ(source_options);
    } else if (sourceType === 'TileWMS') {
      source = new TileWMS(source_options);
    } else if (sourceType === 'TileArcGISRest') {
      source = new TileArcGISRest(source_options);
    } else if (sourceType === 'WMTS') {
      source = new WMTS(source_options);
    } else if (sourceType === 'TileImage') {
      source = new TileImage(source_options);
    } else if (sourceType === 'OSM') {
      source = new OSM();
    } else if (sourceType === 'TileSuperMapRest') {
      // TODO: 超图部分暂时先注释了，目前不支持echarts5
      // source = new TileSuperMapRest(source_options);
    } else {
      console.error('unknow map source type!');
    }
    return source;
  }

  /**
   * 点击地图获取坐标
   * @returns 坐标，数组类型
   */
  clickEvent(): Observable<MapBrowserEvent> {
    const subject = new Subject<MapBrowserEvent>();
    const key = this.map.on('singleclick', (event) => {
      subject.next(event);
    });
    this.clickKey.push(key);
    return subject;
  }
  /**
   * 关闭点击事件
   */
  closeClickEvent() {
    unByKey(this.clickKey);
  }

  /**
   * 添加交互图层，参考：
   * https://openlayers.org/en/latest/examples/draw-and-modify-features.html;
   * https://openlayers.org/en/latest/examples/draw-shapes.html
   * @param type 绘制图形类型:
   * None:无;Point:点;LineString:线;
   * Polygon:面;Circle:圆;Square:正方形;Box:长方形
   */
  addInteractions(type: any): Observable<string> {
    if (type !== 'None') {
      this.clearInteraction();
      const subject = new Subject<string>();
      let drawType = type;
      let geometryFunction;
      let style = null;
      if (type === 'Square') {
        drawType = 'Circle';
        geometryFunction = createRegularPolygon(4);
      } else if (type === 'Box') {
        drawType = 'Circle';
        geometryFunction = createBox();
      } else if (type === 'Point') {
        style = new Style({
          image: new Icon({
            src: 'assets/location.png', // 
            opacity: 0.8,
            scale: 0.2
          })
        })
      }
      this.draw = new Draw({
        source: this.source,
        type: drawType,
        geometryFunction,
      });
      this.map.addInteraction(this.draw);
      this.snap = new Snap({ source: this.source });
      this.modify = new Modify({ source: this.source });
      this.draw.on('drawend', (e) => {
        if (type === 'Point') {
          e.feature.setStyle(style);
        }
        if (!e.feature.getId()) {
          e.feature.setId(Math.random());
        }
        const geoJSON = new GeoJSON().writeFeature(e.feature);
        // 绘制结束后关闭交互，不手动关闭将会一直可以添加绘制
        // this.clearInteraction();
        subject.next(geoJSON);
      });
      return subject;
    }
  }

  /**
   * 清除交互
   */
  clearInteraction() {
    // 清除编辑样式
    this.map.removeInteraction(this.draw);
    this.map.removeInteraction(this.modify);
    // 清除吸附效果
    this.map.removeInteraction(this.snap);
    // 清除绘制的图层
    this.map.removeInteraction(this.highlight);
    this.map.removeInteraction(this.layerForDelete);
    unByKey(this.deleteEventKey);
  }

  //#region 原来的鼠标事件
  /**
   * 选中图层，失去选中焦点也会触发
   * @param clickType 操作类型
   * @param callback 回调方法
   */
  // changeInteraction(clickType: string, callback?: (e: SelectEvent) => void) {
  //   this.clearInteraction();
  //   let select: Select;
  //   if (clickType === 'singleclick') {
  //     select = new Select();
  //   } else if (clickType === 'click') {
  //     select = new Select({ condition: click });
  //   } else if (clickType === 'pointermove') {
  //     select = new Select({ condition: pointerMove });
  //   } else if (clickType === 'altclick') {
  //     select = new Select({
  //       condition: (mapBrowserEvent) => {
  //         return click(mapBrowserEvent) && altKeyOnly(mapBrowserEvent);
  //       },
  //     });
  //   } else {
  //     select = null;
  //   }
  //   if (select !== null) {
  //     this.map.addInteraction(select);
  //     select.on('select', (e: SelectEvent) => {
  //       // tslint:disable-next-line: no-unused-expression
  //       callback ? callback(e) : e;
  //     });
  //   }
  // }
  //#endregion

  /**
   * 点击删除图层
   */
  deleteLayer(): Observable<SelectEvent> {
    this.clearInteraction();
    const subject = new Subject<SelectEvent>();
    // 移入高亮
    this.highlight = new Select({ condition: pointerMove });
    this.layerForDelete = new Select();
    this.map.addInteraction(this.highlight);
    this.map.addInteraction(this.layerForDelete);
    this.deleteEventKey = this.layerForDelete.on('select', (e: SelectEvent) => {
      if (e.selected.length > 0) {
        this.source.removeFeature(e.selected[0]);
        subject.next(e);
      }
    });
    return subject;
  }
  /**
   * 全部清空
   */
  clearLayer() {
    // 解除编辑相关
    this.clearInteraction();
    // 清除水纹动画，但是会影响绘制单独的点
    unByKey(this.animateKeys);
    this.source.clear();
    this.map.render();
  }

  /**
   * 添加水纹动画参考：
   * https://openlayers.org/en/latest/examples/feature-animation.html
   * @param feature 要素
   */
  addAnimate(feature: Feature<Geometry>) {
    let start = new Date().getTime();
    const duration = 3000;
    // 进行地图水波渲染
    this.animateKeys.push(this.tileLayer.on('postrender', animate.bind(this)));
    function animate(event) {
      // 获取几何图形上下文
      const vectorContext = getVectorContext(event);
      // 获取当前渲染帧状态
      const frameState = event.frameState;
      // 复制OpenLayers.Geometry几何对象
      const flashGeom = feature.getGeometry().clone();
      // 渲染帧状已占时间
      const elapsed = frameState.time - start;
      // 已占比率
      const elapsedRatio = elapsed / duration;
      // radius半径为5结束为30
      const dradius = easeOut(elapsedRatio) * 25 + 5;
      // 不透明度渐变消失
      const opacity = easeOut(1 - elapsedRatio);

      const style = new Style({
        image: new CircleStyle({
          radius: dradius,
          stroke: new Stroke({
            color: 'rgba(255, 0, 0, ' + opacity + ')',
            width: 0.25 + opacity,
          }),
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.5)',
          }),
        }),
      });
      // 给几何图形添加样式
      vectorContext.setStyle(style);
      // 将几何体渲染到画布中
      vectorContext.drawGeometry(flashGeom);
      if (elapsed > duration) {
        // 重复动画
        start = frameState.time;
      }
      this.map.render();
    }
  }
  /**
   * 撒点
   * @param geoPoints 点坐标
   */
  showPoint(geoPoints?: Array<any>) {
    // 监听导致绘制点的时候也执行添加动画
    const key = this.source.on('addfeature', (e) => {
      this.addAnimate(e.feature);
    });
    geoPoints.forEach(point => {
      const geo = new GeoJSON().readFeatures(point);
      this.source.addFeatures(geo);
    });
    this.clearInteraction();
    // 撒点完成之后解除事件绑定，防止在绘制其他图形时产生动画
    unByKey(key);
  }

  /**
   * 撒线
   * @param geoLine geojson线数据
   */
  showPolyline(geoLine: object) {
    const line = new GeoJSON().readFeatures(geoLine);
    this.source.addFeatures(line);
    this.clearInteraction();
  }
  /**
   * 撒多边形
   * @param geoLine geojson多边形数据
   */
  showPolygon(geoPolygon: object) {
    const polygon = new GeoJSON().readFeature(geoPolygon);
    this.source.addFeature(polygon);
    this.clearInteraction();
  }
  /**
   * 撒圆
   * circleCenter暂定只能传经纬度
   * @param geoLine geojson圆数据
   * @param r 圆的半径，单位米
   * @param dataEPSG 圆心数据属于什么坐标
   */
  showCircle(circleCenter: Array<any>, r: number, dataEPSG: string) {
    let centerPoint = circleCenter;
    let geometry: CircleGemo = new CircleGemo(centerPoint, r);
    if (dataEPSG === 'EPSG:4326') {
      centerPoint = transform(circleCenter, 'EPSG:4326', 'EPSG:3857');
      // 使用这个方法绘制圆必须将坐标转成3857的，因为第二个参数半径单位是米
      geometry = new CircleGemo(centerPoint, r).transform('EPSG:3857', 'EPSG:4326');
    }
    const circleFeature = new Feature({ geometry });
    // 将所有矢量图层添加进去
    this.source.addFeature(circleFeature);
    this.clearInteraction();
  }
  /**
   * 撒正方形
   * @param geoLine geojson正数据
   */
  showSquare(geoSquare: object) {
    const square = new GeoJSON().readFeature(geoSquare);
    this.source.addFeature(square);
    this.clearInteraction();
  }

  /**
   * 编辑图层
   */
  editLayer(): Observable<ModifyEvent> {
    const subject = new Subject<ModifyEvent>();
    // 移入高亮 为了一个高亮效果而已
    this.highlight = new Select({ condition: pointerMove });
    this.map.addInteraction(this.highlight);
    this.map.addInteraction(this.modify);
    this.modify.on('modifyend', e => {
      subject.next(e);
    });
    return subject;
  }

  /**
   * 初始化popup的条件
   */
  // initPopup() {
  //   this.layerForPopup = new Select();
  //   this.map.addInteraction(this.layerForPopup);
  //   this.layerForPopup.on('select', (e: SelectEvent) => {
  //     if (e.selected.length > 0) {
  //       // subject.next(e);
  //     }
  //   });
  // }

  /**
   * 展示popup
   * @param container popup的dom容器
   * @param coordinate 在那个坐标显示
   * @param overlayId popup的id
   */
  showPopup(container: HTMLElement, coordinate: Array<number>, overlayId: string) {
    const overlay = new Overlay({
      element: container,
      id: overlayId,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      }
    });
    overlay.setPosition(coordinate);
    this.map.addOverlay(overlay);
  }
  /**
   * 关闭popup
   * @param id popup容器的id
   */
  closeOverlay(id) {
    this.map.getOverlayById(id).setPosition(undefined);
  }

}
