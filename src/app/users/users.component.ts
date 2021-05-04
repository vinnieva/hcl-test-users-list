import { User } from './../shared/models/user.model';
import { Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { FilterOption } from './filter-option.interface';
import { UsersService } from '../shared/services/users/users.service';
import { FormBuilder, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, tap, map } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  users$: Observable<User[]>;
  users2$: Observable<User[]>;
  public searchControl: FormControl;
  public columnNameControl: FormControl;

  options: FilterOption[] = [
    {
      value: 'name',
      text: 'Name',
    },
    {
      value: 'username',
      text: 'User Name',
    },
    {
      value: 'email',
      text: 'Email',
    },
    {
      value: 'phone',
      text: 'Phone',
    },
    {
      value: 'website',
      text: 'Website',
    },
  ];

  constructor(
    private usersService: UsersService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.users$ = this.usersService.getUsers();
    this.searchControl = this.formBuilder.control('');
    this.columnNameControl = this.formBuilder.control('name');

    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(
          (searchString: string) =>
            (this.users$ = this.usersService
              .getUsers()
              .pipe(
                map((results) =>
                  results.filter((row: User) =>
                    row[this.columnNameControl.value]
                      .toLowerCase()
                      .includes(searchString.toLowerCase())
                  )
                )
              ))
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }

  userById(index: number, user: User): number {
    return user.id;
  }
}
