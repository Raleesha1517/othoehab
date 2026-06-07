import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { Auth } from '../../../core/services/auth';
import Swal from 'sweetalert2';
import { RequestTracker } from '../../../core/services/request-tracker';

@Component({
  selector: 'app-patient-request',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './patient-request.html',
  styleUrl: './patient-request.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientRequest implements OnInit {
  requestForm!: FormGroup;
  myRequests: any[] = [];
  isLoading = false;
  patientId!: number;

  currentLang: 'en' | 'si' | 'ta' = 'en';

  translations: Record<string, Record<'en' | 'si' | 'ta', string>> = {
    panelTitle: {
      en: 'My Medical Requests',
      si: 'මගේ වෛද්‍ය ඉල්ලීම්',
      ta: 'எனது மருத்துவ கோரிக்கைகள்'
    },
    panelSubtitle: {
      en: 'Ask for medical leave, letters, or reports and check their status.',
      si: 'වෛද්‍ය නිවාඩු, ලිපි හෝ වාර්තා ඉල්ලා ඒවායේ තත්ත්වය මෙතැනින් පරීක්ෂා කරන්න.',
      ta: 'மருத்துவ விடுப்பு, கடிதங்கள் அல்லது அறிக்கைகளைக் கேட்டு அவற்றின் நிலையைச் சரிபார்க்கவும்.'
    },
    cardNewRequest: {
      en: 'New Request',
      si: 'නව ඉල්ලීමක් කරන්න',
      ta: 'புதிய கோரிக்கை'
    },
    labelCategory: {
      en: 'Select Category *',
      si: 'වර්ගය තෝරන්න *',
      ta: 'வகையைத் தேர்ந்தெடுக்கவும் *'
    },
    selectPlaceholder: {
      en: 'Choose what you need...',
      si: 'ඔබට අවශ්‍ය දේ තෝරන්න...',
      ta: 'உங்களுக்குத் தேவையானதைத் தேர்ந்தெடுக்கவும்...'
    },
    labelOtherCategory: {
      en: 'Please specify your request category *',
      si: 'කරුණාකර ඔබගේ ඉල්ලීම් වර්ගය සඳහන් කරන්න *',
      ta: 'உங்கள் கோரிக்கை வகையைக் குறிப்பிடவும் *'
    },
    placeholderOtherCategory: {
      en: 'Type your custom category here...',
      si: 'ඔබට අවශ්‍ය වර්ගය මෙතැන ලියන්න...',
      ta: 'உங்கள் தனிப்பயன் வகையை இங்கே தட்டச்சு செய்யவும்...'
    },
    labelDescription: {
      en: 'Reason / Description *',
      si: 'හේතුව හෝ විස්තරය *',
      ta: 'காரணம் / விவரம் *'
    },
    placeholderTextarea: {
      en: 'Type details here (dates, reason)...',
      si: 'විස්තර මෙතැන ලියන්න (දින වකවානු, හේතුව)...',
      ta: 'விவரங்களை இங்கே தட்டச்சு செய்யவும் (தேதிகள், காரணம்)...'
    },
    btnSubmit: {
      en: 'Submit Request',
      si: 'ඉල්ලීම ඉදිරිපත් කරන්න',
      ta: 'கோரிக்கையை சமர்ப்பிக்கவும்'
    },
    cardHistory: {
      en: 'My Request History',
      si: 'මගේ ඉල්ලීම් ඉතිහාසය',
      ta: 'எனது கோரிக்கை வரலாறு'
    },
    loadingText: {
      en: 'Loading history...',
      si: 'දත්ත ලෝඩ් වෙමින් පවතී...',
      ta: 'தரவு ஏற்றப்படுகிறது...'
    },
    emptyState: {
      en: 'No requests found.',
      si: 'කිසිදු ඉල්ලීමක් හමු නොවීය.',
      ta: 'கோரிக்கைகள் எதுவும் இல்லை.'
    },
    thCategory: { en: 'Category', si: 'වර්ගය', ta: 'வகை' },
    thDescription: { en: 'Description', si: 'විස්තරය', ta: 'விவரம்' },
    thStatus: { en: 'Status', si: 'තත්ත්වය', ta: 'நிலை' },
    thReply: { en: 'Doctor\'s Reply', si: 'වෛද්‍යවරයාගේ පිළිතුර', ta: 'மருத்துவரின் பதில்' },
    awaitingReply: {
      en: 'Awaiting doctor\'s review...',
      si: 'වෛද්‍යවරයාගේ පරීක්ෂාව සඳහා රැඳී පවතී...',
      ta: 'மருத்துவரின் பதிலுக்காக காத்திருக்கிறது...'
    }
  };

  categories = [
    { value: 'Medical Leave', en: 'Medical Leave', si: 'වෛද්‍ය නිවාඩු (Medical Leave)', ta: 'மருத்துவ விடுப்பு' },
    { value: 'Medical Letters', en: 'Medical Letters', si: 'වෛද්‍ය ලිපි (Medical Letters)', ta: 'மருத்துவ கடிதங்கள்' },
    { value: 'Ultrasound Report', en: 'Ultrasound Report', si: 'අල්ට්‍රාසවුන්ඩ් වාර්තා (Ultrasound Report)', ta: 'அல்ட்ராசவுண்ட் அறிக்கை' },
    { value: 'Report to Physiotherapy', en: 'Report to Physiotherapy', si: 'භෞතචිකිත්සක වාර්තා (Physiotherapy Report)', ta: 'உடற்பயிற்சி சிகிச்சை அறிக்கை' },
    { value: 'Assessment Form', en: 'Assessment Form', si: 'ඇගයීම් පෝරමය (Assessment Form)', ta: 'மதிப்பீட்டு படிவம்' },
    { value: 'Treatment Plan', en: 'Treatment Plan', si: 'ප්‍රතිකාර සැලැස්ම (Treatment Plan)', ta: 'சிகிச்சை திட்டம்' },
    { value: 'Progress Notes', en: 'Progress Notes', si: 'ප්‍රගති සටහන් (Progress Notes)', ta: 'முன்னேற்றக் குறிப்புகள்' },
    { value: 'Lab Results', en: 'Lab Results', si: 'ලැබ් වාර්තා (Lab Results)', ta: 'ஆய்வக முடிவுகள்' },
    { value: 'Imaging Report', en: 'Imaging Report', si: 'ස්කෑන්/එක්ස්-රේ වාර්තා (Imaging Report)', ta: 'இமேஜிங் அறிக்கை' },
    { value: 'Other', en: 'Other (Specify below)', si: 'වෙනත් (පහත සඳහන් කරන්න)', ta: 'மற்றவை (கீழே குறிப்பிடவும்)' }
  ];

  constructor(
    private fb: FormBuilder,
    private requestService: RequestTracker,
    private authService: Auth,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.patientId = Number(this.authService.getPatientId());
    
    this.requestForm = this.fb.group({
      title: ['', Validators.required],
      otherTitle: [''],
      description: ['', Validators.required] 
    });

    this.requestForm.get('title')?.valueChanges.subscribe((value) => {
      const otherControl = this.requestForm.get('otherTitle');
      if (value === 'Other') {
        otherControl?.setValidators([Validators.required]);
      } else {
        otherControl?.clearValidators();
        otherControl?.setValue('');
      }
      otherControl?.updateValueAndValidity();
      
      // 🌟 Mark for check tells the template engine to flag validation UI layout updates immediately
      this.cdr.markForCheck();
    });

    this.loadMyRequests();
  }

  setLanguage(lang: 'en' | 'si' | 'ta'): void {
    this.currentLang = lang;
    this.cdr.markForCheck();
  }

  loadMyRequests(): void {
    if (!this.patientId) return;
    this.isLoading = true;
    this.cdr.markForCheck();

    this.requestService.getRequestsByPatient(this.patientId).subscribe({
      next: (data) => {
        // 🌟 Fix: Construct a brand new reference array wrapper just like the Document Component layout strategy
        this.myRequests = data ? [...data] : [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onSubmitRequest(): void {
    if (this.requestForm.invalid) return;

    const selectedTitle = this.requestForm.value.title;
    const finalTitle = selectedTitle === 'Other' ? this.requestForm.value.otherTitle : selectedTitle;

    const payload = {
      patient_id: this.patientId,
      title: finalTitle,
      description: this.requestForm.value.description
    };

    this.requestService.createRequest(payload).subscribe({
      next: () => {
        const alertTitles = { en: 'Submitted!', si: 'ඉදිරිපත් කළා!', ta: 'சமர்ப்பிக்கப்பட்டது!' };
        const alertTexts = { en: 'Your request has been sent.', si: 'ඔබේ ඉල්ලීම සාර්ථකව යවන ලදී.', ta: 'உங்கள் கோரிக்கை அனுப்பப்பட்டது.' };
        
        Swal.fire({ 
          icon: 'success', 
          title: alertTitles[this.currentLang], 
          text: alertTexts[this.currentLang], 
          timer: 1800, 
          showConfirmButton: false 
        });

        this.requestForm.reset({ title: '', otherTitle: '', description: '' });
        
        // Reload history which now forces an instant UI refresh
        this.loadMyRequests();
      },
      error: () => {
        const errTexts = { en: 'Submission failed.', si: 'ඉදිරිපත් කිරීමට නොහැකි විය.', ta: 'சமர்ப்பிக்க முடியவில்லை.' };
        Swal.fire({ icon: 'error', title: 'Error', text: errTexts[this.currentLang] });
        this.cdr.markForCheck();
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'approved': return 'badge-approved';
      case 'not approved': return 'badge-rejected';
      default: return 'badge-pending';
    }
  }

  getTranslatedStatus(status: string): string {
    if (!status) return '';
    const s = status.toLowerCase();
    if (s === 'approved') return this.currentLang === 'si' ? 'අනුමතයි' : this.currentLang === 'ta' ? 'அங்கீகரிக்கப்பட்டது' : 'APPROVED';
    if (s === 'not approved') return this.currentLang === 'si' ? 'ප්‍රතික්ෂේපිතයි' : this.currentLang === 'ta' ? 'நிராகரிக்கப்பட்டது' : 'NOT APPROVED';
    return this.currentLang === 'si' ? 'පෙන්නුම් කරයි' : this.currentLang === 'ta' ? 'நிலுவையில் உள்ளது' : 'PENDING';
  }
}