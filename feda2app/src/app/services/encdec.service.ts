import { Injectable } from '@angular/core';
import * as crypto from 'crypto-js';
import {LogServiceService} from './log-service.service';

@Injectable({
  providedIn: 'root'
})
export class EncdecService {

  ivBase = '0123456789ABCDEF';

  constructor(
    private log: LogServiceService
  ) { }

  public dec(data, secret) {
    const iv = crypto.enc.Utf8.parse(this.ivBase);
    // this.log.show('dec - - - - - - - - - - -');
    // this.log.show(data);
    // this.log.show(secret);
    let pass = (secret + secret + secret).substring(0, 32);
    pass = crypto.enc.Utf8.parse(pass);
    try {
      const options = { mode: crypto.mode.CBC, iv: iv};
      // this.log.show('(1)');
      const json = crypto.AES.decrypt({
          ciphertext: crypto.enc.Base64.parse(data)
        },
        pass,
        options
      );
      // this.log.show('(2)');
      // this.log.show(json);
      // this.log.show('(3)');
      const strData = json.toString(crypto.enc.Utf8); //crypto.enc.Utf8.parse(json); // json.toString(crypto.enc.Utf8);
      // this.log.show(strData);
      // this.log.show('(4)');
      const theData = JSON.parse(strData);
      this.log.show('encdec.service -> dec :: Decrypted');
      return theData;
    } catch (err) {
      this.log.show('encdec.service -> dec :: Encoded');
      this.log.show(err);
      return null;
    }
  }
}
