// Voice navigation utilities for accessibility
export class VoiceNavigationManager {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis;
  private isListening = false;

  constructor() {
    this.synthesis = window.speechSynthesis;
    
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.setupRecognition();
    } else if ('SpeechRecognition' in window) {
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
      this.processVoiceCommand(command);
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
    };
  }

  private processVoiceCommand(command: string) {
    const commands = {
      'go home': () => window.location.hash = '#/',
      'open dashboard': () => window.location.hash = '#/dashboard',
      'view profile': () => window.location.hash = '#/profile',
      'post loan': () => window.location.hash = '#/post-loan',
      'help': () => this.speak('Voice commands available: go home, open dashboard, view profile, post loan, stop listening'),
      'stop listening': () => this.stopListening()
    };

    const matchedCommand = Object.keys(commands).find(cmd => 
      command.includes(cmd)
    );

    if (matchedCommand) {
      commands[matchedCommand as keyof typeof commands]();
      this.speak(`Navigating to ${matchedCommand}`);
    } else {
      this.speak('Command not recognized. Say "help" for available commands.');
    }
  }

  speak(text: string, lang: string = 'en-US') {
    if (!this.synthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    this.synthesis.speak(utterance);
  }

  startListening() {
    if (!this.recognition || this.isListening) return;

    this.recognition.start();
    this.isListening = true;
    this.speak('Voice navigation activated. Say "help" for commands.');
  }

  stopListening() {
    if (!this.recognition || !this.isListening) return;

    this.recognition.stop();
    this.isListening = false;
    this.speak('Voice navigation deactivated.');
  }

  isActive() {
    return this.isListening;
  }
}

export const voiceManager = new VoiceNavigationManager();