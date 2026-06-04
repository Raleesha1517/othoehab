import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Patient } from '../../../core/services/patient';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-patient',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-patient.html',
  styleUrl: './add-patient.css',
})
export class AddPatient implements OnInit {
  patientForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private patientService: Patient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const generatedPassword = this.generateSixCharacterPassword();

    this.patientForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      category: ['Surgery', [Validators.required]],
      other_category_detail: [''],
      age: [null, [Validators.min(0), Validators.max(125)]],
      phone: [''],
      nic_number: [''],
      email: ['', [Validators.email]],
      patient_password: [generatedPassword, [Validators.required]],
      red_flags: [''],
      description: ['']
    });

    // Dynamic validation subscription matching category classification constraints
    this.patientForm.get('category')?.valueChanges.subscribe(value => {
      const otherControl = this.patientForm.get('other_category_detail');
      if (value === 'Other') {
        otherControl?.setValidators([Validators.required]);
      } else {
        otherControl?.clearValidators();
        otherControl?.setValue('');
      }
      otherControl?.updateValueAndValidity();
    });
  }

  // Secure random alphanumerical string tracking asset builder logic
  generateSixCharacterPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pass = '';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  }

  // Trigger submission to endpoint
  submitPatientForm(): void {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    const payload = this.patientForm.value;

    this.patientService.createPatient(payload).subscribe({
      next: (response: { patient_code: any; }) => {
        const patientName = payload.name;
        const patientCode = response.patient_code;
        const password = payload.patient_password;
        const loginUrl = window.location.origin;

        // Structured message with explicit entry instructions
        const shareableMessage = 
`Hello ${patientName},

Please use the following Code and Password to enter the system and access your exercises, medical letters, or medical records.

Website: ${loginUrl}
User Code: ${patientCode}
Password: ${password}

ආයුබෝවන් ${patientName},

පද්ධතියට ඇතුළු වීමට සහ ඔබේ ව්‍යායාම, වෛද්‍ය ලිපි හෝ වෛද්‍ය වාර්තා ලබා ගැනීමට කරුණාකර පහත කේතය සහ මුරපදය භාවිතා කරන්න.

වෙබ් අඩවිය: ${loginUrl}
පරිශීලක කේතය: ${patientCode}
මුරපදය: ${password}

வணக்கம் ${patientName},

உங்கள் பயிற்சிகள், மருத்துவக் கடிதங்கள் அல்லது மருத்துவப் பதிவுகளை அணுகவும் முறைமையில் நுழையவும் பின்வரும் குறியீடு மற்றும் கடவுச்சொல்லைப் பயன்படுத்தவும்.

இணையதளம்: ${loginUrl}
பயனர் குறியீடு: ${patientCode}
கடவுச்சொல்: ${password}`;

        Swal.fire({
          title: '<strong style="color: #005f73;">Registration Complete</strong>',
          icon: 'success',
          html: `
            <p style="color: #64748b; font-size: 0.95rem; margin-bottom: 1rem;">Profile created for <b>${patientName}</b></p>
            
            <div style="background-color: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 8px; padding: 1.25rem; margin-bottom: 1.5rem; text-align: left;">
              <div style="margin-bottom: 0.75rem;">
                <span style="display: block; font-size: 0.7rem; color: #0d9488; font-weight: 800; text-transform: uppercase;">Unique Patient Access Code</span>
                <strong style="font-family: 'Courier New', monospace; font-size: 1.25rem; color: #0f172a;">${patientCode}</strong>
              </div>
              <div>
                <span style="display: block; font-size: 0.7rem; color: #0d9488; font-weight: 800; text-transform: uppercase;">System Entry Password</span>
                <strong style="font-family: 'Courier New', monospace; font-size: 1.25rem; color: #0f172a;">${password}</strong>
              </div>
            </div>

            <!-- Beautifully Styled Copy Button -->
            <button id="copyMsgBtn" style="
              width: 100%; 
              background: linear-gradient(135deg, #005f73 0%, #0a9396 100%);
              color: white; 
              border: none; 
              padding: 14px; 
              border-radius: 10px; 
              font-weight: 600; 
              font-size: 0.9rem; 
              cursor: pointer; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              gap: 10px;
              box-shadow: 0 4px 15px rgba(0, 95, 115, 0.2);
              transition: transform 0.2s, box-shadow 0.2s;
              margin-bottom: 1rem;
            ">
              <span>Copy Full Trilingual Instructions</span>
            </button>

            <div style="font-size: 0.75rem; color: #94a3b8; line-height: 1.4; border-top: 1px solid #f1f5f9; pt: 1rem;">
              Click the button above to copy the login details to send via WhatsApp or SMS.
            </div>
          `,
          confirmButtonText: 'Finish Registration',
          confirmButtonColor: '#005f73',
          allowOutsideClick: false,
          didOpen: () => {
            const btn = document.getElementById('copyMsgBtn');
            btn?.addEventListener('click', () => {
              navigator.clipboard.writeText(shareableMessage).then(() => {
                const originalContent = btn.innerHTML;
                btn.style.background = '#16a34a';
                btn.innerHTML = '<span>✅ Copied Successfully</span>';
                setTimeout(() => {
                  btn.style.background = 'linear-gradient(135deg, #005f73 0%, #0a9396 100%)';
                  btn.innerHTML = originalContent;
                }, 2500);
              });
            });
          }
        }).then(() => {
          this.router.navigate(['/doctor-dashboard']);
        });
      },
      error: (err) => {
        Swal.fire({
          title: 'System Error',
          text: err.error?.message || 'Could not commit profile to database.',
          icon: 'error',
          confirmButtonColor: '#005f73'
        });
      }
    });
  }
  cancelCreation(): void {
    this.router.navigate(['/doctor-dashboard']);
  }
}
