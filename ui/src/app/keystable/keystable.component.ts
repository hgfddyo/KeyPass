import { Component, OnInit, ViewChild, TemplateRef, Inject, Input, AfterViewInit, QueryList, ViewChildren } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Account } from '../account'
import { KeyringService } from '../keyring.service'
import {v4 as uuidv4} from 'uuid';
import { min } from 'rxjs/operators';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms'
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatInput} from '@angular/material/input'
import {MatCheckbox} from '@angular/material/checkbox'
import { MatButton } from '@angular/material/button';


@Component({
  selector: 'app-keystable',
  templateUrl: './keystable.component.html',
  styleUrls: ['./keystable.component.css']
})
export class KeystableComponent implements OnInit {

  displayedColumns: string[] = ['context', 'login', 'password', 'show', 'edit', 'delete'];
  dataSource:any
  

  @ViewChildren(MatInput) matInputs: QueryList<MatInput>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  constructor(private keyringService : KeyringService, private router: Router) {
    this.keyringService.getKeyRing().subscribe(result =>{
      //this.dataSource = new MatTableDataSource(result);
      this.dataSource.paginator = this.paginator;
      this.dataSource.filterPredicate = function(data: any, filterValue: string) {
        return data.context.trim().toLocaleLowerCase().indexOf(filterValue.trim().toLocaleLowerCase()) >= 0 ||
        data.login.trim().toLocaleLowerCase().indexOf(filterValue.trim().toLocaleLowerCase()) >= 0;
      };
    }) 
  }

  show(element){
    let editIcons =[].filter.call(document.getElementsByTagName('mat-icon'), 
      el => el.id == element.context + element.login)
    const input = this.matInputs.find(
      matInput => matInput.id === element.context + element.login
    );
    if(input.type === 'text'){
      input.type = 'password'
      editIcons[0].innerText='visibility'
    } else{
        input.type = 'text'
        editIcons[0].innerText='visibility_off'   
    }
    
  }

  deleteLogin(element){
    this.keyringService.deleteKey({
      login: element.login,
      context: element.context,
      password: element.password
    })
    setTimeout(() => {
      this.keyringService.getKeyRing().subscribe(result =>{
        this.dataSource.data = result
    })
    },100)
  }

  goToUpdate(element){
    this.keyringService.setUpdatedKey(element)
    this.router.navigate(['/Updatekey'])
  }

  ngOnInit(): void {

  }

}
