import { Component, OnInit } from '@angular/core';
import { Map, View } from 'ol';
import Layer from 'ol/layer/Layer';
import TileImage from 'ol/source/TileImage';

declare const mapabcgl: any;
@Component({
  selector: 'app-mapabc',
  templateUrl: './mapabc.component.html',
  styleUrls: ['./mapabc.component.scss']
})
export class MapabcComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterContentInit() {
    this.initMap()
  }
  createMapabc(options) {
    if (options.accessToken) {
      mapabcgl.accessToken = options.accessToken;
    } else {
      console.log("map accessToken is null");
    }
    let style = options.style;
    let container = options.container;
    let _options = {
      style: style,
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
      preserveDrawingBuffer: true
    };
    if (options.domainUrl) {
      mapabcgl.config.API_URL = options.domainUrl;
    }
    return new mapabcgl.Map(_options);
  };
  olLayer(mapabc) {
    let layer = null;
    if (mapabc) {
      layer = new Layer({
        render: (frameState) => {
          let canvas = mapabc.getCanvas();
          let viewState = frameState.viewState;
          let visible = layer.getVisible();
          canvas.style.display = visible ? 'block' : 'none';
          let opacity = layer.getOpacity();
          canvas.style.opacity = opacity;
          // adjust view parameters in mapbox
          let rotation = viewState.rotation;
          mapabc.jumpTo({
            // center: toLonLat(viewState.center),
            center: viewState.center,
            zoom: viewState.zoom - 1,
            bearing: (-rotation * 180) / Math.PI,
            animate: false,
          });
          // cancel the scheduled update & trigger synchronous redraw
          // see https://github.com/mapbox/mapbox-gl-js/issues/7893#issue-408992184
          // NOTE: THIS MIGHT BREAK IF UPDATING THE MAPBOX VERSION
          if (mapabc._frame) {
            mapabc._frame.cancel();
            mapabc._frame = null;
          }
          mapabc._render();
          return canvas;
        },
        // source: new ol.source.Source({})
        // source: new OSM()
        source: new TileImage({})
      });
      // layer['type'] = "mvt";
    }
    return layer;
  }

  initMap() {
    let options = {
      'id': '',
      'accessToken': 'ec85d3648154874552835438ac6a02b2',
      'domainUrl': 'http://121.36.99.212:35001',
      'type': 'mapabc',
      'zIndex': 1,
      'center': [113.545080, 22.194584],
      // 'center': [13521355.046191009, 3662162.5765745],
      'container': 'mapabc',
      // style: './mapabc/style_ol.json'
      style: 'mapabc://style/mapabc80'
    }


    const mapabc = this.createMapabc(options);
    const layer = this.olLayer(mapabc);
    new Map({
      target: 'mapabc',
      view: new View({
        center: [113.545080, 22.194584],
        // center: [13521355.046191009, 3662162.5765745],
        zoom: 12,
        minZoom: 3,
        maxZoom: 22,
        projection: 'EPSG:4326'
        // projection: 'EPSG:3857'
      }),
      layers: [
        layer
      ]
    })
  }

}
