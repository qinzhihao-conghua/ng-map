/**
 * Created by FDD on 2017/5/22.
 * @desc 标绘画椭圆算法，继承面要素相关方法和属性
 */
import { Map } from 'ol';
import { Polygon } from 'ol/geom';
import { ELLIPSE } from '../../Utils/PlotTypes';
import * as Constants from '../../Constants';
import * as PlotUtils from '../../Utils/utils';
import { Coordinate } from 'ol/coordinate';

class Ellipse extends Polygon {
  type: string;
  points: Coordinate[];
  map: Map | undefined;
  fixPointCount: number;
  options: Record<string, unknown>;

  constructor(coordinates: Coordinate[] | undefined, points: Coordinate[] | undefined, params: Record<string, unknown> | undefined) {
    super([]);
    this.type = ELLIPSE;
    this.fixPointCount = 2;
    this.options = params || {};
    this.points = [];
    this.set('params', this.options);
    if (points && points.length > 0) {
      this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      this.setCoordinates(coordinates as any);
    }
  }

  /**
   * 获取标绘类型
   * @returns 标绘类型
   */
  getPlotType(): string {
    return this.type;
  }

  /**
   * 生成椭圆图形
   */
  generate(): void {
    if (this.getPointCount() < 2) {
      return;
    } else {
      const pnt1 = this.points[0];
      const pnt2 = this.points[1];
      const center = PlotUtils.Mid(pnt1, pnt2);
      const majorRadius = Math.abs((pnt1[0] - pnt2[0]) / 2);
      const minorRadius = Math.abs((pnt1[1] - pnt2[1]) / 2);
      const res = this.generatePoints(center, majorRadius, minorRadius);
      this.setCoordinates([res]);
    }
  }

  /**
   * 生成椭圆的点集合
   * @param center 椭圆中心坐标
   * @param majorRadius 长半轴半径
   * @param minorRadius 短半轴半径
   * @returns 点坐标数组
   */
  generatePoints(center: Coordinate, majorRadius: number, minorRadius: number): Coordinate[] {
    const points: Coordinate[] = [];
    for (let i = 0; i <= Constants.FITTING_COUNT; i++) {
      const angle = Math.PI * 2 * i / Constants.FITTING_COUNT;
      const x = center[0] + majorRadius * Math.cos(angle);
      const y = center[1] + minorRadius * Math.sin(angle);
      points.push([x, y]);
    }
    return points;
  }

  /**
   * 设置地图对象
   * @param map 地图对象
   */
  setMap(map: Map): void {
    if (map && map instanceof Map) {
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }
  }

  /**
   * 获取地图对象
   * @returns 地图对象
   */
  getMap(): Map | undefined {
    return this.map;
  }

  /**
   * 判断是否为标绘对象
   * @returns 是否为标绘对象
   */
  isPlot(): boolean {
    return true;
  }

  /**
   * 设置控制点
   * @param value 控制点数组
   */
  setPoints(value: Coordinate[]): void {
    this.points = !value ? [] : value;
    if (this.points.length >= 1) {
      this.generate();
    }
  }

  /**
   * 获取控制点
   * @returns 控制点数组
   */
  getPoints(): Coordinate[] {
    return this.points.slice(0);
  }

  /**
   * 获取控制点数量
   * @returns 控制点数量
   */
  getPointCount(): number {
    return this.points.length;
  }

  /**
   * 更新指定索引的控制点
   * @param point 新的控制点
   * @param index 控制点索引
   */
  updatePoint(point: Coordinate, index: number): void {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = point;
      this.generate();
    }
  }

  /**
   * 更新最后一个控制点
   * @param point 新的控制点
   */
  updateLastPoint(point: Coordinate): void {
    this.updatePoint(point, this.points.length - 1);
  }

  /**
   * 完成绘制
   */
  finishDrawing(): void {
  }
}

export default Ellipse;
