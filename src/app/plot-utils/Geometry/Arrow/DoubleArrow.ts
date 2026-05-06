/**
 * Created by FDD on 2017/5/24.
 * @desc 双箭头
 * @Inherits ol.geom.Polygon
 */
import { Map } from 'ol';
import { Polygon } from 'ol/geom';
import { DOUBLE_ARROW } from '../../Utils/PlotTypes';
import * as Constants from '../../Constants';
import * as PlotUtils from '../../Utils/utils';
import { Coordinate } from 'ol/coordinate';

class DoubleArrow extends Polygon {
  type: string;
  points: Coordinate[];
  map: Map | undefined;
  headHeightFactor: number;
  headWidthFactor: number;
  neckHeightFactor: number;
  neckWidthFactor: number;
  connPoint: Coordinate | null;
  tempPoint4: Coordinate | null;
  fixPointCount: number;
  options: Record<string, unknown>;

  constructor(coordinates: Coordinate[] | undefined, points: Coordinate[] | undefined, params: Record<string, unknown> | undefined) {
    super([]);
    this.type = DOUBLE_ARROW;
    this.headHeightFactor = 0.25;
    this.headWidthFactor = 0.3;
    this.neckHeightFactor = 0.85;
    this.neckWidthFactor = 0.15;
    this.connPoint = null;
    this.tempPoint4 = null;
    this.fixPointCount = 4;
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
   * 生成双箭头图形
   */
  generate(): void {
    try {
      const count = this.getPointCount();
      if (count < 2) {
        return;
      } else if (count === 2) {
        this.setCoordinates([this.points]);
        return;
      }
      if (count > 2) {
        const pnt1 = this.points[0];
        const pnt2 = this.points[1];
        const pnt3 = this.points[2];
        if (count === 3) {
          this.tempPoint4 = this.getTempPoint4(pnt1, pnt2, pnt3);
          this.connPoint = PlotUtils.Mid(pnt1, pnt2);
        } else if (count === 4) {
          this.tempPoint4 = this.points[3];
          this.connPoint = PlotUtils.Mid(pnt1, pnt2);
        } else {
          this.tempPoint4 = this.points[3];
          this.connPoint = this.points[4];
        }
        let leftArrowPnts: Coordinate[] | undefined;
        let rightArrowPnts: Coordinate[] | undefined;
        if (PlotUtils.isClockWise(pnt1, pnt2, pnt3)) {
          leftArrowPnts = this.getArrowPoints(pnt1, this.connPoint!, this.tempPoint4!, false);
          rightArrowPnts = this.getArrowPoints(this.connPoint!, pnt2, pnt3, true);
        } else {
          leftArrowPnts = this.getArrowPoints(pnt2, this.connPoint!, pnt3, false);
          rightArrowPnts = this.getArrowPoints(this.connPoint!, pnt1, this.tempPoint4!, true);
        }
        const m = leftArrowPnts!.length;
        const t = (m - 5) / 2;
        const llBodyPnts = leftArrowPnts!.slice(0, t);
        const lArrowPnts = leftArrowPnts!.slice(t, t + 5);
        const lrBodyPnts = leftArrowPnts!.slice(t + 5, m);
        const rlBodyPnts = rightArrowPnts!.slice(0, t);
        const rArrowPnts = rightArrowPnts!.slice(t, t + 5);
        const rrBodyPnts = rightArrowPnts!.slice(t + 5, m);
        const rlBodySmooth = PlotUtils.getBezierPoints(rlBodyPnts);
        const bodySmooth = PlotUtils.getBezierPoints(rrBodyPnts.concat(llBodyPnts.slice(1)));
        const lrBodySmooth = PlotUtils.getBezierPoints(lrBodyPnts);
        const pnts = rlBodySmooth.concat(rArrowPnts, bodySmooth, lArrowPnts, lrBodySmooth);
        this.setCoordinates([pnts]);
      }
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * 获取箭头点集
   * @param pnt1 起始点1
   * @param pnt2 起始点2
   * @param pnt3 目标点
   * @param clockWise 是否顺时针
   * @returns 箭头点集
   */
  getArrowPoints(pnt1: Coordinate, pnt2: Coordinate, pnt3: Coordinate, clockWise: boolean): Coordinate[] {
    const midPnt = PlotUtils.Mid(pnt1, pnt2);
    const len = PlotUtils.MathDistance(midPnt, pnt3);
    const midPnt1 = PlotUtils.getThirdPoint(pnt3, midPnt, 0, len * 0.3, true);
    const midPnt2 = PlotUtils.getThirdPoint(pnt3, midPnt, 0, len * 0.5, true);
    const midPnt1Offset = PlotUtils.getThirdPoint(midPnt, midPnt1, Constants.HALF_PI, len / 5, clockWise);
    const midPnt2Offset = PlotUtils.getThirdPoint(midPnt, midPnt2, Constants.HALF_PI, len / 4, clockWise);
    const points = [midPnt, midPnt1Offset, midPnt2Offset, pnt3];
    const arrowPnts = this.getArrowHeadPoints(points);
    if (arrowPnts && Array.isArray(arrowPnts) && arrowPnts.length > 0) {
      const neckLeftPoint = arrowPnts[0];
      const neckRightPoint = arrowPnts[4];
      const tailWidthFactor = PlotUtils.MathDistance(pnt1, pnt2) / PlotUtils.getBaseLength(points) / 2;
      const bodyPnts = this.getArrowBodyPoints(points, neckLeftPoint, neckRightPoint, tailWidthFactor);
      const n = bodyPnts.length;
      const lPoints = bodyPnts.slice(0, n / 2);
      const rPoints = bodyPnts.slice(n / 2, n);
      lPoints.push(neckLeftPoint);
      rPoints.push(neckRightPoint);
      lPoints.reverse();
      lPoints.push(pnt2);
      rPoints.reverse();
      rPoints.push(pnt1);
      return lPoints.reverse().concat(arrowPnts, rPoints);
    } else {
      throw new Error('插值出错');
    }
  }

  /**
   * 获取箭头头部点集
   * @param points 控制点集
   * @returns 箭头头部点集
   */
  getArrowHeadPoints(points: Coordinate[]): Coordinate[] {
    try {
      const len = PlotUtils.getBaseLength(points);
      const headHeight = len * this.headHeightFactor;
      const headPnt = points[points.length - 1];
      const headWidth = headHeight * this.headWidthFactor;
      const neckWidth = headHeight * this.neckWidthFactor;
      const neckHeight = headHeight * this.neckHeightFactor;
      const headEndPnt = PlotUtils.getThirdPoint(points[points.length - 2], headPnt, 0, headHeight, true);
      const neckEndPnt = PlotUtils.getThirdPoint(points[points.length - 2], headPnt, 0, neckHeight, true);
      const headLeft = PlotUtils.getThirdPoint(headPnt, headEndPnt, Constants.HALF_PI, headWidth, false);
      const headRight = PlotUtils.getThirdPoint(headPnt, headEndPnt, Constants.HALF_PI, headWidth, true);
      const neckLeft = PlotUtils.getThirdPoint(headPnt, neckEndPnt, Constants.HALF_PI, neckWidth, false);
      const neckRight = PlotUtils.getThirdPoint(headPnt, neckEndPnt, Constants.HALF_PI, neckWidth, true);
      return [neckLeft, headLeft, headPnt, headRight, neckRight];
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  /**
   * 获取箭头身体点集
   * @param points 控制点集
   * @param neckLeft 颈部左点
   * @param neckRight 颈部右点
   * @param tailWidthFactor 尾部宽度因子
   * @returns 箭头身体点集
   */
  getArrowBodyPoints(points: Coordinate[], neckLeft: Coordinate, neckRight: Coordinate, tailWidthFactor: number): Coordinate[] {
    const allLen = PlotUtils.wholeDistance(points);
    const len = PlotUtils.getBaseLength(points);
    const tailWidth = len * tailWidthFactor;
    const neckWidth = PlotUtils.MathDistance(neckLeft, neckRight);
    const widthDif = (tailWidth - neckWidth) / 2;
    let tempLen = 0;
    const leftBodyPnts: Coordinate[] = [];
    const rightBodyPnts: Coordinate[] = [];
    for (let i = 1; i < points.length - 1; i++) {
      const angle = PlotUtils.getAngleOfThreePoints(points[i - 1], points[i], points[i + 1]) / 2;
      tempLen += PlotUtils.MathDistance(points[i - 1], points[i]);
      const w = (tailWidth / 2 - tempLen / allLen * widthDif) / Math.sin(angle);
      const left = PlotUtils.getThirdPoint(points[i - 1], points[i], Math.PI - angle, w, true);
      const right = PlotUtils.getThirdPoint(points[i - 1], points[i], angle, w, false);
      leftBodyPnts.push(left);
      rightBodyPnts.push(right);
    }
    return leftBodyPnts.concat(rightBodyPnts);
  }

  /**
   * 获取第四个临时点
   * @param linePnt1 线段点1
   * @param linePnt2 线段点2
   * @param point 目标点
   * @returns 第四个临时点
   */
  getTempPoint4(linePnt1: Coordinate, linePnt2: Coordinate, point: Coordinate): Coordinate | undefined {
    try {
      const midPnt = PlotUtils.Mid(linePnt1, linePnt2);
      const len = PlotUtils.MathDistance(midPnt, point);
      const angle = PlotUtils.getAngleOfThreePoints(linePnt1, midPnt, point);
      let symPnt: Coordinate | undefined;
      let distance1: number;
      let distance2: number;
      let mid: Coordinate | undefined;
      if (angle < Constants.HALF_PI) {
        distance1 = len * Math.sin(angle);
        distance2 = len * Math.cos(angle);
        mid = PlotUtils.getThirdPoint(linePnt1, midPnt, Constants.HALF_PI, distance1, false);
        symPnt = PlotUtils.getThirdPoint(midPnt, mid, Constants.HALF_PI, distance2, true);
      } else if (angle >= Constants.HALF_PI && angle < Math.PI) {
        distance1 = len * Math.sin(Math.PI - angle);
        distance2 = len * Math.cos(Math.PI - angle);
        mid = PlotUtils.getThirdPoint(linePnt1, midPnt, Constants.HALF_PI, distance1, false);
        symPnt = PlotUtils.getThirdPoint(midPnt, mid, Constants.HALF_PI, distance2, false);
      } else if (angle >= Math.PI && angle < Math.PI * 1.5) {
        distance1 = len * Math.sin(angle - Math.PI);
        distance2 = len * Math.cos(angle - Math.PI);
        mid = PlotUtils.getThirdPoint(linePnt1, midPnt, Constants.HALF_PI, distance1, true);
        symPnt = PlotUtils.getThirdPoint(midPnt, mid, Constants.HALF_PI, distance2, true);
      } else {
        distance1 = len * Math.sin(Math.PI * 2 - angle);
        distance2 = len * Math.cos(Math.PI * 2 - angle);
        mid = PlotUtils.getThirdPoint(linePnt1, midPnt, Constants.HALF_PI, distance1, true);
        symPnt = PlotUtils.getThirdPoint(midPnt, mid, Constants.HALF_PI, distance2, false);
      }
      return symPnt;
    } catch (e) {
      console.log(e);
      return undefined;
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
    if (this.getPointCount() === 3 && this.tempPoint4 !== null) {
      this.points.push(this.tempPoint4);
    }
    if (this.connPoint !== null) {
      this.points.push(this.connPoint);
    }
  }
}

export default DoubleArrow;
