/**
 * Created by FDD on 2017/5/15.
 * @desc 点要素
 */
import { Map } from 'ol';
import { Point as $Point } from 'ol/geom';
import { POINT } from '../../Utils/PlotTypes';
import { Coordinate } from 'ol/coordinate';
class Point extends $Point {
  constructor(coordinates: Array<Coordinate>, point: Array<Coordinate>, params) {
    super([])
    this.type = POINT
    this.options = params || {}
    this.set('params', this.options)
    this.fixPointCount = 1
    if (point && point.length > 0) {
      this.setPoints(point)
    } else if (coordinates && coordinates.length > 0) {
      this.setCoordinates(coordinates)
    }
  }
  type: string;
  points: Array<any> = [];
  map: Map;
  options;
  fixPointCount: number;
  /**
   * 获取标绘类型
   */
  getPlotType() {
    return this.type
  }

  generate() {
    let pnt = this.points[0]
    this.setCoordinates(pnt)
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

export default Point
