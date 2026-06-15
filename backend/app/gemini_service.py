from openai import OpenAI
import os

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    print("⚠️  WARNING: OPENAI_API_KEY not set. Summary generation will be disabled.")

client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

async def generate_summary(title: str, content: str) -> str:
    """Generate a brief summary of a Telegram post using OpenAI"""
    if not client:
        return content[:200] + "..."

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that summarizes Telegram posts in Russian. Keep summaries concise (2-3 sentences) and focus on key details like dates, requirements, and actions."
                },
                {
                    "role": "user",
                    "content": f"Summarize this post:\n\nTitle: {title}\n\nContent: {content}"
                }
            ],
            max_tokens=150,
            temperature=0.5
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating summary: {e}")
        return content[:200] + "..."
