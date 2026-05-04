import PlotDraw from './core/PlotDraw'
import PlotEdit from './core/PlotEdit'
import PlotUtils from './core/PlotUtils'
import * as PlotTypes from './Utils/PlotTypes'
import * as Geometry from './Geometry';
import { Map } from 'ol';
class OlPlot {
  constructor(map: Map, options) {
    this.plotDraw = new PlotDraw(map);
    // options 被删除了
    this.plotEdit = new PlotEdit(map);
    this.plotUtils = new PlotUtils(map, options);
  }
  plotDraw: PlotDraw;
  plotEdit: PlotEdit;
  plotUtils: PlotUtils;
  static PlotTypes = PlotTypes;
  static Geometry = Geometry;
}

export default OlPlot
