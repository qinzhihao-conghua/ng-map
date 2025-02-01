import { Component, OnInit } from '@angular/core';
// import View from 'ol/View';
import { Extent, getCenter } from 'ol/extent';
import ImageLayer from 'ol/layer/Image';
import Projection from 'ol/proj/Projection';
import Static from 'ol/source/ImageStatic';
// import Map from 'ol/Map.js';
import { Map, View } from 'ol';

@Component({
  selector: 'app-image-map',
  templateUrl: './image-map.component.html',
  styleUrls: ['./image-map.component.scss']
})
export class ImageMapComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  ngAfterContentInit() {
    // 以左下角为原点
    const extent: Extent = [0, 0, 1500, 736];
    const projection = new Projection({
      code: 'qxs-image',
      units: 'pixels',
      extent: extent,
    });

    const map = new Map({
      target: 'imagemap',
      layers: [
        new ImageLayer({
          source: new Static({
            attributions: '© <a href="https://openlayers.vip/examples/static-image.html">openlayers</a>',
            url: '../../../assets/qingxiushan.png',
            projection: projection,
            imageExtent: extent,
          }),
        }),
      ],
      view: new View({
        projection: projection,
        center: getCenter(extent),
        zoom: 2,
        maxZoom: 8,
      }),
    });
    map.on('click', (e) => {
      console.log(e);
      console.log(e.coordinate);
    })
  }
}
