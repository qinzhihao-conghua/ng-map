import PlotDraw from './core/PlotDraw'
import PlotEdit from './core/PlotEdit'
import PlotUtils from './core/PlotUtils'
import * as PlotTypes from './Utils/PlotTypes'
import * as Geometry from './Geometry';
import { Map } from 'ol';

interface OlPlotOptions {
  layerName?: string;
  zIndex?: number;
  zoomToExtent?: boolean;
  [key: string]: unknown;
}

class OlPlot {
  plotDraw: PlotDraw;
  plotEdit: PlotEdit;
  plotUtils: PlotUtils;

  constructor(map: Map, options: OlPlotOptions = {}) {
    this.plotDraw = new PlotDraw(map, options);
    this.plotEdit = new PlotEdit(map);
    this.plotUtils = new PlotUtils(map, options);
  }

  static PlotTypes = PlotTypes;
  static Geometry = Geometry;
}

export default OlPlot;
