/**
 * Created by FDD on 2017/5/26.
 * @desc 分队战斗行动（尾）
 * @Inherits AttackArrow
 */
import AttackArrow from './AttackArrow';
import { TAILED_SQUAD_COMBAT } from '../../Utils/PlotTypes';
import * as PlotUtils from '../../Utils/utils';
import * as Constants from '../../Constants';
import { Coordinate } from 'ol/coordinate';

class TailedSquadCombat extends AttackArrow {
  type: string;
  tailWidthFactor: number;
  swallowTailFactor: number;
  swallowTailPnt: Coordinate | null;

  constructor(coordinates: Coordinate[] | undefined, points: Coordinate[] | undefined, params: Record<string, unknown> | undefined) {
    super(coordinates, points, params);
    this.type = TAILED_SQUAD_COMBAT;
    this.headHeightFactor = 0.18;
    this.headWidthFactor = 0.3;
    this.neckHeightFactor = 0.85;
    this.neckWidthFactor = 0.15;
    this.tailWidthFactor = 0.1;
    this.swallowTailFactor = 1;
    this.swallowTailPnt = null;
    this.fixPointCount = 2;
    this.set('params', params);
    if (points && points.length > 0) {
      this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      this.setCoordinates(coordinates as any);
    }
  }

  /**
   * 生成分队战斗行动（尾）箭头图形
   */
  generate(): void {
    try {
      const count = this.getPointCount();
      if (count < 2) {
        return;
      } else {
        const pnts = this.getPoints();
        const tailPnts = this.getTailPoints(pnts);
        const headPnts = this.getArrowHeadPoints(pnts, tailPnts[0], tailPnts[2]);
        const neckLeft = headPnts![0];
        const neckRight = headPnts![4];
        const bodyPnts = this.getArrowBodyPoints(pnts, neckLeft, neckRight, this.tailWidthFactor);
        const n = bodyPnts.length;
        const leftPnts = [tailPnts[0]].concat(bodyPnts.slice(0, n / 2));
        leftPnts.push(neckLeft);
        const rightPnts = [tailPnts[2]].concat(bodyPnts.slice(n / 2, n));
        rightPnts.push(neckRight);
        const leftSmooth = PlotUtils.getQBSplinePoints(leftPnts);
        const rightSmooth = PlotUtils.getQBSplinePoints(rightPnts);
        this.setCoordinates([leftSmooth.concat(headPnts!, rightSmooth.reverse(), [tailPnts[1], leftPnts[0]])]);
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
    const len = tailWidth * this.swallowTailFactor;
    const swallowTailPnt = PlotUtils.getThirdPoint(points[1], points[0], 0, len, true);
    return [tailLeft, swallowTailPnt, tailRight];
  }
}

export default TailedSquadCombat;
