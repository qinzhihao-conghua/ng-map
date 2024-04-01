/**基本Style样式 */
export interface BaseStyle {
    /**填充色，rgba形式 */
    fill?: string;
    /**线条样式 */
    stroke?: StrokeStyle;
    /**点图片样式 */
    image?: ImageStyle;
    /**文本样式 */
    text?: TextStyle;
    /**点颜色，与图片互斥 */
    pointColor?: string;
}
/**线条相关样式 */
export interface StrokeStyle {
    /**线条颜色 */
    color?: string;
    /**线条宽度 */
    width?: number;
    /**虚线间隔 */
    lineDash?: Array<number>;
    /**线条端点类型，默认round */
    lineCap?: string;
    /**虚线端点 */
    lineDashOffset?: number;
    /**默认round */
    lineJoin?: string;
    /**拐点样式默认0 */
    miterLimit?: number;
}
/**点图片相关样式 */
export interface ImageStyle {
    /**点类型，如果改点是显示一个小图标，则type传icon */
    type: string;
    /**图片地址 */
    src?: string;
    /**图片缩放 */
    scale?: number;
    /**图片锚点位置 */
    anchor?: Array<number>;
    /**图片跨域，anonymous */
    crossOrigin?: string;
}
/**文本相关样式 */
export interface TextStyle {
    /**文本 */
    text?: string;
    /**颜色 */
    color?: string;
    /**文本缩放 */
    scale?: number;
    /**文本字体，默认10px sans-serif */
    font?: string;
    /**文本溢出 */
    overflow?: boolean;
    /**文本x偏移 */
    offsetX?: number;
    /**文本y偏移 */
    offsetY?: number;
}
/** 底图基本信息 */
export interface LayerOption {
    /**sourceUrl */
    sourceUrl: string,
    /**坐标系 */
    projection: string,
    /**图层类型 */
    layerType: string,
    /**sourceType */
    sourceType: string
}
/**聚合图样式 */
export interface ClusterStyle {
    /**半径 */
    radius?: number,
    /**描边 */
    stroke?: string,
    /**填充 */
    fill?: string,
    /**文本颜色 */
    textColor?: string
}