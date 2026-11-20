import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ChangePasswordRequest,
  CreateUserRequest,
  ForgotPasswordResponse,
  GetUserResponse,
  LoginUserRequest,
  MessageResponse,
  RegisterUserRequest,
  UpdateUserRequest,
} from '../interfaces/user-dtos';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private http = inject(HttpClient);
  private endPoint = environment.apiUrl + '/user';

  getAll(): Observable<GetUserResponse[]> {
    return this.http.get<GetUserResponse[]>(`${this.endPoint}/getall`);
  }

  getById(id: number): Observable<GetUserResponse> {
    return this.http.get<GetUserResponse>(`${this.endPoint}/${id}`);
  }

  register(req: RegisterUserRequest): Observable<GetUserResponse> {
    return this.http.post<GetUserResponse>(`${this.endPoint}/register`, req);
  }

  login(req: LoginUserRequest): Observable<GetUserResponse> {
    return this.http.post<GetUserResponse>(`${this.endPoint}/login`, req);
  }

  forgotPassword(email: string): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(`${this.endPoint}/forgot-password`, { email });
  }

  changePassword(req: ChangePasswordRequest): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${this.endPoint}/change-password`, req);
  }

  create(req: CreateUserRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.endPoint}/create`, req);
  }

  update(req: UpdateUserRequest): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${this.endPoint}/update`, req);
  }

  delete(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.endPoint}/${id}`);
  }
}