# **App Name**: Employed

## Core Features:

- Splash Intro: Welcome screen with subtle animations and a 'Start' CTA, automatically transitioning to the search page after a brief period.
- Role-Based Authentication: Differentiate user roles (Job Seeker, Company) during sign-in, directing them to appropriate search results.
- Conditional Search Restriction: Restrict search functionality for unauthenticated users, prompting them to sign in before proceeding with a search.
- Job and Candidate Search: Implement distinct search functions for Job Seekers (jobs) and Companies (candidates), based on their roles.
- Asynchronous Data Fetch: Enable asynchronous fetching of job or candidate data based on search parameters and user authentication status.
- Job/Candidate Card UI: Create JobCard and CandidateCard components to display search results, and display cards to authenticated users only.

## Style Guidelines:

- Primary color: Dark gray (#333333) for essential text, providing a modern and readable base.
- Secondary color: Light gray (#F8F8F8) for page and component backgrounds, creating a clean and airy feel.
- Accent color: Teal (#008080) for interactive elements and CTAs, offering a modern and engaging call to action.
- Body and headline font: 'Inter', a sans-serif, providing a clean, modern, readable, and accessible text.
- Utilize rounded-2xl borders, soft shadows, and smooth transitions for a modern, minimal, and visually appealing design. RTL (Arabic) layout by default.
- Implement subtle animations on the splash screen and staggered fade-ins for search results to enhance user experience.