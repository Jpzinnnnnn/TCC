import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayoutEscolar } from './layout-escolar';

describe('LayoutEscolar', () => {
  let component: LayoutEscolar;
  let fixture: ComponentFixture<LayoutEscolar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutEscolar],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutEscolar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
