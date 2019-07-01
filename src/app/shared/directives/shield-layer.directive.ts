import { Directive, Input, AfterViewInit, Inject, Renderer2, ElementRef } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';

@Directive({ selector: '[appShieldLayer]' })
export class ShieldLayerDirective implements AfterViewInit{
    canShield:boolean;
    hasViewInited: boolean;
    layer: HTMLElement;
    @Input() set appShieldLayer(d: any) {
        let logic;
        if(d === 'false') {
            logic = false;
        }else if(d === '' || d) {
            logic = true;
        }else{
            logic = false;
        }
        const old = this.hasViewInited;
        this.canShield = logic;
        if(this.hasViewInited && logic !== old) {
            this.do();
        }
    }
    outStyleText: string;
    defaultStyleText = 'position: absolute;width: 100%;height: 100%;z-index: 10;top: 0; left: 0';
    @Input() set layerStyle(s:{[prop: string]:string}) {
        if(s) {
            this.outStyleText = '';
            Object.keys(s).forEach(_ => {
                const one = `${_}:${s[_]}`;
                const text = this.outStyleText;
                this.outStyleText = text + (text? ';' + one:one);
            });
            if(this.layer) {
                this.layer.style.cssText = this.defaultStyleText + ';' + this.outStyleText;
            }
        }
    }
    constructor(@Inject(DOCUMENT) private doc: Document, private render: Renderer2, private el: ElementRef) { }

    do() {
        const el = this.el.nativeElement as HTMLElement;
        if(this.canShield) {
            el.appendChild(this.layer);
        }else {
            try{
                el.removeChild(this.layer);
            }catch(err) {

            }
        }
    }
    ngAfterViewInit() {
        this.layer = this.doc.createElement('div');
        this.layer.style.cssText = this.defaultStyleText + ';' + this.outStyleText;
        this.render.setStyle(this.el.nativeElement, 'position','relative');
        this.hasViewInited = true;
        this.do();
    }
}