/**
 * UI Strings Configuration
 * All translatable text in the frontend
 * Keys are used for lookup, values are English defaults
 */

export const UI_STRINGS = {
    // ===== Navigation / Sidebar =====
    nav: {
        dashboard: 'Dashboard',
        arena: 'Training Arena',
        analyze: 'Analyze Call',
        myPerformance: 'My Performance',
        advisor: 'AI Copilot',
        teamAnalytics: 'Team Analytics',
        members: 'Team Members',
        playbooks: 'Playbooks',
        signOut: 'Sign Out',
    },

    // ===== Auth =====
    auth: {
        welcomeBack: 'Welcome Back',
        signInSubtitle: 'Sign in to continue your global sales journey.',
        emailAddress: 'Email Address',
        password: 'Password',
        forgotPassword: 'Forgot?',
        signIn: 'Sign In',
        entering: 'Entering...',
        socialAccess: 'Social Access',
        signInWithGoogle: 'Sign in with Google',
        newToMission: 'NEW TO THE MISSION?',
        recruitMe: 'RECRUIT ME',
        createAccount: 'Create Account',
        signUpSubtitle: 'Join the global sales revolution.',
        fullName: 'Full Name',
        confirmPassword: 'Confirm Password',
        signUp: 'Sign Up',
        creating: 'Creating...',
        alreadyRecruited: 'ALREADY RECRUITED?',
        signInHere: 'SIGN IN',
        resetPassword: 'Reset Password',
        sendResetLink: 'Send Reset Link',
        backToLogin: 'Back to Login',
    },

    // ===== Common Actions =====
    actions: {
        submit: 'Submit',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        view: 'View',
        upload: 'Upload',
        download: 'Download',
        search: 'Search',
        filter: 'Filter',
        refresh: 'Refresh',
        back: 'Back',
        next: 'Next',
        close: 'Close',
        confirm: 'Confirm',
        loading: 'Loading...',
        processing: 'Processing...',
        settings: 'Settings',
    },

    // ===== Dashboard =====
    dashboard: {
        title: 'Mission Control',
        subtitle: 'Sales Performance Intelligence • Real-Time Analytics',
        welcomeBack: 'Welcome back',
        weeklyProgress: 'Weekly Progress',
        callsThisWeek: 'Calls This Week',
        avgScore: 'Average Score',
        improvement: 'Improvement',
        recentCalls: 'Recent Calls',
        viewAll: 'View All',
        noRecentCalls: 'No recent calls yet',
        quickActions: 'Quick Actions',
        analyzeCall: 'Analyze Call',
        practiceNow: 'Practice Now',
        viewPlaybook: 'View Playbook',
    },

    // ===== Arena (Training) =====
    arena: {
        title: 'Training Arena',
        subtitle: 'AI-Powered Sales Roleplay • Cultural Intelligence',
        selectLanguage: 'Select Target Language',
        culturalBriefing: 'Cultural Briefing',
        startSession: 'Start Session',
        endSession: 'End Session',
        communicationStyle: 'Communication Style',
        formalityLevel: 'Formality Level',
        keyPhrases: 'Power Phrases',
        taboos: 'Cultural Taboos',
        greetingProtocol: 'Greeting Protocol',
    },

    // ===== Call Analysis =====
    analyze: {
        title: 'Call Analysis',
        subtitle: 'AI-Powered Performance Intelligence',
        pasteTranscript: 'Paste your call transcript below',
        placeholder: 'Paste your sales call transcript here...',
        analyzeButton: 'Analyze Call',
        analyzing: 'Analyzing...',
        overallScore: 'Overall Score',
        executiveSummary: 'Executive Summary',
        keyStrengths: 'Key Strengths',
        areasToImprove: 'Areas to Improve',
        coachingTips: 'Coaching Tips',
        rapport: 'Rapport Building',
        discovery: 'Discovery',
        presentation: 'Presentation',
        objectionHandling: 'Objection Handling',
        closing: 'Closing Technique',
    },

    // ===== AI Advisor =====
    advisor: {
        title: 'Copilot',
        teamCopilot: 'Team',
        myCopilot: 'My',
        subtitle: 'AI-Powered Performance & Playbook Intelligence',
        fullOrgView: 'Full Org View',
        personalView: 'Personal View',
        askAnything: 'Ask me anything about your data',
        placeholder: 'Ask about your calls, scores, or playbooks...',
        managerPlaceholder: 'Ask about team performance, playbooks, or trends...',
        analyzingData: 'Analyzing Data...',
        activeContext: 'Active Context',
        capabilities: 'Capabilities',
        analyzeTrends: 'Analyze performance trends',
        reviewCalls: 'Review specific calls',
        queryPlaybook: 'Query playbook knowledge',
        getCoaching: 'Get coaching advice',
    },

    // ===== Team Analytics =====
    teamAnalytics: {
        title: 'Team Analytics',
        subtitle: 'Organization-Wide Performance Metrics',
        teamOverview: 'Team Overview',
        totalMembers: 'Total Members',
        avgTeamScore: 'Avg Team Score',
        totalCalls: 'Total Calls',
        topPerformers: 'Top Performers',
        needsAttention: 'Needs Attention',
        performanceTrend: 'Performance Trend',
    },

    // ===== Members =====
    members: {
        title: 'Team Members',
        subtitle: 'Sales Team Roster & Performance',
        addMember: 'Add Member',
        viewProfile: 'View Profile',
        recentActivity: 'Recent Activity',
        callHistory: 'Call History',
        performanceScore: 'Performance Score',
        totalCalls: 'Total Calls',
        lastActive: 'Last Active',
    },

    // ===== Playbooks =====
    playbooks: {
        title: 'Sales Playbooks',
        subtitle: 'AI-Indexed Knowledge Base',
        uploadPlaybook: 'Upload Playbook',
        noPlaybooks: 'No playbooks uploaded yet',
        uploadFirst: 'Upload your first playbook to get started',
        chunks: 'chunks indexed',
        uploadedOn: 'Uploaded on',
        processing: 'Processing...',
        dropZone: 'Drop PDF file here or click to upload',
    },

    // ===== Language Switcher =====
    language: {
        selectLanguage: 'Select Language',
        currentLanguage: 'Current Language',
    },

    // ===== Errors =====
    errors: {
        somethingWentWrong: 'Something went wrong',
        tryAgain: 'Please try again',
        connectionError: 'Connection error. Please check your internet.',
        unauthorized: 'You are not authorized to view this.',
        notFound: 'Page not found',
    },

    // ===== Success Messages =====
    success: {
        saved: 'Successfully saved',
        uploaded: 'Successfully uploaded',
        deleted: 'Successfully deleted',
        updated: 'Successfully updated',
    },
};

// Flatten nested object for easy key lookup
export function flattenStrings(obj: Record<string, any>, prefix = ''): Record<string, string> {
    return Object.entries(obj).reduce((acc, [key, value]) => {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
            Object.assign(acc, flattenStrings(value, newKey));
        } else {
            acc[newKey] = value;
        }
        return acc;
    }, {} as Record<string, string>);
}

export const FLAT_UI_STRINGS = flattenStrings(UI_STRINGS);

// Get all string keys (for typing)
export type UIStringKey = keyof typeof FLAT_UI_STRINGS;
