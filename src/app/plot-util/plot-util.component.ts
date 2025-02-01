import { Component, OnInit } from '@angular/core';
import { ViewOptions } from 'ol/View';
import { OlMapService } from '../service/ol-map-service';
import { Feature, Map } from 'ol';
import Select from 'ol/interaction/Select';
import Modify from 'ol/interaction/Modify';
import OlPlot from '../plot-utils';

@Component({
  selector: 'app-plot-util',
  templateUrl: './plot-util.component.html',
  styleUrls: ['./plot-util.component.scss']
})
export class PlotUtilComponent implements OnInit {

  constructor() { }
  map: Map;
  mapInstance: OlMapService = null;
  mapPlot: OlPlot;
  selectEdit: Select;
  modifyEdit: Modify;
  ngOnInit(): void {
  }
  ngAfterViewInit() {
    this.initMap();
  }
  initMap() {
    const viewOptions: ViewOptions = {
      // center: [121.471325, 31.231929],
      center: [108.316492, 22.818136],
      zoom: 12,
      maxZoom: 20,
      minZoom: 1,
      projection: 'EPSG:4326'
    };
    this.mapInstance = new OlMapService();
    this.map = this.mapInstance.initMap('map-container', viewOptions);
    this.mapPlot = new OlPlot(this.map, {})
  }
  drawGemo(type) {
    this.mapPlot.plotDraw.active(type);
    // this.mapPlot.plotDraw.drawEnd()
  }
  getFeatures() {
    const features = this.mapPlot.plotUtils.getFeatures()
    console.log(features)
    this.mapPlot.plotUtils.removeAllFeatures()
    this.mapPlot.plotEdit.deactivate()
    this.mapPlot.plotUtils.addFeatures(features)
  }

  editLayer() {
    let features: Feature;
    this.selectEdit = new Select({
      multi: false //取消多选
    })
    this.map.addInteraction(this.selectEdit);
    this.modifyEdit = new Modify({
      features: this.selectEdit.getFeatures()//将选中的要素添加修改功能
    })
    this.map.addInteraction(this.modifyEdit)
    this.selectEdit.on("select", function (evt) {
      console.log('选择', evt)
    })
    //监听要素修改时
    this.modifyEdit.on("modifyend", function (evt) {
      let new_feature = evt.features.item(0)
      console.log('编辑结束', new_feature)
    })

    // this.mapPlot.plotEdit.activate(features);
  }
  cancelEdit() {
    this.mapPlot.plotEdit.deactivate()
    this.map.removeInteraction(this.selectEdit);
    this.map.removeInteraction(this.modifyEdit);
  }
}
