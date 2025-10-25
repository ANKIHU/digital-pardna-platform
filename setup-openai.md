# OpenAI API Key Setup

## 1. Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to **API Keys** section
4. Click **"Create new secret key"**
5. Copy the generated key (starts with `sk-`)

## 2. Add to Environment File

Open `/DIGITAL-PARDNA-folder/.env.local` and replace:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

With your actual key:

```bash
OPENAI_API_KEY=sk-your-actual-openai-key-here
```

## 3. Install OpenAI Package

```bash
cd /Users/macbookair/DIGITAL-PARDNA-folder/apps/web
npm install openai
```

## 4. Features Enabled

With OpenAI API key configured, these features will work:

- **Keisha AI Assistant**: Authentic Jamaican Patois responses
- **WhatsApp Chat Bot**: Contextual help and guidance  
- **Dispute Analysis**: AI-powered resolution suggestions
- **Smart Reminders**: Personalized payment notifications

## 5. Usage Costs

- **GPT-3.5-turbo**: ~$0.002 per 1K tokens
- **Estimated monthly cost**: $10-50 for typical usage
- **Free tier**: $5 credit for new accounts

## 6. Security Notes

- Never commit API keys to version control
- Keep `.env.local` in `.gitignore`
- Use environment variables in production
- Monitor usage in OpenAI dashboard

## 7. Test Integration

After setup, test the AI features:
- Chat with Keisha assistant
- Submit a test dispute to see AI analysis
- Check WhatsApp-style responses