import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as turf from '@turf/turf';
import { ViewOptions } from 'ol/View';
import { Map } from 'ol';
import { Select } from 'ol/interaction';
import { GeoJSON } from 'ol/format';
import { OlMapService } from 'src/app/service/ol-map-service';

@Component({
  selector: 'app-turf-demo',
  templateUrl: './turf-demo.component.html',
  styleUrls: ['./turf-demo.component.scss'],
  providers: [OlMapService]
})
export class TurfDemoComponent implements OnInit, AfterViewInit {

  constructor(
    private mapService: OlMapService,
  ) { }

  map: Map;

  ngOnInit(): void {
  }
  ngAfterViewInit() {
    const viewOptions: ViewOptions = {
      center: [108.316492, 22.818136],
      zoom: 12,
      maxZoom: 20,
      minZoom: 6,
      projection: 'EPSG:4326'
    };
    this.map = this.mapService.initMap('turf', viewOptions);
  }
  addInteractions(type: string) {
    this.mapService.addInteractions(type).subscribe(data => {
      console.log('绘制结果', data);
    });
  }
  clearInteraction() {
    this.mapService.clearInteraction();
  }
  getArea() {
    const selectLayer = new Select();
    this.map.addInteraction(selectLayer);
    selectLayer.on('select', e => {
      // e.target.getFeatures().getArray()[0]注意target是any类型
      const feature = new GeoJSON().writeFeature(e.selected[0]);
      console.log('选中', feature);
      const coo = JSON.parse(feature).geometry.coordinates;
      console.log('坐标', coo);
      const polygon = turf.polygon(coo);
      const area = turf.area(polygon);
      console.log('面积', area);
    });
  }
  getCenter() {

  }

}
