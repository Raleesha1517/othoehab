import { Routes } from '@angular/router';
import { Logging } from './components/authentication/logging/logging';
import { Register } from './components/authentication/register/register';
import { AdminHome } from './components/admin/admin-home/admin-home';
import { PatientHome } from './components/patients/patient-home/patient-home';
import { roleGuard } from './core/guards/role-guard';
import { DoctorHome } from './components/doctor/doctor-home/doctor-home';
import { AddPatient } from './components/doctor/add-patient/add-patient';
import { ViewPatient } from './components/doctor/view-patient/view-patient';
import { Exercises } from './components/doctor/exercises/exercises';
import { AllocateTemplate } from './components/doctor/allocate-template/allocate-template';
import { AllocateExercise } from './components/doctor/allocate-exercieses/allocate-exercieses';
import { DoctorTemplate } from './components/doctor/doctor-template/doctor-template';
import { AllocateDocuments } from './components/doctor/allocate-documents/allocate-documents';
import { guestGuard } from './core/guards/guest-guard';
import { PatientMassage } from './components/patients/patient-massage/patient-massage';

export const routes: Routes = [
  { path: '', component: Logging, canActivate: [guestGuard] },
  { path: 'register', component: Register },
  { path: 'admin-dashboard', component: AdminHome, canActivate: [roleGuard], data: { roles: ['admin'] } },
  { path: 'doctor-dashboard', component: DoctorHome  , canActivate: [roleGuard], data: { roles: ['doctor'] } },
  { path: 'add-patient', component: AddPatient, canActivate: [roleGuard], data: { roles: ['doctor'] } },
  { path: 'view-patient/:id', component: ViewPatient, canActivate: [roleGuard], data: { roles: ['doctor'] } },
  { path: 'exercises', component: Exercises, canActivate: [roleGuard], data: { roles: ['doctor'] } },
  { path: 'doctor-template', component: DoctorTemplate, canActivate: [roleGuard], data: { roles: ['doctor'] } },
  { path: 'allocate-template/:patientId', component: AllocateTemplate, canActivate: [roleGuard], data: { roles: ['doctor'] } },
  { path: 'allocate-exercise/:patientId', component: AllocateExercise, canActivate: [roleGuard], data: { roles: ['doctor'] } },
  { path: 'allocate-documents/:patientId', component: AllocateDocuments, canActivate: [roleGuard], data: { roles: ['doctor'] } },
  { path: 'patient-dashboard', component: PatientHome, canActivate: [roleGuard], data: { roles: ['patient'] } },
   { path: 'patient-massage', component: PatientMassage, canActivate: [roleGuard], data: { roles: ['patient'] } },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
