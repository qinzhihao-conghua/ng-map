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

// import Observable from 'observable-emit'
import { getuuid, MathDistance, bindAll } from '../Utils/utils'
import { BASE_LAYERNAME } from '../Constants'
import { createVectorLayer } from '../Utils/layerUtils'
import PlotTextBox from '../Geometry/Text/PlotTextBox'
import * as Plots from '../Geometry/index'
import * as PlotTypes from '../Utils/PlotTypes'
// import GeoJSON from "ol/format/GeoJSON";
import { GeoJSON } from 'ol/format';
import VectorLayer from 'ol/layer/Vector'
import MapBrowserEvent from 'ol/MapBrowserEvent';
import { Coordinate } from 'ol/coordinate'
class PlotDraw {
  constructor(map: Map) {
    // super()
    if (map && map instanceof Map) {
      this.map = map
    } else {
      throw new Error('传入的不是地图对象！')
    }


    /**
     * 创建图层名称
     * @type {string}
     */
    this.layerName = ((this.options && this.options['layerName']) ? this.options['layerName'] : BASE_LAYERNAME)
    this.mapViewport = this.map.getViewport()
    bindAll([
      'textAreaDrawEnd',
      'mapFirstClickHandler',
      'mapNextClickHandler',
      'mapDoubleClickHandler',
      'mapMouseMoveHandler'
    ], this)

    this.drawLayer = createVectorLayer(this.map, this.layerName, { create: true })
    this.drawLayer.setZIndex(this.options['zIndex'] || 99)
  }
  map: Map;
  options = {};
  /** 当前矢量图层 */
  drawLayer: VectorLayer;
  layerName: string;
  /** 交互点 */
  points: Array<Coordinate> = null;
  /** 当前标绘工具 */
  plot = null
  /** 当前要素 */
  feature: Feature<any> = null
  /** 标绘类型 */
  plotType: string = null
  /** 当前标绘参数，给标绘图形的参数，目前发现是在new 类型的时候this.set('params', this.options) */
  plotParams = null
  /** 当前地图视图 */
  mapViewport: Element = null;
  /** 地图双击交互 */
  dblClickZoomInteraction: DoubleClickZoom = null
  /** draw交互工具，就是Draw实例 */
  private drawInteraction_: $DrawInteraction = null

  /**
   * 创建Plot，标绘类型
   * @param type 类型
   * @param points 标会点集合
   * @param _params 参数
   */
  createPlot(type: string, points, _params) {
    let params = _params || {}
    switch (type) {
      case PlotTypes.TEXTAREA:
        return 'TextArea'
      case PlotTypes.POINT:
        return new Plots.Point([], points, params)
      case PlotTypes.PENNANT:
        return new Plots.Pennant([], points, params)
      case PlotTypes.POLYLINE:
        return new Plots.Polyline([], points, params)
      case PlotTypes.ARC:
        return new Plots.Arc([], points, params)
      case PlotTypes.CIRCLE:
        return new Plots.Circle([], points, params)
      case PlotTypes.CURVE:
        return new Plots.Curve([], points, params)
      case PlotTypes.FREEHANDLINE:
        return new Plots.FreeHandLine([], points, params)
      case PlotTypes.RECTANGLE:
        return new Plots.RectAngle([], points, params)
      case PlotTypes.ELLIPSE:
        return new Plots.Ellipse([], points, params)
      case PlotTypes.LUNE:
        return new Plots.Lune([], points, params)
      case PlotTypes.SECTOR:
        return new Plots.Sector([], points, params)
      case PlotTypes.CLOSED_CURVE:
        return new Plots.ClosedCurve([], points, params)
      case PlotTypes.POLYGON:
        return new Plots.Polygon([], points, params)
      case PlotTypes.ATTACK_ARROW:
        return new Plots.AttackArrow([], points, params)
      case PlotTypes.FREE_POLYGON:
        return new Plots.FreePolygon([], points, params)
      case PlotTypes.DOUBLE_ARROW:
        return new Plots.DoubleArrow([], points, params)
      case PlotTypes.STRAIGHT_ARROW:
        return new Plots.StraightArrow([], points, params)
      case PlotTypes.FINE_ARROW:
        return new Plots.FineArrow([], points, params)
      case PlotTypes.ASSAULT_DIRECTION:
        return new Plots.AssaultDirection([], points, params)
      case PlotTypes.TAILED_ATTACK_ARROW:
        return new Plots.TailedAttackArrow([], points, params)
      case PlotTypes.SQUAD_COMBAT:
        return new Plots.SquadCombat([], points, params)
      case PlotTypes.TAILED_SQUAD_COMBAT:
        return new Plots.TailedSquadCombat([], points, params)
      case PlotTypes.GATHERING_PLACE:
        return new Plots.GatheringPlace([], points, params)
      case PlotTypes.RECTFLAG:
        return new Plots.RectFlag([], points, params)
      case PlotTypes.TRIANGLEFLAG:
        return new Plots.TriangleFlag([], points, params)
      case PlotTypes.CURVEFLAG:
        return new Plots.CurveFlag([], points, params)
    }
    return null
  }

  /**
   * 激活工具
   * @param type
   * @param params
   */
  active(type: string, params = {}) {
    this.disActive()
    this.deactiveMapTools()
    this.plotType = type
    this.plotParams = params
    if (type === PlotTypes.TEXTAREA) {
      this.activeInteraction()
    } else if (Object.keys(PlotTypes).some(key => (PlotTypes[key] === type))) {
      this.map.on('click', this.mapFirstClickHandler)
    } else {
      console.warn('不存在的标绘类型！')
    }
  }

  /**
   * 激活交互工具
   */
  activeInteraction() {
    // Draw as $DrawInteraction
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
          anchorXUnits: ('fraction' as any),
          anchorYUnits: ('fraction' as any),
          opacity: 0.75,
          src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABgklEQVQ4T41T0W3CQAy1lfwRqR0h/CE5UhkBJmiZADpB0wlKJwA2aDegE5QR+Igl/noj9OPuLydXPuXQEYUKS5FyPvvd87ONRDRFxEdr7c4Y8ws3WFmW90VRvIjIF1ZVtQaANxH59N6v8zwvRaQEgCMATDu88I+Ipm1bk2XZHhEfAOAdFW00Gh2YOQafOeidHoaYEdGHc65GDZhMJuXpdDJ99hqkPmZe9e9iTgCoqmrWNM0hDerq/FGftXbcZxFzAgARrZg5vBaNiGpE3OhZRF6Zedu7DzkRYMrMKlQKYBBRQVVgw8zj3n3IGWSg9ESkds6tiqJQbe4AYJ6WGVkPAqh4+romdP9LbXMqZh/gXIKqm+d5EK9vbduOY7d0AAdL6AYLmqbRAQtGRMc4ONF/wSC2RF/PsuwbABapqLEjKqb3fq4sLtoYh6Lbiydr7TbtuwYDgH5qB9XmPEjdKG+Y+Xmo7ms+Lcs5N0uX6ei9X9y4TGtEXIZlukb7PzbdmNcisv8DtQILak2vZsYAAAAASUVORK5CYII='
        })
      }),
      type: ('Circle' as any),
      geometryFunction: createBox()
    })
    this.map.addInteraction(this.drawInteraction_)
    this.drawInteraction_.on('drawend', this.textAreaDrawEnd)
  }

  /**
   * 绘制结束
   * @param event
   */
  textAreaDrawEnd(event) {
    if (event && event.feature) {
      this.map.removeInteraction(this.drawInteraction_)
      const extent = event.feature.getGeometry().getExtent()
      const _center = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2]
      const topLeft = this.map.getPixelFromCoordinate([extent[0], extent[1]])
      const bottomRight = this.map.getPixelFromCoordinate([extent[2], extent[3]])
      const [_width, _height] = [Math.abs(topLeft[0] - bottomRight[0]), Math.abs(topLeft[1] - bottomRight[1])]
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
      })
      if (this.map && this.map instanceof Map && _plotText) {
        this.map.addOverlay(_plotText)
      } else {
        console.warn('未传入地图对象或者plotText创建失败！')
      }
    } else {
      console.info('未获取到要素！')
    }
  }

  /**
   * 取消激活状态
   */
  disActive() {
    this.removeEventHandlers()
    if (this.drawInteraction_) {
      this.map.removeInteraction(this.drawInteraction_)
      this.drawInteraction_ = null
    }
    this.points = []
    this.plot = null
    this.feature = null
    this.plotType = null
    this.plotParams = null
    this.activateMapTools()
  }

  /**
   * PLOT是否处于激活状态
   */
  isDrawing() {
    return !!this.plotType
  }

  /**
   * 地图事件处理
   * 激活工具后第一次点击事件
   * @param event
   */
  mapFirstClickHandler(event: MapBrowserEvent) {
    // 解绑
    this.map.un('click', this.mapFirstClickHandler)
    this.points.push(event.coordinate)
    // 创建的标绘类型
    this.plot = this.createPlot(this.plotType, this.points, this.plotParams)
    this.feature = new Feature(this.plot)
    this.feature.set('isPlot', true)
    this.drawLayer.getSource().addFeature(this.feature)
    if (this.plotType === PlotTypes.POINT || this.plotType === PlotTypes.PENNANT) {
      this.plot.finishDrawing()
      this.drawEnd(event)
    } else {// 不是点类型则可以继续点击
      this.map.on('click', this.mapNextClickHandler)
      if (!this.plot.freehand) {
        this.map.on('dblclick', this.mapDoubleClickHandler)
      }
      this.map.un('pointermove', this.mapMouseMoveHandler)
      this.map.on('pointermove', this.mapMouseMoveHandler)
    }
    if (this.plotType && this.feature) {
      this.plotParams['plotType'] = this.plotType
      this.feature.setProperties(this.plotParams)
    }
  }

  /**
   * 地图点击事件处理
   * @param event
   */
  mapNextClickHandler(event: MapBrowserEvent) {
    if (!this.plot.freehand) {
      if (MathDistance(event.coordinate, this.points[this.points.length - 1]) < 0.0001) {
        return false
      }
    }
    this.points.push(event.coordinate)
    // 执行绘制动作
    this.plot.setPoints(this.points)
    if (this.plot.fixPointCount === this.plot.getPointCount()) {
      this.mapDoubleClickHandler(event)
    }
    if (this.plot && this.plot.freehand) {
      this.mapDoubleClickHandler(event)
    }
  }

  /**
   * 地图双击事件处理
   * @param event
   */
  mapDoubleClickHandler(event: MapBrowserEvent) {
    event.preventDefault()
    this.plot.finishDrawing()
    this.drawEnd(event)
  }

  /**
   * 地图事件处理
   * 鼠标移动事件
   * @param event
   */
  mapMouseMoveHandler(event: MapBrowserEvent) {
    let coordinate = event.coordinate
    if (MathDistance(coordinate, this.points[this.points.length - 1]) < 0.0001) {
      return false
    }
    if (!this.plot.freehand) {
      let pnts = this.points.concat([coordinate])
      this.plot.setPoints(pnts)
    } else {
      this.points.push(coordinate)
      this.plot.setPoints(this.points)
    }
  }

  /**
   * 移除事件监听
   */
  removeEventHandlers() {
    this.map.un('click', this.mapFirstClickHandler)
    this.map.un('click', this.mapNextClickHandler)
    this.map.un('pointermove', this.mapMouseMoveHandler)
    this.map.un('dblclick', this.mapDoubleClickHandler)
  }

  /**
   * 绘制结束
   */
  drawEnd(event: MapBrowserEvent) {
    // DOTO:需要将数据传出去
    if (this.feature && this.options['isClear']) {
      this.drawLayer.getSource().removeFeature(this.feature)
    }
    console.log('PlotDraw绘制结束geojson数据', JSON.parse(new GeoJSON().writeFeature(this.feature)))
    this.disActive()
  }

  /**
   * 添加要素
   */
  addFeature() {
    this.feature = new Feature(this.plot)
    if (this.feature && this.drawLayer) {
      this.drawLayer.getSource().addFeature(this.feature)
    }
  }

  /**
   * 取消激活地图交互工具
   */
  deactiveMapTools() {
    let interactions = this.map.getInteractions().getArray()
    interactions.every(item => {
      if (item instanceof DoubleClickZoom) {
        this.dblClickZoomInteraction = item
        this.map.removeInteraction(item)
        return false
      } else {
        return true
      }
    })
  }

  /**
   * 激活已取消的地图工具
   * 还原之前状态
   */
  activateMapTools() {
    if (this.dblClickZoomInteraction && this.dblClickZoomInteraction instanceof DoubleClickZoom) {
      this.map.addInteraction(this.dblClickZoomInteraction)
      this.dblClickZoomInteraction = null
    }
  }
}
export default PlotDraw
