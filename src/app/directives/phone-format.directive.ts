import {
  Directive,
  ElementRef,
  HostListener,
  Self,
  Optional,
} from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[phoneMask]',
  standalone: true,
})
export class PhoneMaskDirective {
  private lastValue = '';
  private lastCursorPosition = 0;

  constructor(
    private elementRef: ElementRef,
    @Optional() @Self() private ngControl: NgControl,
  ) {}

  ngOnInit() {
    const input = this.elementRef.nativeElement;
    if (input.value) {
      input.value = this.formatValue(input.value);
      this.lastValue = input.value;
    }
  }

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const inputEvent = event as InputEvent;
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (value === this.lastValue) return;

    this.lastCursorPosition = input.selectionStart || 0;

    const cleanValue = value.replace(/\D/g, '').substring(0, 10);
    const formattedValue = this.formatValue(cleanValue);

    if (formattedValue !== value) {
      input.value = formattedValue;
      this.lastValue = formattedValue;

      const newCursorPosition = this.calculateNewCursorPosition(
        value,
        formattedValue,
        this.lastCursorPosition,
        inputEvent.inputType?.includes('delete') || false,
      );

      setTimeout(() => {
        input.setSelectionRange(newCursorPosition, newCursorPosition);
      });
    } else {
      this.lastValue = value;
    }

    this.updateModelAndValidate(cleanValue);
  }
  private updateModelAndValidate(cleanValue: string) {
    if (this.ngControl && this.ngControl.control) {
      this.ngControl.control.setValue(cleanValue, {
        emitEvent: false,
        emitModelToViewChange: false,
      });

      this.ngControl.control.updateValueAndValidity();
    }
  }

  private formatValue(value: string): string {
    if (!value) return '';

    const digits = value.replace(/\D/g, '').substring(0, 10);

    if (digits.length === 0) return '';
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6)
      return `(${digits.substring(0, 3)}) ${digits.substring(3)}`;
    return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6, 10)}`;
  }

  private calculateNewCursorPosition(
    oldValue: string,
    newValue: string,
    oldCursorPosition: number,
    isDeletion: boolean,
  ): number {
    if (oldCursorPosition === 0) return 0;

    const digitsBeforeCursor = this.countDigits(
      oldValue.substring(0, oldCursorPosition),
    );

    let digitCount = 0;
    for (let i = 0; i < newValue.length; i++) {
      if (/\d/.test(newValue[i])) {
        digitCount++;
        if (digitCount === digitsBeforeCursor) {
          if (digitsBeforeCursor === 10) return newValue.length;
          if (i === 3 && newValue[4] === ')') return i + 2;
          if (i === 8 && newValue[9] === '-') return i + 2;
          return i + 1;
        }
      }
    }

    return newValue.length;
  }

  private countDigits(str: string): number {
    return (str.match(/\d/g) || []).length;
  }

  @HostListener('blur')
  onBlur() {
    this.validateOnBlur();
  }

  private validateOnBlur() {
    if (!this.ngControl?.control) return;

    const cleanValue = this.ngControl.value || '';

    // Solo marca error si hay valor pero no es válido
    if (cleanValue && cleanValue.length !== 10) {
      this.ngControl.control.setErrors({
        ...this.ngControl.control.errors,
        invalidPhone: true,
      });
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const key = event.key;
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End',
      'Shift',
      'Control',
      'Alt',
      'Meta',
    ];

    if (allowedKeys.includes(key) || event.ctrlKey || event.metaKey) {
      return;
    }

    if (!/^\d$/.test(key)) {
      event.preventDefault();
    }
  }
}
