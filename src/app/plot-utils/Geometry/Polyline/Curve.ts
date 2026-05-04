/**
 * Created by FDD on 2017/5/22.
 * @desc 标绘曲线算法
 */
import { Map } from 'ol'
import { LineString } from 'ol/geom'
import { CURVE } from '../../Utils/PlotTypes'
import * as PlotUtils from '../../Utils/utils'
class Curve extends LineString {
  constructor(coordinates, points, params) {
    super([])
    this.type = CURVE
    this.t = 0.3
    this.set('params', params)
    if (points && points.length > 0) {
      this.setPoints(points)
    } else if (coordinates && coordinates.length > 0) {
      this.setCoordinates(coordinates)
    }
  }
  type: string;
  t: number;
  points = [];
  map: Map;
  /**
   * 获取标绘类型
   */
  getPlotType() {
    return this.type
  }

  /**
   * 执行动作
   */
  generate() {
    let count = this.getPointCount()
    if (count < 2) {
      return false
    } else if (count === 2) {
      this.setCoordinates(this.points)
    } else {
      let points = PlotUtils.getCurvePoints(this.t, this.points)
      this.setCoordinates(points)
    }
  }

  /**
   * 设置地图对象
   * @param map
   */
  setMap(map: Map) {
    if (map && map instanceof Map) {
      this.map = map
    } else {
      throw new Error('传入的不是地图对象！')
    }
  }

  /**
   * 获取当前地图对象
   */
  getMap() {
    return this.map
  }

  /**
   * 判断是否是Plot
   */
  isPlot() {
    return true
  }

  /**
   * 设置坐标点
   * @param value
   */
  setPoints(value) {
    this.points = !value ? [] : value
    if (this.points.length >= 1) {
      this.generate()
    }
  }

  /**
   * 获取坐标点
   */
  getPoints() {
    return this.points.slice(0)
  }

  /**
   * 获取点数量
   */
  getPointCount() {
    return this.points.length
  }

  /**
   * 更新当前坐标
   * @param point
   * @param index
   */
  updatePoint(point, index) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = point
      this.generate()
    }
  }

  /**
   * 更新最后一个坐标
   * @param point
   */
  updateLastPoint(point) {
    this.updatePoint(point, this.points.length - 1)
  }

  /**
   * 结束绘制
   */
  finishDrawing() {
  }
}

export default Curve
