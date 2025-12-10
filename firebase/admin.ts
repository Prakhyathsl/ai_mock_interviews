import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK lazily
function initFirebaseAdmin() {
    const apps = getApps();

    if (!apps.length) {
        // Validate required environment variables (check for both undefined and empty strings)
        const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();

        // During build time, env vars may not be available
        // Skip initialization if credentials are missing (will fail at runtime if actually used)
        if (!projectId || !clientEmail || !privateKey) {
            // During build phase, don't initialize to prevent build failures
            // This will throw at runtime if Firebase Admin is actually used
            throw new Error(
                "Missing Firebase Admin credentials. Please ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set."
            );
        }

        initializeApp({
            credential: cert({
                projectId,
                clientEmail,
                // Replace newlines in the private key
                privateKey: privateKey.replace(/\\n/g, "\n"),
            }),
        });
    }

    return {
        auth: getAuth(),
        db: getFirestore(),
    };
}

// Lazy initialization - only initialize when accessed
let adminInstance: { auth: Auth; db: Firestore } | null = null;

function getAdmin() {
    if (!adminInstance) {
        // Check if required env vars are set
        const hasEnvVars = process.env.FIREBASE_PROJECT_ID?.trim() && 
                          process.env.FIREBASE_CLIENT_EMAIL?.trim() && 
                          process.env.FIREBASE_PRIVATE_KEY?.trim();

        if (!hasEnvVars) {
            // If env vars aren't set, return proxies that throw helpful errors when accessed
            // This prevents the build from failing due to missing credentials
            // but will fail at runtime if Firebase Admin is actually used (which is expected)
            adminInstance = {
                auth: new Proxy({} as Auth, {
                    get() {
                        throw new Error(
                            "Firebase Admin is not initialized. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables in Vercel."
                        );
                    },
                }),
                db: new Proxy({} as Firestore, {
                    get() {
                        throw new Error(
                            "Firebase Admin is not initialized. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables in Vercel."
                        );
                    },
                }),
            };
            return adminInstance;
        }

        try {
            adminInstance = initFirebaseAdmin();
        } catch (error) {
            // If initialization fails, throw the error
            throw error;
        }
    }
    return adminInstance;
}

// Export proxies that initialize on first access
export const auth = new Proxy({} as Auth, {
    get(_target, prop) {
        const admin = getAdmin();
        const value = admin.auth[prop as keyof Auth];
        return typeof value === 'function' ? value.bind(admin.auth) : value;
    },
});

export const db = new Proxy({} as Firestore, {
    get(_target, prop) {
        const admin = getAdmin();
        const value = admin.db[prop as keyof Firestore];
        return typeof value === 'function' ? value.bind(admin.db) : value;
    },
});