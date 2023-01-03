import { Component, OnInit } from '@angular/core';
import {AuthClientService} from '../../services/auth-client.service';

@Component({
  selector: 'app-app-frame',
  templateUrl: './app-frame.component.html',
  styleUrls: ['./app-frame.component.scss']
})
export class AppFrameComponent implements OnInit {

  constructor(
    private authSrv: AuthClientService
  ) { }

  ngOnInit() {
  }

  redirect() {
    this.authSrv.authGetLoginForm2();
  }
}
