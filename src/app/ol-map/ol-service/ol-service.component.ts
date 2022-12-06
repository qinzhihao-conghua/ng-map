import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Feature, Map } from 'ol';
import { ViewOptions } from 'ol/View';
import { GeoJSON } from 'ol/format';
import { OlMapService } from 'src/app/service/ol-map-service';
import Point from 'ol/geom/Point';

@Component({
  selector: 'app-ol-service',
  templateUrl: './ol-service.component.html',
  styleUrls: ['./ol-service.component.scss'],
  providers: [OlMapService]
})
export class OlServiceComponent implements OnInit {

  constructor(
    private mapService: OlMapService,
    private http: HttpClient
  ) { }

  coordinate: number[] = [];
  geojson: {
    Points: Array<any>,
    line: object,
    Polygon: object,
    Square: object,
    Box: object,
    Circle: object,
    HeatData: object,
    route: Array<any>
  };
  map: Map;
  markText = '开始移动';
  heatMapLayer = null;
  clusterMapLayer = null;
  markerAnimationLayer = null;
  markDisabled = true;

  ngOnInit(): void {
    this.http.get('../../assets/geojson.json').subscribe(data => {
      this.geojson = data as any;
      console.log('geojson数据', data);
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
  }
  openPopup() {
    this.mapService.clearInteraction();
    this.mapService.clickEvent().subscribe(data => {
      this.coordinate = data.coordinate;
      // 这种方式展示popup不是很理想，比较理想的方式是通过select去获取，但是需要多处理一些
      const features = this.map.getFeaturesAtPixel(data.pixel, { hitTolerance: 1 });
      console.log('点击返回', features);
      if (features.length > 0) {
        console.log('features属性', features[0].getProperties());
        console.log('转成geojson', new GeoJSON().writeFeature(features[0] as Feature));
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
  }
  closePopup() {
    this.mapService.closeClickEvent();
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
    this.closeHeatMap();
    this.closeClusterMap();
    this.closeMarkerAnimation();
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
    this.mapService.showCircle([108.41378967683895, 22.793760087092004], 2500, 'EPSG:4326');
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

  showHeatMap() {
    this.heatMapLayer = this.mapService.showHeatMap(this.geojson.HeatData[0]);
  }
  closeHeatMap() {
    this.mapService.closeHeatMap(this.heatMapLayer);
  }
  showClusterMap() {
    const features = []
    for (let i = 0; i < 20000; ++i) {
      const coordinates = [108 + Math.random(), 22 + Math.random()];
      features[i] = new Feature(new Point(coordinates));
    }
    const result = this.mapService.showClusterMap(features);
    this.clusterMapLayer = result.layer;
  }
  closeClusterMap() {
    this.mapService.closeClusterMap(this.clusterMapLayer)
  }
  markerAnimation() {
    this.markDisabled = false;
    this.markerAnimationLayer = this.mapService.markerAnimation(this.geojson.route);
  }
  closeMarkerAnimation() {
    this.mapService.closeMarkerAnimation(this.markerAnimationLayer)
  }
  changeAnimation() {
    if (this.markDisabled) {
      this.mapService.stopAnimation();
      this.markText = '开始移动'
      this.markDisabled = !this.markDisabled;
    } else {
      this.markText = '停止移动';
      this.mapService.startAnimation();
      this.markDisabled = !this.markDisabled;
    }
  }
  mapClick() {
    const points = [];
    this.mapService.clickEvent().subscribe(data => {
      points.push(data.coordinate)
      console.log('点击返回', points);
    })
  }
  getAllFeatures() {
    this.mapService.getAllFeature()
  }

}
