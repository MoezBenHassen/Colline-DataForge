import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { MarkdownModule } from 'ngx-markdown';
import {AiChatService} from "../../../services/ai-chat.service";

// Define a type for our messages
interface ChatMessage {
    author: 'user' | 'ai';
    text: string;
}

@Component({
    selector: 'app-ai-chatbot',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, RippleModule, MarkdownModule],
    templateUrl: './ai-chatbot.component.html',
    styleUrls: ['./ai-chatbot.component.scss']
})
export class AiChatbotComponent implements AfterViewChecked {
    @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

    isOpen = false;
    isLoading = false;
    userInput = '';
    messages: ChatMessage[] = [
        { author: 'ai', text: 'Hello! I am the Colline DataForge assistant. How can I help you today?' }
    ];

    constructor(private aiChatService: AiChatService) {}

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    toggleChat(): void {
        this.isOpen = !this.isOpen;
    }

    sendMessage(): void {
        const userQuery = this.userInput.trim();
        if (!userQuery || this.isLoading) {
            return;
        }

        // Add user message to chat
        this.messages.push({ author: 'user', text: userQuery });
        this.userInput = '';
        this.isLoading = true;

        // Send to backend
        this.aiChatService.sendMessage(userQuery).subscribe({
            next: (response) => {
                this.messages.push({ author: 'ai', text: response.answer });
                this.isLoading = false;
            },
            error: (err) => {
                this.messages.push({ author: 'ai', text: 'Sorry, I encountered an error. Please try again.' });
                this.isLoading = false;
            }
        });
    }

    private scrollToBottom(): void {
        try {
            if (this.scrollContainer) {
                this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
            }
        } catch (err) { }
    }
}
