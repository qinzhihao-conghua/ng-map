/**
 * Created by FDD on 2017/5/1.
 * @desc 通过json获取样式
 */
import {
  Style, Icon, Stroke, Fill, RegularShape,
  Text
} from 'ol/style'
import { Geometry } from 'ol/geom'

/** 样式配置选项接口 */
interface StyleOptions {
  geometry?: Geometry;
  zIndex?: number;
  fill?: Record<string, unknown>;
  image?: Record<string, unknown> & { type?: string };
  stroke?: Record<string, unknown>;
  text?: Record<string, unknown>;
  [key: string]: unknown;
}

/** 图片配置选项接口 */
interface ImageOptions {
  type?: string;
  image?: Record<string, unknown>;
  [key: string]: unknown;
}

/** 图标配置选项接口 */
interface IconOptions {
  imageAnchor?: number[];
  imageAnchorXUnits?: string;
  imageAnchorYUnits?: string;
  imageAnchorOrigin?: string;
  imageColor?: string | number[];
  crossOrigin?: string;
  img?: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;
  offset?: number[];
  offsetOrigin?: string;
  scale?: number;
  rotateWithView?: boolean;
  imageOpacity?: number;
  imageRotation?: number;
  size?: number[];
  imgSize?: number[];
  imageSrc?: string;
  [key: string]: unknown;
}

/** 描边配置选项接口 */
interface StrokeOptions {
  strokeColor?: string | number[];
  strokeLineCap?: CanvasLineCap;
  strokeLineJoin?: CanvasLineJoin;
  strokeLineDash?: number[];
  strokeLineDashOffset?: number;
  strokeMiterLimit?: number;
  strokeWidth?: number;
  [key: string]: unknown;
}

/** 文本配置选项接口 */
interface TextOptions {
  textFont?: string;
  textOffsetX?: number;
  textOffsetY?: number;
  textScale?: number;
  textRotation?: number;
  text?: string;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
  rotateWithView?: boolean;
  textFill?: Record<string, unknown>;
  textStroke?: Record<string, unknown>;
  [key: string]: unknown;
}

/** 填充配置选项接口 */
interface FillOptions {
  fillColor?: string | number[];
  [key: string]: unknown;
}

/** 规则形状配置选项接口 */
interface RegularShapeOptions {
  fill?: Record<string, unknown>;
  points?: number;
  radius?: number;
  radius1?: number;
  radius2?: number;
  angle?: number;
  snapToPixel?: boolean;
  stroke?: Record<string, unknown>;
  rotation?: number;
  rotateWithView?: boolean;
  atlasManager?: unknown;
  [key: string]: unknown;
}

/**
 * 样式工厂函数
 * @param options 样式配置选项
 * @returns 样式对象
 */
const StyleFactory = function (options: StyleOptions | undefined): Style {
  const option = (options && typeof options === 'object') ? options : {};
  const style = new Style({});
  if (option['geometry'] && option['geometry'] instanceof Geometry) {
    style.setGeometry(option['geometry']);
  }
  if (option['zIndex'] && typeof option['zIndex'] === 'number') {
    style.setZIndex(option['zIndex']);
  }
  if (option['fill'] && typeof option['fill'] === 'object') {
    style.setFill(StyleFactory._getFill(option['fill'] as FillOptions));
  }
  if (option['image'] && typeof option['image'] === 'object') {
    style.setImage(StyleFactory._getImage(option['image'] as ImageOptions));
  }
  if (option['stroke'] && typeof option['stroke'] === 'object') {
    style.setStroke(StyleFactory._getStroke(option['stroke'] as StrokeOptions));
  }
  if (option['text'] && typeof option['text'] === 'object') {
    style.setText(StyleFactory._getText(option['text'] as TextOptions));
  }
  return style;
};

/**
 * 创建规则形状样式
 * @param options 规则形状配置
 * @returns 规则形状对象
 */
StyleFactory._getRegularShape = function (options: RegularShapeOptions): RegularShape | undefined {
  try {
    const regularShape = new RegularShape({
      fill: (StyleFactory._getFill(options['fill'] as FillOptions) || undefined),
      points: ((typeof options['points'] === 'number') ? options['points'] : 1),
      radius: ((typeof options['radius'] === 'number') ? options['radius'] : undefined),
      radius1: ((typeof options['radius1'] === 'number') ? options['radius1'] : undefined),
      radius2: ((typeof options['radius2'] === 'number') ? options['radius2'] : undefined),
      angle: ((typeof options['angle'] === 'number') ? options['angle'] : 0),
      stroke: (StyleFactory._getStroke(options['stroke'] as StrokeOptions) || undefined),
      rotation: ((typeof options['rotation'] === 'number') ? options['rotation'] : 0),
      rotateWithView: ((typeof options['rotateWithView'] === 'boolean') ? options['rotateWithView'] : false)
    });
    return regularShape;
  } catch (e) {
    console.log(e);
    return undefined;
  }
};

/**
 * 创建图片样式
 * @param options 图片配置
 * @returns 图片对象
 */
StyleFactory._getImage = function (options: ImageOptions): Icon | RegularShape | undefined {
  try {
    let image: Icon | RegularShape | undefined;
    options = options || {};
    if (options['type'] === 'icon') {
      image = StyleFactory._getIcon(options['image'] as IconOptions);
    } else {
      image = StyleFactory._getRegularShape(options['image'] as RegularShapeOptions);
    }
    return image;
  } catch (e) {
    console.log(e);
    return undefined;
  }
};

/**
 * 创建图标
 * @param options 图标配置
 * @returns 图标对象
 */
StyleFactory._getIcon = function (options: IconOptions): Icon | undefined {
  try {
    options = options || {};
    const icon = new Icon({
      anchor: (options['imageAnchor'] ? options['imageAnchor'] : [0.5, 0.5]),
      anchorXUnits: (options['imageAnchorXUnits'] ? options['imageAnchorXUnits'] : 'fraction'),
      anchorYUnits: (options['imageAnchorYUnits'] ? options['imageAnchorYUnits'] : 'fraction'),
      anchorOrigin: (options['imageAnchorOrigin'] ? options['imageAnchorOrigin'] : 'top-left'),
      color: (options['imageColor'] ? options['imageColor'] : undefined),
      crossOrigin: (options['crossOrigin'] ? options['crossOrigin'] : undefined),
      img: (options['img'] ? options['img'] as HTMLImageElement : undefined),
      offset: (options['offset'] && Array.isArray(options['offset']) && options['offset'].length === 2 ? options['offset'] : [0, 0]),
      offsetOrigin: (options['offsetOrigin'] ? options['offsetOrigin'] : 'top-left'),
      scale: ((typeof options['scale'] === 'number') ? options['scale'] : 1),
      rotateWithView: (typeof options['rotateWithView'] === 'boolean' ? options['rotateWithView'] : false),
      opacity: (typeof options['imageOpacity'] === 'number' ? options['imageOpacity'] : 1),
      rotation: (typeof options['imageRotation'] === 'number' ? options['imageRotation'] : 0),
      size: (options['size'] && Array.isArray(options['size']) && options['size'].length === 2 ? options['size'] : undefined),
      imgSize: (options['imgSize'] && Array.isArray(options['imgSize']) && options['imgSize'].length === 2 ? options['imgSize'] : undefined),
      src: (options['imageSrc'] ? options['imageSrc'] : undefined)
    });
    return icon;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

/**
 * 创建描边样式
 * @param options 描边配置
 * @returns 描边对象
 */
StyleFactory._getStroke = function (options: StrokeOptions | undefined): Stroke | undefined {
  try {
    options = options || {};
    const stroke = new Stroke({
      color: (options['strokeColor'] ? options['strokeColor'] : undefined),
      lineCap: ((options['strokeLineCap'] && typeof options['strokeLineCap'] === 'string') ? options['strokeLineCap'] : 'round'),
      lineJoin: ((options['strokeLineJoin'] && typeof options['strokeLineJoin'] === 'string') ? options['strokeLineJoin'] : 'round'),
      lineDash: (options['strokeLineDash'] ? options['strokeLineDash'] : undefined),
      lineDashOffset: (typeof options['strokeLineDashOffset'] === 'number' ? options['strokeLineDashOffset'] : 0),
      miterLimit: (typeof options['strokeMiterLimit'] === 'number' ? options['strokeMiterLimit'] : 10),
      width: (typeof options['strokeWidth'] === 'number' ? options['strokeWidth'] : undefined)
    });
    return stroke;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

/**
 * 创建文本样式
 * @param options 文本配置
 * @returns 文本对象
 */
StyleFactory._getText = function (options: TextOptions | undefined): Text | undefined {
  try {
    const text = new Text({
      font: ((options && options['textFont'] && typeof options['textFont'] === 'string') ? options['textFont'] : '10px sans-serif'),
      offsetX: (options && typeof options['textOffsetX'] === 'number' ? options['textOffsetX'] : 0),
      offsetY: (options && typeof options['textOffsetY'] === 'number' ? options['textOffsetY'] : 0),
      scale: (options && typeof options['textScale'] === 'number' ? options['textScale'] : undefined),
      rotation: (options && typeof options['textRotation'] === 'number' ? options['textRotation'] : 0),
      text: ((options && options['text'] && typeof options['text'] === 'string') ? options['text'] : undefined),
      textAlign: ((options && options['textAlign'] && typeof options['textAlign'] === 'string') ? options['textAlign'] : 'start'),
      textBaseline: ((options && options['textBaseline'] && typeof options['textBaseline'] === 'string') ? options['textBaseline'] : 'alphabetic'),
      rotateWithView: (options && typeof options['rotateWithView'] === 'boolean' ? options['rotateWithView'] : false),
      fill: StyleFactory._getFill(options ? options['textFill'] as FillOptions : undefined),
      stroke: StyleFactory._getStroke(options ? options['textStroke'] as StrokeOptions : undefined)
    });
    return text;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

/**
 * 创建填充样式
 * @param options 填充配置
 * @returns 填充对象
 */
StyleFactory._getFill = function (options: FillOptions | undefined): Fill | undefined {
  try {
    options = options || {};
    const fill = new Fill({
      color: (options['fillColor'] ? options['fillColor'] : undefined)
    });
    return fill;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

export default StyleFactory;
