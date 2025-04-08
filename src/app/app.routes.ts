import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AddAppointmentComponent } from './components/add-appointment/add-appointment.component';
import { EditAppointmentComponent } from './components/edit-appointment/edit-appointment.component';
import { ViewAppointmentComponent } from './components/view-appointment/view-appointment.component';
import { ListAppointmentsComponent } from './components/list-appointments/list-appointments.component';
import { AuthGuard } from './guards/auth.guard'; // <-- Import the AuthGuard

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'add-appointment', component: AddAppointmentComponent, canActivate: [AuthGuard] }, 
  { path: 'edit-appointment/:id', component: EditAppointmentComponent, canActivate: [AuthGuard] }, 
  { path: 'view-appointment/:id', component: ViewAppointmentComponent, canActivate: [AuthGuard] }, 
  { path: 'list-appointments', component: ListAppointmentsComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
