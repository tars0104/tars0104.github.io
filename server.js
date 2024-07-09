require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const{OpenAI} = require('openai');

const app = express();
const port = 3000;

app.use(bodyParser.json());
// Setup CORS
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Replace with your OpenAI API key
});

app.post('/get-recommendations', async (req, res) => {
  const { university, studentLoan, country, federalGrantsInterest, major, passiveIncomeInterest} = req.body;

  if (!university || !studentLoan || !country || !major|| !passiveIncomeInterest) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const messages = [{
    role: "system",
    content: "Provide personalized recommendations based on the following details:"
  }, {
    role: "user",
    content: `University: ${university}
      Student Loan: $${studentLoan}
      Country: ${country}
      Interested in Federal Grants: ${federalGrantsInterest ? 'Yes' : 'No'}
      Major: ${major} Passive Income Interest: ${passiveIncomeInterest}`
  }];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 500,
    });
    // Log the detailed structure of the first choice's message object
    console.log("First Choice Message Object:", JSON.stringify(response.choices[0].message, null, 2));

    // Extract and send the content, if available
    if (response.choices[0].message && response.choices[0].message.content) {
      res.json({ recommendations: response.choices[0].message.content.trim() });
    } else {
      res.status(500).json({ error: 'No content found in the response' });
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to get recommendations', details: error.message });
  }
});
// New endpoint for submitting feedback
app.post('/submit-feedback', (req, res) => {
  const { feedbackHelpful, comments } = req.body;

  console.log('Feedback received:', feedbackHelpful, comments); // Ideally, store this in a database

  res.json({ message: 'Feedback submitted successfully' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
