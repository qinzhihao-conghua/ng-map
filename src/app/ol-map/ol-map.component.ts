import { Map, View } from 'ol';
import { defaults } from 'ol/control';
import Attribution from 'ol/control/Attribution';
import MousePosition from 'ol/control/MousePosition';
import { fromLonLat, toLonLat, transform } from 'ol/proj';
import Point from 'ol/geom/Point';

import { Circle as CircleStyle, Fill, Stroke, Style, Icon } from 'ol/style';
import { Draw, Modify, Snap, Select, DoubleClickZoom, Interaction } from 'ol/interaction';
import { createBox, createRegularPolygon, DrawEvent } from 'ol/interaction/Draw';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Tile as TileLayer, Vector, Vector as VectorLayer } from 'ol/layer';
import { click, pointerMove, altKeyOnly } from 'ol/events/condition';

import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SelectEvent } from 'ol/interaction/Select';
import Feature from 'ol/Feature';
import { easeOut } from 'ol/easing';
import { getVectorContext } from 'ol/render';
import { unByKey } from 'ol/Observable';
import LineString from 'ol/geom/LineString';
import Polygon from 'ol/geom/Polygon';
import { Circle as CircleGemo, Geometry } from 'ol/geom';
import { GeoJSON } from 'ol/format';
import { defaults as interactionDefaults } from 'ol/interaction';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-ol-map',
  templateUrl: './ol-map.component.html',
  styleUrls: ['./ol-map.component.scss']
})
export class OlMapComponent implements OnInit, AfterViewInit {

  constructor(
    private http: HttpClient
  ) { }

  @Output()
  getCoordinate = new EventEmitter<number[]>();
  map: Map;
  coordinate: number[] = [];

  geojsonData: {
    Points: Array<any>,
    line: object,
    Polygon: object,
    Square: object,
    Box: object,
    Circle: object
  };

  // 栅格图层
  tileLayer = new TileLayer({
    source: new OSM({
      attributions: 'xxxx股份有限公司'
    }),
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
  // 修改
  modify = new Modify({ source: this.source });
  // 绘制对象
  draw: Draw;
  // 鼠标捕捉，用户修改
  snap: Snap;
  // mapCenter = fromLonLat([108.316492, 22.818136]);
  mapCenter = [108.316492, 22.818136];
  // 水纹动画keys
  animateKeys = [];

  // 要改变鼠标的样式，直接修改鼠标在目标元素上的cursor样式属性
  // 修改以及吸附效果
  // https://openlayers.org/en/latest/examples/snap.html

  ngOnInit() {
    this.http.get('../../assets/geojson.json').subscribe(data => {
      this.geojsonData = data as any;
    });
  }
  ngAfterViewInit(): void {
    this.map = new Map({
      target: 'map',
      controls: defaults().extend([
        // 鼠标移入显示坐标
        new MousePosition({ projection: 'EPSG:4326' })
      ]),
      // 取消双击放大
      interactions: interactionDefaults({ doubleClickZoom: false }),
      layers: [this.tileLayer, this.vector],
      view: new View({
        center: this.mapCenter,
        zoom: 12,
        maxZoom: 20,
        minZoom: 6,
        projection: 'EPSG:4326'
      })
    });
    this.map.on('singleclick', this.mapSingleclick.bind(this));
    // 可编辑图层，加入这句才能进行编辑
    this.map.addInteraction(this.modify);
  }
  // 地图单击
  mapSingleclick(event) {
    // this.coordinate = transform(event.coordinate, 'EPSG:3857', 'EPSG:4326');
    this.coordinate = event.coordinate;
    this.getCoordinate.emit(this.coordinate);
  }
  // 添加交互图层
  // https://openlayers.org/en/latest/examples/draw-and-modify-features.html
  addInteractions(type: string | any) {
    if (type !== 'None') {
      let drawType = type;
      // 矩形绘制地址
      // https://openlayers.org/en/latest/examples/draw-shapes.html
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
        // this.clearInteraction();
      });
    }
  }
  // 选中图层，失去选中焦点也会触发
  changeInteraction(clickType: string, callback?: (e: SelectEvent) => void) {
    this.clearInteraction();
    let select: Select;
    if (clickType === 'singleclick') {
      select = new Select();
    } else if (clickType === 'click') {
      select = new Select({ condition: click });
    } else if (clickType === 'pointermove') {
      select = new Select({ condition: pointerMove });
    } else if (clickType === 'altclick') {
      select = new Select({
        condition: (mapBrowserEvent) => {
          return click(mapBrowserEvent) && altKeyOnly(mapBrowserEvent);
        },
      });
    } else {
      select = null;
    }
    if (select !== null) {
      this.map.addInteraction(select);
      select.on('select', (e: SelectEvent) => {
        // tslint:disable-next-line: no-unused-expression
        callback ? callback(e) : e;
      });
    }
  }
  // 选中并删除图层
  selectLayer() {
    // 移入高亮
    const select = new Select({ condition: pointerMove });
    this.map.addInteraction(select);
    this.changeInteraction('singleclick', (e) => {
      console.log('选中动作', e);
      if (e.selected.length > 0) {
        this.vector.getSource().removeFeature(e.selected[0]);
      }
    });
  }
  // 清空图层
  clearLayer() {
    // 解除编辑相关
    this.clearInteraction();
    // 清除水纹动画，但是会影响绘制单独的点
    unByKey(this.animateKeys);
    this.source.clear();
    this.map.render();
  }

  // 交互类型
  changeDrawing(type: string) {
    this.clearInteraction();
    this.addInteractions(type);
  }
  // 清除交互
  clearInteraction() {
    // 清除编辑样式
    this.map.removeInteraction(this.draw);
    this.map.removeInteraction(this.modify);
    // 清除吸附效果
    this.map.removeInteraction(this.snap);
    // 清除绘制的图层
    this.map.removeInteraction(this.highlightSelect);
  }

  // 自定义动画
  // https://openlayers.org/en/latest/examples/feature-animation.html
  // 水纹动画
  addAnimate(feature: Feature<Geometry>) {
    console.log('执行');
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
      // tell OpenLayers to continue postrender animation
      this.map.render();
    }
  }
  // 撒点
  addPoint(points?: Array<any>) {
    // const features = [];
    // points = [
    //   [12058417.02420523, 2611140.7222976275],
    //   [12059854.039403923, 2608327.839423466],
    //   [12064501.410956929, 2611935.6663420903]
    // ];
    // points.forEach(item => {
    //   features.push(new Feature(new Point(item)));
    // });
    // 监听导致绘制点的时候也执行添加动画
    const key = this.source.on('addfeature', (e) => {
      this.addAnimate(e.feature);
    });
    const geoPoints = this.geojsonData.Points;
    geoPoints.forEach(point => {
      const geo = new GeoJSON().readFeatures(point);
      this.source.addFeatures(geo);
    });
    this.clearInteraction();
    // 撒点完成之后解除事件绑定，防止在绘制其他图形时产生动画
    unByKey(key);
  }

  // 撒线
  showPolyline() {
    // const points = [
    //   [12049917.226310018, 2609978.87970096],
    //   [12055145.519161358, 2606768.524512983],
    //   [12059640.016657794, 2611782.79228552],
    //   [12064654.285013499, 2607899.792764871]
    // ];
    // const lineFeature = new Feature({ // 路线
    //   geometry: new LineString(points),
    // });
    const line = new GeoJSON().readFeatures(this.geojsonData.line);
    // 将所有矢量图层添加进去
    this.source.addFeatures(line);
    this.clearInteraction();
  }
  // 撒面
  showPolygon() {
    // const points = [[
    //   [12047838.13879076, 2611110.14736968],
    //   [12048082.737631174, 2608450.139135257],
    //   [12050956.769778064, 2608297.265078686],
    //   [12051751.714405693, 2610804.399256539],
    //   [12049489.178485086, 2612088.540398661],
    //   [12047838.13879076, 2611110.14736968]
    // ]];
    // // 多边形的数据格式是[[[lng,lat],[lng,lat]……]]外围两个中括号
    // const polygonFeature = new Feature({ // 路线
    //   geometry: new Polygon(points)
    // });
    const polygon = new GeoJSON().readFeature(this.geojsonData.Polygon);
    this.source.addFeature(polygon);
    // 撒完关闭编辑状态
    this.clearInteraction();
  }
  // 撒圆
  showCircle() {
    const centerPoint = transform([108.41378967683895, 22.793760087092004], 'EPSG:4326', 'EPSG:3857');
    // const centerPoint = [12061321.63011373, 2611905.0925804796];
    const radius: any = 2500;
    const circleFeature = new Feature({
      // geometry: new CircleGemo(centerPoint, radius)
      // 使用这个方法绘制圆必须将坐标转成3857的，因为第二个参数半径单位是米
      geometry: new CircleGemo(centerPoint, radius).transform('EPSG:3857', 'EPSG:4326')
    });
    // 将所有矢量图层添加进去
    this.source.addFeature(circleFeature);
    this.clearInteraction();
  }
  // 撒正方形
  showSquare() {
    // const points = [[
    //   [12052913.558168698, 2609489.6820201334],
    //   [12051445.967458889, 2612852.9124310184],
    //   [12048082.737048004, 2611385.321721209],
    //   [12049550.327757813, 2608022.091310324],
    //   [12052913.558168698, 2609489.6820201334]
    // ]];
    // const polygonFeature = new Feature({ // 路线
    //   geometry: new Polygon(points)
    // });
    const square = new GeoJSON().readFeature(this.geojsonData.Square);
    this.source.addFeature(square);
    this.clearInteraction();
  }

  // 编辑
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
