import {
    CdkDrag,
    CdkDragDrop,
    CdkDragHandle,
    CdkDragPreview,
    CdkDropList,
    moveItemInArray,
} from '@angular/cdk/drag-drop';
import { DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
    ActivatedRoute,
    Router,
    RouterLink,
    RouterOutlet,
} from '@angular/router';
import { TasksService } from 'app/modules/admin/apps/tasks/tasks.service';
import { Task } from 'app/modules/admin/apps/tasks/tasks.types';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'tasks-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatSidenavModule,
        RouterOutlet,
        MatButtonModule,
        MatTooltipModule,
        MatIconModule,
        CdkDropList,
        CdkDrag,
        NgClass,
        CdkDragPreview,
        CdkDragHandle,
        RouterLink,
        TitleCasePipe,
        DatePipe,
    ],
})
export class TasksListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    drawerMode: 'side' | 'over';
    selectedTask: Task;
    tasks: Task[] = [];
    tasksCount = {
        completed: 0,
        incomplete: 0,
        total: 0,
    };
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _tasksService: TasksService
    ) { }

    ngOnInit(): void {
        this._tasksService.tasks$.pipe(takeUntil(this._unsubscribeAll)).subscribe((tasks: Task[]) => {
            this.tasks = tasks;
            this.tasksCount.total = tasks.length;
            this.tasksCount.completed = tasks.filter(t => t.status === 'Concluida').length;
            this.tasksCount.incomplete = this.tasksCount.total - this.tasksCount.completed;
            this._changeDetectorRef.markForCheck();
        });

        this._tasksService.getTasks();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    onBackdropClicked(): void {
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });
        this._changeDetectorRef.markForCheck();
    }

    createTask(): void {
        this.matDrawer.open();
        this._router.navigate(['new'], { relativeTo: this._activatedRoute });
        this._changeDetectorRef.markForCheck();
    }

    toggleStatus(task: Task): void {
        task.status = task.status === 'Concluida' ? 'Pendente' : 'Concluida';
        this._tasksService.updateTask(task.id, task).subscribe(() => {
            this._tasksService.getTasks();
            this._changeDetectorRef.markForCheck();
        });
    }

    deleteTask(task: Task): void {
        this._tasksService.deleteTask(task.id).subscribe(() => {
            this._tasksService.getTasks();
            this._changeDetectorRef.markForCheck();
        });
    }

    dropped(event: CdkDragDrop<Task[]>): void {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        this._tasksService.updateTasksOrders(event.container.data).subscribe();
        this._changeDetectorRef.markForCheck();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
