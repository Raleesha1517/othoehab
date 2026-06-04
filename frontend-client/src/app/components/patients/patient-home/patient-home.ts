import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Auth } from '../../../core/services/auth';
import { Patient } from '../../../core/services/patient';
import { Exercise } from '../../../core/services/exercise';
import { PatientDocumentService } from '../../../core/services/patient-document';
import { FollowupService } from '../../../core/services/followup'; // 💡 Imported
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
    viewClick: 'Click here to view', // 💡 Added
    loading: 'Fetching your health profile...',
    nextFollowup: 'Next Follow-up:', // 💡 Added Translation
    noFollowup: 'No upcoming follow-up scheduled' // 💡 Added Translation
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
    nextFollowup: 'ඊළඟ හමුවීම:', // 💡 Added Translation
    noFollowup: 'මීළඟ හමුවීමක් තවම වෙන්කර නොමැත' // 💡 Added Translation
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
    nextFollowup: 'அடுத்த பரிசோதனை:', // 💡 Added Translation
    noFollowup: 'அடுத்த பரிசோதனை தேதிகள் இன்னும் ஒதுக்கப்படவில்லை' // 💡 Added Translation
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
  
  // 💡 Followup Properties
  closestFollowupDate: string | null = null;

  showPdfModal = false;
  activePdfUrl: SafeResourceUrl | null = null;
  activePdfTitle = '';

  constructor(
    private authService: Auth,
    private patientService: Patient,
    private exerciseService: Exercise,
    private documentService: PatientDocumentService,
    private followupService: FollowupService, // 💡 Injected
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

    // 💡 2. Fetch Follow-up Data and calculate the closest upcoming next_followup_date
    this.followupService.getPatientFollowups(patientId).subscribe({
      next: (followups: any[]) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Filter for valid future or modern matching next_followup_dates
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

    // 3. Fetch Exercises
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

    // 4. Fetch Documents
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