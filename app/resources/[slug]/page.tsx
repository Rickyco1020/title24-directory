import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

const articles: Record<string, { title: string; seoTitle: string; description: string; tags: string[]; content: string }> = {
  'what-is-a-hers-rater': {
    title: 'What Is a HERS Rater and When Do You Need One?',
    seoTitle: 'What Is a HERS Rater California | Title 24 Directory',
    description: 'Learn what a HERS Rater does, why they\'re required for many California Title 24 projects, and how to find a certified rater for your construction or renovation project.',
    tags: ['HERS'],
    content: `## Introduction

If you're building or renovating in California, there's a good chance you'll need to work with a HERS Rater before you can get final sign-off. But for most builders, contractors, and homeowners, the term is unfamiliar — and the role is often confused with other compliance professionals.

This post explains exactly what a HERS Rater is, what they do on a project, when California's Title 24 energy code requires one, and how to find a certified rater in your area.

## What Is a HERS Rater?

HERS stands for Home Energy Rating System. A HERS Rater is a certified professional who conducts field verification and diagnostic testing to confirm that energy-related systems in a building were installed correctly and perform as designed.

In California, HERS Raters are certified through California Energy Commission (CEC)-approved rating organizations called HERS Providers. As of September 2024, CHEERS (California Home Energy Efficiency Rating Services) is the sole active CEC-approved HERS Provider operating in California. CalCERTS, the other major provider, permanently closed its registry on September 1, 2024. New projects must be registered through CHEERS.

HERS Raters are third-party verifiers — they are independent from the contractor or installer and are required to have no financial interest in the outcome of the project they are testing. This independence is a core requirement of the role.

## What Does a HERS Rater Actually Do?

A HERS Rater performs field verification and diagnostic testing on specific building components and systems. The tests and verifications required on a given project depend on what features were claimed on the building's Title 24 compliance documentation (the CF1R).

Common tasks a HERS Rater may perform include duct leakage testing (measuring how much air is lost through the HVAC duct system), refrigerant charge verification (confirming HVAC systems are properly charged), airflow measurement (verifying air is distributed correctly throughout the building), window and glazing verification (confirming installed windows match compliance document specifications), insulation verification (checking that insulation type, location, and R-value match the design), indoor air quality system verification (confirming mechanical ventilation systems are installed and functioning), and solar and battery storage verification (increasingly required under the 2022 Title 24 standards).

The rater records their findings and submits results to the HERS registry, which generates the CF3R — the verified certificate that confirms compliance was achieved in the field.

## When Is a HERS Rater Required in California?

Under California's Title 24 Part 6 (the Building Energy Efficiency Standards), a HERS Rater is required whenever a project uses measures that require HERS verification. This is determined by the compliance documentation prepared by the energy consultant or Title 24 analyst.

Common project types that trigger HERS verification requirements include new single-family residential construction (almost universally requires HERS verification for duct systems, HVAC, and other components), new multifamily construction, HVAC replacements or alterations (replacing a furnace, air conditioner, or heat pump in an existing home often requires duct leakage testing), additions and alterations, and newly installed or replaced duct systems.

If a project does not claim any HERS-verified measures on its compliance documentation, a HERS Rater may not be required. However, this is uncommon for new construction in California.

The specific HERS measures required on your project are listed on the CF1R (the compliance certificate prepared by your Title 24 analyst). Review this document early — it tells you exactly what will need to be verified.

## HERS Rater vs. Other Title 24 Compliance Roles

It's common to confuse HERS Raters with other professionals involved in Title 24 compliance. A Title 24 Energy Consultant or ECC Writer prepares the compliance calculations and generates the CF1R. They work at the design stage and do not perform field testing. A HERS Rater performs field testing and verification after installation and generates the CF3R, confirming what was actually installed. An Acceptance Tester is a separate certified role required for nonresidential and some multifamily projects — they verify that lighting controls, HVAC controls, and other systems function correctly.

Some professionals hold multiple certifications and can fill more than one role, but each role has distinct requirements and responsibilities.

## How to Find a Certified HERS Rater in California

HERS Raters in California must be certified through a CEC-approved rating organization. To find a certified rater, use the CHEERS rater directory (CHEERS is now the sole active CEC-approved HERS Provider in California), check the CEC's HERS Provider page at energy.ca.gov, use Title 24 Directory (our directory lists verified HERS Raters across California, searchable by location and specialty), or ask your Title 24 energy consultant (many analysts work regularly with raters and can refer you to someone familiar with your project type).

When selecting a HERS Rater, confirm they are currently certified, have experience with your project type (residential vs. multifamily vs. commercial), and are familiar with the specific measures on your CF1R.

## Conclusion

A HERS Rater is a certified, independent field professional who verifies that the energy features in your building were actually installed and perform correctly. They are required on most new construction and many alteration projects in California, and their work is what produces the CF3R — the document that closes out your Title 24 compliance in the field.

If you're planning a project in California and aren't sure whether a HERS Rater is required, start by reviewing your CF1R compliance document or consult with your Title 24 energy analyst early in the process.`,
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

Battery storage was also mandated, making California the first state to require both solar and battery storage for new construction. New single-family homes and other newly constructed residential buildings that require solar PV must also include a battery storage system with a minimum usable capacity of 7.5 kWh.

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

The 2022 Title 24 Standards, which took effect January 1, 2023, introduced several changes that affect both roles. New single-family homes must include both a solar PV system and a battery storage system with a minimum usable capacity of 7.5 kWh — California was the first state to mandate both solar and storage for new residential construction. ECC writers must account for both in the compliance calculation; HERS Raters must verify both are installed.

Heat pump water heaters are now effectively the standard path to compliance for most new homes under the 2022 standards. New requirements for electrical panel capacity and conduit for future EV charging infrastructure also affect the compliance calculation. Updated whole-building and spot ventilation requirements affect both design compliance and HERS field verification.

## Which Do You Need — and When?

For most new residential construction projects in California, you need both. The ECC writer comes first — before or during permit application. The HERS Rater comes second — during and after construction, before permit final.

A practical timeline: during the design phase, engage your ECC writer to prepare the CF1R and submit it with your permit application. Before construction begins, review the CF1R to understand which HERS measures are required and engage a HERS Rater, scheduling their site visits in advance. During construction, contractors install systems and complete CF2R certificates, and you coordinate with your HERS Rater to ensure insulation and other pre-close-up verifications happen at the right time. Near completion, the HERS Rater performs duct testing, equipment verification, and any remaining field tests to generate CF3R certificates. At permit final, submit the complete compliance document set to the building department.

## Conclusion

The ECC writer and the HERS Rater are both essential to Title 24 compliance in California — but they do entirely different jobs. The ECC writer works at the design stage to produce the compliance roadmap (the CF1R). The HERS Rater works in the field to verify that the roadmap was followed (producing the CF3R). For 2025 and beyond projects operating under the 2022 standards, both roles carry expanded scope due to new solar, battery, and heat pump requirements.

Engage both early, keep your compliance document chain organized, and you'll be well-positioned to move smoothly through permit final.`,
  },
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = articles[params.slug]
  if (!article) return {}
  return {
    title: article.seoTitle,
    description: article.description,
    alternates: { canonical: `https://title24directory.com/resources/${params.slug}` },
  }
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = articles[params.slug]
  if (!article) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
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
