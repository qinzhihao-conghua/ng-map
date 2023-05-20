import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Feature, Map } from 'ol';
import { ViewOptions } from 'ol/View';
import { GeoJSON } from 'ol/format';
import { OlMapService } from 'src/app/service/ol-map-service';
import Point from 'ol/geom/Point';
import { Circle, Fill, Icon, Stroke, Style, Text } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { transform } from 'ol/proj';

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
  currentFeature: Feature;

  ngOnInit(): void {
    this.http.get('../../assets/geojson-collection.json').subscribe(data => {
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
    this.mapService.clickToGetFeature().subscribe(data => {
      // this.coordinate = data.coordinate;
      // 这种方式展示popup不是很理想，比较理想的方式是通过select去获取，但是需要多处理一些
      // const features = this.map.getFeaturesAtPixel(data.pixel, { hitTolerance: 1 });
      console.log('点击返回', data);
      // if (features.length > 0) {
      console.log('features属性', data.getProperties());
      console.log('转成geojson', new GeoJSON().writeFeature(data as Feature));
      const dom = document.getElementById('popup');
      dom.style.display = 'block';
      const content = document.getElementById('popup-content');
      content.innerHTML = `
            <p>测试popup</p>
            <p>测试popup</p>
            <p>测试popup</p>
            <p>测试popup</p>
          `;
      // this.mapService.showPopup(dom, data.coordinate, 'test');
      // }
    });
  }
  closePopup() {
    this.mapService.closeClickEvent();
    this.mapService.closeOverlay('test');
  }
  addInteractions(type: string) {
    this.mapService.addInteractions(type).subscribe(data => {
      console.log('绘制结果', data);
      this.currentFeature = new GeoJSON().readFeature(data);
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
  addPoint1() {
    // const iconFeature = new Feature({
    //   geometry: new Point([108.316492, 22.818136]),
    // });
    const iconFeature = new Feature(new Point([108.316492, 22.818136]));

    const iconStyle = new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: 'assets/location.jpg',
        scale: .15
      })
    });

    iconFeature.setStyle([iconStyle]);
    const vectorSource = new VectorSource({
      features: [iconFeature],
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource
    });
    this.mapService.source.addFeature(iconFeature);
    // this.map.addLayer(vectorLayer);
  }

  addPoint2() {
    const iconFeature = new Feature({
      geometry: new Point([108.316492, 22.818136]),
    });

    const iconStyle = new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: 'assets/location.jpg',
        scale: .15
      })
    });

    iconFeature.setStyle([iconStyle]);
    const vectorSource = new VectorSource({
      features: [iconFeature],
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource
    });
    this.map.addLayer(vectorLayer);
  }
  showPolyline() {
    this.mapService.showPolyline(this.geojson.line);
  }
  showPolygon() {
    this.mapService.showPolygon(this.geojson.Polygon);
  }
  showCircle() {
    // this.mapService.showCircle({ center: [108.41378967683895, 22.793760087092004], radius: 2500 }, 'EPSG:4326');
    this.mapService.showPolygon(this.geojson.Circle);
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
    this.mapService.clickToGetFeature().subscribe(data => {
      // points.push(data.coordinate)
      console.log('点击返回', data);
    })
  }
  getAllFeatures() {
    this.mapService.getAllFeature()
  }

  setFeatureStyle() {
    this.currentFeature.setStyle(new Style({
      stroke: new Stroke({
        color: '#000',
        width: 6,
        lineDash: [4, 8]
      }),
      text: new Text({
        text: '666'
      })
    }));
    // this.map.getLayers().changed();
    // this.map.changed();
    this.currentFeature.changed();
  }

}
