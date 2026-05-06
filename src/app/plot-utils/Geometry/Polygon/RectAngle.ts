/**
 * Created by FDD on 2017/5/24.
 * @desc 规则矩形
 * @Inherits ol.geom.Polygon
 */
import { Map } from 'ol';
import { Polygon as $Polygon } from 'ol/geom';
import { fromExtent } from 'ol/geom/Polygon';
import { boundingExtent } from 'ol/extent.js';
import { RECTANGLE } from '../../Utils/PlotTypes';
import { Coordinate } from 'ol/coordinate';

class RectAngle extends $Polygon {
  type: string;
  points: Coordinate[];
  map: Map | undefined;
  fixPointCount: number;
  isFill: boolean;
  options: Record<string, unknown>;

  constructor(coordinates: Coordinate[] | undefined, points: Coordinate[] | undefined, params: Record<string, unknown> | undefined) {
    super([]);
    this.type = RECTANGLE;
    this.fixPointCount = 2;
    this.options = params || {};
    this.points = [];
    this.isFill = ((params && params['isFill'] === false) ? params['isFill'] as boolean : true);
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
   * 生成矩形图形
   */
  generate(): void {
    if (this.points.length === 2) {
      let coordinates: Coordinate[][] | Coordinate[];
      if (this.isFill) {
        const extent = boundingExtent(this.points);
        const polygon = fromExtent(extent);
        coordinates = polygon.getCoordinates() as Coordinate[][];
      } else {
        const start = this.points[0];
        const end = this.points[1];
        coordinates = [start, [start[0], end[1]], end, [end[0], start[1]], start];
      }
      this.setCoordinates(coordinates as any);
    }
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

export default RectAngle;
