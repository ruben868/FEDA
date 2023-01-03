import {Component, Inject, Input, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {WINDOW} from '../../services/window.service';
import {LogServiceService} from '../../services/log-service.service';
import {MyLodash} from '../../services/my-lodash.service';

@Component({
  selector: 'app-csetpwd',
  templateUrl: './csetpwd.component.html',
  styleUrls: ['./csetpwd.component.scss']
})
export class CsetpwdComponent implements OnInit {
  uri = environment.APIEndpoint;
  showErrMsg = false;

  @Input() invitationCode = ''
  @Input() pin = '';
  pwd = '';
  @Input() url = '';

  form = this.fb.group({
    pwd: ['', [Validators.required]],
    pwdc: ['', [Validators.required]],
    // mail: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
    // pwd: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    @Inject(WINDOW) private window: Window,
    private log: LogServiceService,
    private _: MyLodash
  ) { }

  ngOnInit() {
  }

  onSubmit() {
    this.setNewPwd();
  }

  async setNewPwd() {
    if (this.form.valid) {
      const data = this.form.getRawValue();
      if (data.pwd === data.pwdc) {
        // Enviar al servidor
        await this.setPwdOnServer(this.invitationCode, this.pin, data.pwd, this.url);
      }
    }
  }

  async setPwdOnServer(invitationCode, pin, pwd, url) {
    const newUrl = `${this.uri}/auth/v1/ic`;
    try {
      const resp: any = await this.http.post(newUrl, {
        ic: invitationCode,
        pin: pin,
        pwd: pwd,
        a: 3
      }).toPromise();
      this.log.show(resp);
      if (!this._.isNil(resp) && resp === true) {
        this.window.location.href = url;
      } else {
        // TODO: MANDAR ERROR
        this.showErrMsg = true;
      }
    } catch (e) {
      // TODO: MANDAR ERROR
      this.showErrMsg = true;
      this.log.show(e);
    }
  }
}

