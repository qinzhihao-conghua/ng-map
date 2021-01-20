import { Map, View } from 'ol';
import { defaults } from 'ol/control';
import Attribution from 'ol/control/Attribution';
import MousePosition from 'ol/control/MousePosition';
import { fromLonLat, toLonLat, transform } from 'ol/proj';
import Point from 'ol/geom/Point';

import { Circle as CircleStyle, Fill, Stroke, Style, Icon } from 'ol/style';
import { Draw, Modify, Snap } from 'ol/interaction';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';

import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';

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
  source = new VectorSource();
  // 矢量图层
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


  modify = new Modify({ source: this.source });
  draw: Draw;
  snap: Snap;
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
    // this.addInteractions(this.typeDraw);
  }
  // 添加箭头线，失败
  styleFunction = (feature) => {
    const geometry = feature.getGeometry();
    const styles = [
      // linestring
      new Style({
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
      })
    ];

    geometry.forEachSegment((start, end) => {
      const dx = end[0] - start[0];
      const dy = end[1] - start[1];
      const rotation = Math.atan2(dy, dx);
      // arrows
      styles.push(
        new Style({
          geometry: new Point(end),
          image: new Icon({
            src: 'data/arrow.png',
            anchor: [0.75, 0.5],
            rotateWithView: true,
            rotation: -rotation,
          }),
        })
      );
    });

    return styles;
  }
  // 地图单击
  mapSingleclick(event) {
    this.coordinate = transform(event.coordinate, 'EPSG:3857', 'EPSG:4326');
    this.getCoordinate.emit(this.coordinate);
  }
  // 添加交互图层
  addInteractions(typeDraw: any) {
    if (typeDraw !== 'None') {
      this.draw = new Draw({
        source: this.source,
        type: typeDraw,
      });
      this.map.addInteraction(this.draw);
      this.snap = new Snap({ source: this.source });
      this.map.addInteraction(this.snap);
    }
  }
  // 交互类型
  changeDrawing(type: any) {
    this.map.removeInteraction(this.draw);
    this.map.removeInteraction(this.snap);
    this.addInteractions(type);
  }

}
