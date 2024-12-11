import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { fromLonLat } from 'ol/proj';
import { Style, Fill, Stroke } from 'ol/style';
import { Polygon } from 'ol/geom';
import shanghai from '../../assets/shanghai.json';

@Component({
  selector: 'app-area-map',
  templateUrl: './area-map.component.html',
  styleUrls: ['./area-map.component.scss']
})
export class AreaMapComponent implements OnInit {

  map: Map;

  constructor() { }

  ngOnInit(): void {
  }
  ngAfterViewInit() {
    this.initMap();
    this.loadShanghaiDistricts();
  }

  private initMap() {
    this.map = new Map({
      target: 'map',
      layers: [
        new VectorLayer({
          source: new VectorSource(),
          style: this.featureStyle.bind(this)
        })
      ],
      view: new View({
        center: [121.4737, 31.2304], // 上海中心坐标
        zoom: 10,
        projection: 'EPSG:4326'
      })
    });
  }

  private loadShanghaiDistricts() {
    const geojsonFormat = new GeoJSON();
    const features = geojsonFormat.readFeatures(shanghai);
    // @ts-ignore
    const vectorSource = this.map.getLayers().item(0).getSource() as VectorSource;
    vectorSource.addFeatures(features);
  }

  private featureStyle(feature: any) {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 256;
    const context = canvas.getContext('2d');

    const gradient = context.createLinearGradient(0, 0, 1, 0);
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(1, 'blue');

    context.fillStyle = gradient;
    context.fillRect(0, 0, 1, 256);

    return new Style({
      fill: new Fill({
        color: `rgba(${context.getImageData(0, 0, 1, 1).data.join(',')})`
      }),
      stroke: new Stroke({
        color: 'black',
        width: 1
      })
    });
  }
}

