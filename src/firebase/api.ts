import { getAdminApp, getAdminAuth, getAdminFirestore } from './admin';

// Helper function to extract document data from Firestore REST response
function extractDocumentData(doc: any) {
    if (!doc.fields) {
        return { id: doc.name.split('/').pop() };
    }
    const result: { [key: string]: any } = { id: doc.name.split('/').pop() };
    for (const key in doc.fields) {
        const value = doc.fields[key];
        if ('stringValue' in value) {
            result[key] = value.stringValue;
        } else if ('integerValue' in value) {
            result[key] = parseInt(value.integerValue, 10);
        } else if ('doubleValue' in value) {
            result[key] = value.doubleValue;
        } else if ('booleanValue' in value) {
            result[key] = value.booleanValue;
        } else if ('mapValue' in value) {
            result[key] = extractDocumentData({ fields: value.mapValue.fields });
        } else if ('arrayValue' in value) {
            result[key] = value.arrayValue.values.map((v: any) => {
                if ('stringValue' in v) return v.stringValue;
                // Add other type conversions as needed
                return v;
            });
        } else if ('timestampValue' in value) {
            result[key] = new Date(value.timestampValue);
        }
    }
    return result;
}


async function getGoogleAuthToken() {
    try {
        const admin = getAdminApp();
        const auth = getAdminAuth(); // Use the regular auth instance from admin
        const credential = admin.credential;
        const accessToken = await credential.getAccessToken();
        return accessToken.access_token;
    } catch (e) {
        console.error('Error getting admin auth token:', e);
        // Fallback or re-throw as needed. This is critical.
        // For server components, you might want to re-throw to fail the render.
        throw new Error('Could not authenticate admin for server-side rendering.');
    }
}


export async function getLatestArticles(limit: number = 3) {
    try {
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        if (!projectId) {
            throw new Error("Firebase Project ID is not configured.");
        }

        const FIRESTORE_PROXY_BASE = "https://lernova-firebase-proxy-production.up.railway.app/?url=https://firestore.googleapis.com/v1";
        const url = `${FIRESTORE_PROXY_BASE}/projects/${projectId}/databases/(default)/documents:runQuery`;

        const authToken = await getGoogleAuthToken();
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                structuredQuery: {
                    from: [{ collectionId: 'articles' }],
                    orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
                    limit: limit,
                }
            }),
            cache: 'no-store' // Ensure fresh data on each request for server components
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Firestore query failed:", response.status, errorBody);
            throw new Error(`Failed to fetch articles. Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // The response for a query is a list of documents, but each might be a 'document' or a 'transaction' marker.
        // We only care about the documents.
        return data.filter((item: any) => item.document).map((item: any) => extractDocumentData(item.document));

    } catch (error) {
        console.error("Error fetching latest articles via proxy:", error);
        return []; // Return empty array on error to prevent breaking the page
    }
}
