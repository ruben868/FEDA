import {AfterContentInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-std-grid2',
  templateUrl: './std-grid2.component.html',
  styleUrls: ['./std-grid2.component.scss']
})
export class StdGrid2Component implements OnInit, AfterContentInit {

  @Input() sourceData;
  @Input() userColDefs;
  @Input() stdColConfig;
  @Input() defaultColDef;
  @Input() rowSelection;

  @Output() editRow = new EventEmitter<any>();
  @Output() removeRow = new EventEmitter<any>();

  gridApi;

  columnDefs = [];
  rowData = [];
  stdCols = [
    {
      headerName: "",
      field: "edit-icon",
      width: 40,
      cellRenderer: (params) => {
        return '<span><i style="font-size:9pt" class="material-icons">edit</i></span>';
      }
    },
    {
      headerName: "",
      field: "del-icon",
      width: 40,
      cellRenderer: (params) => {
        return '<span style="text-align: center; margin: 0px; padding: 0px;"><i style="font-size:9pt; text-align: center;" class="material-icons">delete</i></span>';
      }
    }
  ];

  constructor() { }

  ngOnInit() {
  }

  ngAfterContentInit(): void {
    let tempColDefs = [];

    if (this.stdColConfig && this.stdColConfig.edit) {
      tempColDefs.push(this.stdCols[0]);
    }
    if (this.stdColConfig && this.stdColConfig.remove) {
      tempColDefs.push(this.stdCols[1]);
    }

    tempColDefs = tempColDefs.concat(this.userColDefs);
    this.columnDefs = tempColDefs;

    this.rowData = this.sourceData;
  }

  // Remove from grid
  public removeFromGrid(data) {
    this.gridApi.updateRowData( {remove: [data] });

    const newDataSource = this.getRowsFromApi();
    this.sourceData = newDataSource;
    return newDataSource;
  }

  public addRow(data) {
    const res = this.gridApi.updateRowData( {add: [data] });
    // console.log(res);

    // const newDataSource = this.getRowsFromApi();
    // this.sourceData = newDataSource;
    // return newDataSource;
  }

  public updateRow(data) {
    const res = this.gridApi.updateRowData( {update: [data] });
    // console.log(res);

    // const newDataSource = this.getRowsFromApi();
    // this.sourceData = newDataSource;
    // return newDataSource;
  }


  // Get rows from grid api

  public getRowsFromApi() {
    let rows = [];
    this.gridApi.forEachNode(row => {
      rows.push(row.data);
    });
    return rows;
  }

  // Sets whole new data source
  public setDataSource(dataSourceArray) {
    this.rowData = dataSourceArray;
    this.gridApi.setRowData(this.rowData);
  }

  // Select rows in the grid
  public selectRows(array) {

    //this.gridApi.getDisplayedRowAtIndex(0).selectThisNode(true);
    //this.gridApi.getDisplayedRowAtIndex(1).selectThisNode(true);
    for (let x = 0; x < array.length; x++){
        this.gridApi.forEachNode(node => {
          if (node.data._id == array[x]._id) {
            node.selectThisNode(true);
          }
        });
    }
  }

  // Sets new data on grid
  public setNewData(data): void {
    this.rowData = data;
  }

  // Get all rows from grid
  public getRows(): any[] {
    let rows = [];

    return rows;
  }

  onGridCellClicked(params) {
    if (params.column.colId === 'del-icon') {
      this.removeRow.emit( {
        gridEvent: params,
        data: params.data
      });
    }
    if (params.column.colId === 'edit-icon') {
      this.editRow.emit({
        gridEvent: params,
        data: params.data
      });
    }
  }

  onGridReady(params) {
    this.gridApi = params.api;
  }

  updateRowData(params) {
    this.gridApi = params.api;
  }

}
