import {Component, ElementRef, ViewChild, AfterViewChecked, Signal, OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { MarkdownModule } from 'ngx-markdown';
import { AiChatService } from '../../../services/ai/ai-chat.service';
import {Message} from "primeng/message";
import { Tooltip } from 'primeng/tooltip';
import {ChatStateService} from "../../../services/ai/chat-state.service";

interface ChatMessage {
    id: string;
    author: 'user' | 'ai';
    text: string;
}

@Component({
    selector: 'app-ai-chatbot',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, RippleModule, MarkdownModule, Message, Tooltip],
    templateUrl: './ai-chatbot.component.html',
    styleUrls: ['./ai-chatbot.component.scss']
})
export class AiChatbotComponent implements AfterViewChecked, OnDestroy {
    @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

    isOpen = false;
    isMaximized = false;
    isLoading = false;
    userInput = '';
    messages: Signal<ChatMessage[]>;

    // Voice recognition properties
    isListening = false;
    recognition: any = null;
    isVoiceSupported = false;
    private recognitionTimeout: any = null;

    constructor(private aiChatService: AiChatService, private chatStateService: ChatStateService) {
        this.messages = this.chatStateService.messages;
        this.initializeVoiceRecognition();
    }

    // Initialize voice recognition
    initializeVoiceRecognition(): void {
        // Check if browser supports Web Speech API
        const SpeechRecognition = (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (SpeechRecognition) {
            this.isVoiceSupported = true;
            this.recognition = new SpeechRecognition();

            // Configure recognition
            this.recognition.continuous = true; // Changed to true for better control
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            this.recognition.maxAlternatives = 1;

            // Set up event handlers
            this.recognition.onstart = () => {
                console.log('Voice recognition started');
                this.isListening = true;
                // Clear any existing timeout
                if (this.recognitionTimeout) {
                    clearTimeout(this.recognitionTimeout);
                    this.recognitionTimeout = null;
                }
            };

            this.recognition.onresult = (event: any) => {
                let finalTranscript = '';
                let interimTranscript = '';

                // Process all results
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                // Update input with combined final and interim results
                if (finalTranscript) {
                    this.userInput = finalTranscript;
                } else if (interimTranscript) {
                    this.userInput = interimTranscript;
                }

                // Reset the silence timeout on any speech
                if (this.recognitionTimeout) {
                    clearTimeout(this.recognitionTimeout);
                }

                // Auto-stop after 3 seconds of silence
                this.recognitionTimeout = setTimeout(() => {
                    if (this.isListening) {
                        console.log('Stopping due to silence');
                        this.stopListening();
                    }
                }, 3000);
            };

            this.recognition.onerror = (event: any) => {
                console.error('Voice recognition error:', event.error);

                // Always ensure isListening is false on error
                this.isListening = false;

                // Clear timeout on error
                if (this.recognitionTimeout) {
                    clearTimeout(this.recognitionTimeout);
                    this.recognitionTimeout = null;
                }

                // Handle specific errors
                switch(event.error) {
                    case 'no-speech':
                        // Don't show error for no-speech, just stop silently
                        console.log('No speech detected');
                        break;
                    case 'audio-capture':
                        this.showVoiceError('No microphone found. Please check your device.');
                        break;
                    case 'not-allowed':
                        this.showVoiceError('Microphone access denied. Please enable permissions.');
                        break;
                    case 'aborted':
                        // User manually stopped, no error needed
                        console.log('Recognition aborted');
                        break;
                    default:
                        if (event.error !== 'aborted') {
                            this.showVoiceError('Voice recognition error. Please try again.');
                        }
                }
            };

            this.recognition.onend = () => {
                console.log('Voice recognition ended');
                // Always ensure isListening is false when recognition ends
                this.isListening = false;

                // Clear timeout when recognition ends
                if (this.recognitionTimeout) {
                    clearTimeout(this.recognitionTimeout);
                    this.recognitionTimeout = null;
                }
            };

            // Handle speech end event
            this.recognition.onspeechend = () => {
                console.log('Speech ended');
                // Optional: auto-stop after speech ends
                // setTimeout(() => {
                //     if (this.isListening) {
                //         this.stopListening();
                //     }
                // }, 1000);
            };

        } else {
            console.warn('Voice recognition not supported in this browser');
            this.isVoiceSupported = false;
        }
    }

    // Toggle voice input
    toggleVoiceInput(): void {
        if (!this.isVoiceSupported) {
            this.showVoiceError('Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.');
            return;
        }

        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    // Start voice recognition
    startListening(): void {
        if (!this.recognition || this.isLoading) {
            return;
        }

        // Clear any existing input when starting fresh
        // this.userInput = ''; // Optional: uncomment if you want to clear input when starting

        try {
            // Ensure clean state before starting
            this.isListening = false;
            this.recognition.stop();

            // Small delay to ensure clean start
            setTimeout(() => {
                try {
                    this.recognition.start();
                    console.log('Recognition start called');
                } catch (error) {
                    console.error('Failed to start recognition:', error);
                    this.isListening = false;
                    this.showVoiceError('Could not start voice recognition. Please try again.');
                }
            }, 100);
        } catch (error) {
            console.error('Error in startListening:', error);
            this.isListening = false;
        }
    }

    // Stop voice recognition
    stopListening(): void {
        if (this.recognition) {
            try {
                this.recognition.stop();
                this.isListening = false;
                console.log('Recognition stopped');

                // Clear any pending timeout
                if (this.recognitionTimeout) {
                    clearTimeout(this.recognitionTimeout);
                    this.recognitionTimeout = null;
                }
            } catch (error) {
                console.error('Error stopping recognition:', error);
                this.isListening = false;
            }
        }
    }

    // Show voice error message
    private showVoiceError(message: string): void {
        // Only show error messages for actual errors, not for normal stops
        this.chatStateService.addMessage({
            id: crypto.randomUUID(),
            author: 'ai',
            text: `⚠️ ${message}`
        });
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    toggleChat(): void {
        this.isOpen = !this.isOpen;
        if (!this.isOpen) {
            this.isMaximized = false;
            // Stop listening if chat is closed
            if (this.isListening) {
                this.stopListening();
            }
        }
        setTimeout(() => this.scrollToBottom(), 0);
    }

    closeChat(): void {
        this.isOpen = false;
        this.isMaximized = false;
        // Stop listening if chat is closed
        if (this.isListening) {
            this.stopListening();
        }
    }

    toggleMaximize(): void {
        this.isMaximized = !this.isMaximized;
        setTimeout(() => this.scrollToBottom(), 50);
    }

    trackById = (_: number, m: ChatMessage) => m.id;

    sendMessage(): void {
        const userQuery = this.userInput.trim();
        if (!userQuery || this.isLoading) return;

        // Stop listening when sending a message
        if (this.isListening) {
            this.stopListening();
        }

        // push user message
        this.chatStateService.addMessage({ id: crypto.randomUUID(), author: 'user', text: userQuery });
        this.userInput = '';
        this.isLoading = true;

        // let the DOM paint before the HTTP call (ensures typing indicator appears)
        setTimeout(() => {
            this.aiChatService.sendMessage(userQuery).subscribe({
                next: (response) => {
                    // Backend returns { answer: string, status?: string } — handle either
                    const answer = (response as any)?.answer ?? '';
                    this.chatStateService.addMessage({ id: crypto.randomUUID(), author: 'ai', text: answer });
                    this.isLoading = false;
                },
                error: () => {
                    this.chatStateService.addMessage({
                        id: crypto.randomUUID(),
                        author: 'ai',
                        text: 'Sorry, I encountered an error. Please try again.'
                    });
                    this.isLoading = false;
                }
            });
        }, 0);
    }

    private scrollToBottom(): void {
        try {
            if (this.scrollContainer) {
                const el = this.scrollContainer.nativeElement;
                el.scrollTop = el.scrollHeight;
            }
        } catch {}
    }

    ngOnDestroy(): void {
        // Clean up on component destroy
        if (this.recognitionTimeout) {
            clearTimeout(this.recognitionTimeout);
        }
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (error) {
                console.error('Error stopping recognition on destroy:', error);
            }
        }
    }
}
