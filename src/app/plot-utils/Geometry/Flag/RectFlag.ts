/**
 * Created by FDD on 2017/9/13.
 * @desc 直角旗标（使用两个控制点，直接创建直角旗标）
 */
import { Map } from 'ol';
import { Polygon } from 'ol/geom';
import { RECTFLAG } from '../../Utils/PlotTypes';
import { Coordinate } from 'ol/coordinate';

class RectFlag extends Polygon {
  type: string;
  points: Coordinate[];
  map: Map | undefined;
  fixPointCount: number;

  constructor(coordinates: Coordinate[] | undefined, points: Coordinate[] | undefined, params: Record<string, unknown> | undefined) {
    super([]);
    this.type = RECTFLAG;
    this.fixPointCount = 2;
    this.points = [];
    this.set('params', params);
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
   * 生成直角旗标图形
   */
  generate(): void {
    const count = this.getPointCount();
    if (count < 2) {
      return;
    } else {
      this.setCoordinates([this.calculatePoints(this.points)]);
    }
  }

  /**
   * 计算直角旗标的点集
   * @param points 控制点数组
   * @returns 点坐标数组
   */
  calculatePoints(points: Coordinate[]): Coordinate[] {
    let components: Coordinate[] = [];
    if (points.length > 1) {
      const startPoint = points[0];
      const endPoint = points[points.length - 1];
      const point1: Coordinate = [endPoint[0], startPoint[1]];
      const point2: Coordinate = [endPoint[0], (startPoint[1] + endPoint[1]) / 2];
      const point3: Coordinate = [startPoint[0], (startPoint[1] + endPoint[1]) / 2];
      const point4: Coordinate = [startPoint[0], endPoint[1]];
      components = [startPoint, point1, point2, point3, point4];
    }
    return components;
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

export default RectFlag;
