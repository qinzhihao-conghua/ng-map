/**
 * Created by FDD on 2017/5/24.
 * @desc 粗单尖头箭头
 * @Inherits ol.geom.Polygon
 */
import { Map } from 'ol';
import { Polygon } from 'ol/geom';
import { FINE_ARROW } from '../../Utils/PlotTypes';
import * as PlotUtils from '../../Utils/utils';
import * as Constants from '../../Constants';
import { Coordinate } from 'ol/coordinate';

class FineArrow extends Polygon {
  type: string;
  points: Coordinate[];
  map: Map | undefined;
  tailWidthFactor: number;
  neckWidthFactor: number;
  headWidthFactor: number;
  headAngle: number;
  neckAngle: number;
  fixPointCount: number;
  options: Record<string, unknown>;

  constructor(coordinates: Coordinate[] | undefined, points: Coordinate[] | undefined, params: Record<string, unknown> | undefined) {
    super([]);
    this.type = FINE_ARROW;
    this.tailWidthFactor = 0.1;
    this.neckWidthFactor = 0.2;
    this.headWidthFactor = 0.25;
    this.headAngle = Math.PI / 8.5;
    this.neckAngle = Math.PI / 13;
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
   * 生成粗单尖头箭头图形
   */
  generate(): void {
    try {
      const cont = this.getPointCount();
      if (cont < 2) {
        return;
      } else {
        const pnts = this.getPoints();
        const pnt1 = pnts[0];
        const pnt2 = pnts[1];
        const len = PlotUtils.getBaseLength(pnts);
        const tailWidth = len * this.tailWidthFactor;
        const neckWidth = len * this.neckWidthFactor;
        const headWidth = len * this.headWidthFactor;
        const tailLeft = PlotUtils.getThirdPoint(pnt2, pnt1, Constants.HALF_PI, tailWidth, true);
        const tailRight = PlotUtils.getThirdPoint(pnt2, pnt1, Constants.HALF_PI, tailWidth, false);
        const headLeft = PlotUtils.getThirdPoint(pnt1, pnt2, this.headAngle, headWidth, false);
        const headRight = PlotUtils.getThirdPoint(pnt1, pnt2, this.headAngle, headWidth, true);
        const neckLeft = PlotUtils.getThirdPoint(pnt1, pnt2, this.neckAngle, neckWidth, false);
        const neckRight = PlotUtils.getThirdPoint(pnt1, pnt2, this.neckAngle, neckWidth, true);
        const pList = [tailLeft, neckLeft, headLeft, pnt2, headRight, neckRight, tailRight];
        this.setCoordinates([pList]);
      }
    } catch (e) {
      console.log(e);
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

export default FineArrow;
