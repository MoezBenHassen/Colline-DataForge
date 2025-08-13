import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { MarkdownModule } from 'ngx-markdown';
import { AiChatService } from '../../../services/ai-chat.service';
import {Message} from "primeng/message";

interface ChatMessage {
    id: string;
    author: 'user' | 'ai';
    text: string;
}

@Component({
    selector: 'app-ai-chatbot',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, RippleModule, MarkdownModule, Message],
    templateUrl: './ai-chatbot.component.html',
    styleUrls: ['./ai-chatbot.component.scss']
})
export class AiChatbotComponent implements AfterViewChecked {
    @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

    isOpen = false;
    isLoading = false;
    userInput = '';
    messages: ChatMessage[] = [{ id: crypto.randomUUID(), author: 'ai', text: 'Hello! I am the Colline DataForge assistant. How can I help you today?' }];

    constructor(private aiChatService: AiChatService) {}

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    toggleChat(): void {
        this.isOpen = !this.isOpen;
        setTimeout(() => this.scrollToBottom(), 0);
    }

    trackById = (_: number, m: ChatMessage) => m.id;

    sendMessage(): void {
        const userQuery = this.userInput.trim();
        if (!userQuery || this.isLoading) return;

        // push user message
        this.messages.push({ id: crypto.randomUUID(), author: 'user', text: userQuery });
        this.userInput = '';
        this.isLoading = true;

        // let the DOM paint before the HTTP call (ensures typing indicator appears)
        setTimeout(() => {
            this.aiChatService.sendMessage(userQuery).subscribe({
                next: (response) => {
                    // Backend returns { answer: string, status?: string } — handle either
                    const answer = (response as any)?.answer ?? '';
                    this.messages.push({ id: crypto.randomUUID(), author: 'ai', text: answer });
                    this.isLoading = false;
                },
                error: () => {
                    this.messages.push({
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
}
