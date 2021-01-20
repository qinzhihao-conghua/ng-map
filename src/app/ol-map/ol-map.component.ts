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
import Feature from 'ol/render/Feature';

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
        // console.log('绘制结果', (e.feature.getGeometry() as any).getCoordinates());
        // console.log('绘制结果', (e.feature.getGeometry() as any).getCenter());
        console.log('绘制结果', e.feature);
      });
      this.modify.on('modifyend', (e) => {
        console.log('修改结果', (e.features.item(0).getGeometry() as any).getCoordinates());
      });
    }
  }
  // 选中图层，失去选中焦点也会触发
  changeInteraction(clickType: string, callback?: (e: SelectEvent) => void) {
    this.map.removeInteraction(this.draw);
    this.map.removeInteraction(this.snap);
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
  // selectLayer() {
  //   this.changeInteraction('singleclick', (e) => {
  //     console.log('选中动作', e);
  //     if (e.selected.length > 0) {
  //       this.vector.getSource().removeFeature(e.selected[0]);
  //       this.map.removeInteraction(this.select);
  //     }
  //   });
  // }
  // 删除图层
  deleteLayer() {
    this.changeInteraction('pointermove', (e) => {
      const select = e;
      this.map.on('singleclick', (single) => {
        if (select.selected.length > 0) {
          this.vector.getSource().removeFeature(select.selected[0]);
          this.map.removeInteraction(this.select);
          // this.map.addInteraction(this.modify);
        }
      });
      // 最好先解除select事件
      // this.map.removeInteraction(this.select);
      // 清空绘制的图层
      // this.vector.getSource().clear();
    });
  }

  // 交互类型
  changeDrawing(type: any, rect?: string) {
    this.map.removeInteraction(this.draw);
    this.map.removeInteraction(this.snap);
    this.map.removeInteraction(this.select);
    this.addInteractions(type, rect);
  }

}
