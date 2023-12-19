import { Component, OnInit } from '@angular/core';
import { ViewOptions } from 'ol/View';
import { OlMapService } from '../service/ol-map-service';
import { Map } from 'ol';
import * as shanghai from '../../assets/shanghai.json';

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
    const viewOptions: ViewOptions = {
      // center: [121.471325, 31.231929],
      center: [108.316492, 22.818136],
      zoom: 12,
      maxZoom: 20,
      minZoom: 1,
      projection: 'EPSG:4326'
    };
    this.mapInstance = new OlMapService();
    this.map = this.mapInstance.initMap('map-container', viewOptions);
  }

  dataToMap() {
    this.mapInstance.showPolygon((shanghai as any).default);
  }
  clickToGetFeature() {
    this.mapInstance.activeFeature();
  }

}
