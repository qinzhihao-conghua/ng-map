import { Map, MapBrowserEvent, Overlay, View } from 'ol';
import { defaults, MousePosition } from 'ol/control';
import { Coordinate } from 'ol/coordinate';
import { altKeyOnly, click, pointerMove } from 'ol/events/condition';
import Draw, { createBox, createRegularPolygon, DrawEvent } from 'ol/interaction/Draw';
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
import { Icon, Text } from 'ol/style';
import ImageLayer from 'ol/layer/Image';
import XYZ from 'ol/source/XYZ';
import TileWMS from 'ol/source/TileWMS';
import TileArcGISRest from 'ol/source/TileArcGISRest';
import WMTS from 'ol/source/WMTS';
import TileImage from 'ol/source/TileImage';
import * as turf from '@turf/turf';
import Heatmap from 'ol/layer/Heatmap';
import Cluster from 'ol/source/Cluster';
import { boundingExtent } from 'ol/extent';
import IconOrigin from 'ol/style/IconOrigin';
import IconAnchorUnits from 'ol/style/IconAnchorUnits';
// import { Observable, Subject } from 'rxjs';
import { defaults as olDefaults } from 'ol/interaction';
import GeometryType from 'ol/geom/GeometryType';
import { Observable } from './observable';
import OverlayPositioning from 'ol/OverlayPositioning';
import { getArea, getLength } from 'ol/sphere';

/**
 * 底图基本信息
 */
export interface LayerOption {
  sourceUrl: string,
  projection: string,
  layerType: string,
  sourceType: string
}
/**
 * 图形基本样式
 */
export interface BaseStyle {
  /**线条颜色 */
  strokeColor?: string,
  /**填充颜色 */
  fillColor?: string,
  /**线条宽度 */
  lineWidth?: number,
  /**虚线线条，传入则说明使用虚线线条 */
  lineDash?: Array<number>
  /**点颜色，与图片互斥 */
  pointColor?: string,

  /**坐标点图片地址，与点互斥 */
  pointImageUrl?: string,
  /**图片图标缩放比例 */
  imageScal?: number,
  /**图片锚点偏移，根据图片实际大小计算偏移值，单位为像素 */
  imageAnchor?: Array<number>,

  /**文本 */
  text?: string,
  /**文本缩放比例 */
  textScale?: number,
  /**文本对齐方式'left', 'right', 'center', 'end' or 'start' */
  textAlign?: 'center',
  /**文本基线'bottom', 'top', 'middle', 'alphabetic', 'hanging', 'ideographic' */
  textBaseline?: 'top',
  /**文本Y轴偏置 */
  textOffsetY?: number,
  /**文本X轴偏置 */
  textOffsetX?: number,
  /**文本填充颜色 */
  textFillColor?: string,
  /**文本线条颜色 */
  textStrokeColor?: string,
}
/**聚合图样式 */
export interface ClusterStyle {
  radius?: number,
  stroke?: string,
  fill?: string,
  textColor?: string
}

export class OlMapService {
  private map: Map;
  /**
   * AccessToken = {
   *   tianditu: '20b1ddbd59370c477d07bac00ab1282d',
   *   mapbox: 'pk.eyJ1IjoicHVyYnVubnlsdWx1IiwiYSI6ImNqcmZ4d2s2bjFoc3c0OWxwZ3ZuODN0aDUifQ.C175LEETPWpywcJa0uXtpA',
   *   mapabc: 'ec85d3648154874552835438ac6a02b2',
   *   minemap: '16be596e00c44c86bb1569cb53424dc9',
   *   ppmap: '25cc55a69ea7422182d00d6b7c0ffa93',
   * };
   */

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
    // source: new OSM({
    //   attributions: 'xxxx股份有限公司'
    // })
  });
  /**
   * 矢量图层源，相关绘制操作在这个图层上进行
   */
  source = new VectorSource({ wrapX: false });
  /**
   * 矢量图层，基本的图形样式，默认点的样式是普通的小圆点
   * 如果要展示图标image的值改成new Icon({})
   */
  vector: VectorLayer = null;

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
  pointermoveEvent;
  private otherTest = {
    sourceUrl: 'http://114.215.146.210:25003/v3/tile?x={x}&y={y}&z={z}',
    projection: 'EPSG:4326',
    layerType: 'Tile',
    sourceType: 'XYZ'
  };
  /**
   * 标绘图标的样式信息，记录传入的配置样式
   */
  plotStyle: BaseStyle;
  clusterEventKey: any;
  clusterSource: Cluster;
  markObj: any = {};
  /**
   * 初始化地图，该service目标是脱离框架使用，因此基本地图配置项请从外部传入
   * @param targetId 地图容器id
   * @param viewOption 视图配至项，必须有坐标中心
   * @param layerOption 底图基本信息，不传使用默认值，项目中对接时必传
   * @param baseStyle 标绘的图形基本样式，不传则使用默认基本样式
   * @returns 返回初始化的地图，可用于对地图添加自定义
   * @description viewOption的内容参数参考
   * viewOption:{
   *     center: mapCenter,
   *     zoom: 12,
   *     maxZoom: 20,
   *     minZoom: 6,
   *     projection: 'EPSG:4326'
   * }
   */
  initMap(targetId: string, viewOption: ViewOptions, layerOption: LayerOption = this.otherTest, baseStyle: BaseStyle = {}): Map {

    let { sourceUrl, projection, layerType, sourceType } = layerOption;
    this.plotStyle = baseStyle;
    // 创建地图图层
    this.tileLayer = this.createMapLayer(layerType, sourceType, sourceUrl);
    // 创建标绘图层
    const style = this.createStyle(baseStyle);
    this.vector = this.createVector(style);
    this.map = new Map({
      target: targetId,
      controls: defaults().extend([
        // new MousePosition({ projection: 'EPSG:4326' })
      ]),
      layers: [this.tileLayer, this.vector],
      view: new View(viewOption),
      interactions: olDefaults({
        doubleClickZoom: false
      })
    });
    return this.map;
  }

  /**
   * 生成底图图层Layer
   * @param layerType 图层类型
   * @param sourceType 图源类型
   * @param sourceUrl 图源服务url
   * @returns Layer
   */
  private createMapLayer(layerType: string, sourceType: string, sourceUrl: string) {
    let layer = null;
    let source = this.createTileSource(sourceType, sourceUrl);
    switch (layerType) {
      case 'Image':
        layer = new ImageLayer({ source: source });
        break;
      case 'Tile':
        layer = new TileLayer({ source: source });
        break;
      default:
        console.error("未定义该图层类型");
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
    let source_options: any = { url: sourceUrl, crossOrigin: 'anonymous' };
    let source: any = null;
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
      console.error('未处理该图源');
    }
    return source;
  }

  /**
   * 点击获取feature
   * @returns
   */
  clickToGetFeature(): Observable<Feature> {
    // const subject = new Subject<Feature>();
    const subject = new Observable<Feature>();
    const key = this.map.on('singleclick', (event) => {
      this.map.forEachFeatureAtPixel(
        event.pixel,
        (feature: Feature) => { subject.next(feature); },
        { hitTolerance: 20 }
      );
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
   * 创建标绘层
   * @param style 标绘基本样式
   */
  private createVector(style: Style) {
    return new VectorLayer({
      source: this.source,
      style: style
    });
  }
  /**
   * 生成基本样式，只用于标绘时候
   * TODO:剩余样式未处理，使用style.属性 | 默认值的方式
   * @returns 
   */
  createStyle(style: BaseStyle): Style {
    const { strokeColor, fillColor, pointColor, pointImageUrl, imageScal, lineWidth, lineDash, text } = style;
    let image = null;
    if (pointImageUrl) {
      image = new Icon({
        src: pointImageUrl,
        // 图片缩放
        scale: imageScal || .15
      })
    } else {
      image = new CircleStyle({ // 作用于点标注
        radius: 7,
        fill: new Fill({
          color: pointColor || '#03a9f4',
        })
      })
    }
    return new Style({
      fill: new Fill({
        color: fillColor || 'rgba(255, 255, 255, 0.5)'
      }),
      // 线条颜色
      stroke: new Stroke({
        color: strokeColor || '#ff3300',
        width: lineWidth || 2,
        lineDash: lineDash || null
      }),
      image: image,
      text: new Text({
        text,
        scale: 1.5
      })
    })
  }

  /**
   * 添加交互图层，参考：
   * https://openlayers.org/en/latest/examples/draw-and-modify-features.html;
   * https://openlayers.org/en/latest/examples/draw-shapes.html
   * @param type 绘制图形类型:
   * None:无;Point:点;LineString:线;
   * Polygon:面;Circle:圆;Square:正方形;Box:长方形
   * @param text 标绘后添加的文本，注意，当传入的文本长度超过绘制的图形长度，文本将不会显示
   * @param imageUrl 点图标使用图片展示时，图片的路径
   * @param succession 是否连续绘制
   * @param isGeojson 是否返回geojson，默认是true
   * @returns 根据传入条件返回geojson或feature
   */
  addInteractions(type: any, text?: string, imageUrl?: string, succession?: boolean, isGeojson: boolean = true): Observable<string | Feature<Geometry>> {
    if (type !== 'None') {
      this.clearInteraction();
      // 
      // const subject = new Subject();
      const subject = new Observable<string | Feature<Geometry>>();
      let drawType = type;
      let geometryFunction;
      let style = (this.vector.getStyle() as Style);
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
        // 绘制时候的样式并不是最终的样式
        // style: style ? style : null
      });
      this.map.addInteraction(this.draw);
      this.backout();
      this.createHelpTooltip();
      this.createMeasureTooltip();
      this.snap = new Snap({ source: this.source });
      this.modify = new Modify({ source: this.source });
      this.draw.on('drawstart', (evt) => {
        // set sketch
        this.sketch = evt.feature;

        /** @type {import("../src/ol/coordinate.js").Coordinate|undefined} */
        // @ts-ignore
        let tooltipCoord = evt.coordinate;
        let listener;
        listener = this.sketch.getGeometry().on('change', (change) => {
          const geom = change.target;
          let output;
          if (geom instanceof Polygon) {
            output = this.formatArea(geom);
            // output = geom.getArea() + '---' + getArea(geom);

            tooltipCoord = geom.getInteriorPoint().getCoordinates();
          } else if (geom instanceof LineString) {
            output = this.formatLength(geom);
            // output = geom.getLength() + '---' + getLength(geom);
            tooltipCoord = geom.getLastCoordinate();
          }
          this.measureTooltipElement.innerHTML = output;
          this.measureTooltip.setPosition(tooltipCoord);
        });
      });
      this.draw.on('drawend', (e) => {
        const result = this.drawendHandle(e, type, text, imageUrl, isGeojson);
        // 绘制结束后关闭交互，不手动关闭将会一直可以添加绘制
        if (!succession) {
          this.clearInteraction();
        }
        subject.next(result);
      });
      this.pointermoveEvent = this.map.on('pointermove', this.pointerMoveHandler);
      return subject;
    }
  }
  /**
   * 绘制结束之后的操作，主要是设置标绘后的样式
   * @param e 绘制结束事件
   * @param type 绘制的类型
   * @param text 要显示的文本
   * @param imageUrl 要显示的图片地址
   * @param isGeojson 是否返回geojson，默认是true
   * @returns 根据传入条件返回geojson或feature
   */
  drawendHandle(e: DrawEvent, type: any, text?: string, imageUrl?: string, isGeojson: boolean = true): Feature<Geometry> | string {
    let style = this.createStyle(this.plotStyle);
    let { textOffsetY } = this.plotStyle;
    e.feature.setStyle(style);
    if (text) {
      if (type !== 'Point') {
        textOffsetY = 1;
      }
      style.setText(new Text({
        text: text,
        scale: this.plotStyle.textScale || 1.5,
        offsetY: textOffsetY || -35
      }));
      e.feature.setStyle(style);
    }
    if (imageUrl) {
      style.setImage(new Icon({
        src: imageUrl,
        scale: this.plotStyle.imageScal || .15,
        anchor: this.plotStyle.imageAnchor || [110, 20],
        anchorOrigin: IconOrigin.BOTTOM_LEFT,
        anchorXUnits: IconAnchorUnits.PIXELS,
        anchorYUnits: IconAnchorUnits.PIXELS
      }));
      e.feature.setStyle(style);
    }
    if (!e.feature.getId()) {
      e.feature.setId(this.newGuid());
    }
    let result = null;
    if (isGeojson) {
      result = this.featuresToGeojson([e.feature])
    } else {
      result = e.feature;
    }
    // 关闭键盘监听
    document.onkeypress = null;
    return result;
  }
  /**
   * 生成id
   * @returns 
   */
  newGuid() {
    let guid = '';
    for (let i = 1; i <= 32; i++) {
      const n = Math.floor(Math.random() * 16.0).toString(16);
      guid += n;
    }
    return guid;
  }
  /**
   * 将feature转成geojson，geojson不支持Circle类型的feature转换，
   * 因此用点类型记录圆的geojson，在properties属性中添加subType标记为圆类型，radius为半径
   * @param features
   * @returns 
   */
  featuresToGeojson(features: Array<Feature>) {
    let geoJSON: string; //= new GeoJSON().writeFeature(feature);
    const featuresCache = [];
    features.forEach(item => {
      const type = item.getGeometry().getType();
      const properties = item.getProperties();
      if (type === GeometryType.CIRCLE) {
        // 1单位对应的 单位(米) 的值
        const perMeter = this.map.getView().getProjection().getMetersPerUnit();
        const center = (item.getGeometry() as any).getCenter();
        // 必须先将原有的几何信息删除
        delete properties.geometry;
        let circleFeature = new Feature({
          geometry: new Point(center)
        });
        circleFeature.setId(item.getId().toString())
        const pro = {
          subType: 'Circle',
          center,
          radius: (item.getGeometry() as any).getRadius() * perMeter,
          ...properties
        };
        circleFeature.setProperties(pro);
        featuresCache.push(circleFeature);
      } else {
        featuresCache.push(item);
      }
    })
    geoJSON = new GeoJSON().writeFeatures(featuresCache);
    return geoJSON;
  }

  /**
   * 设置feature样式和属性
   * @param feature 要设置的feature
   * @param style 要设置的样式。可接收Style类型或者简单对象，对象类型暂未定
   * @param properties 要设置的属性
   */
  setFeatureStyle(feature: Feature, style: Style | object, properties?: object) {
    if (style instanceof Style) {
      feature.setStyle(style);
    } else {
      const { strokeColor, fillColor, imageUrl, text } = style as any;
      const featureStyle: Style = feature.getStyle() as Style;
      featureStyle.getStroke().setColor(strokeColor);
      featureStyle.getFill().setColor(fillColor);
      // featureStyle.getImage().load(imageUrl)
      featureStyle.getText() ? featureStyle.getText().setText(text) : featureStyle.setText(new Text({ text, scale: 1.5 }))
    }
    feature.setProperties(properties)
  }

  /**
   * 获取绘制的所有图层，待验证
   * @returns 
   */
  getAllFeature() {
    // const result = this.source.getFeatures();
    const result = this.vector.getSource().getFeatures();
    return result;
  }
  /**
   * 设置中心
   * @param center 
   * @param zoom 
   * @param duration 
   */
  setCenter(center: number[], zoom: number = 12, duration: number = 1000) {
    this.map.getView().animate({
      center: center, // 中心点
      zoom: zoom, // 缩放级别
      rotation: undefined, // 缩放完成view视图旋转弧度
      duration: duration // 缩放持续时间，默认不需要设置
    })
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
    unByKey(this.pointermoveEvent);
    this.helpTooltipElement && this.helpTooltipElement.classList.add('hidden');
    document.onkeypress = () => { };
  }

  /**
   * ctrl+z回退事件
   */
  backout() {
    document.onkeypress = (e) => {
      if (e.keyCode === 26 && e.ctrlKey) {
        this.draw.removeLastPoint();
      }
    }
  }

  /**
   * 点击删除图层
   */
  deleteLayer(): Observable<SelectEvent> {
    this.clearInteraction();
    // const subject = new Subject();
    const subject = new Observable<SelectEvent>();
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
    this.clusterSource ? this.clusterSource.clear() : null
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
   * 设置撒点集合的中心
   * @param geojson geojson数据
   */
  setFeaturesCenter(geojson: any) {
    let features = null;
    if (Array.isArray(geojson)) {
      features = turf.featureCollection(geojson);
    } else if (geojson.type === 'FeatureCollection') {
      features = turf.featureCollection(geojson.features);
    } else {
      features = turf.featureCollection([geojson]);
    }
    const center = turf.center(features).geometry.coordinates;
    this.map.getView().setCenter(center);
  }
  /**
   * 根据geojson中Properties返回的样式对图形设置样式
   * @param geojsonData 原始的geojson数据
   * @param features 将geojson数据转成features后的数据
   * @returns
   */
  setStyleByProperties(geojsonData, features: Array<Feature>) {
    const resultFeatures = [];
    geojsonData.features.forEach((item, index) => {
      const style = item.properties ? item.properties.style : null;
      let styleInstance = null;
      if (style) {
        styleInstance = new Style({
          stroke: new Stroke({
            color: style.strokeColor
          }),
          fill: new Fill({
            color: style.fillColor
          }),
          text: new Text({
            text: style.text,
            scale: 1.5
          }),
          image: new Icon({
            src: style.pointImageUrl,
            anchor: [0.5, 1],
            scale: .15
          })
        })
      }
      if (item.properties && item.properties.subType === 'Circle') {
        // 这时候的json是点的json
        let geometry = new CircleGemo(item.properties.center, item.properties.radius);
        const projection = this.map.getView().getProjection();
        if (projection.getCode() === 'EPSG:4326') {
          let result = transform(item.properties.center, 'EPSG:4326', 'EPSG:3857');
          // 使用这个方法绘制圆必须将坐标转成3857的，因为第二个参数半径单位是米
          geometry = new CircleGemo(result, item.properties.radius).transform('EPSG:3857', 'EPSG:4326') as any;
        }
        const circleFeature = new Feature({ geometry });
        circleFeature.setStyle(styleInstance);
        circleFeature.setProperties({ ...item.properties });
        resultFeatures.push(circleFeature);
      } else {
        features[index].setStyle(styleInstance);
        resultFeatures.push(features[index]);
      }
    });
    return resultFeatures;
  }
  /**
   * 撒点
   * @param geoPoints 点坐标
   */
  showPoint(geoPoints: any, showdAnimate?: boolean) {
    // 监听导致绘制点的时候也执行添加动画
    let key = null;
    if (showdAnimate) {
      key = this.source.on('addfeature', (e) => {
        this.addAnimate(e.feature);
      });
    }
    const geo = new GeoJSON().readFeatures(geoPoints);
    this.source.addFeatures(geo);
    this.setFeaturesCenter(geoPoints);
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
    this.setFeaturesCenter(geoLine);
    this.clearInteraction();
  }
  /**
   * 撒多边形，可以撒所有图形
   * @param geoPolygon geojson多边形数据
   */
  showPolygon(geoPolygon: any) {
    const polygons = new GeoJSON().readFeatures(geoPolygon);
    let result = null;
    if (geoPolygon.type === 'FeatureCollection') {
      result = this.setStyleByProperties(geoPolygon, polygons);
    }
    this.source.addFeatures(result);
    this.setFeaturesCenter(geoPolygon);
    this.clearInteraction();
  }
  /**
   * 撒圆，这个方法只是对只有中心坐标和半径的情况下进行撒圆，如果是geojson数据的使用showPolygon
   * center默认只能传经纬度，如果是公里网数据，dataEPSG请传入EPSG:3857
   * @param circleJson 目前情况下circleJson中的properties请最基本请传入{style:{}}
   * @param dataEPSG 圆心数据属于什么坐标
   */
  showCircle(circleJson: { center: Array<any>, radius: number, properties?: any }, dataEPSG: string = 'EPSG:4326') {
    let centerPoint = circleJson.center;
    let radius = circleJson.radius;
    let properties = circleJson.properties;

    let geometry: CircleGemo = new CircleGemo(centerPoint, radius);
    if (dataEPSG === 'EPSG:4326') {
      let result = transform(centerPoint, 'EPSG:4326', 'EPSG:3857');
      // 使用这个方法绘制圆必须将坐标转成3857的，因为第二个参数半径单位是米
      geometry = new CircleGemo(result, radius).transform('EPSG:3857', 'EPSG:4326') as any;
    }
    const circleFeature = new Feature({ geometry });
    const style = new Style({
      stroke: new Stroke({
        color: properties.style.strokeColor
      }),
      fill: new Fill({
        color: properties.style.fillColor
      }),
      text: new Text({
        text: properties.style.text,
        scale: 1.5
      })
    })
    circleFeature.setStyle(style)
    // 将所有矢量图层添加进去
    this.source.addFeatures([circleFeature]);
    this.setCenter(centerPoint);
    this.clearInteraction();
  }
  /**
   * 撒正方形
   * @param geoSquare geojson正方形数据
   */
  showSquare(geoSquare: object) {
    const square = new GeoJSON().readFeature(geoSquare);
    this.source.addFeature(square);
    this.setFeaturesCenter(geoSquare);
    this.clearInteraction();
  }

  /**
   * 展示热力图
   * @param heatMapJson 热力图数据
   */
  showHeatMap(heatMapJson: object) {
    const heatmapLayer = new Heatmap({
      source: new VectorSource({
        features: new GeoJSON().readFeatures(heatMapJson)
      }),
      opacity: 0.8, // 透明度
      blur: 15, // 模糊大小（以像素为单位）,默认15
      radius: 12, // 半径大小（以像素为单位,默认8
      // shadow: 250, // 阴影像素大小，默认250
      gradient: ['#e72a2a', '#e7b52a', '#623ad1', '#5b28f3', '#28e5f3'],
      // 矢量图层的渲染模式：
      // 'image'：矢量图层呈现为图像。性能出色，但点符号和文本始终随视图一起旋转，像素在缩放动画期间缩放。
      // 'vector'：矢量图层呈现为矢量。即使在动画期间也能获得最准确的渲染，但性能会降低。
      // renderMode: 'vector'
    });
    this.map.addLayer(heatmapLayer);
    return heatmapLayer;
  }
  closeHeatMap(heatmapLayer: any) {
    this.map.removeLayer(heatmapLayer);
  }
  /**
   * 展示聚合点图
   * @param features 点集合
   * @returns 返回聚合图的图层layer和源source，通过layer可以进行一些自定义操作，source可以控制密度大小，以像素为单位
   * clusterSource.setDistance(50);
   * clusterSource.setMinDistance(30);
   * @description   
   * https://openlayers.org/en/latest/examples/clusters-dynamic.html
   * https://openlayers.org/en/latest/examples/cluster.html
   */
  showClusterMap(features: Feature<Geometry>[], style: ClusterStyle = {}): { source: Cluster, layer: VectorLayer } {
    this.clusterSource = new Cluster({
      distance: 100,
      // minDistance: 40,
      source: new VectorSource({
        features: features,
      }),
    });
    const styleCache = {};
    const { radius, stroke, fill, textColor } = style;
    const clustersLayer = new VectorLayer({
      source: this.clusterSource,
      style: function (feature) {
        const size = feature.get('features').length;
        let style = styleCache[size];
        if (!style) {
          style = new Style({
            image: new CircleStyle({
              radius: radius || 20,
              stroke: new Stroke({
                color: stroke || '#fff',
              }),
              fill: new Fill({
                color: fill || '#06fb68',
              }),
            }),
            text: new Text({
              text: size.toString(),
              fill: new Fill({
                color: textColor || '#000',
              }),
            }),
          });
          styleCache[size] = style;
        }
        return style;
      },
    });
    this.clusterEventKey = this.clusterClickEven(clustersLayer);
    this.map.addLayer(clustersLayer);
    return { source: this.clusterSource, layer: clustersLayer }
  }
  /**
   * 关闭聚合图
   * @param clusterLayer 聚合图层
   */
  closeClusterMap(clusterLayer: any) {
    unByKey(this.clusterEventKey);
    this.map.removeLayer(clusterLayer);
  }
  /**
   * 聚合图点击
   * @param clustersLayer 聚合图图层
   * @returns 地图点击事件key
   */
  clusterClickEven(clustersLayer: VectorLayer) {
    return this.map.on('click', (e) => {
      clustersLayer.getFeatures(e.pixel).then((clickedFeatures) => {
        if (clickedFeatures.length) {
          // Get clustered Coordinates
          const features = clickedFeatures[0].get('features');
          if (features.length > 1) {
            const extent = boundingExtent(
              features.map((r) => r.getGeometry().getCoordinates())
            );
            this.map.getView().fit(extent, { duration: 1000, padding: [50, 50, 50, 50] });
          }
        }
      });
    });
  }

  /**
   * 编辑图层
   */
  editLayer(): Observable<Feature<Geometry>[]> {
    // const subject = new Subject<Feature<Geometry>[]>();
    const subject = new Observable<Feature<Geometry>[]>();
    // 移入高亮 为了一个高亮效果而已，这个高亮效果会有一个效率不高的警告
    // this.highlight = new Select({ condition: pointerMove });
    // this.map.addInteraction(this.highlight);
    this.map.addInteraction(this.modify);
    this.modify.on('modifyend', e => {
      const result = e.features.getArray();
      subject.next(result)
    });
    return subject;
  }

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
  closeOverlay(id: string) {
    this.map.getOverlayById(id).setPosition(undefined);
  }
  /**
   * 关闭轨迹
   */
  closeMarkerAnimation(clusterLayer: any) {
    this.map.removeLayer(clusterLayer);
  }
  /**
   * 根据坐标点集合生成轨迹图层
   * @param routeCoords 坐标点集合
   * @returns 
   */
  markerAnimation(routeCoords: Array<any>): VectorLayer {
    const route = new LineString(routeCoords);
    const routeFeature = new Feature({
      type: "route",
      geometry: route
    });
    // 移动点
    const geoMarker = new Feature({
      type: "geoMarker",
      geometry: new Point(routeCoords[0])
    });
    const startMarker = new Feature({
      type: "icon",
      geometry: new Point(routeCoords[0])
    });
    const endMarker = new Feature({
      type: "icon",
      geometry: new Point(routeCoords[routeCoords.length - 1])
    });
    const position = startMarker.getGeometry().clone();
    const styles = {
      'route': new Style({
        stroke: new Stroke({
          width: 6,
          color: '#ff3300',
        }),
      }),
      'icon': new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: 'assets/img/location.png',
          scale: .15
        }),
      }),
      'geoMarker': new Style({
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({ color: '#06fb68' }),
          stroke: new Stroke({
            color: 'white',
            width: 2,
          }),
        }),
      }),
    };
    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [routeFeature, geoMarker, startMarker, endMarker],
      }),
      style: function (feature) {
        return styles[feature.get('type')];
      },
    });
    this.markObj['geoMarker'] = geoMarker;
    this.markObj['styles'] = styles;
    this.markObj['position'] = position;
    this.markObj['route'] = route;
    this.markObj['vectorLayer'] = vectorLayer;
    this.markObj['distance'] = 0;
    this.map.addLayer(vectorLayer);
    return vectorLayer;
  }
  /**
   * 轨迹移动逻辑，必须要匿名函数处理this指向问题
   * @param event 
   */
  moveFeature = (event) => {
    const speed = 1;
    const time = event.frameState.time;
    const elapsedTime = time - this.markObj.lastTime;
    this.markObj.distance = (this.markObj.distance + (speed * elapsedTime) / 10000) % 2;
    if (this.markObj.distance >= 1) {
      this.stopAnimation()
    }
    this.markObj.lastTime = time;
    const currentCoordinate = this.markObj.route.getCoordinateAt(
      this.markObj.distance > 1 ? 2 - this.markObj.distance : this.markObj.distance
    );
    this.markObj.position.setCoordinates(currentCoordinate);
    const vectorContext = getVectorContext(event);
    vectorContext.setStyle(this.markObj.styles.geoMarker);
    vectorContext.drawGeometry(this.markObj.position);
    // tell OpenLayers to continue the postrender animation
    this.map.render();
  }

  /**
   * 开始轨迹动画
   */
  startAnimation() {
    this.markObj['lastTime'] = Date.now();
    this.markObj.vectorLayer.on('postrender', this.moveFeature);
    this.markObj.geoMarker.setGeometry(null);
  }

  /**
   * 结束轨迹动画
   */
  stopAnimation() {
    this.markObj.geoMarker.setGeometry(this.markObj.position);
    this.markObj.vectorLayer.un('postrender', this.moveFeature);
  }
  /**
 * Currently drawn feature.
 * @type {import("../src/ol/Feature.js").default}
 */
  sketch: Feature;

  /**
   * The help tooltip element.
   * @type {HTMLElement}
   */
  helpTooltipElement: HTMLElement;

  /**
   * Overlay to show the help messages.
   * @type {Overlay}
   */
  helpTooltip: Overlay;

  /**
   * The measure tooltip element.
   * @type {HTMLElement}
   */
  measureTooltipElement: HTMLElement;

  /**
   * Overlay to show the measurement.
   * @type {Overlay}
   */
  measureTooltip: Overlay;

  /**
   * Message to show when the user is drawing a polygon.
   * @type {string}
   */
  continuePolygonMsg: string = 'Click to continue drawing the polygon';

  /**
   * Message to show when the user is drawing a line.
   * @type {string}
   */
  continueLineMsg: string = 'Click to continue drawing the line';
  pointerMoveHandler = (evt) => {
    if (evt.dragging) {
      return;
    }
    /** @type {string} */
    let helpMsg = 'Click to start drawing';

    if (this.sketch) {
      const geom = this.sketch.getGeometry();
      if (geom instanceof Polygon) {
        helpMsg = this.continuePolygonMsg;
      } else if (geom instanceof LineString) {
        helpMsg = this.continueLineMsg;
      }
    }

    this.helpTooltipElement.innerHTML = helpMsg;
    this.helpTooltip.setPosition(evt.coordinate);
    this.helpTooltipElement.classList.remove('hidden');
  };
  /**
 * Creates a new help tooltip
 */
  createHelpTooltip() {
    if (this.helpTooltipElement) {
      this.helpTooltipElement.parentNode.removeChild(this.helpTooltipElement);
    }
    this.helpTooltipElement = document.createElement('div');
    this.helpTooltipElement.className = 'ol-tooltip hidden';
    this.helpTooltip = new Overlay({
      element: this.helpTooltipElement,
      offset: [15, 0],
      // positioning: 'center-left',
      positioning: OverlayPositioning.CENTER_LEFT
    });
    this.map.addOverlay(this.helpTooltip);
  }
  /**
   * Creates a new measure tooltip
   */
  createMeasureTooltip() {
    if (this.measureTooltipElement) {
      this.measureTooltipElement.parentNode.removeChild(this.measureTooltipElement);
    }
    this.measureTooltipElement = document.createElement('div');
    this.measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
    this.measureTooltip = new Overlay({
      element: this.measureTooltipElement,
      offset: [0, -15],
      positioning: OverlayPositioning.CENTER_LEFT,
      stopEvent: false,
      insertFirst: false,
    });
    this.map.addOverlay(this.measureTooltip);
  }
  /**
 * Format length output.
 * @param {LineString} line The line.
 * @return {string} The formatted length.
 */
  formatLength(line) {
    const length = getLength(line, { projection: 'EPSG:4326'/*, radius: 6371008.8*/ });
    let output;
    if (length > 100) {
      output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
    } else {
      output = Math.round(length * 100) / 100 + ' ' + 'm';
    }
    return output;
  };

  /**
   * Format area output.
   * @param {Polygon} polygon The polygon.
   * @return {string} Formatted area.
   */
  formatArea(polygon) {
    const area = getArea(polygon, { projection: 'EPSG:4326'/*, radius: 6371008.8*/ });
    let output;
    if (area > 10000) {
      output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
    } else {
      output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
    }
    return output;
  };
}