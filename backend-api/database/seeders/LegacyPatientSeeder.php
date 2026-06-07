<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Patient;
use Illuminate\Support\Facades\Hash;

class LegacyPatientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 📋 Legacy Array containing your exact old table structural history records
        $legacyPatients = [
            ['id' => 6,  'name' => 'Mr. Tissa Jayawardena',     'phone' => '0779459917',    'age' => 78, 'category' => 'Rehabilitation', 'description' => 'Had Physitherapy to Right shoulder pain'],
            ['id' => 7,  'name' => 'Mr LAKG Jayathilake',       'phone' => '000000000',     'age' => 0,  'category' => 'Rehabilitation', 'description' => 'L4/5 posterior broad based disc bulge, Seen With M...'],
            ['id' => 8,  'name' => 'Mr Subash',                 'phone' => '0774543167',    'age' => 0,  'category' => 'Rehabilitation', 'description' => null],
            ['id' => 9,  'name' => 'Rev Fr Anura',              'phone' => '0772134050',    'age' => 0,  'category' => 'Rehabilitation', 'description' => null],
            ['id' => 10, 'name' => 'Master Gajindu',            'phone' => '0714167311',    'age' => 12, 'category' => 'Surgery',        'description' => 'Had X ray, Vit D Low, Taken Vit D'],
            ['id' => 11, 'name' => 'Mrs GDSS Wickramasinghe',   'phone' => '0763978005',    'age' => 0,  'category' => 'Rehabilitation', 'description' => null],
            ['id' => 12, 'name' => 'Mr Hisham',                 'phone' => '0777880557',    'age' => 0,  'category' => 'Surgery',        'description' => 'Had pain and swelling but settled ,'],
            ['id' => 13, 'name' => 'Mr TRB De Silva',           'phone' => '0777403703',    'age' => 47, 'category' => 'Rehabilitation', 'description' => 'Gout with high uric acid and marginal CRP'],
            ['id' => 14, 'name' => 'Ms Hesandi Ruhansa',        'phone' => '0718743478',    'age' => 17, 'category' => 'Rehabilitation', 'description' => 'Vit D Ok'],
            ['id' => 15, 'name' => 'Ms Withana',                'phone' => '0779256955',    'age' => 0,  'category' => 'Rehabilitation', 'description' => null],
            ['id' => 16, 'name' => 'Ms Rishard',                'phone' => '0753249332',    'age' => 29, 'category' => 'Rehabilitation', 'description' => null],
            ['id' => 17, 'name' => 'Mr Asel',                   'phone' => '+31641839699',  'age' => 0,  'category' => 'Rehabilitation', 'description' => null],
            ['id' => 18, 'name' => 'Mr Nilojan',                'phone' => '0743647273',    'age' => 0,  'category' => 'Rehabilitation', 'description' => 'Shoulder Pain'],
            ['id' => 19, 'name' => 'Ms Mariyam Irfan',          'phone' => '0777563341',    'age' => 0,  'category' => 'Rehabilitation', 'description' => 'Small inflammation'],
            ['id' => 20, 'name' => 'Mr Sasha',                  'phone' => '0744108857',    'age' => 50, 'category' => 'Rehabilitation', 'description' => 'Rheumatology Referral'],
            ['id' => 21, 'name' => 'Ms Nilanthi Liyanage',      'phone' => '0778498513',    'age' => 0,  'category' => 'Rehabilitation', 'description' => 'ESR Elevated and anti-inflammatory drugs given'],
            ['id' => 22, 'name' => 'MR MMGSP Madiwattha',       'phone' => '+61420235757',  'age' => 0,  'category' => 'Surgery',        'description' => 'Left Ring finger DIPJ release'],
            ['id' => 23, 'name' => 'Ms Shashi',                 'phone' => '0777157542',    'age' => 0,  'category' => 'Surgery',        'description' => null],
            ['id' => 24, 'name' => 'Ms Jezuliya',               'phone' => '0771878808',    'age' => 0,  'category' => 'Rehabilitation', 'description' => null],
            ['id' => 25, 'name' => 'Mr Lakmal',                 'phone' => '0768334429',    'age' => 0,  'category' => 'Surgery',        'description' => 'percutaneous fixation of bilateral scaphoid fractu...'],
            ['id' => 26, 'name' => 'Ms Ruwani Nadeepa',         'phone' => '0762677279',    'age' => 0,  'category' => 'Surgery',        'description' => null],
            ['id' => 27, 'name' => 'Ms Shankavi',               'phone' => '0770731612',    'age' => 0,  'category' => 'Rehabilitation', 'description' => null],
            ['id' => 28, 'name' => 'Mr NT Oshan Asitha',        'phone' => '0778255625',    'age' => 0,  'category' => 'Surgery',        'description' => 'Surgery for accidental injury to right hand,Given ...'],
            ['id' => 29, 'name' => 'Mr Nihal Pathmasiri',       'phone' => '0774768102',    'age' => 0,  'category' => 'Rehabilitation', 'description' => null],
            ['id' => 30, 'name' => 'Ms Asmaa',                  'phone' => '0766615084',    'age' => 0,  'category' => 'Rehabilitation', 'description' => null],
        ];

        foreach ($legacyPatients as $legacy) {
    // 1. Fetch the patient if they already exist, or create them safely
    $patient = Patient::find($legacy['id']);

    if (!$patient) {
        // Generate patient dashboard code utilizing your standard rule setup
        $cleanName = strtoupper(substr(str_replace([' ', '.', 'Mr', 'Ms', 'Mrs', 'Rev', 'Fr', 'Master'], '', $legacy['name']), 0, 2));
        if(strlen($cleanName) < 2) { $cleanName = 'PT'; } // Edge case protection fallback 
        $cleanCategory = strtoupper(substr(str_replace(' ', '', $legacy['category']), 0, 1));

        do {
            $randomNumbers = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
            $computedPatientCode = $cleanName . $randomNumbers . $cleanCategory;
        } while (Patient::where('patient_code', $computedPatientCode)->exists());

        $plainTextPassword = ($legacy['phone'] && $legacy['phone'] !== '000000000') ? $legacy['phone'] : 'Welcome@123';

        $patient = Patient::create([
            'id' => $legacy['id'], 
            'patient_code' => $computedPatientCode,
            'patient_password' => Hash::make($plainTextPassword),
            'name' => $legacy['name'],
            'phone' => $legacy['phone'],
            'age' => $legacy['age'],
            'email' => null,
            'nic_number' => null,
            'category' => $legacy['category'],
            'other_category_detail' => null,
            'red_flags' => null,
            'description' => $legacy['description'],
        ]);

        $this->command->info("Migrated Patient: {$patient->name} | Code: {$patient->patient_code} | Temp Password: {$plainTextPassword}");
    } else {
        $this->command->warn("Patient record already exists for ID {$legacy['id']}, checking dependencies...");
    }

    // 2. Safely check or create the Contact Settings relationship (Prevents 1062 Error)
    $contactSetting = $patient->contactSetting;
    
    if (!$contactSetting) {
        $contactSetting = $patient->contactSetting()->create([
            'email' => null,
            'is_visible' => true
        ]);
        $this->command->info("--> Added missing contact settings for Patient ID: {$patient->id}");
    }

    // 3. Safely check or create the Telephone mapping
    if ($patient->phone) {
        // Check if this specific telephone number is already attached to this contact setting
        $phoneExists = $contactSetting->telephones()
            ->where('telephone_number', $patient->phone)
            ->exists();

        if (!$phoneExists) {
            $contactSetting->telephones()->create([
                'telephone_number' => $patient->phone,
                'is_primary' => true
            ]);
            $this->command->info("--> Added primary telephone link for Patient ID: {$patient->id}");
        }
    }
}
    }
}