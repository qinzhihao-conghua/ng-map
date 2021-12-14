import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MapService } from '../map.service';
import { ViewOptions } from 'ol/View';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-service-demo2',
  templateUrl: './service-demo2.component.html',
  styleUrls: ['./service-demo2.component.scss'],
  providers: [MapService]
})
export class ServiceDemo2Component implements OnInit, AfterViewInit {

  constructor(
    private mapService: MapService,
    private http: HttpClient
  ) { }

  coordinate: number[] = [];
  geojson: {
    Points: Array<any>,
    line: object,
    Polygon: object,
    Square: object,
    Box: object,
    Circle: object
  };

  ngOnInit(): void {
    this.http.get('../../assets/geojson.json').subscribe(data => {
      this.geojson = data as any;
    });
  }
  ngAfterViewInit() {
    const viewOptions: ViewOptions = {
      center: [108.316492, 22.818136],
      zoom: 12,
      maxZoom: 20,
      minZoom: 6,
      projection: 'EPSG:4326'
    };
    this.mapService.initMap('demo1', viewOptions);
    this.mapService.clickEvent().subscribe(data => {
      this.coordinate = data.coordinate;
    });
  }
  addInteractions(type: string) {
    this.mapService.addInteractions(type).subscribe(data => {
      console.log('绘制结果', data);
    });
  }
  deleteLayer() {
    this.mapService.deleteLayer().subscribe(data => {
      console.log('删除结果', data);
    });
  }
  clearLayer() {
    this.mapService.clearLayer();
  }
  addPoint() {
    this.mapService.showPoint(this.geojson.Points);
  }
  showPolyline() {
    this.mapService.showPolyline(this.geojson.line);
  }
  showPolygon() {
    this.mapService.showPolygon(this.geojson.Polygon);
  }
  showCircle() {
    this.mapService.showCircle([108.41378967683895, 22.793760087092004], 2500);
  }
  showSquare() {
    this.mapService.showSquare(this.geojson.Square);
  }
  clearInteraction() {
    this.mapService.clearInteraction();
  }
  editLayer() {
    this.mapService.editLayer().subscribe(data => {
      console.log('编辑结果', data);
    });
  }
}
