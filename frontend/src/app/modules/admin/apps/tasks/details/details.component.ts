import { TextFieldModule } from '@angular/cdk/text-field';
import { DatePipe, NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TasksListComponent } from 'app/modules/admin/apps/tasks/list/list.component';
import { TasksService } from 'app/modules/admin/apps/tasks/tasks.service';
import { Task } from 'app/modules/admin/apps/tasks/tasks.types';
import { assign } from 'lodash-es';
import { Subject, debounceTime, takeUntil, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
    selector: 'tasks-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        RouterLink,
        MatDividerModule,
        MatFormFieldModule,
        MatInputModule,
        TextFieldModule,
        MatRippleModule,
        MatCheckboxModule,
        NgClass,
        DatePipe,
    ],
})
export class TasksDetailsComponent implements OnInit, OnDestroy {
    @ViewChild('titleField') private _titleField: ElementRef;

    task: Task;
    taskForm: UntypedFormGroup;
    tasks: Task[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    isNew: boolean = true;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _tasksListComponent: TasksListComponent,
        private _tasksService: TasksService,
        private _snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this._tasksListComponent.matDrawer.open();

        this.taskForm = this._formBuilder.group({
            id: [''],
            title: [''],
            description: [''],
            status: ['Pendente'],
            imagePath: [''],
        });

        this._tasksService.tasks$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tasks: Task[]) => {
                this.tasks = tasks;
                this._changeDetectorRef.markForCheck();
            });

        this._activatedRoute.paramMap
            .pipe(
                takeUntil(this._unsubscribeAll)
            )
            .subscribe((params) => {
                const id = params.get('id');
                if (id === 'new') {
                    this.isNew = true;
                    this.task = {
                        id: null,
                        title: '',
                        description: '',
                        status: 'Pendente',
                        imagePath: ''
                    };
                    this.taskForm.reset(this.task, { emitEvent: false });
                } else if (id) {
                    this.isNew = false;

                    this._tasksService.getTaskById(id).subscribe((task) => {
                        this.task = task;
                        this.taskForm.patchValue(task, { emitEvent: true });
                    });
                }
                console.log('sadsad');
                console.log(this.taskForm);
                this._changeDetectorRef.markForCheck();

            });

        this.taskForm.valueChanges
            .subscribe((value) => {
                this._changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._tasksListComponent.matDrawer.close();
    }

    deleteTask(): void {
        const id = this.task.id;
        const currentTaskIndex = this.tasks.findIndex((item) => item.id === id);
        const nextTaskIndex =
            currentTaskIndex + (currentTaskIndex === this.tasks.length - 1 ? -1 : 1);
        const nextTaskId =
            this.tasks.length === 1 && this.tasks[0].id === id
                ? null
                : this.tasks[nextTaskIndex].id;

        this._tasksService.deleteTask(id).subscribe(() => {
            if (nextTaskId) {
                this._router.navigate(['../', nextTaskId], {
                    relativeTo: this._activatedRoute,
                });
            } else {
                this._router.navigate(['../'], {
                    relativeTo: this._activatedRoute,
                });
            }
        });

        if (this.task.imagePath) {
            URL.revokeObjectURL(this.task.imagePath);
        }

        this._changeDetectorRef.markForCheck();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    toggleStatus(): void {
        const updatedStatus = this.taskForm.get('status')?.value === 'Concluida' ? 'Pendente' : 'Concluida';
        this.taskForm.patchValue({ status: updatedStatus });

        if (!this.isNew) {
            const updatedTask = { ...this.task, status: updatedStatus };
            this._tasksService.updateTask(this.task.id, updatedTask).subscribe(() => {
                this._tasksService.getTasks();
                this._changeDetectorRef.markForCheck();
            });
        }
    }

    onFileSelected(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = (reader.result as string).split(',')[1];
                this.taskForm.patchValue({ imagePath: base64String });
            };
            reader.readAsDataURL(file);
        }
    }


    saveTask(): void {
        if (this.taskForm.valid) {
            if (!this.isNew) {
                this._tasksService.updateTask(this.task.id, this.taskForm.value).subscribe(() => {
                    this._showMessage('Tarefa atualizada com sucesso!');
                    this._tasksService.getTasks();
                    this._changeDetectorRef.markForCheck();
                });
            } else {
                this._tasksService.createTask(
                    this.taskForm.value.title,
                    this.taskForm.value.description,
                    this.taskForm.value.imagePath
                ).subscribe(() => {
                    this._tasksService.getTasks();
                    this._router.navigate(['../'], { relativeTo: this._activatedRoute });
                    this._showMessage('Tarefa criada com sucesso!');
                });
            }
        }
    }

    private _showMessage(message: string): void {
        this._snackBar.open(message, 'Fechar', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
        });
    }

}
