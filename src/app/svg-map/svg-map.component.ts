import { Component, OnInit } from '@angular/core';
import 'ol/ol.css';
import { Map, View } from 'ol';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
@Component({
  selector: 'app-svg-map',
  templateUrl: './svg-map.component.html',
  styleUrls: ['./svg-map.component.scss']
})
export class SvgMapComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  ngAfterViewInit() {
    // 创建地图
    const map = new Map({
      target: 'map',
      layers: [
        // 添加矢量图层
        new VectorLayer({
          source: new VectorSource({
            url: 'path/to/your/administrative-boundaries.svg', // SVG文件的路径
            // format: new SVG() // 使用SVG格式解析器
          }),
          style: new Style({
            fill: new Fill({
              color: 'rgba(255, 255, 255, 0.5)' // 填充颜色
            }),
            stroke: new Stroke({
              color: '#319FD3', // 边界线颜色
              width: 2 // 边界线宽度
            })
          })
        })
      ],
      view: new View({
        center: [0, 0],
        zoom: 2 // 初始缩放级别
      })
    });
  }
}
