export const environment = {
  production: true
};
export const sourceArr = [
  { sourceName: '旧高德', url: 'http://114.215.146.210:25003/v3/tile?x={x}&y={y}&z={z}' },
  { sourceName: '高德电子地图URL', url: 'https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}' },
  { sourceName: '高德卫星影像URL', url: 'https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}' },
  { sourceName: '高德大字体电子地图URL', url: 'http://wprd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}' },
  { sourceName: '高德路网URL', url: 'https://wprd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=2&style=8<ype=11' },
  { sourceName: '高德地名路网URL', url: 'https://wprd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}' },
  { sourceName: '腾讯电子地图', url: 'https://rt1.map.gtimg.com/tile?z={z}&x={x}&y={-y}&styleid=0&version=256' }
]