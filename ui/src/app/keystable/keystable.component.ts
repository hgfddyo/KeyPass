import { Component, OnInit, ViewChild, TemplateRef, Inject, Input, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Account } from '../account'
import { KeyringService } from '../keyring.service'
import {v4 as uuidv4} from 'uuid';
import { min } from 'rxjs/operators';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms'
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';


@Component({
  selector: 'app-keystable',
  templateUrl: './keystable.component.html',
  styleUrls: ['./keystable.component.css']
})
export class KeystableComponent implements OnInit {

  displayedColumns: string[] = ['context', 'login', 'password', 'show', 'edit', 'delete'];
  dataSource:any
  check:boolean

  @ViewChild(MatPaginator) paginator: MatPaginator;

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  constructor(private keyringService : KeyringService) {
    this.check = false
    this.keyringService.getKeyRing().subscribe(result =>{
      this.dataSource = new MatTableDataSource(result);
      this.dataSource.paginator = this.paginator;
      this.dataSource.filterPredicate = function(data: any, filterValue: string) {
        return data.context.trim().toLocaleLowerCase().indexOf(filterValue.trim().toLocaleLowerCase()) >= 0 ||
        data.login.trim().toLocaleLowerCase().indexOf(filterValue.trim().toLocaleLowerCase()) >= 0;
      };
      
    })
    
  }

  show(element){
    this.check = true
  }

  ngOnInit(): void {

  }

}
