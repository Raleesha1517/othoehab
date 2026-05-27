import { Routes } from '@angular/router';
import { Logging } from './components/authentication/logging/logging';
import { Register } from './components/authentication/register/register';
import { AdminHome } from './components/admin/admin-home/admin-home';
import { DoctorHome } from './components/doctor/doctor-home/doctor-home';
import { HrHome } from './components/hr_management/hr-home/hr-home';
import { PatientHome } from './components/patients/patient-home/patient-home';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  { path: '', component: Logging },
  { path: 'register', component: Register },
  { path: 'admin-dashboard', component: AdminHome, canActivate: [roleGuard], data: { roles: ['admin'] } },
  { path: 'doctor-dashboard', component: DoctorHome, canActivate: [roleGuard], data: { roles: ['doctor'] } },
  { path: 'hr-dashboard', component: HrHome, canActivate: [roleGuard], data: { roles: ['hr'] } },
  { path: 'patient-dashboard', component: PatientHome, canActivate: [roleGuard], data: { roles: ['patient'] } },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
