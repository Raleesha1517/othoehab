import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import Swal from 'sweetalert2';

type LanguageKey = 'en' | 'si' | 'ta';

@Component({
  selector: 'app-logging',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './logging.html',
  styleUrl: './logging.css',
})
export class Logging {
  loginForm: FormGroup;
  showPassword = false;
  currentLang: LanguageKey = 'en';

  // Translation Dictionaries for Dynamic Translation
  translations = {
    en: {
      securePortal: 'Secure Portal',
      title: 'System Authentication',
      subtitle: 'Sign in to access your health records and services.',
      identifierLabel: 'User Code, Name',
      identifierPlaceholder: 'Enter your code or name',
      passwordLabel: 'Security password',
      passwordPlaceholder: 'Enter your password',
      submitBtn: 'Sign In',
      successTitle: 'Login successful',
      successWelcome: 'Welcome back',
      failTitle: 'Login failed'
    },
    si: {
      securePortal: 'ආරක්ෂිත පද්ධතිය',
      title: 'පද්ධති සත්‍යාපනය',
      subtitle: 'ඔබගේ සෞඛ්‍ය වාර්තා සහ සේවාවන් වෙත පිවිසීමට ලොග් වන්න.',
      identifierLabel: 'පරිශීලක කේතය, නම',
      identifierPlaceholder: 'ඔබගේ කේතය හෝ නම ඇතුලත් කරන්න',
      passwordLabel: 'මුරපදය',
      passwordPlaceholder: 'ඔබගේ මුරපදය ඇතුලත් කරන්න',
      submitBtn: 'ඇතුළු වන්න',
      successTitle: 'ඇතුළු වීම සාර්ථකයි',
      successWelcome: 'නැවතත් සාදරයෙන් පිළිගනිමු',
      failTitle: 'ඇතුළු වීම අසාර්ථකයි'
    },
    ta: {
      securePortal: 'பாதுகாப்பான',
      title: 'அமைப்பு அங்கீகாரம்',
      subtitle: 'உங்கள் சுகாதார பதிவுகள் மற்றும் சேவைகளை அணுக உள்நுழைக.',
      identifierLabel: 'பயனர் குறியீடு, நோயாளி குறியீடு, பெயர் அல்லது மின்னஞ்சல்',
      identifierPlaceholder: 'உங்கள் குறியீடு, பெயர் அல்லது மின்னஞ்சலை உள்ளிடவும்',
      passwordLabel: 'கடவுச்சொல்',
      passwordPlaceholder: 'உங்கள் கடவுச்சொல்லை உள்ளிடவும்',
      submitBtn: 'உள்நுழைக',
      successTitle: 'உள்நுழைவு வெற்றி பெற்றது',
      successWelcome: 'நல்வரவு',
      failTitle: 'உள்நுழைவு தோல்வியடைந்தது'
    }
  };

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      login_identifier: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  setLanguage(lang: LanguageKey): void {
    this.currentLang = lang;
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          localStorage.setItem('token', res.access_token);
          localStorage.setItem('user_role', res.role?.toLowerCase() ?? '');
          localStorage.setItem('user_name', res.name ?? '');
          localStorage.setItem('user_code', res.user_code ?? '');
          localStorage.setItem('user_type', res.type ?? 'user');
          
          if (res.patient_id) {
            localStorage.setItem('patient_id', res.patient_id);
          }

          Swal.fire({
            icon: 'success',
            title: this.translations[this.currentLang].successTitle,
            text: `${this.translations[this.currentLang].successWelcome}, ${res.name || 'user'}!`,
            timer: 1600,
            showConfirmButton: false
          }).then(() => {
            if (res.role === 'admin') {
              this.router.navigate(['/admin-dashboard']);
            } else if (res.role === 'doctor') {
              this.router.navigate(['/doctor-dashboard']);
            } else if (res.role === 'hr') {
              this.router.navigate(['/hr-dashboard']);
            } else if (res.role === 'patient') {
              this.router.navigate(['/patient-dashboard']);
            } else {
              this.router.navigate(['/']);
            }
          });
        },
        error: (err) => {
          const message = err?.error?.message || 'Authentication failed. Check login details.';
          Swal.fire({
            icon: 'error',
            title: this.translations[this.currentLang].failTitle,
            text: message
          });
        }
      });
    }
  }
}