import { Map, Tile, View } from 'ol';
import { defaults } from 'ol/control';
import Attribution from 'ol/control/Attribution';
import MousePosition from 'ol/control/MousePosition';
import TileLayer from 'ol/layer/Tile';
import { addCoordinateTransforms, addProjection, fromLonLat, get, toLonLat, transform } from 'ol/proj';
import Projection from 'ol/proj/Projection';
import OSM from 'ol/source/OSM';
import TileImage from 'ol/source/TileImage';
import TileGrid from 'ol/tilegrid/TileGrid';
import projzh from 'projzh';

import { AfterViewInit, Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-ol-bd-map',
    templateUrl: './ol-bd-map.component.html',
    styleUrls: ['./ol-bd-map.component.scss']
})
export class OlBdMapComponent implements OnInit, AfterViewInit {

    constructor() { }
    map: Map;
    ngOnInit() {
    }

    ngAfterViewInit(): void {
        /**
         *  定义百度投影，这是实现无偏移加载百度地图离线瓦片核心所在。
         *  网上很多相关资料在用OpenLayers加载百度地图离线瓦片时都认为投影就是EPSG:3857(也就是Web墨卡托投影)。
         *  事实上这是错误的，因此无法做到无偏移加载。
         *  百度地图有自己独特的投影体系，必须在OpenLayers中自定义百度投影，才能实现无偏移加载。
         *  百度投影实现的核心文件为bd09.js，在迈高图官网可以找到查看这个文件。
         */
        const projBD09 = new Projection({
            // baidu或者BD:09
            code: 'BD:09',
            // 作用未知，不设置也可以
            extent: [-20037726.37, -11708041.66, 20037726.37, 12474104.17],
            units: 'm',
            axisOrientation: 'neu',
            global: false
        });
        addProjection(projBD09);
        addCoordinateTransforms('EPSG:4326', projBD09, projzh.ll2bmerc, projzh.bmerc2ll);
        addCoordinateTransforms('EPSG:3857', projBD09, projzh.smerc2bmerc, projzh.bmerc2smerc);

        // 自定义分辨率和瓦片坐标系
        const rlProject = [];

        // 计算百度使用的分辨率
        for (let i = 0; i <= 18; i++) {
            rlProject[i] = Math.pow(2, 18 - i);
        }
        const tilegrid = new TileGrid({
            origin: [0, 0],    // 设置原点坐标
            resolutions: rlProject // 设置分辨率
        });

        /**
         * 加载百度地图离线瓦片不能用ol.source.XYZ，ol.source.XYZ针对谷歌地图（注意：是谷歌地图）而设计，
         * 而百度地图与谷歌地图使用了不同的投影、分辨率和瓦片网格。
         * 因此这里使用ol.source.TileImage来自行指定投影、分辨率、瓦片网格。
         */
        const baiduSource = new TileImage({
            projection: 'BD:09',
            tileGrid: tilegrid,
            tilePixelRatio: 2,
            tileUrlFunction: (tileCoord, pixelRatio, proj) => {
                if (!tileCoord) {
                    return '';
                }
                const z = tileCoord[0];
                let x: number | string = tileCoord[1];
                // 注意，在openlayer3中由于载地图的方式是右上递增
                // 而openlayer6中是右下递增，所以y的值需要注意
                // 6版本需要取负值,同时注意要减一，否则缩放有问题
                let y: number | string = -tileCoord[2] - 1;

                // 百度瓦片服务url将负数使用M前缀来标识
                if (x < 0) {
                    x = 'M' + (-x);
                }
                if (y < 0) {
                    y = 'M' + (-y);
                }
                // online3的3是用来分流的
                // udt应该表示的是地图发布日期。p表示地图上的信息，scaler表示缩放
                // 0表示不显示地名等标注信息，只单纯的地图地图，1表示显示地名信息
                return `http://online3.map.bdimg.com/onlinelabel/?qt=tile&x=${x}&y=${y}&z=${z}&styles=pl&udt=20190426&scaler=2&p=1`;
            }
        });

        // 创建地图
        this.map = new Map({
            layers: [
                // 百度地图层
                new TileLayer({
                    source: baiduSource,
                })
            ],
            view: new View({
                center: transform([108.316492, 22.818136], 'EPSG:4326', 'BD:09'),
                projection: 'BD:09',
                zoom: 12,
                maxZoom: 20,
                minZoom: 3,
                constrainResolution: true
            }),
            target: 'baiduMap2'
        });
    }

}
