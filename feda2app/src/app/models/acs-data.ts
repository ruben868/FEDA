import * as _ from 'lodash';

export class AcsData {
  authCode: string;
  token: string;
  clientCode: string;
  clientCodeMethod: string;
  refreshToken: string;
  userInfo: any;
  userId: string;
  clientId: string;

  constructor() {
    this.init();
  }

  public init() {
    this.authCode = null;
    this.token = null;
    this.clientCode = null;
    this.refreshToken = null;
  }

  public initWithData(data: any) {
    if (_.hasIn(data, 'authCode')) {
      this.authCode = data.authCode;
    }

    if (_.hasIn(data, 'token')) {
      this.token = data.token;
    }

    if (_.hasIn(data, 'clientCode')) {
      this.clientCode = data.clientCode;
    }

    if (_.hasIn(data, 'refreshToken')) {
      this.refreshToken = data.refreshToken;
    }

    if (_.hasIn(data, 'userInfo')) {
      this.userInfo = data.userInfo;
    }

    if (_.hasIn(data, 'userId')) {
      this.userId = data.userId;
    }
    //clientId
    if (_.hasIn(data, 'clientId')) {
      this.clientId = data.clientId;
    }

    if (_.hasIn(data, 'clientCodeMethod')) {
      this.clientCodeMethod = data.clientCodeMethod;
    }
  }
}
