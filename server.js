const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios'); // For external API integration (optional)
const dialogflow = require('dialogflow'); // For Dialogflow integration (optional)

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint for handling chat messages
app.post('/message', async (req, res) => {
  const userMessage = req.body.message;
  
  // Choose response method: Keyword Matching, External API, or Dialogflow
  const botResponse = await generateBotResponse(userMessage);
  res.json({ reply: botResponse });
});

// Function to generate bot response with keyword matching
async function generateBotResponse(message) {
  const lowerCaseMessage = message.toLowerCase();

  // Simple keyword-based responses
  if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
    return 'Hi there! How can I help you today?';
  } else if (lowerCaseMessage.includes('help')) {
    return 'I am here to help you. What do you need assistance with?';
  } else if (lowerCaseMessage.includes('movie') || lowerCaseMessage.includes('suggestion')) {
    return 'How about watching "Inception"? It’s a great sci-fi movie!';
  } else if (lowerCaseMessage.includes('weather')) {
    return fetchWeatherInfo(message); // Function for fetching weather info
  } else if (lowerCaseMessage.includes('what is india')) {
    return 'India is a country in South Asia, known for its rich cultural heritage and diverse history.';
  } else if (lowerCaseMessage.includes('who is elon musk')) {
    return 'Elon Musk is an entrepreneur and business magnate, known for founding SpaceX, Tesla, and other companies.';
  } else {
    return 'I am not sure how to respond to that. Can you please clarify?';
  }
}

// Function to fetch weather information (example using Axios)
async function fetchWeatherInfo(message) {
  const location = extractLocation(message); // Implement this function to parse location
  try {
    const response = await axios.get('https://api.weatherapi.com/v1/current.json', {
      params: { q: location, key: process.env.WEATHER_API_KEY }
    });
    const weather = response.data.current;
    return `The weather in ${location} is currently ${weather.condition.text} with a temperature of ${weather.temp_c}°C.`;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return 'I am having trouble retrieving weather information right now.';
  }
}

// Example function to extract location from the message (simplified)
function extractLocation(message) {
  // Extract location based on message content
  // Implement logic based on your needs
  return 'London'; // Default location for demonstration
}

// Function to generate bot response with Dialogflow (optional)
async function generateBotResponseWithDialogflow(message) {
  const sessionClient = new dialogflow.SessionsClient();
  const sessionPath = sessionClient.projectAgentSessionPath(process.env.DIALOGFLOW_PROJECT_ID, 'unique-session-id');
  
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: 'en-US',
      },
    },
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    return result.fulfillmentText;
  } catch (error) {
    console.error('ERROR:', error);
    return 'Sorry, something went wrong!';
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
