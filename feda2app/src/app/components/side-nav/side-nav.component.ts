import { Component, OnInit } from '@angular/core';
import { SideNavItem } from './side-nav-item';
import {Subscription} from 'rxjs';
import {SideNavService} from './side-nav.service';
import {Router} from '@angular/router';
import {LogServiceService} from '../../services/log-service.service';
import {AuthClientService} from '../../services/auth-client.service';
import {MyLodash} from '../../services/my-lodash.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit {

  items: Array<SideNavItem>;
  private subs: Subscription = new Subscription();

  constructor(
    private sideNavSrv: SideNavService,
    private router: Router,
    private log: LogServiceService,
    private authSrv: AuthClientService,
    private _: MyLodash
  ) {
    this.subs.add(
      this.sideNavSrv.routeEnterEvent$.subscribe((data) => {
          this.setSelectedMenu(data.selected);
        }
      ));
  }

  baseNavs = [
    {
      id: 1,
      name: "Carga",
      iconName: "cloud_upload",
      cssClass: "",
      navigateTo: 'carga-archivo',
      rol: 'carga'
    },
    {
      id: 2,
      name: "Plantillas",
      iconName: "insert_drive_file",
      cssClass: "",
      navigateTo: 'plantillas-view',
      rol: 'plantillas'
    },
    {
      id: 3,
      name: "Usuarios",
      iconName: "account_circle",
      cssClass: "",
      navigateTo: 'user-cons',
      rol: 'usuarios'
    },
    {
      id: 4,
      name: "Búsqueda",
      iconName: "search",
      cssClass: "",
      navigateTo: 'busqueda-cons',
      rol: 'busqueda'
    },
    {
      id: 5,
      name: "Bitácora",
      iconName: "description",
      cssClass: "",
      navigateTo: 'fila-busqueda',
      rol: 'bitacora'
    },
  ];

  ngOnInit() {
    this.items = new Array<SideNavItem>();
    this.items.push( {
      id: 1,
      name: "Carga",
      iconName: "cloud_upload",
      cssClass: "",
      navigateTo: 'carga-archivo',
      rol: 'carga'
    },
      {
      id: 2,
      name: "Plantillas",
      iconName: "insert_drive_file",
      cssClass: "",
      navigateTo: 'plantillas-view',
      rol: 'plantillas'
    },
      {
        id: 3,
        name: "Usuarios",
        iconName: "insert_drive_file",
        cssClass: "",
        navigateTo: 'user-cons',
        rol: 'usuarios'
      },
      {
        id: 4,
        name: "Busqueda",
        iconName: "insert_drive_file",
        cssClass: "",
        navigateTo: 'busqueda-cons',
        rol: 'busqueda'
      },
      {
        id: 5,
        name: "Bitácora",
        iconName: "cloud_upload",
        cssClass: "",
        navigateTo: 'fila-busqueda',
        rol: 'bitacora'
      },
      // {
    //   id: 3,
    //   name: "test 3",
    //   iconName: "",
    //   cssClass: ""
    // }
    );
  }

  seletectNavItem($event, item) {
    // for
    // for(const i of this.items) {
    //   i.cssClass = '';
    // }
    //
    // item.cssClass = 'selected-nav-item';
    this.log.show(item);
    this.router.navigate([item.navigateTo]);
  }

  setSelectedMenu(menu) {
    switch (menu) {
      case 'carga':
        this.findAndSelectMenuById(1);
        break;
      case 'plantillas-view':
        this.findAndSelectMenuById(2);
        break;
      case 'user-cons':
        this.findAndSelectMenuById(3);
        break;
      case 'busqueda-cons':
        this.findAndSelectMenuById(4);
        break;
        case 'fila-busqueda':
          this.findAndSelectMenuById(5);
          break;  
    }
  }

  findAndSelectMenuById(idMenu) {
    for (const i of this.items) {
      i.cssClass = '';
      if (i.id === idMenu) {
        i.cssClass = 'selected-nav-item';
      }
    }
  }

  getAllAuthNavs() {
    const newNavs = [];
    const userData = this.authSrv.userData;
    if (!this._.isNil(userData)) {
      for(let item of userData.roles) {
        for(let item2 of this.baseNavs) {
          if (item2.rol === item.nom) {
            newNavs.push(item2);
          }
        }
      }
      return newNavs;
    } else {
      return [];
    }
  }
}
