import { Map, Overlay } from 'ol'
import { DragPan } from 'ol/interaction'

import Feature from 'ol/Feature'

import { bindAll } from '../Utils/utils'
import { BASE_HELP_CONTROL_POINT_ID, BASE_HELP_HIDDEN } from '../Constants'
import MapBrowserEvent from 'ol/MapBrowserEvent'
import { Coordinate } from 'ol/coordinate'

interface ElementTable {
  [key: string]: number;
}

class PlotEdit {
  private map: Map;
  private mapViewport: HTMLElement;
  private activePlot: Feature | null;
  private startPoint: Coordinate | null;
  private ghostControlPoints: Coordinate[] | null;
  private controlPoints: Overlay[] | null;
  private mouseOver: boolean;
  private elementTable: ElementTable;
  private activeControlPointId: string | null;
  private mapDragPan: DragPan | null;
  private previousCursor_: string | null;

  constructor(map: Map) {
    if (map && map instanceof Map) {
      this.map = map
    } else {
      throw new Error('传入的不是地图对象！')
    }

    this.mapViewport = this.map.getViewport() as HTMLElement;
    this.activePlot = null;
    this.startPoint = null;
    this.ghostControlPoints = null;
    this.controlPoints = null;
    this.mouseOver = false;
    this.elementTable = {};
    this.activeControlPointId = null;
    this.mapDragPan = null;
    this.previousCursor_ = null;

    bindAll([
      'controlPointMouseDownHandler',
      'controlPointMouseMoveHandler2',
      'controlPointMouseUpHandler',
      'controlPointMouseMoveHandler',
      'plotMouseOverOutHandler',
      'plotMouseDownHandler',
      'plotMouseUpHandler',
      'plotMouseMoveHandler'
    ], this)
  }

  /**
   * 初始化辅助DOM元素
   */
  private initHelperDom(): void {
    if (!this.map || !this.activePlot) {
      return;
    }
    const parent = this.getMapParentElement();
    if (!parent) {
      return;
    } else {
      const hiddenDiv = this.createHidden('div', parent, BASE_HELP_HIDDEN);
      const cPnts = this.getControlPoints();
      if (cPnts && Array.isArray(cPnts) && cPnts.length > 0) {
        cPnts.forEach((item, index) => {
          const id = BASE_HELP_CONTROL_POINT_ID + '-' + index;
          this.createElement('div', BASE_HELP_CONTROL_POINT_ID, hiddenDiv, id);
          this.elementTable[id] = index;
        });
      }
    }
  }

  /**
   * 获取地图父元素
   * @returns 地图父元素
   */
  private getMapParentElement(): HTMLElement | null {
    const mapElement = this.map.getTargetElement();
    if (!mapElement) {
      return null;
    } else {
      return mapElement.parentNode as HTMLElement;
    }
  }

  /**
   * 销毁辅助DOM元素
   */
  private destroyHelperDom(): void {
    if (this.controlPoints && Array.isArray(this.controlPoints) && this.controlPoints.length > 0) {
      this.controlPoints.forEach((item, index) => {
        if (item && item instanceof Overlay) {
          this.map.removeOverlay(item);
        }
        const element = this.getElementById(BASE_HELP_CONTROL_POINT_ID + '-' + index);
        if (element) {
          this.removeEventListener(element, 'mousedown', this.controlPointMouseDownHandler.bind(this));
          this.removeEventListener(element, 'mousemove', this.controlPointMouseMoveHandler2.bind(this));
        }
      });
      this.controlPoints = [];
    }
    const parent = this.getMapParentElement();
    const hiddenDiv = this.getElementById(BASE_HELP_HIDDEN);
    if (hiddenDiv && parent) {
      this.removeElement(hiddenDiv);
    }
  }

  /**
   * 初始化控制点
   */
  private initControlPoints(): void {
    this.controlPoints = [];
    const cPnts = this.getControlPoints();
    if (cPnts && Array.isArray(cPnts) && cPnts.length > 0) {
      cPnts.forEach((item, index) => {
        const id = BASE_HELP_CONTROL_POINT_ID + '-' + index;
        this.elementTable[id] = index;
        const element = this.getElementById(id);
        const pnt = new Overlay({
          id: id,
          position: cPnts[index],
          positioning: 'center-center',
          element: element!
        });
        this.controlPoints!.push(pnt);
        this.map.addOverlay(pnt);
        this.map.render();
        this.addEventListener(element!, 'mousedown', this.controlPointMouseDownHandler);
        this.addEventListener(element!, 'mousemove', this.controlPointMouseMoveHandler2);
      });
    }
  }

  /**
   * 控制点鼠标移动事件处理
   * @param e 鼠标事件
   */
  private controlPointMouseMoveHandler2(e: MouseEvent): void {
    e.stopImmediatePropagation();
  }

  /**
   * 控制点鼠标按下事件处理
   * @param e 鼠标事件
   */
  private controlPointMouseDownHandler(e: MouseEvent): void {
    this.activeControlPointId = (e.target as HTMLElement).id;
    this.map.on('pointermove', this.controlPointMouseMoveHandler);
    this.addEventListener(this.mapViewport, 'mouseup', this.controlPointMouseUpHandler);
  }

  /**
   * 控制点鼠标移动事件处理（绘制时）
   * @param event 地图浏览器事件
   */
  private controlPointMouseMoveHandler(event: any): void {
    const coordinate = event.coordinate as Coordinate;
    if (this.activeControlPointId) {
      const plot = this.activePlot!.getGeometry() as any;
      const index = this.elementTable[this.activeControlPointId];
      plot.updatePoint(coordinate, index);
      const overlay = this.map.getOverlayById(this.activeControlPointId);
      if (overlay) {
        overlay.setPosition(coordinate);
      }
    }
  }

  /**
   * 控制点鼠标松开事件处理
   * @param event 地图浏览器事件
   */
  private controlPointMouseUpHandler(event: any): void {
    this.map.un('pointermove', this.controlPointMouseMoveHandler);
    this.removeEventListener(this.mapViewport, 'mouseup', this.controlPointMouseUpHandler);
  }

  /**
   * 激活标绘编辑
   * @param plot 要编辑的要素
   */
  activate(plot: Feature): void {
    if (plot &&
      plot instanceof Feature &&
      plot.get('isPlot') &&
      (plot.getGeometry() as any).isPlot &&
      plot !== this.activePlot) {
      this.deactivate();
      this.activePlot = plot;
      this.previousCursor_ = this.map.getTargetElement().style.cursor;
      this.map.on('pointermove', this.plotMouseOverOutHandler);
      this.initHelperDom();
      this.initControlPoints();
    }
  }

  /**
   * 获取控制点坐标
   * @returns 控制点坐标数组
   */
  getControlPoints(): Coordinate[] {
    const points: Coordinate[] = [];
    if (this.activePlot) {
      const geom = this.activePlot.getGeometry() as any;
      if (geom) {
        points.push(...geom.getPoints());
      }
    }
    return points;
  }

  /**
   * 标绘鼠标移入移出事件处理
   * @param e 地图浏览器事件
   * @returns 要素对象
   */
  private plotMouseOverOutHandler(e: any): Feature | undefined {
    const feature = this.map.forEachFeatureAtPixel(e.pixel as number[], (feat: Feature) => {
      return feat;
    });
    if (feature && feature === this.activePlot) {
      if (!this.mouseOver) {
        this.mouseOver = true;
        this.map.getTargetElement().style.cursor = 'move';
      }
    } else {
      if (this.mouseOver) {
        this.mouseOver = false;
        this.map.getTargetElement().style.cursor = 'default';
      }
    }
    return feature;
  }

  /**
   * 标绘鼠标按下事件处理
   * @param event 地图浏览器事件
   */
  private plotMouseDownHandler(event: any): void {
    this.ghostControlPoints = this.getControlPoints();
    this.startPoint = event.coordinate as Coordinate;
    this.disableMapDragPan();
    this.map.on('pointerdrag', this.plotMouseMoveHandler);
  }

  /**
   * 标绘鼠标移动事件处理
   * @param event 地图浏览器事件
   */
  private plotMouseMoveHandler(event: any): void {
    const coord = event.coordinate as Coordinate;
    const deltaX = coord[0] - this.startPoint![0];
    const deltaY = coord[1] - this.startPoint![1];
    const newPoints: Coordinate[] = [];

    if (this.ghostControlPoints && Array.isArray(this.ghostControlPoints) && this.ghostControlPoints.length > 0) {
      for (let i = 0; i < this.ghostControlPoints.length; i++) {
        const coordinate: Coordinate = [this.ghostControlPoints[i][0] + deltaX, this.ghostControlPoints[i][1] + deltaY];
        newPoints.push(coordinate);
        const id = BASE_HELP_CONTROL_POINT_ID + '-' + i;
        const overlay = this.map.getOverlayById(id);
        if (overlay) {
          overlay.setPosition(coordinate);
          overlay.setPositioning('center-center');
        }
      }
    }
    const _geometry = this.activePlot!.getGeometry() as any;
    _geometry.setPoints(newPoints);
  }

  /**
   * 标绘鼠标松开事件处理
   * @param event 地图浏览器事件
   */
  private plotMouseUpHandler(event: any): void {
    this.enableMapDragPan();
    this.map.un('pointerdrag', this.plotMouseMoveHandler);
  }

  /**
   * 断开所有事件监听器
   */
  private disconnectEventHandlers(): void {
    this.map.un('pointermove', this.plotMouseOverOutHandler);
    this.map.un('pointermove', this.controlPointMouseMoveHandler);
    this.removeEventListener(this.mapViewport, 'mouseup', this.controlPointMouseUpHandler);
    this.map.un('pointerdrag', this.plotMouseMoveHandler);
  }

  /**
   * 停用标绘编辑
   */
  deactivate(): void {
    this.activePlot = null;
    this.mouseOver = false;
    this.map.getTargetElement().style.cursor = this.previousCursor_!;
    this.previousCursor_ = null;
    this.destroyHelperDom();
    this.disconnectEventHandlers();
    this.enableMapDragPan();
    this.elementTable = {};
    this.activeControlPointId = null;
    this.startPoint = null;
  }

  /**
   * 禁用地图拖拽功能
   */
  private disableMapDragPan(): void {
    const interactions = this.map.getInteractions().getArray();
    interactions.every(item => {
      if (item instanceof DragPan) {
        this.mapDragPan = item;
        this.map.removeInteraction(item);
        return false;
      } else {
        return true;
      }
    });
  }

  /**
   * 启用地图拖拽功能
   */
  private enableMapDragPan(): void {
    if (this.mapDragPan && this.mapDragPan instanceof DragPan) {
      this.map.addInteraction(this.mapDragPan);
      this.mapDragPan = null;
    }
  }

  /**
   * 创建隐藏DOM元素
   * @param tagName 标签名称
   * @param parent 父元素
   * @param id 元素ID
   * @returns 创建的元素
   */
  private createHidden(tagName: string, parent: HTMLElement, id: string): HTMLElement {
    const element = document.createElement(tagName);
    element.id = id;
    element.style.display = 'none';
    parent.appendChild(element);
    return element;
  }

  /**
   * 创建DOM元素
   * @param tagName 标签名称
   * @param className 类名
   * @param parent 父元素
   * @param id 元素ID
   * @returns 创建的元素
   */
  private createElement(tagName: string, className: string, parent: HTMLElement, id: string): HTMLElement {
    const element = document.createElement(tagName);
    element.className = className;
    element.id = id;
    parent.appendChild(element);
    return element;
  }

  /**
   * 根据ID获取DOM元素
   * @param id 元素ID
   * @returns DOM元素
   */
  private getElementById(id: string): HTMLElement | null {
    return document.getElementById(id);
  }

  /**
   * 添加事件监听器
   * @param element DOM元素
   * @param event 事件名称
   * @param handler 事件处理函数
   */
  private addEventListener(element: HTMLElement | Element, event: string, handler: EventListener): void {
    element.addEventListener(event, handler);
  }

  /**
   * 移除事件监听器
   * @param element DOM元素
   * @param event 事件名称
   * @param handler 事件处理函数
   */
  private removeEventListener(element: HTMLElement | Element, event: string, handler: EventListener): void {
    element.removeEventListener(event, handler);
  }

  /**
   * 移除DOM元素
   * @param element 要移除的DOM元素
   */
  private removeElement(element: HTMLElement): void {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }
}
export default PlotEdit;
