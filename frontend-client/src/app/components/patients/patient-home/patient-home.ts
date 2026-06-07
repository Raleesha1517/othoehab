import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Auth } from '../../../core/services/auth';
import { Patient } from '../../../core/services/patient';
import { Exercise } from '../../../core/services/exercise';
import { PatientDocumentService } from '../../../core/services/patient-document';
import { FollowupService } from '../../../core/services/followup'; 
import { Contact } from '../../../core/services/contact'; // 🌟 Added Contact Service Import
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-patient-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-home.html',
  styleUrl: './patient-home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientHome implements OnInit {

  currentLang: 'en' | 'si' | 'ta' = 'en';

  ui = {
    en: {
      subtitle: 'Health Records & Information — Dr. Melanie Amarasooriya',
      exercises: 'Exercises',
      records: 'Health Records',
      letters: 'Medical Letters',
      age: 'Age',
      years: 'years',
      contact: 'Contact Number',
      category: 'Classification Category',
      insTitle: 'How to access your resources:',
      insBody: 'Use your exercises by clicking directly on them in the exercise section. For your health records or official letters, click the download or view buttons.',
      files: 'files',
      noExercises: 'No exercises allocated yet.',
      download: 'Download Record',
      view: 'View Document',
      viewClick: 'Click here to view', 
      loading: 'Fetching your health profile...',
      nextFollowup: 'Next Follow-up:', 
      noFollowup: 'No upcoming follow-up scheduled',
      // 🌟 Contact Modal Translations (English)
      contactInfoBtn: 'Help & Contact',
      contactModalTitle: 'Clinic Contact Directory',
      emergencyText: 'In case of an emergency or any doubt, please use this number to contact us immediately:',
      requestText: 'If you wish to request any official medical letters or additional exercises, please click the button below:',
      clickHereLink: 'Submit Request Here'
    },
    si: {
      subtitle: 'සෞඛ්‍ය වාර්තා සහ තොරතුරු — වෛද්‍ය මෙලනි අමරසූරිය',
      exercises: 'අභ්‍යාස',
      records: 'සෞඛ්‍ය වාර්තා',
      letters: 'වෛද්‍ය ලිපි',
      age: 'වයස',
      years: 'වසර',
      contact: 'දුරකථන අංකය',
      category: 'වර්ගීකරණය',
      insTitle: 'ඔබේ තොරතුරු ලබාගන්නා ආකාරය:',
      insBody: 'අභ්‍යාස මත ක්ලික් කිරීමෙන් ඒවා නැරඹිය හැක. සෞඛ්‍ය වාර්තා හෝ ලිපි සඳහා "Download" හෝ "View" බොත්තම භාවිතා කරන්න.',
      files: 'ගොනු',
      noExercises: 'තවම අභ්‍යාස ඇතුළත් කර නොමැත.',
      download: 'බාගත කරන්න',
      view: 'නරඹන්න',
      viewClick: 'නැරඹීමට මෙතන ක්ලික් කරන්න',
      loading: 'දත්ත ලබාගනිමින් පවතී...',
      nextFollowup: 'ඊළඟ හමුවීම:', 
      noFollowup: 'මීළඟ හමුවීමක් තවම වෙන්කර නොමැත',
      // 🌟 Contact Modal Translations (Sinhala)
      contactInfoBtn: 'උදව් සහ සම්බන්ධතා',
      contactModalTitle: 'සායනික සම්බන්ධතා තොරතුරු',
      emergencyText: 'හදිසි අවස්ථාවකදී හෝ කිසියම් ගැටළුවක් ඇත්නම්, කරුණාකර අපව සම්බන්ධ කර ගැනීමට මෙම අංකය භාවිතා කරන්න:',
      requestText: 'ඔබට වෛද්‍ය ලිපි හෝ අමතර අභ්‍යාස ලබා ගැනීමට අවශ්‍ය නම්, කරුණාකර පහත බොත්තම ක්ලික් කරන්න:',
      clickHereLink: 'මෙහි ක්ලික් කරන්න'
    },
    ta: {
      subtitle: 'சுகாதார பதிவுகள் மற்றும் தகவல்கள் — டாக்டர் மெலனி அமரசூரிய',
      exercises: 'உடற்பயிற்சிகள்',
      records: 'சுகாதார பதிவுகள்',
      letters: 'மருத்துவ கடிதங்கள்',
      age: 'வயது',
      years: 'வயது',
      contact: 'தொடர்பு எண்',
      category: 'வகைப்பாடு',
      insTitle: 'பயன்படுத்துவது எப்படி:',
      insBody: 'பயிற்சிகளை நேரடியாக கிளிக் செய்வதன் மூலம் பயன்படுத்தலாம். பதிவுகள் அல்லது கடிதங்களுக்கு பதிவிறக்கம் அல்லது பார்வை பொத்தான்களை அழுத்தவும்.',
      files: 'கோப்புகள்',
      noExercises: 'பயிற்சிகள் இன்னும் ஒதுக்கப்படவில்லை.',
      download: 'பதிவிறக்கம்',
      view: 'பார்க்க',
      viewClick: 'பார்க்க இங்கே கிளிக் செய்யவும்',
      loading: 'தகவல்கள் பெறப்படுகின்றன...',
      nextFollowup: 'அடுத்த பரிசோதனை:', 
      noFollowup: 'அடுத்த பரிசோதனை தேதிகள் இன்னும் ஒதுக்கப்படவில்லை',
      // 🌟 Contact Modal Translations (Tamil)
      contactInfoBtn: 'உதவி & தொடர்பு',
      contactModalTitle: 'சிகிச்சை நிலைய தொடர்பு விபரங்கள்',
      emergencyText: 'அவசரகால நிலை அல்லது ஏதேனும் சந்தேகம் ஏற்படின், எங்களை உடனடியாக தொடர்பு கொள்ள இந்த எண்ணைப் பயன்படுத்தவும்:',
      requestText: 'நீங்கள் மருத்துவ கடிதங்கள் அல்லது கூடுதல் உடற்பயிற்சிகளை கோர விரும்பினால், கீழே உள்ள பொத்தானை கிளிக் செய்யவும்:',
      clickHereLink: 'இங்கே கிளிக் செய்யவும்'
    }
  };

  setLanguage(lang: 'en' | 'si' | 'ta') {
    this.currentLang = lang;
    this.cdr.markForCheck();
  }
  
  patientDetails: any = null;
  isLoading = true;
  resourcesLoading = true;

  exercises: any[] = [];
  medicalRecords: any[] = [];
  medicalLetters: any[] = [];
  closestFollowupDate: string | null = null;

  // 🌟 Added Contact Tracking Fields
  contactSettings: any = null;
  isContactVisible: boolean = false;

  showPdfModal = false;
  activePdfUrl: SafeResourceUrl | null = null;
  activePdfTitle = '';

  constructor(
    private authService: Auth,
    private patientService: Patient,
    private exerciseService: Exercise,
    private documentService: PatientDocumentService,
    private followupService: FollowupService,
    private contactService: Contact, // 🌟 Injected Contact Service Node
    private router: Router,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadPatientDashboardData();
  }

  loadPatientDashboardData(): void {
    const patientIdStr = this.authService.getPatientId();
    
    if (!patientIdStr) {
      console.error('No valid authenticated patient identifier located.');
      this.isLoading = false;
      this.resourcesLoading = false;
      this.patientDetails = null;
      this.cdr.markForCheck();
      return;
    }

    const patientId = parseInt(patientIdStr, 10);

    // 1. Fetch Basic Profile Metrics
    this.patientService.getPatientById(patientId).subscribe({
      next: (patient: any) => {
        this.patientDetails = patient || {};
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching patient profile metadata:', err);
        this.isLoading = false;
        this.patientDetails = {};
        this.cdr.markForCheck();
      }
    });

    // 🌟 2. Fetch Contact Profile Rules & Visibility Flags
    this.contactService.getContactSettings(patientId).subscribe({
      next: (settings: any) => {
        this.contactSettings = settings;
        // Strict evaluation matching truthy rules or structural integers (1/true)
        this.isContactVisible = !!(settings && (settings.is_visible === true || settings.is_visible === 1 || settings.is_visible === '1'));
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Could not load visible runtime fallback parameters:', err);
        this.isContactVisible = false;
        this.cdr.markForCheck();
      }
    });

    // 3. Fetch Follow-up Data
    this.followupService.getPatientFollowups(patientId).subscribe({
      next: (followups: any[]) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingDates = followups
          .map(f => f.next_followup_date)
          .filter(dateStr => dateStr && new Date(dateStr) >= today)
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

        if (upcomingDates.length > 0) {
          this.closestFollowupDate = upcomingDates[0];
        } else {
          this.closestFollowupDate = null;
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to parse followups collection details:', err);
        this.closestFollowupDate = null;
        this.cdr.markForCheck();
      }
    });

    // 4. Fetch Exercises
    this.exerciseService.getPatientExercises(patientId).subscribe({
      next: (data: any) => {
        const rawExercises = Array.isArray(data) ? data : Object.values(data || {});
        this.exercises = rawExercises.filter((exercise: any) => exercise && exercise.is_visible === true);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to pull assigned exercise datasets:', err);
        this.exercises = [];
        this.cdr.markForCheck();
      }
    });

    // 5. Fetch Documents
    this.documentService.getPatientDocuments(patientId).subscribe({
      next: (data: any[]) => {
        const collection = data || [];
        this.medicalRecords = collection.filter(doc => doc.category !== 'Template' && doc.isVisible === true);
        this.medicalLetters = collection.filter(doc => doc.category === 'Template' && doc.isVisible === true);
        this.resourcesLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed parsing documents payload array:', err);
        this.medicalRecords = [];
        this.medicalLetters = [];
        this.resourcesLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // 🌟 Open Interactive Multi-Language Alert Modal Message
  openContactDetailsAlert(): void {
  if (!this.contactSettings) return;

  const lang = this.ui[this.currentLang];
  
  // Extract the primary phone number safely or fall back to profile data
  const primaryPhone = this.contactSettings.telephones?.find((t: any) => t.is_primary)?.telephone_number 
                       || this.patientDetails?.phone 
                       || '---';

  Swal.fire({
    title: `<span style="font-size: 22px; color: #023e8a; font-weight:700;"><i class="ti ti-headset"></i> ${lang.contactModalTitle}</span>`,
    html: `
      <div style="text-align: left; font-family: inherit; color: #333; line-height: 1.5;">
        <div style="background: #fff3cd; border-left: 4px solid #ffb703; padding: 12px; margin-bottom: 18px; border-radius: 4px;">
          <p style="margin: 0; font-weight: 600; color: #664d03;">${lang.emergencyText}</p>
          <p style="margin: 8px 0 0 0; font-size: 20px; color: #d00000; font-weight: 700; letter-spacing: 0.5px;">
            <i class="ti ti-phone-call"></i> ${primaryPhone}
          </p>
        </div>
        <div style="margin-top: 10px; padding: 4px;">
          <p style="margin: 0 0 12px 0; color: #555;">${lang.requestText}</p>
          
          <button id="swal-nav-request-btn" type="button"
             style="display: inline-block; padding: 10px 16px; background: #0077b6; color: #fff; border: none; font-weight: 600; border-radius: 5px; width: 100%; text-align: center; box-sizing: border-box; cursor: pointer;">
             <i class="ti ti-forms"></i> ${lang.clickHereLink}
          </button>
        </div>
      </div>
    `,
    showConfirmButton: true,
    confirmButtonText: 'Close',
    confirmButtonColor: '#005f73',
    customClass: {
      popup: 'custom-swal-contact-popup'
    },
    // 🌟 Capture when the DOM rendering is complete inside the popup frame
    didOpen: () => {
      const navBtn = document.getElementById('swal-nav-request-btn');
      if (navBtn) {
        navBtn.addEventListener('click', () => {
          // 1. Close the SweetAlert modal popup viewport safely
          Swal.close();
          
          // 2. Perform the internal spa transition smoothly
          this.router.navigate(['/patient-request']);
        });
      }
    }
  });
}

  viewAttachment(attachment: any): void {
    let targetUrl = attachment.url;
    if (!targetUrl) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No active resource path located for this file node.' });
      return;
    }
    if (attachment.type === 'pdf' && targetUrl.startsWith('/storage/')) {
      const baseUrl = environment.apiUrl.replace(/\/api$/, '');
      targetUrl = `${baseUrl}${targetUrl}`;
    }
    if (attachment.type === 'pdf') {
      this.activePdfTitle = attachment.label || attachment.title || 'View Resource';
      this.activePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(targetUrl);
      this.showPdfModal = true;
    } else {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
    this.cdr.markForCheck();
  }

  closePdfModal(): void {
    this.showPdfModal = false;
    this.activePdfUrl = null;
    this.activePdfTitle = '';
    this.cdr.markForCheck();
  }

  scrollToSection(sectionId: string): void {
    const targetElement = document.getElementById(sectionId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  downloadDocument(documentId: number, fileName: string): void {
    this.documentService.downloadDocument(documentId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || `document-${documentId}`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Failed streaming diagnostic material download from storage source:', err);
        Swal.fire({ icon: 'error', title: 'Download Failed', text: 'Unable to stream data payload from application storage.' });
      }
    });
  }
}