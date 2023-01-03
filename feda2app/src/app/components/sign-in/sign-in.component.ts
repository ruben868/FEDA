import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import * as _ from 'lodash';
import {AuthClientService} from '../../services/auth-client.service';
import {LogServiceService} from '../../services/log-service.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
  authCode: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authSrv: AuthClientService,
    private log: LogServiceService,
  ) {
    const tempProm = this.route.paramMap.subscribe( (params: ParamMap) => {
      this.log.show(params);
      this.authCode = params.get('authCode');
    });

  }

  ngOnInit() {
    // this.initAsync();
    this.authSrv.signIn(this.authCode);
  }

  async initAsync() {
    // Si por URL se recibió un authcode, obtener el token
    if (!_.isNil(this.authCode)) {
      this.log.show('initAsync (1.1)');
      // Obtener el token del servidor
      const response = await this.authSrv.requestTokenAsync(this.authCode);
      if (!_.isNil(response)) {
        this.log.show('initAsync (1.2)');
        // Redirigir a la página default

        this.authSrv.addEvent(true);

        this.router.navigate(['']);
      } else {
        this.log.show('initAsync (1.3)');
        this.authSrv.authGetLoginForm();
      }
    } else {
      this.log.show('initAsync (2.1)');
      if (!_.isNil(this.authSrv.ssToken)) {
        this.log.show('initAsync (2.2)');
        this.authSrv.addEvent(true);
        // Obtener un token, si es que existe, validarlo en el servidor
      } else {
        this.log.show('initAsync (2.3)');
        // Si no existe el token, redirigir a la página de login
        this.authSrv.authGetLoginForm();
      }
    }
  }

  reredirect() {
    this.authSrv.authGetLoginForm2();
  }
}
