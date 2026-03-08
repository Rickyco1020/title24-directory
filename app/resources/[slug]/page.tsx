import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

const articles: Record<string, { title: string; seoTitle: string; description: string; tags: string[]; content: string }> = {
  'what-is-a-hers-rater': {
    title: 'What Is a HERS Rater (Now Called an ECC Rater) and When Do You Need One?',
    seoTitle: 'What Is a HERS Rater / ECC Rater California | Title 24 Directory',
    description: 'Learn what a HERS Rater (now called an ECC Rater under the 2025 energy code) does, why they\'re required for California Title 24 projects, and how to find one near you.',
    tags: ['HERS', 'ECC'],
    content: `## Introduction

If you're building or renovating in California, there's a good chance you'll need to work with a certified field verifier before you can get final sign-off. Depending on when your project was permitted, this professional may be called a HERS Rater or — under California's new 2025 energy code — an ECC Rater. The role is the same; the name changed.

This post explains what a HERS Rater is, how the role is evolving into the ECC Rater designation under the 2025 standards, what they do on a project, when California's Title 24 energy code requires one, and how to find a certified rater in your area.

## What Is a HERS Rater?

HERS stands for Home Energy Rating System. A HERS Rater is a certified professional who conducts field verification and diagnostic testing to confirm that energy-related systems in a building were installed correctly and perform as designed.

In California, HERS Raters are certified through California Energy Commission (CEC)-approved rating organizations called HERS Providers. As of September 2024, CHEERS (California Home Energy Efficiency Rating Services) is the sole active CEC-approved HERS Provider operating in California. CalCERTS, the other major provider, permanently closed its registry on September 1, 2024. New projects must be registered through CHEERS.

HERS Raters are third-party verifiers — they are independent from the contractor or installer and are required to have no financial interest in the outcome of the project they are testing. This independence is a core requirement of the role.

## 2025 Update: HERS Raters Are Now Called ECC Raters

Under California's 2025 Building Energy Efficiency Standards, which take effect January 1, 2026, the HERS Program is being replaced by the Energy Code Compliance (ECC) Program. This is a rebranding of the same field verification role — not a new or different job.

What changes: HERS Providers become ECC-Providers. HERS Raters become ECC-Raters. The field verification and diagnostic testing work they perform remains the same.

What doesn't change: existing HERS Rater certifications automatically carry over. A rater certified under the 2022 code is considered a 2022 Energy Code-certified ECC-Rater until they complete 2025 ECC certification. There is no gap in service — field verification continues without disruption.

The motivation behind the rename reflects the broader scope of the 2025 standards. The new ECC designation emphasizes that these raters are verifying compliance with the full energy code — not just a home energy rating — and that their role includes confirming not just that systems were installed, but that they were installed correctly and verified to perform. This stricter field accountability is a core principle of the 2025 code.

For projects permitted before January 1, 2026, you need a HERS Rater. For projects permitted on or after that date, you need an ECC Rater. The person doing the work may be the same individual — just with an updated certification.

## What Does a HERS / ECC Rater Actually Do?

The rater performs field verification and diagnostic testing on specific building components and systems. The tests required on a given project depend on what features were claimed on the building's Title 24 compliance documentation (the CF1R).

Common tasks include duct leakage testing (measuring how much air is lost through the HVAC duct system), refrigerant charge verification (confirming HVAC systems are properly charged), airflow measurement (verifying air is distributed correctly throughout the building), window and glazing verification (confirming installed windows match compliance document specifications), insulation verification (checking that insulation type, location, and R-value match the design), indoor air quality system verification (confirming mechanical ventilation systems are installed and functioning), and solar and battery storage verification (required under the 2022 and 2025 standards).

The rater records their findings and submits results to the registry, which generates the CF3R — the verified certificate that confirms compliance was achieved in the field.

## When Is a HERS / ECC Rater Required in California?

A rater is required whenever a project's compliance documentation specifies measures that require field verification and diagnostic testing. This is determined by the CF1R prepared by the energy consultant.

Common project types that trigger this requirement include new single-family residential construction (almost universally requires field verification for duct systems, HVAC, and other components), new multifamily construction, HVAC replacements or alterations (replacing a furnace, air conditioner, or heat pump in an existing home often requires duct leakage testing), additions and alterations, and newly installed or replaced duct systems.

The specific measures required on your project are listed on the CF1R. Review this document early — it tells you exactly what will need to be verified.

## HERS / ECC Rater vs. Other Title 24 Compliance Roles

It's common to confuse field raters with other professionals involved in Title 24 compliance. A Title 24 Energy Consultant (also called a Title 24 analyst) prepares the compliance calculations and generates the CF1R. They work at the design stage and do not perform field testing. A HERS Rater or ECC Rater performs field testing and verification after installation and generates the CF3R, confirming what was actually installed and that it performs correctly. An Acceptance Tester is a separate certified role required for nonresidential and some multifamily projects — they verify that lighting controls, HVAC controls, and other systems function correctly.

Some professionals hold multiple certifications and can fill more than one role, but each role has distinct requirements and responsibilities.

## How to Find a Certified HERS or ECC Rater in California

To find a certified rater, check with CHEERS (currently the sole active CEC-approved HERS Provider in California, transitioning to ECC-Provider status under the 2025 code), check the CEC's program pages at energy.ca.gov for both the HERS Program and the new ECC Program, use Title 24 Directory (our directory lists certified raters across California, searchable by location and specialty), or ask your Title 24 energy consultant (many analysts work regularly with raters and can provide a referral).

When selecting a rater, confirm they are currently certified, have experience with your project type (residential vs. multifamily vs. commercial), and are certified under the correct code cycle for your project's permit date.

## Conclusion

A HERS Rater — now called an ECC Rater under the 2025 California energy code — is a certified, independent field professional who verifies that the energy features in your building were actually installed and perform correctly. The name is changing as of January 1, 2026, but the role is the same: they are the last line of verification between what was designed, what was installed, and what actually works. Their work produces the CF3R — the document that closes out your Title 24 compliance in the field.

If you're planning a project in California, confirm which code cycle applies to your permit date, then connect with a rater certified under the correct standards.`,
  },
  'cf2r-vs-cf3r': {
    title: 'CF2R vs CF3R: What\'s the Difference?',
    seoTitle: 'CF2R vs CF3R Difference | Title 24 California Forms Explained',
    description: 'Confused by CF2R and CF3R forms? Learn the difference between these two Title 24 compliance certificates, who creates them, and why both are required in California.',
    tags: ['Forms'],
    content: `## Introduction

If you've worked on a California construction project that requires Title 24 compliance, you've likely encountered two documents with similar-sounding names: the CF2R and the CF3R. They're easy to mix up — and mixing them up can cause real problems at inspection or final permit sign-off.

These two certificates serve different purposes, are created by different people, and represent different stages of the compliance process. This post explains exactly what each document is, who is responsible for it, and how they work together to document that a project meets California's Building Energy Efficiency Standards.

## What Is a CF2R?

The CF2R is the Certificate of Installation. It is a document completed by the installing contractor — not a HERS Rater or energy consultant — to certify that specific energy-related measures were installed according to the requirements listed on the compliance documentation.

The "2" in CF2R refers to its position in California's compliance documentation sequence: it comes after the CF1R (the compliance report prepared by the energy consultant) and before the CF3R (the field verification).

The CF2R is specific to each trade and measure. Common CF2R forms include certificates for insulation installation (the insulation contractor certifies the type, location, and R-value of insulation installed), HVAC installation (the HVAC contractor certifies equipment model numbers, efficiency ratings, and installation details), duct installation (documenting duct system configuration and materials), fenestration or windows and glazing (the installer certifies that windows and doors match the U-factor and Solar Heat Gain Coefficient values on the CF1R), water heating systems, and lighting systems.

The licensed contractor responsible for installing each measure fills out the relevant CF2R. An insulation subcontractor fills out the insulation CF2R. The HVAC contractor fills out the HVAC CF2R. Each contractor signs and dates their respective certificate, attesting that the installation matches what was required.

The CF2R is submitted to the HERS Registry (the online system maintained by CEC-approved rating organizations such as CHEERS) before or during the HERS Rater's site visit.

## What Is a CF3R?

The CF3R is the Certificate of Verification. It is generated after a certified HERS Rater (or in some cases an Acceptance Tester) performs field verification and diagnostic testing to confirm that the installations documented on the CF2R are correct and that the systems perform as intended.

Where the CF2R is a self-reported document completed by the installer, the CF3R is an independently verified document. This distinction is fundamental to how California's compliance system works: installation is self-certified, but verification requires a third party.

The CF3R records the results of field testing and verification performed by the HERS Rater. Depending on the measures on the project, this may include duct leakage test results (actual measured leakage percentage from diagnostic testing), refrigerant charge verification (measured superheat or subcooling values confirming proper charge), airflow measurements, window verification (rater confirms installed product matches CF1R specifications), insulation verification (rater visually confirms insulation quality and coverage), and ventilation system verification.

The CF3R is generated through the HERS Registry system once the rater completes and submits their field verification data. The rater does not manually write the CF3R — the registry produces it based on the data submitted.

## CF2R vs CF3R: A Side-by-Side Comparison

The CF2R is the Certificate of Installation, created by the installing contractor, after installation but before HERS inspection. It certifies that the measure was installed correctly and is self-reported.

The CF3R is the Certificate of Verification, created by the HERS Rater via the HERS Registry, after HERS field verification. It certifies that the installation was independently verified and is not self-reported — it requires third-party verification.

Both documents are required for permit final on any project where HERS-verified measures are specified on the CF1R.

## Why Both Documents Are Required

The CF2R and CF3R work together as a checks-and-balances system. The CF2R establishes what the contractor claims was installed. The CF3R confirms — through independent testing — that those claims are accurate and that the systems perform as designed.

California's Title 24 compliance system is built on the premise that self-reporting alone is not sufficient for energy compliance. Third-party field verification (the CF3R) closes the gap between what was designed, what was installed, and what actually performs.

Without a completed CF3R for every required HERS measure, a project cannot receive final occupancy approval. Local building departments rely on these documents to confirm that the energy features claimed in the permit were actually delivered.

## Common Mistakes to Avoid

Confusing who is responsible for each document is one of the most common errors. Contractors fill out the CF2R. HERS Raters generate the CF3R. These are not interchangeable, and one professional cannot complete both for the same measure.

Waiting until the end of the project to coordinate with a HERS Rater is another frequent mistake. The CF2R should be submitted before the rater's visit, and certain tests (like insulation verification) must happen before drywall is closed up. Scheduling the HERS Rater early avoids costly re-work.

Finally, don't assume the CF2R and CF3R cover the same measures. Each form is measure-specific. A project may have multiple CF2R forms (one per trade) and multiple CF3R certificates (one per verified measure or system). Confirm with your HERS Rater exactly which forms are required for your project.

## Conclusion

The CF2R and CF3R are both required parts of California's Title 24 compliance process, but they serve distinct roles. The CF2R is a contractor's self-certification of installation. The CF3R is a HERS Rater's independent verification that the installation was done correctly and performs as required. Together, they document the full compliance trail from design to field.

If you're planning a project that requires Title 24 compliance, make sure your contractor team understands their CF2R responsibilities — and connect with a certified HERS Rater early so the CF3R process goes smoothly.`,
  },
  'title-24-compliance-guide': {
    title: 'California Title 24 Compliance: A Builder\'s Complete Guide',
    seoTitle: 'California Title 24 Compliance Guide for Builders | Title 24 Directory',
    description: 'A complete builder\'s guide to California\'s Title 24 energy code — what it covers, who\'s involved, key documents, and how to navigate compliance for new construction and renovations.',
    tags: ['Compliance'],
    content: `## Introduction

California's Title 24 energy code is one of the most comprehensive building energy standards in the country. For builders and developers working on new construction or major renovations in California, understanding Title 24 is not optional — it is a legal requirement that affects project design, contractor coordination, inspections, and permit close-out.

This guide covers the fundamentals of Title 24 Part 6 (the Building Energy Efficiency Standards), who the key compliance professionals are, what documents are required, and how the compliance process works from permit application to final sign-off.

## What Is Title 24?

Title 24 is the California Code of Regulations, Title 24, which covers building standards across multiple parts. When most people in the construction industry refer to "Title 24," they mean Part 6: The Building Energy Efficiency Standards (BEES).

Part 6 is developed and enforced by the California Energy Commission (CEC) and sets minimum energy performance requirements for new buildings and additions and alterations to existing buildings. The standards apply to both residential and nonresidential buildings and cover systems including the building envelope (insulation, windows, air sealing), HVAC systems, water heating, lighting, electrical systems and EV charging readiness, and solar photovoltaic and battery storage (for new residential construction under the 2022 standards).

The CEC updates the Building Energy Efficiency Standards on a roughly three-year cycle. The most recent standards are the 2022 Title 24 Standards, which took effect January 1, 2023. Projects permitted on or after that date must comply with the 2022 standards.

## Who Is Involved in Title 24 Compliance?

Title 24 compliance involves multiple professionals, each with a distinct role. Understanding who does what — and when — is critical for keeping a project on track.

The energy consultant (also called an ECC Writer or Title 24 analyst) prepares the compliance calculations before or during the permit application process. They use CEC-approved software to model the building and confirm that it meets the required energy budget. The output is the CF1R — the Certificate of Compliance — which is the foundational compliance document for the project. The energy consultant does not perform field work.

The HERS Rater is a CEC-certified, third-party field verifier who visits the job site after systems are installed to perform diagnostic testing and visual verification. Their work produces the CF3R — the Certificate of Verification — which confirms that HERS-required measures were installed correctly and perform as specified.

Licensed contractors are responsible for completing the CF2R — the Certificate of Installation — for each measure they install. This is a self-certification document attesting that the installation matches the CF1R requirements.

For nonresidential projects and some multifamily buildings, an Acceptance Tester performs functional testing of lighting controls, HVAC controls, and other building systems to confirm they operate as required.

The local building department is the authority having jurisdiction. They review submitted compliance documents at permit application, conduct inspections during construction, and verify that all required certificates are on file before issuing final approval.

## Key Title 24 Compliance Documents

The CF1R (Certificate of Compliance) is prepared by the energy consultant and submitted with the building permit application. It lists all required energy measures and identifies which require HERS verification. This document drives everything else.

The CF2R (Certificate of Installation) is completed by each licensed installing contractor after their portion of the work is done. It is self-certified and submitted to the HERS Registry prior to HERS field verification.

The CF3R (Certificate of Verification) is generated by the HERS Rater through the HERS Registry after field testing is complete. It is required for permit final.

## Title 24 Compliance: Step by Step

During the design phase, the project architect or designer works with an energy consultant to develop a compliant building design. At permit application, the energy consultant submits the CF1R. During construction, contractors install the systems and complete CF2R forms as their work is completed. For HERS field verification, the HERS Rater visits the site to perform testing — certain tests like insulation verification must occur before work is covered. For nonresidential and some multifamily projects, an Acceptance Tester performs functional testing. At permit final, the builder provides all required CF1R, CF2R, and CF3R documentation.

## Special Requirements Under the 2022 Standards

The 2022 Title 24 Standards introduced several requirements builders need to know. The solar PV requirement was expanded significantly — extending the solar mandate to new high-rise multifamily buildings and many nonresidential building types, including offices, retail, schools, grocery stores, and warehouses.

Battery energy storage systems (BESS) are now prescriptively required for newly constructed nonresidential and high-rise multifamily buildings. For new single-family homes, BESS is not mandatory, but BESS-ready infrastructure is required — meaning the home must be pre-wired to support a future battery installation. Installing a qualifying battery system (minimum 7.5 kWh usable capacity) allows the required PV system size to be reduced by up to 25%.

The 2022 standards also include stronger requirements for EV charging infrastructure, heat pump-ready space and water heating, and significantly increased efficiency requirements for water heating in new residential construction — making heat pump water heaters the most common path to compliance.

## Common Title 24 Compliance Mistakes for Builders

Not engaging the energy consultant early enough is one of the most costly mistakes. Title 24 compliance must be designed in from the start. Last-minute compliance fixes are expensive and sometimes impossible without redesigning building systems.

Failing to schedule the HERS Rater at the right construction phase is another frequent problem. Insulation must be verified before drywall is installed. Duct testing must occur before final close-up. Missing these windows requires opening up finished work.

Assuming the energy consultant handles everything leads to gaps in the process. Field compliance — CF2R forms from contractors and CF3R certificates from the HERS Rater — requires coordination across multiple parties on site.

Finally, not verifying that installed products match the CF1R can derail a project. If a contractor substitutes a window or HVAC unit with a different model mid-project, the CF1R may need to be revised before HERS verification can proceed.

## Conclusion

Title 24 compliance is a multi-step, multi-party process that runs from design through permit close-out. Understanding who is responsible for each document — the energy consultant's CF1R, the contractor's CF2R, and the HERS Rater's CF3R — is the foundation of managing a California construction project successfully.

Start compliance planning early, coordinate your HERS Rater before construction begins, and keep your compliance document chain organized. Those three habits will prevent the majority of delays builders encounter at permit final.`,
  },
  'what-is-acceptance-testing': {
    title: 'What Does an Acceptance Tester Do? Title 24 Acceptance Testing Explained',
    seoTitle: 'Title 24 Acceptance Testing California | What Does an Acceptance Tester Do?',
    description: 'Learn what a Title 24 Acceptance Tester does, which projects require acceptance testing, what systems are covered, and how to find a certified tester in California.',
    tags: ['Compliance'],
    content: `## Introduction

Most people involved in California construction have heard of HERS Raters. Fewer are familiar with Acceptance Testers — even though acceptance testing is a required step on most nonresidential construction projects and many multifamily buildings in California.

If your project involves commercial construction, tenant improvements, or multifamily buildings of a certain size or complexity, you will likely need a certified Acceptance Tester before you can close out your permit. This post explains what acceptance testing is, what an Acceptance Tester does, which projects require it, and how to find a certified tester for your project.

## What Is Title 24 Acceptance Testing?

Acceptance testing is a functional verification process required under California's Title 24 Part 6 Building Energy Efficiency Standards. The purpose is to confirm that specific building systems — particularly lighting controls and HVAC controls — are not just installed, but are installed correctly and operating as intended.

Unlike HERS verification, which focuses on residential buildings and emphasizes diagnostic measurements (like duct leakage or refrigerant charge), acceptance testing is primarily about functional performance. Does the occupancy sensor actually turn the lights off when the room is empty? Does the economizer open and close correctly? Does the demand control ventilation system respond to CO₂ levels appropriately?

These are not things you can verify by looking at the equipment. They require someone to actually test the system — to walk through the space, simulate occupancy, and observe whether the controls respond as designed.

## What Does an Acceptance Tester Do?

A certified Acceptance Tester performs functional testing on required building systems and documents the results on the appropriate California Energy Commission acceptance testing forms.

For lighting controls, acceptance tests verify that occupancy sensors (vacancy sensors and occupancy sensors) activate and deactivate lighting correctly, daylighting controls (automatic dimming systems near windows and skylights) respond to changing light levels, shut-off controls operate as required, and exterior lighting controls turn off or dim during daylight hours.

For HVAC, common acceptance tests include economizer controls (verifying that the economizer opens to bring in outside air for free cooling when outdoor conditions are favorable — this is one of the most frequently required and most commonly failed acceptance tests), demand control ventilation (verifying that CO₂-based ventilation control systems modulate outside airflow based on actual occupancy), supply air temperature reset, and hydronic system controls.

Depending on the project scope, additional acceptance tests may be required for fault detection and diagnostics systems, automatic demand shed controls, and refrigeration system controls in commercial kitchen and food service applications.

## When Is Acceptance Testing Required?

Acceptance testing is required under Title 24 Part 6 for new nonresidential construction (virtually all new commercial buildings require acceptance testing for applicable lighting control and HVAC control systems), additions and alterations to nonresidential buildings when the scope of work includes systems that trigger acceptance testing requirements, multifamily buildings (high-rise multifamily, four stories and above, is classified as nonresidential under Title 24 and generally requires acceptance testing), and tenant improvements that include new or modified lighting or HVAC systems.

Acceptance testing is not required on single-family residential projects, which are instead covered by HERS verification.

The specific tests required on a given project are determined by the compliance documentation. Review the CF1R to identify which acceptance tests are required for your project.

## Who Can Perform Acceptance Testing?

Acceptance Testers in California must be certified through a CEC-approved Acceptance Test Technician Certification Provider (ATTCP). An Acceptance Test Technician (ATT) is an individual certified to perform acceptance tests who must have at least three years of verifiable professional experience in mechanical controls and systems. Certification for mechanical ATTs has been required statewide since October 1, 2021.

An Acceptance Test Employer (ATE) is a company or firm that employs certified ATTs and is responsible for quality control and appropriate supervision of ATTs on projects.

Both the individual technician and their employer must be certified. When hiring an acceptance tester, verify that both the technician's ATT certification and the company's ATE certification are current.

Some HERS Raters also hold ATT certification, allowing them to perform both HERS verification and acceptance testing on applicable projects. However, the two roles have distinct certification requirements and not all HERS Raters are certified Acceptance Testers.

## Acceptance Testing vs. HERS Verification: Key Differences

Acceptance testing focuses on functional performance of controls and is performed by a certified Acceptance Test Technician, primarily for nonresidential and high-rise multifamily projects. Key systems tested include lighting controls and HVAC controls.

HERS verification focuses on diagnostic testing of systems like ducts, refrigerant, and airflow. It is performed by a certified HERS Rater, primarily for residential and low-rise multifamily projects. Key systems include duct systems, HVAC equipment, insulation, and windows.

Both types of verification are required on many projects — particularly high-rise multifamily buildings — and both must be completed before permit final.

## Conclusion

Acceptance testing is a required part of Title 24 compliance for most nonresidential construction in California. A certified Acceptance Tester verifies that lighting controls, HVAC controls, and other systems actually function as required — not just that they were installed. The results are documented on CEC acceptance testing certificates that must be on file before a project can receive final permit approval.

If your project involves commercial construction, tenant improvements, or high-rise multifamily, acceptance testing is almost certainly in scope. Start by reviewing your CF1R to identify which tests are required, then connect with a certified ATT/ATE early in the construction process.`,
  },
  'hers-vs-ecc-rater': {
    title: 'ECC Writer vs. HERS Rater: Which One Does Your Project Need?',
    seoTitle: 'ECC Writer vs HERS Rater California | Which Do You Need in 2025+?',
    description: 'ECC writer or HERS Rater — or both? Learn the difference between these two Title 24 compliance roles, what each one does, and which your California project requires.',
    tags: ['HERS', 'ECC'],
    content: `## Introduction

California's energy code uses several professional roles that often confuse builders, contractors, and developers — especially those newer to working in the state. Two of the most commonly confused are the ECC writer (also called a Title 24 energy consultant or Title 24 analyst) and the HERS Rater.

Both are required on most new residential construction projects in California. But they perform completely different functions at completely different stages of the project. Hiring the wrong one — or assuming one covers what the other does — leads to delays, failed inspections, and missed permit deadlines.

This post explains exactly what each role does, when each is required, and how the 2022 Title 24 Standards (now in effect for projects permitted on or after January 1, 2023) affect what you need on your project.

## What Is an ECC Writer?

ECC stands for Energy Compliance Certificate — though in everyday practice, the terms "ECC writer," "Title 24 energy consultant," and "Title 24 analyst" are used interchangeably to describe the same role.

An ECC writer is the professional who prepares the Title 24 compliance calculations for a project. They use CEC-approved energy modeling software (such as EnergyPro, CBECC-Res, or CBECC-Com, depending on the project type) to model the building and demonstrate that it meets California's Building Energy Efficiency Standards.

The primary output of the ECC writer's work is the CF1R — the Certificate of Compliance. This document is submitted with the building permit application and serves as the compliance roadmap for the entire project. It specifies every energy measure the building is designed to include, which of those measures require HERS field verification, and the overall energy budget compliance margin.

The CF1R is a design-stage document. The ECC writer works from architectural and mechanical drawings, and their job at the design phase is complete once the CF1R is finalized and submitted.

You need an ECC writer on virtually every permitted construction project in California, including new single-family residential construction, new multifamily construction, commercial new construction, residential additions over a certain conditioned floor area threshold, HVAC system replacements and alterations that require a Title 24 compliance calculation, and major renovations that affect the building envelope or mechanical systems.

## What Is a HERS Rater?

A HERS Rater (Home Energy Rating System Rater) is a CEC-certified, independent field professional who performs on-site verification and diagnostic testing after systems are installed. Their job is to confirm that what was designed and specified on the CF1R was actually installed correctly and performs as required.

The HERS Rater's work takes place in the field, during and after construction — not at the design stage. They visit the job site, run tests, take measurements, and enter their findings into the HERS Registry. The registry generates the CF3R — the Certificate of Verification — which is the field counterpart to the design-stage CF1R.

Common HERS verification tasks include duct leakage testing (measuring actual duct system leakage using a duct blaster), refrigerant charge verification (measuring superheat or subcooling to confirm the HVAC system is properly charged), airflow measurement, window verification (confirming installed windows match the U-factor and SHGC on the CF1R), insulation verification (visual confirmation of insulation type, location, and R-value before close-up), mechanical ventilation verification, and solar and battery system verification (under the 2022 standards, newly required for many residential projects).

A HERS Rater is required whenever a project's CF1R specifies HERS-verified measures — which means almost all new single-family residential construction in California, low-rise multifamily new construction, HVAC replacements in existing homes when duct leakage testing is triggered, and residential additions when new HVAC equipment or duct work is included.

## ECC Writer vs. HERS Rater: Key Differences

The ECC writer handles design-stage compliance calculations, is involved before and during permit application, and produces the CF1R. They work from architectural and mechanical drawings.

The HERS Rater handles field verification and diagnostic testing, is involved during and after construction, and produces the CF3R. They work from installed systems on the job site.

Both are required on most new residential projects in California.

In most cases, one person cannot fill both roles. The HERS verification system is built on third-party independence — the HERS Rater must be independent from the contractor and from the design team. Treat these as two separate hires for two separate scopes of work.

## What Changes for 2025+ Projects Under the 2022 Standards

The 2022 Title 24 Standards, which took effect January 1, 2023, introduced several changes that affect both roles. New single-family homes must include a solar PV system and be built with battery-ready infrastructure. Battery energy storage systems (BESS) are prescriptively required for nonresidential and high-rise multifamily buildings. ECC writers must account for solar PV (and BESS where required) in the compliance calculation; HERS Raters must verify the installed systems.

Heat pump water heaters are now effectively the standard path to compliance for most new homes under the 2022 standards. New requirements for electrical panel capacity and conduit for future EV charging infrastructure also affect the compliance calculation. Updated whole-building and spot ventilation requirements affect both design compliance and HERS field verification.

## Which Do You Need — and When?

For most new residential construction projects in California, you need both. The ECC writer comes first — before or during permit application. The HERS Rater comes second — during and after construction, before permit final.

A practical timeline: during the design phase, engage your ECC writer to prepare the CF1R and submit it with your permit application. Before construction begins, review the CF1R to understand which HERS measures are required and engage a HERS Rater, scheduling their site visits in advance. During construction, contractors install systems and complete CF2R certificates, and you coordinate with your HERS Rater to ensure insulation and other pre-close-up verifications happen at the right time. Near completion, the HERS Rater performs duct testing, equipment verification, and any remaining field tests to generate CF3R certificates. At permit final, submit the complete compliance document set to the building department.

## Conclusion

The ECC writer and the HERS Rater are both essential to Title 24 compliance in California — but they do entirely different jobs. The ECC writer works at the design stage to produce the compliance roadmap (the CF1R). The HERS Rater works in the field to verify that the roadmap was followed (producing the CF3R). For 2025 and beyond projects operating under the 2022 standards, both roles carry expanded scope due to new solar, battery, and heat pump requirements.

Engage both early, keep your compliance document chain organized, and you'll be well-positioned to move smoothly through permit final.`,
  },
  'title-24-solar-requirements': {
    title: 'Title 24 Solar PV Requirements for New Construction in California',
    seoTitle: 'Title 24 Solar PV Requirements California | New Construction 2023+',
    description: 'California requires solar PV on most new construction and battery storage on certain building types. Learn what Title 24 mandates, what\'s exempt, and how a HERS Rater verifies your system.',
    tags: ['Solar', 'Compliance'],
    content: `## Introduction

California made history with its 2022 Building Energy Efficiency Standards by significantly expanding solar photovoltaic (PV) requirements and introducing battery energy storage system (BESS) mandates for certain building types. If you're building in California, understanding what the solar and battery mandates require — and how they're verified — is essential to getting your project to permit final.

## What the 2022 Title 24 Standards Require

Under the 2022 Title 24 standards (effective January 1, 2023), all new single-family homes and low-rise multifamily buildings (three stories or fewer) are required to include a solar PV system. This requirement was first introduced under the 2019 standards for single-family homes.

The 2022 standards significantly expanded the solar mandate to nonresidential buildings. New commercial buildings including offices, retail stores, schools, grocery stores, warehouses, and high-rise multifamily buildings (four stories and above) must now include solar PV systems sized according to the building's conditioned floor area.

## Battery Storage Requirements

Battery energy storage systems (BESS) are prescriptively required for newly constructed nonresidential and high-rise multifamily buildings under the 2022 standards.

For new single-family homes and low-rise multifamily buildings, BESS is not mandatory — but BESS-ready infrastructure is. This means the home must be built with the electrical panel capacity, dedicated space, and wiring infrastructure to support a future battery installation. Installing a qualifying battery system (minimum 7.5 kWh usable capacity, JA12-compliant) allows the required PV system size to be reduced by up to 25%, which incentivizes battery installation even though it's not required.

## How Solar System Size Is Determined

For residential buildings, the required solar PV system size is calculated based on conditioned floor area, climate zone, and the building's energy consumption. The energy consultant (ECC writer) performs this calculation using CEC-approved compliance software and specifies the required system on the CF1R.

For nonresidential buildings, the PV system size is based on conditioned floor area with specific minimum watts-per-square-foot requirements that vary by building type and climate zone.

## Exemptions and Alternative Compliance

There are limited exemptions to the solar requirement. Buildings where the roof area is insufficient to accommodate the minimum required system may qualify for a reduction or exemption. Shading from adjacent trees or structures that would reduce system output below a threshold can also reduce the required size.

Buildings that connect to a community solar program (a shared solar facility) may be able to satisfy the requirement through that alternative, subject to CEC approval.

These exemptions and alternatives must be documented and calculated by the energy consultant — they are not automatic.

## HERS Verification of Solar and Battery Systems

Like other Title 24 compliance measures, solar PV and battery storage systems must be field-verified. A HERS Rater is required to confirm that the installed system matches the specifications on the CF1R, including verifying the inverter, panel count, system capacity, and battery storage usable capacity.

The HERS Rater will check the equipment model numbers against what was specified in the compliance documentation, confirm the system is operational, and submit verification data to the HERS registry to generate the CF3R.

This verification must be completed before permit final. Scheduling your HERS Rater to verify the solar and battery system at the same time as other HERS measures (duct leakage, HVAC verification, etc.) is the most efficient approach.

## What This Means for Builders

Solar PV and battery storage are now baseline requirements for virtually all new residential construction in California. They should be incorporated into the project design from the beginning — not treated as add-ons.

Work with your energy consultant early to determine the correct system size for your project, confirm the solar PV contractor understands the CF1R specifications, ensure the battery storage system meets the minimum usable capacity requirement, and schedule your HERS Rater to verify both systems before permit final.

## Conclusion

California's 2022 Title 24 standards require solar PV on most new construction, battery storage on nonresidential and high-rise multifamily buildings, and battery-ready infrastructure on single-family homes. The requirements are determined by the energy consultant, documented on the CF1R, and verified in the field by a HERS Rater. Building these requirements into your project plan from the start is the most cost-effective approach.`,
  },
  'what-is-a-cf1r': {
    title: 'What Is a CF1R? California Title 24 Compliance Report Explained',
    seoTitle: 'What Is a CF1R? Title 24 Certificate of Compliance California',
    description: 'The CF1R is the foundation of every Title 24 project in California. Learn what it contains, who prepares it, when it\'s required, and how it connects to CF2R and CF3R.',
    tags: ['Forms', 'Compliance'],
    content: `## Introduction

If you've worked on a permitted construction project in California, you've likely heard the term "CF1R." It's one of the most important documents in California's Title 24 compliance process — and one of the least understood outside of energy professionals.

This post explains exactly what a CF1R is, what it contains, who prepares it, when it's required, and how it fits into the broader compliance document chain alongside the CF2R and CF3R.

## What Is a CF1R?

The CF1R is the Certificate of Compliance. It is the foundational Title 24 compliance document for any California construction project subject to the Building Energy Efficiency Standards.

The "CF" stands for Compliance Form. The "1" indicates it is the first document in the compliance sequence — the design-stage compliance report that everything else flows from.

The CF1R is generated by an energy consultant (also called a Title 24 analyst or ECC writer) using CEC-approved energy modeling software. It is submitted with the building permit application and must be approved before construction begins.

## What Does a CF1R Contain?

The CF1R is a detailed compliance report that documents every energy measure the building is designed to include. Key sections of a residential CF1R include the building description (conditioned floor area, number of stories, climate zone), envelope measures (insulation R-values, window U-factors and Solar Heat Gain Coefficients, air sealing requirements), HVAC systems (equipment type, efficiency ratings, duct configuration, ventilation requirements), water heating (system type, efficiency, distribution system), lighting (indoor and outdoor lighting power), solar PV and battery storage (required system size and specifications under the 2022 standards), and HERS verification requirements (a list of every measure that requires HERS field verification and diagnostic testing).

That last section is critical. The HERS verification measures listed on the CF1R determine exactly what a HERS Rater must test and verify on your project. This list drives the CF2R and CF3R compliance process.

## Who Prepares the CF1R?

The CF1R is prepared by a Title 24 energy consultant using CEC-approved compliance software such as EnergyPro (for residential and nonresidential projects) or CBECC-Res and CBECC-Com. The energy consultant models the building based on the architectural and mechanical drawings, confirms it meets the required energy budget, and generates the CF1R report.

The energy consultant is responsible for the accuracy of the CF1R. If the building is constructed differently from what was modeled — different window specifications, a different HVAC system, revised insulation levels — the CF1R must be revised and resubmitted before HERS verification can proceed.

## When Is a CF1R Required?

A CF1R is required for virtually every permitted construction project in California that falls under Title 24 Part 6, including new single-family residential construction, new multifamily residential construction, new nonresidential and commercial construction, residential additions over a threshold conditioned floor area, HVAC system replacements and alterations that require a Title 24 calculation, and major building envelope alterations.

There are limited exemptions for very small additions and certain like-for-like replacements, but most permitted work on California buildings requires a CF1R.

## How the CF1R Connects to CF2R and CF3R

The CF1R is the starting point. It defines what must be installed and what must be verified.

The CF2R (Certificate of Installation) is completed by each licensed installing contractor after their work is done. They are attesting that what they installed matches the specifications on the CF1R.

The CF3R (Certificate of Verification) is generated by the HERS Rater after they perform field verification and diagnostic testing. It confirms that the installations documented on the CF2R were actually done correctly and perform as the CF1R requires.

All three documents — CF1R, CF2R, and CF3R — must be on file before a project can receive final permit sign-off from the local building department.

## Common CF1R Mistakes to Avoid

Submitting the CF1R late is one of the most common and costly mistakes. The CF1R must be approved with the permit before construction begins. Last-minute energy consulting can delay your permit.

Not updating the CF1R when design changes occur is another frequent problem. If you change the window specifications, swap out the HVAC equipment, or modify the insulation scope, the CF1R must be revised. Running HERS verification against an outdated CF1R will result in compliance failures.

Failing to review the HERS verification measures on the CF1R before construction is a third common error. Review this section early so you understand what your HERS Rater will need to test — and can schedule their site visits at the right construction phase.

## Conclusion

The CF1R is the compliance roadmap for every Title 24 project. It documents what must be built, drives the HERS verification process, and must match what is actually constructed. Getting it right at the design stage — and keeping it updated through construction — is the foundation of a smooth path to permit final.`,
  },
  'duct-leakage-testing': {
    title: 'Duct Leakage Testing in California: What to Expect',
    seoTitle: 'Duct Leakage Testing California Title 24 | HERS Rater Requirements',
    description: 'Duct leakage testing is one of the most common HERS verification requirements in California. Learn what it measures, when it\'s required, and how to pass.',
    tags: ['HVAC', 'HERS'],
    content: `## Introduction

Duct leakage testing is one of the most frequently required HERS verification measures in California. If your project involves new construction, an HVAC replacement, or a new duct system, there is a good chance duct leakage testing will appear on your CF1R as a required HERS measure.

This post explains what duct leakage testing is, how it works, when it's required, what the pass/fail thresholds are, and how to set your project up for a clean test.

## What Is Duct Leakage Testing?

Duct leakage testing is a diagnostic procedure that measures how much air leaks out of an HVAC duct system through gaps, cracks, and poorly sealed connections. Air that leaks out of the ducts before reaching the living space represents wasted energy — your HVAC system is conditioning air that never arrives where it's needed.

In California, duct leakage is measured and expressed as a percentage of the system's airflow capacity. The goal is to confirm that the duct system meets the maximum allowable leakage threshold specified in the compliance documentation.

## How Duct Leakage Testing Works

A certified HERS Rater performs the test using a device called a duct blaster. The duct blaster is a calibrated fan that is temporarily sealed to a duct register or the air handler. The remaining registers and grilles in the system are temporarily sealed with foam or tape.

The duct blaster pressurizes the duct system to a standard test pressure (typically 25 Pascals). The airflow required to maintain that pressure is measured. That airflow measurement represents the leakage — the more air required to maintain pressure, the more the system is leaking.

There are two main test protocols: total leakage testing (measures all leakage in the system including leakage to the interior of the building) and leakage to outside testing (measures only the leakage that escapes to outside the conditioned space — typically a more stringent and meaningful measure for energy compliance).

The specific test protocol required on your project is determined by the CF1R.

## When Is Duct Leakage Testing Required in California?

Duct leakage testing is required under Title 24 for new construction with forced-air HVAC systems (virtually all new single-family homes with ducted HVAC require duct leakage testing), HVAC replacements in existing homes when the existing duct system is being retained (in many climate zones, replacing just the air handler or compressor triggers a duct leakage test on the existing ducts), new duct systems installed as part of a building alteration, and when duct leakage compliance credit is claimed on the CF1R (for projects where tight duct systems are part of the energy compliance strategy).

The specific trigger conditions are defined in the Title 24 standards and vary by climate zone and project type. Review the HERS verification measures on your CF1R to confirm whether duct leakage testing is required.

## What Are the Pass/Fail Thresholds?

Under the 2022 Title 24 standards, the maximum allowable duct leakage thresholds depend on the scope of work. For new systems with all new ducts, the maximum allowable total leakage is 6% of the system's nominal airflow. For existing duct systems being retained with a new HVAC equipment installation, the threshold depends on whether any duct replacement occurred — existing systems with duct replacement must meet 5% or less, while existing systems with no duct replacement must meet 15% or less. Supply and return ductwork leaking specifically to the outdoors has a maximum acceptable leakage rate of 2%.

These thresholds are more stringent than previous code cycles, reflecting California's ongoing push toward tighter duct systems and reduced energy waste.

## How to Prepare for Duct Leakage Testing

Coordinate with your HVAC contractor before the test. The duct system should be fully installed, all connections sealed with mastic or UL-listed tape, and all registers and grilles installed before the HERS Rater arrives. Incomplete duct work is a frequent cause of test delays.

Schedule the test before final close-up where possible. Duct work in unconditioned attics or crawlspaces should be accessible at the time of testing. After drywall is installed it is much harder to access and repair leaking duct connections.

Ask your HVAC contractor about their typical leakage test results. Experienced contractors who work on California projects regularly understand the Title 24 thresholds and should be sealing their work to meet them. If your contractor is unfamiliar with the duct leakage requirements, that is a red flag.

## What Happens If the Test Fails?

If the duct system fails the leakage test, the HVAC contractor must identify and seal the leaking connections and the test must be repeated. The HERS Rater cannot sign off on a failed test.

Common causes of test failures include unsealed duct boots at registers, poorly connected flex duct sections, unsecured duct connections at the air handler, missing mastic at duct branch points, and improperly sealed return air plenums.

Finding and sealing leaks after drywall has been installed is time-consuming and expensive. This is why scheduling the duct leakage test before close-up is strongly recommended.

## Conclusion

Duct leakage testing is a standard HERS verification requirement for most new construction and many HVAC replacement projects in California. A certified HERS Rater performs the test using a duct blaster, and results must meet the thresholds specified in the CF1R before a CF3R can be issued. Coordinating with your HVAC contractor to seal duct work properly — and scheduling the test before final close-up — are the two most important things you can do to set your project up for a clean test.`,
  },
  'heat-pump-water-heater-title-24': {
    title: 'Heat Pump Water Heater Requirements Under California Title 24',
    seoTitle: 'Heat Pump Water Heater Title 24 California | 2022 Standards Explained',
    description: 'The 2022 Title 24 standards effectively require heat pump water heaters for most new residential construction in California. Learn what\'s required and when HERS verification applies.',
    tags: ['HVAC', 'Compliance'],
    content: `## Introduction

Water heating is one of the largest energy uses in a California home, and the 2022 Title 24 Building Energy Efficiency Standards dramatically raised the bar for water heating efficiency. For most new residential construction, the 2022 standards have made heat pump water heaters the practical standard — not just an option.

This post explains what the 2022 Title 24 water heating requirements are, why heat pump water heaters became the default compliance path, and when HERS verification applies to water heating systems.

## What the 2022 Standards Require

The 2022 Title 24 standards significantly increased the energy efficiency requirements for water heating in new residential construction. The prescriptive path sets efficiency thresholds that are most easily met by heat pump water heaters — conventional gas and standard electric resistance water heaters typically require additional measures (such as demand recirculation systems) to comply.

In practice, heat pump water heaters have become the primary compliance path for new single-family and low-rise multifamily construction. A heat pump water heater moves heat from the surrounding air into the water tank rather than generating heat directly — making it two to three times more efficient than a conventional electric resistance heater and substantially more efficient than gas on an energy cost basis.

The 2022 standards also include requirements for electric panel capacity and dedicated circuits to support heat pump water heaters, recognizing that new construction must be wired to accommodate them.

## Why Heat Pump Water Heaters Became the Default

The shift toward heat pump water heaters under the 2022 standards reflects two overlapping goals. First, the efficiency requirements were raised high enough that conventional gas water heaters — which have a UEF typically in the 0.6 to 0.7 range — struggle to meet the required thresholds without adding a demand recirculation system and other efficiency measures. Heat pump water heaters, with UEF ratings typically in the 3.0 to 4.0 range, exceed the requirements by a wide margin.

Second, California's energy policy is moving toward electrification. Heat pump water heaters are an all-electric appliance that works well with California's increasingly renewable electricity grid. California's broader electrification goals — including its all-electric new construction policies in many jurisdictions — have pushed water heating in this direction.

Some projects can still use gas water heating by combining it with a demand recirculation system and meeting other efficiency conditions on the CF1R. However, the compliance pathway is narrower, and many energy consultants and builders have shifted to heat pump water heaters as the simpler all-in-one solution.

## Sizing and Installation Considerations

Heat pump water heaters require more installation planning than conventional tank water heaters. They work best in spaces with adequate air volume — generally at least 700 to 1,000 cubic feet — because they pull heat from the surrounding air. In tight mechanical rooms or small closets, they can short-cycle and lose efficiency.

They also produce cool, dehumidified air as a byproduct of heating the water. In conditioned spaces, this has a slight cooling effect in summer (which can be beneficial) but adds heating load in winter. Installers should consider the location carefully to minimize energy impact.

Heat pump water heaters operate at a lower noise level than many mechanical systems but are not silent. Locating them in garages, utility rooms, or other areas where noise is less of a concern is generally preferable to installing them adjacent to bedrooms.

## HERS Verification of Water Heating Systems

Not all water heating systems require HERS verification, but some do. Water heating measures that may require HERS field verification include demand recirculation systems (when a recirculation pump is used to reduce hot water waste, the pump controls and sensor systems may require HERS verification), central water heating distribution systems in multifamily buildings, and solar water heating systems when they are part of the compliance pathway.

The specific measures that require HERS verification for your project are listed on the CF1R. Review this document with your energy consultant to understand what verification your water heating system will need.

## What to Tell Your HVAC or Plumbing Contractor

When specifying a heat pump water heater for a new California project, confirm the specific model number matches the unit specified on the CF1R before ordering. The CF1R lists the minimum UEF or EF required — the installed unit must meet or exceed this specification. If you substitute a different model, the CF1R must be revised before HERS verification.

Confirm that the electrical panel has sufficient capacity for the heat pump water heater's dedicated circuit. The 2022 standards include provisions for panel capacity, but real-world installations sometimes reveal gaps in planning.

## Conclusion

Heat pump water heaters are now the standard compliance path for water heating under California's 2022 Title 24 standards. Their high efficiency easily clears the new thresholds that most conventional water heaters cannot meet. For builders and contractors working on new California construction, understanding the installation requirements and planning for HERS verification where it applies will make for a smoother path to permit final.`,
  },
  'performance-path-title-24': {
    title: 'The Performance Path to Title 24 Compliance: How Heat Pumps, Mini Splits, and R-21 Work Together',
    seoTitle: 'Title 24 Performance Path California | Heat Pump Water Heater, Mini Split, R-21',
    description: 'Learn how California\'s Title 24 performance path lets you trade efficiency measures — like heat pump water heaters, ductless mini splits, and R-21 insulation — to meet energy code requirements with more design flexibility.',
    tags: ['Compliance', 'HVAC'],
    content: `## Introduction

California's Title 24 energy code gives builders and designers two ways to demonstrate compliance: the prescriptive path and the performance path. The prescriptive path is a checklist — meet every specified requirement for your climate zone exactly as written. The performance path is a budget — use CEC-approved energy modeling software to show that your building's overall energy use meets or beats the code target, even if individual components differ from the prescriptive minimums.

For residential projects, the performance path is the more popular option. It lets you make tradeoffs between building systems — using a more efficient water heater, for example, to offset slightly less insulation — as long as the overall building hits the energy budget. This post explains how the performance path works and how three common residential measures — heat pump water heaters, ductless mini-split heat pumps, and R-21 wall insulation — interact under the 2022 Title 24 standards.

## How the Performance Path Works

The performance path uses CEC-approved compliance software — CBECC-Res for single-family and low-rise multifamily, or EnergyPro — to compare two versions of your building. The "standard design" is a theoretical version of your building built to meet every prescriptive requirement exactly. The "proposed design" is your actual building as designed, with whatever equipment, insulation, and systems you've specified.

If the proposed design's calculated energy use is equal to or less than the standard design, the building complies. The software calculates an energy budget that accounts for the building's climate zone, size, orientation, and other fixed characteristics, then scores the proposed design against that budget.

The key advantage is flexibility. The prescriptive path requires you to meet every individual specification — a specific wall U-factor, a specific HVAC efficiency, a specific water heater type. The performance path lets you exceed the requirement in one area to compensate for falling short in another. Energy consultants call this a "tradeoff."

There is an important limitation: mandatory requirements still apply regardless of which compliance path you use. Mandatory measures — like minimum duct insulation, mechanical ventilation, and certain air sealing requirements — cannot be traded away on the performance path. They must be met on every project.

## Heat Pump Water Heaters on the Performance Path

Water heating is one of the largest energy consumers in a California home, and the 2022 Title 24 standards made heat pump water heaters the prescriptive baseline for most new residential construction. A heat pump water heater with a Uniform Energy Factor (UEF) in the 3.0 to 4.0 range is two to three times more efficient than a conventional electric resistance heater and significantly more efficient than a standard gas water heater (UEF typically 0.6 to 0.7).

On the performance path, specifying a heat pump water heater does more than just meet the water heating requirement — it often generates compliance margin that can be applied elsewhere in the building design. Because the standard design already assumes a heat pump water heater as the baseline in many climate zones under the 2022 code, using one is essentially the starting point. But selecting a higher-efficiency model (UEF 3.5 or above) can create additional headroom in the energy budget.

For projects where the builder wants to use a gas water heater instead, the performance path allows it — but the compliance software will show the energy penalty. The proposed design must make up that deficit with efficiency gains in other systems, such as a more efficient HVAC system, better insulation, or additional solar PV capacity.

The 2022 standards also require heat pump water heater-ready infrastructure on all new residential construction — dedicated space (a minimum of 2.5 feet by 2.5 feet by 7 feet), electrical capacity, and plumbing connections — even when a gas water heater is installed. This is a mandatory requirement that applies on both compliance paths.

## Ductless Mini-Split Heat Pumps on the Performance Path

Ductless mini-split heat pumps have become increasingly popular in California residential construction — particularly for additions, ADUs, and homes where traditional ducted systems are impractical. Under the 2022 Title 24 standards, mini-splits and other variable capacity heat pump (VCHP) systems can earn meaningful compliance credits on the performance path.

The VCHP compliance option allows qualifying systems to receive a 5 percent cooling credit and a 12 percent heating credit when modeled on the performance path. These credits reflect the real-world efficiency advantages of variable-capacity compressor technology — mini-splits adjust their output to match the actual heating or cooling demand rather than cycling on and off at full capacity like conventional systems.

To claim these credits, the system must meet specific conditions. The equipment must be certified to the California Energy Commission through the AHRI Directory of Certified Product Performance or an equivalent approved directory. For ductless systems, HERS verification is required to confirm airflow is provided to all habitable spaces — each bedroom and the main living area must receive adequate conditioned air. For ducted mini-split systems, additional requirements apply: ducts must be installed entirely within the conditioned envelope, and the air-handler fan must be certified to automatically shut off when no heating or cooling is being called for.

One important consideration: without the VCHP compliance option, mini-split systems may be modeled in compliance software as minimum-efficiency split systems regardless of their actual performance capabilities. The VCHP compliance option corrects this by allowing the software to account for the system's actual variable-capacity performance. If a mini-split system does not qualify for or claim the VCHP credit, it may actually make compliance harder rather than easier. Confirm with your energy consultant that the VCHP credit is being applied correctly in the compliance calculation.

Mini-splits also eliminate duct losses entirely in ductless configurations, which is a significant compliance advantage. Duct leakage is a major source of energy waste in residential buildings, and removing ducts from the equation removes that loss from the energy model.

## R-21 Wall Insulation on the Performance Path

The 2022 Title 24 prescriptive requirements for exterior walls specify a maximum assembly U-factor of 0.048 in most California climate zones. Meeting this U-factor prescriptively typically requires R-21 cavity insulation in 2×6 framing plus R-5 continuous insulation on the exterior — what the code calls a "high-performance wall" assembly.

On the performance path, R-21 cavity insulation alone — without continuous exterior insulation — may be sufficient to comply, depending on how much efficiency margin the rest of the building provides. If the project uses a heat pump water heater and a high-efficiency HVAC system (such as a ductless mini-split with the VCHP credit), the combined efficiency gains can offset the slightly higher wall U-factor that results from omitting the continuous insulation layer.

This is a common and practical tradeoff on the performance path. Continuous exterior insulation adds material cost, labor complexity, and detailing challenges — particularly around windows and penetrations. Being able to achieve compliance with R-21 cavity insulation alone by investing in high-performance mechanical systems is a real design and cost advantage.

However, mandatory insulation requirements still apply. The mandatory minimum for framed walls under the 2022 standards requires insulation to fill the cavity completely. R-21 in a 2×6 wall meets this requirement. Going below the cavity-fill minimum is not an option on any compliance path.

Climate zone also matters. Projects in California's most extreme climate zones (such as zones 14, 15, and 16 — high desert and mountain areas) face tighter prescriptive envelope requirements, and the performance path tradeoff may require more significant mechanical efficiency gains to compensate for reduced wall insulation. Projects in mild coastal zones (such as zones 3 and 7) have more room to trade envelope performance for mechanical efficiency.

## How These Three Measures Work Together

The real power of the performance path emerges when these measures are combined. Consider a typical new single-family home in a Central Valley climate zone (such as zone 12). The prescriptive path would require a heat pump water heater, a minimum-efficiency HVAC system meeting all prescriptive specifications, R-21 cavity insulation plus R-5 continuous insulation on exterior walls (to meet the 0.048 U-factor), and every other prescriptive requirement met exactly.

The performance path, by contrast, might use a high-efficiency heat pump water heater (UEF 3.5 or above) to generate compliance margin, a ductless mini-split heat pump system claiming the VCHP credit (earning 5% cooling and 12% heating credits while eliminating duct losses), and R-21 cavity insulation in 2×6 framing without continuous exterior insulation — using the mechanical efficiency gains to offset the wall assembly tradeoff.

The energy modeling software calculates whether this combination meets the overall energy budget. In many climate zones, this package comfortably complies — and can be more cost-effective and simpler to build than the prescriptive alternative.

## HERS Verification on the Performance Path

Regardless of which compliance path you use, HERS verification requirements apply to measures specified on the CF1R. On a performance-path project using the measures described above, expect HERS verification for the VCHP credit (airflow verification to all habitable spaces, equipment certification confirmation), insulation quality installation (QII) if claimed as a compliance credit, refrigerant charge verification for the heat pump system, and solar PV and battery-ready verification (required on all new residential construction under the 2022 standards).

Coordinate with your HERS Rater early to understand which verifications are required on your project. The CF1R generated by the compliance software will list every measure that requires HERS verification.

## Conclusion

The performance path is the most flexible way to demonstrate Title 24 compliance for residential projects in California. By using CEC-approved energy modeling software to balance efficiency across building systems, builders can make practical tradeoffs — like pairing a heat pump water heater and ductless mini-split with R-21 cavity insulation — that meet the energy budget without following every prescriptive specification exactly. The result is often a building that costs less to construct, performs well in practice, and gives designers more freedom.

Work with your energy consultant early to model your project on the performance path, confirm which HERS verification measures are required, and coordinate with your HERS Rater before construction begins.`,
  },
  'hvac-replacement-hers-rater': {
    title: 'HVAC Replacement and Title 24: When Do You Need a HERS Rater?',
    seoTitle: 'HVAC Replacement HERS Rater Required California | Title 24 Guide',
    description: 'Replacing an HVAC system in California often triggers Title 24 HERS verification requirements. Learn when you need a HERS Rater for an HVAC replacement and what tests are required.',
    tags: ['HVAC', 'HERS'],
    content: `## Introduction

Many homeowners and contractors are surprised to learn that replacing an HVAC system in California — even a like-for-like equipment swap — can trigger Title 24 compliance requirements including HERS verification. Understanding when a HERS Rater is required for an HVAC replacement, and what they need to test, can help you plan the project and avoid unexpected delays or costs.

## Does Every HVAC Replacement Require Title 24 Compliance?

Not every HVAC replacement triggers Title 24 HERS requirements, but many do. The key factors are the scope of work and the climate zone.

A complete system replacement — replacing both the indoor air handler and the outdoor condensing unit — almost always requires a Title 24 compliance calculation and, in many cases, HERS verification. Replacing only the outdoor condensing unit while retaining the existing air handler and duct system may or may not require Title 24 compliance depending on the equipment efficiency and climate zone.

A like-for-like equipment replacement of the same type and capacity sometimes qualifies for simplified compliance, but the equipment must meet the minimum efficiency requirements of the 2022 Title 24 standards (the current standards). Older, lower-efficiency units being replaced may require upgrading to a more efficient model to comply.

## Common HERS Verification Requirements for HVAC Replacements

When HERS verification is triggered by an HVAC replacement, the most common required measures include duct leakage testing (if the existing duct system is being retained with a new air handler, duct leakage testing is frequently required in many California climate zones), refrigerant charge verification (new refrigerant charge must be verified to confirm the system is properly charged — an improperly charged system runs inefficiently and wears out faster), airflow measurement (confirming adequate airflow across the coil), and fan efficacy verification (confirming the air handler fan operates within the efficiency requirements).

The specific measures required on your project depend on the equipment being replaced, the climate zone, and what the energy consultant specifies on the compliance documentation.

## Climate Zone Matters

California's 58 counties span 16 climate zones with different weather profiles and different HVAC requirements. The HERS verification requirements for HVAC replacements vary by climate zone. Inland areas with high cooling loads (climate zones 9, 10, 11, 12, 13, 14) typically have more stringent HVAC verification requirements than coastal areas with mild climates.

Your energy consultant will determine the applicable requirements for your project's climate zone.

## The Role of the Title 24 Energy Consultant for HVAC Replacements

For an HVAC replacement that requires Title 24 compliance, an energy consultant must prepare a compliance calculation and generate a CF1R. The CF1R specifies the required equipment efficiency ratings, the HERS verification measures, and any other compliance requirements.

The HVAC contractor then completes the CF2R — a self-certification that the equipment was installed as specified. The HERS Rater visits the site, performs the required tests, and submits data to the HERS registry to generate the CF3R. All three documents may be required for permit sign-off depending on the scope of work and local building department requirements.

## Practical Advice for Homeowners and Contractors

Get a permit. Many HVAC replacements in California require a permit from the local building department. Unpermitted HVAC work creates liability and can complicate future home sales. Permitted HVAC work ensures the compliance and verification process runs properly.

Engage the energy consultant early. The Title 24 calculation must be done before installation, not after. Call an energy consultant at the same time you're getting HVAC contractor bids.

Ask the HVAC contractor about HERS coordination. Experienced contractors who regularly work on California projects understand HERS requirements and can help coordinate the HERS Rater site visit at the right point in the project. Refrigerant charge verification must be done after the system is fully installed and running. Duct leakage testing should happen before any access panels are sealed.

Choose HERS-verified equipment where possible. Some HVAC equipment is available in configurations pre-approved for HERS verification, which can streamline the field verification process.

## Conclusion

HVAC replacements in California frequently trigger Title 24 compliance requirements, including HERS verification for duct leakage, refrigerant charge, and airflow. The specific requirements depend on your climate zone, the scope of work, and the equipment involved. Getting a permit, engaging an energy consultant before installation, and coordinating your HERS Rater at the right point in the project are the keys to a smooth process.`,
  },
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = articles[slug]
  if (!article) return {}
  return {
    title: article.seoTitle,
    description: article.description,
    alternates: { canonical: `https://title24directory.com/resources/${slug}` },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = articles[slug]
  if (!article) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article!.title,
    description: article!.description,
    datePublished: '2026-03-01',
    author: { '@type': 'Organization', name: 'Title24 Directory' },
    publisher: { '@type': 'Organization', name: 'Title24 Directory', url: 'https://title24directory.com' },
  }

  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold text-gray-900 mt-10 mb-4">{line.slice(3)}</h2>
      if (line.trim() === '') return <div key={i} className="mb-4" />
      return <p key={i} className="text-gray-600 leading-relaxed mb-2">{line}</p>
    })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-700">Home</Link>
        <span>›</span>
        <Link href="/resources" className="hover:text-blue-700">Resources</Link>
        <span>›</span>
        <span className="text-gray-900 font-medium">{article.title}</span>
      </nav>
      <div className="flex gap-2 mb-4">
        {article.tags.map(tag => <span key={tag} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">{tag}</span>)}
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-8">{article.title}</h1>
      <article className="prose prose-lg max-w-none">
        {renderContent(article.content)}
      </article>
      <div className="mt-12 bg-blue-50 rounded-2xl p-8 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to find a Title 24 rater?</h3>
        <p className="text-gray-500 mb-4">Search our directory of certified HERS and ECC raters across California.</p>
        <Link href="/directory" className="bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors inline-block">Search the Directory →</Link>
      </div>
    </div>
  )
}
