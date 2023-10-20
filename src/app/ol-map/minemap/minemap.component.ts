import { Component, OnInit } from '@angular/core';
import { Map, View } from 'ol';
import Layer from 'ol/layer/Layer';
import { toLonLat } from 'ol/proj';
import Source from 'ol/source/Source';


declare const minemap: any;
@Component({
  selector: 'app-minemap',
  templateUrl: './minemap.component.html',
  styleUrls: ['./minemap.component.scss']
})
export class MinemapComponent implements OnInit {

  constructor() { }

  map: Map;

  ngOnInit(): void {
  }

  ngAfterContentInit() {
    this.initMap()
  }
  /**
   * 对接四维地图
   * @param options{
   *     domainUrl
   *     spriteUrl
   *     dataDomainUrl
   *     serviceUrl
   *     appKey 必填
   *     solution
   *     container 必填
   *     style 必填
   * }
   */
  createMinemap(options) {
    /**
     * 全局参数设置
     */
    if (options.domainUrl) {
      minemap.domainUrl = options.domainUrl; //'https://minedata.cn';
    }
    if (options.dataDomainUrl) {
      minemap.dataDomainUrl = options
        .dataDomainUrl; //['https://datahive.minedata.cn', 'https://datahive01.minedata.cn', 'https://datahive02.minedata.cn', 'https://datahive03.minedata.cn', 'https://datahive04.minedata.cn'];
    }
    if (options.spriteUrl) {
      minemap.spriteUrl = options.spriteUrl; //'https://minedata.cn/minemapapi/v2.1.0/sprite/sprite';
    }
    if (options.serviceUrl) {
      minemap.serviceUrl = options.serviceUrl; //'https://mineservice.minedata.cn/service/';
    }
    /**
     * appKey、solution设置
     */
    minemap.appKey = options.appKey; //'16be596e00c44c86bb1569cb53424dc9';
    if (options.solution) {
      minemap.solution = options.solution; //12877;
    }
    var container = options.container;
    var map = new minemap.Map({
      style: options.style,
      attributionControl: false,
      boxZoom: false,
      container: container,
      doubleClickZoom: false,
      dragPan: false,
      dragRotate: false,
      interactive: false,
      keyboard: false,
      pitchWithRotate: false,
      scrollZoom: false,
      touchZoomRotate: false,
      projection: 'MERCATOR'
    });
    // var position = minemap.LngLat(113.545080, 22.194584); // 对象形式
    // map.setCenter(position);
    return map;
  }
  olLayer(_map) {
    var layer = null;
    if (_map) {
      layer = new Layer({
        render: function (frameState) {
          var canvas = _map.getCanvas();
          var viewState = frameState.viewState;
          var visible = layer.getVisible();
          canvas.style.display = visible ? 'block' : 'none';
          var opacity = layer.getOpacity();
          canvas.style.opacity = opacity;
          // adjust view parameters in mapbox
          var rotation = viewState.rotation;
          // var center = toLonLat(viewState.center);
          // if (proj == enum_1.DSProjType.WGS84) {
          //     center = viewState.center;
          // }
          _map.jumpTo({
            // center: toLonLat(viewState.center),
            center: viewState.center,
            zoom: viewState.zoom - 1,
            bearing: (-rotation * 180) / Math.PI,
            animate: false,
          });
          if (_map._frame) {
            _map._frame.cancel();
            _map._frame = null;
          }
          _map._render();
          return canvas;
        },
        // source: new Source({})
      });
      layer['type'] = "mvt";
    }
    return layer;
  }
  initMap() {
    let options = {
      'id': '',
      'type': 'minemap',
      'zIndex': 1,
      'appKey': '16be596e00c44c86bb1569cb53424dc9',
      'container': 'minemap',
      style: 'https://mineservice.minedata.cn/service/solu/style/id/12877'
    }


    const mapabc = this.createMinemap(options);
    const layer = this.olLayer(mapabc);
    this.map = new Map({
      target: 'minemap',
      view: new View({
        // center: [13521355.046191009, 3662162.5765745],
        center: [113.545080, 22.194584],
        maxZoom: 17,
        minZoom: 3,
        // projection: "EPSG:3857",
        projection: "EPSG:4326",
        zoom: 10
      }),
      layers: [
        layer
      ]
    });
    this.map.on('click', (e) => {
      console.log(e);
      console.log(e.coordinate);
    })
  }

}
