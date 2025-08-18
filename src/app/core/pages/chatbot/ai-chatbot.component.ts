import {Component, ElementRef, ViewChild, AfterViewChecked, Signal} from '@angular/core';
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
export class AiChatbotComponent implements AfterViewChecked {
    @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

    isOpen = false;
    isMaximized = false; // New property for maximize state
    isLoading = false;
    userInput = '';
    // messages: ChatMessage[] = [{ id: crypto.randomUUID(), author: 'ai', text: 'Hello! I am the Colline DataForge assistant. How can I help you today?' }];
    messages: Signal<ChatMessage[]>;


    constructor(private aiChatService: AiChatService,  private chatStateService: ChatStateService) {
        this.messages = this.chatStateService.messages;
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    toggleChat(): void {
        this.isOpen = !this.isOpen;
        if (!this.isOpen) {
            this.isMaximized = false; // Reset maximize state when closing
        }
        setTimeout(() => this.scrollToBottom(), 0);
    }

    closeChat(): void {
        this.isOpen = false;
        this.isMaximized = false;
    }

    toggleMaximize(): void {
        this.isMaximized = !this.isMaximized;
        setTimeout(() => this.scrollToBottom(), 50);
    }

    trackById = (_: number, m: ChatMessage) => m.id;

    sendMessage(): void {
        const userQuery = this.userInput.trim();
        if (!userQuery || this.isLoading) return;

        // push user message
        // this.messages.push({ id: crypto.randomUUID(), author: 'user', text: userQuery });
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
}
