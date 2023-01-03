import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {LogServiceService} from '../../../services/log-service.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {UserService} from '../../../services/user.service';
import {MyLodash} from '../../../services/my-lodash.service';
import {WINDOW} from '../../../services/window.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthClientService} from '../../../services/auth-client.service';

@Component({
  selector: 'app-user-info-edit',
  templateUrl: './user-info-edit.component.html',
  styleUrls: ['./user-info-edit.component.scss']
})
export class UserInfoEditComponent implements OnInit {
  formStat = {
    isEdit: false
  };
  id;
  uacc;
  tipoCreacionCuenta = [];
  sexos = [];
  roles = [];
  entidadFederativas = [];

  form = this.fb.group({
    _id: [''],
    authUserId: [''],
    authInfo: this.fb.group({
      _id: [''],
      nom: [{value: '', disabled: true}, Validators.required],
      appat: [{value: '', disabled: true}, Validators.required],
      apmat: [{value: '', disabled: true}, Validators.required],
      mail: [{value: '', disabled: true}, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
      fecnac: [{value: '', disabled: true}, Validators.required],
      sexo: [{value: '', disabled: true}, Validators.required],
      tipo: [''],
      tipoCreacion: ['', Validators.required],
      entnac: [{value: '', disabled: true}, Validators.required],
      // pwd: [{value: '', disabled: true}, Validators.required],
      // pwd: [{value: '', disabled: true}],
    }),
    // tipoCreacion: ['', Validators.required],

    org: this.fb.group({
      cveStr: [{value: '', disabled: true}, Validators.required],
      nom: [{value: '', disabled: true}, Validators.required],
      abr: [{value: '', disabled: true}, Validators.required],
      eval: [{value: false, disabled: true}, Validators.required],
      area: this.fb.group({
        nom: [{value: '', disabled: true}, Validators.required],
        abr: [{value: '', disabled: true}, Validators.required],
      }),
    }),
    entFed: [{value: '', disabled: true}, Validators.required],
    telOf: [{value: '', disabled: true}],
    telExt: [{value: '', disabled: true}],
    telCel: [{value: '', disabled: true}, Validators.required],
    telCel2: [{value: '', disabled: true}],
    clientId: [{value: '', disabled: true}],
    clientSecret: [{value: '', disabled: true}],
    // roles: [[]],
  });

  constructor(
    private fb: FormBuilder,
    private log: LogServiceService,
    private snackBar: MatSnackBar,
    private usrSrv: UserService,
    private _: MyLodash,
    @Inject(WINDOW) private window: Window,
    private router: Router,
    private route: ActivatedRoute,
    private authSrv: AuthClientService,
  ) { }

  ngOnInit() {
    this.init();
  }

  async init() {
    this.log.show(this.form.getRawValue());
    const cats: any = await this.usrSrv.getCatalogos();
    this.log.show(cats);
    this.sexos = cats.sexos;
    this.entidadFederativas = cats.entidades;

    const response: any = await this.usrSrv.getUserById(this.authSrv.userData._id);
    this.log.show(response);
    this.log.show(response.clientId);
    this.log.show(response.clientSecret);
    this.form.patchValue(response);
  }

  onBack() {
    this.router.navigate(['user-cons']);
  }

  compareWithCve(c1, c2) {
    return (c1 && c2) ? c1.cve === c2.cve : false;
  }

  setEdit(toogle) {
    this.setEditField('authInfo', 'nom', null, toogle);
    this.setEditField('authInfo', 'appat', null, toogle);
    this.setEditField('authInfo', 'apmat', null, toogle);
    this.setEditField('authInfo', 'fecnac', null, toogle);
    this.setEditField('authInfo', 'sexo', null, toogle);
    this.setEditField('authInfo', 'entnac', null, toogle);
    this.setEditField('authInfo', 'entnac', null, toogle);
    this.setEditField('org', 'area', 'nom', toogle);
    this.setEditField('org', 'area', 'abr', toogle);
    this.setEditField('telOf', null, null, toogle);
    this.setEditField('telExt', null, null, toogle);
    this.setEditField('telCel', null, null, toogle);
    this.setEditField('telCel2', null, null, toogle);
  }

  // setEditField(field, subField, subSubField, toogle) {
  //   if (this._.isNilOrEmpty(subField)) {
  //     if (toogle) {
  //       this.form.get(field).enable();
  //     } else {
  //       this.form.get(field).disable();
  //     }
  //   } else {
  //     if (toogle) {
  //       this.form.get(field).get(subField).enable();
  //     } else {
  //       this.form.get(field).get(subField).disable();
  //     }
  //   }
  // }

  setEditField(field, subField, subSubField, toogle) {
    if (!this._.isNilOrEmpty(subSubField)) {
      if (toogle) {
        this.form.get(field).get(subField).get(subSubField).enable();
      } else {
        this.form.get(field).get(subField).get(subSubField).disable();
      }
      return;
    }

    if (!this._.isNilOrEmpty(subField)) {
      if (toogle) {
        this.form.get(field).get(subField).enable();
      } else {
        this.form.get(field).get(subField).disable();
      }
      return;
    }

    if (toogle) {
      this.form.get(field).enable();
    } else {
      this.form.get(field).disable();
    }
  }

  onToogleEdit(toogle) {
    this.setEdit(toogle);
    this.formStat.isEdit = toogle;
  }
}
