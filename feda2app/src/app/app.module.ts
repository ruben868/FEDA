import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {AgGridModule} from 'ag-grid-angular';
import { ActionBarComponent } from './components/shared/action-bar/action-bar.component';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppFrameComponent } from './components/app-frame/app-frame.component';
import { SideNavComponent } from './components/side-nav/side-nav.component';
import { UserBitComponent } from './components/user-bit/user-bit.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatIconModule} from '@angular/material/icon';
import { CargaArchivoConsComponent } from './components/carga-archivo/carga-archivo-cons/carga-archivo-cons.component';
import { FilaCargaPendComponent } from './components/carga-archivo/fila-carga-pend/fila-carga-pend.component';
import {HTTP_INTERCEPTORS, HttpClientModule, HttpClient} from '@angular/common/http';
import { StdGrid2Component } from './components/shared/std-grid2/std-grid2.component';
import { ExcelService } from './services/excel.service';


import {WINDOW_PROVIDERS} from './services/window.service';
import {CookieService} from 'ngx-cookie-service';
import { SignInComponent } from './components/sign-in/sign-in.component';
import {AuthInterceptor} from './interceptor/auth-interceptor';
import {LoaderComponent} from './components/shared/loader/loader.component';
import {
    MatButtonModule,
    MatCardModule, MatDatepickerModule,
    MatExpansionModule, MatInputModule,
    MatMenuModule, MatNativeDateModule,
    MatProgressBarModule,
    MatProgressSpinnerModule, MatSelectModule, MatTabsModule,
    MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS, MatTableModule, MatCheckboxModule, MatDividerModule
} from '@angular/material';
import {MatFormFieldModule} from '@angular/material/form-field';

import { CargaArchivoEditComponent } from './components/carga-archivo/carga-archivo-edit/carga-archivo-edit.component';
import { PlantillasViewComponent } from './components/plantillas/plantillas-view/plantillas-view.component';
import { SheetjsComponent } from './components/shared/sheetjs/sheetjs.component';
import { LoadExcelExtComponent } from './components/carga-archivo/load-excel-ext/load-excel-ext.component';
import { PlantillaRowComponent } from './components/plantillas/plantilla-row/plantilla-row.component';
import { UserConsComponent } from './components/user/user-cons/user-cons.component';
import { UserEditComponent } from './components/user/user-edit/user-edit.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { UserInfoEditComponent } from './components/user/user-info-edit/user-info-edit.component';
import { BusquedaConsComponent } from './components/busqueda/busqueda-cons/busqueda-cons.component';
import { SearchPipe } from './pipes/search.pipe';
import { FilaBusquedaComponent } from './components/busqueda/fila-busqueda/fila-busqueda.component';
import { MatPaginatorModule } from '@angular/material/paginator';

// import { APP_BASE_HREF, PlatformLocation } from '@angular/common';


@NgModule({
  declarations: [
    ActionBarComponent,
    StdGrid2Component,
    AppComponent,
    AppFrameComponent,
    SideNavComponent,
    UserBitComponent,
    CargaArchivoConsComponent,
    FilaCargaPendComponent,
    SignInComponent,
    LoaderComponent,
    CargaArchivoEditComponent,
    PlantillasViewComponent,
    SheetjsComponent,
    LoadExcelExtComponent,
    PlantillaRowComponent,
    UserConsComponent,
    UserEditComponent,
    UserInfoEditComponent,
    BusquedaConsComponent,
    SearchPipe,
    FilaBusquedaComponent,
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatIconModule,
        HttpClientModule,
        MatProgressBarModule,
        MatMenuModule,
        MatCardModule,
        MatButtonModule,
        MatExpansionModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSnackBarModule,
        MatTableModule,
        MatCheckboxModule,
        FormsModule,
        MatDividerModule,
        MatPaginatorModule,
        AgGridModule.withComponents([]),
    ],
  providers: [
      WINDOW_PROVIDERS, CookieService, ExcelService,{
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    MatDatepickerModule,
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 2500}},
    // {
    //   provide: APP_BASE_HREF,
    //   useFactory: (s: PlatformLocation) => s.getBaseHrefFromDOM(),
    //   deps: [PlatformLocation]
    // }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
