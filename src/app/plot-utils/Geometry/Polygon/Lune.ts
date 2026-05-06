/**
 * Created by FDD on 2017/5/24.
 * @desc 弓形
 * @Inherits ol.geom.Polygon
 */
import { Map } from 'ol';
import { Polygon } from 'ol/geom';
import { LUNE } from '../../Utils/PlotTypes';
import * as Constants from '../../Constants';
import * as PlotUtils from '../../Utils/utils';
import { Coordinate } from 'ol/coordinate';

class Lune extends Polygon {
  type: string;
  points: Coordinate[];
  map: Map | undefined;
  fixPointCount: number;
  options: Record<string, unknown>;

  constructor(coordinates: Coordinate[] | undefined, points: Coordinate[] | undefined, params: Record<string, unknown> | undefined) {
    super([]);
    this.type = LUNE;
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
   * 生成弓形图形
   */
  generate(): void {
    if (this.getPointCount() < 2) {
      return;
    } else {
      const pnts = this.getPoints();
      if (this.getPointCount() === 2) {
        const mid = PlotUtils.Mid(pnts[0], pnts[1]);
        const d = PlotUtils.MathDistance(pnts[0], mid);
        const pnt = PlotUtils.getThirdPoint(pnts[0], mid, Constants.HALF_PI, d, false);
        pnts.push(pnt);
      }
      const pnt1 = pnts[0];
      const pnt2 = pnts[1];
      const pnt3 = pnts[2];
      let startAngle: number | undefined;
      let endAngle: number | undefined;
      const center = PlotUtils.getCircleCenterOfThreePoints(pnt1, pnt2, pnt3);
      const radius = PlotUtils.MathDistance(pnt1, center);
      const angle1 = PlotUtils.getAzimuth(pnt1, center);
      const angle2 = PlotUtils.getAzimuth(pnt2, center);
      if (PlotUtils.isClockWise(pnt1, pnt2, pnt3)) {
        startAngle = angle2;
        endAngle = angle1;
      } else {
        startAngle = angle1;
        endAngle = angle2;
      }
      const arcPoints = PlotUtils.getArcPoints(center, radius, startAngle, endAngle);
      arcPoints.push(arcPoints[0]);
      this.setCoordinates([arcPoints]);
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

export default Lune;
