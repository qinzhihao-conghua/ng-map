import { Map, Overlay } from 'ol';
import { DragPan as $DragPan } from 'ol/interaction';
import autosize from 'autosize';
import { DEF_TEXT_STYLE } from '../../Constants';
import { merge, bindAll } from '../../Utils/utils';
import { on, off, hasClass, setStyle, getStyle } from '../../Utils/domUtils';
import { Coordinate } from 'ol/coordinate';

interface PlotTextBoxOptions {
  id?: string;
  element?: HTMLElement;
  offset?: number[];
  stopEvent?: boolean;
  positioning?: string;
  insertFirst?: boolean;
  autoPan?: boolean;
  autoPanAnimation?: Record<string, unknown>;
  autoPanMargin?: number;
  className?: string;
  position?: Coordinate;
  width?: number;
  height?: number;
  minHeight?: number;
  value?: string;
  style?: Record<string, string>;
  [key: string]: unknown;
}

class PlotTextBox extends Overlay {
  private mapDragPan: $DragPan | undefined;
  private isClick_: boolean;
  private dragging_: boolean;
  private isFocus_: boolean;
  private options_: PlotTextBoxOptions;
  private _position: Coordinate;
  private handleTimer_: number | null;
  private currentPixel_: number[];
  private preCursor_: string | undefined;

  constructor(options: PlotTextBoxOptions = {}) {
    super({
      id: options['id'],
      element: options['element'],
      stopEvent: options['stopEvent'],
      insertFirst: options['insertFirst'],
      autoPan: options['autoPan'],
      autoPanAnimation: options['autoPanAnimation'],
      autoPanMargin: options['autoPanMargin'],
      className: options['className']
    });
    this.setOffset(options['offset'] !== undefined ? options['offset'] : [0, 0]);
    this.setPositioning((options['positioning'] || 'center-center') as any);

    this.mapDragPan = undefined;
    this.isClick_ = false;
    this.dragging_ = false;
    this.isFocus_ = false;
    this.options_ = options;
    this._position = (options['position'] && options['position'].length > 0) ? options['position'] as Coordinate : [];
    this.handleTimer_ = null;
    this.currentPixel_ = [];
    this.preCursor_ = undefined;

    bindAll([
      'handleFocus_',
      'handleBlur_',
      'handleClick_',
      'handleDragStart_',
      'handleDragEnd_',
      'handleDragDrag_',
      'closeCurrentPlotText',
      'handleResizeMouseDown_',
      'handleResizeMouseMove_',
      'handleResizeMouseUp_',
      'resizeButtonMoveHandler_'
    ], this);

    this.createTextContent(options);
  }

  private createTextContent(options: PlotTextBoxOptions): void {
    const _className = options.className || 'ol-plot-text-editor';
    const content = document.createElement('textarea');
    content.className = _className;
    content.style.width = options['width'] + 'px';
    content.style.height = options['height'] + 'px';
    content.style.minHeight = (options['minHeight'] || '') + 'px';
    content.setAttribute('id', options['id']!);
    content.setAttribute('autofocus', 'true');
    autosize(content);
    on(content, 'focus', this.handleFocus_);
    on(content, 'blur', this.handleBlur_);
    on(content, 'click', this.handleClick_);
    on(content, 'mousedown', this.handleDragStart_);
    on(window as unknown as Element, 'mouseup', this.handleDragEnd_);
    this.set('isPlotText', true);
    this.setElement(content);
    this.createCloseButton(options);
    this.createResizeButton(options);
    this.setPosition(this._position);
    this.dispatchEvent('textBoxDrawEnd');
  }

  private getTextAreaFromContent_(): HTMLTextAreaElement | null {
    let _node: HTMLTextAreaElement | null = null;
    const childrens_ = Array.prototype.slice.call((this.element && this.element.children), 0);
    if (childrens_.length > 0) {
      childrens_.every((ele: Element) => {
        if (ele.nodeType === 1 && ele.nodeName.toLowerCase() === 'textarea') {
          _node = ele as HTMLTextAreaElement;
          return false;
        } else {
          return true;
        }
      });
    }
    return _node;
  }

  private createCloseButton(options: PlotTextBoxOptions): void {
    const _closeSpan = document.createElement('span');
    _closeSpan.className = 'ol-plot-text-editor-close';
    _closeSpan.setAttribute('data-id', options['id']!);
    off(_closeSpan, 'click', this.closeCurrentPlotText);
    on(_closeSpan, 'click', this.closeCurrentPlotText);
    this.element!.appendChild(_closeSpan);
  }

  private createResizeButton(options: PlotTextBoxOptions): void {
    const _resizeSpan = document.createElement('span');
    _resizeSpan.className = 'ol-plot-text-editor-resize';
    _resizeSpan.setAttribute('data-id', options['id']!);
    off(_resizeSpan, 'mousedown', this.handleResizeMouseDown_);
    off(_resizeSpan, 'mousemove', this.handleResizeMouseMove_);
    on(_resizeSpan, 'mousedown', this.handleResizeMouseDown_);
    on(_resizeSpan, 'mousemove', this.handleResizeMouseMove_);
    this.element!.appendChild(_resizeSpan);
  }

  private resizeButtonMoveHandler_(event: { pixel: number[] }): void {
    const pixel_ = event.pixel;
    const element_ = this.getTextAreaFromContent_();
    if (pixel_.length < 1 || this.currentPixel_.length < 1 || !element_) return;
    const _offset = [pixel_[0] - this.currentPixel_[0], pixel_[1] - this.currentPixel_[1]];
    const _size = [element_.offsetWidth, element_.offsetHeight];
    const _width = _size[0] + _offset[0] * 2;
    const _height = _size[1] + _offset[1] * 2;
    setStyle(element_, 'width', _width + 'px');
    setStyle(element_, 'height', _height + 'px');
    this.currentPixel_ = pixel_;
    this.getMap()!.render();
  }

  private handleResizeMouseMove_(event: MouseEvent): void {
    event.stopImmediatePropagation();
  }

  private handleResizeMouseDown_(event: MouseEvent): void {
    if (!this.getMap()) return;
    this.currentPixel_ = [event.clientX, event.clientY];
    this.getMap()!.on('pointermove', this.resizeButtonMoveHandler_);
    on(this.getMap()!.getViewport(), 'mouseup', this.handleResizeMouseUp_);
  }

  private handleResizeMouseUp_(_event: MouseEvent): void {
    if (!this.getMap()) return;
    this.getMap()!.un('pointermove', this.resizeButtonMoveHandler_);
    off(this.getMap()!.getViewport(), 'mouseup', this.handleResizeMouseUp_);
    this.currentPixel_ = [];
  }

  closeCurrentPlotText(event: MouseEvent): void {
    if (!this.getMap()) return;
    if (event && hasClass(event.target as HTMLElement, 'ol-plot-text-editor-close')) {
      const _id = (event.target as HTMLElement).getAttribute('data-id');
      if (_id) {
        const _overlay = this.getMap()!.getOverlayById(_id);
        if (_overlay) {
          this.getMap()!.removeOverlay(_overlay);
        }
      }
    }
  }

  private handleFocus_(): void {
    this.isFocus_ = true;
    if (this.getMap()) {
      this.getMap()!.set('activeTextArea', this);
      this.getMap()!.dispatchEvent('activeTextArea');
    }
  }

  private handleBlur_(): void {
    this.isFocus_ = false;
    if (this.getMap()) {
      this.getMap()!.set('activeTextArea', null);
      this.getMap()!.set('disActiveTextArea', this);
      this.getMap()!.dispatchEvent('disActiveTextArea');
    }
  }

  private handleDragStart_(_event: MouseEvent): void {
    if (!this.getMap()) return;
    if (!this.dragging_ && this.isMoveModel() && this.isFocus_) {
      this.handleTimer_ = window.setTimeout(() => {
        window.clearTimeout(this.handleTimer_!);
        this.handleTimer_ = null;
        if (!this.isClick_) {
          this.dragging_ = true;
          this.disableMapDragPan();
          this.preCursor_ = this.element!.style.cursor;
          on(this.getMap()!.getViewport(), 'mousemove', this.handleDragDrag_);
          on(this.element!, 'mouseup', this.handleDragEnd_);
        }
      }, 300);
    }
  }

  private handleDragDrag_(event: MouseEvent): void {
    if (this.dragging_) {
      this.element!.style.cursor = 'move';
      this._position = this.getMap()!.getCoordinateFromPixel([event.clientX, event.clientY]) as Coordinate;
      this.setPosition(this._position);
    }
  }

  private handleDragEnd_(_event: MouseEvent): void {
    this.isClick_ = false;
    window.clearTimeout(this.handleTimer_!);
    this.handleTimer_ = null;
    if (this.dragging_ && this.isFocus_) {
      this.dragging_ = false;
      this.enableMapDragPan();
      this.element!.style.cursor = this.preCursor_!;
      off(this.getMap()!.getViewport(), 'mousemove', this.handleDragDrag_);
      off(this.element!, 'mouseup', this.handleDragEnd_);
    }
  }

  private handleClick_(event: MouseEvent): void {
    if (event.target === this.element) {
      this.isClick_ = true;
    } else {
      this.isClick_ = false;
    }
  }

  isMoveModel(): boolean {
    const range = window.getSelection()!.getRangeAt(0);
    return range.collapsed;
  }

  setStyle(style: Record<string, string> = {}): void {
    const _element = this.getTextAreaFromContent_();
    if (_element) {
      for (const key in style) {
        if (style[key]) {
          setStyle(_element, key, style[key]);
        }
      }
    }
  }

  getStyle(): Record<string, string | null> {
    const _style: Record<string, string | null> = {};
    const _element = this.getTextAreaFromContent_();
    if (_element) {
      for (const key in DEF_TEXT_STYLE) {
        _style[key] = getStyle(_element, key);
      }
    }
    return _style;
  }

  setValue(value: string): void {
    const _element = this.getTextAreaFromContent_();
    if (_element) {
      _element.value = value;
      if (value) {
        autosize.update(_element);
      }
      this.getMap()!.render();
    }
  }

  getValue(): string {
    const _element = this.getTextAreaFromContent_();
    if (_element) {
      return _element.value;
    } else {
      return '';
    }
  }

  getWidth(): number {
    const element_ = this.getTextAreaFromContent_();
    if (element_ && element_.offsetWidth) {
      return element_.offsetWidth;
    } else {
      return 0;
    }
  }

  getHeight(): number {
    const element_ = this.getTextAreaFromContent_();
    if (element_ && element_.offsetHeight) {
      return element_.offsetHeight;
    } else {
      return 0;
    }
  }

  enableMapDragPan(): void {
    const _map = this.getMap();
    if (!_map) return;
    if (this.mapDragPan && this.mapDragPan instanceof $DragPan) {
      _map.addInteraction(this.mapDragPan);
      delete this.mapDragPan;
    }
  }

  disableMapDragPan(): void {
    const _map = this.getMap();
    if (!_map) return;
    const interactions = _map.getInteractions().getArray();
    interactions.every(item => {
      if (item instanceof $DragPan) {
        this.mapDragPan = item;
        _map.removeInteraction(item);
        return false;
      } else {
        return true;
      }
    });
  }

  setMap(map: Map): void {
    super.setMap(map);
    if (map && map instanceof Map) {
      this.setStyle(merge(DEF_TEXT_STYLE as Record<string, unknown>, this.options_['style'] as Record<string, unknown>) as Record<string, string>);
      this.setValue(this.options_['value'] as string || '');
    }
  }
}

export default PlotTextBox;
