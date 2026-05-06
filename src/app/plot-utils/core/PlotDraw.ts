/**
 * Created by FDD on 2017/5/15.
 * @desc PlotDraw
 */
import { Map } from 'ol'
import { Draw as $DrawInteraction, DoubleClickZoom } from 'ol/interaction'
import {
  Style as $Style,
  Icon as $Icon,
  Stroke as $Stroke,
  Fill as $Fill
} from 'ol/style'

import Feature from 'ol/Feature'
import { createBox } from 'ol/interaction/Draw'

import { getuuid, MathDistance, bindAll } from '../Utils/utils'
import { BASE_LAYERNAME } from '../Constants'
import { createVectorLayer } from '../Utils/layerUtils'
import PlotTextBox from '../Geometry/Text/PlotTextBox'
import * as Plots from '../Geometry/index'
import * as PlotTypes from '../Utils/PlotTypes'
import { GeoJSON } from 'ol/format';
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import { Coordinate } from 'ol/coordinate'

interface PlotDrawOptions {
  layerName?: string;
  zIndex?: number;
  isClear?: boolean;
  [key: string]: unknown;
}

class PlotDraw {
  private map: Map;
  private options: PlotDrawOptions;
  private drawLayer: VectorLayer<VectorSource>;
  private layerName: string;
  private points: Coordinate[] | null;
  private plot: any;
  private feature: Feature | null;
  private plotType: string | null;
  private plotParams: Record<string, unknown> | null;
  private mapViewport: Element | null;
  private dblClickZoomInteraction: DoubleClickZoom | null;
  private drawInteraction_: $DrawInteraction | null;

  constructor(map: Map, options: PlotDrawOptions = {}) {
    if (map && map instanceof Map) {
      this.map = map
    } else {
      throw new Error('传入的不是地图对象！')
    }

    this.options = options;
    this.layerName = (this.options && this.options['layerName']) ? this.options['layerName'] as string : BASE_LAYERNAME;
    this.mapViewport = this.map.getViewport();
    this.points = [];
    this.plot = null;
    this.feature = null;
    this.plotType = null;
    this.plotParams = null;
    this.dblClickZoomInteraction = null;
    this.drawInteraction_ = null;

    bindAll([
      'textAreaDrawEnd',
      'mapFirstClickHandler',
      'mapNextClickHandler',
      'mapDoubleClickHandler',
      'mapMouseMoveHandler'
    ], this)

    this.drawLayer = createVectorLayer(this.map, this.layerName, { create: true });
    this.drawLayer.setZIndex(this.options['zIndex'] as number || 99);
  }

  /**
   * 创建标绘对象
   * @param type 标绘类型
   * @param points 控制点数组
   * @param _params 标绘参数
   * @returns 标绘对象
   */
  private createPlot(type: string, points: Coordinate[], _params: Record<string, unknown>): any {
    const params = _params || {};
    switch (type) {
      case PlotTypes.TEXTAREA:
        return 'TextArea';
      case PlotTypes.POINT:
        return new Plots.Point([], points, params);
      case PlotTypes.PENNANT:
        return new Plots.Pennant([], points, params);
      case PlotTypes.POLYLINE:
        return new Plots.Polyline([], points, params);
      case PlotTypes.ARC:
        return new Plots.Arc([], points, params);
      case PlotTypes.CIRCLE:
        return new Plots.Circle([], points, params);
      case PlotTypes.CURVE:
        return new Plots.Curve([], points, params);
      case PlotTypes.FREEHANDLINE:
        return new Plots.FreeHandLine([], points, params);
      case PlotTypes.RECTANGLE:
        return new Plots.RectAngle([], points, params);
      case PlotTypes.ELLIPSE:
        return new Plots.Ellipse([], points, params);
      case PlotTypes.LUNE:
        return new Plots.Lune([], points, params);
      case PlotTypes.SECTOR:
        return new Plots.Sector([], points, params);
      case PlotTypes.CLOSED_CURVE:
        return new Plots.ClosedCurve([], points, params);
      case PlotTypes.POLYGON:
        return new Plots.Polygon([], points, params);
      case PlotTypes.ATTACK_ARROW:
        return new Plots.AttackArrow([], points, params);
      case PlotTypes.FREE_POLYGON:
        return new Plots.FreePolygon([], points, params);
      case PlotTypes.DOUBLE_ARROW:
        return new Plots.DoubleArrow([], points, params);
      case PlotTypes.STRAIGHT_ARROW:
        return new Plots.StraightArrow([], points, params);
      case PlotTypes.FINE_ARROW:
        return new Plots.FineArrow([], points, params);
      case PlotTypes.ASSAULT_DIRECTION:
        return new Plots.AssaultDirection([], points, params);
      case PlotTypes.TAILED_ATTACK_ARROW:
        return new Plots.TailedAttackArrow([], points, params);
      case PlotTypes.SQUAD_COMBAT:
        return new Plots.SquadCombat([], points, params);
      case PlotTypes.TAILED_SQUAD_COMBAT:
        return new Plots.TailedSquadCombat([], points, params);
      case PlotTypes.GATHERING_PLACE:
        return new Plots.GatheringPlace([], points, params);
      case PlotTypes.RECTFLAG:
        return new Plots.RectFlag([], points, params);
      case PlotTypes.TRIANGLEFLAG:
        return new Plots.TriangleFlag([], points, params);
      case PlotTypes.CURVEFLAG:
        return new Plots.CurveFlag([], points, params);
    }
    return null;
  }

  /**
   * 激活标绘绘制
   * @param type 标绘类型
   * @param params 标绘参数
   */
  active(type: string, params: Record<string, unknown> = {}): void {
    this.disActive();
    this.deactiveMapTools();
    this.plotType = type;
    this.plotParams = params;
    if (type === PlotTypes.TEXTAREA) {
      this.activeInteraction();
    } else if (Object.keys(PlotTypes).some(key => (PlotTypes[key] === type))) {
      this.map.on('click', this.mapFirstClickHandler);
    } else {
      console.warn('不存在的标绘类型！');
    }
  }

  /**
   * 激活文本框绘制交互
   */
  private activeInteraction(): void {
    this.drawInteraction_ = new $DrawInteraction({
      style: new $Style({
        fill: new $Fill({
          color: 'rgba(255, 255, 255, 0.7)'
        }),
        stroke: new $Stroke({
          color: 'rgba(0, 0, 0, 0.15)',
          width: 2
        }),
        image: new $Icon({
          anchor: [1, 1],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          opacity: 0.75,
          src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABgklEQVQ4T41T0W3CQAy1lfwRqR0h/CE5UhkBJmiZADpB0wlKJwA2aDegE5QR+Igl/noj9OPuLydXPuXQEYUKS5FyPvvd87ONRDRFxEdr7c4Y8ws3WFmW90VRvIjIF1ZVtQaANxHhE3OuaiV3oaYEdGHc65GDZhMJuXpdDJ99hqkPmZe9e9iTgCoqmrWNM0hDerq/FGftXbcZxFzAgARrZg5vBaNiGpE3OhZRF6Zedu7DzkRYMrMKlQKYBBRQVVgw8zj3n3IGWSg9ESkds6tiqJQbe4AYJ6WGVkPAqh4+romdP9LbXMqZh/gXIKqm+d5EK9vbduOY7d0AAdL6AYLmqbRAQtGRMc4ONF/wSC2RF/PsuwbABapqLEjKqb3fq4sLtoYh6Lbiydr7TbtuwYDgH5qB9XmPEjdKG+Y+Xmo7ms+Lcs5N0uX6ei9X9y4TGtEXIZlukb7PzbdmNcisv8DtQILak2vZsYAAAAASUVORK5CYII='
        })
      }),
      type: 'Circle',
      geometryFunction: createBox()
    });
    this.map.addInteraction(this.drawInteraction_);
    this.drawInteraction_.on('drawend', this.textAreaDrawEnd);
  }

  /**
   * 文本框绘制结束回调
   * @param event 绘制事件
   */
  private textAreaDrawEnd(event: any): void {
    if (event && event.feature) {
      this.map.removeInteraction(this.drawInteraction_!);
      const extent = event.feature.getGeometry().getExtent();
      const _center = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
      const topLeft = this.map.getPixelFromCoordinate([extent[0], extent[1]]);
      const bottomRight = this.map.getPixelFromCoordinate([extent[2], extent[3]]);
      const [_width, _height] = [Math.abs(topLeft[0] - bottomRight[0]), Math.abs(topLeft[1] - bottomRight[1])];
      const _plotText = new PlotTextBox({
        id: getuuid(),
        position: _center,
        value: '',
        width: _width,
        height: _height,
        style: {
          width: _width + 'px',
          height: _height + 'px'
        }
      });
      if (this.map && this.map instanceof Map && _plotText) {
        this.map.addOverlay(_plotText);
      } else {
        console.warn('未传入地图对象或者plotText创建失败！');
      }
    } else {
      console.info('未获取到要素！');
    }
  }

  /**
   * 取消激活标绘绘制
   */
  disActive(): void {
    this.removeEventHandlers();
    if (this.drawInteraction_) {
      this.map.removeInteraction(this.drawInteraction_);
      this.drawInteraction_ = null;
    }
    this.points = [];
    this.plot = null;
    this.feature = null;
    this.plotType = null;
    this.plotParams = null;
    this.activateMapTools();
  }

  /**
   * 判断是否正在绘制中
   * @returns 是否正在绘制
   */
  isDrawing(): boolean {
    return !!this.plotType;
  }

  /**
   * 地图首次点击回调
   * @param event 地图浏览器事件
   */
  private mapFirstClickHandler(event: any): void {
    this.map.un('click', this.mapFirstClickHandler);
    this.points!.push(event.coordinate as Coordinate);
    this.plot = this.createPlot(this.plotType!, this.points!, this.plotParams!);
    this.feature = new Feature(this.plot);
    this.feature.set('isPlot', true);
    this.drawLayer.getSource().addFeature(this.feature);
    if (this.plotType === PlotTypes.POINT || this.plotType === PlotTypes.PENNANT) {
      this.plot.finishDrawing();
      this.drawEnd(event);
    } else {
      this.map.on('click', this.mapNextClickHandler);
      if (!this.plot.freehand) {
        this.map.on('dblclick', this.mapDoubleClickHandler);
      }
      this.map.un('pointermove', this.mapMouseMoveHandler);
      this.map.on('pointermove', this.mapMouseMoveHandler);
    }
    if (this.plotType && this.feature) {
      this.plotParams!['plotType'] = this.plotType;
      this.feature.setProperties(this.plotParams);
    }
  }

  /**
   * 地图后续点击回调
   * @param event 地图浏览器事件
   */
  private mapNextClickHandler(event: any): void {
    if (!this.plot.freehand) {
      if (MathDistance(event.coordinate as Coordinate, this.points![this.points!.length - 1]) < 0.0001) {
        return;
      }
    }
    this.points!.push(event.coordinate as Coordinate);
    this.plot.setPoints(this.points);
    if (this.plot.fixPointCount === this.plot.getPointCount()) {
      this.mapDoubleClickHandler(event);
    }
    if (this.plot && this.plot.freehand) {
      this.mapDoubleClickHandler(event);
    }
  }

  /**
   * 地图双击回调
   * @param event 地图浏览器事件
   */
  private mapDoubleClickHandler(event: any): void {
    event.preventDefault();
    this.plot.finishDrawing();
    this.drawEnd(event);
  }

  /**
   * 鼠标移动回调
   * @param event 地图浏览器事件
   */
  private mapMouseMoveHandler(event: any): void {
    const coordinate = event.coordinate as Coordinate;
    if (MathDistance(coordinate, this.points![this.points!.length - 1]) < 0.0001) {
      return;
    }
    if (!this.plot.freehand) {
      const pnts = this.points!.concat([coordinate]);
      this.plot.setPoints(pnts);
    } else {
      this.points!.push(coordinate);
      this.plot.setPoints(this.points);
    }
  }

  /**
   * 移除所有事件监听器
   */
  private removeEventHandlers(): void {
    this.map.un('click', this.mapFirstClickHandler);
    this.map.un('click', this.mapNextClickHandler);
    this.map.un('pointermove', this.mapMouseMoveHandler);
    this.map.un('dblclick', this.mapDoubleClickHandler);
  }

  /**
   * 绘制结束回调
   * @param event 地图浏览器事件
   */
  private drawEnd(event: any): void {
    if (this.feature && this.options['isClear']) {
      this.drawLayer.getSource().removeFeature(this.feature);
    }
    console.log('PlotDraw绘制结束geojson数据', JSON.parse(new GeoJSON().writeFeature(this.feature!)));
    this.disActive();
  }

  /**
   * 添加要素到图层
   */
  addFeature(): void {
    this.feature = new Feature(this.plot);
    if (this.feature && this.drawLayer) {
      this.drawLayer.getSource().addFeature(this.feature);
    }
  }

  /**
   * 禁用地图拖拽工具
   */
  private deactiveMapTools(): void {
    const interactions = this.map.getInteractions().getArray();
    interactions.every(item => {
      if (item instanceof DoubleClickZoom) {
        this.dblClickZoomInteraction = item;
        this.map.removeInteraction(item);
        return false;
      } else {
        return true;
      }
    });
  }

  /**
   * 激活地图拖拽工具
   */
  private activateMapTools(): void {
    if (this.dblClickZoomInteraction && this.dblClickZoomInteraction instanceof DoubleClickZoom) {
      this.map.addInteraction(this.dblClickZoomInteraction);
      this.dblClickZoomInteraction = null;
    }
  }
}
export default PlotDraw;
