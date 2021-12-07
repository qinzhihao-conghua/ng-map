import { Injectable } from '@angular/core';
import { Map, View } from 'ol';
import { defaults, MousePosition } from 'ol/control';
import { Coordinate } from 'ol/coordinate';
import { altKeyOnly, click, pointerMove } from 'ol/events/condition';
import Draw, { createBox, createRegularPolygon } from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
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

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor() { }

  private map: Map;
  coordinate: number[] = [];

  // 栅格图层
  tileLayer = new TileLayer({
    source: new OSM({
      attributions: 'xxxx股份有限公司'
    })
  });
  // 矢量图层源
  source = new VectorSource({ wrapX: false });
  // 矢量图层，点线面圆
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
      })
    })
  });

  highlightSelect: Select;
  // 选中要修改的图层condition默认是单击
  select: Select;
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

  /**
   * 初始化地图
   * @param targetId 地图容器id
   * @param mapCenter 地图中心坐标
   * @returns 返回初始化的地图，可用于对地图添加自定义
   */
  initMap(targetId: string, mapCenter: Coordinate): Map {
    this.map = new Map({
      target: targetId,
      controls: defaults().extend([
        new MousePosition({ projection: 'EPSG:4326' })
      ]),
      layers: [this.tileLayer, this.vector],
      view: new View({
        center: mapCenter,
        zoom: 12,
        maxZoom: 20,
        minZoom: 6,
        projection: 'EPSG:4326'
      })
    });
    return this.map;
  }

  /**
   * 点击地图获取坐标
   * @returns 坐标，数组类型
   */
  getCoordinateByClick() {
    let coordinate: number[] = [];
    this.map.on('singleclick', (event) => {
      coordinate = event.coordinate;
    });
    return coordinate;
  }

  /**
   * 添加交互图层，参考：
   * https://openlayers.org/en/latest/examples/draw-and-modify-features.html;
   * https://openlayers.org/en/latest/examples/draw-shapes.html
   * @param typeDraw 绘制图形类型
   * @param rect 矩形类型
   */
  addInteractions(type: string | any) {
    if (type !== 'None') {
      let drawType = type;
      let geometryFunction;
      if (type === 'Square') {
        drawType = 'Circle';
        geometryFunction = createRegularPolygon(4);
      } else if (type === 'Box') {
        drawType = 'Circle';
        geometryFunction = createBox();
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
        const geoJSON = new GeoJSON().writeFeature(e.feature);
        console.log('绘制结果转成geojson', JSON.parse(geoJSON));
        // 绘制结束后关闭交互，不手动关闭将会一直可以添加绘制
        this.clearInteraction();
      });
    }
  }

  /**
   * 绘制图形交互类型
   * @param type 绘制图形的类型:None:无;Point:点;LineString:线;
   * Polygon:面;Circle:圆;Square:正方形;Box:长方形
   */
  changeDrawing(type: string) {
    this.clearInteraction();
    this.addInteractions(type);
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
    this.map.removeInteraction(this.select);
    this.map.removeInteraction(this.highlightSelect);
  }

  /**
   * 选中图层，失去选中焦点也会触发
   * @param clickType 操作类型
   * @param callback 回调方法
   */
  changeInteraction(clickType: string, callback?: (e: SelectEvent) => void) {
    this.clearInteraction();
    if (clickType === 'singleclick') {
      this.select = new Select();
    } else if (clickType === 'click') {
      this.select = new Select({ condition: click });
    } else if (clickType === 'pointermove') {
      this.select = new Select({ condition: pointerMove });
    } else if (clickType === 'altclick') {
      this.select = new Select({
        condition: (mapBrowserEvent) => {
          return click(mapBrowserEvent) && altKeyOnly(mapBrowserEvent);
        },
      });
    } else {
      this.select = null;
    }
    if (this.select !== null) {
      this.map.addInteraction(this.select);
      this.select.on('select', (e: SelectEvent) => {
        // tslint:disable-next-line: no-unused-expression
        callback ? callback(e) : e;
      });
    }
  }
  /**
   * 点击删除图层
   */
  selectLayer() {
    // 移入高亮
    const select = new Select({ condition: pointerMove });
    this.map.addInteraction(select);
    this.changeInteraction('singleclick', (e) => {
      console.log('选中动作', e);
      if (e.selected.length > 0) {
        this.vector.getSource().removeFeature(e.selected[0]);
        // this.map.removeInteraction(this.select);
        this.select.getFeatures().remove(e.selected[0]);
      }
    });
  }

  /**
   * 添加水纹动画参考：
   * https://openlayers.org/en/latest/examples/feature-animation.html
   * @param feature 要素
   */
  addAnimate(feature: Feature<Geometry>) {
    let start = new Date().getTime();
    const duration = 3000;
    const that = this;
    // 进行地图水波渲染
    this.animateKeys.push(this.tileLayer.on('postrender', animate));
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
      that.map.render();
    }
  }
  /**
   * 撒点
   * @param points 点坐标
   */
  addPoint(points?: Array<any>) {
    const features = [];
    points = [
      [12058417.02420523, 2611140.7222976275],
      [12059854.039403923, 2608327.839423466],
      [12064501.410956929, 2611935.6663420903]
    ];
    points.forEach(item => {
      features.push(new Feature(new Point(item)));
    });
    // 监听导致绘制点的时候也执行添加动画
    const key = this.source.on('addfeature', (e) => {
      console.log('撒点');
      this.addAnimate(e.feature);
    });
    this.source.addFeatures(features);
    this.clearInteraction();
    // 撒点完成之后解除事件绑定，放止在绘制其他图形时产生动画
    unByKey(key);
  }

  /**
   * 撒线
   */
  showPolyline() {
    const points = [
      [12049917.226310018, 2609978.87970096],
      [12055145.519161358, 2606768.524512983],
      [12059640.016657794, 2611782.79228552],
      [12064654.285013499, 2607899.792764871]
    ];
    const lineFeature = new Feature({ // 路线
      geometry: new LineString(points),
    });
    // 将所有矢量图层添加进去
    this.source.addFeature(lineFeature);
    this.clearInteraction();
  }
  /**
   * 撒多边形
   */
  showPolygon() {
    const points = [[
      [12047838.13879076, 2611110.14736968],
      [12048082.737631174, 2608450.139135257],
      [12050956.769778064, 2608297.265078686],
      [12051751.714405693, 2610804.399256539],
      [12049489.178485086, 2612088.540398661],
      [12047838.13879076, 2611110.14736968]
    ]];
    // 多边形的数据格式是[[[lng,lat],[lng,lat]……]]外围两个中括号
    const polygonFeature = new Feature({ // 路线
      geometry: new Polygon(points)

    });
    this.source.addFeature(polygonFeature);
    this.clearInteraction();
  }
  /**
   * 撒圆
   */
  showCircle() {
    const centerPoint = [12061321.63011373, 2611905.0925804796];
    const radius: any = 2500;
    const circleFeature = new Feature({
      geometry: new CircleGemo(centerPoint, radius),
    });
    // 将所有矢量图层添加进去
    this.source.addFeature(circleFeature);
    this.clearInteraction();
  }
  /**
   * 撒正方形
   */
  showSquare() {
    const points = [[
      [12052913.558168698, 2609489.6820201334],
      [12051445.967458889, 2612852.9124310184],
      [12048082.737048004, 2611385.321721209],
      [12049550.327757813, 2608022.091310324],
      [12052913.558168698, 2609489.6820201334]
    ]];
    const polygonFeature = new Feature({ // 路线
      geometry: new Polygon(points)
    });
    this.source.addFeature(polygonFeature);
    this.clearInteraction();
  }

  // 编辑图层
  editLayer() {
    // 移入高亮 为了一个高亮效果而已
    this.highlightSelect = new Select({ condition: pointerMove });
    this.map.addInteraction(this.highlightSelect);
    this.map.addInteraction(this.modify);
    this.modify.on('modifyend', e => {
      console.log('编辑结果', e);
    });
  }

}
