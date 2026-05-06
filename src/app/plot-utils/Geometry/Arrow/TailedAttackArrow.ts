/**
 * Created by FDD on 2017/5/26.
 * @desc 进攻方向（尾）
 * @Inherits AttackArrow
 */
import AttackArrow from './AttackArrow';
import { TAILED_ATTACK_ARROW } from '../../Utils/PlotTypes';
import * as PlotUtils from '../../Utils/utils';
import { Coordinate } from 'ol/coordinate';

class TailedAttackArrow extends AttackArrow {
  type: string;
  tailWidthFactor: number;
  swallowTailFactor: number;
  swallowTailPnt: Coordinate | null;

  constructor(coordinates: Coordinate[] | undefined, points: Coordinate[] | undefined, params: Record<string, unknown> | undefined) {
    super(coordinates, points, params);
    this.type = TAILED_ATTACK_ARROW;
    this.headHeightFactor = 0.18;
    this.headWidthFactor = 0.3;
    this.neckHeightFactor = 0.85;
    this.neckWidthFactor = 0.15;
    this.tailWidthFactor = 0.1;
    this.headTailFactor = 0.8;
    this.swallowTailFactor = 1;
    this.swallowTailPnt = null;
    this.set('params', params);
    if (points && points.length > 0) {
      this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      this.setCoordinates(coordinates as any);
    }
  }

  /**
   * 生成进攻方向（尾）箭头图形
   */
  generate(): void {
    try {
      const points = this.getPointCount();
      if (points < 2) {
        return;
      } else if (points === 2) {
        this.setCoordinates([this.points]);
        return;
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
        const tailWidth = PlotUtils.MathDistance(tailLeft, tailRight);
        const allLen = PlotUtils.getBaseLength(bonePnts);
        const len = allLen * this.tailWidthFactor * this.swallowTailFactor;
        this.swallowTailPnt = PlotUtils.getThirdPoint(bonePnts[1], bonePnts[0], 0, len, true);
        const factor = tailWidth / allLen;
        const bodyPnts = this.getArrowBodyPoints(bonePnts, neckLeft, neckRight, factor);
        const count = bodyPnts.length;
        const leftPnts = [tailLeft].concat(bodyPnts.slice(0, count / 2));
        leftPnts.push(neckLeft);
        const rightPnts = [tailRight].concat(bodyPnts.slice(count / 2, count));
        rightPnts.push(neckRight);
        const leftSmooth = PlotUtils.getQBSplinePoints(leftPnts);
        const rightSmooth = PlotUtils.getQBSplinePoints(rightPnts);
        this.setCoordinates([leftSmooth.concat(headPnts!, rightSmooth.reverse(), [this.swallowTailPnt, leftPnts[0]])] as any);
      }
    } catch (e) {
      console.log(e);
    }
  }
}

export default TailedAttackArrow;
