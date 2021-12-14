import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MapService } from '../map.service';
import { ViewOptions } from 'ol/View';
import { HttpClient } from '@angular/common/http';
import { Map } from 'ol';

@Component({
  selector: 'app-service-demo1',
  templateUrl: './service-demo1.component.html',
  styleUrls: ['./service-demo1.component.scss'],
  providers: [MapService]
})
export class ServiceDemo1Component implements OnInit, AfterViewInit {

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
  map: Map;

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
    this.map = this.mapService.initMap('demo1', viewOptions);
    this.mapService.clickEvent().subscribe(data => {
      this.coordinate = data.coordinate;
      // 这种方式展示popup不是很理想，因为在绘制开始和结束的时候都会触发点击事件
      // 比较理想的方式是通过select去获取，但是需要多处理一些
      const features = this.map.getFeaturesAtPixel(data.pixel, { hitTolerance: 1 });
      console.log('点击', features);
      if (features.length > 0) {
        const dom = document.getElementById('popup');
        dom.style.display = 'block';
        const content = document.getElementById('popup-content');
        content.innerHTML = `
            <p>测试popup</p>
            <p>测试popup</p>
            <p>测试popup</p>
            <p>测试popup</p>
          `;
        this.mapService.showPopup(dom, data.coordinate, 'test');
      }
    });
    // this.mapService.getCoordinateByClick().subscribe(data => {
    // });
  }
  closePopup() {
    this.mapService.closeOverlay('test');
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
