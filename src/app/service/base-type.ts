/**基本Style样式 */
export class BaseStyle {
    /**填充色，rgba形式 */
    fill?: string = 'rgba(255, 255, 255, 0.5)';
    /**线条样式 */
    stroke?: StrokeStyle = new StrokeStyle();
    /**点图片样式 */
    image?: ImageStyle = new ImageStyle();
    /**文本样式 */
    text?: TextStyle = new TextStyle();
    /**点颜色，与图片互斥 */
    pointColor?: string = '#03a9f4';
}
/**线条相关样式 */
export class StrokeStyle {
    /**线条颜色 */
    color?: string = '#ff3300';
    /**线条宽度 */
    width?: number = 2;
    /**虚线间隔 */
    lineDash?: Array<number>;
    /**线条端点类型，默认round */
    lineCap?: string;
    /**虚线端点 */
    lineDashOffset?: number = 0;
    /**默认round */
    lineJoin?: string;
    /**拐点样式默认0 */
    miterLimit?: number;
}
/**点图片相关样式 */
export class ImageStyle {
    /**点类型，如果该点是显示一个小图标，则type传icon */
    type?: string;
    /**icon图片地址 */
    src?: string = '';
    /**icon图片缩放 */
    scale?: number = .15;
    /**icon图片锚点位置 */
    anchor?: Array<number> = [0.5, 1];
    /**icon图片跨域，anonymous */
    crossOrigin?: string = 'anonymous';
    circleRadius?: number = 7;
}
/**文本相关样式 */
export class TextStyle {
    /**文本 */
    text?: string;
    /**颜色 */
    color?: string = '#000000';
    /**文本缩放 */
    scale?: number = 1;
    /**文本字体，默认10px sans-serif */
    font?: string = '10px 黑体';
    /**文本溢出 */
    overflow?: boolean = false;
    /**文本x偏移 */
    offsetX?: number = 0;
    /**文本y偏移 */
    offsetY?: number = 0;
}
/** 底图基本信息 */
export class LayerOption {
    /**sourceUrl */
    sourceUrl: string;
    /**坐标系 */
    projection: string;
    /**图层类型 */
    layerType: string;
    /**sourceType */
    sourceType: string;
}
/**聚合图样式 */
export class ClusterStyle {
    /**半径 */
    radius?: number;
    /**描边 */
    stroke?: string;
    /**填充 */
    fill?: string;
    /**文本颜色 */
    textColor?: string;
}