/**
 * Created by FDD on 2017/5/15.
 * @desc 点要素
 */
import { Map } from 'ol';
import { Point as $Point } from 'ol/geom';
import { POINT } from '../../Utils/PlotTypes';
import { Coordinate } from 'ol/coordinate';

class Point extends $Point {
  type: string;
  points: Coordinate[];
  map: Map | undefined;
  options: Record<string, unknown>;
  fixPointCount: number;

  constructor(coordinates: Coordinate[] | undefined, point: Coordinate[] | undefined, params: Record<string, unknown> | undefined) {
    super([]);
    this.type = POINT;
    this.options = params || {};
    this.points = [];
    this.fixPointCount = 1;
    this.set('params', this.options);
    if (point && point.length > 0) {
      this.setPoints(point);
    } else if (coordinates && coordinates.length > 0) {
      this.setCoordinates(coordinates);
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
   * 生成图形
   */
  generate(): void {
    const pnt = this.points[0];
    this.setCoordinates(pnt);
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
   * 是否为标绘
   * @returns 是否为标绘
   */
  isPlot(): boolean {
    return true;
  }

  /**
   * 设置点集
   * @param value 点集
   */
  setPoints(value: Coordinate[]): void {
    this.points = !value ? [] : value;
    if (this.points.length >= 1) {
      this.generate();
    }
  }

  /**
   * 获取点集
   * @returns 点集
   */
  getPoints(): Coordinate[] {
    return this.points.slice(0);
  }

  /**
   * 获取点数量
   * @returns 点数量
   */
  getPointCount(): number {
    return this.points.length;
  }

  /**
   * 更新点
   * @param point 新点坐标
   * @param index 点索引
   */
  updatePoint(point: Coordinate, index: number): void {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = point;
      this.generate();
    }
  }

  /**
   * 更新最后一个点
   * @param point 新点坐标
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

export default Point;
