import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ViewOptions } from 'ol/View';
import { Map } from 'ol';
import { OlMapService } from 'src/app/service/ol-map-service';

@Component({
  selector: 'app-ol-plot-demo',
  templateUrl: './ol-plot-demo.component.html',
  styleUrls: ['./ol-plot-demo.component.scss'],
  providers: [OlMapService]
})
export class OlPlotDemoComponent implements OnInit, AfterViewInit {

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

}
