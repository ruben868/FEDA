import {AfterViewChecked, AfterViewInit, Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MAT_DATE_LOCALE} from '@angular/material';
import {LogServiceService} from '../../../services/log-service.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {UserService} from '../../../services/user.service';
import {MyLodash} from '../../../services/my-lodash.service';
import {WINDOW} from '../../../services/window.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material/table';



// import {DateAdapter, MatDatepickerModule} from '@angular/material';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'es-US' }]

})
export class UserEditComponent implements OnInit, AfterViewInit {
  id;
  uacc;
  tipoCreacionCuenta = [
    {
      cve: 1,
      nom: 'Contraseña temporal',
      tipo: 'tipo-creacion-usuario'
    },
    // {
    //   cve: 2,
    //   nom: 'Invitación',
    //   tipo: 'tipo-creacion-usuario'
    // }
  ];

  sexos = [
    {
      cve: 1,
      nom: 'Mujer',
      tipo: 'sexos'
    },
    {
      cve: 2,
      nom: 'Hombre',
      tipo: 'sexos'
    }
  ];

  roles = [];

  entidadFederativas = [
    // {
    //   cve: 1,
    //   cveStr: '01',
    //   nom: 'Aguascalientes',
    //   tipo: 'entidad-federativa'
    // },
    // {
    //   cve: 2,
    //   cveStr: '02',
    //   nom: 'Baja California',
    //   tipo: 'entidad-federativa'
    // }
  ];

  form = this.fb.group({
    _id: [''],
    authUserId: [''],
    authInfo: this.fb.group({
      _id: [''],
      nom: ['', Validators.required],
      appat: ['', Validators.required],
      apmat: ['', Validators.required],
      mail: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
      fecnac: ['', Validators.required],
      sexo: ['', Validators.required],
      tipo: [''],
      tipoCreacion: ['', Validators.required],
      entnac: ['', Validators.required],
      // pwd: [{value: '', disabled: true}, Validators.required],
      // pwd: [{value: '', disabled: true}],
    }),
    // tipoCreacion: ['', Validators.required],

    org: this.fb.group({
      cveStr: ['', Validators.required],
      nom: ['', Validators.required],
      abr: ['', Validators.required],
      eval: [false, Validators.required],
      area: this.fb.group({
        nom: ['', Validators.required],
        abr: ['', Validators.required],
      }),
    }),
    entFed: ['', Validators.required],
    telOf: [''],
    telExt: [''],
    telCel: ['', Validators.required],
    telCel2: [''],
    roles: [[]],
    clientId: [{value: '', disabled: true}],
    clientSecret: [{value: '', disabled: true}],
  });

  pwdType = 'password';

  displayedColumns: string[] = ['select', 'rol'];
  dataSource = new MatTableDataSource<any>(this.roles);
  selection = new SelectionModel<any>(true, []);

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  constructor(
    private fb: FormBuilder,
    private log: LogServiceService,
    private snackBar: MatSnackBar,
    private usrSrv: UserService,
    private _: MyLodash,
    @Inject(WINDOW) private window: Window,
    private router: Router,
    private route: ActivatedRoute,
    // private dateAdapter: DateAdapter<any>
  ) {
    this.route.paramMap.subscribe( (params: ParamMap) => {
      this.id = params.get('id');
      this.log.show(this.id);
    });
  }

  ngOnInit() {
    this.init();
  }

  ngAfterViewInit() {

  }

  async init() {
    this.log.show(this.form.getRawValue());
    const cats: any = await this.usrSrv.getCatalogos();
    this.log.show(cats);
    this.sexos = cats.sexos;
    this.entidadFederativas = cats.entidades;
    this.tipoCreacionCuenta = cats.tipoCreaciones;
    this.log.show(this.entidadFederativas);
    const tmpRoles: any = await this.usrSrv.getRoles();
    this.roles = tmpRoles;
    this.dataSource = new MatTableDataSource<any>(this.roles);

    if (!this._.isNilOrEmpty(this.id)) {
      const res: any = await this.usrSrv.getUserById(this.id);
      this.log.show(res);
      this.form.patchValue(res);

      let tempRoles = [];
      for(let item of this.roles) {
        for (let item2 of res.roles) {
          if (item.cveStr === item2.cveStr) {
            tempRoles.push(item);
            break;
          }
        }
      }
      this.selection = new SelectionModel<any>(true, tempRoles);

      const uacc = await this.usrSrv.getUnattendedAccount(this.id);
      this.setClientIdAndSecretData(uacc);

    }
  }

  setClientIdAndSecretData(uacc) {
    const clientId = this._.get(uacc, 'authInfo.clientId', '');
    const clientSecret = this._.get(uacc, 'authInfo.clientSecret', '');
    this.log.show(clientId);
    this.form.get('clientId').patchValue(clientId);
    this.form.get('clientSecret').patchValue(clientSecret);
  }

  onGuardar() {
    this.onSubmit();
  }

  async onSubmit() {
    try {
      if (this.form.valid) {
        // const randomPass = this.usrSrv.generateRandomPass();
        // this.log.show(randomPass);
        // let pwd = this.form.get('authInfo').get('pwd').value;
        // if (this._.isNilOrEmpty(pwd)) {
        //   pwd = randomPass;
        // }
        // this.form.get('authInfo').get('pwd').patchValue(randomPass);
        const val = this.form.getRawValue();
        val.roles = this.selection.selected;
        this.log.show(val);
        // val.authInfo.opts = {
        //   sendInvitation: true,
        //   redirectUrl: this.window.location.origin,
        //   appName: 'Base Nacional de Presuntos Números de Extorsión y Fraude Telefónico'
        // };
        const resp: any = await this.usrSrv.attemptSaveUser(val);
        val._id = resp._id;
        val.authUserId = resp.authUserId;
        val.authInfo._id = resp.authUserId;
        this.id = resp._id;
        // val.authInfo.tipo = resp.authInfo.;
        this.log.show(resp);
        this.log.show(val);
        this.form.patchValue(val);
        this.log.show(this.form.getRawValue());

        await this.onCreateUnattended();

        const uacc = this.usrSrv.getUnattendedAccount(this.id);
        this.uacc = uacc;
        this.setClientIdAndSecretData(uacc);
      } else {
        this.snackBar.open('Llene los campos obligatorios.');
      }
    } catch (e) {
      if (e.error && e.error.module) {
        if (e.error.code === 1) {
          this.snackBar.open('El correo ya está dado de alta. Utilice otro correo electrónico.');
        } else if (e.error.code === 2) {
          this.snackBar.open('Error al intentar crear el usuario (código: 2)');
        } else if (e.error.code === 3) {
          this.snackBar.open('Error al intentar crear el usuario (código: 3)');
        } else if (e.error.code === 0) {
          this.snackBar.open('Error al intentar crear el usuario (código: 0)');
        }
      } else {
        this.snackBar.open('Ocurrió un error al guardar la información');
        this.log.show(e);
      }
    }

  }

  onBack() {
    this.router.navigate(['user-cons']);
  }

  compareWithCve(c1, c2) {
    return (c1 && c2) ? c1.cve === c2.cve : false;
  }

  async onEnviarInv() {
    await this.onSubmit();
    if (this.form.valid) {
      const res = confirm('Al enviar la invitación, la cuenta quedará inactiva hasta que el usuario la active. ¿Está seguro de enviar la invitación?');
      if (res) {
        const val = this.form.getRawValue();
        val.roles = this.selection.selected;
        this.log.show(val);
        val.authInfo.opts = {
          sendInvitation: true,
          redirectUrl: this.window.location.origin,
          appName: 'Base Nacional de Presuntos Números de Extorsión y Fraude Telefónico'
        };
        const resp: any = await this.usrSrv.attemptSaveUser(val);
        this.log.show(resp);
        this.snackBar.open('Invitación enviada');
      }
    }
  }

  async onDeleteAccount() {
    try {
      if (!this._.isNil(this.id)) {
        this.usrSrv.deleteUser(this.id);
      }
    } catch (e) {
      this.log.show(e);
    }
  }

  async onCreateUnattended() {
    try {
      const resp = await this.usrSrv.createUnattended(this.id);
      this.log.show(resp);
    } catch (e) {
      this.log.show(e);
    }
  }


  get clientId() {
    return this._.get(this.uacc,'authInfo.clientId', 'sin valor');
  }
}
