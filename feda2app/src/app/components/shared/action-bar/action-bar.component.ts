import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ActionBarBtn} from './action-bar-btn';

@Component({
  selector: 'app-action-bar',
  templateUrl: './action-bar.component.html',
  styleUrls: ['./action-bar.component.scss']
})
export class ActionBarComponent implements OnInit {

  defConf: ActionBarBtn = {
    new: false,
    refresh: false,
    exit: false,
    save: false,
    check: false,
    reject: false,
    send: false
  };

  @Input() titles: Array<string>;
  @Input() bntConf: any;

  @Output() new: EventEmitter<void> = new EventEmitter<void>();
  @Output() refresh: EventEmitter<void> = new EventEmitter<void>();
  @Output() exit: EventEmitter<void> = new EventEmitter<void>();
  @Output() save: EventEmitter<void> = new EventEmitter<void>();
  @Output() send: EventEmitter<void> = new EventEmitter<void>();
  @Output() check: EventEmitter<void> = new EventEmitter<void>();
  @Output() reject: EventEmitter<void> = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
  }

  onAdd() {
    this.new.emit();
  }

  onRefresh() {
    this.refresh.emit();
  }

  onExit() {
    this.exit.emit();
  }

  onSave() {
    this.save.emit();
  }

  onSend() {
    this.send.emit();
  }

  onApprove() {
    this.check.emit();
  }

  onReject() {
    this.reject.emit();
  }




  isShow(name: string) {
    let res = false;
    this.bntConf = (!this.bntConf) ? {} : this.bntConf;
    switch (name) {
      case 'new':
        res = (this.bntConf.new) ? this.bntConf.new : this.defConf.new;
        break;
      case 'exit':
        res = (this.bntConf.exit) ? this.bntConf.exit : this.defConf.exit;
        break;
      case 'refresh':
        res = (this.bntConf.refresh) ? this.bntConf.refresh : this.defConf.refresh;
        break;
      case 'save':
        res = (this.bntConf.save) ? this.bntConf.save : this.defConf.save;
        break;
      case 'send':
        res = (this.bntConf.send) ? this.bntConf.send : this.defConf.send;
        break;
      case 'check':
        res = (this.bntConf.check) ? this.bntConf.check : this.defConf.check;
        break;
      case 'reject':
        res = (this.bntConf.reject) ? this.bntConf.reject : this.defConf.reject;
        break;
    }

    return res;
  }

}
