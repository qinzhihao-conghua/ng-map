import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Map } from 'ol';
import Feature from 'ol/Feature';
import { ViewOptions } from 'ol/View';
import { Style, Icon } from 'ol/style';
import { OlMapService } from '../../service/ol-map-service';
declare var turf: any;

@Component({
  selector: 'area-map-new',
  templateUrl: './area-map-new.component.html',
  styleUrls: ['./area-map-new.component.scss']
})
export class AreaMapNewComponent implements OnInit {

  /**
   * 覃智浩 2022年10月11日 14:53:36
   * 新巡区地图绘制组件，使用的service也是重写的OlMapService
   */
  constructor() { }

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
  strokeColors: Array<string> = ['#E80505', '#FCCF31', '#F8D800', '#49C628', '#32CCBC', '#0396FF', '#3813C2'];
  fillColors: Array<string> = [
    'rgba(255, 255, 255, .5)',
    'rgba(232, 5, 5, .3)',
    'rgba(252, 207, 49, .3)',
    'rgba(248, 215, 0, .3)',
    'rgba(74, 198, 40, .3)',
    'rgba(50, 204, 189, .3',
    'rgba(3, 150, 255, .3)',
    'rgba(57, 19, 194, .3)'
  ];
  currentStrokeColor: string = '#E80505';
  currentFillColor: string = 'rgba(255, 255, 255, 0.5)';

  ngOnInit() {
  }
  ngAfterViewInit() {
    this.initMap();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.geojsonData && changes.geojsonData.currentValue) {
      console.log('回显数据', this.geojsonData);
      this.mapInstance.showPolygon(this.geojsonData);
    }
    if (changes.showTools && !changes.showTools.currentValue) {
      this.closePanel();
    }
  }
  initMap() {
    const viewOptions: ViewOptions = {
      center: [121.471325, 31.231929],
      zoom: 12,
      maxZoom: 18,
      minZoom: 6,
      projection: 'EPSG:4326'
    };
    // let sourceUrl = this.configService.getConfigString('map.common.layers.tile.source.url', '');
    // let projection = this.configService.getConfigString('map.common.layer.source.projection', 'EPSG:3857');
    // let layerType = this.configService.getConfigString('map.common.layers.type', 'Tile');
    // let sourceType = this.configService.getConfigString('map.common.layers.tile.source.type', ' XYZ');
    // const layerOption = { sourceUrl, projection, layerType, sourceType };
    this.mapInstance = new OlMapService();
    this.map = this.mapInstance.initMap('map-container', viewOptions);
  }
  draw(type: string) {
    this.acticeType = type;
    this.closePanel();
    this.mapInstance.closeClickEvent();
    switch (type) {
      case 'Point':
      case 'LineString':
      case 'Polygon':
      case 'Circle':
        const imgSrc = type === 'Point' ? 'assets/location.jpg' : '';
        this.mapInstance.addInteractions(type, null, imgSrc, false, false).subscribe((data: Feature) => {
          this.activeFeature(data);
          setTimeout(() => {
            this.setStyle();
          }, 300);
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
    this.hiddenPanel = true;
    this.layerDesc = null;
    this.layerName = null;
    this.currentStrokeColor = '#E80505';
    this.currentFillColor = 'rgba(255, 255, 255, 0.5)';
  }
  chooseColor(color: string, type: string) {
    if (type === 'stroke') {
      this.currentStrokeColor = color;
    } else {
      this.currentFillColor = color;
    }
  }
  /**
   * 激活当前图层
   * @param feature 
   */
  activeFeature(feature: Feature) {
    this.currentFeature = feature;
    this.hiddenPanel = false;
    // if (this.currentFeature) {
    //   (this.currentFeature.getStyle() as Style).getStroke().setColor('#2196f3');
    //   this.currentFeature.changed();
    // }
  }
  setStyle() {
    const style = {
      strokeColor: this.currentStrokeColor,
      fillColor: this.currentFillColor,
      text: this.layerName,
      pointImageUrl: 'assets/img/location.png'
    }
    const properties = {
      name: this.layerName,
      desc: this.layerDesc,
      style
    }
    this.mapInstance.setFeatureStyle(this.currentFeature, style, properties);
    this.currentFeature.changed();

    const features = this.mapInstance.getAllFeature();
    let geojsonBack = this.mapInstance.featuresToGeojson(features);
    this.drawBackAllFeatures.emit(geojsonBack);
  }
  addPopup(data) {
    let center = null;
    let json = null;
    if (data.type === 'Circle') {
      center = data.center;
    } else {
      json = JSON.parse(data);
    }
    console.log('绘制结果', json);
    const dom = document.getElementById('popup');
    dom.style.display = 'block';
    const content = document.getElementById('popup-content');
    content.innerHTML = `
        <p>测试popup</p>
        <p>测试popup</p>
      `;
    this.currentPopuId = this.mapInstance.newGuid();
    let temp = [];
    if (json && json.geometry.type === 'LineString') {
      json.geometry.coordinates.forEach(item => {
        temp.push(turf.point(item))
      })
    } else if (json && json.geometry.type === 'Polygon') {
      json.geometry.coordinates[0].forEach(item => {
        temp.push(turf.point(item))
      })
    } else if (json) {
      temp.push(turf.point(json.geometry.coordinates))
    }
    const features = turf.featureCollection(temp);

    center = center ? center : turf.center(features).geometry.coordinates;
    this.mapInstance.showPopup(dom, center, this.currentPopuId)
  }
  closePopup() {
    this.mapInstance.closeOverlay(this.currentPopuId)
  }

}
