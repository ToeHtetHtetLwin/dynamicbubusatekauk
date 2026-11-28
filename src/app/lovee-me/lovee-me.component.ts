import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Button } from 'primeng/button';
import { gsap } from 'gsap';
import * as THREE from 'three';

interface CustomerItem {
  id: string;
  yesButtonLabel?: string;
  noButtonLabel?: string;
  initialText: string;
  successText: string;
  initialGif: string;
  successGif: string;
  sadTexts: string[];
  gifs: string[];
}

@Component({
  selector: 'app-lovee-me',
  standalone: true,
  imports: [CommonModule, Button, HttpClientModule],
  templateUrl: './lovee-me.component.html',
  styleUrls: ['./lovee-me.component.css']
})
export class LoveeMeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('threeCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  // Dynamic JSON fields
  yesButtonLabel = 'ဆိုးတယ်';
  noButtonLabel = 'မဆိုးဘူး';
  gifs: string[] = [];
  sadTexts: string[] = [];
  successText = '';
  successGif = '';

  currentGif = '';
  currentText = 'Loading...';

  clickCount = 0;
  noScale = 1;
  isAccepted = false;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animationFrameId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadCustomerData();
  }

  ngAfterViewInit(): void {
    this.initThree();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.handleResize);
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  getGifUrl(gifPath: string): string {
    if (!gifPath) return '';
    return gifPath.startsWith('/') ? gifPath : `/${gifPath}`;
  }

  loadCustomerData(): void {
    this.route.queryParams.subscribe(params => {
      const customerId = params['id'];

      if (!customerId) {
        this.router.navigate(['/not-found']);
        return;
      }

      this.http.get<CustomerItem[]>('/customers.json').subscribe({
        next: (data) => {
          const customer = data.find(c => String(c.id) === String(customerId));

          if (customer) {
            this.resetState(customer);
          } else {
            this.router.navigate(['/not-found']);
          }
        },
        error: (err) => {
          console.error('JSON ဖတ်ရတာ အဆင်မပြေပါ - ', err);
          this.router.navigate(['/not-found']);
        }
      });
    });
  }

  private resetState(customer: CustomerItem): void {
    this.yesButtonLabel = customer.yesButtonLabel?.trim() || 'ဆိုးတယ်';
    this.noButtonLabel = customer.noButtonLabel?.trim() || 'မဆိုးဘူး';
    this.gifs = customer.gifs || [];
    this.sadTexts = customer.sadTexts || [];
    this.currentText = customer.initialText;
    this.currentGif = customer.initialGif;
    this.successText = customer.successText;
    this.successGif = customer.successGif;

    this.clickCount = 0;
    this.noScale = 1;
    this.isAccepted = false;

    gsap.set('.no-btn', { scale: 1, x: 0 });
  }

  private handleResize = (): void => {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  private initThree(): void {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      alpha: true
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.position.z = 5;

    window.addEventListener('resize', this.handleResize);
    this.animateThree();
  }

  private animateThree(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animateThree());
    this.renderer.render(this.scene, this.camera);
  }

  onNoHover(event?: Event): void {
    if (this.isAccepted) return;
    gsap.to('.no-btn', {
      y: -4,
      duration: 0.15,
      yoyo: true,
      repeat: 1,
      ease: 'power1.inOut'
    });
  }

 onYesAction(event: any): void {
    if (this.isAccepted || this.sadTexts.length === 0) return;

    this.clickCount++;
    const maxStages = Math.max(this.gifs.length, this.sadTexts.length, 1);
    const isLastStage = this.clickCount >= maxStages;

    let targetScale = 1;
    let shiftLeft = 0;

    if (isLastStage) {
      // နောက်ဆုံးစာကြောင်းရောက်မှ YES ခလုတ်ကို အပြည့်ဖုံးသွားစေမည်
      targetScale = 4.5;
      shiftLeft = -50;
    } else {
      // နောက်ဆုံးစာကြောင်းမရောက်ခင်အထိ ဖြည်းဖြည်းချင်းသာ ကြီးစေမည်
      const preLastMaxScale = 1.8;
      const denom = Math.max(maxStages - 1, 1);
      const step = (preLastMaxScale - 1) / denom;
      targetScale = Math.min(1 + this.clickCount * step, preLastMaxScale);
      shiftLeft = -this.clickCount * 2;
    }

    this.noScale = targetScale;

    gsap.to('.no-btn', {
      scale: this.noScale,
      x: shiftLeft,
      transformOrigin: 'center center',
      duration: 0.3,
      ease: 'back.out(1.4)'
    });

    if (this.clickCount <= this.sadTexts.length) {
      this.currentText = this.sadTexts[this.clickCount - 1];
    } else {
      this.currentText = this.sadTexts[this.sadTexts.length - 1];
    }

    if (this.clickCount <= this.gifs.length) {
      this.currentGif = this.gifs[this.clickCount - 1];
    } else if (this.gifs.length > 0) {
      this.currentGif = this.gifs[this.gifs.length - 1];
    }

    gsap.fromTo(
      '.header-text',
      { scale: 0.9, opacity: 0.5 },
      { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }
    );

    this.spawnEmojisAcrossScreen('💔', 40, event);
  }

  onNoClick(event: any): void {
    if (this.isAccepted) return;

    this.isAccepted = true;
    this.currentGif = this.successGif;
    this.currentText = this.successText;

    gsap.set('.no-btn', { scale: 1, x: 0, y: 0 });

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
      const targetY =
        emoji === '❤️'
          ? startY - (Math.random() * 400 + 300)
          : startY + (Math.random() * 400 - 150);

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