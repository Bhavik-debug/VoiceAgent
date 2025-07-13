const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const speak = document.querySelector(".speak")

const r = new SpeechRecognition()
r.continuous = false  //jaise hi user stop hoga vaise hi it will stop
r.interimResults = false
r.maxAlternatives = 1
r.lang = "en-US";

speak.addEventListener("click", (e) => {
    console.log("Ready to receive your command.");
    r.start();
})

async function callAPI(text) {
    const systemPrompt = document.getElementById("systemPrompt").value;
    const body = {
        system_instruction: {
            "parts": [
                {
                    "text": systemPrompt + " User interacts with you in voice and the text that you are given is a transcription of what user has said. You have to reply back in short so that it can be converted back to voice and played to user. Add emotions in your text."
                }
            ]
        },
        "contents": [
            {
                "parts": [{ "text": text }]
            }
        ]
    }
    const API_key = 'AIzaSyBhJJx27y6_Fb1Pl3aA-90-mKjD26UWnpU'
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })

    const result = await response.json()
    return result

    //use of async await: This makes callAPI() pause until fetch() and .json() finish.
}

async function Speak(text) {
    const voiceId = "Xb7hH8MSUJpSbSDYk0k2";
    const apiKey = "sk_8d2c4e1c76ca1528c70efd1034e175c7aa83d175d533e745";

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
            "xi-api-key": apiKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            text: text,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.5
            }
        })
    });

    if (!response.ok) {
        console.error("Failed to get speech:", await response.text());
        return;
    }

    const blob = await response.blob();
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    audio.play();
}
 
function cleanTextForSpeech(text) {
  return text
    .replace(/[*_~`#>-]/g, '')         // Remove *, _, ~, `, etc.
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Convert [text](link) to text
    .replace(/<\/?[^>]+(>|$)/g, '')     // Strip HTML tags if any
    .replace(/\s+/g, ' ')               // Normalize spaces
    .trim();
}


r.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    console.log(`You said: ${transcript}`);

    const result = await callAPI(transcript);
    const reply = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (reply) {
        const cleanReply = cleanTextForSpeech(reply);
        console.log("Gemini replied:", cleanReply);
        await Speak(cleanReply);
    } else {
        console.error("Could not extract reply from response:", result);
    }
};