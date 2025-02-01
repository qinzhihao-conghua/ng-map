import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Map } from 'ol';
import Feature from 'ol/Feature';
import { ViewOptions } from 'ol/View';
import { Style, Icon } from 'ol/style';
import { OlMapService } from '../../service/ol-map-service';
import { HttpClient } from '@angular/common/http';
import { GeoJSON } from 'ol/format';
import Point from 'ol/geom/Point';
import * as turf from '@turf/turf';
import { BaseStyle, TextStyle } from '../../service/base-type';
import { Circle } from 'ol/geom';
import { GeoJsonCollectionType } from '../../service/geojson-type';

@Component({
  selector: 'map-plot',
  templateUrl: './map-plot.component.html',
  styleUrls: ['./map-plot.component.scss'],
  // providers: [OlMapService]
})
export class MapPlotComponent implements OnInit {

  /**
   * 覃智浩 2022年10月11日 14:53:36
   */
  constructor(
    private http: HttpClient,
    // private mapService: OlMapService,
  ) { }

  /**传递进来要上图的geojson数据 */
  @Input() geojsonData: any;
  /**展示右侧工具 */
  @Input() showTools = true;
  /**绘制后返回的这个feature */
  @Output() drawBackFeature = new EventEmitter();
  /**绘制后返回图上所有features */
  @Output() drawBackAllFeatures = new EventEmitter();

  map: Map;
  acticeType: string = null;
  mapInstance: OlMapService = null;
  currentPopuId: string = null;
  hiddenPanel: boolean = true;
  currentFeature: Feature = null;
  layerDesc: string = null;
  layerName: string = null;
  // strokeColors: Array<string> = ['#E80505', '#FCCF31', '#F8D800', '#49C628', '#32CCBC', '#0396FF', '#3813C2'];
  // fillColors: Array<string> = [
  //   'rgba(255, 255, 255, .5)',
  //   'rgba(232, 5, 5, .3)',
  //   'rgba(252, 207, 49, .3)',
  //   'rgba(248, 215, 0, .3)',
  //   'rgba(74, 198, 40, .3)',
  //   'rgba(50, 204, 189, .3',
  //   'rgba(3, 150, 255, .3)',
  //   'rgba(57, 19, 194, .3)'
  // ];
  currentStrokeColor: string = '#E80505';
  currentFillColor: string = '#ffffff';
  fillColorOpacity: number = 0.5;
  strokeColorOpacity: number = 1;
  strokeWidth: number = 2;
  lineDash: string = '1';
  textStyle: TextStyle = {
    text: '',
    font: '10px sans-serif',
  };

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
  // map: Map;
  markText = '开始移动';
  heatMapLayer = null;
  clusterMapLayer = [];
  markerAnimationLayer = null;
  markDisabled = true;
  fontType: Array<string> = ['宋体', '微软雅黑', '仿宋', '黑体', '方正', '华文隶书', '等线', '华文行楷', 'sans-serif'];
  fontSize: number = 16;
  fontColr: string = '#000000';
  fontFamily: string = '黑体';
  fontItalic: boolean = false;
  fontWeight: boolean = false;
  lineDashType: Array<any> = [
    { key: '1', code: [], value: '—————' },
    { key: '2', code: [5, 5], value: '...................' },
    { key: '3', code: [10, 10], value: '----------' },
    { key: '4', code: [20, 15], value: '— — —  ' }
  ];

  ngOnInit() {
    this.http.get('../../assets/geojson-collection.json').subscribe(data => {
      this.geojson = data as any;
      console.log('geojson数据', data);
    });
  }
  ngAfterViewInit() {
    this.initMap();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.geojsonData && changes.geojsonData.currentValue) {
      console.log('回显数据', this.geojsonData);
      this.mapInstance.geojsonDataOnMap(this.geojsonData);
    }
    if (changes.showTools && !changes.showTools.currentValue) {
      this.closePanel();
    }
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
  draw(type: string) {
    this.acticeType = type;
    this.mapInstance.closeClickEvent();
    switch (type) {
      case 'Point':
      case 'LineString':
      case 'Polygon':
      case 'Circle':
      case 'Square':
      case 'Box':
        const imgSrc = type === 'Point' ? 'assets/location.jpg' : '';
        this.mapInstance.addInteractions(type, false, true, imgSrc).subscribe((data: Feature | GeoJsonCollectionType) => {
          console.log('绘制结果', data);
          // console.log('绘制结果', JSON.parse(data));
          // this.activeFeature(data);
          // this.layerName = data.getProperties()['measure']
          // setTimeout(() => {
          //   this.setProperty();
          // }, 300);
          // 单独返回这个巡区
          // const geojson = this.mapInstance.featuresToGeojson([data]);
          // this.drawBackFeature.emit(geojson);
        });
        break;
      case 'delete':
        this.mapInstance.deleteLayer().subscribe(data => {
          console.log('删除结果', data)
        })
        break;
      case 'clear':
        this.mapInstance.clearLayer();
        break;
      case 'hand':
        this.mapInstance.clickToGetFeature().subscribe(data => {
          const pro = data.getProperties();
          console.log('点击获取的要素', data, pro);
          this.layerDesc = pro.desc;
          this.layerName = pro.name;
          this.activeFeature(data);
        })
        break;
      case 'edit':
        this.mapInstance.editLayer().subscribe(data => {
          console.log('编辑后的要素', data);
          this.drawBackAllFeatures.emit(data);
        })
        break;
      case null:
        this.mapInstance.clearInteraction();
        break;
    }
  }
  closePanel() {
    this.hiddenPanel = false;
    this.layerDesc = null;
    this.layerName = null;
    this.currentStrokeColor = '#E80505';
    this.currentFillColor = '#ffffff';
  }
  chooseColor(color: string, type: string) {
    console.log('选择的颜色', color);
    if (type === 'stroke') {
      this.currentStrokeColor = color;
    } else {
      this.currentFillColor = color;
    }
    this.setProperty();
  }
  /**
   * 激活当前图层
   * @param feature 
   */
  activeFeature(feature: Feature) {
    this.currentFeature = feature;
    this.hiddenPanel = true;
  }
  setProperty() {
    if (!this.currentFeature) {
      console.log('没有选择图形要素');
      return;
    }
    const style: BaseStyle = {
      stroke: {
        color: this.mapInstance.hexToRgba(this.currentStrokeColor, this.strokeColorOpacity),
        width: this.strokeWidth,
        lineDash: this.lineDashType.filter(item => item.key === this.lineDash)[0].code
      },
      fill: this.mapInstance.hexToRgba(this.currentFillColor, this.fillColorOpacity),
      text: {
        text: this.layerName,
        color: this.fontColr,
        font: `${this.fontWeight === true ? 'bold' : 'normal'} ${this.fontItalic === true ? 'italic' : 'normal'} normal ${this.fontSize}px ${this.fontFamily}`
      },
      image: { type: '', src: 'assets/location.jpg' }
    }
    const properties = {
      name: this.layerName,
      desc: this.layerDesc,
      style
    }
    // console.log('设置样式', style);
    this.mapInstance.setFeatureStyle(this.currentFeature, style, properties);
    this.currentFeature.changed();

    const features = this.mapInstance.getAllFeature();
    let geojsonBack = this.mapInstance.featuresToGeojson(features);
    this.drawBackAllFeatures.emit(geojsonBack);
  }

  exportPng() {
    // postcompose rendercomplete
    this.map.once('rendercomplete', () => {
      const mapCanvas = document.createElement('canvas');
      const size = this.map.getSize();
      mapCanvas.width = size[0];
      mapCanvas.height = size[1];
      const mapContext = mapCanvas.getContext('2d');
      Array.prototype.forEach.call(
        this.map.getViewport().querySelectorAll('.ol-layer canvas, canvas.ol-layer'),
        (canvas: HTMLCanvasElement) => {
          if (canvas.width > 0) {
            // canvas.setAttribute("crossOrigin", 'Anonymous')
            // @ts-ignore
            const opacity = canvas.parentNode.style.opacity || canvas.style.opacity;
            mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
            let matrix;
            const transform = canvas.style.transform;
            if (transform) {
              // Get the transform parameters from the style's transform matrix
              matrix = transform.match(/^matrix\(([^\(]*)\)$/)[1].split(',').map(Number);
            } else {
              matrix = [
                parseFloat(canvas.style.width) / canvas.width,
                0,
                0,
                parseFloat(canvas.style.height) / canvas.height,
                0,
                0,
              ];
            }
            // Apply the transform to the export map context
            CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);
            // @ts-ignore
            const backgroundColor = canvas.parentNode.style.backgroundColor;
            if (backgroundColor) {
              mapContext.fillStyle = backgroundColor;
              mapContext.fillRect(0, 0, canvas.width, canvas.height);
            }
            mapContext.drawImage(canvas, 0, 0);
          }
        }
      );
      mapContext.globalAlpha = 1;
      mapContext.setTransform(1, 0, 0, 1, 0, 0);
      const link = document.getElementById('image-download') as HTMLLinkElement;
      link.href = mapCanvas.toDataURL();
      link.click();
      // mapCanvas.toBlob((bolb) => {
      //   link.href = URL.createObjectURL(bolb);
      //   link.click();
      // })
    });
    this.map.renderSync();
  }

  // 2023年11月1日16:59:47
  openPopup() {
    this.mapInstance.clearInteraction();
    this.mapInstance.clickToGetFeature().subscribe(data => {
      // this.coordinate = data.coordinate;
      // 这种方式展示popup不是很理想，比较理想的方式是通过select去获取，但是需要多处理一些
      // const features = this.map.getFeaturesAtPixel(data.pixel, { hitTolerance: 1 });
      console.log('点击返回', data);
      // if (features.length > 0) {
      console.log('features属性', data.getProperties());
      // console.log('转成geojson', new GeoJSON().writeFeature(data as Feature));
      this.activeFeature(data);
      const measureData = this.mapInstance.getMeasureData(data);
      const properties = data.getProperties();
      const featureId = data.getId();
      console.log('测量数据', measureData);
      const dom = document.getElementById('popup');
      dom.style.display = 'block';
      const content = document.getElementById('popup-content');
      content.innerHTML = `
            <p><label style="width:90px;display: inline-block;">面积/长度：</label> ${measureData.measureData}</p>
            <p><label style="width:90px;display: inline-block;">图层名称：</label> ${properties.name}</p>
            <p><label style="width:90px;display: inline-block;">图层描述：</label> ${properties.desc}</p>
            <p><label style="width:90px;display: inline-block;">要素id：</label> ${featureId}</p>
          `;
      // @ts-ignore
      let center = [];
      if (data.getGeometry().getType() === 'Circle') {
        center = (data.getGeometry() as Circle).getCenter()
      } else {
        center = turf.center(JSON.parse(new GeoJSON().writeFeature(data))).geometry.coordinates;
      }
      this.mapInstance.showPopup(dom, center, 'test');
      // }
    });
  }
  closePopup() {
    this.mapInstance.closeClickEvent();
    this.mapInstance.closeOverlay('test');
  }
  // addInteractions(type: string) {
  //   this.mapInstance.addInteractions(type).subscribe((data: string) => {
  //     console.log('绘制结果', JSON.parse(data));
  //   });
  // }
  deleteLayer() {
    this.mapInstance.deleteLayer().subscribe(data => {
      console.log('删除结果', data);
    });
  }
  clearLayer() {
    this.closeHeatMap();
    this.closeClusterMap();
    this.closeMarkerAnimation();
    this.mapInstance.clearLayer();
  }
  // addPoint() {
  //   this.mapInstance.showPoint(this.geojson.Points);
  // }
  dataOnMap(type: string) {
    let geojson;
    if (type === 'Point') {
      geojson = this.geojson.Points;
    } else if (type === 'LineString') {
      geojson = this.geojson.line;
    } else if (type === 'Polygon') {
      geojson = this.geojson.Polygon;
    } else if (type === 'Circle') {
      geojson = this.geojson.Circle;
    } else if (type === 'Square') {
      geojson = this.geojson.Square;
    } else if (type === 'Box') {
      geojson = this.geojson.Box;
    }
    this.mapInstance.geojsonDataOnMap(geojson as GeoJsonCollectionType);

  }
  // showPolyline() {
  //   this.mapInstance.showPolyline(this.geojson.line);
  // }
  // showPolygon() {
  //   this.mapInstance.geojsonDataOnMap(this.geojson.Polygon as GeoJsonCollectionType);
  // }
  // showCircle() {
  //   // this.mapInstance.showCircle({ center: [108.41378967683895, 22.793760087092004], radius: 2500 }, 'EPSG:4326');
  //   this.mapInstance.geojsonDataOnMap(this.geojson.Circle as GeoJsonCollectionType);
  // }
  // showSquare() {
  //   this.mapInstance.showSquare(this.geojson.Square);
  // }
  clearInteraction() {
    this.mapInstance.clearInteraction();
  }
  editLayer() {
    this.mapInstance.editLayer().subscribe(data => {
      console.log('编辑结果', data);
    });
  }

  showHeatMap() {
    this.heatMapLayer = this.mapInstance.showHeatMap(this.geojson.HeatData[0]);
  }
  closeHeatMap() {
    this.mapInstance.closeHeatMap(this.heatMapLayer);
  }
  showClusterMap() {
    const features = []
    for (let i = 0; i < 20000; ++i) {
      const coordinates = [108 + Math.random(), 22 + Math.random()];
      features[i] = new Feature(new Point(coordinates));
    }
    const result = this.mapInstance.showClusterMap(features);
    this.clusterMapLayer.push(result.layer);
  }
  closeClusterMap() {
    this.mapInstance.closeClusterMap(this.clusterMapLayer)
  }
  markerAnimation() {
    this.markDisabled = false;
    this.markerAnimationLayer = this.mapInstance.markerAnimation(this.geojson.route);
  }
  closeMarkerAnimation() {
    this.mapInstance.closeMarkerAnimation(this.markerAnimationLayer)
  }
  changeAnimation() {
    if (this.markDisabled) {
      this.mapInstance.stopAnimation();
      this.markText = '开始移动'
      this.markDisabled = !this.markDisabled;
    } else {
      this.markText = '停止移动';
      this.mapInstance.startAnimation();
      this.markDisabled = !this.markDisabled;
    }
  }
  mapClick() {
    const points = [];
    this.mapInstance.clickToGetFeature().subscribe(data => {
      // points.push(data.coordinate)
      console.log('点击返回', data);
    })
  }
  getAllFeatures() {
    const result = this.mapInstance.getAllFeature();
    console.log('获取的所有图层', result);
  }
  async test() {
    let url = '/geoserver/egis3/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=egis3%3Ads_view_violation_today&outputFormat=application%2Fjson'
    const result = await this.http.post(url, null).toPromise();
    console.log('---------', result);
    this.mapInstance.geojsonDataOnMap(result as GeoJsonCollectionType);
  }
}
