export class GeoJsonCollectionType {
    type: string;
    features: Array<GeoJsonItemType>
}
export class GeoJsonItemType {
    type: string;
    properties: any;
    id: string;
    geometry: {
        type: string,
        coordinates: Array<any>,
    }
}