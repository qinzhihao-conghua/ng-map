"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMvtLayer = void 0;
/**
 * 矢量瓦片对接
 */
exports.createMvtLayer = {
    init: function (layerConf) {
        var _map = null;
        var sourceConf = layerConf.options;
        var sourceType = sourceConf.type;
        switch (sourceType) {
            case 'ppmap':
                _map = this.createPPmap(sourceConf);
                return {
                    layer: this.getOLlayer(_map),
                    map: _map
                };
                break;
            case 'mapabc':
                _map = this.createMapabc(sourceConf);
                return {
                    layer: this.getOLlayer(_map),
                    map: _map
                };
                break;
            case 'minemap':
                _map = this.createMinemap(sourceConf);
                return {
                    layer: this.getOLlayer(_map),
                    map: _map
                };
                break;
            case 'mapbox':
                _map = this.createMapboxgl(sourceConf);
                return {
                    layer: this.getOLlayer(_map),
                    map: _map
                };
                break;
            case 'emg':
                _map = this.createEmapgo(sourceConf);
                return {
                    layer: this.getOLlayer(_map),
                    map: _map
                };
                break;
            default:
                console.warn('undefined api type!');
        }
    },
    getOLlayer: function (_map) {
        var layer = null;
        if (_map) {
            layer = new ol.layer.Layer({
                render: function (frameState) {
                    var canvas = _map.getCanvas();
                    var viewState = frameState.viewState;
                    var visible = layer.getVisible();
                    canvas.style.display = visible ? 'block' : 'none';
                    var opacity = layer.getOpacity();
                    canvas.style.opacity = opacity;
                    // adjust view parameters in mapbox
                    var rotation = viewState.rotation;
                    _map.jumpTo({
                        center: ol.proj.toLonLat(viewState.center),
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
                source: new ol.source.Source({})
            });
            layer['type'] = "mvt";
        }
        return layer;
    },
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
    createMinemap: function (options) {
        /**
         * 全局参数设置
         */
        if (options.domainUrl) {
            minemap.domainUrl = options.domainUrl; //'https://minedata.cn';
        }
        if (options.dataDomainUrl) {
            minemap.dataDomainUrl = options.dataDomainUrl; //['https://datahive.minedata.cn', 'https://datahive01.minedata.cn', 'https://datahive02.minedata.cn', 'https://datahive03.minedata.cn', 'https://datahive04.minedata.cn'];
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
        });
        return map;
    },
    /**
     * 对接mapabc
     * @param options{
     *     style 样式地址
     *     container div.id
     *     accessToken 序列号
     *     domainUrl 域地址
     * }
     */
    createMapabc: function (options) {
        if (options.accessToken) {
            mapabcgl.accessToken = options.accessToken;
        }
        else {
            console.log("map accessToken is null");
        }
        var style = options.style;
        var container = options.container;
        var _options = {
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
        var map = new mapabcgl.Map(_options);
        return map;
    },
    /**
     * 对接ppmap
     * @param options{
     *     domainUrl
     *     spriteUrl
     *     fontsUrl
     *     serviceUrl
     *     accessToken 必填
     *     solution
     *     container 必填
     *     style 必填
     * }
     */
    createPPmap: function (options) {
        /**
         * 全局参数设置
         */
        if (options.domainUrl) {
            minemap.domainUrl = options.domainUrl; //'http://50.104.5.41:81';
        }
        if (options.fontsUrl) {
            minemap.fontsUrl = options.fontsUrl; //'http://50.104.5.41:81/minemapapi/v1.3/fonts';
        }
        if (options.spriteUrl) {
            minemap.spriteUrl = options.spriteUrl; //'http://50.104.5.41:81/minemapapi/v1.3/sprite/sprite';
        }
        if (options.serviceUrl) {
            minemap.serviceUrl = options.serviceUrl; //'http://50.104.5.41:81/service';
        }
        /**
         * appKey、solution设置
         */
        minemap.accessToken = options.accessToken; //'25cc55a69ea7422182d00d6b7c0ffa93';
        if (options.solution) {
            minemap.solution = options.solution; //2365;
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
        });
        return map;
    },
    /**
     * 对接科达mvt地图
     * @param options{
     *     container
     *     configUrl
     *     center
     * }
     */
    createKmap: function (options) {
        return new Promise(function (resolve) {
            var onLoadMap = function (e) {
                //科达地图初始化完成
                var map = kmap.getFirstLayerId();
                resolve({ map: map, kmap: kmap });
            };
            var container = options.container;
            var center = options.center;
            var config = {
                configUrl: options.configUrl,
                containerId: container,
                onLoadMap: onLoadMap
            };
            if (options.solution) {
                config['solution'] = options.solution;
            }
            var fullConfig = { center: center };
            Object.assign(fullConfig, config);
            var kmap = new KMap(fullConfig);
        });
    },
    /**
     * 对接mapboxgl
     * @param options{
     *     key
     *     container
     *     style
     * }
     */
    createMapboxgl: function (options) {
        if (options.key) {
            mapboxgl.accessToken = options.key;
        }
        var style = options.style;
        var container = options.container;
        // var center = options.center;
        var map = new mapboxgl.Map({
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
        });
        return map;
    },
    /**
     * 易图通
     * @param options
     */
    createEmapgo: function (options) {
        emapgo.accessToken = options.access_token;
        var map = new emapgo.Map(options);
        return map;
    }
};
//# sourceMappingURL=create_mvt_layer.js.map