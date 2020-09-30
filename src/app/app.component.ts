import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ng-map-demo';
  flag = false;
  showMap(parm: string) {
    if (parm === 'ol') {
      this.flag = false;
    } else if (parm === 'bd') {
      this.flag = true;
    }
  }
}
