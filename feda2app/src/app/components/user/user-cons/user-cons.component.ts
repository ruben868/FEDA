import { Component, OnInit, ViewChild } from '@angular/core';
import {LogServiceService} from '../../../services/log-service.service';
import {UserService} from '../../../services/user.service';
import {Router} from '@angular/router';
import {SideNavService} from '../../side-nav/side-nav.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-user-cons',
  templateUrl: './user-cons.component.html',
  styleUrls: ['./user-cons.component.scss']
})

// export class TableStickyHeaderExample {
//   displayedColumns = ['position', 'name', 'weight', 'symbol'];
//   dataSource = ELEMENT_DATA;
// }

export class UserConsComponent implements OnInit {
  displayedColumns = ['position', 'name', 'weight'];
  dataSource;
  info: any;
  total: any = 0;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  data: any;
  // dataSource = [{
  //   authUserId: {
  //     mail: 'test'
  //   },
  //   org: {
  //     nom: 'C5 NUEVO LEON',
  //     abr: 'C5 NL',
  //     area: {
  //       nom: 'test'
  //     }
  //   }
  // }, {
  //   authUserId: {
  //     mail: 'test2'
  //   }, org: {
  //     nom: 'C5 NUEVO LEON',
  //     abr: 'C5 NL',
  //     area: {
  //       nom: 'test'
  //     }
  //   }
  // }, {
  //   authUserId: {
  //     mail: 'test2'
  //   }, org: {
  //     nom: 'C5 NUEVO LEON',
  //     abr: 'C5 NL',
  //     area: {
  //       nom: 'test'
  //     }
  //   }
  // }, {
  //   authUserId: {
  //     mail: 'test2'
  //   }, org: {
  //     nom: 'C5 NUEVO LEON',
  //     abr: 'C5 NL',
  //     area: {
  //       nom: 'test'
  //     }
  //   }
  // }, {
  //   authUserId: {
  //     mail: 'test2'
  //   }, org: {
  //     nom: 'C5 NUEVO LEON',
  //     abr: 'C5 NL',
  //     area: {
  //       nom: 'test'
  //     }
  //   }
  // }, {
  //   authUserId: {
  //     mail: 'test2'
  //   }, org: {
  //     nom: 'C5 NUEVO LEON',
  //     abr: 'C5 NL',
  //     area: {
  //       nom: 'test'
  //     }
  //   }
  // }, {
  //   authUserId: {
  //     mail: 'test2'
  //   }, org: {
  //     nom: 'C5 NUEVO LEON',
  //     abr: 'C5 NL',
  //     area: {
  //       nom: 'test'
  //     }
  //   }
  // }, {
  //   authUserId: {
  //     mail: 'test2'
  //   }, org: {
  //     nom: 'C5 NUEVO LEON',
  //     abr: 'C5 NL',
  //     area: {
  //       nom: 'test'
  //     }
  //   }
  // }, {
  //   authUserId: {
  //     mail: 'test2'
  //   }, org: {
  //     nom: 'C5 NUEVO LEON',
  //     abr: 'C5 NL',
  //     area: {
  //       nom: 'test'
  //     }
  //   }
  // }, {
  //   authUserId: {
  //     mail: 'test2'
  //   }, org: {
  //     nom: 'C5 NUEVO LEON',
  //     abr: 'C5 NL',
  //     area: {
  //       nom: 'test'
  //     }
  //   }
  // }, {
  //   authUserId: {
  //     mail: 'test2'
  //   }, org: {
  //     nom: 'C5 NUEVO LEON',
  //     abr: 'C5 NL',
  //     area: {
  //       nom: 'test'
  //     }
  //   }
  // }, {
  //   authUserId: {
  //     mail: 'test2'
  //   }, org: {
  //     nom: 'C5 NUEVO LEON',
  //     abr: 'C5 NL',
  //     area: {
  //       nom: 'test'
  //     }
  //   }
  // }, {
  //   authUserId: {
  //     mail: 'test2'
  //   }, org: {
  //     nom: 'C5 NUEVO LEON',
  //     abr: 'C5 NL',
  //     area: {
  //       nom: 'test'
  //     }
  //   }
  // }, {
  //   authUserId: {
  //     mail: 'test2'
  //   }, org: {
  //     nom: 'C5 NUEVO LEON',
  //     abr: 'C5 NL',
  //     area: {
  //       nom: 'test'
  //     }
  //   }
  // }, {
  //   authUserId: {
  //     mail: 'test2'
  //   }, org: {
  //     nom: 'C5 NUEVO LEON',
  //     abr: 'C5 NL',
  //     area: {
  //       nom: 'test'
  //     }
  //   }
  // }, {
  //   authUserId: {
  //     mail: 'test2'
  //   }, org: {
  //     nom: 'C5 NUEVO LEON',
  //     abr: 'C5 NL',
  //     area: {
  //       nom: 'test'
  //     }
  //   }
  // }, {
  //   authUserId: {
  //     mail: 'test2'
  //   }, org: {
  //     nom: 'C5 NUEVO LEON',
  //     abr: 'C5 NL',
  //     area: {
  //       nom: 'test'
  //     }
  //   }
  // }, {
  //   authUserId: {
  //     mail: 'test2'
  //   }, org: {
  //     nom: 'C5 NUEVO LEON',
  //     abr: 'C5 NL',
  //     area: {
  //       nom: 'test'
  //     }
  //   }
  // }, {
  //   authUserId: {
  //     mail: 'test2'
  //   }, org: {
  //     nom: 'C5 NUEVO LEON',
  //     abr: 'C5 NL',
  //     area: {
  //       nom: 'test'
  //     }
  //   }
  // }, {
  //   authUserId: {
  //     mail: 'test2'
  //   }, org: {
  //     nom: 'C5 NUEVO LEON',
  //     abr: 'C5 NL',
  //     area: {
  //       nom: 'test'
  //     }
  //   }
  // }, {
  //   authUserId: {
  //     mail: 'test2'
  //   }, org: {
  //     nom: 'C5 NUEVO LEON',
  //     abr: 'C5 NL',
  //     area: {
  //       nom: 'test'
  //     }
  //   }
  // }
  // ];

  constructor(
    private log: LogServiceService,
    private usrSrv: UserService,
    private router: Router,
    private sideNavSrv: SideNavService,
  ) {
    this.sideNavSrv.addEnterEvent('user-cons');
  }

  ngOnInit() {
    //this.init();
    this.consult(0,15)
  }

  // async init() {
  //   this.dataSource = await this.usrSrv.getAllUsers();
  // }

    //Paginado
    consult(pageIndex, PageSize) {
      this.usrSrv.getAllUsers(pageIndex,PageSize).then( (resp: any) => {
        this.dataSource = resp.data;
        this.total=resp.total
  
      });
    }

    changePage(event) {
      this.consult(event.pageIndex, event.pageSize)
  
    }

  onClickRow(row) {
    this.log.show(row);
    this.router.navigate(['user-edit', row._id]);
  }

  onNewUser() {
    this.router.navigate(['user-edit']);
  }
}
