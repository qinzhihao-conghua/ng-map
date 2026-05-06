/**
 * Created by FDD on 2017/5/25.
 * @desc 扇形
 * @Inherits ol.geom.Polygon
 */
import { Map } from 'ol';
import { Polygon as $Polygon } from 'ol/geom';
import { SECTOR } from '../../Utils/PlotTypes';
import * as PlotUtils from '../../Utils/utils';
import { Coordinate } from 'ol/coordinate';

class Sector extends $Polygon {
  type: string;
  points: Coordinate[];
  map: Map | undefined;
  fixPointCount: number;
  options: Record<string, unknown>;

  constructor(coordinates: Coordinate[] | undefined, points: Coordinate[] | undefined, params: Record<string, unknown> | undefined) {
    super([]);
    this.type = SECTOR;
    this.fixPointCount = 3;
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
   * 生成扇形图形
   */
  generate(): void {
    const points = this.getPointCount();
    if (points < 2) {
      return;
    } else if (points === 2) {
      this.setCoordinates([this.points]);
    } else {
      const pnts = this.getPoints();
      const center = pnts[0];
      const pnt2 = pnts[1];
      const pnt3 = pnts[2];
      const radius = PlotUtils.MathDistance(pnt2, center);
      const startAngle = PlotUtils.getAzimuth(pnt2, center);
      const endAngle = PlotUtils.getAzimuth(pnt3, center);
      const pList = PlotUtils.getArcPoints(center, radius, startAngle, endAngle);
      pList.push(center, pList[0]);
      this.setCoordinates([pList]);
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

export default Sector;
