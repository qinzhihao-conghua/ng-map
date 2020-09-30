import { Map, View } from 'ol';
import { defaults } from 'ol/control';
import Attribution from 'ol/control/Attribution';
import MousePosition from 'ol/control/MousePosition';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat, toLonLat, transform } from 'ol/proj';
import OSM from 'ol/source/OSM';

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
  ngOnInit() {
  }
  ngAfterViewInit(): void {
    const that = this;
    this.map = new Map({
      target: 'map',
      controls: defaults().extend([
        // 鼠标移入显示坐标
        new MousePosition({ projection: 'EPSG:4326' })
      ]),
      layers: [
        new TileLayer({
          source: new OSM({
            attributions: 'xxxx股份有限公司'
          })
        })
      ],
      view: new View({
        center: fromLonLat([108.316492, 22.818136]),
        zoom: 12,
        maxZoom: 20,
        minZoom: 6,
        projection: 'EPSG:3857'
      })
    });
    this.map.on('singleclick', (event) => {
      console.log(event.coordinate);
      that.coordinate = transform(event.coordinate, 'EPSG:3857', 'EPSG:4326');
      that.getCoordinate.emit(that.coordinate);
    });
  }

}
