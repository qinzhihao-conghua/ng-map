import { Component, OnInit } from '@angular/core';
import 'ol/ol.css';
import { Map, View } from 'ol';
import { get as getProjection, transformExtent } from 'ol/proj';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';
import ImageLayer from 'ol/layer/Image';
import Static from 'ol/source/ImageStatic';
import XYZ from 'ol/source/XYZ';
import TileLayer from 'ol/layer/Tile';
@Component({
  selector: 'app-svg-map',
  templateUrl: './svg-map.component.html',
  styleUrls: ['./svg-map.component.scss']
})
export class SvgMapComponent implements OnInit {

  title = 'svg-map';
  private map!: Map;

  async ngOnInit() {
    // 1. 动态创建自定义投影
    proj4.defs('SVG_PROJ', '+proj=tmerc +lat_0=31.23 +lon_0=121.47 +k=1 +x_0=0 +y_0=0 +ellps=WGS84 +units=m +no_defs');
    register(proj4);

    // 2. 加载SVG并提取控制点
    const svgContent = await fetch('/assets/上海市底图.svg').then(r => r.text());
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');

    const controlPoints = Array.from(svgDoc.querySelectorAll('circle[data-lonlat]'))
      .map(el => ({
        x: parseFloat(el.getAttribute('cx')!),
        y: parseFloat(el.getAttribute('cy')!),
        lonlat: el.getAttribute('data-lonlat')!.split(',').map(Number)
      }));

    // 3. 计算图片的地理范围
    const extent = transformExtent(
      [120.51, 30.40, 122.12, 31.53], // 上海地理范围
      'EPSG:4326', 'SVG_PROJ'
    );

    console.log('SVG 图片地理范围:', extent);
    const baseLayer = new TileLayer({
      source: new XYZ({
        url: 'http://114.215.146.210:25003/v3/tile?x={x}&y={y}&z={z}',
        crossOrigin: 'anonymous'
      })
    })
    // 4. 创建地图实例
    this.map = new Map({
      target: 'map-container',
      view: new View({
        projection: 'SVG_PROJ',
        center: [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2], // 使用图片范围的中心点
        zoom: 9 // 调整缩放级别
      })
    });
    this.map.addLayer(baseLayer);
    // 5. 将SVG转换为图片并加载
    const svgImage = await this.svgToImage(svgContent);

    const imageLayer = new ImageLayer({
      source: new Static({
        url: svgImage.src,
        imageExtent: extent, // 确保范围正确
        projection: 'SVG_PROJ'
      })
    });

    // 6. 添加图层到地图
    this.map.addLayer(imageLayer);
    console.log('图层已添加到地图');
  }

  private async svgToImage(svgContent: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        console.log('SVG 图片加载成功');
        resolve(img);
      };
      img.onerror = (err) => {
        console.error('SVG 图片加载失败', err);
        reject(err);
      };

      // 使用 encodeURIComponent 处理非 Latin1 字符
      const encodedSvg = encodeURIComponent(svgContent)
        .replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16)));

      img.src = 'data:image/svg+xml;base64,' + btoa(encodedSvg);
    });
  }
}
