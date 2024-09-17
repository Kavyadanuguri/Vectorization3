import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'Vectorization';
  userInputText: string = '';
  messages: { content: string; isUser: boolean }[] = [];
  showFeedbackModal: boolean = false;
  feedbackText: string = '';
  feedbackType: 'structured' | 'unstructured' | null = null;

  @ViewChild('userInput') userInput!: ElementRef<HTMLInputElement>;
  @ViewChild('chat') chatContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  selectedFileType: 'structured' | 'unstructured' = 'structured'; // Default value
  structuredFileName: string = '';
  unstructuredFileName: string = '';
  errorMessage: string = ''; // Property for error message
  fileToUpload: File | null = null; // File to upload
  isLoading: boolean = false; // Loading state for buttons

   
  isPopupVisible = false; // Controls popup visibility
  selectedFiles: string[] = []; // Holds the list of files to display
  selectedFileName: string = ''; // Tracks whether it's structured or unstructured files

  structuredFiles: string[] = ['file1.csv', 'file2.xlsx', 'file3.png'];
  unstructuredFiles: string[] = ['file1.pdf', 'file2.docx', 'file3.json'];

  // Method to show popup with structured files
  selectStructuredFiles() {
    this.selectedFiles = this.structuredFiles;
    this.selectedFileName = 'Structured';
    this.isPopupVisible = true;
  }

  // Method to show popup with unstructured files
  selectUnstructuredFiles() {
    this.selectedFiles = this.unstructuredFiles;
    this.selectedFileName = 'Unstructured';
    this.isPopupVisible = true;
  }

  // Method to close the popup
  closePopup() {
    this.isPopupVisible = false;
  }



  // Handle file selection
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      
      // Determine allowed file extensions
      const allowedStructuredExtensions = ['csv', 'xlsx', 'json', 'xml'];
      const allowedUnstructuredExtensions = ['txt', 'pdf', 'docx', 'doc'];

      if (this.selectedFileType === 'structured') {
        if (allowedStructuredExtensions.includes(fileExtension)) {
          this.structuredFileName = file.name;
          this.fileToUpload = file;
          this.errorMessage = '';
        } else {
          this.errorMessage = 'This file type is not supported for structured data.';
          this.structuredFileName = '';
        }
      } else {
        if (allowedUnstructuredExtensions.includes(fileExtension)) {
          this.unstructuredFileName = file.name;
          this.fileToUpload = file;
          this.errorMessage = '';
        } else {
          this.errorMessage = 'This file type is not supported for unstructured data.';
          this.unstructuredFileName = '';
        }
      }
    }
  }

  async uploadFile() {
    if (this.fileToUpload) {
      const formData = new FormData();
      formData.append('file', this.fileToUpload);
      formData.append('data-type',this.selectedFileType);
      this.isLoading = true;  // Start loading

      try {
        const response = await fetch('http://localhost:5000/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('File upload failed.');
        }

        const result = await response.json();
        console.log('File uploaded successfully:', result);
        alert('File uploaded successfully!');
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Error uploading file.');
      } finally {
        this.isLoading = false;  // Stop loading
      }
    }
  }

  ngAfterViewInit() {
    document.getElementById('sendBtn')?.addEventListener('click', () => this.sendMessage());

    this.userInput.nativeElement.addEventListener('keypress', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        this.sendMessage();
      }
    });
  }

  createChatMessage(content: string, isUser: boolean): HTMLDivElement {
    const message = document.createElement('div');
    message.classList.add('message');
    message.style.textAlign = isUser ? 'right' : 'left';
    message.innerHTML = `<p>${content}</p>`;

    if (!isUser) {
      const feedbackContainer = document.createElement('div');
      feedbackContainer.classList.add('response-feedback');
      feedbackContainer.innerHTML = `
        <button class="feedback-btn" (click)="handleFeedback('like')">👍</button>
        <button class="feedback-btn" (click)="handleFeedback('dislike')">👎</button>
      `;
      message.appendChild(feedbackContainer);

      feedbackContainer.querySelector('button')?.addEventListener('click', (event) => {
        const button = event.target as HTMLButtonElement;
        this.handleFeedback(button.innerText === '👍' ? 'like' : 'dislike');
      });
    }

    return message;
  }

  sendMessage(): void {
    const userText = this.userInput.nativeElement.value;
    if (userText.trim()) {
      this.messages.push({ content: userText, isUser: true });
      this.userInput.nativeElement.value = '';

      setTimeout(() => {
        const botResponse = `This is a response to "${userText}"`;
        this.messages.push({ content: botResponse, isUser: false });
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }, 1000);
    }
  }

  handleFeedback(type: 'like' | 'dislike'): void {
    if (type === 'like') {
      alert('Thank you for your feedback!');
    } else if (type === 'dislike') {
      this.showFeedbackModal = true;
    }
  }

  submitFeedback(): void {
    alert('Thank you for your feedback!');
    this.showFeedbackModal = false;
  }

  closeFeedbackModal(): void {
    this.showFeedbackModal = false;
  }

  handleFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.askFileType();
    }
  }

  askFileType(): void {
    const fileType = prompt('Is the file structured or unstructured? (structured/unstructured)');
    if (fileType === 'structured' || fileType === 'unstructured') {
      alert(`You selected ${fileType} file.`);
    } else {
      alert('Invalid option.');
    }
  }
}





















