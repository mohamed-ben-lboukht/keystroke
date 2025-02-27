class KeystrokeAPI {
    constructor(baseUrl = '/api') {
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

    async getUserProfile(keystrokeData) {
        // This is a placeholder - replace with actual API call
        // In the future, this will call the ML model endpoint
        return {
            ageRange: '25-35',
            handedness: 'Right',
            typingExperience: 'Advanced',
            consistency: 'High'
        };
    }
}

// Make it available globally
window.KeystrokeAPI = KeystrokeAPI;