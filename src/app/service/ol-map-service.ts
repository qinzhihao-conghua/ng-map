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
import { Circle, Circle as CircleGemo, Geometry } from 'ol/geom';
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
import { BaseStyle, ClusterStyle, LayerOption } from './base-type';
import { EventsKey } from 'ol/events';


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
  mapLayer = new TileLayer({
    // source: new OSM({
    //   attributions: 'xxxx股份有限公司'
    // })
  });
  /**
   * 地图底图图层源，相关绘制操作在这个图层上进行
   */
  mapLayerSource = new VectorSource({ wrapX: false });
  /**
   * 操作图层，基本的图形样式，默认点的样式是普通的小圆点
   * 如果要展示图标image的值改成new Icon({})
   */
  operationLayers: VectorLayer = null;
  /**浏览图层，只做一些显示上的操作，不修改操作图层上的图层 */
  viewLayer: VectorLayer = null;

  highlight: Select;
  deleteEventKey: EventsKey;
  layerForDelete: Select;
  layerForPopup: Select;
  // 修改
  modify = new Modify({ source: this.mapLayerSource });
  // 绘制对象
  draw: Draw;
  // 鼠标捕捉，用户修改
  snap: Snap;
  // 绘制类型
  typeDraw: string = 'None';
  // 水纹动画keys
  animateKeys: Array<EventsKey> = [];
  clickKey: Array<EventsKey> = [];
  pointermoveEvent: EventsKey;
  private otherTest = {
    sourceUrl: 'http://114.215.146.210:25003/v3/tile?x={x}&y={y}&z={z}',
    projection: 'EPSG:4326',
    layerType: 'Tile',
    sourceType: 'XYZ'
  };
  /**
   * 标绘图标的样式信息，记录传入的配置样式
   */
  plotStyle: BaseStyle = new BaseStyle();
  clusterEventKey: EventsKey;
  clusterSource: Cluster;
  markObj: any = {};
  /** 正在绘制的 feature */
  sketch: Feature;
  /** 绘制提示语dom容器 */
  helpTooltipElement: HTMLElement;
  /** 展示帮助信息的Overlay */
  helpTooltip: Overlay;
  /** 测量提示语dom容器 */
  measureTooltipElement: HTMLElement;
  /** 展示测量提示的Overlay */
  measureTooltip: Overlay;
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
    if (baseStyle instanceof BaseStyle) {
      this.plotStyle = baseStyle;
    }
    // 创建地图图层
    this.mapLayer = this.createMapLayer(layerType, sourceType, sourceUrl);
    // 创建标绘图层
    const style = this.createStyle(this.plotStyle);
    this.operationLayers = this.createVector(style);
    this.map = new Map({
      target: targetId,
      controls: defaults().extend([
        // new MousePosition({ projection: 'EPSG:4326' })
      ]),
      layers: [this.mapLayer, this.operationLayers],
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
   * 激活当前图层
   */
  activeFeature() {
    this.clickToGetFeature().subscribe(feature => {
      const newFeature = feature.clone();
      const highlightStyle = new Style({
        stroke: new Stroke({
          color: '#4CAF50',
          width: 2,
        }),
      });
      newFeature.setStyle(highlightStyle);
      if (!this.viewLayer) {
        this.viewLayer = new VectorLayer({
          source: new VectorSource(),
          map: this.map,
          // style: highlightStyle
        });
      }
      this.viewLayer.getSource().clear();
      this.viewLayer.getSource().addFeature(newFeature);
      // TODO:有可能存在多选的操作，后面在说
      // if (newFeature !== this.highlight) {
      //   if (this.highlight) {
      //     this.featureOverlay.getSource().removeFeature(this.highlight);
      //   }
      //   if (newFeature) {
      //     this.featureOverlay.getSource().addFeature(newFeature);
      //   }
      //   this.highlight = newFeature;
      // }
    })
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
      source: this.mapLayerSource,
      style: style
    });
  }
  /**
   * rgb转16进制色值
   * @param color 
   */
  rgbToHex(color: string): string {
    if (color.indexOf('#') > -1) {
      return color;
    }
    if (color) {
      const rgb = color.split(',');
      const r = parseInt(rgb[0].split('(')[1]);
      const g = parseInt(rgb[1]);
      const b = parseInt(rgb[2].split(')')[0]);
      const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
      return hex;
    }
  }
  /**
   * rgb转rgba
   * @param color 
   * @param alp 
   * @returns 
   */
  rgbToRgba(color: string, alp: number) {
    let rgbaAttr = color.match(/[\d.]+/g);
    if (rgbaAttr.length >= 3) {
      const r = rgbaAttr[0];
      const g = rgbaAttr[1];
      const b = rgbaAttr[2];
      return 'rgba(' + r + ',' + g + ',' + b + ',' + alp + ')';
    }
  }
  /**
   * rgba转rgb和透明度
   * @param rgba 
   * @returns 
   */
  rgbaToColor(rgba: string) {
    const arr = rgba.split("(")[1].split(")")[0].split(",");
    const r = parseInt(arr[0]);
    const g = parseInt(arr[1]);
    const b = parseInt(arr[2]);
    const a = arr[3] == null ? 1 : parseFloat(arr[3]);
    return {
      rgb: "rgb(" + r + "," + g + "," + b + ")",
      alpha: a
    };
  };
  /**
   * 16进制转rgbz
   * @param hex 
   * @param alpha 
   * @returns 
   */
  hexToRgba(hex: string, alpha: number) {
    // let hex = hex.toLowerCase();
    alpha = (alpha == null || alpha == undefined) ? 1 : alpha;
    const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    // 如果是16进制颜色
    if (hex && reg.test(hex)) {
      if (hex.length === 4) {
        let hexNew = "#";
        for (let i = 1; i < 4; i += 1) {
          hexNew += hex.slice(i, i + 1).concat(hex.slice(i, i + 1));
        }
        hex = hexNew;
      }
      //处理六位的颜色值
      let hexChange = [];
      for (let i = 1; i < 7; i += 2) {
        hexChange.push(parseInt("0x" + hex.slice(i, i + 2)));
      }
      return "rgba(" + hexChange.join(",") + "," + alpha + ")";
    }
    return hex;
  };
  /**
   * 生成基本样式
   * @returns 
   */
  createStyle(style: BaseStyle): Style {
    // if (style instanceof BaseStyle) {
    const stroke = style.stroke;
    const pointColor = style.pointColor;
    const image = style.image;
    const text = style.text;
    let imageStyle = null;
    if (image && image.type === 'icon') {
      imageStyle = new Icon({
        src: image?.src,
        // 图片缩放
        scale: image?.scale,
        anchor: image?.anchor,
        crossOrigin: image?.crossOrigin
      })
    } else {
      imageStyle = new CircleStyle({ // 作用于点标注
        radius: 7,
        fill: new Fill({
          color: pointColor,
        })
      })
    }
    return new Style({
      fill: new Fill({
        color: style.fill
      }),
      // 线条颜色
      stroke: new Stroke({
        color: stroke?.color,
        width: stroke?.width,
        lineDash: stroke?.lineDash,
        // lineCap: stroke.lineCap||'round',
        lineDashOffset: stroke?.lineDashOffset,
        // lineJoin: stroke.lineJoin||'round',
        miterLimit: stroke?.miterLimit
      }),
      image: imageStyle,
      text: new Text({
        fill: new Fill({
          color: text?.color
        }),
        text: text?.text,
        scale: text?.scale,
        // font: 'bold italic 16px 仿宋',
        font: text?.font,
        overflow: text?.overflow,
        offsetX: text?.offsetX,
        offsetY: text?.offsetY
      })
    })
    // }
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
  addInteractions(type: any, succession?: boolean, isGeojson: boolean = true): Observable<string | Feature<Geometry>> {
    if (type !== 'None') {
      this.clearInteraction();
      // 
      // const subject = new Subject();
      const subject = new Observable<string | Feature<Geometry>>();
      let drawType = type;
      let geometryFunction;
      // let style = (this.operationLayers.getStyle() as Style);
      if (type === 'Square') {
        drawType = 'Circle';
        geometryFunction = createRegularPolygon(4);
      } else if (type === 'Box') {
        drawType = 'Circle';
        geometryFunction = createBox();
      }
      this.draw = new Draw({
        source: this.mapLayerSource,
        type: drawType,
        geometryFunction,
        // 绘制时候的样式并不是最终的样式
        // style: style ? style : null
      });
      this.map.addInteraction(this.draw);
      this.backout();
      this.createHelpTooltip();
      // this.createMeasureTooltip();
      this.snap = new Snap({ source: this.mapLayerSource });
      this.modify = new Modify({ source: this.mapLayerSource });
      this.draw.on('drawstart', (evt) => {
        this.sketch = evt.feature;
        // let listener: EventsKey = this.sketch.getGeometry().on('change', (change) => {
        //   const result = this.getMeasureData(change.target);
        //   this.measureTooltipElement.innerHTML = result.measureData;
        //   this.measureTooltip.setPosition(result.tooltipCoord);
        // });
      });
      this.draw.on('drawend', (e) => {
        // e.feature.setProperties({ measure: output })
        const result = this.drawendHandle(e, isGeojson);
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
  drawendHandle(e: DrawEvent, isGeojson: boolean = true): Feature<Geometry> | string {
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
  setFeatureStyle(feature: Feature, style: Style | BaseStyle, properties?: object) {
    // TODO:重写这部分
    if (style instanceof Style) {
      feature.setStyle(style);
    } else {
      const stroke = style.stroke;
      const fill = style.fill;
      const image = style.image;
      const text = style.text;
      const newStyleBase: BaseStyle = {
        fill: fill,
        image: image,
        stroke: stroke,
        text: text
      };
      let newStyle = this.createStyle(newStyleBase);
      feature.setStyle(newStyle);
      // const featureStyle: Style = feature.getStyle() as Style;
      // if (featureStyle) {
      //   featureStyle.getStroke().setColor(strokeColor);
      //   featureStyle.getFill().setColor(fillColor);
      //   // featureStyle.getImage().load(imageUrl)
      //   featureStyle.getText() ? featureStyle.getText().setText(text) : featureStyle.setText(new Text({ text, scale: 1.5 }))
      // }
    }
    feature.setProperties(properties)
  }

  /**
   * 获取绘制的所有图层，待验证
   * @returns 
   */
  getAllFeature() {
    // const result = this.source.getFeatures();
    const result = this.operationLayers.getSource().getFeatures();
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
    if (this.helpTooltipElement) {
      this.helpTooltipElement.classList.add('hidden');
      this.helpTooltipElement.innerHTML = '';
    }
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
        this.mapLayerSource.removeFeature(e.selected[0]);
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
    this.mapLayerSource.clear();
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
    this.animateKeys.push((this.mapLayerSource.on('postrender', animate.bind(this)) as EventsKey));
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
      let styleInstance = new Style({
        stroke: new Stroke({
          color: index > 8 ? '#000' : '#ff3300'
        }),
        fill: new Fill({
          color: index > 8 ? 'rgba(255,255,255,.5)' : 'rgba(50,250,3,.5)'
        }),
      });
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
      key = this.mapLayerSource.on('addfeature', (e) => {
        this.addAnimate(e.feature);
      });
    }
    const geo = new GeoJSON().readFeatures(geoPoints);
    this.mapLayerSource.addFeatures(geo);
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
    this.mapLayerSource.addFeatures(line);
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
    this.mapLayerSource.addFeatures(result);
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
    this.mapLayerSource.addFeatures([circleFeature]);
    this.setCenter(centerPoint);
    this.clearInteraction();
  }
  /**
   * 撒正方形
   * @param geoSquare geojson正方形数据
   */
  showSquare(geoSquare: object) {
    const square = new GeoJSON().readFeature(geoSquare);
    this.mapLayerSource.addFeature(square);
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
      position: coordinate,
      element: container,
      id: overlayId,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      }
    });
    overlay.setPositioning(OverlayPositioning.BOTTOM_CENTER);
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
   * 鼠标移动事件提示
   * @param evt 
   * @returns 
   */
  pointerMoveHandler = (evt) => {
    if (evt.dragging) {
      return;
    }
    let helpMsg = '点击开始绘制';

    if (this.sketch) {
      const geom = this.sketch.getGeometry();
      if (geom instanceof Polygon) {
        helpMsg = '单击继续绘制，双击结束绘制';
      } else if (geom instanceof LineString) {
        helpMsg = '单击继续绘制，双击结束绘制';
      } else if (geom instanceof Circle) {
        helpMsg = '再次单击结束绘制';
      }
    }

    this.helpTooltipElement.innerHTML = helpMsg;
    this.helpTooltip.setPosition(evt.coordinate);
    this.helpTooltipElement.classList.remove('hidden');
  };
  /**
   * 创建绘制过程步骤提示语
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
   * 创建绘制过程测量结果
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
   * 格式化长度输出
   * @param line line The line.
   */
  formatLength(line: LineString) {
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
   * 格式化面积
   * @param polygon The polygon.
   */
  formatArea(polygon: Polygon) {
    const area = getArea(polygon, { projection: 'EPSG:4326'/*, radius: 6371008.8*/ });
    let output: string;
    if (area > 10000) {
      output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
    } else {
      output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
    }
    return output;
  };

  /**
   * 获取图形测量数据
   * @param feature 
   */
  getMeasureData(data: Geometry | Feature) {
    let measureData: string = '';
    let tooltipCoord: Coordinate;
    let geom = data;
    if (geom instanceof Feature) {
      geom = geom.getGeometry();
    }
    if (geom instanceof Polygon) {
      measureData = this.formatArea(geom);
      // output = geom.getArea() + '---' + getArea(geom);
      tooltipCoord = geom.getInteriorPoint().getCoordinates();
    } else if (geom instanceof LineString) {
      measureData = this.formatLength(geom);
      // output = geom.getLength() + '---' + getLength(geom);
      tooltipCoord = geom.getLastCoordinate();
    } else if (geom instanceof Circle) {
      const perMeter = this.map.getView().getProjection().getMetersPerUnit();
      const area = Math.PI * Math.pow(geom.getRadius() * perMeter, 2);
      measureData = (Math.round(area) / 100) + ' 平方米';
      tooltipCoord = geom.getCenter();
    }
    return { measureData, tooltipCoord };
  }
}