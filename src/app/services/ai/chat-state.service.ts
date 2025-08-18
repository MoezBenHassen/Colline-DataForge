import { Injectable, signal } from '@angular/core';

// Re-use your ChatMessage interface
interface ChatMessage {
    id: string;
    author: 'user' | 'ai';
    text: string;
}

@Injectable({
    providedIn: 'root'
})
export class ChatStateService {
    private readonly STORAGE_KEY = 'chat_messages';

    // Use a Signal to hold the messages state
    public readonly messages = signal<ChatMessage[]>([]);

    constructor() {
        this.loadMessages();
    }

    /**
     * Loads messages from sessionStorage on initialization.
     * If no messages are found, it sets the default welcome message.
     */
    private loadMessages(): void {
        const storedMessages = sessionStorage.getItem(this.STORAGE_KEY);
        if (storedMessages) {
            this.messages.set(JSON.parse(storedMessages));
        } else {
            // If storage is empty, start with the initial message
            this.messages.set([{
                id: crypto.randomUUID(),
                author: 'ai',
                text: 'Hello! I am the Colline DataForge assistant. How can I help you today?'
            }]);
        }
    }

    /**
     * Adds a new message to the state and saves the entire history to sessionStorage.
     * @param message The new ChatMessage object to add.
     */
    addMessage(message: ChatMessage): void {
        this.messages.update(currentMessages => [...currentMessages, message]);
        this.saveMessages();
    }

    /**
     * Clears all messages from the state and sessionStorage.
     */
    clearMessages(): void {
        this.messages.set([]); // Clear the signal
        sessionStorage.removeItem(this.STORAGE_KEY);
    }

    /**
     * Saves the current message array to sessionStorage.
     */
    private saveMessages(): void {
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.messages()));
    }
}
