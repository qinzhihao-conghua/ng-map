/**
 * Created by FDD on 2017/5/24.
 * @desc 进攻方向
 * @Inherits ol.geom.Polygon
 */
import { Map } from 'ol';
import { Polygon } from 'ol/geom';
import { ATTACK_ARROW } from '../../Utils/PlotTypes';
import * as PlotUtils from '../../Utils/utils';
import * as Constants from '../../Constants';
import { Coordinate } from 'ol/coordinate';

class AttackArrow extends Polygon {
  type: string;
  points: Coordinate[];
  map: Map | undefined;
  headHeightFactor: number;
  headWidthFactor: number;
  neckHeightFactor: number;
  neckWidthFactor: number;
  headTailFactor: number;
  fixPointCount: number;
  options: Record<string, unknown>;

  constructor(coordinates: Coordinate[] | undefined, points: Coordinate[] | undefined, params: Record<string, unknown> | undefined) {
    super([]);
    this.type = ATTACK_ARROW;
    this.headHeightFactor = 0.18;
    this.headWidthFactor = 0.3;
    this.neckHeightFactor = 0.85;
    this.neckWidthFactor = 0.15;
    this.headTailFactor = 0.8;
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
   * 生成进攻方向箭头图形
   */
  generate(): void {
    try {
      const points = this.getPointCount();
      if (points < 2) {
        return;
      } else if (points === 2) {
        this.setCoordinates([this.points]);
      } else {
        const pnts = this.getPoints();
        let tailLeft = pnts[0];
        let tailRight = pnts[1];
        if (PlotUtils.isClockWise(pnts[0], pnts[1], pnts[2])) {
          tailLeft = pnts[1];
          tailRight = pnts[0];
        }
        const midTail = PlotUtils.Mid(tailLeft, tailRight);
        const bonePnts = [midTail].concat(pnts.slice(2));
        const headPnts = this.getArrowHeadPoints(bonePnts, tailLeft, tailRight);
        const neckLeft = headPnts![0];
        const neckRight = headPnts![4];
        const tailWidthFactor = PlotUtils.MathDistance(tailLeft, tailRight) / PlotUtils.getBaseLength(bonePnts);
        const bodyPnts = this.getArrowBodyPoints(bonePnts, neckLeft, neckRight, tailWidthFactor);
        const count = bodyPnts.length;
        const leftPnts = [tailLeft].concat(bodyPnts.slice(0, count / 2));
        leftPnts.push(neckLeft);
        const rightPnts = [tailRight].concat(bodyPnts.slice(count / 2, count));
        rightPnts.push(neckRight);
        const leftSmooth = PlotUtils.getQBSplinePoints(leftPnts);
        const rightSmooth = PlotUtils.getQBSplinePoints(rightPnts);
        this.setCoordinates([leftSmooth.concat(headPnts!, rightSmooth.reverse())]);
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
  getArrowPoints(pnt1: Coordinate, pnt2: Coordinate, pnt3: Coordinate, clockWise: boolean): Coordinate[] | undefined {
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
      if (bodyPnts) {
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
      }
    } else {
      throw new Error('插值出错');
    }
    return undefined;
  }

  /**
   * 获取箭头头部点集
   * @param points 控制点集
   * @param tailLeft 尾部左点
   * @param tailRight 尾部右点
   * @returns 箭头头部点集
   */
  getArrowHeadPoints(points: Coordinate[], tailLeft?: Coordinate, tailRight?: Coordinate): Coordinate[] | undefined {
    try {
      const len = PlotUtils.getBaseLength(points);
      let headHeight = len * this.headHeightFactor;
      const headPnt = points[points.length - 1];
      const len2 = PlotUtils.MathDistance(headPnt, points[points.length - 2]);
      const tailWidth = PlotUtils.MathDistance(tailLeft!, tailRight!);
      if (headHeight > tailWidth * this.headTailFactor) {
        headHeight = tailWidth * this.headTailFactor;
      }
      const headWidth = headHeight * this.headWidthFactor;
      const neckWidth = headHeight * this.neckWidthFactor;
      headHeight = headHeight > len2 ? len2 : headHeight;
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
      return undefined;
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
  }
}

export default AttackArrow;
