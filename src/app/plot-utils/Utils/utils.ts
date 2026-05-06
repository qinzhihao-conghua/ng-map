import { Coordinate } from 'ol/coordinate';
import * as Constants from '../Constants';
import { Map } from 'ol';

/**
 * 计算两点之间的距离
 * @param pnt1 第一个点
 * @param pnt2 第二个点
 * @returns 两点之间的距离
 */
export const MathDistance = (pnt1: Coordinate, pnt2: Coordinate): number => {
  return Math.sqrt(Math.pow((pnt1[0] - pnt2[0]), 2) + Math.pow((pnt1[1] - pnt2[1]), 2));
};

/**
 * 计算点集的总距离
 * @param points 点集
 * @returns 点集的总距离
 */
export const wholeDistance = (points: Coordinate[]): number => {
  let distance = 0;
  if (points && Array.isArray(points) && points.length > 0) {
    points.forEach((item, index) => {
      if (index < points.length - 1) {
        distance += MathDistance(item, points[index + 1]);
      }
    });
  }
  return distance;
};

/**
 * 获取基准长度
 * @param points 点集
 * @returns 基准长度
 */
export const getBaseLength = (points: Coordinate[]): number => {
  return Math.pow(wholeDistance(points), 0.99);
};

/**
 * 获取两点之间的中点
 * @param point1 第一个点
 * @param point2 第二个点
 * @returns 中点坐标
 */
export const Mid = (point1: Coordinate, point2: Coordinate): Coordinate => {
  return [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2];
};

/**
 * 获取三点外接圆的圆心
 * @param point1 第一个点
 * @param point2 第二个点
 * @param point3 第三个点
 * @returns 圆心坐标
 */
export const getCircleCenterOfThreePoints = (point1: Coordinate, point2: Coordinate, point3: Coordinate): Coordinate => {
  const pntA = [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2];
  const pntB = [pntA[0] - point1[1] + point2[1], pntA[1] + point1[0] - point2[0]];
  const pntC = [(point1[0] + point3[0]) / 2, (point1[1] + point3[1]) / 2];
  const pntD = [pntC[0] - point1[1] + point3[1], pntC[1] + point1[0] - point3[0]];
  return getIntersectPoint(pntA, pntB, pntC, pntD);
};

/**
 * 获取两条直线的交点
 * @param pntA 第一条直线上的第一个点
 * @param pntB 第一条直线上的第二个点
 * @param pntC 第二条直线上的第一个点
 * @param pntD 第二条直线上的第二个点
 * @returns 交点坐标
 */
export const getIntersectPoint = (pntA: Coordinate, pntB: Coordinate, pntC: Coordinate, pntD: Coordinate): Coordinate => {
  if (pntA[1] === pntB[1]) {
    const f = (pntD[0] - pntC[0]) / (pntD[1] - pntC[1]);
    const x = f * (pntA[1] - pntC[1]) + pntC[0];
    const y = pntA[1];
    return [x, y];
  }
  if (pntC[1] === pntD[1]) {
    const e = (pntB[0] - pntA[0]) / (pntB[1] - pntA[1]);
    const x = e * (pntC[1] - pntA[1]) + pntA[0];
    const y = pntC[1];
    return [x, y];
  }
  const e = (pntB[0] - pntA[0]) / (pntB[1] - pntA[1]);
  const f = (pntD[0] - pntC[0]) / (pntD[1] - pntC[1]);
  const y = (e * pntA[1] - pntA[0] - f * pntC[1] + pntC[0]) / (e - f);
  const x = e * y - e * pntA[1] + pntA[0];
  return [x, y];
};

/**
 * 获取方位角
 * @param startPoint 起点
 * @param endPoint 终点
 * @returns 方位角（弧度）
 */
export const getAzimuth = (startPoint: Coordinate, endPoint: Coordinate): number => {
  let azimuth: number;
  const angle = Math.asin(Math.abs(endPoint[1] - startPoint[1]) / MathDistance(startPoint, endPoint));
  if (endPoint[1] >= startPoint[1] && endPoint[0] >= startPoint[0]) {
    azimuth = angle + Math.PI;
  } else if (endPoint[1] >= startPoint[1] && endPoint[0] < startPoint[0]) {
    azimuth = Math.PI * 2 - angle;
  } else if (endPoint[1] < startPoint[1] && endPoint[0] < startPoint[0]) {
    azimuth = angle;
  } else if (endPoint[1] < startPoint[1] && endPoint[0] >= startPoint[0]) {
    azimuth = Math.PI - angle;
  }
  return azimuth;
};

/**
 * 获取三点形成的夹角
 * @param pntA 第一个点
 * @param pntB 第二个点（顶点）
 * @param pntC 第三个点
 * @returns 夹角（弧度）
 */
export const getAngleOfThreePoints = (pntA: Coordinate, pntB: Coordinate, pntC: Coordinate): number => {
  const angle = getAzimuth(pntB, pntA) - getAzimuth(pntB, pntC);
  return (angle < 0) ? (angle + Math.PI * 2) : angle;
};

/**
 * 判断三点是否顺时针排列
 * @param pnt1 第一个点
 * @param pnt2 第二个点
 * @param pnt3 第三个点
 * @returns 是否顺时针
 */
export const isClockWise = (pnt1: Coordinate, pnt2: Coordinate, pnt3: Coordinate): boolean => {
  return (pnt3[1] - pnt1[1]) * (pnt2[0] - pnt1[0]) > (pnt2[1] - pnt1[1]) * (pnt3[0] - pnt1[0]);
};

/**
 * 获取线段上的点
 * @param t 参数（0-1之间）
 * @param startPnt 起点
 * @param endPnt 终点
 * @returns 线段上的点
 */
export const getPointOnLine = (t: number, startPnt: Coordinate, endPnt: Coordinate): Coordinate => {
  const x = startPnt[0] + (t * (endPnt[0] - startPnt[0]));
  const y = startPnt[1] + (t * (endPnt[1] - startPnt[1]));
  return [x, y];
};

/**
 * 获取三次贝塞尔曲线上的点
 * @param t 参数（0-1之间）
 * @param startPnt 起点
 * @param cPnt1 第一个控制点
 * @param cPnt2 第二个控制点
 * @param endPnt 终点
 * @returns 曲线上的点
 */
export const getCubicValue = (t: number, startPnt: Coordinate, cPnt1: Coordinate, cPnt2: Coordinate, endPnt: Coordinate): Coordinate => {
  t = Math.max(Math.min(t, 1), 0);
  const tp = (1 - t);
  const t2 = (t * t);
  const t3 = t2 * t;
  const tp2 = tp * tp;
  const tp3 = tp2 * tp;
  const x = (tp3 * startPnt[0]) + (3 * tp2 * t * cPnt1[0]) + (3 * tp * t2 * cPnt2[0]) + (t3 * endPnt[0]);
  const y = (tp3 * startPnt[1]) + (3 * tp2 * t * cPnt1[1]) + (3 * tp * t2 * cPnt2[1]) + (t3 * endPnt[1]);
  return [x, y];
};

/**
 * 获取第三点
 * @param startPnt 起点
 * @param endPnt 终点
 * @param angle 角度
 * @param distance 距离
 * @param clockWise 是否顺时针
 * @returns 第三点坐标
 */
export const getThirdPoint = (startPnt: Coordinate, endPnt: Coordinate, angle: number, distance: number, clockWise: boolean): Coordinate => {
  const azimuth = getAzimuth(startPnt, endPnt);
  const alpha = clockWise ? (azimuth + angle) : (azimuth - angle);
  const dx = distance * Math.cos(alpha);
  const dy = distance * Math.sin(alpha);
  return [endPnt[0] + dx, endPnt[1] + dy];
};

/**
 * 实现继承
 * @param childCtor 子类构造函数
 * @param parentCtor 父类构造函数
 */
export const inherits = (childCtor: any, parentCtor: any): void => {
  function TempCtor() {
  }

  TempCtor.prototype = parentCtor.prototype;
  (childCtor as any).superClass_ = parentCtor.prototype;
  childCtor.prototype = new TempCtor();
  childCtor.prototype.constructor = childCtor;
  (childCtor as any).base = function (me: any, methodName: string, varArgs: any[]) {
    const args = Array.prototype.slice.call(arguments, 2);
    return parentCtor.prototype[methodName].apply(me, args);
  };
};

/**
 * 获取圆弧上的点集
 * @param center 圆心
 * @param radius 半径
 * @param startAngle 起始角度
 * @param endAngle 结束角度
 * @returns 圆弧上的点集
 */
export const getArcPoints = (center: Coordinate, radius: number, startAngle: number, endAngle: number): Coordinate[] => {
  const pnts: Coordinate[] = [];
  let angleDiff = (endAngle - startAngle);
  angleDiff = (angleDiff < 0) ? (angleDiff + (Math.PI * 2)) : angleDiff;
  for (let i = 0; i <= 100; i++) {
    const angle = startAngle + angleDiff * i / 100;
    const x = center[0] + radius * Math.cos(angle);
    const y = center[1] + radius * Math.sin(angle);
    pnts.push([x, y]);
  }
  return pnts;
};

/**
 * 获取角平分线的法线
 * @param t 参数
 * @param pnt1 第一个点
 * @param pnt2 第二个点（顶点）
 * @param pnt3 第三个点
 * @returns 左右法线坐标
 */
export const getBisectorNormals = (t: number, pnt1: Coordinate, pnt2: Coordinate, pnt3: Coordinate): [Coordinate, Coordinate] => {
  const normal = getNormal(pnt1, pnt2, pnt3);
  let bisectorNormalRight: Coordinate;
  let bisectorNormalLeft: Coordinate;
  let dt: number;
  let x: number;
  let y: number;
  const dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
  const uX = normal[0] / dist;
  const uY = normal[1] / dist;
  const d1 = MathDistance(pnt1, pnt2);
  const d2 = MathDistance(pnt2, pnt3);
  if (dist > Constants.ZERO_TOLERANCE) {
    if (isClockWise(pnt1, pnt2, pnt3)) {
      dt = t * d1;
      x = pnt2[0] - dt * uY;
      y = pnt2[1] + dt * uX;
      bisectorNormalRight = [x, y];
      dt = t * d2;
      x = pnt2[0] + dt * uY;
      y = pnt2[1] - dt * uX;
      bisectorNormalLeft = [x, y];
    } else {
      dt = t * d1;
      x = pnt2[0] + dt * uY;
      y = pnt2[1] - dt * uX;
      bisectorNormalRight = [x, y];
      dt = t * d2;
      x = pnt2[0] - dt * uY;
      y = pnt2[1] + dt * uX;
      bisectorNormalLeft = [x, y];
    }
  } else {
    x = pnt2[0] + t * (pnt1[0] - pnt2[0]);
    y = pnt2[1] + t * (pnt1[1] - pnt2[1]);
    bisectorNormalRight = [x, y];
    x = pnt2[0] + t * (pnt3[0] - pnt2[0]);
    y = pnt2[1] + t * (pnt3[1] - pnt2[1]);
    bisectorNormalLeft = [x, y];
  }
  return [bisectorNormalRight, bisectorNormalLeft];
};

/**
 * 获取法线
 * @param pnt1 第一个点
 * @param pnt2 第二个点
 * @param pnt3 第三个点
 * @returns 法线向量
 */
export const getNormal = (pnt1: Coordinate, pnt2: Coordinate, pnt3: Coordinate): Coordinate => {
  let dX1 = pnt1[0] - pnt2[0];
  let dY1 = pnt1[1] - pnt2[1];
  let d1 = Math.sqrt(dX1 * dX1 + dY1 * dY1);
  dX1 /= d1;
  dY1 /= d1;
  let dX2 = pnt3[0] - pnt2[0];
  let dY2 = pnt3[1] - pnt2[1];
  const d2 = Math.sqrt(dX2 * dX2 + dY2 * dY2);
  dX2 /= d2;
  dY2 /= d2;
  const uX = dX1 + dX2;
  const uY = dY1 + dY2;
  return [uX, uY];
};

/**
 * 获取最左侧控制点
 * @param controlPoints 控制点集
 * @param t 参数
 * @returns 控制点坐标
 */
export const getLeftMostControlPoint = (controlPoints: Coordinate[], t: number): Coordinate => {
  const pnt1 = controlPoints[0];
  const pnt2 = controlPoints[1];
  const pnt3 = controlPoints[2];
  let controlX: number;
  let controlY: number;
  const pnts = getBisectorNormals(0, pnt1, pnt2, pnt3);
  const normalRight = pnts[0];
  const normal = getNormal(pnt1, pnt2, pnt3);
  const dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
  if (dist > Constants.ZERO_TOLERANCE) {
    const mid = Mid(pnt1, pnt2);
    const pX = pnt1[0] - mid[0];
    const pY = pnt1[1] - mid[1];
    const d1 = MathDistance(pnt1, pnt2);
    const n = 2.0 / d1;
    const nX = -n * pY;
    const nY = n * pX;
    const a11 = nX * nX - nY * nY;
    const a12 = 2 * nX * nY;
    const a22 = nY * nY - nX * nX;
    const dX = normalRight[0] - mid[0];
    const dY = normalRight[1] - mid[1];
    controlX = mid[0] + a11 * dX + a12 * dY;
    controlY = mid[1] + a12 * dX + a22 * dY;
  } else {
    controlX = pnt1[0] + t * (pnt2[0] - pnt1[0]);
    controlY = pnt1[1] + t * (pnt2[1] - pnt1[1]);
  }
  return [controlX, controlY];
};

/**
 * 获取最右侧控制点
 * @param controlPoints 控制点集
 * @param t 参数
 * @returns 控制点坐标
 */
export const getRightMostControlPoint = (controlPoints: Coordinate[], t: number): Coordinate => {
  const count = controlPoints.length;
  const pnt1 = controlPoints[count - 3];
  const pnt2 = controlPoints[count - 2];
  const pnt3 = controlPoints[count - 1];
  const pnts = getBisectorNormals(0, pnt1, pnt2, pnt3);
  const normalLeft = pnts[1];
  const normal = getNormal(pnt1, pnt2, pnt3);
  const dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
  let controlX: number;
  let controlY: number;
  if (dist > Constants.ZERO_TOLERANCE) {
    const mid = Mid(pnt2, pnt3);
    const pX = pnt3[0] - mid[0];
    const pY = pnt3[1] - mid[1];
    const d1 = MathDistance(pnt2, pnt3);
    const n = 2.0 / d1;
    const nX = -n * pY;
    const nY = n * pX;
    const a11 = nX * nX - nY * nY;
    const a12 = 2 * nX * nY;
    const a22 = nY * nY - nX * nX;
    const dX = normalLeft[0] - mid[0];
    const dY = normalLeft[1] - mid[1];
    controlX = mid[0] + a11 * dX + a12 * dY;
    controlY = mid[1] + a12 * dX + a22 * dY;
  } else {
    controlX = pnt3[0] + t * (pnt2[0] - pnt3[0]);
    controlY = pnt3[1] + t * (pnt2[1] - pnt3[1]);
  }
  return [controlX, controlY];
};

/**
 * 获取曲线点集
 * @param t 参数
 * @param controlPoints 控制点集
 * @returns 曲线点集
 */
export const getCurvePoints = (t: number, controlPoints: Coordinate[]): Coordinate[] => {
  const leftControl = getLeftMostControlPoint(controlPoints, t);
  const normals: Coordinate[] = [leftControl];
  const points: Coordinate[] = [];
  for (let i = 0; i < controlPoints.length - 2; i++) {
    const pnt1 = controlPoints[i];
    const pnt2 = controlPoints[i + 1];
    const pnt3 = controlPoints[i + 2];
    const normalPoints = getBisectorNormals(t, pnt1, pnt2, pnt3);
    normals.push(...normalPoints);
  }
  const rightControl = getRightMostControlPoint(controlPoints, t);
  if (rightControl) {
    normals.push(rightControl);
  }
  for (let i = 0; i < controlPoints.length - 1; i++) {
    const pnt1 = controlPoints[i];
    const pnt2 = controlPoints[i + 1];
    points.push(pnt1);
    for (let ti = 0; ti < Constants.FITTING_COUNT; ti++) {
      const pnt = getCubicValue(ti / Constants.FITTING_COUNT, pnt1, normals[i * 2], normals[i * 2 + 1], pnt2);
      points.push(pnt);
    }
    points.push(pnt2);
  }
  return points;
};

/**
 * 获取贝塞尔曲线点集
 * @param points 控制点集
 * @returns 贝塞尔曲线点集
 */
export const getBezierPoints = function (points: Coordinate[]): Coordinate[] {
  if (points.length <= 2) {
    return points;
  } else {
    const bezierPoints: Coordinate[] = [];
    const n = points.length - 1;
    for (let t = 0; t <= 1; t += 0.01) {
      let x = 0;
      let y = 0;
      for (let index = 0; index <= n; index++) {
        const factor = getBinomialFactor(n, index);
        const a = Math.pow(t, index);
        const b = Math.pow((1 - t), (n - index));
        x += factor * a * b * points[index][0];
        y += factor * a * b * points[index][1];
      }
      bezierPoints.push([x, y]);
    }
    bezierPoints.push(points[n]);
    return bezierPoints;
  }
};

/**
 * 获取阶乘
 * @param n 数字
 * @returns 阶乘结果
 */
export const getFactorial = (n: number): number => {
  let result = 1;
  if (n <= 1) {
    result = 1;
  } else if (n === 2) {
    result = 2;
  } else if (n === 3) {
    result = 6;
  } else if (n === 4) {
    result = 24;
  } else if (n === 5) {
    result = 120;
  } else {
    for (let i = 1; i <= n; i++) {
      result *= i;
    }
  }
  return result;
};

/**
 * 获取二项式系数
 * @param n 总数
 * @param index 索引
 * @returns 二项式系数
 */
export const getBinomialFactor = (n: number, index: number): number => {
  return getFactorial(n) / (getFactorial(index) * getFactorial(n - index));
};

/**
 * 获取二次B样条曲线点集
 * @param points 控制点集
 * @returns B样条曲线点集
 */
export const getQBSplinePoints = (points: Coordinate[]): Coordinate[] => {
  if (points.length <= 2) {
    return points;
  } else {
    const n = 2;
    const bSplinePoints: Coordinate[] = [];
    const m = points.length - n - 1;
    bSplinePoints.push(points[0]);
    for (let i = 0; i <= m; i++) {
      for (let t = 0; t <= 1; t += 0.05) {
        let x = 0;
        let y = 0;
        for (let k = 0; k <= n; k++) {
          const factor = getQuadricBSplineFactor(k, t);
          x += factor * points[i + k][0];
          y += factor * points[i + k][1];
        }
        bSplinePoints.push([x, y]);
      }
    }
    bSplinePoints.push(points[points.length - 1]);
    return bSplinePoints;
  }
};

/**
 * 获取二次B样条系数
 * @param k 索引
 * @param t 参数
 * @returns B样条系数
 */
export const getQuadricBSplineFactor = (k: number, t: number): number => {
  let res = 0;
  if (k === 0) {
    res = Math.pow(t - 1, 2) / 2;
  } else if (k === 1) {
    res = (-2 * Math.pow(t, 2) + 2 * t + 1) / 2;
  } else if (k === 2) {
    res = Math.pow(t, 2) / 2;
  }
  return res;
};

/**
 * 生成UUID
 * @returns UUID字符串
 */
export const getuuid = (): string => {
  const s: string[] = [];
  const hexDigits = '0123456789abcdef';
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = '4';
  s[19] = hexDigits[(((parseInt(s[19], 16) & 0x3) | 0x8) % 16)];
  s[8] = s[13] = s[18] = s[23] = '-';
  return s.join('');
};

/**
 * 为对象分配唯一标识
 * @param obj 对象
 * @returns 唯一标识
 */
export const stamp = function (obj: Record<string, unknown>): string {
  const key = '_event_id_';
  obj[key] = obj[key] || getuuid();
  return obj[key] as string;
};

/**
 * 去除字符串两端空格
 * @param str 字符串
 * @returns 处理后的字符串
 */
export const trim = (str: string): string => {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
};

/**
 * 分割字符串为单词数组
 * @param str 字符串
 * @returns 单词数组
 */
export const splitWords = (str: string): string[] => {
  return trim(str).split(/\s+/);
};

/**
 * 判断是否为对象
 * @param value 值
 * @returns 是否为对象
 */
export const isObject = (value: unknown): boolean => {
  const type = typeof value;
  return value !== null && (type === 'object' || type === 'function');
};

/**
 * 合并两个对象
 * @param a 目标对象
 * @param b 源对象
 * @returns 合并后的对象
 */
export const merge = (a: Record<string, unknown>, b: Record<string, unknown>): Record<string, unknown> => {
  for (const key in b) {
    if (isObject(b[key]) && isObject(a[key])) {
      merge(a[key] as Record<string, unknown>, b[key] as Record<string, unknown>);
    } else {
      a[key] = b[key];
    }
  }
  return a;
};

/**
 * 阻止默认事件
 * @param e 事件对象
 */
export function preventDefault(e: Event): void {
  if (e.preventDefault) {
    e.preventDefault();
  } else {
    (e as any).returnValue = false;
  }
}

/**
 * 绑定多个方法到指定上下文
 * @param fns 方法名数组
 * @param context 上下文
 */
export function bindAll(fns: string[], context: any): void {
  fns.forEach((fn) => {
    if (!context[fn]) { return; }
    context[fn] = context[fn].bind(context);
  });
}
