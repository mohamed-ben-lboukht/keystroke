/*class KeystrokeAPI {
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
}*/

/*haadchi dialk a khay a amine ankhlih hna ta nchouf ki ndir lih*/

class KeystrokeAPI {
    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl;
        this.processor = new DataProcessor();
    }

    async sendKeystrokeData(data) {
        try {
            // Transform raw timing data into the format expected by the model
            const transformedData = this.processor.transformToModelFormat(data.timings);
            
            // Add metadata that might be needed by the model
            const modelData = {
                ...transformedData,
                // You may need to add additional fields expected by your model
                // For example:
                User_ID: 0,  // Placeholder or anonymous ID
                Password: "free_text",  // Indicate this is free-text input
                Class: 0  // Placeholder class value
            };

            console.log("Sending data to model:", modelData);

            const response = await fetch(`${this.baseUrl}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(modelData)
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
        try {
            // Transform raw timing data into the format expected by the model
            const transformedData = this.processor.transformToModelFormat(keystrokeData.timings);
            
            // Add metadata that might be needed by the model
            const modelData = {
                ...transformedData,
                // Additional fields expected by your model
                User_ID: 0,
                Password: "free_text",
                Class: 0
            };

            // For development/testing - use a placeholder response
            if (this.baseUrl === 'placeholder') {
                console.log("Using placeholder profile data");
                return {
                    ageRange: '25-35',
                    handedness: 'Right',
                    typingExperience: 'Advanced',
                    consistency: 'High'
                };
            }

            // Actually call the ML model endpoint
            console.log("Sending data to prediction endpoint:", modelData);
            const response = await fetch(`${this.baseUrl}/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(modelData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const predictionResult = await response.json();
            console.log("Received prediction:", predictionResult);

            // Transform model output into user-friendly profile format
            // Adjust this based on what your actual model returns
            return {
                ageRange: this.getAgeRange(predictionResult.Age),
                handedness: predictionResult.Handedness,
                typingExperience: this.getTypingExperience(predictionResult),
                consistency: this.getConsistencyLevel(predictionResult)
            };
        } catch (error) {
            console.error('Error getting user profile:', error);
            // Fallback to placeholder data if API call fails
            return {
                ageRange: '25-35 (estimate)',
                handedness: 'Unknown',
                typingExperience: 'Moderate',
                consistency: 'Medium'
            };
        }
    }

    // Helper methods to format model predictions into user-friendly values

    getAgeRange(age) {
        if (!age) return 'Unknown';
        
        const ageNum = Number(age);
        if (isNaN(ageNum)) return age;
        
        const start = Math.floor(ageNum / 10) * 10;
        return `${start}-${start + 10}`;
    }

    getTypingExperience(prediction) {
        // This would be based on your model's specific outputs
        // Placeholder implementation
        return 'Moderate';
    }

    getConsistencyLevel(prediction) {
        // This would be based on your model's specific outputs
        // Placeholder implementation
        return 'Medium';
    }
}

// Make it available globally
window.KeystrokeAPI = KeystrokeAPI;