/**
 * Created by FDD on 2017/5/27.
 * @desc 集结地
 * @Inherits ol.geom.Polygon
 */
import { Map } from 'ol';
import { Polygon } from 'ol/geom';
import { GATHERING_PLACE } from '../../Utils/PlotTypes';
import * as PlotUtils from '../../Utils/utils';
import * as Constants from '../../Constants';
import { Coordinate } from 'ol/coordinate';

class GatheringPlace extends Polygon {
  type: string;
  points: Coordinate[];
  map: Map | undefined;
  fixPointCount: number;
  t: number;
  options: Record<string, unknown>;

  constructor(coordinates: Coordinate[] | undefined, points: Coordinate[] | undefined, params: Record<string, unknown> | undefined) {
    super([]);
    this.type = GATHERING_PLACE;
    this.t = 0.4;
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
   * 生成集结地图形
   */
  generate(): void {
    let pnts = this.getPoints();
    const pointCount = this.getPointCount();
    if (pnts.length < 2) {
      return;
    } else {
      if (pointCount === 2) {
        const mid = PlotUtils.Mid(pnts[0], pnts[1]);
        const d = PlotUtils.MathDistance(pnts[0], mid) / 0.9;
        const pnt = PlotUtils.getThirdPoint(pnts[0], mid, Constants.HALF_PI, d, true);
        pnts = [pnts[0], pnt, pnts[1]];
      }
      const mid = PlotUtils.Mid(pnts[0], pnts[2]);
      pnts.push(mid, pnts[0], pnts[1]);
      const normals: Coordinate[] = [];
      let pnt1: Coordinate;
      let pnt2: Coordinate;
      let pnt3: Coordinate;
      const pList: Coordinate[] = [];
      for (let i = 0; i < pnts.length - 2; i++) {
        pnt1 = pnts[i];
        pnt2 = pnts[i + 1];
        pnt3 = pnts[i + 2];
        const normalPoints = PlotUtils.getBisectorNormals(this.t, pnt1, pnt2, pnt3);
        normals.push(...normalPoints);
      }
      const count = normals.length;
      normals.unshift(normals[count - 1]);
      normals.splice(count, 1);
      for (let i = 0; i < pnts.length - 2; i++) {
        pnt1 = pnts[i];
        pnt2 = pnts[i + 1];
        pList.push(pnt1);
        for (let t = 0; t <= Constants.FITTING_COUNT; t++) {
          const pnt = PlotUtils.getCubicValue(t / Constants.FITTING_COUNT, pnt1, normals[i * 2], normals[i * 2 + 1], pnt2);
          pList.push(pnt);
        }
        pList.push(pnt2);
      }
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

export default GatheringPlace;
