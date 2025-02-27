class KeystrokeAPI {
    constructor(baseUrl = 'http://localhost:8000/api') {
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

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error sending keystroke data:', error);
            throw error;
        }
    }

    async getUserProfile(keystrokeData) {
        try {
            const result = await this.sendKeystrokeData(keystrokeData);
            return result.profile;
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw error;
        }
    }
}