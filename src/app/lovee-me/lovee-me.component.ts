import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Button } from 'primeng/button';
import { gsap } from 'gsap';
import * as THREE from 'three';

@Component({
  selector: 'app-lovee-me',
  standalone: true,
  imports: [CommonModule, Button, HttpClientModule],
  templateUrl: './lovee-me.component.html',
  styleUrls: ['./lovee-me.component.css']
})
export class LoveeMeComponent implements OnInit, AfterViewInit {
  @ViewChild('threeCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  // JSON Variables
  gifs: string[] = [];
  sadTexts: string[] = [];
  successText: string = '';
  successGif: string = '';

  currentGif = '';
  currentText = 'Loading...';
  
  currentGifIndex = 0;
  sadTextIndex = 0;

  noScale = 1; 
  clickCount = 0; 
  isAccepted = false; 

  // NO Button ကို ပြမပြ ထိန်းချုပ်မည့် Variable
  showNoButton = true;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadCustomerData();
  }

  loadCustomerData(): void {
    this.route.queryParams.subscribe(params => {
      const customerId = params['id'] || 'customer1';
      
      this.http.get<any[]>('/customers.json').subscribe({
        next: (data) => {
          const customer = data.find(c => c.id === customerId);
          
          if (customer) {
            this.gifs = customer.gifs || [];
            this.sadTexts = customer.sadTexts || [];
            this.currentText = customer.initialText;
            this.currentGif = customer.initialGif;
            this.successText = customer.successText;
            this.successGif = customer.successGif;
          } else {
            this.currentText = 'Customer မတွေ့ရှိပါ 💔';
          }
        },
        error: (err) => {
          console.error('JSON ဖတ်ရတာ အဆင်မပြေပါ - ', err);
          this.currentText = 'Data မလုပ်ဆောင်နိုင်ပါ 💔';
        }
      });
    });
  }

  ngAfterViewInit(): void {
    this.initThree();
  }

  private initThree(): void {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvasRef.nativeElement, alpha: true });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.position.z = 5;

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    this.animateThree();
  }

  private animateThree(): void {
    requestAnimationFrame(() => this.animateThree());
    this.renderer.render(this.scene, this.camera);
  }

  // "ဆိုးတယ်" (YES) Button ကို နှိပ်သည့်အခါ
  onYesAction(event: any): void {
    if (this.isAccepted || this.sadTexts.length === 0) return;

    this.clickCount++;
    const maxStages = Math.max(this.gifs.length, this.sadTexts.length);

    // "Just Say No Please" အဆင့်ကျော်လွန်မှသာ NO ခလုတ် ပျောက်ပါမည် (clickCount > maxStages)
    if (this.clickCount > maxStages) {
      this.showNoButton = false;
    } else {
      // မကျော်လွန်သေးသမျှ NO ခလုတ် ပိုကြီးလာပါမည်
      this.noScale += 0.35;
      gsap.to('.no-btn', {
        scale: this.noScale,
        duration: 0.3,
        ease: 'back.out(1.5)'
      });
    }

    // Sad Text အစဉ်လိုက် ပြောင်းလဲခြင်း (အဆုံးရောက်လျှင် ရပ်တန့်မည်)
    if (this.clickCount <= this.sadTexts.length) {
      this.currentText = this.sadTexts[this.clickCount - 1];
    }

    // Sad GIF အစဉ်လိုက် ပြောင်းလဲခြင်း (အဆုံးရောက်လျှင် ရပ်တန့်မည်)
    if (this.clickCount <= this.gifs.length) {
      this.currentGif = this.gifs[this.clickCount - 1];
    }

    gsap.fromTo('.header-text',
      { scale: 0.9, opacity: 0.5 },
      { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }
    );

    // ကွဲအက်နှလုံးသားများ ဖြန့်ကြဲခြင်း
    this.spawnEmojisAcrossScreen('💔', 40, event);
  }

  // "မဆိုးဘူး" (NO) Button ကို နှိပ်လိုက်သည့်အခါ (Success State ရောက်မည်)
  onNoClick(event: any): void {
    if (this.sadTexts.length === 0) return;

    this.isAccepted = true;
    this.currentGif = this.successGif;
    this.currentText = this.successText;

    gsap.to('.main-card', {
      scale: 1.05,
      duration: 0.5,
      ease: 'power2.out'
    });

    this.spawnEmojisAcrossScreen('❤️', 70, event);
  }

  private spawnEmojisAcrossScreen(emoji: string, count: number, originalEvent: any): void {
    for (let i = 0; i < count; i++) {
      const element = document.createElement('div');
      element.innerHTML = emoji;
      element.style.position = 'fixed';

      const startX = Math.random() * window.innerWidth;
      const startY = Math.random() * window.innerHeight + (emoji === '❤️' ? 100 : 0);

      element.style.left = `${startX}px`;
      element.style.top = `${startY}px`;
      element.style.fontSize = `${Math.random() * 24 + 24}px`;
      element.style.pointerEvents = 'none';
      element.style.zIndex = '100';
      document.body.appendChild(element);

      const targetX = startX + (Math.random() - 0.5) * 400;
      const targetY = emoji === '❤️' ? startY - (Math.random() * 400 + 300) : startY + (Math.random() * 400 - 150);

      gsap.to(element, {
        x: targetX - startX,
        y: targetY - startY,
        rotation: (Math.random() - 0.5) * 360,
        opacity: 0,
        duration: Math.random() * 1.5 + 1.5,
        ease: 'power1.out',
        onComplete: () => element.remove()
      });
    }
  }
}