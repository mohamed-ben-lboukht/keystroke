// api.js

class KeystrokeAPI {
    constructor(baseUrl = 'http://localhost:8000') {
        this.baseUrl = baseUrl;
    }

    async sendKeystrokeData(data) {
        try {
            const response = await fetch(`${this.baseUrl}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error sending keystroke data:', error);
            throw error;
        }
    }

    async getAnalysis(sessionId) {
        try {
            const response = await fetch(`${this.baseUrl}/analysis/${sessionId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting analysis:', error);
            throw error;
        }
    }

    async getUserProfile(userId) {
        try {
            const response = await fetch(`${this.baseUrl}/profile/${userId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw error;
        }
    }
}

export default KeystrokeAPI;