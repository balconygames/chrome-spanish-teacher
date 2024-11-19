import { pipeline, Pipeline, env } from "@xenova/transformers";

env.allowLocalModels = false;
env.backends.onnx.wasm.numThreads = 1;

class SpanishLearningAssistant {
  private isRecording: boolean;
  private mediaRecorder: MediaRecorder | null;
  private audioChunks: Blob[];
  private whisperModel: Pipeline | null;
  private speechSynthesis: SpeechSynthesis;
  private textModel: any | null;
  private initialized: boolean;

  constructor() {
    this.isRecording = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.whisperModel = null;
    this.speechSynthesis = window.speechSynthesis;
    this.initialized = false;

    if (!this.initialized) {
      this.init();
    }
  }

  private async init(): Promise<void> {
    try {
      if (!chrome.runtime) {
        throw new Error("This app must run as a Chrome extension");
      }

      this.textModel = (await pipeline(
        "text2text-generation",
        "Xenova/LaMini-Flan-T5-783M"
      )) as any;
      this.whisperModel = await pipeline(
        "automatic-speech-recognition",
        "Xenova/whisper-small"
      );

      const statusElement = document.getElementById("status");
      if (statusElement) {
        statusElement.textContent = "¡Listo! / Ready!";
      }

      this.setupEventListeners();

      this.initialized = true;
    } catch (error) {
      console.error("Error loading model:", error);
      const statusElement = document.getElementById("status");
      if (statusElement && error instanceof Error) {
        statusElement.textContent = "Error: " + error.message;
      }
    }
  }

  private setupEventListeners(): void {
    const startButton = document.getElementById(
      "startRecording"
    ) as HTMLButtonElement;
    const stopButton = document.getElementById(
      "stopRecording"
    ) as HTMLButtonElement;

    startButton?.addEventListener("click", () => this.startRecording());
    stopButton?.addEventListener("click", () => this.stopRecording());
  }

  private async startRecording(): Promise<void> {
    try {
      console.log("=====> start recording");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks);
        await this.processAudio(audioBlob);
      };

      this.mediaRecorder.start();
      this.isRecording = true;

      const startButton = document.getElementById(
        "startRecording"
      ) as HTMLButtonElement;
      const stopButton = document.getElementById(
        "stopRecording"
      ) as HTMLButtonElement;
      if (startButton) startButton.disabled = true;
      if (stopButton) stopButton.disabled = false;
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  }

  private async stopRecording(): Promise<void> {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;

      const startButton = document.getElementById(
        "startRecording"
      ) as HTMLButtonElement;
      const stopButton = document.getElementById(
        "stopRecording"
      ) as HTMLButtonElement;
      if (startButton) startButton.disabled = false;
      if (stopButton) stopButton.disabled = true;
    }
  }

  private async processAudio(audioBlob: Blob): Promise<void> {
    try {
      if (!this.whisperModel) return;

      // Convert Blob to ArrayBuffer
      const arrayBuffer = await audioBlob.arrayBuffer();

      // Use the Web Audio API to decode the audio data
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Extract the audio data from the first channel
      const audioData = audioBuffer.getChannelData(0);

      const result = await this.whisperModel(audioData, {
        language: "spanish",
        task: "transcribe",
      });

      const response = await this.analyzeAndRespond(result.text);
      this.displayMessage(result.text, response);
      this.speakResponse(response);
    } catch (error) {
      console.error("Error processing audio:", error);
    }
  }

  private async analyzeAndRespond(text: string): Promise<string> {
    const context =
      "You are a Spanish teacher. Respond to the following student query in Spanish: ";
    const inputText = context + text;

    try {
      if (!this.textModel) return "Model not initialized.";

      const result = await this.textModel(inputText);
      return result[0].generated_text; // Assuming the model returns a label or response
    } catch (error) {
      console.error("Error analyzing text:", error);
      return "Error processing the request.";
    }
  }

  private speakResponse(text: string): void {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 1.0;
    utterance.pitch = 1.2;
    utterance.volume = 1.0;

    const voices = this.speechSynthesis.getVoices();
    const spanishVoice = voices.find(
      (voice) => voice.lang === "es-ES" && voice.name.includes("Google")
    );
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    this.speechSynthesis.speak(utterance);
  }

  private displayMessage(userText: string, response: string): void {
    const messagesDiv = document.getElementById("messages");
    if (!messagesDiv) return;

    const messageElement = document.createElement("div");
    messageElement.className = "message";
    messageElement.innerHTML = `
            <p><strong>You said / Dijiste:</strong> ${userText}</p>
            <p><strong>Response / Respuesta:</strong> ${response}</p>
        `;
    messagesDiv.insertBefore(messageElement, messagesDiv.firstChild);
  }
}

// Initialize the application when the page loads
window.addEventListener("load", () => {
  new SpanishLearningAssistant();
});
