/**
 * Created by FDD on 2017/5/15.
 * @desc 点要素
 */
import { Map } from 'ol';
import Point from '../point/Point';
import { PENNANT } from '../../Utils/PlotTypes';
import { Coordinate } from 'ol/coordinate';

/**
 * 旗标点类，继承Point类
 */
class Pennant extends Point {
  type: string;

  constructor(coordinates: Coordinate[] | undefined, point: Coordinate[] | undefined, params: Record<string, unknown> | undefined) {
    super(coordinates, point, params);
    this.type = PENNANT;
  }
}

export default Pennant;
