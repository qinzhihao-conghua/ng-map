import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Feature, Map, View } from 'ol'
import { Point } from 'ol/geom';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import { Icon, Style, Text } from 'ol/style';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit, AfterViewInit {

  constructor() { }

  map: Map;

  ngOnInit(): void {
  }
  ngAfterViewInit() {
    const tileLayer = new TileLayer({
      source: new XYZ({
        url: 'http://114.215.146.210:25003/v3/tile?x={x}&y={y}&z={z}'
      })
    });

    // const vector = new VectorLayer({
    //   source: new VectorSource({
    //     features: [
    //       new Feature({
    //         gemotry: new Point([108.516492, 22.818136])
    //       })
    //     ],
    //   }),
    //   style: new Style({
    //     image: new Icon({
    //       src: 'assets/location.jpg'
    //     }),
    //     text: new Text({
    //       text: '7777'
    //     })
    //   })
    // });
    // tslint:disable-next-line: no-unused-expression
    this.map = new Map({
      target: 'map',
      layers: [tileLayer],
      view: new View({
        center: [108.316492, 22.818136],
        // center: [0, 0],
        zoom: 12,
        maxZoom: 20,
        minZoom: 6,
        projection: 'EPSG:4326'
      }),
    });
  }

  test() {
    const iconFeature = new Feature({
      // geometry: new Point([0, 0]),
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
      source: vectorSource,
    });
    this.map.addLayer(vectorLayer);
  }

}
