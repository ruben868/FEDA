import { Injectable } from '@angular/core';
import {UserModel} from '../models/user-model';
import {HttpClient} from '@angular/common/http';
import {AuthClientService} from './auth-client.service';
import {environment} from '../../environments/environment';
import {Subject} from 'rxjs';
import {LogServiceService} from './log-service.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  apiUri = environment.APIEndpoint;

  userData: UserModel;

  // MAIN OBSERVABLE ===========================================================
  private updateUserInfoEvent = new Subject<any>();
  public updateUserInfoEvent$ = this.updateUserInfoEvent.asObservable();

  constructor(
    private http: HttpClient,
    private log: LogServiceService
    // private authClient: AuthClientService
  ) { }

  async getUserData(authIdUser: string) {
    const url = `${this.apiUri}/users/getUserById/${authIdUser}`;
    try {
      this.log.show(authIdUser);
      const response: any = await this.http.get(url).toPromise();
      this.userData = response;
      this.log.show('Datos de user data de service service');
      this.log.show(this.userData);
      this.updateUserInfoEvent.next({
        userData: this.userData
      });
    } catch (e) {
      //
      this.log.show('Error');
      this.log.show(e);
    }
  }

  async getUserDataWithHeaders() {
    const url = `${this.apiUri}/users/getUserById`;
    try {
      const response: any = await this.http.get(url).toPromise();
      this.userData = response;
      this.log.show(this.userData);
      this.updateUserInfoEvent.next({
        userData: this.userData
      });
    } catch (e) {
      //
      this.log.show('Error');
      this.log.show(e);
      throw e;
    }
  }

  async signOut() {
    const url = `${this.apiUri}/signin/v1/endsession`;
    try {
      const response: any = await this.http.get(url).toPromise();
      this.userData = response;
      this.log.show(this.userData);
    } catch (e) {
      //
      this.log.show('Error: signOut - - - -  -');
      this.log.show(e);
    }
  }

  generateRandomPass() {
    let length = 8;
    let result           = '';
    const characters       = '@ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-!';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  async attemptSaveUser(data) {
    const url = `${this.apiUri}/users/upsertUser`;
    try {
      const resp = await this.http.post(url, data).toPromise();
      return resp;
    } catch (e) {
      this.log.show(e);
      throw e;
    }
  }

  async getAllUsers(pageIndex, pageSize) {
    const url = this.apiUri+'/users/getAllUsers?pageIndex='+pageIndex+'&pageSize='+pageSize;
    try {
      const resp = await this.http.get(url).toPromise();
      return resp;
    } catch (e) {
      this.log.show(e);
    }
  }

  async getUserById(id) {
    const url = `${this.apiUri}/users/get/${id}`;
    try {
      const resp = await this.http.get(url).toPromise();
      return resp;
    } catch (e) {
      this.log.show(e);
    }
  }

  async getRoles() {
    const url = `${this.apiUri}/users/getroles`;
    try {
      const resp = await this.http.get(url).toPromise();
      return resp;
    } catch (e) {
      this.log.show(e);
    }
  }

  async getCatalogos() {
    const url = `${this.apiUri}/users/getcatalogos`;
    try {
      const resp = await this.http.get(url).toPromise();
      this.log.show(resp);
      return resp;
    } catch (e) {
      this.log.show(e);
    }
  }

  async deleteUser(userId) {
    const url = `${this.apiUri}/users/delete-account`;
    try {
      const resp = await this.http.post(url, { userId: userId, hardDelete: true}).toPromise();
      this.log.show(resp);
      return resp;
    } catch (e) {
      this.log.show(e);
    }
  }

  //create-unattended
  async createUnattended(userId) {
    const url = `${this.apiUri}/users/create-unattended/${userId}`;
    try {
      const resp = await this.http.post(url, {}).toPromise();
      this.log.show(resp);
      return resp;
    } catch (e) {
      this.log.show(e);
    }
  }

  //create-unattended
  async getUnattendedAccount(userId) {
    const url = `${this.apiUri}/users/get-unattended/${userId}`;
    try {
      const resp = await this.http.get(url).toPromise();
      this.log.show(resp);
      return resp;
    } catch (e) {
      this.log.show(e);
    }
  }
}
