import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { Task } from './tasks.types';

@Injectable({
    providedIn: 'root'
})
export class TasksService {
    private _tasks = new BehaviorSubject<Task[]>([]);
    private _task = new BehaviorSubject<Task | null>(null);
    private apiUrl = 'http://localhost:5000/api/task';

    constructor(private _httpClient: HttpClient) {}

    get tasks$(): Observable<Task[]> {
        return this._tasks.asObservable();
    }

    get task$(): Observable<Task | null> {
        return this._task.asObservable();
    }

    getTasks(): void {
        this._httpClient.get<Task[]>(this.apiUrl).subscribe((tasks) => {
            this._tasks.next(tasks);
        });
    }

    getTaskById(id: string | null): Observable<Task> {
        if (!id) {
            return throwError(() => new Error('ID inválido'));
        }
    
        return this._httpClient.get<Task>(`${this.apiUrl}/${id}`);
    }
    

    createTask(title: string, description: string, imagePath: string): Observable<Task> {
        return this._httpClient.post<Task>(this.apiUrl, {
            title,
            description,
            imagePath,
            status: 'Pendente'
        });
    }

    updateTask(id: string, task: Task): Observable<Task> {
        return this._httpClient.put<Task>(`${this.apiUrl}/${id}`, task);
    }

    deleteTask(id: string): Observable<void> {
        return this._httpClient.delete<void>(`${this.apiUrl}/${id}`);
    }

    updateTasksOrders(tasks: Task[]): Observable<void> {
        const updatedTasks = tasks.map((task, index) => ({
            ...task,
            order: index
        }));
    
        return this._httpClient.put<void>(`${this.apiUrl}/update-order`, updatedTasks);
    }

    uploadImage(file: FormData): Observable<any> {
        return this._httpClient.post<any>(`${this.apiUrl}/upload-image`, file);
    }
    
    
}
