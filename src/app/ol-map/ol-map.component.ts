import { Map, View } from 'ol';
import { defaults } from 'ol/control';
import Attribution from 'ol/control/Attribution';
import MousePosition from 'ol/control/MousePosition';
import { fromLonLat, toLonLat, transform } from 'ol/proj';
import Point from 'ol/geom/Point';

import { Circle as CircleStyle, Fill, Stroke, Style, Icon } from 'ol/style';
import { Draw, Modify, Snap, Select } from 'ol/interaction';
import { createBox, createRegularPolygon, DrawEvent } from 'ol/interaction/Draw';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { click, pointerMove, altKeyOnly } from 'ol/events/condition';

import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SelectEvent } from 'ol/interaction/Select';
import Feature from 'ol/Feature';
import { easeOut } from 'ol/easing';
import { getVectorContext } from 'ol/render';
import { unByKey } from 'ol/Observable';

@Component({
  selector: 'app-ol-map',
  templateUrl: './ol-map.component.html',
  styleUrls: ['./ol-map.component.scss']
})
export class OlMapComponent implements OnInit, AfterViewInit {

  constructor() { }

  @Output()
  getCoordinate = new EventEmitter<number[]>();
  map: Map;
  coordinate: number[] = [];

  // 栅格图层
  raster = new TileLayer({
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
        color: 'rgba(255, 255, 255, 0.5)',
      }),
      stroke: new Stroke({
        color: '#ff0000',
        width: 2,
      }),
      image: new CircleStyle({ // 作用于点标注
        radius: 7,
        fill: new Fill({
          color: '#0000ff',
        }),
      }),
    }),
  });

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
  mapCenter = fromLonLat([108.316492, 22.818136]);
  points = [
    [12058417.02420523, 2611140.7222976275],
    [12059854.039403923, 2608327.839423466],
    [12064501.410956929, 2611935.6663420903]
  ];

  ngOnInit() {
  }
  ngAfterViewInit(): void {
    this.map = new Map({
      target: 'map',
      controls: defaults().extend([
        // 鼠标移入显示坐标
        new MousePosition({ projection: 'EPSG:4326' })
      ]),
      layers: [this.raster, this.vector],
      view: new View({
        center: this.mapCenter,
        zoom: 12,
        maxZoom: 20,
        minZoom: 6,
        projection: 'EPSG:3857'
      })
    });
    this.map.on('singleclick', this.mapSingleclick.bind(this));
    // 可编辑图层
    this.map.addInteraction(this.modify);
    // this.map.addInteraction(this.select);
    // this.addInteractions(this.typeDraw);
  }
  // 地图单击
  mapSingleclick(event) {
    // this.coordinate = transform(event.coordinate, 'EPSG:3857', 'EPSG:4326');
    this.coordinate = event.coordinate;
    this.getCoordinate.emit(this.coordinate);
  }
  // 添加交互图层
  // https://openlayers.org/en/latest/examples/draw-and-modify-features.html
  addInteractions(typeDraw: any, rect?: string) {
    if (typeDraw !== 'None') {
      // 矩形绘制地址
      // https://openlayers.org/en/latest/examples/draw-shapes.html
      let geometryFunction;
      if (rect && rect === 'Square') {
        geometryFunction = createRegularPolygon(4);
      } else if (rect && rect === 'Box') {
        geometryFunction = createBox();
      }
      this.draw = new Draw({
        source: this.source,
        type: typeDraw,
        geometryFunction
      });
      this.map.addInteraction(this.draw);
      this.snap = new Snap({ source: this.source });
      this.map.addInteraction(this.snap);
      this.draw.on('drawend', (e) => {
        console.log('绘制结果', (e.feature.getGeometry() as any).getCoordinates());
        // console.log('绘制结果', (e.feature.getGeometry() as any).getCenter());
        // console.log('绘制结果', e.feature);
      });
      this.modify.on('modifyend', (e) => {
        console.log('修改结果', (e.features.item(0).getGeometry() as any).getCoordinates());
      });
    }
  }
  // 选中图层，失去选中焦点也会触发
  changeInteraction(clickType: string, callback?: (e: SelectEvent) => void) {
    this.clearInteraction();
    // 删除前需要先将修改功能取消，否则出现吸附在边缘时进行删除时报错
    this.map.removeInteraction(this.modify);
    if (this.select !== null) {
      this.map.removeInteraction(this.select);
    }
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
        const featureslen = e.target.getFeatures().getLength();
        const selected = e.selected.length;
        const deselected = e.deselected.length;
        // this.map.removeLayer(e);
        // console.log('选中的图层', e);
        // console.log('要素个数', featureslen, '选中个数', selected, '删除选中个数', deselected);
        if (callback) {
          callback(e);
        }
      });
    }
  }
  // 选中并删除图层
  selectLayer() {
    this.changeInteraction('singleclick', (e) => {
      console.log('选中动作', e);
      if (e.selected.length > 0) {
        this.vector.getSource().removeFeature(e.selected[0]);
        // this.map.removeInteraction(this.select);
        this.select.getFeatures().remove(e.selected[0]);
      }
    });
  }
  // 删除图层，未实现高亮选中后点击删除
  deleteLayer() {
    this.changeInteraction('pointermove', (e) => {
      const select = e;
      this.select.on('click', () => {
        this.select.getFeatures().forEach(item => {
          this.vector.getSource().removeFeature(item);
          this.select.getFeatures().remove(item);
        });
      });
    });
  }
  // 清空图层
  clearLayer() {
    // 最好先解除select事件
    // this.map.removeInteraction(this.select);
    // 清空绘制的图层
    // this.vector.getSource().clear();
    this.clearInteraction();
    this.source.clear();
  }

  // 交互类型
  changeDrawing(type: any, rect?: string) {
    this.clearInteraction();
    this.addInteractions(type, rect);
  }
  // 清除交互
  clearInteraction() {
    this.map.removeInteraction(this.draw);
    this.map.removeInteraction(this.snap);
    this.map.removeInteraction(this.select);
  }

  // 自定义动画
  // https://openlayers.org/en/latest/examples/feature-animation.html
  addPoint(points?: Array<any>) {
    const features = [];
    this.points.forEach(item => {
      features.push(new Feature(new Point(item)));
    });
    this.source.on('addfeature', (e) => {
      this.addAnimate(e.feature);
    });
    this.source.addFeatures(features);
  }

  addAnimate(feature) {
    let start = new Date().getTime();
    const duration = 3000;
    const that = this;
    // 进行地图水波渲染
    this.raster.on('postrender', (event) => {
      animate(event);
    });
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
          // fill: new Fill({
          //   color: 'rgba(255, 0, 0, 0.5)',
          // }),
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
      that.map.render();
    }
  }

}
