/**
 * Created by FDD on 2017/5/26.
 * @desc 分队战斗行动
 * @Inherits AttackArrow
 */
import AttackArrow from './AttackArrow';
import { SQUAD_COMBAT } from '../../Utils/PlotTypes';
import * as PlotUtils from '../../Utils/utils';
import * as Constants from '../../Constants';
import { Coordinate } from 'ol/coordinate';

class SquadCombat extends AttackArrow {
  type: string;
  tailWidthFactor: number;

  constructor(coordinates: Coordinate[] | undefined, points: Coordinate[] | undefined, params: Record<string, unknown> | undefined) {
    super(coordinates, points, params);
    this.type = SQUAD_COMBAT;
    this.headHeightFactor = 0.18;
    this.headWidthFactor = 0.3;
    this.neckHeightFactor = 0.85;
    this.neckWidthFactor = 0.15;
    this.tailWidthFactor = 0.1;
    this.set('params', params);
    if (points && points.length > 0) {
      this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      this.setCoordinates(coordinates as any);
    }
  }

  /**
   * 生成分队战斗行动箭头图形
   */
  generate(): void {
    try {
      const count = this.getPointCount();
      if (count < 2) {
        return;
      } else {
        const pnts = this.getPoints();
        const tailPnts = this.getTailPoints(pnts);
        const headPnts = this.getArrowHeadPoints(pnts, tailPnts[0], tailPnts[1]);
        const neckLeft = headPnts![0];
        const neckRight = headPnts![4];
        const bodyPnts = this.getArrowBodyPoints(pnts, neckLeft, neckRight, this.tailWidthFactor);
        const n = bodyPnts.length;
        const leftPnts = [tailPnts[0]].concat(bodyPnts.slice(0, n / 2));
        leftPnts.push(neckLeft);
        const rightPnts = [tailPnts[1]].concat(bodyPnts.slice(n / 2, n));
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
   * 获取尾部点集
   * @param points 控制点集
   * @returns 尾部点集
   */
  getTailPoints(points: Coordinate[]): Coordinate[] {
    const allLen = PlotUtils.getBaseLength(points);
    const tailWidth = allLen * this.tailWidthFactor;
    const tailLeft = PlotUtils.getThirdPoint(points[1], points[0], Constants.HALF_PI, tailWidth, false);
    const tailRight = PlotUtils.getThirdPoint(points[1], points[0], Constants.HALF_PI, tailWidth, true);
    return [tailLeft, tailRight];
  }
}

export default SquadCombat;
