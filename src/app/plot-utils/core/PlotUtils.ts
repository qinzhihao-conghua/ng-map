/**
 * Created by FDD on 2017/9/12.
 * @desc 标绘相关工具（包含样式修改获取和标绘保存和恢复）
 */
import { Map } from 'ol'
import {
  Style, Icon,
  RegularShape
} from 'ol/style'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { asArray, asString } from 'ol/color'
import { Point } from 'ol/geom'
import { getSize, getBottomLeft, getTopRight, buffer } from 'ol/extent'

import Feature from 'ol/Feature'

import olStyleFactory from '../Utils/factory'
import PlotTextBox from '../Geometry/Text/PlotTextBox'
import * as Geometry from '../Geometry'
import { createVectorLayer, getLayerByLayerName } from '../Utils/layerUtils'
import { BASE_LAYERNAME } from '../Constants'
import { Coordinate } from 'ol/coordinate'

interface PlotUtilsOptions {
  layerName?: string;
  zIndex?: number;
  zoomToExtent?: boolean;
  [key: string]: unknown;
}

interface ExtentParams {
  adjust?: number;
  minWidth?: number;
  minHeight?: number;
}

interface StyleCode {
  fill: {
    fillColor: string | undefined;
    opacity: number;
  };
  stroke: Record<string, unknown>;
  image: Record<string, unknown>;
  text: Record<string, unknown>;
}

class PlotUtils {
  private map: Map;
  private options: PlotUtilsOptions;
  private layerName: string;
  type: string | undefined;
  points: Coordinate[];

  constructor(map: Map, options: PlotUtilsOptions = {}) {
    if (map && map instanceof Map) {
      this.map = map
    } else {
      throw new Error('传入的不是地图对象！')
    }

    this.options = options;
    this.layerName = (this.options && this.options['layerName']) ? this.options['layerName'] as string : BASE_LAYERNAME;
    this.type = undefined;
    this.points = [];
  }

  /**
   * 获取基础样式
   * @param feature 要素对象
   * @returns 样式对象
   */
  private getBaseStyle(feature: Feature): Style | undefined {
    let style = feature.getStyle();
    if (!style) {
      const layer = getLayerByLayerName(this.map, this.layerName);
      if (layer && layer instanceof VectorLayer) {
        style = layer.getStyle() as Style | undefined;
      }
    }
    return style as Style | undefined;
  }

  /**
   * 设置图标
   * @param feature 要素对象
   * @param image 图标对象
   */
  setIcon(feature: Feature, image: Icon | RegularShape | undefined): void {
    try {
      if (feature && feature instanceof Feature) {
        const style = this.getBaseStyle(feature);
        if (style) {
          const tempStyle = style.clone();
          if (image) {
            tempStyle.setImage(image);
            feature.setStyle(tempStyle);
          }
        }
      }
    } catch (e) {
      console.warn(e);
    }
  }

  /**
   * 设置背景颜色
   * @param feature 要素对象
   * @param backgroundColor 背景颜色
   */
  setBackgroundColor(feature: Feature, backgroundColor: string): void {
    try {
      if (feature && feature instanceof Feature) {
        const style = this.getBaseStyle(feature);
        if (style) {
          const tempStyle = style.clone();
          const fill = tempStyle.getFill();
          if (fill) {
            const color = fill.getColor();
            if (color) {
              const tempColor = asArray(color as any);
              const _color = asArray(backgroundColor);
              const currentColor = this.handleBackgroundColor(_color, tempColor[3]);
              fill.setColor(currentColor);
              feature.setStyle(tempStyle);
            }
          }
        }
      }
    } catch (e) {
      console.warn(e);
    }
  }

  /**
   * 设置透明度
   * @param feature 要素对象
   * @param opacity 透明度值（0-1）
   */
  setOpacity(feature: Feature, opacity: number): void {
    try {
      if (feature && feature instanceof Feature) {
        const style = this.getBaseStyle(feature);
        if (style) {
          const tempStyle = style.clone();
          const fill = tempStyle.getFill();
          if (fill) {
            const color = fill.getColor();
            if (color) {
              const tempColor = asArray(color as any);
              tempColor[3] = opacity;
              const currentColor = 'rgba(' + tempColor.join(',') + ')';
              fill.setColor(currentColor);
              feature.setStyle(tempStyle);
            }
          }
        }
      }
    } catch (e) {
      console.warn(e);
    }
  }

  /**
   * 设置边框颜色
   * @param feature 要素对象
   * @param borderColor 边框颜色
   */
  setBorderColor(feature: Feature, borderColor: string): void {
    try {
      if (feature && feature instanceof Feature) {
        const style = this.getBaseStyle(feature);
        if (style) {
          const tempStyle = style.clone();
          const stroke = tempStyle.getStroke();
          if (stroke) {
            stroke.setColor(borderColor);
            feature.setStyle(tempStyle);
          }
        }
      }
    } catch (e) {
      console.warn(e);
    }
  }

  /**
   * 设置边框宽度
   * @param feature 要素对象
   * @param borderWidth 边框宽度
   */
  setBorderWidth(feature: Feature, borderWidth: number): void {
    try {
      if (feature && feature instanceof Feature) {
        const style = this.getBaseStyle(feature);
        if (style) {
          const tempStyle = style.clone();
          const stroke = tempStyle.getStroke();
          if (stroke) {
            stroke.setWidth(borderWidth);
            feature.setStyle(tempStyle);
          }
        }
      }
    } catch (e) {
      console.warn(e);
    }
  }

  /**
   * 处理背景颜色
   * @param color 颜色值
   * @param opacity 透明度
   * @returns RGBA颜色字符串
   */
  private handleBackgroundColor(color: number[] | string, opacity?: number): string {
    try {
      if (!opacity) opacity = 1;
      const tempColor = asArray(color);
      tempColor[3] = opacity;
      return 'rgba(' + tempColor.join(',') + ')';
    } catch (e) {
      console.warn(e);
      return '';
    }
  }

  /**
   * 转换颜色值
   * @param color 颜色值
   * @returns 颜色字符串
   */
  private getColor(color: string | number[]): string | undefined {
    try {
      const colorTarget = asArray(color);
      return asString(colorTarget);
    } catch (e) {
      console.warn(e);
      return undefined;
    }
  }

  /**
   * 修复对象中的undefined属性
   * @param obj 对象
   * @returns 修复后的对象
   */
  private fixObject<T extends Record<string, unknown>>(obj: T | null): T | null {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (key && typeof obj[key] === 'undefined') {
          delete obj[key];
        }
      }
    }
    return obj;
  }

  /**
   * 获取描边样式信息
   * @param style 样式对象
   * @returns 描边样式信息
   */
  private getStroke_(style: any): Record<string, unknown> | null {
    let stroke: Record<string, unknown> | null = null;
    if (style) {
      const olStyle_ = style.getStroke();
      if (olStyle_) {
        stroke = {};
        stroke['strokeColor'] = this.getColor(olStyle_.getColor() as any);
        stroke['strokeWidth'] = olStyle_.getWidth();
        stroke['strokeLineDash'] = olStyle_.getLineDash();
        stroke['lineDashOffset'] = olStyle_.getLineDashOffset();
        stroke['strokeLineCap'] = olStyle_.getLineCap();
        stroke['strokeLineJoin'] = olStyle_.getLineJoin();
        stroke['strokeMiterLimit'] = olStyle_.getMiterLimit();
      }
    }
    return this.fixObject(stroke);
  }

  /**
   * 获取填充样式信息
   * @param style 样式对象
   * @returns 填充样式信息
   */
  private getFill_(style: any): Record<string, unknown> | null {
    let fill: Record<string, unknown> | null = null;
    if (style) {
      const olStyle_ = style.getFill();
      if (olStyle_) {
        fill = {};
        const color = olStyle_.getColor();
        fill['fillColor'] = this.getColor(color as any);
      }
    }
    return this.fixObject(fill);
  }

  /**
   * 获取文本样式信息
   * @param style 样式对象
   * @returns 文本样式信息
   */
  private getText_(style: Style | undefined): Record<string, unknown> | null {
    let text: Record<string, unknown> | null = null;
    if (style) {
      const olStyle_ = style.getText();
      if (olStyle_) {
        text = {};
        text['textFont'] = olStyle_.getFont();
        text['textOffsetX'] = olStyle_.getOffsetX();
        text['textOffsetY'] = olStyle_.getOffsetY();
        text['textScale'] = olStyle_.getScale();
        text['textRotation'] = olStyle_.getRotation();
        text['text'] = olStyle_.getText();
        text['textAlign'] = olStyle_.getTextAlign();
        text['textBaseline'] = olStyle_.getTextBaseline();
        text['rotateWithView'] = olStyle_.getRotateWithView();
        text['textFill'] = this.getFill_(olStyle_);
        text['textStroke'] = this.getStroke_(olStyle_);
      }
    }
    return this.fixObject(text);
  }

  /**
   * 获取图像样式信息
   * @param style 样式对象
   * @returns 图像样式信息
   */
  private getImage_(style: Style): Record<string, unknown> | null {
    let image: Record<string, unknown> | null = null;
    if (style) {
      const olStyle_ = style.getImage();
      if (olStyle_) {
        image = {};
        if (olStyle_ instanceof Icon) {
          image['type'] = 'icon';
          image['image'] = {};
          image['image']['imageAnchor'] = olStyle_.getAnchor();
          image['image']['imageColor'] = olStyle_.getColor();
          image['image']['imageSrc'] = olStyle_.getSrc();
          image['image']['imgSize'] = olStyle_.getSize();
          image['image']['scale'] = olStyle_.getScale();
          image['image']['imageRotation'] = olStyle_.getRotation();
          image['image']['rotateWithView'] = olStyle_.getRotateWithView();
          image['image']['imageOpacity'] = olStyle_.getOpacity();
          image['image']['offset'] = olStyle_.getOrigin();
        } else if (olStyle_ instanceof RegularShape) {
          image['type'] = 'regular';
          image['image'] = {};
          image['image']['fill'] = this.getFill_(olStyle_ as any);
          image['image']['points'] = olStyle_.getPoints();
          image['image']['radius'] = olStyle_.getRadius();
          image['image']['radius2'] = olStyle_.getRadius2();
          image['image']['angle'] = olStyle_.getAngle();
          image['image']['stroke'] = this.getStroke_(olStyle_ as any);
          image['image']['rotateWithView'] = olStyle_.getRotateWithView();
        }
      }
    }
    return this.fixObject(image);
  }

  /**
   * 获取样式代码
   * @param feature 要素对象
   * @returns 样式代码
   */
  getStyleCode(feature: Feature): StyleCode | undefined {
    try {
      if (feature && feature instanceof Feature) {
        const style = this.getBaseStyle(feature);
        if (style && style instanceof Style) {
          const fill = this.getFill_(style);
          let opacity = 1;
          let backgroundColor: string | undefined;
          if (fill && fill['fillColor']) {
            const rgbaArray = asArray(fill['fillColor'] as string | number[]);
            opacity = parseFloat(String(rgbaArray[3]));
            if (rgbaArray && typeof opacity === 'number') {
              backgroundColor = this.handleBackgroundColor(asString(rgbaArray), opacity);
            }
          }
          const stroke = this.getStroke_(style);
          const text = this.getText_(style);
          const icon = this.getImage_(style);
          return {
            fill: {
              fillColor: backgroundColor,
              opacity: opacity
            },
            stroke: stroke || {},
            image: icon || {},
            text: text || {}
          };
        }
      }
    } catch (e) {
      console.warn(e);
    }
    return undefined;
  }

  /**
   * 移除所有要素
   */
  removeAllFeatures(): void {
    const layer = getLayerByLayerName(this.map, this.layerName);
    const overlays_ = this.map.getOverlays().getArray();
    if (layer) {
      const source = layer.getSource();
      source.clear();
    }
    if (overlays_ && overlays_.length > 0) {
      const len = overlays_.length;
      for (let i = 0; i < len; i++) {
        if (overlays_[i] && overlays_[i].get('isPlotText')) {
          this.map.removeOverlay(overlays_[i]);
          i--;
        }
      }
    }
  }

  /**
   * 获取所有要素
   * @returns 要素数组
   */
  getFeatures(): Record<string, unknown>[] {
    const rFeatures: Record<string, unknown>[] = [];
    const layer = getLayerByLayerName(this.map, this.layerName);
    if (layer) {
      const source = layer.getSource();
      if (source && source instanceof VectorSource) {
        const features = source.getFeatures();
        if (features && features.length > 0) {
          features.forEach((feature) => {
            if (feature && feature.getGeometry) {
              const geom = feature.getGeometry() as any;
              if (geom && geom.getCoordinates) {
                const type = geom.getType();
                const coordinates = geom.getCoordinates();
                rFeatures.push({
                  'type': 'Feature',
                  'geometry': {
                    'type': type,
                    'coordinates': coordinates
                  },
                  'properties': {
                    'type': feature.getGeometry()!.getPlotType(),
                    'style': this.getStyleCode(feature),
                    'points': feature.getGeometry()!.getPoints()
                  }
                });
              }
            }
          });
        }
      }
    }
    const overlays_ = this.map.getOverlays().getArray();
    overlays_.forEach((overlay: any) => {
      if (overlay.get('isPlotText')) {
        const style_ = overlay.getStyle();
        style_['width'] = overlay.getWidth() + 'px';
        style_['height'] = overlay.getHeight() + 'px';
        rFeatures.push({
          'type': 'Feature',
          'geometry': {
            'type': 'PlotText',
            'coordinates': overlay.getPosition()
          },
          'properties': {
            'id': overlay.getId(),
            'width': overlay.getWidth(),
            'height': overlay.getHeight(),
            'style': style_,
            'value': overlay.getValue()
          }
        });
      }
    });
    return rFeatures;
  }

  /**
   * 添加要素
   * @param features 要素数组
   */
  addFeatures(features: Record<string, unknown>[]): void {
    if (features && Array.isArray(features) && features.length > 0) {
      let layer = getLayerByLayerName(this.map, this.layerName);
      if (!layer) {
        layer = createVectorLayer(this.map, this.layerName, {
          create: true
        });
        layer!.setZIndex(this.options['zIndex'] as number || 99);
      }
      if (layer) {
        const source = layer.getSource();
        if (source && source instanceof VectorSource) {
          const _extents: number[][] = [];
          features.forEach(feature => {
            if (feature && feature['geometry'] && (feature['geometry'] as Record<string, unknown>)['type'] !== 'PlotText') {
              const plotType = (feature['properties'] as Record<string, unknown>)['type'] as string;
              if (plotType && Geometry[plotType]) {
                const feat = new Feature({
                  geometry: (new (Geometry as any)[plotType]([], (feature['properties'] as Record<string, unknown>)['points'], feature['properties']))
                });
                feat.set('isPlot', true);
                _extents.push(feat.getGeometry()!.getExtent());
                if (feature['properties'] && (feature['properties'] as Record<string, unknown>)['style']) {
                  const style_ = olStyleFactory((feature['properties'] as Record<string, unknown>)['style'] as Record<string, unknown>);
                  if (style_) {
                    feat.setStyle(style_);
                  }
                }
                source.addFeature(feat);
              } else {
                console.warn('不存在的标绘类型！');
              }
            } else if (feature && feature['geometry'] && (feature['geometry'] as Record<string, unknown>)['type'] === 'PlotText') {
              _extents.push((new Point(feature.geometry['coordinates'] as Coordinate)).getExtent());
              const _plotText = new PlotTextBox({
                id: (feature['properties'] as Record<string, unknown>).id as string,
                position: feature.geometry['coordinates'] as Coordinate,
                width: (feature['properties'] as Record<string, unknown>)['width'] as number,
                height: (feature['properties'] as Record<string, unknown>)['height'] as number,
                value: (feature['properties'] as Record<string, unknown>)['value'] as string,
                style: ((feature['properties'] as Record<string, unknown>).style || {}) as Record<string, string>
              });
              if (this.map && this.map instanceof Map && _plotText) {
                this.map.addOverlay(_plotText);
              } else {
                console.warn('未传入地图对象或者plotText创建失败！');
              }
            }
          });
          if (this.options['zoomToExtent'] && _extents && _extents.length > 0) {
            const _extent = this._getExtent(_extents);
            const size = this.map.getSize();
            const _view = this.map.getView();
            _view.fit(_extent, {
              size: size,
              duration: 800,
              maxZoom: (_view.getMaxZoom() || undefined)
            });
          }
        }
      }
    }
  }

  /**
   * 获取合并范围
   * @param extents 范围数组
   * @param params 范围参数
   * @returns 合并后的范围
   */
  private _getExtent(extents: number[][], params: ExtentParams = {}): number[] {
    const bbox = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];
    let _extent = extents.reduce(function (prev: number[], coord: number[]) {
      return [
        Math.min(coord[0], prev[0]),
        Math.min(coord[1], prev[1]),
        Math.max(coord[2], prev[2]),
        Math.max(coord[3], prev[3])
      ];
    }, bbox);
    const size = getSize(_extent);
    const adjust = typeof params['adjust'] === 'number' ? params['adjust'] : 0.2;
    const minWidth = typeof params['minWidth'] === 'number' ? params['minWidth'] : 0.05;
    const minHeight = typeof params['minHeight'] === 'number' ? params['minHeight'] : 0.05;
    if (size[0] <= minWidth || size[1] <= minHeight) {
      const bleft = getBottomLeft(_extent);
      const tright = getTopRight(_extent);
      const xmin = bleft[0] - adjust;
      const ymin = bleft[1] - adjust;
      const xmax = tright[0] + adjust;
      const ymax = tright[1] + adjust;
      _extent = buffer([xmin, ymin, xmax, ymax], adjust);
    }
    return _extent;
  }
}
export default PlotUtils;
